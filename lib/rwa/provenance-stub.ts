/**
 * lib/rwa/provenance-stub.ts
 *
 * Brick #1 placeholder provenance package for troptionsmint Token-2022 linkage.
 */

import type { RwaProvenancePackage } from "@/lib/rwa/types";

export function buildProvenanceStub(tokenId: string): RwaProvenancePackage {
  return {
    tokenId,
    mintStatus: "NOT_MINTED",
    credentialType: "AssetProvenanceCredential",
    credentialStatus: "UNSIGNED_STUB",
    claims: {
      assetId: `asset-${tokenId}`,
      certCids: [],
      treatment: null,
      origin: null,
      appraisalRef: null,
      lienStatus: "PENDING_REVIEW",
      spvDid: "did:web:spv.example.com",
      legacyVaultManifestCid: "bafy...placeholder",
      gmiiOracleRef: null,
    },
    metadataLinks: {
      manifestUri: null,
      spvDidDocumentUri: "https://spv.example.com/.well-known/did.json",
      vcProofUri: null,
    },
    releaseEngineHints: [
      "RWA tokens do not bypass estate release policy on underlying vault documents.",
      "Brick #2: wire VC issuance endpoint and release-engine RWA condition flags.",
    ],
    disclaimer:
      "Sample stub only. No NAV, appraisal value, or certificate authenticity is asserted. " +
      "Appraisal: TBD pending independent appraisal.",
  };
}
