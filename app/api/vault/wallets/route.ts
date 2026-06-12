export const runtime = 'edge';

/**
 * POST /api/vault/wallets — add a public wallet address to a vault
 * GET  /api/vault/wallets?vaultId=... — list wallets for a vault
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { AddWalletSchema, validationError, notFoundError, serverError } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const vaultId = req.nextUrl.searchParams.get("vaultId");
  if (!vaultId) return validationError("vaultId query param required");

  try {
    const wallets = await prisma.walletRecord.findMany({
      where: { vaultId },
      orderBy: { chain: "asc" },
    });
    return NextResponse.json({ wallets });
  } catch (err) {
    console.error("[api/vault/wallets GET]", err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return validationError("Invalid JSON"); }

  const parsed = AddWalletSchema.safeParse(body);
  if (!parsed.success) return validationError("Validation failed", parsed.error.flatten());

  const actorId = req.headers.get("x-user-id");
  if (!actorId) return validationError("x-user-id header required");

  const { vaultId, chain, publicAddress, label } = parsed.data;

  try {
    const vault = await prisma.vault.findUnique({ where: { id: vaultId } });
    if (!vault) return notFoundError("Vault");
    if (vault.ownerId !== actorId) {
      return NextResponse.json({ error: "Only the vault owner may add wallets" }, { status: 403 });
    }

    const wallet = await prisma.walletRecord.upsert({
      where: { vaultId_chain_publicAddress: { vaultId, chain, publicAddress } },
      update: { label },
      create: { vaultId, chain, publicAddress, label },
    });

    await logEvent({
      vaultId,
      actorId,
      action: "WALLET_ADDED",
      detail: { chain, publicAddress: publicAddress.slice(0, 10) + "…" },
    });

    return NextResponse.json({ wallet }, { status: 201 });
  } catch (err) {
    console.error("[api/vault/wallets POST]", err);
    return serverError();
  }
}
