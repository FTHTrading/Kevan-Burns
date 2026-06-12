export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { getStripePriceData, normalizeTier, getTierConfig } from "@/lib/payments/tier-config";

/**
 * Thin proxy / dev fallback for Troptions Unity payments.
 * Per plan: supports 4 tiers with *normal* names for low (Family/High Level for middle class)
 * + high level scaled (Fuck You / Nuclear) for upper. Reuses tier-config for prices + display.
 * In production on Cloudflare: calls the payments-worker. Local: direct Stripe.
 */

const WORKER_URL = process.env.PAYMENTS_WORKER_URL || "http://localhost:8787"; // wrangler dev for worker

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, method = "stripe", namespace, userEmail } = body;

  // Prefer dedicated worker if configured / in prod
  if (process.env.PAYMENTS_WORKER_URL || process.env.CF_PAGES) {
    const res = await fetch(`${WORKER_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, successUrl: `${req.nextUrl.origin}/api/payments/success`, cancelUrl: `${req.nextUrl.origin}/pricing`, namespace, userEmail }),
    });
    return NextResponse.json(await res.json());
  }

  // Dev fallback — direct Stripe (server)
  if (method === "stripe" || !method) {
    const stripe = (await import("stripe")).default;
    const s = new stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { apiVersion: "2024-06-20" as any });

    if (tier === "TRIAL") {
      return NextResponse.json({ mode: "trial", redirect: `/onboard?trial=1&namespace=${namespace || ""}` });
    }

    const canonical = normalizeTier(tier);
    const p = getStripePriceData(canonical);

    const session = await s.checkout.sessions.create({
      mode: p.recurring ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: p.name },
          unit_amount: p.amount,
          ...(p.recurring ? { recurring: p.recurring } : {}),
        },
        quantity: 1,
      }],
      success_url: `${req.nextUrl.origin}/api/payments/success?session_id={CHECKOUT_SESSION_ID}&tier=${canonical}&namespace=${encodeURIComponent(namespace || "")}`,
      cancel_url: `${req.nextUrl.origin}/pricing`,
      metadata: { tier: canonical, namespace: namespace || "" },
    });

    return NextResponse.json({ mode: "stripe", checkoutUrl: session.url, sessionId: session.id });
  }

  // Crypto path — return intent (worker does the real one). Tier normalized for correct pricing + memo.
  const canonical = normalizeTier(tier);
  const cfg = getTierConfig(canonical);
  const amount = (cfg.priceCents / 100).toFixed(2);
  return NextResponse.json({
    mode: "crypto",
    payTo: process.env.UNITY_TREASURY || "0x7d9a65d06dcc435a52D5880C6310Bd6E96c156DB",
    amount,
    memo: `UNITY-LEGACY:${namespace || "anon"}:${canonical}`,
    instructions: "Send exact amount with memo. Then call /api/payments/confirm-onchain with tx.",
  });
  } catch (err: any) {
    const errorId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36);
    console.error(`[payments-checkout] errorId=${errorId}`, { message: err.message?.slice(0,100) });
    return NextResponse.json({ error: "internal_error", errorId }, { status: 500 });
  }
}
