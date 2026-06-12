import { z } from "zod";

function randomUUID(): string {
  const cryptoObj = typeof globalThis !== "undefined" && globalThis.crypto
    ? globalThis.crypto
    : (typeof require !== "undefined" ? require("crypto") : undefined);
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
    (c ^ (cryptoObj ? cryptoObj.getRandomValues(new Uint8Array(1))[0] : Math.random() * 256) & 15 >> c / 4).toString(16)
  );
}

/** VCDM 2.0 GemAssetCredential — canonical schema v1 */
export const GEM_ASSET_SCHEMA_ID =
  "https://schema.fthtrading.com/gem/v1/gem-asset-v1.jsonld";

export const GEM_ASSET_CONTEXT = [
  "https://www.w3.org/ns/credentials/v2",
  "https://schema.fthtrading.com/gem/v1",
] as const;

export const APPRAISAL_TBD_NOTE =
  "TBD — independent appraisal required; package NAV not asserted in repo";

export const DisclosureGroupId = z.enum([
  "collateral_lending",
  "secondary_market",
  "regulatory_full",
  "guardian_internal",
]);
export type DisclosureGroupId = z.infer<typeof DisclosureGroupId>;

export interface DisclosureGroup {
  id: DisclosureGroupId;
  description: string;
  claims: string[];
  securing: "SD-JWT" | "BBS+";
  includesInternal?: string[];
}

/** Selective disclosure groups — maps verifier audience to claim paths */
export const DISCLOSURE_GROUPS: Record<DisclosureGroupId, DisclosureGroup> = {
  collateral_lending: {
    id: "collateral_lending",
    description: "Minimal lender / collateral desk presentation",
    claims: [
      "gemType",
      "caratWeight",
      "titleStatus",
      "valuation.amount",
      "valuation.currency",
      "valuation.asOf",
      "valuation.appraisalStatus",
      "certifications[].lab",
      "legalOwner",
    ],
    securing: "SD-JWT",
  },
  secondary_market: {
    id: "secondary_market",
    description: "Secondary liquidity / marketplace counterparty",
    claims: [
      "name",
      "gemType",
      "caratWeight",
      "color",
      "originCountry",
      "originRegion",
      "treatment",
      "titleStatus",
      "valuation",
      "certifications",
      "manifestCID",
      "linkedRWATokens",
      "legalOwner",
    ],
    securing: "SD-JWT",
  },
  regulatory_full: {
    id: "regulatory_full",
    description: "Full regulatory / accredited investor disclosure",
    claims: ["*"],
    securing: "SD-JWT",
  },
  guardian_internal: {
    id: "guardian_internal",
    description: "Legacy Vault guardian quorum internal view",
    claims: ["*"],
    includesInternal: [
      "vaultRef",
      "chainAnchorRef",
      "troptionsmintMetadata",
      "oracleRef",
    ],
    securing: "BBS+",
  },
};

const GemCertificationSchema = z.object({
  type: z.literal("GemCertification").optional(),
  lab: z.enum(["GIA", "Gübelin", "GRS", "SSEF", "AGL", "other"]),
  reportNumber: z.string().optional(),
  reportDate: z.string().optional(),
  reportCID: z.string().optional(),
  summary: z.string().optional(),
});

const GemValuationSchema = z.object({
  type: z.literal("GemValuation").optional(),
  /** TBD — independent appraisal required; package NAV not asserted in repo */
  amount: z.number().nullable().optional(),
  currency: z.string().default("USD"),
  asOf: z.string().nullable().optional(),
  appraisalStatus: z.enum(["TBD", "pending", "completed", "stale"]).default("TBD"),
  appraisalNote: z.string().default(APPRAISAL_TBD_NOTE),
});

const RWATokenLinkSchema = z.object({
  type: z.literal("RWATokenLink").optional(),
  chain: z.string(),
  mintAddress: z.string(),
  tokenStandard: z.string().optional(),
  fractionalShare: z.number().min(0).max(1).optional(),
});

export const GemAssetSubjectSchema = z.object({
  id: z.string().optional(),
  type: z.literal("GemAsset").optional(),
  name: z.string().min(1),
  gemType: z.enum(["ruby", "emerald", "sapphire", "diamond", "other"]),
  caratWeight: z.number().positive(),
  color: z.string().optional(),
  clarity: z.string().optional(),
  cut: z.string().optional(),
  originCountry: z.string().optional(),
  originRegion: z.string().optional(),
  treatment: z.string().optional(),
  certifications: z.array(GemCertificationSchema).optional(),
  legalOwner: z.string().min(5),
  titleStatus: z.enum([
    "clear",
    "encumbered",
    "in_custody",
    "pending_transfer",
    "disputed",
  ]),
  valuation: GemValuationSchema,
  manifestCID: z.string().min(10),
  bundleId: z.string().optional(),
  collectionName: z.string().optional(),
  linkedRWATokens: z.array(RWATokenLinkSchema).optional(),
  vaultRef: z
    .object({
      type: z.literal("VaultRef").optional(),
      vaultId: z.string(),
      manifestCID: z.string(),
      manifestHash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    })
    .optional(),
  chainAnchorRef: z
    .object({
      type: z.literal("ChainAnchorRef").optional(),
      chain: z.string(),
      txHash: z.string(),
      blockNumber: z.number().int().optional(),
      anchoredAt: z.string().optional(),
    })
    .optional(),
  troptionsmintMetadata: z
    .object({
      type: z.literal("TroptionsMintMetadata").optional(),
      mintJobId: z.string(),
      metadataURI: z.string().url().optional(),
      token2022Extensions: z.record(z.unknown()).optional(),
    })
    .optional(),
  oracleRef: z
    .object({
      type: z.literal("OracleRef").optional(),
      oracleProvider: z.string().default("GMIIE"),
      oracleFeedId: z.string(),
      lastOracleUpdate: z.string().optional(),
    })
    .optional(),
});

export type GemAssetSubject = z.infer<typeof GemAssetSubjectSchema>;

export const GemAssetIssueRequestSchema = z.object({
  credentialSubject: GemAssetSubjectSchema,
  issuerDid: z.string().optional(),
  proofType: z.enum(["sd-jwt", "bbs"]).default("sd-jwt"),
  disclosureGroup: DisclosureGroupId.optional(),
});

export type GemAssetIssueRequest = z.infer<typeof GemAssetIssueRequestSchema>;

export interface GemAssetIssueResponse {
  status: "mock" | "issued";
  schemaId: string;
  credential: {
    "@context": readonly string[];
    id: string;
    type: string[];
    issuer: string;
    validFrom: string;
    credentialSubject: GemAssetSubject;
    proof?: Record<string, unknown>;
  };
  disclosureGroup?: DisclosureGroupId;
  securingMechanism: "SD-JWT" | "BBS+";
  message?: string;
}

export function validateGemAssetSubject(
  subject: unknown
): { success: true; data: GemAssetSubject } | { success: false; errors: z.ZodError } {
  const result = GemAssetSubjectSchema.safeParse(subject);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function buildMockGemAssetCredential(
  subject: GemAssetSubject,
  options?: { issuerDid?: string; proofType?: "sd-jwt" | "bbs" }
): GemAssetIssueResponse["credential"] {
  const issuer =
    options?.issuerDid ?? "did:web:legacy.fthtrading.com:spv:allure";
  const proofType = options?.proofType ?? "sd-jwt";

  return {
    "@context": [...GEM_ASSET_CONTEXT],
    id: `urn:uuid:${randomUUID()}`,
    type: ["VerifiableCredential", "GemAssetCredential"],
    issuer,
    validFrom: new Date().toISOString(),
    credentialSubject: subject,
    proof: {
      type: proofType === "bbs" ? "BbsBlsSignature2020" : "SdJwtVcProof2024",
      proofPurpose: "assertionMethod",
      verificationMethod: `${issuer}#key-1`,
      proofValue: "MOCK_UNSIGNED_PROOF",
      mock: true,
    },
  };
}
