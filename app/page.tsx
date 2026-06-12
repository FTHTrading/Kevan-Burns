import type { Metadata } from "next";
import UnykornAiPortalClient from "./UnykornAiPortalClient";

export const metadata: Metadata = {
  title: "Unykorn - Sovereign Web3 Namespaces & Infrastructure",
  description: "Unykorn operates permanent Web3 namespaces, digital identity systems, and real-world asset infrastructure across Solana and Stellar.",
  keywords: [
    "Unykorn",
    "web3 namespace",
    "sovereign identity",
    "blockchain registry",
    "digital legacy",
    "legacy vault",
    "rwa tokenization",
    "solana stellar"
  ],
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return <UnykornAiPortalClient />;
}
