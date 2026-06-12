export const runtime = 'edge';

/**
 * GET /api/ai/test
 * Quick health check for Google Gemini connection.
 */
import { NextResponse } from "next/server";
import { grokChat } from "@/lib/agents/gemini-client";

export async function GET() {
  const start = Date.now();

  try {
    const result = await grokChat([
      { role: "system", content: "You are a concise assistant." },
      { role: "user",   content: "Reply with exactly: 'Gemini AI is live on Legacy Vault Protocol.'" },
    ], { maxTokens: 32, temperature: 0 });

    return NextResponse.json({
      status:   "ok",
      live:     !result.mock,
      model:    result.model,
      response: result.content,
      latencyMs: Date.now() - start,
      apiKeySet: !!(process.env.GEMINI_API_KEY || process.env.XAI_API_KEY),
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: String(err),
      apiKeySet: !!(process.env.GEMINI_API_KEY || process.env.XAI_API_KEY),
    }, { status: 500 });
  }
}
