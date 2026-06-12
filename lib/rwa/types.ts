/**
 * lib/rwa/types.ts
 *
 * RWA (Real World Asset) types for gem provenance — Allure Ruby + Siam Emerald track.
 * Brick #1: schema + placeholder responses only; no live appraisal or cert CIDs.
 */

import { z } from "zod";

// ── Intake / manifest request ─────────────────────────────────

export const RwaAssetClassSchema = z.enum([
  "RUBY_LOT",
  "SIAM_EMERALD",
  "COPPER_SKR",
  "MIXED_GEM_PACKAGE",
]);

export const RwaManifestRequestSchema = z.object({
  /** Planning repo issue or package slug (e.g. FTHTrading/ruby) */
  packageRef: z.string().min(2).max(200),
  assetClass: RwaAssetClassSchema,
  /** Optional Legacy vault to attach encrypted doc index */
  vaultId: z.string().cuid().optional(),
  /** SPV DID — did:web when assigned */
  spvDid: z.string().regex(/^did:/).optional(),
  /** Index of cert document labels — CIDs populated after vault upload */
  certDocumentLabels: z.array(z.string().min(1).max(120)).default([]),
  /** GMIIE oracle reference URI (no live NAV in Brick #1) */
  gmiiOracleRef: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
});

export type RwaManifestRequest = z.infer<typeof RwaManifestRequestSchema>;

// ── Manifest response (placeholder until IPFS + VC pipeline) ─

export interface RwaManifestEntry {
  label: string;
  docType: "GEM_CERT" | "OWNERSHIP" | "CUSTODY" | "INSURANCE" | "APPRAISAL" | "OTHER";
  cid: string | null;
  plaintextHash: string | null;
}

export interface RwaManifestStub {
  manifestId: string;
  packageRef: string;
  assetClass: z.infer<typeof RwaAssetClassSchema>;
  vaultId: string | null;
  spvDid: string | null;
  legacyVaultManifestCid: string | null;
  contentHash: string;
  status: "DRAFT" | "INTAKE" | "PENDING_SPV" | "READY_FOR_METADATA";
  entries: RwaManifestEntry[];
  tokenMetadataTemplate: {
    manifestUriPlaceholder: string;
    spvDidPlaceholder: string;
    vcProofUriPlaceholder: string;
    navPolicy: "TBD pending independent appraisal";
  };
  gmiiOracleRef: string | null;
  createdAt: string;
}

// ── Provenance proof package (GET /api/rwa/provenance/[tokenId]) ─

export interface AssetProvenanceCredentialClaims {
  assetId: string;
  certCids: string[];
  treatment: string | null;
  origin: string | null;
  appraisalRef: string | null;
  lienStatus: "UNKNOWN" | "CLEAR" | "ENCUMBERED" | "PENDING_REVIEW";
  spvDid: string;
  legacyVaultManifestCid: string;
  gmiiOracleRef: string | null;
}

export interface RwaProvenancePackage {
  tokenId: string;
  mintStatus: "NOT_MINTED" | "METADATA_DRAFT" | "MINTED";
  credentialType: "AssetProvenanceCredential";
  credentialStatus: "UNSIGNED_STUB" | "ISSUED" | "REVOKED";
  claims: AssetProvenanceCredentialClaims;
  /** URIs that will appear on Token-2022 metadata extension */
  metadataLinks: {
    manifestUri: string | null;
    spvDidDocumentUri: string | null;
    vcProofUri: string | null;
  };
  releaseEngineHints: string[];
  disclaimer: string;
}
