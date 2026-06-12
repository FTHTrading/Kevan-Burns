/**
 * lib/x402/gateway.ts
 *
 * Production x402 gateway for Legacy Vault — Moltbot USDC (Polygon) + ATP (Apostle 7332).
 */

import { getMoltbotPricing } from "@/lib/agents/genesis-bridge";

export interface X402PaymentQuote {
  serviceId: string;
  tier?: string;
  amountUsd: string;
  amountUsdcAtomic?: number;
  currency: "USDC" | "ATP" | "USDF";
  payTo: string;
  network: string;
  moltbotAction?: string;
  instructions: string[];
  x402Version: number;
  gateway: "moltbot" | "apostle" | "local";
}

export interface X402VerifyResult {
  valid: boolean;
  message: string;
  settlementTx?: string;
}

const APOSTLE_CHAIN = 7332;
// Extended for 4 tiers (normal low + high level scaled upper). Amounts in atomic (USDC 6 decimals) or string.
const TIER_USDC: Record<string, number> = {
  FAMILY: 29_950_000, // $29.95 normal for middle class
  HIGH_LEVEL: 49_950_000,
  FUCK_YOU_LEVEL: 129_950_000,
  NUCLEAR: 499_950_000,
  ESTATE: 49_950_000, // legacy compat -> HIGH_LEVEL pricing
  TRIAL: 0,
};

const TIER_ATP: Record<string, string> = {
  FAMILY: "29.95",
  HIGH_LEVEL: "49.95",
  FUCK_YOU_LEVEL: "129.95",
  NUCLEAR: "499.95",
  ESTATE: "49.95",
  TRIAL: "0",
};

export async function getSubscriptionX402Quote(
  tier: string,
  method: "usdc" | "atp" = "usdc"
): Promise<X402PaymentQuote> {
  const tierKey = tier.toUpperCase();

  if (method === "atp") {
    const wallet = process.env.X402_PROVIDER_WALLET || process.env.APOSTLE_AGENT_WALLET || "";
    const atpAmount = TIER_ATP[tierKey] || TIER_ATP.FAMILY;
    return {
      serviceId: "SUBSCRIPTION",
      tier: tierKey,
      amountUsd: atpAmount,
      currency: "ATP",
      payTo: wallet.startsWith("agent:") ? wallet : wallet ? `agent:${wallet}` : "agent:CONFIGURE_WALLET",
      network: `Apostle Chain (${APOSTLE_CHAIN})`,
      instructions: [
        `Send ${atpAmount} ATP on Apostle Chain (${APOSTLE_CHAIN})`,
        `Memo: lvp:sub:${tierKey.toLowerCase()}`,
        "POST /api/payments/x402 with { tier, paymentTx, method: 'atp' }",
      ],
      x402Version: 1,
      gateway: "apostle",
    };
  }

  const pricing = await getMoltbotPricing();
  const payTo = pricing?.payTo || process.env.UNITY_TREASURY || "0xe2f2A50Fe9F6d8136A06B1166f9E34e08c54D57A";
  const vaultPrice = pricing?.pricing?.VAULT_MANAGE;

  const usdDisplay = TIER_USDC[tierKey] ? (TIER_USDC[tierKey] / 1_000_000).toFixed(2) : "29.95";

  return {
    serviceId: "SUBSCRIPTION",
    tier: tierKey,
    amountUsd: usdDisplay,
    amountUsdcAtomic: TIER_USDC[tierKey] || TIER_USDC.FAMILY,
    currency: "USDC",
    payTo,
    network: pricing?.network || "Polygon Mainnet (137)",
    moltbotAction: "VAULT_MANAGE",
    instructions: [
      `Send $${usdDisplay} USDC to ${payTo} on Polygon`,
      "Do NOT send to the x402 adapter contract — treasury wallet only",
      "POST /api/payments/x402 with { tier, paymentTx, method: 'usdc' }",
      vaultPrice ? `Moltbot VAULT_MANAGE metered rate: ${vaultPrice.usdDisplay}` : "",
    ].filter(Boolean),
    x402Version: 1,
    gateway: pricing ? "moltbot" : "local",
  };
}

export async function verifySubscriptionX402Payment(opts: {
  tier: string;
  paymentTx: string;
  method: "usdc" | "atp";
}): Promise<X402VerifyResult> {
  const { tier, paymentTx, method } = opts;

  if (!paymentTx || paymentTx.length < 8) {
    return { valid: false, message: "Missing payment transaction hash" };
  }

  if (method === "atp") {
    const apostleUrl = (process.env.APOSTLE_URL || process.env.X402_APOSTLE_URL || "https://apostle.unykorn.org").replace(/\/$/, "");
    const wallet = (process.env.X402_PROVIDER_WALLET || "").replace("agent:", "");
    if (!wallet) return { valid: false, message: "ATP wallet not configured" };

    try {
      const res = await fetch(`${apostleUrl}/v1/receipts?to=${wallet}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return { valid: false, message: `Apostle chain error ${res.status}` };
      const data = (await res.json()) as { receipts?: Array<{ tx_hash: string }> };
      const norm = (h: string) => h.replace(/^0x/, "").toLowerCase();
      const found = (data.receipts ?? []).some((r) => norm(r.tx_hash) === norm(paymentTx));
      return found
        ? { valid: true, message: "ATP payment verified on Apostle Chain" }
        : { valid: false, message: "ATP receipt not found — confirm memo lvp:sub:" + tier.toLowerCase() };
    } catch (e) {
      return { valid: false, message: e instanceof Error ? e.message : "Apostle verification failed" };
    }
  }

  const quote = await getSubscriptionX402Quote(tier, "usdc");
  const minAtomic = BigInt(TIER_USDC[tier.toUpperCase()] || TIER_USDC.FAMILY); // tier may be raw, map happens in caller too

  if (!process.env.MOLTBOT_GATEWAY_URL && process.env.NODE_ENV !== "production") {
    return {
      valid: true,
      message: "Dev mode — USDC tx recorded (set MOLTBOT_GATEWAY_URL for live Polygon verify)",
    };
  }

  try {
    const { ethers } = await import("ethers");
    const rpc =
      process.env.POLYGON_RPC_URL ||
      process.env.CHAIN_RPC_URL ||
      "https://polygon-bor-rpc.publicnode.com";
    const provider = new ethers.JsonRpcProvider(rpc);
    const receipt = await provider.getTransactionReceipt(paymentTx);
    if (!receipt || receipt.status !== 1) {
      return { valid: false, message: "Transaction not found or reverted on Polygon" };
    }

    const usdc = process.env.USDC_POLYGON || "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
    const iface = new ethers.Interface([
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]);
    const payTo = quote.payTo.toLowerCase();

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== usdc.toLowerCase()) continue;
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === "Transfer" && parsed.args[1].toLowerCase() === payTo) {
          if (BigInt(parsed.args[2]) >= minAtomic) {
            return { valid: true, message: "USDC payment verified on Polygon" };
          }
          return { valid: false, message: "Insufficient USDC amount" };
        }
      } catch {
        /* skip non-transfer logs */
      }
    }
    return { valid: false, message: `No USDC transfer to treasury ${quote.payTo} in this tx` };
  } catch (e) {
    return { valid: false, message: e instanceof Error ? e.message : "Polygon verification failed" };
  }
}

export function isX402Live(): boolean {
  return !!(process.env.MOLTBOT_GATEWAY_URL || process.env.X402_PROVIDER_WALLET);
}
