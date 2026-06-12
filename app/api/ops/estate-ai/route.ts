export const runtime = 'edge';

import { NextRequest } from "next/server";
import { grokStream, GrokMessage } from "@/lib/agents/gemini-client";

const SYSTEM_PROMPT = `You are an expert estate planning and legal document assistant for Legacy Vault Protocol — a private Web3 estate vault system built by FTH Trading.

You help users with:
- Understanding estate planning concepts: wills, trusts, executors, beneficiaries, guardians, probate
- Deciding which documents to generate and why each matters legally
- Analyzing uploaded estate documents to identify what should be vaulted or registered
- Explaining legal and technical terminology in plain language
- Guiding users through vault setup, namespace registration, and release policy configuration
- Cross-chain digital asset inheritance: Bitcoin, Ethereum, Solana, XRPL, Stellar, Apostle Chain
- x402 micropayment billing and USDF settlement
- IPFS anchoring, chain proofs, and attestation workflows

When analyzing documents, identify and report:
1. Key parties (executors, beneficiaries, guardians, trustees)
2. Assets mentioned (real estate, financial accounts, digital wallets, insurance)
3. Conditions, timelines, and waiting periods
4. What should be registered or anchored in the vault
5. Any gaps or missing provisions in the estate plan
6. Recommended downloads to generate

Keep responses clear, professional, actionable, and concise. Always recommend consulting a licensed estate attorney for legal advice specific to their jurisdiction.`;

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    messages: { role: string; content: string }[];
    documentContent?: string;
  };

  const { messages, documentContent } = body;

  const allMessages = documentContent
    ? [
        ...messages,
        {
          role: "user",
          content: `Please analyze this document and provide estate planning insights, identify key parties and assets, and recommend which vault documents to generate:\n\n---\n${documentContent.slice(0, 8000)}\n---`,
        },
      ]
    : messages;

  const grokMessages: GrokMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...allMessages.map((msg: any) => ({
      role: (msg.role === "system" ? "system" : msg.role === "assistant" ? "assistant" : "user") as "system" | "user" | "assistant",
      content: msg.content,
    })),
  ];

  try {
    const rawStream = await grokStream(grokMessages, { temperature: 0.7 });

    const encoder = new TextEncoder();
    const reader = rawStream.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              break;
            }
            if (value) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token: value })}\n\n`)
              );
            }
          }
        } catch (err) {
          console.error("Stream reading error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Gemini stream creation error:", error);
    return new Response(
      JSON.stringify({ error: `AI service unavailable: ${error?.message || error}` }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

