export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";

// Deepgram Aura TTS — professional, empathetic voice for Legacy Vault Protocol
// Voice: aura-2-luna-en — calm, warm, authoritative. Ideal for estate/legal/financial contexts.
// Fallback key: DEEPGRAM_KEY_ALT if primary quota is exhausted.

const DG_TTS_URL = "https://api.deepgram.com/v1/speak";

function getKey(): string {
  const key = process.env.DEEPGRAM_KEY;
  if (!key) throw new Error("DEEPGRAM_KEY is not configured");
  return key;
}

function getKeyAlt(): string {
  return process.env.DEEPGRAM_KEY_ALT ?? getKey();
}

function getVoice(): string {
  return process.env.DEEPGRAM_TTS_VOICE ?? "aura-2-luna-en";
}

async function callDeepgram(text: string, key: string): Promise<Response> {
  const voice = getVoice();
  return fetch(`${DG_TTS_URL}?model=${voice}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // Clamp to 4000 chars — Deepgram TTS handles longer passages internally but
    // we keep requests snappy for the page-reader use case.
    const clampedText = text.slice(0, 4000);

    let dgRes = await callDeepgram(clampedText, getKey());

    // Failover to alt key on quota/auth errors
    if (dgRes.status === 401 || dgRes.status === 402 || dgRes.status === 429) {
      dgRes = await callDeepgram(clampedText, getKeyAlt());
    }

    if (!dgRes.ok) {
      const errText = await dgRes.text().catch(() => "unknown");
      console.error("[TTS] Deepgram error", dgRes.status, errText);
      return NextResponse.json({ error: "TTS service error" }, { status: 502 });
    }

    const audioBuffer = await dgRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
        "X-Voice": getVoice(),
      },
    });
  } catch (err) {
    console.error("[TTS] Unexpected error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
