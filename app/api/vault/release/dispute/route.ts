export const runtime = 'edge';

/**
 * POST /api/vault/release/dispute — open a dispute on a release claim
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { setVaultStatus } from "@/lib/blockchain/registry-adapter";
import { OpenDisputeSchema, validationError, notFoundError, serverError } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return validationError("Invalid JSON"); }

  const parsed = OpenDisputeSchema.safeParse(body);
  if (!parsed.success) return validationError("Validation failed", parsed.error.flatten());

  const actorId = req.headers.get("x-user-id");
  if (!actorId) return validationError("x-user-id header required");

  const { claimId, disputeReason } = parsed.data;

  try {
    const claim = await prisma.releaseClaim.findUnique({
      where: { id: claimId },
      include: { vault: { include: { guardians: true, executors: true, beneficiaries: true } } },
    });
    if (!claim) return notFoundError("ReleaseClaim");
    if (claim.status === "APPROVED" || claim.status === "DENIED") {
      return NextResponse.json({ error: "Cannot dispute a resolved claim" }, { status: 409 });
    }

    // Any guardian, executor, or beneficiary can open a dispute
    const isAuthorized =
      claim.vault.guardians.some((g) => g.userId === actorId) ||
      claim.vault.executors.some((e) => e.userId === actorId) ||
      claim.vault.beneficiaries.some((b) => b.userId === actorId);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Only vault participants may open a dispute" }, { status: 403 });
    }

    await prisma.releaseClaim.update({
      where: { id: claimId },
      data: { status: "DISPUTED", disputeReason, disputedAt: new Date() },
    });

    await prisma.vault.update({
      where: { id: claim.vaultId },
      data: { status: "DISPUTED" },
    });

    await setVaultStatus(claim.vaultId, "DISPUTED");

    await logEvent({
      vaultId: claim.vaultId,
      actorId,
      action: "DISPUTE_OPENED",
      detail: { claimId, reason: disputeReason.slice(0, 100) },
      anchorOnChain: true,
    });

    return NextResponse.json({ message: "Dispute opened. Vault is now locked pending resolution." });
  } catch (err) {
    console.error("[api/vault/release/dispute]", err);
    return serverError();
  }
}
