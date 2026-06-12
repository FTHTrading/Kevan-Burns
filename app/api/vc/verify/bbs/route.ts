export const runtime = 'edge';
/**
 * POST /api/vc/verify/bbs
 * Verify a BBS+ selective disclosure presentation.
 * For real crypto, include the full signed credential for message reconstruction.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BBSService, type BbsPresentation, type BbsVerifiableCredential } from "@/lib/vc/bbs/BBSService";

const VerifyRequestSchema = z.object({
  presentation: z.record(z.unknown()),
  credential: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = VerifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { presentation, credential } = parsed.data;
  const proof = presentation.proof as Record<string, unknown> | undefined;

  if (proof?.type !== "BbsBlsSignatureProof2020") {
    return NextResponse.json(
      { error: "Presentation must carry a BbsBlsSignatureProof2020 proof" },
      { status: 400 }
    );
  }

  try {
    const bbsService = new BBSService();
    const verified = await bbsService.verifyPresentation(
      presentation as unknown as BbsPresentation,
      credential as unknown as BbsVerifiableCredential | undefined
    );

    return NextResponse.json({
      verified,
      mock: Boolean(proof.mock),
      disclosedIndexes: proof.disclosedMessageIndexes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message, verified: false }, { status: 422 });
  }
}
