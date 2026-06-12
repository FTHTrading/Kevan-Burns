export const runtime = 'edge';

/**
 * POST /api/vault/create
 * Creates a new vault, registers it on the private chain, and seeds the audit log.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { logEvent } from "@/lib/audit/audit-log";
import { registerVault } from "@/lib/blockchain/registry-adapter";
import { buildManifest } from "@/lib/vault/manifest";
import { encryptBlob, deriveVaultKey, sha256Hex } from "@/lib/encryption/vault-crypto";
import { uploadToIPFS, getPublicIPFSUrl } from "@/lib/ipfs/ipfs-adapter";
import { anchorDocumentHashStellar } from "@/lib/stellar/stellar-adapter";
import { anchorDocumentHash } from "@/lib/xrpl/xrpl-adapter";
import { anchorDocumentHashSolana } from "@/lib/solana/solana-adapter";
import { UnykornOrchestrator } from "@/tools/unykorn-ecosystem-orchestrator";
import { CreateVaultSchema, validationError, serverError } from "@/lib/validation/schemas";
import { normalizeTier, isHighLevelScaled } from "@/lib/payments/tier-config";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = CreateVaultSchema.safeParse(body);
  if (!parsed.success) return validationError("Validation failed", parsed.error.flatten());

  const { label, description, ownerDID, releasePolicyId } = parsed.data;

  // Auth: prefer session, fall back to x-user-id header for legacy demo calls
  const session = await auth();
  const ownerId = session?.user?.id ?? req.headers.get("x-user-id");
  if (!ownerId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // NEW: Enforce active subscription / entitlement before creating vault (payment flow completion)
  let entitlement = await prisma.namespaceEntitlement.findFirst({
    where: { userId: ownerId, isActive: true },
    include: { subscription: true },
  });

  if (!entitlement) {
    // Fallback: auto-create a TRIAL subscription and default namespace entitlement for this user
    let sub = await prisma.subscription.findFirst({
      where: { userId: ownerId },
    });
    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          userId: ownerId,
          tier: "TRIAL",
          status: "TRIAL",
          maxVaults: 1,
          advancedFeatures: false,
          trialEndsAt: new Date(Date.now() + 14 * 86400_000),
          currentPeriodEnd: new Date(Date.now() + 14 * 86400_000),
        },
      });
    }

    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    const emailPrefix = owner?.email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || `user-${ownerId.slice(-4)}`;
    
    // Create both .legacy and .troptions entitlements
    const suffixes = [".legacy", ".troptions"];
    for (const s of suffixes) {
      const fullNamespace = `${emailPrefix}${s}`;

      const created = await prisma.namespaceEntitlement.create({
        data: {
          namespace: fullNamespace,
          userId: ownerId,
          subscriptionId: sub.id,
          plan: "TRIAL",
          isActive: true,
        },
        include: { subscription: true },
      });

      // Keep track of the first entitlement to satisfy the check below
      if (!entitlement) {
        entitlement = created;
      }

      const nsHash = await sha256Hex(fullNamespace);
      let ipfsCID = null;
      let stellarTxHash = null;
      let xrplTxHash = null;
      let solanaTxHash = null;

      // 1. Build Metadata document
      const metadata = {
        type: "namespace-entitlement-registration",
        namespace: fullNamespace,
        ownerUserId: ownerId,
        plan: "TRIAL",
        isActive: true,
        registeredAt: new Date().toISOString(),
        issuerAuthority: "Unykorn / Legacy Vault Protocol (Vault Fallback Seed)",
        chains: ["stellar", "xrpl", "solana"],
        hash: nsHash,
      };

      // 2. Upload metadata to IPFS
      try {
        const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2), "utf8");
        const ipfsResult = await uploadToIPFS(metadataBuffer);
        ipfsCID = ipfsResult.cid;
      } catch (err) {
        console.error(`IPFS metadata upload failed for ${fullNamespace}:`, err);
        ipfsCID = `bafybeimocknsmetadata${nsHash.slice(0, 24)}`;
      }

      // 3. Anchor on Stellar, XRPL, and Solana
      try {
        const stellarRes = await anchorDocumentHashStellar({
          documentId: `ns-${fullNamespace}`,
          sha256Hash: nsHash,
          templateId: "namespace-mint",
        });
        stellarTxHash = stellarRes.txHash;
      } catch (err) {
        console.error(`Stellar anchoring failed for ${fullNamespace}:`, err);
      }

      try {
        const xrplRes = await anchorDocumentHash({
          documentId: `ns-${fullNamespace}`,
          sha256Hash: nsHash,
          templateId: "namespace-mint",
        });
        xrplTxHash = xrplRes.txHash;
      } catch (err) {
        console.error(`XRPL anchoring failed for ${fullNamespace}:`, err);
      }

      try {
        const solanaRes = await anchorDocumentHashSolana({
          documentId: `ns-${fullNamespace}`,
          sha256Hash: nsHash,
          templateId: "namespace-mint",
        });
        solanaTxHash = solanaRes.txHash;

        // Trigger TROPTIONS token-2022 minting on Solana if suffix is .troptions
        if (s === ".troptions") {
          const userWallet = owner?.did?.startsWith("did:ethr:") ? owner.did.replace("did:ethr:", "") : "user-wallet-placeholder";
          const orchestrator = new UnykornOrchestrator();
          await orchestrator.queueTroptionsMint(
            process.env.OPERATOR_KEY || "mock-op-key",
            userWallet,
            100,
            fullNamespace
          );
        }
      } catch (err) {
        console.error(`Solana anchoring/minting failed for ${fullNamespace}:`, err);
      }

      // 4. Update NamespaceEntitlement with anchoring results
      await prisma.namespaceEntitlement.update({
        where: { id: created.id },
        data: {
          ipfsCID,
          stellarTxHash,
          solanaTxHash,
          xrplTxHash,
        },
      });
    }
    
    // Make sure entitlement is not null
    if (!entitlement) {
      entitlement = await prisma.namespaceEntitlement.findFirst({
        where: { userId: ownerId, isActive: true },
        include: { subscription: true },
      });
    }
  }

  if (!entitlement || !entitlement.subscription || entitlement.subscription.status === "EXPIRED" || entitlement.subscription.status === "CANCELLED") {
    return NextResponse.json({ error: "Active subscription required. Complete payment first to create vault.", redirect: "/pricing" }, { status: 402 });
  }
  // Enforce vault limit
  const vaultCount = await prisma.vault.count({ where: { ownerId } });
  if (vaultCount >= (entitlement.subscription.maxVaults || 1)) {
    return NextResponse.json({ error: `Vault limit reached for your plan (${entitlement.subscription.maxVaults}). Upgrade required.` }, { status: 403 });
  }

  // Heirloom tier info (for client to enable the sovereign AI chat / tutor / war planner)
  // Use tier-config for normal vs high-level-scaled
  const heirloomTier = entitlement.subscription.tier;
  const normalized = normalizeTier(heirloomTier as any);
  const heirloomEnabled = isHighLevelScaled(normalized) || normalized !== "FAMILY";

  try {
    // Verify owner exists
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) return validationError("Owner user not found");

    // Verify release policy if provided
    if (releasePolicyId) {
      const policy = await prisma.releasePolicy.findUnique({ where: { id: releasePolicyId } });
      if (!policy) return validationError("Release policy not found");
    }

    // Create vault record first to get the ID
    const vault = await prisma.vault.create({
      data: {
        ownerId,
        label,
        description,
        ownerDID: ownerDID ?? owner.did,
        releasePolicyId,
        status: "ACTIVE",
      },
    });

    // Build and encrypt initial manifest
    const manifestData = await buildManifest({
      vaultId: vault.id,
      ownerDID: vault.ownerDID,
      generatedAt: new Date().toISOString(),
      version: 1,
      walletCount: 0,
      assetCount: 0,
      documentCount: 0,
      executorDIDs: [],
      beneficiaryDIDs: [],
      guardianDIDs: [],
      releasePolicyId: releasePolicyId ?? null,
      assetSummaries: [],
      documentSummaries: [],
      walletSummaries: [],
    });

    // Encrypt manifest before IPFS upload
    const masterKeyHex = process.env.VAULT_MASTER_KEY ?? "0".repeat(64);
    const vaultKey = await deriveVaultKey(masterKeyHex, vault.id);
    const encrypted = await encryptBlob(Buffer.from(manifestData.json, "utf8"), vaultKey);
    let ipfsResult;
    try {
      ipfsResult = await uploadToIPFS(encrypted.ciphertext);
    } catch (err) {
      console.error("IPFS upload failed, falling back to mock upload:", err);
      // Fallback to a mock upload structure to prevent failing in dev environments
      const subtle = typeof globalThis !== "undefined" && globalThis.crypto?.subtle
        ? globalThis.crypto.subtle
        : (await import("crypto")).webcrypto?.subtle;

      let hashHex = "mockmanifestcidsafefallbackhash";
      if (subtle) {
        const sha256 = await subtle.digest("SHA-256", new Uint8Array(encrypted.ciphertext));
        hashHex = Array.from(new Uint8Array(sha256)).map(b => b.toString(16).padStart(2, "0")).join("");
      }
      ipfsResult = {
        cid: `bafybeimockipfsfallback${hashHex.slice(0, 24)}`,
        sizeBytes: encrypted.ciphertext.length,
        provider: "mock" as any,
        mock: true
      };
    }

    // Register on private chain
    const chainResult = await registerVault({
      vaultId: vault.id,
      ownerDID: vault.ownerDID ?? "did:unknown",
      manifestCID: ipfsResult.cid,
      manifestHash: manifestData.hash,
      releasePolicyId: releasePolicyId ?? "none",
    });

    // Create manifest version record
    await prisma.vaultManifest.create({
      data: {
        vaultId: vault.id,
        version: 1,
        cid: ipfsResult.cid,
        contentHash: manifestData.hash,
        nonce: encrypted.nonce,
        createdBy: ownerId,
      },
    });

    // Update vault with CID + chain tx
    const updatedVault = await prisma.vault.update({
      where: { id: vault.id },
      data: {
        manifestCID: ipfsResult.cid,
        manifestHash: manifestData.hash,
        chainTxHash: chainResult.txHash,
      },
    });

    await logEvent({
      vaultId: vault.id,
      actorId: ownerId,
      action: "VAULT_CREATED",
      detail: { label, manifestCID: ipfsResult.cid, chainTxHash: chainResult.txHash },
      anchorOnChain: true,
    });

    const gatewayUrl = getPublicIPFSUrl(ipfsResult.cid);
    return NextResponse.json({ vault: updatedVault, gatewayUrl, manifestCID: ipfsResult.cid, heirloom: { tier: heirloomTier, enabled: heirloomEnabled } }, { status: 201 });
  } catch (err) {
    console.error("[api/vault/create]", err);
    return serverError();
  }
}
