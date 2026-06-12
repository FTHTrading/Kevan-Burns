export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { activateSubscriptionAfterPayment } from "@/lib/payments/activate-subscription";
import Stripe from "stripe";

/**
 * Payment success callback / verification.
 * Called after Stripe redirect with ?session_id=...
 * Verifies the payment server-side (using secret), activates sub + creates namespace/vault.
 * This finishes the "after pay, create their vault" flow.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const namespace = searchParams.get("namespace") || searchParams.get("ns");
  const tier = (searchParams.get("tier") as any) || "FAMILY";
  const userEmail = searchParams.get("email");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id required for Stripe success" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
      apiVersion: "2024-06-20" as any,
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "payment not confirmed", status: session.payment_status }, { status: 402 });
    }

    const metaTier = (session.metadata?.tier as any) || tier;
    const metaNs = session.metadata?.namespace || namespace;

    if (!metaNs) {
      return NextResponse.json({ error: "namespace not provided in metadata or query" }, { status: 400 });
    }

    const result = await activateSubscriptionAfterPayment({
      tier: metaTier,
      namespace: metaNs,
      userEmail: userEmail || session.customer_email || undefined,
      provider: "STRIPE",
      paymentRef: session.id,
      isLifetime: metaTier === "LIFETIME_LEGACY_LOCK" || metaTier === "LIFETIME_PRESALE",
    });

    // Redirect to vault create or dashboard with success
    const redirectUrl = new URL("/vault/create", req.url);
    redirectUrl.searchParams.set("paid", "1");
    redirectUrl.searchParams.set("namespace", metaNs);
    if (result.vaultId) redirectUrl.searchParams.set("vault", result.vaultId);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err: any) {
    console.error("[payments/success] verify failed", err);
    return NextResponse.json({ error: "verification_failed", details: err.message }, { status: 500 });
  }
}
