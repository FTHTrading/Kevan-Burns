export const runtime = 'edge';

/**
 * GET  /api/vault/manifest?vaultId=...  — latest manifest record
 * POST /api/vault/manifest              — regenerate + re-upload manifest
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { updateManifest } from "@/lib/blockchain/registry-adapter";
import { buildManifest } from "@/lib/vault/manifest";
import { encryptBlob, deriveVaultKey } from "@/lib/encryption/vault-crypto";
import { uploadToIPFS } from "@/lib/ipfs/ipfs-adapter";
import { validationError, notFoundError, serverError } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const vaultId = req.nextUrl.searchParams.get("vaultId");
  if (!vaultId) return validationError("vaultId query param required");

  try {
    const manifest = await prisma.vaultManifest.findFirst({
      where: { vaultId },
      orderBy: { version: "desc" },
    });
    if (!manifest) return notFoundError("VaultManifest");
    return NextResponse.json({ manifest });
  } catch (err) {
    console.error("[api/vault/manifest GET]", err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return validationError("Invalid JSON"); }

  const { vaultId } = body as { vaultId?: string };
  if (!vaultId) return validationError("vaultId required");

  const actorId = req.headers.get("x-user-id");
  if (!actorId) return validationError("x-user-id header required");

  try {
    const vault = await prisma.vault.findUnique({
      where: { id: vaultId },
      include: {
        wallets: true,
        assets: true,
        documents: true,
        executors: { include: { user: true } },
        beneficiaries: { include: { user: true } },
        guardians: { include: { user: true } },
      },
    });
    if (!vault) return notFoundError("Vault");

    const lastManifest = await prisma.vaultManifest.findFirst({
      where: { vaultId },
      orderBy: { version: "desc" },
    });
    const newVersion = (lastManifest?.version ?? 0) + 1;

    const manifestData = await buildManifest({
      vaultId: vault.id,
      ownerDID: vault.ownerDID,
      generatedAt: new Date().toISOString(),
      version: newVersion,
      walletCount: vault.wallets.length,
      assetCount: vault.assets.length,
      documentCount: vault.documents.length,
      executorDIDs: vault.executors.map((e) => e.did),
      beneficiaryDIDs: vault.beneficiaries.map((b) => b.did),
      guardianDIDs: vault.guardians.map((g) => g.did),
      releasePolicyId: vault.releasePolicyId,
      assetSummaries: vault.assets.map((a) => ({
        id: a.id,
        category: a.category,
        label: a.label,
      })),
      documentSummaries: vault.documents.map((d) => ({
        id: d.id,
        type: d.type,
        label: d.label,
        cid: d.cid,
      })),
      walletSummaries: vault.wallets.map((w) => ({
        id: w.id,
        chain: w.chain,
        publicAddress: w.publicAddress,
        label: w.label,
      })),
    });

    const masterKeyHex = process.env.VAULT_MASTER_KEY ?? "0".repeat(64);
    const vaultKey = await deriveVaultKey(masterKeyHex, vaultId);
    const encrypted = await encryptBlob(Buffer.from(manifestData.json, "utf8"), vaultKey);
    const ipfsResult = await uploadToIPFS(encrypted.ciphertext);

    const chainResult = await updateManifest({
      vaultId,
      newCID: ipfsResult.cid,
      newHash: manifestData.hash,
    });

    const manifestRecord = await prisma.vaultManifest.create({
      data: {
        vaultId,
        version: newVersion,
        cid: ipfsResult.cid,
        contentHash: manifestData.hash,
        nonce: encrypted.nonce,
        createdBy: actorId,
      },
    });

    await prisma.vault.update({
      where: { id: vaultId },
      data: { manifestCID: ipfsResult.cid, manifestHash: manifestData.hash },
    });

    await logEvent({
      vaultId,
      actorId,
      action: "MANIFEST_UPDATED",
      detail: { version: newVersion, cid: ipfsResult.cid, chainTx: chainResult.txHash },
      anchorOnChain: true,
    });

    return NextResponse.json({ manifest: manifestRecord, chainTxHash: chainResult.txHash });
  } catch (err) {
    console.error("[api/vault/manifest POST]", err);
    return serverError();
  }
}
