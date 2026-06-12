export const runtime = 'edge';

/**
 * GET /api/agents
 *
 * Returns the MCP-style agent registry for Legacy Vault Protocol.
 * Lists all specialist agents, their tools, providers, and live status.
 */

import { NextResponse } from "next/server";
import {
  VAULT_AGENTS,
  getActiveAgents,
  type VaultAgent,
} from "@/lib/agents/mcp-registry";
import { checkMoltbotHealth } from "@/lib/agents/genesis-bridge";

export const dynamic = "force-dynamic";

async function resolveAgentStatus(agents: VaultAgent[]) {
  const moltbot = await checkMoltbotHealth();
  const grokConfigured = !!(process.env.GEMINI_API_KEY || process.env.XAI_API_KEY);
  const cfConfigured = !!process.env.CF_WORKERS_AI_TOKEN;

  return agents.map((agent) => {
    let live = agent.status === "active";

    if (agent.provider === "grok" && !grokConfigured) live = false;
    if (agent.provider === "cloudflare" && !cfConfigured && !grokConfigured) live = false;
    if (agent.provider === "moltbot" && !moltbot.live) live = false;

    return {
      ...agent,
      live,
      providerConfigured:
        agent.provider === "grok"
          ? grokConfigured
          : agent.provider === "cloudflare"
          ? cfConfigured
          : agent.provider === "moltbot"
          ? moltbot.live
          : true,
    };
  });
}

export async function GET() {
  const activeOnly = false;
  const base = activeOnly ? getActiveAgents() : VAULT_AGENTS;
  const agents = await resolveAgentStatus(base);

  const liveCount = agents.filter((a) => a.live).length;

  return NextResponse.json({
    registry: "legacy-vault-mcp",
    version: "1.0.0",
    totalAgents: agents.length,
    liveAgents: liveCount,
    pipeline: {
      name: "6-agent document pipeline",
      agents: [
        "document-extractor",
        "document-drafter",
        "compliance-reviewer",
        "document-reviewer",
        "executor-summarizer",
        "crypto-estate-agent",
      ],
    },
    agents,
    timestamp: new Date().toISOString(),
  });
}
