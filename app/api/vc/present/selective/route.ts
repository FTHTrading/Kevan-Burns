export const runtime = 'edge';
/**
 * POST /api/vc/present/selective
 * Build selective disclosure presentation from stored credential (dev stub).
 */

import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/audit/audit-log";
import {
  PresentSelectiveSchema,
  type PresentSelectiveResponse,
} from "@/lib/rwa/vc-schema";
import {
  getStubCredential,
  isVcMockEnabled,
  presentSelectiveStub,
  stubNotImplementedResponse,
} from "@/lib/rwa/sd-jwt-stub";
import { validationError, notFoundError, serverError } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationError("Invalid JSON");
  }

  const parsed = PresentSelectiveSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", parsed.error.flatten());
  }

  const actorId = req.headers.get("x-user-id");
  if (!actorId) {
    return validationError("x-user-id header required");
  }

  const { credentialId, disclosureGroup, claimPaths, audienceDid } = parsed.data;

  try {
    if (!isVcMockEnabled()) {
      const empty: PresentSelectiveResponse = stubNotImplementedResponse({
        credentialId,
        disclosedClaimPaths: [],
        presentation: "",
      });
      return NextResponse.json(empty, { status: 501 });
    }

    const credential = getStubCredential(credentialId);
    if (!credential) {
      return notFoundError("Credential");
    }

    const result = presentSelectiveStub({
      credentialId,
      credential,
      disclosureGroup,
      claimPaths,
    });

    const vaultId = req.headers.get("x-vault-id") ?? undefined;
    if (vaultId) {
      await logEvent({
        vaultId,
        actorId,
        action: "ACCESS_GRANTED",
        detail: {
          subtype: "VC_SELECTIVE_PRESENTATION_STUB",
          credentialId,
          disclosureGroup: disclosureGroup ?? "custom",
          disclosedClaimPaths: result.disclosedClaimPaths,
          audienceDid,
        },
        anchorOnChain: false,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/vc/present/selective]", err);
    return serverError();
  }
}
