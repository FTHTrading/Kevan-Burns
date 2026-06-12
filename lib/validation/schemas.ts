import { z } from "zod";
import { NextResponse } from "next/server";

// ── Vault ──────────────────────────────────────────────────

export const CreateVaultSchema = z.object({
  label: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  ownerDID: z.string().optional(),
  releasePolicyId: z.string().optional(),
});

export const AddWalletSchema = z.object({
  vaultId: z.string().cuid(),
  chain: z.enum(["ethereum", "polygon", "base", "solana", "xrpl", "stellar", "bitcoin", "custom"]),
  publicAddress: z.string().min(10).max(200),
  label: z.string().max(100).optional(),
});

export const UploadDocumentSchema = z.object({
  vaultId: z.string().cuid(),
  type: z.enum([
    "WILL", "TRUST", "POWER_OF_ATTORNEY", "DEED", "TITLE",
    "INSURANCE_POLICY", "TAX_DOCUMENT", "BUSINESS_DOCUMENT",
    "INSTRUCTIONS", "LEGAL_AUTHORITY", "DEATH_CERTIFICATE",
    "COURT_ORDER", "OTHER",
  ]),
  label: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  releaseToRoles: z.array(z.string()).default(["executor", "attorney"]),
  // In real upload flow, file bytes come as FormData — this schema covers JSON metadata
  cid: z.string().optional(),
  plaintextHash: z.string().length(64).optional(),
  mimeType: z.string().default("application/pdf"),
  fileSizeBytes: z.number().int().positive().optional(),
  // ZK crown jewel: client-generated proof (snarkjs Groth16) over document hash / 5-proof conditions
  zkProof: z.object({
    proof: z.any(),
    publicSignals: z.array(z.string()),
    circuit: z.string(),
    version: z.string(),
  }).optional(),
  contentHashForZkp: z.string().optional(), // the public input that was proven
});

// ── Release ────────────────────────────────────────────────

export const RequestReleaseSchema = z.object({
  vaultId: z.string().cuid(),
  claimantId: z.string().cuid(),
});

export const SubmitDeathProofSchema = z.object({
  claimId: z.string().cuid(),
  deathProofCID: z.string().min(10),
  deathProofHash: z.string().length(64),
});

export const AttorneyAttestSchema = z.object({
  claimId: z.string().cuid(),
  attorneyDID: z.string().min(5),
  attorneyNote: z.string().max(1000).optional(),
});

export const GuardianApproveSchema = z.object({
  claimId: z.string().cuid(),
  guardianId: z.string().cuid(),
  approvalNote: z.string().max(500).optional(),
});

export const ApproveReleaseSchema = z.object({
  claimId: z.string().cuid(),
});

export const OpenDisputeSchema = z.object({
  claimId: z.string().cuid(),
  disputeReason: z.string().min(10).max(2000),
});

// ── Helpers ────────────────────────────────────────────────

export function validationError(message: string, errors?: unknown) {
  return NextResponse.json({ error: message, details: errors }, { status: 400 });
}

export function notFoundError(resource: string) {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

export function forbiddenError(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}
