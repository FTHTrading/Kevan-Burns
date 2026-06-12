export const runtime = 'edge';

/**
 * POST /api/vault/release/request — executor submits a release claim
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { setVaultStatus } from "@/lib/blockchain/registry-adapter";
import { RequestReleaseSchema, validationError, notFoundError, serverError } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return validationError("Invalid JSON"); }

  const parsed = RequestReleaseSchema.safeParse(body);
  if (!parsed.success) return validationError("Validation failed", parsed.error.flatten());

  const { vaultId, claimantId } = parsed.data;
  const actorId = req.headers.get("x-user-id");
  if (!actorId) return validationError("x-user-id header required");
  if (actorId !== claimantId) return NextResponse.json({ error: "claimantId must match authenticated user" }, { status: 403 });

  try {
    const vault = await prisma.vault.findUnique({
      where: { id: vaultId },
      include: { executors: true },
    });
    if (!vault) return notFoundError("Vault");

    // Verify claimant is a registered executor
    const isExecutor = vault.executors.some((e) => e.userId === claimantId);
    if (!isExecutor) {
      return NextResponse.json({ error: "Only a registered executor may submit a release claim" }, { status: 403 });
    }

    if (vault.status === "RELEASED") {
      return NextResponse.json({ error: "Vault has already been released" }, { status: 409 });
    }
    if (vault.status === "LOCKED" || vault.status === "DISPUTED") {
      return NextResponse.json({ error: `Vault is ${vault.status} — contact the vault administrator` }, { status: 409 });
    }

    // Create claim
    const claim = await prisma.releaseClaim.create({
      data: { vaultId, claimantId, status: "SUBMITTED" },
    });

    // Update vault status
    await prisma.vault.update({ where: { id: vaultId }, data: { status: "REVIEW_PENDING" } });
    await setVaultStatus(vaultId, "REVIEW_PENDING");

    await logEvent({
      vaultId,
      actorId,
      action: "RELEASE_REQUESTED",
      detail: { claimId: claim.id },
      anchorOnChain: true,
    });

    return NextResponse.json({ claim }, { status: 201 });
  } catch (err) {
    console.error("[api/vault/release/request]", err);
    return serverError();
  }
}
