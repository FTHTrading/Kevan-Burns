/**
 * lib/rwa/vc-schema.ts
 *
 * W3C VC 2.0 + SD-JWT claim model for Allure Ruby / Siam Emerald RWA bundle.
 * See docs/ruby-rwa/VC_SCHEMA_ASSET_PROVENANCE.md
 */

import { z } from "zod";

// ── Enums & literals ───────────────────────────────────────

export const ASSET_PROVENANCE_VC_TYPE = "AssetProvenanceCredential" as const;

export const AssetTypeSchema = z.enum(["ruby", "emerald", "bundle"]);
export type AssetType = z.infer<typeof AssetTypeSchema>;

export const LienStatusSchema = z.enum([
  "none",
  "pending",
  "satisfied",
  "disputed",
]);
export type LienStatus = z.infer<typeof LienStatusSchema>;

export const CertTierSchema = z.enum([
  "premium",
  "standard",
  "supplemental",
  "ungraded",
]);
export type CertTier = z.infer<typeof CertTierSchema>;

// ── Disclosure groups ──────────────────────────────────────

export const DISCLOSURE_GROUPS = [
  "lender-minimal",
  "investor-placement",
  "full-diligence",
  "guardian-auth",
] as const;

export type DisclosureGroup = (typeof DISCLOSURE_GROUPS)[number];

/** Claim paths included per SD-JWT disclosure group */
export const DISCLOSURE_GROUP_CLAIMS: Record<DisclosureGroup, readonly string[]> = {
  "lender-minimal": [
    "clearTitle",
    "lienStatus",
    "certTierSummary",
    "valuationAboveThreshold",
  ],
  "investor-placement": [
    "origin",
    "treatmentDisclosure",
    "certIssuerCount",
    "spvDid",
    "assetType",
  ],
  "full-diligence": [
    "assetId",
    "assetType",
    "caratWeight",
    "certIssuerCids",
    "origin",
    "treatmentDisclosure",
    "heatedFlag",
    "spvDid",
    "legacyVaultManifestCid",
    "independentAppraisalRef",
    "gmiiOracleRef",
    "lienStatus",
    "clearTitle",
    "custodySkrRef",
    "certTierSummary",
    "valuationAboveThreshold",
    "issuedAt",
    "issuerDid",
  ],
  "guardian-auth": ["guardianRole", "authorizationLevel"],
} as const;

// ── Full credential claims ─────────────────────────────────

export const AssetProvenanceClaimsSchema = z.object({
  assetId: z.string().min(1),
  assetType: AssetTypeSchema,
  caratWeight: z.number().positive(),
  certIssuerCids: z.array(z.string().min(10)).min(1),
  origin: z.string().min(2).max(200),
  treatmentDisclosure: z.string().max(2000),
  heatedFlag: z.boolean(),
  spvDid: z.string().min(5),
  legacyVaultManifestCid: z.string().min(10),
  independentAppraisalRef: z.string().optional(),
  gmiiOracleRef: z.string().optional(),
  lienStatus: LienStatusSchema,
  clearTitle: z.boolean(),
  custodySkrRef: z.string().min(5),
  certTierSummary: CertTierSchema,
  valuationAboveThreshold: z.union([
    z.boolean(),
    z.string().regex(/^ref:[a-z0-9-]+$/i),
  ]),
  issuedAt: z.string().datetime(),
  issuerDid: z.string().min(5),
  /** Guardian-only; not in lender/investor groups */
  guardianRole: z.string().optional(),
  authorizationLevel: z.enum(["read", "approve", "release"]).optional(),
  /** Derived for investor-placement when full CIDs withheld */
  certIssuerCount: z.number().int().positive().optional(),
});

export type AssetProvenanceClaims = z.infer<typeof AssetProvenanceClaimsSchema>;

export interface AssetProvenanceCredential {
  "@context": readonly string[];
  id: string;
  type: readonly string[];
  issuer: string;
  validFrom: string;
  credentialSubject: {
    id: string;
    type: typeof ASSET_PROVENANCE_VC_TYPE;
  } & AssetProvenanceClaims;
}

// ── API request schemas ────────────────────────────────────

export const IssueAssetProvenanceSchema = z.object({
  vaultId: z.string().cuid().optional(),
  subjectDid: z.string().min(5),
  claims: AssetProvenanceClaimsSchema,
  anchorAudit: z.boolean().default(true),
});

export const PresentSelectiveSchema = z.object({
  credentialId: z.string().cuid(),
  disclosureGroup: z.enum(DISCLOSURE_GROUPS).optional(),
  claimPaths: z.array(z.string().min(1)).optional(),
  audienceDid: z.string().min(5).optional(),
  nonce: z.string().min(8).optional(),
}).refine(
  (d) => Boolean(d.disclosureGroup) || (d.claimPaths && d.claimPaths.length > 0),
  { message: "Provide disclosureGroup or non-empty claimPaths" }
);

export const VerifyPresentationQuerySchema = z.object({
  presentation: z.string().min(10),
  expectedDisclosureGroup: z.enum(DISCLOSURE_GROUPS).optional(),
  issuerDid: z.string().min(5).optional(),
});

// ── API response shapes (stub + future) ─────────────────────

export interface VcStubMeta {
  implementation: "stub";
  cryptoReady: false;
  plannedPackages: readonly string[];
}

export interface IssueAssetProvenanceResponse {
  status: "mock" | "not_implemented";
  credentialId: string;
  credential: AssetProvenanceCredential;
  sdJwt?: string;
  credentialHash: string;
  meta: VcStubMeta;
}

export interface PresentSelectiveResponse {
  status: "mock" | "not_implemented";
  credentialId: string;
  disclosureGroup?: DisclosureGroup;
  disclosedClaimPaths: string[];
  presentation: string;
  meta: VcStubMeta;
}

export interface VerifyPresentationResponse {
  status: "mock" | "not_implemented";
  verified: boolean;
  disclosedClaims?: Record<string, unknown>;
  warnings: string[];
  meta: VcStubMeta;
}

export const VC_STUB_META: VcStubMeta = {
  implementation: "stub",
  cryptoReady: false,
  plannedPackages: [
    "@sd-jwt/core",
    "@sd-jwt/decode",
    "@sd-jwt/present",
    "@sd-jwt/verify",
  ],
};

export function resolveClaimPaths(
  disclosureGroup?: DisclosureGroup,
  claimPaths?: string[]
): string[] {
  if (claimPaths?.length) return [...claimPaths];
  if (disclosureGroup) return [...DISCLOSURE_GROUP_CLAIMS[disclosureGroup]];
  return [];
}

export function buildAssetProvenanceCredential(
  claims: AssetProvenanceClaims,
  subjectDid: string,
  credentialId: string
): AssetProvenanceCredential {
  const investorClaims = { ...claims };
  if (!investorClaims.certIssuerCount && claims.certIssuerCids) {
    investorClaims.certIssuerCount = claims.certIssuerCids.length;
  }

  return {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://w3id.org/security/data-integrity/v2",
    ],
    id: `urn:uuid:${credentialId}`,
    type: ["VerifiableCredential", ASSET_PROVENANCE_VC_TYPE],
    issuer: claims.issuerDid,
    validFrom: claims.issuedAt,
    credentialSubject: {
      id: subjectDid,
      type: ASSET_PROVENANCE_VC_TYPE,
      ...investorClaims,
    },
  };
}
