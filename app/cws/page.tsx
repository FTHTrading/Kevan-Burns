import type { Metadata } from "next";
import CwsClient from "./CwsClient";

export const metadata: Metadata = {
  title: "CWS On-Chain Empire | Road to Omaha Protocol",
  description: "Sovereign collegiate sports registry, dynamic Token Extensions NFT explorer, and NIL estate planning portals anchored to Solana and Stellar.",
  keywords: [
    "CWS Omaha",
    "College World Series",
    "Solana Token Extensions",
    "Token-2022",
    "Dynamic NFT",
    "NIL Contracts",
    "Barter Suffixes",
    "Troptions SFT"
  ],
  alternates: {
    canonical: "/cws",
  },
};

export default function Page() {
  return <CwsClient />;
}
