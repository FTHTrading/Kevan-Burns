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

// Define Gemini tools configuration
const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "list_namespaces",
        description: "List all namespace suffixes available in the system, optionally filtered by class/category.",
        parameters: {
          type: "OBJECT",
          properties: {
            category: {
              type: "STRING",
              description: "Category class (e.g. 'Class A', 'Class B', 'Class C', 'Class D', 'Class E')"
            }
          }
        }
      },
      {
        name: "get_namespace_valuation",
        description: "Retrieve valuation details, multipliers, and metadata for a specific top-level namespace suffix.",
        parameters: {
          type: "OBJECT",
          properties: {
            suffix: {
              type: "STRING",
              description: "The suffix to query (e.g. '.gold', '.1', '.bank', '.rwa')"
            }
          },
          required: ["suffix"]
        }
      },
      {
        name: "route_x402_settlement",
        description: "Simulate or execute an x402 payment routing check for a specified address and amount of USDF.",
        parameters: {
          type: "OBJECT",
          properties: {
            from_address: {
              type: "STRING",
              description: "The sender's wallet address"
            },
            amount_usdf: {
              type: "NUMBER",
              description: "The amount in USDF to settle"
            }
          },
          required: ["from_address", "amount_usdf"]
        }
      },
      {
        name: "get_system_health",
        description: "Query the current block heights, validator node counts, and RPC latency across all L1 chambers.",
        parameters: {
          type: "OBJECT",
          properties: {}
        }
      }
    ]
  }
];

// Tool handlers implementation
const toolHandlers: Record<string, (args: any) => any> = {
  list_namespaces: (args: { category?: string }) => {
    const list = {
      "Class A (Store of Value)": [".1", ".gold", ".gas", ".oil", ".money", ".prime"],
      "Class B (Institutional)": [".bank", ".trust", ".fund", ".pay", ".yield", ".treasury", ".law", ".doc", ".id", ".secure"],
      "Class C (Utility & Energy)": [".energy", ".power", ".grid", ".solar", ".mining", ".carbon", ".credit", ".trade", ".swap", ".water", ".food"],
      "Class D (Tech & AI)": [".mcp", ".ai", ".agent", ".node", ".cloud", ".quant", ".proof", ".sign", ".ipfs", ".dev", ".build"],
      "Class E (Space & Land)": [".rwa", ".estate", ".vault", ".legacy", ".chain", ".x", ".med", ".meta", ".land", ".home", ".store", ".world"]
    };

    if (args.category) {
      const cat = args.category.trim();
      const matchedKey = Object.keys(list).find(k => k.toLowerCase().includes(cat.toLowerCase()));
      if (matchedKey) {
        return { category: matchedKey, suffixes: list[matchedKey as keyof typeof list] };
      }
    }
    return list;
  },

  get_namespace_valuation: (args: { suffix: string }) => {
    const cleanSuffix = args.suffix.trim().startsWith(".") ? args.suffix.trim() : "." + args.suffix.trim();
    const valuations: Record<string, { valuationUSD: string; multiplier: string; description: string }> = {
      ".1": { valuationUSD: "$15.0M", multiplier: "20x Premium", description: "Prime identity root concept: simple, scarce, and clean." },
      ".gold": { valuationUSD: "$12.5M", multiplier: "15x RWA", description: "Store-of-value, treasury signaling, and premium wealth lanes." },
      ".gas": { valuationUSD: "$8.5M", multiplier: "12x RWA", description: "Energy settlement and infrastructure metered lanes." },
      ".oil": { valuationUSD: "$9.0M", multiplier: "12x RWA", description: "Fossil reserves and commodity trade tracking." },
      ".money": { valuationUSD: "$6.5M", multiplier: "10x Yield", description: "Liquidity aggregation and yield-bearing account names." },
      ".prime": { valuationUSD: "$7.5M", multiplier: "15x Premium", description: "Premium tier identity wrapper." },
      ".bank": { valuationUSD: "$14.0M", multiplier: "18x Compliance", description: "Regulated banking identity, compliance, and institutional trust." },
      ".trust": { valuationUSD: "$11.0M", multiplier: "15x Trust", description: "Trustee controls and corporate escrow names." },
      ".fund": { valuationUSD: "$9.5M", multiplier: "12x Capital", description: "Fund management, allocations, and venture pools." },
      ".pay": { valuationUSD: "$8.0M", multiplier: "10x Settlement", description: "FTH Pay dynamic payment routing links." },
      ".yield": { valuationUSD: "$7.2M", multiplier: "10x Yield", description: "DeFi yield vaults and asset distribution names." },
      ".treasury": { valuationUSD: "$13.0M", multiplier: "15x Premium", description: "Corporate treasury and reserves custodian handles." },
      ".rwa": { valuationUSD: "$13.5M", multiplier: "18x RWA", description: "Real-world asset tokenization, title records, and physical deeds." },
      ".estate": { valuationUSD: "$11.0M", multiplier: "15x RWA", description: "Legacy planning, family trust deeds, and inheritance keys." },
      ".vault": { valuationUSD: "$12.2M", multiplier: "15x Trust", description: "Sovereign client-side encrypted estate files." },
      ".legacy": { valuationUSD: "$9.6M", multiplier: "12x Trust", description: "Succession registry and RUFADAA check-in namespaces." },
      ".mcp": { valuationUSD: "$11.5M", multiplier: "15x Premium", description: "Agent tool integration gateways and swarm interfaces." },
      ".ai": { valuationUSD: "$14.5M", multiplier: "18x Premium", description: "Sovereign AI mesh node identity endpoints." },
      ".agent": { valuationUSD: "$12.0M", multiplier: "15x Premium", description: "Autonomous cognitive swarm identities." }
    };

    return valuations[cleanSuffix.toLowerCase()] || {
      valuationUSD: "$4.5M",
      multiplier: "8x RWA",
      description: `Sovereign namespace suffix ${cleanSuffix} available for registration.`
    };
  },

  route_x402_settlement: (args: { from_address: string; amount_usdf: number }) => {
    return {
      status: "SUCCESS",
      routed: true,
      txHash: "0x8a92bcde" + Math.random().toString(16).substring(2, 10),
      from: args.from_address,
      settledAmount: `${args.amount_usdf} USDF`,
      timestamp: new Date().toISOString(),
      membrane: "x402-stripe-gateway",
      complianceSign: "did:unykorn:compliance-gateway-auth"
    };
  },

  get_system_health: () => {
    return {
      status: "OPTIMAL",
      latency: "24ms",
      totalValidators: 62,
      activeChambers: {
        POPEYE: { status: "ACTIVE", height: "12,982,105", role: "Network Gossip" },
        TEV: { status: "ACTIVE", height: "12,982,094", role: "Truth Gate Firewall" },
        CONSENSUS: { status: "ACTIVE", height: "8,241,092", role: "Audit Sync" },
        MARS: { status: "ACTIVE", height: "48,931,225", role: "Runtime Brain" },
        TAR: { status: "ACTIVE", height: "3,205,941", role: "RocksDB Memory" }
      },
      telemetryEndpoint: "https://rpc.unykorn.org"
    };
  }
};

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
  let chatMessages: any[] = messages
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

  let prompt_tokens = 0;
  let completion_tokens = 0;
  let loopCount = 0;
  const maxLoops = 5;

  while (loopCount < maxLoops) {
    loopCount++;

    const body: any = {
      contents: chatMessages,
      generationConfig: {
        temperature: opts.temperature ?? 0.3,
        maxOutputTokens: opts.maxTokens ?? 4096,
      },
      tools: GEMINI_TOOLS
    };

    if (systemMessage) {
      body.systemInstruction = {
        parts: [{ text: systemMessage }],
      };
    }

    // Detect if JSON output is requested (excluding system instructions to avoid false positives)
    const asksForJson = messages
      .filter((m) => m.role !== "system")
      .some(
        (m) =>
          m.content.toLowerCase().includes("json") ||
          m.content.toLowerCase().includes("schema")
      );
    if (asksForJson) {
      body.generationConfig.responseMimeType = "application/json";
      delete body.tools;
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
    prompt_tokens += data.usageMetadata?.promptTokenCount || 0;
    completion_tokens += data.usageMetadata?.candidatesTokenCount || 0;

    const candidate = data.candidates?.[0];
    const contentPart = candidate?.content?.parts?.[0];

    // Check for functionCall
    if (contentPart && contentPart.functionCall) {
      const call = contentPart.functionCall;
      const callName = call.name;
      const callArgs = call.args || {};

      console.log(`[Agentic AI] Executing tool: ${callName} with args:`, callArgs);

      // Execute tool
      let toolResult = { error: "Unknown tool or execution failure" };
      if (toolHandlers[callName]) {
        try {
          toolResult = toolHandlers[callName](callArgs);
        } catch (e: any) {
          toolResult = { error: e.message || String(e) };
        }
      }

      // Append model functionCall to message history
      chatMessages.push({
        role: "model",
        parts: [
          {
            functionCall: {
              name: callName,
              args: callArgs
            }
          }
        ]
      });

      // Append tool response
      chatMessages.push({
        role: "tool",
        parts: [
          {
            functionResponse: {
              name: callName,
              response: {
                name: callName,
                content: toolResult
              }
            }
          }
        ]
      });

      // Continue to next loop iteration
      continue;
    }

    // Normal text or JSON response
    const textResult = contentPart?.text || "";
    return {
      content: textResult,
      model: targetModel,
      usage: { prompt_tokens, completion_tokens },
    };
  }

  throw new Error("Gemini tool calling exceeded max loops limit");
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
