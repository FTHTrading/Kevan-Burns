export const runtime = 'edge';

/**
 * POST /api/vault/release/approve — admin approves a release after all conditions are met
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { setVaultStatus } from "@/lib/blockchain/registry-adapter";
import { evaluateClaim } from "@/lib/release/release-engine";
import { ApproveReleaseSchema, validationError, notFoundError, serverError } from "@/lib/validation/schemas";
import { UnykornOrchestrator } from "@/tools/unykorn-ecosystem-orchestrator";

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return validationError("Invalid JSON"); }

  const parsed = ApproveReleaseSchema.safeParse(body);
  if (!parsed.success) return validationError("Validation failed", parsed.error.flatten());

  const actorId = req.headers.get("x-user-id");
  if (!actorId) return validationError("x-user-id header required");

  const { claimId } = parsed.data;

  try {
    // Verify actor is admin
    const actor = await prisma.user.findUnique({ where: { id: actorId } });
    if (!actor || actor.role !== "admin") {
      return NextResponse.json({ error: "Only administrators may approve releases" }, { status: 403 });
    }

    const claim = await prisma.releaseClaim.findUnique({
      where: { id: claimId },
      include: {
        vault: {
          include: {
            releasePolicy: true,
            guardians: true,
            beneficiaries: {
              include: {
                assignedAssets: true,
              },
            },
          },
        },
      },
    });
    if (!claim) return notFoundError("ReleaseClaim");
    if (claim.status === "APPROVED") {
      return NextResponse.json({ error: "Claim already approved" }, { status: 409 });
    }
    if (claim.status === "DISPUTED") {
      return NextResponse.json({ error: "Disputed claim must be resolved before approval" }, { status: 409 });
    }

    // Evaluate all conditions
    const evaluation = evaluateClaim(claim as Parameters<typeof evaluateClaim>[0]);
    if (!evaluation.allConditionsMet) {
      return NextResponse.json({
        error: "Release conditions not yet met",
        blockers: evaluation.blockers,
        conditions: evaluation.conditions,
      }, { status: 422 });
    }

    // Approve claim
    const updatedClaim = await prisma.releaseClaim.update({
      where: { id: claimId },
      data: { status: "APPROVED", resolvedAt: new Date(), resolutionNote: "All conditions verified by administrator" },
    });

    await prisma.vault.update({
      where: { id: claim.vaultId },
      data: { status: "RELEASED" },
    });

    await setVaultStatus(claim.vaultId, "RELEASED");

    // Auto-distribution of beneficiary balances / create AccessGrant records
    if (claim.vault.beneficiaries && claim.vault.beneficiaries.length > 0) {
      const orchestrator = new UnykornOrchestrator();
      for (const beneficiary of claim.vault.beneficiaries) {
        const itemIds = beneficiary.assignedAssets.map(a => a.id);
        
        await prisma.accessGrant.create({
          data: {
            vaultId: claim.vaultId,
            granteeId: beneficiary.userId,
            scope: beneficiary.scope,
            itemIds,
            beneficiaryId: beneficiary.id,
            grantedAt: new Date(),
          },
        });

        // Trigger on-chain token payout if allocation includes numeric value
        if (beneficiary.allocation) {
          const allocationText = beneficiary.allocation.toLowerCase();
          const match = allocationText.match(/(\d+)/);
          if (match) {
            const amount = parseFloat(match[1]) || 100;
            try {
              const bUser = await prisma.user.findUnique({ where: { id: beneficiary.userId } });
              const address = bUser?.did?.startsWith("did:ethr:") 
                ? bUser.did.replace("did:ethr:", "") 
                : "0x71c5a4e2eecf4515ac2bac2beb6700f0473a1111"; // demo fallback

              await orchestrator.queueTroptionsMint(
                process.env.OPERATOR_KEY || "mock-op-key",
                address,
                amount,
                `payout.${claim.vaultId}`
              );
            } catch (err) {
              console.error(`Failed to queue auto-payout for beneficiary ${beneficiary.id}:`, err);
            }
          }
        }
      }
    }

    await logEvent({
      vaultId: claim.vaultId,
      actorId,
      action: "RELEASE_APPROVED",
      detail: { claimId },
      anchorOnChain: true,
    });

    return NextResponse.json({ claim: updatedClaim, evaluation });
  } catch (err) {
    console.error("[api/vault/release/approve]", err);
    return serverError();
  }
}
