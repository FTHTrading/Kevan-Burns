import type { Metadata } from "next";
import UnykornAiPortalClient from "../UnykornAiPortalClient";

export const metadata: Metadata = {
  title: "Unykorn - Main Registry Product",
  description: "Configure your Web3 namespaces, connect wallets, and check transaction logs on the Unykorn main registry product.",
  keywords: [
    "Unykorn",
    "Unykorn.ai",
    "Sovereign OS",
    "Web3",
    "Neo Bank",
    "Agentic Commerce",
    "x402",
    "Apostle Chain",
    "FTH Pay",
  ],
  alternates: {
    canonical: "/registry",
  },
};

export default function Page() {
  return <UnykornAiPortalClient />;
}
