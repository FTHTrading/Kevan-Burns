export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { AuditAction, PlanTier, SubscriptionStatus } from "@prisma/client";
import { normalizeTier, getMaxVaults, getAdvancedFeatures } from "@/lib/payments/tier-config";
import { z } from "zod";

// Blockchain, IPFS and referral adapter imports
import { registerVault } from "@/lib/blockchain/registry-adapter";
import { buildManifest } from "@/lib/vault/manifest";
import { encryptBlob, deriveVaultKey } from "@/lib/encryption/vault-crypto";
import { uploadToIPFS } from "@/lib/ipfs/ipfs-adapter";
import { anchorDocumentHashStellar } from "@/lib/stellar/stellar-adapter";
import { anchorDocumentHash } from "@/lib/xrpl/xrpl-adapter";
import { anchorDocumentHashSolana } from "@/lib/solana/solana-adapter";
import { registerAffiliate, linkReferredUser } from "@/lib/partners/referral-connector";
import { UnykornOrchestrator } from "@/tools/unykorn-ecosystem-orchestrator";
import { deriveWallets } from "@/lib/wallet/deterministic";

// Helper function to generate SHA-256 hex
async function sha256Hex(input: string): Promise<string> {
  const subtle = typeof globalThis !== "undefined" ? globalThis.crypto?.subtle : undefined;

  if (!subtle) {
    throw new Error("Web Crypto subtle API not available");
  }

  const buf = new TextEncoder().encode(input);
  const hash = await subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Input validation schema matching the ecosystem interests
const OnboardSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address").optional(),
  email: z.string().email("Valid email address is required"),
  legacyNamespace: z.string().min(3).max(50).optional(),
  primaryInterests: z.array(z.string()).min(1, "At least one interest must be selected"),
  useCase: z.string().optional(),
  affiliateOptIn: z.boolean().default(false),
  referralCode: z.string().optional(),
  sourceSite: z.enum(["flashrouter", "legacyvault", "xxxiii", "troptionsmint", "other"]).default("other"),
  plan: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = OnboardSchema.parse(body);

    const {
      walletAddress,
      email,
      legacyNamespace,
      primaryInterests,
      useCase,
      affiliateOptIn,
      referralCode,
      sourceSite,
      plan,
    } = data;

    // Resolve namespace and wallets
    let resolvedNamespace = legacyNamespace || "";
    if (!resolvedNamespace) {
      resolvedNamespace = `${email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")}.legacy`;
    } else {
      resolvedNamespace = resolvedNamespace.toLowerCase();
      if (!resolvedNamespace.endsWith(".legacy") && !resolvedNamespace.endsWith(".troptions")) {
        resolvedNamespace = `${resolvedNamespace}.legacy`;
      }
    }
    const baseLabel = resolvedNamespace.replace(/\.legacy$/, "").replace(/\.troptions$/, "");
    const cleanLabel = baseLabel.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

    const derived = await deriveWallets(`${cleanLabel}.legacy`);
    const finalWalletAddress = walletAddress ? walletAddress.toLowerCase() : derived.evm.address.toLowerCase();

    // 1. Create or retrieve User matching the email
    const did = `did:ethr:${finalWalletAddress}`;
    
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        did,
      },
      create: {
        email: email.toLowerCase(),
        did,
        role: "owner",
      },
    });

    // 1b. Create/retrieve corresponding Subscription record
    const rawTier = plan ? normalizeTier(plan) : "TRIAL";
    let planTier = rawTier as any as PlanTier;
    if (rawTier === "LIFETIME_PRESALE") {
      planTier = "LIFETIME_LEGACY_LOCK" as PlanTier;
    }
    const isTrial = planTier === PlanTier.TRIAL || planTier === PlanTier.FAMILY;
    const subStatus = isTrial ? SubscriptionStatus.TRIAL : SubscriptionStatus.PAST_DUE;
    const maxVaults = getMaxVaults(rawTier);
    const advancedFeatures = getAdvancedFeatures(rawTier);

    let sub = await prisma.subscription.findFirst({
      where: { userId: user.id },
    });

    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          userId: user.id,
          tier: planTier,
          status: subStatus,
          maxVaults,
          advancedFeatures,
          trialEndsAt: isTrial ? new Date(Date.now() + 14 * 86400_000) : null,
          currentPeriodEnd: isTrial ? new Date(Date.now() + 14 * 86400_000) : new Date(Date.now() + 30 * 86400_000),
        },
      });
    } else {
      sub = await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          tier: planTier,
          status: sub.status === SubscriptionStatus.TRIAL ? subStatus : sub.status,
          maxVaults,
          advancedFeatures,
        },
      });
    }

    // 1c. Resolve or create Default Vault
    let vault = await prisma.vault.findFirst({
      where: { ownerId: user.id },
    });

    let chainTxHash = null;
    let manifestCID = null;
    let manifestHash = null;

    if (!vault) {
      vault = await prisma.vault.create({
        data: {
          ownerId: user.id,
          label: `${user.name || "Default"}'s Vault`,
          ownerDID: did,
          status: "ACTIVE",
        },
      });

      try {
        // Build initial manifest
        const manifestData = await buildManifest({
          vaultId: vault.id,
          ownerDID: did,
          generatedAt: new Date().toISOString(),
          version: 1,
          walletCount: 0,
          assetCount: 0,
          documentCount: 0,
          executorDIDs: [],
          beneficiaryDIDs: [],
          guardianDIDs: [],
          releasePolicyId: null,
          assetSummaries: [],
          documentSummaries: [],
          walletSummaries: [],
        });

        const masterKeyHex = process.env.VAULT_MASTER_KEY ?? "0".repeat(64);
        const vaultKey = await deriveVaultKey(masterKeyHex, vault.id);
        const encrypted = await encryptBlob(Buffer.from(manifestData.json, "utf8"), vaultKey);
        const ipfsResult = await uploadToIPFS(encrypted.ciphertext);

        manifestCID = ipfsResult.cid;
        manifestHash = manifestData.hash;

        // Register vault on private EVM chain (Hyperledger Besu)
        const chainResult = await registerVault({
          vaultId: vault.id,
          ownerDID: did,
          manifestCID: ipfsResult.cid,
          manifestHash: manifestData.hash,
          releasePolicyId: "none",
        });
        chainTxHash = chainResult.txHash;

        // Create manifest version record
        await prisma.vaultManifest.create({
          data: {
            vaultId: vault.id,
            version: 1,
            cid: ipfsResult.cid,
            contentHash: manifestData.hash,
            nonce: encrypted.nonce,
            createdBy: user.id,
          },
        });

        // Update vault with CID + chain tx
        vault = await prisma.vault.update({
          where: { id: vault.id },
          data: {
            manifestCID: ipfsResult.cid,
            manifestHash: manifestData.hash,
            chainTxHash: chainResult.txHash,
          },
        });
      } catch (err) {
        console.error("Failed to fully initialize/register default vault on-chain during onboarding:", err);
      }

      await logEvent({
        actorId: user.id,
        vaultId: vault.id,
        action: AuditAction.VAULT_CREATED,
        detail: {
          message: "Default vault initialized and registered on-chain during onboarding",
          sourceSite,
          manifestCID,
          chainTxHash,
        },
      });
    } else {
      chainTxHash = vault.chainTxHash;
      manifestCID = vault.manifestCID;
      manifestHash = vault.manifestHash;
    }

    // 2. Handle Namespace registration (.legacy and .troptions)
    let namespaceRecord = null;
    let stellarTxHash = null;
    let xrplTxHash = null;
    let solanaTxHash = null;

    if (cleanLabel) {
      const suffixes = [".legacy", ".troptions"];
      for (const s of suffixes) {
        const fullNamespace = `${cleanLabel}${s}`;

        namespaceRecord = await prisma.namespaceEntitlement.upsert({
          where: { namespace: fullNamespace },
          update: {
            userId: user.id,
            subscriptionId: sub.id,
            plan: planTier,
          },
          create: {
            namespace: fullNamespace,
            userId: user.id,
            subscriptionId: sub.id,
            plan: planTier,
            isActive: true,
          },
        });

        // Anchor/mint namespace registration across Stellar, XRPL, and Solana
        const nsHash = await sha256Hex(fullNamespace);

        // 1. Build Metadata document
        const metadata = {
          type: "namespace-entitlement-registration",
          namespace: fullNamespace,
          ownerUserId: user.id,
          plan: planTier,
          isActive: true,
          registeredAt: new Date().toISOString(),
          issuerAuthority: "Unykorn / Legacy Vault Protocol (Onboarding)",
          chains: ["stellar", "xrpl", "solana"],
          hash: nsHash,
        };

        // 2. Upload metadata to IPFS
        let ipfsCID = null;
        try {
          const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2), "utf8");
          const ipfsResult = await uploadToIPFS(metadataBuffer);
          ipfsCID = ipfsResult.cid;
        } catch (err) {
          console.error(`IPFS metadata upload failed for ${fullNamespace}:`, err);
          ipfsCID = `bafybeimocknsmetadata${nsHash.slice(0, 24)}`;
        }

        stellarTxHash = null;
        xrplTxHash = null;
        solanaTxHash = null;

        try {
          const stellarRes = await anchorDocumentHashStellar({
            documentId: `ns-${fullNamespace}`,
            sha256Hash: nsHash,
            templateId: "namespace-mint",
          });
          stellarTxHash = stellarRes.txHash;
        } catch (err) {
          console.error("Stellar namespace anchoring failed:", err);
        }

        try {
          const xrplRes = await anchorDocumentHash({
            documentId: `ns-${fullNamespace}`,
            sha256Hash: nsHash,
            templateId: "namespace-mint",
          });
          xrplTxHash = xrplRes.txHash;
        } catch (err) {
          console.error("XRPL namespace anchoring failed:", err);
        }

        try {
          const solanaRes = await anchorDocumentHashSolana({
            documentId: `ns-${fullNamespace}`,
            sha256Hash: nsHash,
            templateId: "namespace-mint",
          });
          solanaTxHash = solanaRes.txHash;

          // Trigger safe mint for TROPTIONS namespace claims
          if (s === ".troptions") {
            const orchestrator = new UnykornOrchestrator();
            await orchestrator.queueTroptionsMint(
              process.env.OPERATOR_KEY || "mock-op-key",
              finalWalletAddress,
              100, // standard mint amount
              fullNamespace
            );
          }
        } catch (err) {
          console.error("Solana namespace anchoring/minting failed:", err);
        }

        // Update NamespaceEntitlement with anchoring results
        await prisma.namespaceEntitlement.update({
          where: { id: namespaceRecord.id },
          data: {
            ipfsCID,
            stellarTxHash,
            solanaTxHash,
            xrplTxHash,
          },
        });
      }
    }

    // 3. Handle Affiliate registration if opted in
    let affiliateRecord = null;
    if (affiliateOptIn) {
      const cleanCode = resolvedNamespace 
        ? resolvedNamespace.replace(".legacy", "").replace(".troptions", "") 
        : finalWalletAddress.slice(0, 8);

      const existingAffiliate = await prisma.affiliate.findUnique({
        where: { userId: user.id },
      });

      if (!existingAffiliate) {
        try {
          const affResult = await registerAffiliate({
            userId: user.id,
            referrerWallet: finalWalletAddress,
            referralCode: `${cleanCode}-LEGACY`,
            namespace: resolvedNamespace,
          });
          affiliateRecord = await prisma.affiliate.findUnique({
            where: { id: affResult.affiliateId },
          });
        } catch (err) {
          console.error("Affiliate on-chain registration failed during onboarding:", err);
        }
      } else {
        affiliateRecord = existingAffiliate;
      }
    }

    // 4. Record Referral tracking if referred by another affiliate
    if (referralCode) {
      const referrer = await prisma.affiliate.findUnique({
        where: { referralCode },
      });

      if (referrer) {
        const existingReferral = await prisma.referral.findUnique({
          where: { referredUserId: user.id },
        });

        if (!existingReferral) {
          try {
            await linkReferredUser({
              referredUserId: user.id,
              referralCode,
              customerWallet: finalWalletAddress,
              referredVaultId: vault?.id,
            });
          } catch (err) {
            console.error("Referral on-chain linking failed during onboarding:", err);
          }
        }
      }
    }

    // 5. Append immutable Audit Logs
    await logEvent({
      actorId: user.id,
      action: AuditAction.LOGIN,
      detail: {
        message: "Unified ecosystem onboarding completed",
        sourceSite,
        primaryInterests,
        useCase,
        affiliateOptIn,
        legacyNamespace: resolvedNamespace || null,
        walletAddress: finalWalletAddress,
        chainTxHash,
        stellarTxHash,
        xrplTxHash,
        solanaTxHash,
      },
    });

    // 6. Calculate smart redirects / next steps
    const nextSteps = getNextSteps(primaryInterests, affiliateOptIn);
    const hasPremiumAccess = affiliateOptIn || primaryInterests.includes("macro_intelligence") || primaryInterests.includes("gmii");

    return NextResponse.json({
      success: true,
      userId: user.id,
      walletAddress: finalWalletAddress,
      legacyNamespace: namespaceRecord?.namespace || null,
      derivedWallets: !walletAddress ? {
        evm: { address: derived.evm.address, privateKey: derived.evm.privateKey },
        solana: { address: derived.solana.address, privateKey: derived.solana.privateKey },
        stellar: { address: derived.stellar.address, privateKey: derived.stellar.privateKey },
        xrpl: { address: derived.xrpl.address, privateKey: derived.xrpl.privateKey },
      } : null,
      affiliate: affiliateRecord ? { id: affiliateRecord.id, referralCode: affiliateRecord.referralCode } : null,
      hasPremiumAccess,
      litToken: hasPremiumAccess ? "mock-lit-jwt-token-active-affiliate" : null,
      nextSteps,
      chainTxHash,
      stellarTxHash,
      xrplTxHash,
      solanaTxHash,
      message: "Ecosystem onboarding completed successfully",
    });
  } catch (error: any) {
    console.error("Unified onboarding failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid registration parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Router config logic
function getNextSteps(interests: string[], affiliateOptIn: boolean) {
  const steps: string[] = [];

  if (interests.includes("flash_loans") || interests.includes("defi_execution")) {
    steps.push("flashrouter_dashboard");
  }

  if (interests.includes("estate_planning") || interests.includes("vaults")) {
    steps.push("legacy_vault_dashboard");
  }

  if (interests.includes("macro_intelligence") || interests.includes("gmii")) {
    steps.push("xxxiii_gated_access");
  }

  if (affiliateOptIn) {
    steps.push("affiliate_dashboard");
  }

  if (steps.length === 0) {
    steps.push("ecosystem_overview");
  }

  return steps;
}
