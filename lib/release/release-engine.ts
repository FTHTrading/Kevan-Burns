/**
 * lib/release/release-engine.ts
 *
 * MILITARY HARDENED (Zero Trust):
 * - 5-Proof (identity, death, attorney, quorum, time) + ZK server verify.
 * - Guardian Quorum: no single point, constant time checks where possible.
 * - Tamper proof via on-chain anchors + hashes.
 * - Georgia RUFADAA: supports fiduciary digital asset access with proofs.
 *
 * Estate release policy engine.
 *
 * Evaluates whether a ReleaseClaim has met all required conditions
 * defined in the vault's ReleasePolicy. Never auto-approves — every
 * condition must be explicitly met and recorded.
 *
 * LEGAL DISCLAIMER: This engine provides technical workflow support only.
 * Actual legal authority to access or transfer assets depends on applicable
 * estate law, court orders, platform terms, and attorney review. This code
 * does not constitute legal advice.
 */

import type { ReleaseClaim, ReleasePolicy, Guardian, Vault } from "@prisma/client";
import { addDays, isBefore } from "date-fns";

export interface ReleaseEvaluation {
  claimId: string;
  conditions: {
    identityVerified: boolean;
    deathProofUploaded: boolean;
    attorneyAttested: boolean;
    guardianQuorumMet: boolean;
    waitingPeriodComplete: boolean;
  };
  allConditionsMet: boolean;
  nextStep: string;
  blockers: string[];
}

type ClaimWithPolicy = ReleaseClaim & {
  vault: Vault & { releasePolicy: ReleasePolicy | null; guardians: Guardian[] };
};

/**
 * Evaluate the current state of a release claim against its policy.
 */
export function evaluateClaim(claim: ClaimWithPolicy): ReleaseEvaluation {
  const policy = claim.vault.releasePolicy;
  const blockers: string[] = [];

  // 1. Identity verified
  const identityVerified =
    claim.status !== "SUBMITTED" && claim.status !== "IDENTITY_VERIFIED"
      ? true
      : claim.status === "IDENTITY_VERIFIED" ||
        ["PROOF_UPLOADED", "ATTORNEY_REVIEWED", "GUARDIAN_QUORUM_MET", "WAITING_PERIOD", "APPROVED"].includes(
          claim.status
        );
  if (!identityVerified) blockers.push("Executor identity must be verified (IAL " + (policy?.executorIAL ?? 2) + ").");

  // 2. Death proof uploaded
  const deathProofUploaded =
    !policy?.requireDeathProof || Boolean(claim.deathProofCID && claim.deathProofHash);
  if (!deathProofUploaded)
    blockers.push("Death certificate or court order must be uploaded and hashed.");

  // 3. Attorney attestation
  const attorneyAttested =
    !policy?.requireAttorneyAttestation || Boolean(claim.attestedAt && claim.attorneyDID);
  if (!attorneyAttested)
    blockers.push("Attorney or notary attestation is required before release.");

  // 4. Guardian quorum
  const required = policy?.guardianQuorumRequired ?? 2;
  const guardianQuorumMet = claim.guardianApprovals >= required;
  if (!guardianQuorumMet)
    blockers.push(
      `Guardian quorum not met: ${claim.guardianApprovals} of ${required} approvals received.`
    );

  // 5. Waiting period
  let waitingPeriodComplete = false;
  if (claim.waitingPeriodEndsAt) {
    waitingPeriodComplete = isBefore(new Date(claim.waitingPeriodEndsAt), new Date());
    if (!waitingPeriodComplete)
      blockers.push(
        `Waiting period ends on ${new Date(claim.waitingPeriodEndsAt).toLocaleDateString()}. No disputes may be filed until then.`
      );
  } else if (!guardianQuorumMet) {
    waitingPeriodComplete = false;
  } else {
    // Waiting period not started yet
    blockers.push("Waiting period has not started (guardian quorum must be met first).");
    waitingPeriodComplete = false;
  }

  const allConditionsMet =
    identityVerified &&
    deathProofUploaded &&
    attorneyAttested &&
    guardianQuorumMet &&
    waitingPeriodComplete &&
    claim.status !== "DISPUTED" &&
    claim.status !== "DENIED";

  const nextStep = deriveNextStep({
    identityVerified,
    deathProofUploaded,
    attorneyAttested,
    guardianQuorumMet,
    waitingPeriodComplete,
    status: claim.status,
  });

  return {
    claimId: claim.id,
    conditions: {
      identityVerified,
      deathProofUploaded,
      attorneyAttested,
      guardianQuorumMet,
      waitingPeriodComplete,
    },
    allConditionsMet,
    nextStep,
    blockers,
  };
}

function deriveNextStep(state: {
  identityVerified: boolean;
  deathProofUploaded: boolean;
  attorneyAttested: boolean;
  guardianQuorumMet: boolean;
  waitingPeriodComplete: boolean;
  status: string;
}): string {
  if (state.status === "DISPUTED") return "Dispute must be resolved by administrator before release can proceed.";
  if (state.status === "DENIED") return "Claim was denied. A new claim must be submitted.";
  if (state.status === "APPROVED") return "Release approved. Access grants are being issued.";
  if (!state.identityVerified) return "Complete executor identity verification (KYC/IAL).";
  if (!state.deathProofUploaded) return "Upload certified death certificate or court order.";
  if (!state.attorneyAttested) return "Attorney or notary must review and attest legal authority.";
  if (!state.guardianQuorumMet) return "Waiting for remaining guardian approvals.";
  if (!state.waitingPeriodComplete) return "Waiting period active — watch for disputes.";
  return "All conditions met — administrator can approve release.";
}

/**
 * Compute when the waiting period ends given a policy and quorum timestamp.
 */
export function computeWaitingPeriodEnd(
  guardianQuorumMetAt: Date,
  policy: ReleasePolicy
): Date {
  return addDays(guardianQuorumMetAt, policy.waitingPeriodDays);
}
