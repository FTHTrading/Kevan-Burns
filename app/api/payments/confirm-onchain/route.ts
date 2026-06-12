export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { activateSubscriptionAfterPayment } from "@/lib/payments/activate-subscription";

// Success callback / confirm for on-chain (Unity/USDC etc).
// This is the critical piece: payment confirmed -> create namespace + vault entitlement.
export async function POST(req: NextRequest) {
  const { intentId, txHash, chain = "unity", namespace, userEmail, tier } = await req.json();

  if (!namespace) {
    return NextResponse.json({ error: "namespace required" }, { status: 400 });
  }

  // In real: verify tx on chain using adapters (xrpl/stellar/unity)
  // For now, trust the confirm (add real verify in prod)
  console.log("[payments] onchain confirm", { intentId, txHash, namespace });

  try {
    const result = await activateSubscriptionAfterPayment({
      tier: (tier || "FAMILY") as any, // accept from caller (worker / client); normalized inside activate + tier-config
      namespace,
      userEmail,
      provider: "UNITY_TOKEN",
      paymentRef: txHash,
    });

    return NextResponse.json({
      ok: true,
      subId: `onchain_${intentId}`,
      message: "Payment confirmed. Your Troptions Unity Legacy Vault namespace and initial vault are now active.",
      ...result,
    });
  } catch (err: any) {
    console.error("[confirm-onchain] activation failed", err);
    return NextResponse.json({ error: "activation_failed", details: err.message }, { status: 500 });
  }
}
