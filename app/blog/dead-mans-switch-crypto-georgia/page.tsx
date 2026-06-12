import Link from "next/link";
import { JsonLd } from "../../components/JsonLd";

export const metadata = {
  title: "Dead Man's Switch for Crypto in Georgia: The 5-Proof System That Actually Works",
  description: "Traditional dead man's switches fail for crypto. Troptions Unity Legacy Vault at 5655 Peachtree Parkway, Norcross, GA 30092 combines time + guardians + ZK proofs + on-chain anchors. $29.95/mo for Gwinnett families.",
};

export default function DeadMansSwitchPost() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16 prose">
      <h1>Dead Man's Switch for Crypto in Georgia</h1>
      <p>At 5655 Peachtree Parkway, Norcross, GA 30092</p>

      <p>Most "dead man's switches" for crypto are just emails or simple timers. They get ignored, hacked, or fail when markets move.</p>

      <p>Our system at Troptions Unity Legacy Vault requires <strong>multiple independent cryptographic proofs</strong> before anything is released:</p>
      <ul>
        <li>Time-based (you must check in or the clock starts)</li>
        <li>Guardian approvals (your trusted circle)</li>
        <li>Legal proof (death certificate hashed)</li>
        <li>On-chain verification (Unity Token / XRPL / Stellar)</li>
      </ul>

      <p>This is the only system designed for real Georgia probate realities while keeping everything zero-knowledge.</p>

      <p><strong>Family Vault $29.95/mo (normal for middle class) or High Level Vault $49.95/mo (scaled)</strong> — 14 days free.</p>

      <Link href="/pricing">Protect your digital legacy today →</Link>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Dead Man's Switch for Crypto in Georgia",
        author: { "@type": "Organization", name: "Troptions Unity Legacy Vault", address: "5655 Peachtree Parkway, Norcross, GA 30092" }
      }} />
    </article>
  );
}
