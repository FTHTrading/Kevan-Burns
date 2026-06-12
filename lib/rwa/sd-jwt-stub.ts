/**
 * lib/rwa/sd-jwt-stub.ts
 *
 * Placeholder SD-JWT issue / present / verify flow until @sd-jwt/* is integrated.
 * See docs/ruby-rwa/API_SD_JWT.md
 */

import { createHash } from "crypto";
import {
  type AssetProvenanceClaims,
  type AssetProvenanceCredential,
  type DisclosureGroup,
  type IssueAssetProvenanceResponse,
  type PresentSelectiveResponse,
  type VerifyPresentationResponse,
  VC_STUB_META,
  buildAssetProvenanceCredential,
  resolveClaimPaths,
} from "@/lib/rwa/vc-schema";

const STUB_SD_JWT_HEADER = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9"; // synthetic

/** Dev-only in-memory store until VerificationCredential + SD-JWT persistence ships */
const stubCredentialStore = new Map<string, AssetProvenanceCredential>();

export function storeStubCredential(
  credentialId: string,
  credential: AssetProvenanceCredential
): void {
  stubCredentialStore.set(credentialId, credential);
}

export function getStubCredential(
  credentialId: string
): AssetProvenanceCredential | undefined {
  return stubCredentialStore.get(credentialId);
}

export function isVcMockEnabled(): boolean {
  return (
    process.env.VC_STUB_MODE === "mock" ||
    (process.env.NODE_ENV === "development" && process.env.VC_STUB_MODE !== "501")
  );
}

export function stubNotImplementedResponse<T extends Record<string, unknown>>(
  body: T
): T & { status: "not_implemented"; meta: typeof VC_STUB_META } {
  return {
    ...body,
    status: "not_implemented",
    meta: VC_STUB_META,
  };
}

/**
 * Build a synthetic SD-JWT-shaped string (not cryptographically valid).
 * Replace with SD-JWT encoder once issuer keys are provisioned.
 */
export function buildSyntheticSdJwt(
  credential: AssetProvenanceCredential,
  disclosedPaths?: string[]
): string {
  const payload = {
    iss: credential.issuer,
    sub: credential.credentialSubject.id,
    vc: credential,
    _sd_alg: "sha-256",
    _disclosed: disclosedPaths ?? [],
    _note: "SYNTHETIC_STUB_NOT_FOR_PRODUCTION",
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${STUB_SD_JWT_HEADER}.${payloadB64}.SYNTHETIC_STUB_SIGNATURE`;
}

export function issueAssetProvenanceStub(params: {
  credentialId: string;
  subjectDid: string;
  claims: AssetProvenanceClaims;
}): IssueAssetProvenanceResponse {
  const credential = buildAssetProvenanceCredential(
    params.claims,
    params.subjectDid,
    params.credentialId
  );
  const credentialHash = createHash("sha256").update(JSON.stringify(credential)).digest("hex");

  storeStubCredential(params.credentialId, credential);

  return {
    status: "mock",
    credentialId: params.credentialId,
    credential,
    sdJwt: buildSyntheticSdJwt(credential),
    credentialHash,
    meta: VC_STUB_META,
  };
}

export function presentSelectiveStub(params: {
  credentialId: string;
  credential: AssetProvenanceCredential;
  disclosureGroup?: DisclosureGroup;
  claimPaths?: string[];
}): PresentSelectiveResponse {
  const disclosedClaimPaths = resolveClaimPaths(
    params.disclosureGroup,
    params.claimPaths
  );
  const subject = params.credential.credentialSubject;
  const disclosed: Record<string, unknown> = {};
  for (const path of disclosedClaimPaths) {
    if (path in subject) {
      disclosed[path] = subject[path as keyof typeof subject];
    }
  }

  const presentation = buildSyntheticSdJwt(params.credential, disclosedClaimPaths);

  return {
    status: "mock",
    credentialId: params.credentialId,
    disclosureGroup: params.disclosureGroup,
    disclosedClaimPaths,
    presentation,
    meta: VC_STUB_META,
  };
}

export function verifyPresentationStub(presentation: string): VerifyPresentationResponse {
  const warnings: string[] = [
    "Cryptographic SD-JWT verification not implemented — structural parse only.",
  ];

  try {
    const parts = presentation.split(".");
    if (parts.length < 2) {
      return {
        status: "mock",
        verified: false,
        warnings: [...warnings, "Invalid JWT structure"],
        meta: VC_STUB_META,
      };
    }
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as { vc?: { credentialSubject?: Record<string, unknown> }; _disclosed?: string[] };

    const disclosed = payload.vc?.credentialSubject ?? {};
    const paths = payload._disclosed ?? Object.keys(disclosed).filter(
      (k) => !["id", "type"].includes(k)
    );

    return {
      status: "mock",
      verified: parts[2] !== undefined && !presentation.endsWith("INVALID"),
      disclosedClaims: Object.fromEntries(
        paths.map((p) => [p, disclosed[p]])
      ),
      warnings,
      meta: VC_STUB_META,
    };
  } catch {
    return {
      status: "mock",
      verified: false,
      warnings: [...warnings, "Failed to parse presentation payload"],
      meta: VC_STUB_META,
    };
  }
}
