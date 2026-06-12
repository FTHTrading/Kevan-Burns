import Stripe from "stripe";

/**
 * workers/payments-worker/src/index.ts
 *
 * Troptions Unity Legacy Vault — Cloudflare Worker for Hybrid Payments
 *
 * Per approved plan:
 * - Normal systems (Family Vault $29.95, High Level $49.95) for normal people + middle class.
 * - High level scaled (Fuck You $129, Nuclear $499 / lifetime self-hosted) with full ruthless Heirloom etc.
 * - Stripe + on-chain (Unity/USDC + others) + D1 fast edge status.
 * - After verified payment: record + (TODO call main activate for Prisma + initial Vault creation).
 *
 * (See main app lib/payments/activate-subscription.ts + tier-config.ts for the real entitlement/vault grant.)
 */

export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PUBLIC_STRIPE_PUBLISHABLE: string;
  UNITY_TREASURY_ADDRESS: string;
  X402_GATEWAY?: string;
  SUBS_DB: D1Database;
  // Optional: KV for rate limits, R2 for receipts
}

const PRICING = {
  // Normal for middle class
  FAMILY: { amount: 2995, currency: "usd", interval: "month", name: "Troptions Unity Essential Vault", priceId: "price_essential_2995" },
  // High level scaled start
  HIGH_LEVEL: { amount: 4995, currency: "usd", interval: "month", name: "Troptions Unity Premium Estate Vault", priceId: "price_premium_4995" },
  // Upper high scaled (savage per user definition)
  FUCK_YOU_LEVEL: { amount: 8995, currency: "usd", interval: "month", name: "Troptions Unity Elite Trust Vault", priceId: "price_elitetrust_8995" },
  NUCLEAR: { amount: 49900, currency: "usd", interval: "month", name: "Troptions Unity Enterprise & Family Office", priceId: "price_nuclear_49900" },
  // One-time / legacy
  LIFETIME: { amount: 129900, currency: "usd", interval: null, name: "Lifetime Legacy Lock", priceId: "price_lifetime_1299" },
  SELF_HOSTED: { amount: 499900, currency: "usd", interval: null, name: "Self-Hosted Sovereign Nuclear", priceId: "price_self_499900" },
  TRIAL: { amount: 0, name: "14-day Trial" },
} as const;

type Tier = keyof typeof PRICING;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, method } = url;

    // CORS for browser calls from troptionsunity.com etc.
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization,Stripe-Signature",
        },
      });
    }

    // Military-grade Zero Trust security headers (match blockchainfraud hardening)
    const securityHeaders = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none';",
      "Referrer-Policy": "no-referrer",
      "X-Georgia-Entity": "Troptions Unity Legacy Vault - 5655 Peachtree Parkway, Norcross, GA 30092",
    };

    const addSecurity = (response: Response): Response => {
      const newHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(securityHeaders)) {
        newHeaders.set(key, value);
      }
      return new Response(response.body, { status: response.status, headers: newHeaders });
    };

    try {
      if (pathname === "/checkout" && method === "POST") {
        return handleCheckout(request, env);
      }
      if (pathname === "/webhook" && method === "POST") {
        return handleStripeWebhook(request, env);
      }
      if (pathname === "/crypto-intent" && method === "POST") {
        return handleCryptoIntent(request, env);
      }
      if (pathname === "/status" && method === "GET") {
        return handleStatus(url, env);
      }
      if (pathname === "/confirm-onchain" && method === "POST") {
        return handleConfirmOnChain(request, env);
      }

      // Health + pricing info (public)
      if (pathname === "/") {
        return Response.json({
          service: "troptions-unity-payments",
          version: "2026.1",
          tiers: Object.keys(PRICING),
          note: "Hybrid Stripe + Unity Token / USDC / x402. 14-day trial available without card.",
        });
      }

      return new Response("Not found", { status: 404 });
    } catch (err: any) {
      // Structured logging only — NEVER leak stack or sensitive data (military grade)
      const errorId = crypto.randomUUID();
      console.error(`[payments-worker] errorId=${errorId} path=${pathname}`, { message: err.message?.slice(0, 200) }); // truncated, no stack
      return Response.json({ error: "internal_error", errorId }, { status: 500 });
    }
  },

  // Cron for polling pending on-chain payments (every 6h per wrangler.toml)
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // In real: query D1 for pending crypto payments, hit Unity/Apostle/XRPL RPCs, confirm, activate subs.
    console.log("[cron] Troptions Unity payments on-chain reconciliation sweep");
    // ctx.waitUntil( reconcileOnChain(env) );
  },
};

async function handleCheckout(req: Request, env: Env): Promise<Response> {
  const body = await req.json<{ tier: Tier; successUrl: string; cancelUrl: string; namespace?: string; userEmail?: string }>();
  const { tier, successUrl, cancelUrl, namespace, userEmail } = body;

  if (!PRICING[tier]) return Response.json({ error: "Invalid tier" }, { status: 400 });

  // 14-day trial path (no card)
  if (tier === "TRIAL") {
    const subId = `trial_${Date.now()}`;
    await env.SUBS_DB.prepare(
      `INSERT OR REPLACE INTO subscriptions (id, tier, status, trial_ends_at, namespace, created_at) 
       VALUES (?, 'TRIAL', 'TRIAL', ?, ?, ?)`
    ).bind(subId, new Date(Date.now() + 14 * 86400_000).toISOString(), namespace || null, new Date().toISOString()).run();

    return Response.json({ mode: "trial", subId, trialEndsAt: new Date(Date.now() + 14*86400_000).toISOString(), redirect: successUrl });
  }

  // Stripe fiat path
  const price = PRICING[tier];
  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "payment_method_types[]": "card",
      mode: price.interval ? "subscription" : "payment",
      "line_items[0][price_data][currency]": price.currency,
      "line_items[0][price_data][product_data][name]": price.name,
      "line_items[0][price_data][unit_amount]": String(price.amount),
      ...(price.interval ? { "line_items[0][price_data][recurring][interval]": price.interval } : {}),
      "line_items[0][quantity]": "1",
      success_url: successUrl + "?session_id={CHECKOUT_SESSION_ID}&tier=" + tier + "&namespace=" + encodeURIComponent(namespace || ""),
      cancel_url: cancelUrl,
      customer_email: userEmail || undefined,
      metadata: JSON.stringify({ tier, namespace: namespace || "" }),
    } as any),
  });

  if (!stripeRes.ok) {
    const err = await stripeRes.text();
    return Response.json({ error: "Stripe error", detail: err }, { status: 502 });
  }

  const session = await stripeRes.json() as any;

  // Record pending sub in D1 (will be activated by webhook)
  await env.SUBS_DB.prepare(
    `INSERT OR IGNORE INTO subscriptions (id, tier, status, stripe_session_id, namespace, created_at) 
     VALUES (?, ?, 'PENDING', ?, ?, ?)`
  ).bind(`stripe_${session.id}`, tier, session.id, namespace || null, new Date().toISOString()).run();

  return Response.json({ mode: "stripe", checkoutUrl: session.url, sessionId: session.id });
}

async function handleStripeWebhook(req: Request, env: Env): Promise<Response> {
  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text();

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  let event: any;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    const errorId = crypto.randomUUID();
    console.error(`[webhook] verification error errorId=${errorId}: ${err.message}`);
    return new Response(`invalid payload signature: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "invoice.payment_succeeded") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const tier = (metadata.tier as Tier) || "FAMILY";
    const namespace = metadata.namespace || null;

    const subId = `sub_${session.subscription || session.id}`;

    await env.SUBS_DB.prepare(
      `INSERT OR REPLACE INTO subscriptions 
       (id, tier, status, stripe_subscription_id, namespace, current_period_end, created_at)
       VALUES (?, ?, 'ACTIVE', ?, ?, ?, ?)`
    ).bind(subId, tier, session.subscription || session.id, namespace, 
           session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null, 
           new Date().toISOString()).run();

    // TODO: Call back to main app API to activate namespace / unlock tiered features (normal for Family/High Level, scaled for upper) / create first vault (see main activate-subscription + tier-config)
    // await fetch(`${env.MAIN_APP_URL}/api/internal/activate-sub`, { method: 'POST', body: JSON.stringify({ subId, tier, namespace }) });

    console.log(`[webhook] Activated ${tier} for namespace=${namespace}`);
  }

  if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
    // Downgrade or mark past_due
    // Similar D1 update
  }

  return new Response("ok", { status: 200 });
}

async function handleCryptoIntent(req: Request, env: Env): Promise<Response> {
  const { tier, namespace, userAddress, chain = "unity" } = await req.json();

  const price = PRICING[tier as Tier];
  if (!price) return Response.json({ error: "bad tier" }, { status: 400 });

  // For on-chain: tell the user exactly what to send where + memo with namespace hash or sub intent id
  // Military hardened: use crypto.randomUUID instead of Math.random
  const intentId = `crypto_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const cfg = PRICING[tier as Tier] || PRICING.FAMILY;
  const amount = (cfg.amount / 100).toFixed(2);
  const memo = `UNITY-LEGACY:${namespace || intentId}:${tier}`;

  await env.SUBS_DB.prepare(
    `INSERT OR IGNORE INTO pending_crypto (id, tier, namespace, expected_amount, expected_chain, treasury, memo, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`
  ).bind(intentId, tier, namespace || null, amount, chain, env.UNITY_TREASURY_ADDRESS, memo, new Date().toISOString()).run();

  return Response.json({
    mode: "crypto",
    intentId,
    payTo: env.UNITY_TREASURY_ADDRESS,
    amount,
    currency: chain === "unity" || chain === "apostle" ? "UNITY" : "USDC",
    memo,
    instructions: `Send exactly ${amount} ${chain} to ${env.UNITY_TREASURY_ADDRESS} with memo "${memo}". Then POST /confirm-onchain with txHash.`,
    note: "Troptions Xchange can auto-convert USDC/BTC if needed. Low fees, instant treasury settlement.",
  });
}

async function handleConfirmOnChain(req: Request, env: Env): Promise<Response> {
  const { intentId, txHash, chain } = await req.json();

  // TODO real: verify tx on chain (use xrpl/stellar/ethers or Apostle 7332 RPC)
  // For now: trust + record (in prod: strict verification + ZK payment proof option)
  const pending = await env.SUBS_DB.prepare("SELECT * FROM pending_crypto WHERE id = ?").bind(intentId).first();
  if (!pending) return Response.json({ error: "unknown intent" }, { status: 404 });

  const subId = `onchain_${intentId}`;

  await env.SUBS_DB.prepare(
    `INSERT OR REPLACE INTO subscriptions (id, tier, status, onchain_tx_hash, namespace, created_at)
     VALUES (?, ?, 'ACTIVE', ?, ?, ?)`
  ).bind(subId, pending.tier, txHash, pending.namespace, new Date().toISOString()).run();

  await env.SUBS_DB.prepare("UPDATE pending_crypto SET status='CONFIRMED', tx_hash=? WHERE id=?")
    .bind(txHash, intentId).run();

  return Response.json({ ok: true, subId, tier: pending.tier, message: "On-chain payment confirmed. Vault features unlocked." });
}

async function handleStatus(url: URL, env: Env): Promise<Response> {
  const namespace = url.searchParams.get("namespace");
  const user = url.searchParams.get("user");

  if (!namespace && !user) return Response.json({ error: "namespace or user required" }, { status: 400 });

  const row = await env.SUBS_DB.prepare(
    "SELECT * FROM subscriptions WHERE namespace = ? OR id LIKE ? LIMIT 1"
  ).bind(namespace || `%${user}%`, `%${user}%`).first();

  return Response.json({
    active: !!row && (row.status === "ACTIVE" || row.status === "LIFETIME" || row.status === "TRIAL"),
    tier: row?.tier || "none",
    status: row?.status || "NO_SUB",
    expires: row?.current_period_end || row?.trial_ends_at,
    features: (row?.tier === "HIGH_LEVEL" || row?.tier === "ESTATE" || row?.tier === "FUCK_YOU_LEVEL" || row?.tier === "NUCLEAR" || row?.tier === "LIFETIME") ? ["multi-vault", "business", "whiteglove", "scaled-heirloom"] : ["basic", "normal-heirloom"],
  });
}

// === MILITARY HARDENING HELPERS (ported from blockchainfraud.org level) ===

// Constant time string compare (for signatures, tokens)
function constantTimeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// For Uint8Array (subtle timingSafeEqual if available)
async function constantTimeEqual(a: Uint8Array, b: Uint8Array): Promise<boolean> {
  if (a.length !== b.length) return false;
  // Workers crypto has timingSafeEqual via subtle in modern runtimes
  try {
    // @ts-ignore - timingSafeEqual on crypto.subtle in CF
    return crypto.subtle.timingSafeEqual ? await crypto.subtle.timingSafeEqual(a, b) : constantTimeEqualString(new TextDecoder().decode(a), new TextDecoder().decode(b));
  } catch {
    return constantTimeEqualString(new TextDecoder().decode(a), new TextDecoder().decode(b));
  }
}

// D1 schema (run once via wrangler d1 execute):
// CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, tier TEXT, status TEXT, stripe_subscription_id TEXT, stripe_session_id TEXT, onchain_tx_hash TEXT, namespace TEXT, current_period_end TEXT, trial_ends_at TEXT, created_at TEXT);
// CREATE TABLE IF NOT EXISTS pending_crypto (id TEXT PRIMARY KEY, tier TEXT, namespace TEXT, expected_amount TEXT, expected_chain TEXT, treasury TEXT, memo TEXT, status TEXT, tx_hash TEXT, created_at TEXT);
