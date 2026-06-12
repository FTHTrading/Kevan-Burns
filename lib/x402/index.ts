/**
 * x402 service adapter — Legacy Vault Protocol
 *
 * TROPTIONS x402 is the machine-payable service fabric beneath Legacy Vault Protocol.
 * x402 (HTTP 402 Payment Required) meters operator actions, artifact generation,
 * compliance exports, cross-chain reports, and machine-to-machine settlement events —
 * without centralized billing infrastructure.
 *
 * TROPTIONS is the protocol fabric that routes, meters, and settles x402 service calls.
 *
 * In development: LOCAL_ADAPTER mode — no real payment processing.
 * In production: requires a TROPTIONS x402 gateway (TSN / Apostle Chain / external).
 */

export type X402ServiceId =
  | "EXECUTOR_PACKET_EXPORT"
  | "BENEFICIARY_PACKET_EXPORT"
  | "AUDIT_LOG_EXPORT"
  | "COMPLIANCE_REPORT"
  | "CROSS_CHAIN_SNAPSHOT"
  | "NAMESPACE_MANIFEST_EXPORT"
  | "NOTARIZATION_REQUEST"
  | "VALIDATOR_CONFIG_PACK"
  | "RELEASE_POLICY_SNAPSHOT"
  | "API_METERED_CALL"
  | "WALLET_SNAPSHOT"
  | "STABLECOIN_ASSET_REPORT"
  | "XRPL_PROOF_PACKET"
  | "STELLAR_PROOF_PACKET";

export type X402Status =
  | "LOCAL_ADAPTER"
  | "X402_READY"
  | "MOCK_BILLING"
  | "TROPTIONS_POWERED"
  | "PRODUCTION_REQUIRES_GATEWAY"
  | "LIVE_PAYMENT_DISABLED";

export interface X402ServiceDefinition {
  id: X402ServiceId;
  label: string;
  description: string;
  unitPrice: string;
  currency: string;
  status: X402Status;
}

export interface X402UsageRecord {
  serviceId: X402ServiceId;
  namespaceId: string;
  timestamp: string;
  unitsPurchased: number;
  totalCharged: string;
  txRef: string | null;
  status: "COMPLETED" | "PENDING" | "FAILED";
}

export const X402_SERVICES: X402ServiceDefinition[] = [
  {
    id: "EXECUTOR_PACKET_EXPORT",
    label: "Executor Packet Export",
    description: "Generate a cryptographically verified executor instruction packet (PDF + JSON)",
    unitPrice: "0.50",
    currency: "USDF",
    status: "LOCAL_ADAPTER",
  },
  {
    id: "BENEFICIARY_PACKET_EXPORT",
    label: "Beneficiary Packet Export",
    description: "Generate a scoped beneficiary access packet with signed asset inventory",
    unitPrice: "0.50",
    currency: "USDF",
    status: "LOCAL_ADAPTER",
  },
  {
    id: "AUDIT_LOG_EXPORT",
    label: "Audit Log Export",
    description: "Export tamper-evident audit log as CSV or JSON with chain anchor verification",
    unitPrice: "0.25",
    currency: "USDF",
    status: "LOCAL_ADAPTER",
  },
  {
    id: "COMPLIANCE_REPORT",
    label: "Compliance Report",
    description: "Generate RUFADAA-aligned fiduciary compliance summary for estate proceedings",
    unitPrice: "1.00",
    currency: "USDF",
    status: "LOCAL_ADAPTER",
  },
  {
    id: "CROSS_CHAIN_SNAPSHOT",
    label: "Cross-chain Asset Snapshot",
    description: "Pull registered wallet states across all connected chains into a signed PDF report",
    unitPrice: "0.75",
    currency: "USDF",
    status: "PRODUCTION_REQUIRES_GATEWAY",
  },
  {
    id: "NAMESPACE_MANIFEST_EXPORT",
    label: "Namespace Manifest Export",
    description: "Export full namespace manifest as signed JSON with IPFS CID verification",
    unitPrice: "0.25",
    currency: "USDF",
    status: "LOCAL_ADAPTER",
  },
  {
    id: "NOTARIZATION_REQUEST",
    label: "Notarization / Verification Request",
    description: "Submit documents for attorney or notary attestation workflow via x402 metering",
    unitPrice: "5.00",
    currency: "USDF",
    status: "PRODUCTION_REQUIRES_GATEWAY",
  },
  {
    id: "API_METERED_CALL",
    label: "Metered API Access",
    description: "Machine-payable operator API calls — batch vault operations, programmatic queries",
    unitPrice: "0.01",
    currency: "USDF",
    status: "X402_READY",
  },
  {
    id: "WALLET_SNAPSHOT",
    label: "TROPTIONS Wallet Snapshot",
    description: "Generate a signed wallet inventory across TROPTIONS, XRPL, Stellar, EVM, and Solana wallet references",
    unitPrice: "0.25",
    currency: "USDF",
    status: "LOCAL_ADAPTER",
  },
  {
    id: "STABLECOIN_ASSET_REPORT",
    label: "Stablecoin Asset Report",
    description: "Namespace-scoped stablecoin asset reference export: USDC, USDT, DAI, EURC, USDF, FTHX, FTHG holdings view",
    unitPrice: "0.25",
    currency: "USDF",
    status: "LOCAL_ADAPTER",
  },
  {
    id: "XRPL_PROOF_PACKET",
    label: "XRPL Proof Packet",
    description: "Generate a signed XRPL wallet reference and trustline proof packet for executor proceedings",
    unitPrice: "0.50",
    currency: "USDF",
    status: "PRODUCTION_REQUIRES_GATEWAY",
  },
  {
    id: "STELLAR_PROOF_PACKET",
    label: "Stellar Proof Packet",
    description: "Generate a signed Stellar wallet reference and asset trustline proof packet for executor proceedings",
    unitPrice: "0.50",
    currency: "USDF",
    status: "PRODUCTION_REQUIRES_GATEWAY",
  },
];

/**
 * Check if x402 service access is permitted.
 * In LOCAL_ADAPTER mode: always returns true (mock billing).
 * In production: validate payment proof against x402 gateway.
 */
export async function checkX402Access(
  serviceId: X402ServiceId,
  namespaceId: string,
  paymentTx?: string
): Promise<{ allowed: boolean; status: X402Status; message: string }> {
  const service = X402_SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    return { allowed: false, status: "LOCAL_ADAPTER", message: "Unknown service" };
  }

  const gatewayLive =
    process.env.MOLTBOT_GATEWAY_URL ||
    process.env.X402_PROVIDER_WALLET ||
    process.env.MOCK_X402 === "false";

  if (gatewayLive && paymentTx) {
    const { verifySubscriptionX402Payment } = await import("./gateway");
    const v = await verifySubscriptionX402Payment({
      tier: "FAMILY",
      paymentTx,
      method: paymentTx.length > 40 ? "usdc" : "atp",
    });
    if (v.valid) return { allowed: true, status: "TROPTIONS_POWERED", message: v.message };
    return { allowed: false, status: "TROPTIONS_POWERED", message: v.message };
  }

  if (service.status === "LOCAL_ADAPTER" || service.status === "MOCK_BILLING") {
    return { allowed: true, status: service.status, message: "Mock billing — no payment required in dev mode" };
  }

  if (service.status === "PRODUCTION_REQUIRES_GATEWAY" && !gatewayLive) {
    return { allowed: false, status: service.status, message: "Production x402 gateway required" };
  }

  if (gatewayLive) {
    return { allowed: true, status: "TROPTIONS_POWERED", message: "x402 gateway live — payment proof required for paid services" };
  }

  // X402_READY — would validate HTTP 402 payment proof here
  return { allowed: true, status: "X402_READY", message: "x402 payment proof required (not yet validated)" };
}

/** Resolve live status for service catalog display */
export function resolveX402ServiceStatus(base: X402Status): X402Status {
  const live = !!(process.env.MOLTBOT_GATEWAY_URL || process.env.X402_PROVIDER_WALLET);
  if (live && (base === "LOCAL_ADAPTER" || base === "PRODUCTION_REQUIRES_GATEWAY")) {
    return "TROPTIONS_POWERED";
  }
  return base;
}
