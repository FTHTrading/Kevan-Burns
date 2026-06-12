import Link from "next/link";
import { JsonLd } from "../../components/JsonLd";

export const metadata = {
  title: "Unity Token Estate Settlement in Georgia: On-Chain Legacy Without the Headaches",
  description: "How Troptions Unity Token + 5-Proof Vaults solve crypto settlement for Georgia families. Anchored at 5655 Peachtree Parkway, Norcross. Estate plan $49.95/mo with attorney coordination.",
};

export default function UnityTokenPost() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16 prose">
      <h1>Unity Token Estate Settlement in Georgia</h1>
      <p>Traditional banks and attorneys hate crypto. Unity Token + our vault at 5655 Peachtree Parkway, Norcross, GA 30092 changes the game.</p>

      <p>Direct on-chain anchoring means your heirs can verify and settle assets without months of paperwork. Combined with our ZK 5-Proof system, it's the cleanest path for Gwinnett and Atlanta families.</p>

      <p><strong>Estate Plan $49.95/mo</strong> includes priority Unity Token features and white-glove attorney support.</p>

      <Link href="/pricing">Start your legacy on-chain →</Link>

      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: "Unity Token Estate Settlement in Georgia" }} />
    </article>
  );
}
