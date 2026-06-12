export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { activateSubscriptionAfterPayment } from "@/lib/payments/activate-subscription";
import { prisma } from "@/lib/db";
import { PlanTier, SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20" as any,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("[Stripe Webhook] Missing signature or webhook secret configuration");
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const sessionOrInvoice = event.data.object as any;

  // 1. Handle Successful Purchases or Subscriptions
  if (event.type === "checkout.session.completed" || event.type === "invoice.payment_succeeded") {
    const metadata = sessionOrInvoice.metadata || {};
    const tier = metadata.tier || "FAMILY";
    const namespace = metadata.namespace;

    if (namespace) {
      try {
        await activateSubscriptionAfterPayment({
          tier,
          namespace,
          userEmail: sessionOrInvoice.customer_details?.email || sessionOrInvoice.customer_email || undefined,
          provider: "STRIPE",
          paymentRef: sessionOrInvoice.subscription || sessionOrInvoice.id,
          isLifetime: tier === "LIFETIME_LEGACY_LOCK",
        });
        console.log(`[Stripe Webhook] Successfully activated/renewed tier ${tier} for namespace ${namespace}`);
      } catch (err: any) {
        console.error(`[Stripe Webhook] Activation failed: ${err.message}`);
        return NextResponse.json({ error: "Activation failed", details: err.message }, { status: 500 });
      }
    } else {
      console.warn("[Stripe Webhook] Payment received without namespace metadata; skipping entitlement provisioning.");
    }
  }

  // 2. Handle Subscription Failures or Cancellations
  if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
    const subscriptionId = sessionOrInvoice.id || sessionOrInvoice.subscription;

    if (subscriptionId) {
      try {
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (sub) {
          const newStatus = event.type === "customer.subscription.deleted"
            ? SubscriptionStatus.CANCELLED
            : SubscriptionStatus.PAST_DUE;

          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: newStatus },
          });

          console.log(`[Stripe Webhook] Updated subscription ${subscriptionId} status to ${newStatus}`);
        }
      } catch (err: any) {
        console.error(`[Stripe Webhook] Failed to update canceled/failed subscription status: ${err.message}`);
        return NextResponse.json({ error: "Status update failed", details: err.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
