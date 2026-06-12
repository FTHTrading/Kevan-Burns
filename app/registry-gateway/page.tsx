import type { Metadata } from "next";
import RegistryGatewayClient from "./RegistryGatewayClient";

export const metadata: Metadata = {
  title: "Troptions Registry Gateway | Web3 Namespaces & MCP AI",
  description: "Secure, dual-chain sovereign namespace gateway. Claim a free preview, query RWA values, and explore agentic tool integrations.",
  keywords: [
    "Troptions Registry",
    "Web3 Namespaces",
    "Registry Gateway",
    "Sovereign ID",
    "Model Context Protocol",
    "Solana SFT",
    "Stellar Comps"
  ],
  alternates: {
    canonical: "/registry-gateway",
  },
};

export default function Page() {
  return <RegistryGatewayClient />;
}
