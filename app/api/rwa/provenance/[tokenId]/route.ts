export const runtime = 'edge';
/**
 * GET /api/rwa/provenance/[tokenId]
 *
 * Brick #1 stub: return proof package shape for Token-2022 metadata + VC linkage.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildProvenanceStub } from "@/lib/rwa/provenance-stub";
import { validationError, serverError } from "@/lib/validation/schemas";

type RouteContext = { params: Promise<{ tokenId: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { tokenId } = await context.params;
  if (!tokenId || tokenId.length < 3) {
    return validationError("tokenId path segment required");
  }

  try {
    const package_ = buildProvenanceStub(tokenId);
    return NextResponse.json({ provenance: package_ });
  } catch (err) {
    console.error("[api/rwa/provenance GET]", err);
    return serverError();
  }
}
