"use client";

import React, { useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";

interface Plan {
  plan: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  highlight: boolean;
}

interface PricingCardsProps {
  plans: Plan[];
}

export default function PricingCards({ plans }: PricingCardsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleX402Checkout(tier: string) {
    setLoading(tier + "-x402");
    try {
      const res = await fetch(`/api/payments/x402?tier=${tier.toUpperCase()}&method=usdc`);
      const data = await res.json();
      const q = data.quote;
      if (!q) throw new Error("No x402 quote");

      const tx = prompt(
        `Pay $${q.amountUsd} USDC on ${q.network}\n\nSend to:\n${q.payTo}\n\nThen paste your Polygon transaction hash:`
      );
      if (!tx) return;

      const verify = await fetch("/api/payments/x402", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tier.toUpperCase(), paymentTx: tx.trim(), method: "usdc" }),
      });
      const result = await verify.json();
      if (result.redirect) window.location.href = result.redirect;
      else alert(result.error || "Payment verification failed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "x402 checkout failed";
      alert(msg);
    } finally {
      setLoading(null);
    }
  }

  async function handleCheckout(tier: string, isTrial: boolean = false) {
    setLoading(tier);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: isTrial ? "TRIAL" : tier.toUpperCase(),
          method: "stripe",
          // namespace and email can be collected later in onboard
        }),
        // Note: success will go through /api/payments/success for verification then to vault/create
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.redirect) {
        window.location.href = data.redirect;
      } else if (data.mode === "crypto") {
        // For crypto, show alert or modal with payTo
        alert(`Crypto payment: Send ${data.amount} to ${data.payTo} with memo: ${data.memo}\n\n${data.instructions}`);
        // Optionally redirect to onboard with crypto flag
        window.location.href = `/onboard?plan=${tier.toLowerCase()}&crypto=1`;
      } else {
        // Fallback to onboard
        window.location.href = `/onboard?plan=${tier.toLowerCase()}`;
      }
    } catch (err: any) {
      const errorId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36);
      console.error(`[pricing-cards] checkout errorId=${errorId}`, { message: err.message?.slice(0, 100) }); // structured, no stack leak
      // Fallback
      window.location.href = `/onboard?plan=${tier.toLowerCase()}`;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={`grid gap-6 ${plans.length === 3 ? "md:grid-cols-3" : plans.length === 2 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
      {plans.map(({ plan, price, period, desc, features, cta, href, highlight }) => {
        const tierKey = plan.toUpperCase();
        // Use price or name for trial eligibility (supports essential / family plans)
        const isTrial = plan.toLowerCase().includes("family") || plan.toLowerCase().includes("essential") || price === "$29.95";

        return (
          <div
            key={plan}
            className={`rounded-3xl p-8 relative ${
              highlight
                ? "bg-estate-900 text-white border-2 border-amber-500 shadow-2xl shadow-estate-900/30 scale-[1.02]"
                : "bg-white border-2 border-warm-200 shadow-lg"
            }`}
          >
            {highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-estate-900 text-xs font-black px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${highlight ? "text-amber-400" : "text-amber-600"}`}>{plan}</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className={`text-5xl font-black ${highlight ? "text-white" : "text-estate-900"}`}>{price}</span>
              <span className={`text-base font-semibold ${highlight ? "text-estate-400" : "text-estate-400"}`}>{period}</span>
            </div>
            <p className={`text-sm mb-7 ${highlight ? "text-estate-400" : "text-estate-500"}`}>{desc}</p>
            <ul className="space-y-2.5 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${highlight ? "text-amber-400" : "text-emerald-500"}`} />
                  <span className={highlight ? "text-estate-300" : "text-estate-600"}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(plan, isTrial)}
              disabled={!!loading}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-black transition-all disabled:opacity-70 ${
                highlight
                  ? "bg-amber-500 hover:bg-amber-400 text-estate-900"
                  : "bg-estate-900 hover:bg-estate-800 text-white"
              }`}
            >
              {loading === plan ? "Processing..." : cta} <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-2 text-[10px] text-center opacity-60 space-y-1">
              <div>
                or pay with USDC via x402 on Polygon
                <button
                  onClick={() => handleX402Checkout(plan)}
                  className="ml-1 underline hover:no-underline font-semibold"
                  disabled={!!loading}
                >
                  (x402 USDC)
                </button>
              </div>
              <div>
                Unity Token / on-chain
                <button
                  onClick={() => handleCheckout(plan, false)}
                  className="ml-1 underline hover:no-underline"
                  disabled={!!loading}
                >
                  (crypto option)
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center mt-1 opacity-50">No credit card for 14-day trial. Cancel anytime.</p>
          </div>
        );
      })}
    </div>
  );
}
