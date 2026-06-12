export const runtime = 'edge';

/**
 * GET  /api/payments/x402?tier=FAMILY&method=usdc — payment quote
 * POST /api/payments/x402 — verify payment tx, return onboard redirect
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSubscriptionX402Quote,
  verifySubscriptionX402Payment,
  isX402Live,
} from "@/lib/x402/gateway";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rawTier = req.nextUrl.searchParams.get("tier") || "FAMILY";
  const tier = require("@/lib/payments/tier-config").normalizeTier(rawTier); // ensure consistent for gateway
  const method = (req.nextUrl.searchParams.get("method") || "usdc") as "usdc" | "atp";

  const quote = await getSubscriptionX402Quote(tier, method);

  return NextResponse.json({
    ok: true,
    live: isX402Live(),
    quote,
    config: "/api/payments/x402",
    verify: "POST with { tier, paymentTx, method }",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tier = require("@/lib/payments/tier-config").normalizeTier(body.tier || "FAMILY");
    const paymentTx = body.paymentTx || body.txHash || "";
    const method = (body.method || "usdc") as "usdc" | "atp";

    if (tier === "TRIAL") {
      return NextResponse.json({
        ok: true,
        redirect: `/onboard?trial=1&plan=${tier.toLowerCase()}`,
      });
    }

    const verify = await verifySubscriptionX402Payment({ tier, paymentTx, method });

    if (!verify.valid) {
      return NextResponse.json(
        { ok: false, error: verify.message },
        { status: 402 }
      );
    }

    return NextResponse.json({
      ok: true,
      paid: true,
      method,
      tier,
      message: verify.message,
      settlementTx: verify.settlementTx,
      redirect: `/onboard?plan=${tier.toLowerCase()}&x402=1&tx=${encodeURIComponent(paymentTx.slice(0, 66))}`,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "x402 verify failed" },
      { status: 500 }
    );
  }
}
