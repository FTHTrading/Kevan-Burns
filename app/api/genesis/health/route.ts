export const runtime = 'edge';

/**
 * GET /api/genesis/health
 *
 * Health check for Genesis Sentience Protocol integration:
 * Moltbot x402 gateway, GSP API worker, Polygon settlement adapter.
 */

import { NextResponse } from "next/server";
import { getGenesisBridgeStatus, getMoltbotPricing } from "@/lib/agents/genesis-bridge";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getGenesisBridgeStatus();
  const pricing = status.moltbot.live ? await getMoltbotPricing() : null;

  return NextResponse.json({
    integration: "genesis-sentience-protocol",
    timestamp: new Date().toISOString(),
    ...status,
    pricing: pricing
      ? {
          payTo: pricing.payTo,
          network: pricing.network,
          vaultManage: pricing.pricing?.VAULT_MANAGE?.usdDisplay,
          docGenerate: pricing.pricing?.DOC_GENERATE?.usdDisplay,
          aiCall: pricing.pricing?.AI_CALL?.usdDisplay,
        }
      : null,
    dashboard: "https://drunks.app",
    docs: "https://github.com/FTHTrading/genesis-sentience-protocol",
  });
}
