export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { distributeReward } from "@/lib/partners/referral-connector";
import { AuditAction, ClaimStatus } from "@prisma/client";
import { AttorneyAttestSchema, validationError, notFoundError, serverError, forbiddenError } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationError("Invalid JSON");
  }

  const parsed = AttorneyAttestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", parsed.error.flatten());
  }

  const { claimId, attorneyDID, attorneyNote } = parsed.data;

  // Retrieve the actor ID from headers to verify authorization
  const actorId = req.headers.get("x-user-id");
  if (!actorId) {
    return validationError("x-user-id header required");
  }

  try {
    // 1. Verify the actor exists and has the "attorney" role
    const attorney = await prisma.user.findUnique({
      where: { id: actorId },
    });

    if (!attorney || attorney.role !== "attorney") {
      return forbiddenError("Only registered, verified estate attorneys may attest release claims.");
    }

    // 2. Retrieve the release claim
    const claim = await prisma.releaseClaim.findUnique({
      where: { id: claimId },
      include: { vault: true },
    });

    if (!claim) {
      return notFoundError("ReleaseClaim");
    }

    if (claim.status === "APPROVED") {
      return NextResponse.json({ error: "Claim is already approved and released" }, { status: 400 });
    }

    if (claim.status === "DISPUTED") {
      return NextResponse.json({ error: "Claim is disputed and cannot be attested until resolved" }, { status: 400 });
    }

    // 3. Update the ReleaseClaim record with attestation details
    const updatedClaim = await prisma.releaseClaim.update({
      where: { id: claimId },
      data: {
        attestedAt: new Date(),
        attorneyDID,
        status: ClaimStatus.ATTORNEY_REVIEWED,
      },
    });

    // 4. Distribute x402 Notarization Reward to the attorney ($5.00 USDC metered rate)
    const payoutResult = await distributeReward({
      attorneyUserId: attorney.id,
      totalPaidAmount: "5000000", // $5.00 in 6-decimal atomic USDC
      tokenAddress: process.env.USDC_POLYGON || "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    });

    // 5. Log the Audit Event
    await logEvent({
      vaultId: claim.vaultId,
      actorId: attorney.id,
      action: AuditAction.ATTORNEY_ATTESTED,
      detail: {
        claimId,
        attorneyDID,
        attorneyNote: attorneyNote || null,
        payoutTxHash: payoutResult.txHash || null,
        payoutStatus: payoutResult.success ? "SETTLED" : "FAILED",
      },
      anchorOnChain: true,
    });

    return NextResponse.json({
      success: true,
      claim: updatedClaim,
      payout: {
        success: payoutResult.success,
        txHash: payoutResult.txHash,
      },
      message: "Release claim successfully attested by attorney and x402 settlement routed.",
    });
  } catch (err: any) {
    console.error("[api/vault/release/attest] failed:", err);
    return serverError();
  }
}
