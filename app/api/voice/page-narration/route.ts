export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { getPageNarration, normalizeNarrationText } from "@/lib/voice/narration";

/**
 * POST /api/voice/page-narration
 *
 * Accepts { page: string, pageTitle?: string, pageContext?: string }
 *
 * Flow:
 *  1. Check static preset (instant, cached)
 *  2. If no preset → generate via Grok AI (dynamic, any page)
 *  3. Send generated/preset text to Deepgram Aura TTS
 *  4. Return audio/mpeg stream
 *
 * API keys never reach the browser.
 */

const DG_TTS_URL = "https://api.cloudflare.com/client/v4/accounts";

function primaryKey(): string {
  const k = process.env.DEEPGRAM_KEY ?? process.env.DEEPGRAM_API_KEY;
  if (!k) throw new Error("DEEPGRAM_KEY is not configured");
  return k;
}

function altKey(): string {
  return process.env.DEEPGRAM_KEY_ALT ?? process.env.DEEPGRAM_KEY ?? "";
}

function ttsModel(): string {
  return process.env.DEEPGRAM_TTS_VOICE ?? process.env.DEEPGRAM_TTS_MODEL ?? "aura-2-luna-en";
}

async function callDeepgram(text: string, key: string): Promise<Response> {
  return fetch(`https://api.deepgram.com/v1/speak?model=${ttsModel()}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
}

/**
 * Use Grok to write a warm, empathetic narration for any page dynamically.
 */
async function generateGrokNarration(
  page: string,
  pageTitle: string,
  pageContext: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) return getFallbackNarration(pageTitle);

  try {
    const systemPrompt = `You are the voice narrator for Legacy Vault Protocol — a sovereign digital estate protection platform for families.

Your tone: warm, calm, trustworthy, empathetic. Like a trusted family attorney speaking with genuine care. Never robotic. Never salesy. Never use emojis or special characters.

Write a spoken narration (60-90 seconds when read aloud, roughly 180-250 words) for the page described. 
- Begin with a natural greeting that references what this page does
- Explain what families will find here and why it matters
- Connect it to the larger mission: protecting what matters most for the people you love
- End with a gentle encouragement to take action
- Write in flowing spoken prose — commas and ellipses for natural pauses
- No bullet points, no headers, no markdown`;

    const userPrompt = `Write a voice narration for this page:

Page path: ${page}
Page title: ${pageTitle}
Page context: ${pageContext || "Part of Legacy Vault Protocol — a digital estate planning and asset protection platform powered by TROPTIONS, Gemini AI, and blockchain technology."}

Write the full narration now.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: userPrompt }]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400
        }
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return getFallbackNarration(pageTitle);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? getFallbackNarration(pageTitle);
  } catch {
    return getFallbackNarration(pageTitle);
  }
}

function getFallbackNarration(pageTitle: string): string {
  return `Welcome to Legacy Vault Protocol.

You are viewing ${pageTitle}. This section of the platform is designed to help you protect the things that matter most to your family.

Legacy Vault Protocol combines military-grade encryption, private blockchain anchoring, and AI-powered document generation to ensure that when the time comes, your family has everything they need — organized, verified, and ready.

Powered by TROPTIONS, Grok AI, and Deepgram, every page on this platform is designed with one purpose: giving you and your family genuine peace of mind.

Take your time exploring. When you are ready, the guided setup wizard will walk you through everything in about twenty minutes.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const page: string        = typeof body?.page      === "string" ? body.page.trim()      : "/";
    const pageTitle: string   = typeof body?.pageTitle === "string" ? body.pageTitle.trim() : "Legacy Vault Protocol";
    const pageContext: string = typeof body?.pageContext === "string" ? body.pageContext.trim() : "";

    // Step 1: Check static preset
    let narrationText: string;
    const preset = getPageNarration(page);

    if (preset) {
      narrationText = normalizeNarrationText(preset.script);
    } else {
      // Step 2: Generate dynamically with Grok
      const generated = await generateGrokNarration(page, pageTitle, pageContext);
      narrationText = normalizeNarrationText(generated);
    }

    // Step 3: Send to Deepgram Aura TTS
    let dgRes = await callDeepgram(narrationText, primaryKey());

    // Failover to alt key on quota/auth errors
    if (dgRes.status === 401 || dgRes.status === 402 || dgRes.status === 429) {
      const alt = altKey();
      if (alt) dgRes = await callDeepgram(narrationText, alt);
    }

    if (!dgRes.ok) {
      const errText = await dgRes.text().catch(() => "unknown");
      console.error("[voice/page-narration] Deepgram error", dgRes.status, errText);
      return NextResponse.json({ error: "Voice service temporarily unavailable." }, { status: 502 });
    }

    const audioBuffer = await dgRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type":  "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
        "X-Page":        page,
        "X-Narrated-By": preset ? "preset" : "gemini-2.5-flash",
        "X-Voice-Title": encodeURIComponent(preset?.title ?? pageTitle),
        "X-Model":       ttsModel(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("DEEPGRAM_KEY")) {
      return NextResponse.json(
        { error: "Voice narration is not configured. Add DEEPGRAM_KEY to environment variables." },
        { status: 503 }
      );
    }
    console.error("[voice/page-narration] Unexpected error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
