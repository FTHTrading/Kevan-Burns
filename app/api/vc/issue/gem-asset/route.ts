export const runtime = 'edge';
/**
 * POST /api/vc/issue/gem-asset
 *
 * GemAssetCredential v1 issuance endpoint.
 * Validates credentialSubject against lib/rwa/gem-asset-vc-schema.
 * proofType "bbs" → BBSService (real crypto unless MOCK_BBS=true).
 * proofType "sd-jwt" → 501 until SD-JWT HSM wiring (dev mock via GEM_VC_ISSUANCE_MOCK).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  GEM_ASSET_CONTEXT,
  GEM_ASSET_SCHEMA_ID,
  GemAssetIssueRequestSchema,
  buildMockGemAssetCredential,
  type GemAssetIssueResponse,
} from "@/lib/rwa/gem-asset-vc-schema";
import { BBSService } from "@/lib/vc/bbs/BBSService";
import { isMockBbsEnabled } from "@/lib/vc/bbs/bbs-keys";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GemAssetIssueRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { credentialSubject, issuerDid, proofType, disclosureGroup } = parsed.data;
  const issuer =
    issuerDid ?? "did:web:legacy.fthtrading.com:spv:allure";
  const mockSdJwt = process.env.GEM_VC_ISSUANCE_MOCK === "true";

  if (proofType === "bbs") {
    const bbsService = new BBSService();
    const credential = await bbsService.issueBBSVC(credentialSubject, {
      issuerDid: issuer,
      context: [...GEM_ASSET_CONTEXT],
    });

    const response: GemAssetIssueResponse = {
      status: isMockBbsEnabled() || credential.proof?.mock ? "mock" : "issued",
      schemaId: GEM_ASSET_SCHEMA_ID,
      credential: {
        "@context": [...GEM_ASSET_CONTEXT],
        id: credential.id || "",
        type: Array.isArray(credential.type)
          ? credential.type
          : [credential.type],
        issuer: credential.issuer,
        validFrom: credential.validFrom || "",
        credentialSubject,
        proof: credential.proof as any as Record<string, unknown>,
      },
      disclosureGroup,
      securingMechanism: "BBS+",
      message: isMockBbsEnabled()
        ? "MOCK_BBS=true — unsigned placeholder proof for CI."
        : "BBS+ credential issued via @digitalbazaar/bbs-signatures.",
    };

    return NextResponse.json(response, { status: 201 });
  }

  if (!mockSdJwt) {
    return NextResponse.json(
      {
        error: "Not Implemented",
        schemaId: GEM_ASSET_SCHEMA_ID,
        message:
          "SD-JWT issuance signing is not yet enabled. Set GEM_VC_ISSUANCE_MOCK=true for dev mock responses, or use proofType: 'bbs'.",
        validated: true,
        proofType,
        disclosureGroup,
      },
      { status: 501 }
    );
  }

  const response: GemAssetIssueResponse = {
    status: "mock",
    schemaId: GEM_ASSET_SCHEMA_ID,
    credential: buildMockGemAssetCredential(credentialSubject, {
      issuerDid: issuer,
      proofType,
    }),
    disclosureGroup,
    securingMechanism: "SD-JWT",
    message:
      "MOCK SD-JWT issuance — proof is unsigned. Wire to Legacy Vault HSM for production.",
  };

  return NextResponse.json(response, { status: 201 });
}
