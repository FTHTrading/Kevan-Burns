import type { Metadata } from "next";
import TroptionsInvestorsClient from "./TroptionsInvestorsClient";

export const metadata: Metadata = {
  title: "TROPTIONS Investors | Sovereign Web3 Namespace Capital & Scale",
  description: "Examine the real-world utility, valuation comp metrics, and scalability parameters of the 50 Sovereign Web3 Namespaces powered by Troptions and Google Cloud AI infrastructure.",
  keywords: [
    "TROPTIONS",
    "Investor Portal",
    "Sovereign Suffixes",
    "RWA Valuation",
    "Google Cloud Scale",
    "Vertex AI",
    "TimesFM",
    "Model Inference",
    "Consensus Stack",
    "x402 Webhooks"
  ],
  alternates: {
    canonical: "/troptionsinvestors",
  },
};

export default function Page() {
  return <TroptionsInvestorsClient />;
}
