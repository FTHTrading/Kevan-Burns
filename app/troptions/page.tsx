import type { Metadata } from "next";
import TroptionsPortalClient from "./TroptionsPortalClient";

export const metadata: Metadata = {
  title: "TROPTIONS | Crimson Future Stack & Ecosystem Manual",
  description: "Explore the TROPTIONS 9-chain federated stack, x402 payment membranes, A5 agent mesh, and the complete 18-chapter live ecosystem manual.",
  keywords: [
    "TROPTIONS",
    "Crimson Future",
    "9-chain",
    "TROY",
    "DONK",
    "x402",
    "sovereign operating planes",
    "real estate tokenization",
  ],
  alternates: {
    canonical: "/troptions",
  },
};

export default function Page() {
  return <TroptionsPortalClient />;
}
