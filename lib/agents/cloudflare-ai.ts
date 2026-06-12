/**
 * lib/agents/cloudflare-ai.ts
 *
 * Cloudflare Workers AI integration for Legacy Vault Protocol.
 *
 * Used as:
 *  1. Backup AI provider when Grok is unavailable
 *  2. Edge-fast inference for quick tasks (compliance checks, summaries)
 *  3. Llama 3.3 70B for heavy document generation at lower cost
 *
 * Account:  07bcc4a189ef176261b818409c95891f
 * Token:    CF_WORKERS_AI_TOKEN
 * Endpoint: https://api.cloudflare.com/client/v4/accounts/{id}/ai/run/{model}
 *
 * Available models (used in LVP pipeline):
 *  @cf/meta/llama-3.3-70b-instruct-fp8-fast   — primary (fast 70B)
 *  @cf/meta/llama-3-8b-instruct                — lightweight tasks
 *  @cf/mistral/mistral-7b-instruct-v0.1        — compliance review
 *  @cf/deepseek-ai/deepseek-r1-distill-qwen-7b — legal reasoning
 */

const CF_BASE = "https://api.cloudflare.com/client/v4/accounts";

export type CFModel =
  | "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  | "@cf/meta/llama-3-8b-instruct"
  | "@cf/mistral/mistral-7b-instruct-v0.1"
  | "@cf/deepseek-ai/deepseek-r1-distill-qwen-7b"
  | "@cf/qwen/qwen1.5-14b-chat-awq";

export interface CFMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CFResponse {
  content: string;
  model: CFModel;
  provider: "cloudflare";
  latencyMs: number;
  mock?: boolean;
}

/**
 * Run inference via Cloudflare Workers AI.
 * Falls back to mock if CF_WORKERS_AI_TOKEN or CF_ACCOUNT_ID is not set.
 */
export async function cfAIChat(
  messages: CFMessage[],
  opts: {
    model?: CFModel;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<CFResponse> {
  const token     = process.env.CF_WORKERS_AI_TOKEN;
  const accountId = process.env.CF_ACCOUNT_ID;
  const model     = opts.model ?? "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  const start     = Date.now();

  if (!token || !accountId) {
    return {
      content:   "[CF Workers AI mock — set CF_WORKERS_AI_TOKEN + CF_ACCOUNT_ID]",
      model,
      provider:  "cloudflare",
      latencyMs: 0,
      mock:      true,
    };
  }

  const url = `${CF_BASE}/${accountId}/ai/run/${model}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      Authorization:   `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages,
      max_tokens:  opts.maxTokens   ?? 2048,
      temperature: opts.temperature ?? 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudflare Workers AI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.result?.response ?? data.result ?? "";

  return {
    content:   typeof content === "string" ? content : JSON.stringify(content),
    model,
    provider:  "cloudflare",
    latencyMs: Date.now() - start,
  };
}

/**
 * Quick compliance check — uses lightweight Mistral for speed.
 */
export async function cfComplianceCheck(documentText: string): Promise<string> {
  const result = await cfAIChat([
    {
      role: "system",
      content: "You are an estate law compliance specialist. Review the document for ESIGN, UETA, RUFADAA, and state law issues. List findings as JSON: [{severity, rule, description, recommendation}]",
    },
    {
      role: "user",
      content: documentText.slice(0, 2000),
    },
  ], {
    model:     "@cf/mistral/mistral-7b-instruct-v0.1",
    maxTokens: 512,
  });

  return result.content;
}

/**
 * Quick document summary — uses 8B model for speed and cost.
 */
export async function cfSummarize(documentText: string): Promise<string> {
  const result = await cfAIChat([
    {
      role: "system",
      content: "Create a plain-English summary of this estate document for an executor. Include key parties, main provisions, and a 5-item action checklist. Under 250 words.",
    },
    {
      role: "user",
      content: documentText.slice(0, 2500),
    },
  ], {
    model:     "@cf/meta/llama-3-8b-instruct",
    maxTokens: 400,
  });

  return result.content;
}

/**
 * Test the Workers AI connection.
 */
export async function testCFAI(): Promise<{
  live: boolean;
  model: string;
  latencyMs: number;
  response?: string;
  error?: string;
}> {
  try {
    const result = await cfAIChat([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user",   content: "Reply with: 'Cloudflare Workers AI is live on Legacy Vault Protocol.'" },
    ], { model: "@cf/meta/llama-3-8b-instruct", maxTokens: 24 });

    return {
      live:      !result.mock,
      model:     result.model,
      latencyMs: result.latencyMs,
      response:  result.content,
    };
  } catch (err) {
    return {
      live:      false,
      model:     "@cf/meta/llama-3-8b-instruct",
      latencyMs: 0,
      error:     String(err),
    };
  }
}
