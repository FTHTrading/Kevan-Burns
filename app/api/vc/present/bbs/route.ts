export const runtime = 'edge';
/**
 * POST /api/vc/present/bbs
 * Create an unlinkable BBS+ selective disclosure presentation from a GemAssetCredential.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BBSService, type BbsVerifiableCredential } from "@/lib/vc/bbs/BBSService";

const PresentRequestSchema = z.object({
  credential: z.record(z.unknown()),
  disclosedClaims: z.array(z.string()).min(1),
  challenge: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PresentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { credential, disclosedClaims, challenge } = parsed.data;
  const proof = credential.proof as Record<string, unknown> | undefined;

  if (proof?.type !== "BbsBlsSignature2020") {
    return NextResponse.json(
      { error: "Credential must carry a BbsBlsSignature2020 proof" },
      { status: 400 }
    );
  }

  try {
    const bbsService = new BBSService();
    const presentation = await bbsService.createSelectiveProof(
      credential as unknown as BbsVerifiableCredential,
      disclosedClaims,
      challenge
    );

    return NextResponse.json({
      status: presentation.proof.mock ? "mock" : "presented",
      presentation,
      disclosedClaims,
      mock: Boolean(presentation.proof.mock),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Presentation failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
