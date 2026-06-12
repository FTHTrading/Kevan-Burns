export const runtime = 'edge';
/**
 * GET /api/vc/verify/presentation?presentation=<sd-jwt>
 * Verify disclosed claims in a presentation (structural stub until @sd-jwt/verify).
 */

import { NextRequest, NextResponse } from "next/server";
import { VerifyPresentationQuerySchema } from "@/lib/rwa/vc-schema";
import {
  isVcMockEnabled,
  stubNotImplementedResponse,
  verifyPresentationStub,
} from "@/lib/rwa/sd-jwt-stub";
import { validationError, serverError } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const presentation = req.nextUrl.searchParams.get("presentation") ?? "";
  const expectedDisclosureGroup =
    req.nextUrl.searchParams.get("expectedDisclosureGroup") ?? undefined;
  const issuerDid = req.nextUrl.searchParams.get("issuerDid") ?? undefined;

  const parsed = VerifyPresentationQuerySchema.safeParse({
    presentation,
    expectedDisclosureGroup,
    issuerDid,
  });
  if (!parsed.success) {
    return validationError("Validation failed", parsed.error.flatten());
  }

  try {
    if (!isVcMockEnabled()) {
      return NextResponse.json(
        stubNotImplementedResponse({
          verified: false,
          warnings: ["SD-JWT verification library not installed"],
        }),
        { status: 501 }
      );
    }

    const result = verifyPresentationStub(parsed.data.presentation);

    if (
      parsed.data.expectedDisclosureGroup &&
      result.disclosedClaims &&
      parsed.data.issuerDid &&
      result.disclosedClaims.issuerDid !== parsed.data.issuerDid
    ) {
      result.warnings.push("issuerDid query param does not match disclosed payload");
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/vc/verify/presentation]", err);
    return serverError();
  }
}
