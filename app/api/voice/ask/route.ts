export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { findKnowledgeEntry, getKnowledgeSummary } from "@/lib/voice/knowledge-map";
import { normalizeNarrationText } from "@/lib/voice/narration";

/**
 * POST /api/voice/ask
 *
 * Legacy Voice Guide — AI concierge (LOCAL_GUIDE mode)
 *
 * Accepts { question: string, mode?: "text" | "spoken" }
 *
 * Returns a safe, scripted answer from the local knowledge map.
 * If mode = "spoken", also calls Deepgram TTS and returns audio/mpeg.
 *
 * This endpoint does NOT connect to an external LLM unless
 * LEGACY_VOICE_LLM_ENABLED=true and OPENAI_API_KEY (or similar) is configured.
 * It does NOT expose private vault data under any circumstances.
 *
 * Labeled LOCAL_GUIDE until LLM/RAG integration is enabled via env configuration.
 */

const DG_TTS_URL = "https://api.deepgram.com/v1/speak";

function ttsKey(): string | null {
  return process.env.DEEPGRAM_KEY ?? process.env.DEEPGRAM_API_KEY ?? null;
}

function ttsModel(): string {
  return process.env.DEEPGRAM_TTS_VOICE ?? process.env.DEEPGRAM_TTS_MODEL ?? "aura-2-luna-en";
}

function buildAnswerScript(question: string): string {
  const entry = findKnowledgeEntry(question);

  if (entry) {
    return [
      `That's a great question about ${entry.topic}.`,
      "",
      entry.summary,
      "",
      entry.detail,
      "",
      "If you would like to explore this further, visit the relevant page in Legacy Vault Protocol",
      "or continue asking questions here.",
    ].join("\n");
  }

  // Fallback generic answer
  return [
    "Thank you for your question.",
    "",
    "Legacy Vault Protocol is a private estate operating system for digital assets, legal records,",
    "wallet references, executor workflows, beneficiary access, and succession planning.",
    "",
    "It is powered by TROPTIONS — providing namespaces, wallets, x402 metered services,",
    "XRPL and Stellar asset rails, stablecoin references, Control Hub governance,",
    "and a Rust-based TSN settlement scaffold.",
    "",
    "For more specific information, try asking about a particular topic:",
    "Legacy, TROPTIONS, x402, wallets, stablecoins, XRPL, Stellar, settlement, Control Hub,",
    "namespaces, executor workflows, beneficiary access, or the TROPTIONS history.",
    "",
    "Every major page also has a narration you can listen to directly.",
  ].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = typeof body?.question === "string" ? body.question.trim().slice(0, 500) : "";
    const mode: string = typeof body?.mode === "string" ? body.mode : "text";

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const answerText = buildAnswerScript(question);
    const normalizedAnswer = normalizeNarrationText(answerText);

    // Text-only mode
    if (mode !== "spoken") {
      return NextResponse.json({
        answer: normalizedAnswer,
        mode: "LOCAL_GUIDE",
        note: "Answers are based on local knowledge. No private vault data is included.",
      });
    }

    // Spoken mode — call Deepgram TTS
    const key = ttsKey();
    if (!key) {
      // Return text with a note about TTS not being configured
      return NextResponse.json({
        answer: normalizedAnswer,
        mode: "LOCAL_GUIDE",
        spoken: false,
        note: "DEEPGRAM_API_KEY not configured — returning text only.",
      });
    }

    const dgRes = await fetch(`${DG_TTS_URL}?model=${ttsModel()}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: normalizedAnswer }),
    });

    if (!dgRes.ok) {
      return NextResponse.json({
        answer: normalizedAnswer,
        mode: "LOCAL_GUIDE",
        spoken: false,
        note: "TTS temporarily unavailable — returning text only.",
      });
    }

    const audioBuffer = await dgRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store", // Q&A answers are dynamic
        "X-Mode": "LOCAL_GUIDE",
        "X-Model": ttsModel(),
      },
    });
  } catch (err) {
    console.error("[voice/ask] Unexpected error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
