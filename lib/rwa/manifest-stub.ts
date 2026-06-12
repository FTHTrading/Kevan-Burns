/**
 * lib/rwa/manifest-stub.ts
 *
 * Brick #1 placeholder manifest builder — no IPFS upload, no real CIDs.
 */

import { createHash, randomBytes } from "crypto";
import type { RwaManifestRequest, RwaManifestStub } from "@/lib/rwa/types";

export function buildRwaManifestStub(req: RwaManifestRequest): RwaManifestStub {
  const manifestId = `rwa-${randomBytes(8).toString("hex")}`;
  const payload = {
    manifestId,
    packageRef: req.packageRef,
    assetClass: req.assetClass,
    vaultId: req.vaultId ?? null,
    spvDid: req.spvDid ?? null,
    certLabels: req.certDocumentLabels,
    gmiiOracleRef: req.gmiiOracleRef ?? null,
    createdAt: new Date().toISOString(),
  };
  const contentHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");

  return {
    manifestId,
    packageRef: req.packageRef,
    assetClass: req.assetClass,
    vaultId: req.vaultId ?? null,
    spvDid: req.spvDid ?? null,
    legacyVaultManifestCid: null,
    contentHash,
    status: "DRAFT",
    entries: req.certDocumentLabels.map((label) => ({
      label,
      docType: "GEM_CERT" as const,
      cid: null,
      plaintextHash: null,
    })),
    tokenMetadataTemplate: {
      manifestUriPlaceholder: `ipfs://<manifest-cid-TBD>`,
      spvDidPlaceholder: req.spvDid ?? "did:web:spv.example.com",
      vcProofUriPlaceholder: `ipfs://<vc-proof-cid-TBD>`,
      navPolicy: "TBD pending independent appraisal",
    },
    gmiiOracleRef: req.gmiiOracleRef ?? null,
    createdAt: payload.createdAt,
  };
}
