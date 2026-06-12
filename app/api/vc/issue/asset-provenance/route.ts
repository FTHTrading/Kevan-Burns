export const runtime = 'edge';
/**
 * POST /api/vc/issue/asset-provenance
 * Issue full AssetProvenanceCredential; returns SD-JWT-shaped stub in dev.
 */

import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/audit/audit-log";
import {
  IssueAssetProvenanceSchema,
  buildAssetProvenanceCredential,
} from "@/lib/rwa/vc-schema";
import {
  issueAssetProvenanceStub,
  isVcMockEnabled,
  stubNotImplementedResponse,
} from "@/lib/rwa/sd-jwt-stub";
import { validationError, serverError } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationError("Invalid JSON");
  }

  const parsed = IssueAssetProvenanceSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", parsed.error.flatten());
  }

  const actorId = req.headers.get("x-user-id");
  if (!actorId) {
    return validationError("x-user-id header required");
  }

  const randBytes = new Uint8Array(12);
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    globalThis.crypto.getRandomValues(randBytes);
  } else {
    for (let i = 0; i < randBytes.length; i++) randBytes[i] = Math.floor(Math.random() * 256);
  }
  const credentialId = `vc_${Array.from(randBytes).map(b => b.toString(16).padStart(2, "0")).join("")}`;

  try {
    if (!isVcMockEnabled()) {
      return NextResponse.json(
        stubNotImplementedResponse({
          credentialId,
          credentialHash: "",
          credential: buildAssetProvenanceCredential(
            parsed.data.claims,
            parsed.data.subjectDid,
            credentialId
          ),
        }),
        { status: 501 }
      );
    }

    const result = issueAssetProvenanceStub({
      credentialId,
      subjectDid: parsed.data.subjectDid,
      claims: parsed.data.claims,
    });

    if (parsed.data.anchorAudit && parsed.data.vaultId) {
      await logEvent({
        vaultId: parsed.data.vaultId,
        actorId,
        action: "VAULT_UPDATED",
        detail: {
          subtype: "VC_ASSET_PROVENANCE_ISSUED_STUB",
          credentialId,
          credentialHash: result.credentialHash,
          vcType: "AssetProvenanceCredential",
        },
        anchorOnChain: true,
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/vc/issue/asset-provenance]", err);
    return serverError();
  }
}
