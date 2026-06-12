export const runtime = 'edge';

/**
 * GET /api/ai/cf-test
 * Test Cloudflare Workers AI connection + models.
 */
import { NextResponse } from "next/server";
import { testCFAI } from "@/lib/agents/cloudflare-ai";

export async function GET() {
  const start = Date.now();

  const result = await testCFAI();

  return NextResponse.json({
    ...result,
    totalMs:    Date.now() - start,
    accountId:  process.env.CF_ACCOUNT_ID ? "set" : "missing",
    tokenSet:   !!process.env.CF_WORKERS_AI_TOKEN,
    domain:     "vault.genesis402.com (CF custom domain on troptions-unity-legacy-vault; was vercel-dns, now unified to main CF Pages project)",
    zoneId:     process.env.CF_ZONE_ID ? "set" : "missing",
  });
}
