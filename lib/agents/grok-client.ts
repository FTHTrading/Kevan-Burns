/**
 * lib/agents/grok-client.ts
 *
 * xAI Grok client for Legacy Vault Protocol AI pipeline.
 * Uses grok-3 for document generation, compliance review, and vault Q&A.
 *
 * Set XAI_API_KEY in .env to enable production AI.
 * Falls back to structured mock responses in dev mode.
 */

export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokResponse {
  content: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number };
  mock?: boolean;
}

const BASE_URL = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-3-fast"; // grok-3-fast is optimal for document generation speed/cost

export async function grokChat(
  messages: GrokMessage[],
  opts: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<GrokResponse> {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    // Dev mock — return structured placeholder
    return {
      content: "[MOCK — Set XAI_API_KEY to enable Grok AI generation]\n\nThis is where the AI-generated document will appear. The system prompt and all field values have been prepared and would be sent to grok-3 for full document generation.",
      model: "mock",
      usage: { prompt_tokens: 0, completion_tokens: 0 },
      mock: true,
    };
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Grok API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    usage: data.usage,
  };
}

/**
 * Stream a Grok response token by token.
 * Returns a ReadableStream for use with Next.js StreamingTextResponse.
 */
export async function grokStream(
  messages: GrokMessage[],
  opts: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<ReadableStream<string>> {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    // Return mock stream
    const text = "[MOCK — Set XAI_API_KEY] Document generation would stream here...";
    return new ReadableStream({
      start(controller) {
        controller.enqueue(text);
        controller.close();
      },
    });
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 4096,
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`Grok stream error ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") { controller.close(); return; }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices[0]?.delta?.content;
          if (delta) controller.enqueue(delta);
        } catch { /* skip malformed */ }
      }
    },
  });
}
