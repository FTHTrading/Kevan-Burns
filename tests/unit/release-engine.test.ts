import { describe, it, expect } from "vitest";
import { evaluateClaim, computeWaitingPeriodEnd } from "@/lib/release/release-engine";
import { addDays, subDays } from "date-fns";
import type { ReleasePolicy } from "@prisma/client";

type ClaimArg = Parameters<typeof evaluateClaim>[0];

function mockPolicy(overrides = {}): ReleasePolicy {
  return {
    id: "p1",
    label: "Test Policy",
    guardianQuorumRequired: 2,
    guardianQuorumOf: 3,
    waitingPeriodDays: 30,
    requireAttorneyAttestation: true,
    requireDeathProof: true,
    executorIAL: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as ReleasePolicy;
}

function mockVault(overrides = {}) {
  return {
    id: "v1",
    label: "Test Vault",
    description: null,
    ownerDID: "did:key:owner",
    releasePolicyId: "p1",
    status: "ACTIVE",
    ownerId: "user-1",
    manifestCID: null,
    manifestHash: null,
    chainTxHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    releasePolicy: mockPolicy(),
    guardians: [],
    ...overrides,
  };
}

function mockClaim(overrides = {}): ClaimArg {
  return {
    id: "claim-1",
    vaultId: "v1",
    claimantId: "user-1",
    status: "SUBMITTED",
    deathProofCID: null,
    deathProofHash: null,
    attorneyDID: null,
    attorneyNote: null,
    attestedAt: null,
    guardianApprovals: 0,
    waitingPeriodEndsAt: null,
    disputeReason: null,
    disputedAt: null,
    resolvedAt: null,
    resolutionNote: null,
    submittedAt: new Date(),
    updatedAt: new Date(),
    vault: mockVault(),
    ...overrides,
  } as unknown as ClaimArg;
}

describe("release-engine evaluateClaim", () => {
  it("blocks release when all conditions unmet", () => {
    const evaluation = evaluateClaim(mockClaim());
    expect(evaluation.allConditionsMet).toBe(false);
    expect(evaluation.blockers.length).toBeGreaterThan(0);
  });

  it("blocks on missing death proof", () => {
    const claim = mockClaim({
      status: "ATTORNEY_REVIEWED",
      deathProofCID: null,
    });
    const ev = evaluateClaim(claim);
    expect(ev.conditions.deathProofUploaded).toBe(false);
    expect(ev.blockers.some((b: string) => b.toLowerCase().includes("death certificate"))).toBe(true);
  });

  it("blocks on missing attorney attestation", () => {
    const claim = mockClaim({
      status: "PROOF_UPLOADED",
      deathProofCID: "bafybei-proof",
      deathProofHash: "a".repeat(64),
      attestedAt: null,
    });
    const ev = evaluateClaim(claim);
    expect(ev.conditions.attorneyAttested).toBe(false);
  });

  it("guardian quorum blocks when count insufficient", () => {
    const claim = mockClaim({ guardianApprovals: 1 });
    const ev = evaluateClaim(claim);
    expect(ev.conditions.guardianQuorumMet).toBe(false);
  });

  it("guardian quorum met when count sufficient", () => {
    const waitingPeriodEndsAt = subDays(new Date(), 1); // past
    const claim = mockClaim({
      guardianApprovals: 2,
      deathProofCID: "bafybei-proof",
      deathProofHash: "a".repeat(64),
      attestedAt: new Date(),
      attorneyDID: "did:key:attorney",
      waitingPeriodEndsAt,
      status: "WAITING_PERIOD",
    });
    const ev = evaluateClaim(claim);
    expect(ev.conditions.guardianQuorumMet).toBe(true);
  });

  it("waiting period blocks when not yet passed", () => {
    const waitingPeriodEndsAt = addDays(new Date(), 10); // future
    const claim = mockClaim({
      guardianApprovals: 2,
      deathProofCID: "bafybei-proof",
      deathProofHash: "a".repeat(64),
      attestedAt: new Date(),
      attorneyDID: "did:key:attorney",
      waitingPeriodEndsAt,
      status: "WAITING_PERIOD",
    });
    const ev = evaluateClaim(claim);
    expect(ev.conditions.waitingPeriodComplete).toBe(false);
  });

  it("disputed claim never all-conditions-met", () => {
    const waitingPeriodEndsAt = subDays(new Date(), 1);
    const claim = mockClaim({
      status: "DISPUTED",
      guardianApprovals: 3,
      deathProofCID: "bafybei-proof",
      deathProofHash: "a".repeat(64),
      attestedAt: new Date(),
      attorneyDID: "did:key:attorney",
      waitingPeriodEndsAt,
      disputeReason: "Fraud allegation",
    });
    const ev = evaluateClaim(claim);
    expect(ev.allConditionsMet).toBe(false);
  });

  it("computeWaitingPeriodEnd adds correct days", () => {
    const quorumDate = new Date("2026-01-01T00:00:00.000Z");
    const end = computeWaitingPeriodEnd(quorumDate, mockPolicy());
    const expected = addDays(quorumDate, 30);
    expect(end.toISOString()).toBe(expected.toISOString());
  });
});
