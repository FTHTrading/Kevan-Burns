/**
 * lib/agents/gemini-client.ts
 *
 * Google Gemini client for Legacy Vault Protocol AI pipeline.
 * Routes AI calls to gemini-2.5-flash for document generation, compliance review, and vault Q&A.
 *
 * Set GEMINI_API_KEY in .env to enable production AI.
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

const DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Chat completion via Google Gemini REST API.
 */
export async function grokChat(
  messages: GrokMessage[],
  opts: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<GrokResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.XAI_API_KEY;

  if (!apiKey) {
    // Dev mock — return structured placeholder
    return {
      content: "[MOCK — Set GEMINI_API_KEY to enable Gemini AI generation]\n\nThis is where the AI-generated document will appear. The system prompt and all field values have been prepared and would be sent to gemini-2.5-flash for full document generation.",
      model: "mock",
      usage: { prompt_tokens: 0, completion_tokens: 0 },
      mock: true,
    };
  }

  const modelName = opts.model || DEFAULT_MODEL;
  // Handle some legacy model overrides to stay safe
  const targetModel = modelName.startsWith("grok") ? DEFAULT_MODEL : modelName;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

  // Map messages format
  const systemMessage = messages.find((m) => m.role === "system")?.content || "";
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  if (chatMessages.length === 0 && systemMessage) {
    chatMessages.push({
      role: "user",
      parts: [{ text: "Proceed." }],
    });
  }

  const body: any = {
    contents: chatMessages,
    generationConfig: {
      temperature: opts.temperature ?? 0.3,
      maxOutputTokens: opts.maxTokens ?? 4096,
    },
  };

  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage }],
    };
  }

  // Detect if JSON output is requested
  const asksForJson = messages.some(
    (m) =>
      m.content.toLowerCase().includes("json") ||
      m.content.toLowerCase().includes("schema")
  );
  if (asksForJson) {
    body.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const prompt_tokens = data.usageMetadata?.promptTokenCount || 0;
  const completion_tokens = data.usageMetadata?.candidatesTokenCount || 0;

  return {
    content,
    model: targetModel,
    usage: { prompt_tokens, completion_tokens },
  };
}

/**
 * Stream a Gemini response token by token.
 * Returns a ReadableStream for Next.js streaming.
 */
export async function grokStream(
  messages: GrokMessage[],
  opts: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<ReadableStream<string>> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.XAI_API_KEY;

  if (!apiKey) {
    // Return mock stream
    const text = "[MOCK — Set GEMINI_API_KEY] Document generation would stream here...";
    return new ReadableStream({
      start(controller) {
        controller.enqueue(text);
        controller.close();
      },
    });
  }

  const modelName = opts.model || DEFAULT_MODEL;
  const targetModel = modelName.startsWith("grok") ? DEFAULT_MODEL : modelName;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const systemMessage = messages.find((m) => m.role === "system")?.content || "";
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  if (chatMessages.length === 0 && systemMessage) {
    chatMessages.push({
      role: "user",
      parts: [{ text: "Proceed." }],
    });
  }

  const body: any = {
    contents: chatMessages,
    generationConfig: {
      temperature: opts.temperature ?? 0.3,
      maxOutputTokens: opts.maxTokens ?? 4096,
    },
  };

  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage }],
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Gemini stream error ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer) {
          parseLines(buffer, controller);
        }
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      buffer = parseLines(buffer, controller);
    },
  });
}

function parseLines(buffer: string, controller: ReadableStreamDefaultController<string>): string {
  const lines = buffer.split("\n");
  const remaining = lines.pop() || "";

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;
    if (!cleanLine.startsWith("data: ")) continue;

    const dataStr = cleanLine.slice(6);
    if (dataStr === "[DONE]") {
      controller.close();
      return "";
    }

    try {
      const parsed = JSON.parse(dataStr);
      const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textChunk) {
        controller.enqueue(textChunk);
      }
    } catch {
      // ignore JSON parse errors on partial streams
    }
  }

  return remaining;
}
