import Link from "next/link";
import { JsonLd } from "../components/JsonLd";

export const metadata = {
  title: "Gwinnett County Crypto Estate Planning | Troptions Unity Legacy Vault Norcross GA",
  description: "Digital asset protection and crypto wills for Gwinnett County families. $29.95 Family plans anchored at 5655 Peachtree Parkway, Norcross. Avoid probate with 5-Proof ZK technology.",
};

export default function GwinnettPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-black">Gwinnett County Crypto Estate Planning</h1>
      <p className="text-xl">Serving Norcross, Peachtree Corners, Duluth, Lawrenceville and all of Gwinnett from 5655 Peachtree Parkway, Norcross, GA 30092.</p>

      <div className="my-8">
        <p>Georgia probate is especially painful for crypto holders. Our local Norcross vault gives Gwinnett families:</p>
        <ul>
          <li>Zero-knowledge proofs that prove ownership and instructions without exposing private keys</li>
          <li>5-Proof Release that satisfies Georgia legal requirements while remaining sovereign</li>
          <li>Unity Token anchoring for on-chain verifiability</li>
        </ul>
      </div>

      <Link href="/pricing" className="font-black text-lg">Family $29.95/mo — Start protecting your Gwinnett legacy today →</Link>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Gwinnett County Crypto Estate Planning",
        provider: { "@type": "LocalBusiness", name: "Troptions Unity Legacy Vault", address: "5655 Peachtree Parkway, Norcross, GA 30092" },
        areaServed: "Gwinnett County, GA",
        priceRange: "$29.95",
      }} />
    </main>
  );
}
