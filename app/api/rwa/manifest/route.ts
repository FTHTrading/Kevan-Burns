export const runtime = 'edge';
/**
 * POST /api/rwa/manifest
 *
 * Brick #1 stub: validate intake body shape and return placeholder manifest structure.
 * Does not upload to IPFS or write to Prisma — see /api/vault/manifest for vault manifests.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildRwaManifestStub } from "@/lib/rwa/manifest-stub";
import { RwaManifestRequestSchema } from "@/lib/rwa/types";
import { validationError, serverError } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  const actorId = req.headers.get("x-user-id");
  if (!actorId) return validationError("x-user-id header required");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationError("Invalid JSON");
  }

  const parsed = RwaManifestRequestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", parsed.error.flatten());
  }

  try {
    const manifest = buildRwaManifestStub(parsed.data);
    return NextResponse.json(
      {
        manifest,
        message:
          "Brick #1 stub — persist via Legacy Vault upload + manifest when intake is complete.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/rwa/manifest POST]", err);
    return serverError();
  }
}
