import Link from "next/link";
import { JsonLd } from "../components/JsonLd";

export const metadata = {
  title: "How It Works — 5-Proof Release + Zero-Knowledge Crypto Vault | Troptions Unity Legacy Vault Norcross GA",
  description: "See exactly how Troptions Unity Legacy Vault at 5655 Peachtree Parkway, Norcross, GA 30092 protects your digital legacy. Client-side AES-256 encryption, PLONK + Poseidon ZK proofs, 5-Proof Release Protocol, Unity Token anchoring. Transparent for Georgia families.",
};

export default function HowItWorksPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Set Up Your Troptions Unity Legacy Vault in Norcross, GA",
    description: "Step-by-step sovereign crypto estate planning using zero-knowledge technology.",
    step: [
      { "@type": "HowToStep", name: "Create Namespace", text: "Claim your .troptions or .legacy sovereign namespace at our Norcross Technology Park location." },
      { "@type": "HowToStep", name: "Encrypt Client-Side", text: "Upload documents — AES-256-GCM encryption happens entirely in your browser. We never see the raw data." },
      { "@type": "HowToStep", name: "Generate ZK Proofs", text: "Create PLONK + Poseidon proofs proving document integrity and guardian quorum without revealing content." },
      { "@type": "HowToStep", name: "Anchor On-Chain", text: "Hashes anchored on Unity Token, XRPL, and Stellar for immutable proof of existence." },
      { "@type": "HowToStep", name: "Configure 5-Proof Release", text: "Set guardian quorum, waiting periods, attorney attestation, and Dead Man's Switch." },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What makes the 5-Proof Release different from a regular will?", acceptedAnswer: { "@type": "Answer", text: "It requires five independent verifiable conditions (identity, death proof, attorney attestation, guardian quorum, and time lock) plus cryptographic proof on-chain. This dramatically reduces disputes in Georgia probate courts." } },
    ],
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 prose prose-stone">
      <h1>How Troptions Unity Legacy Vault Works</h1>
      <p className="text-xl">Sovereign protection anchored at <strong>5655 Peachtree Parkway, Norcross, GA 30092</strong>.</p>

      <h2>1. Client-Side Zero-Knowledge Encryption</h2>
      <p>Every document and wallet registry entry is encrypted in your browser using AES-256-GCM before it ever touches our servers or Cloudflare. We receive only ciphertext and content hashes.</p>

      <h2>2. PLONK + Poseidon Proof Generation</h2>
      <p>You generate cryptographic proofs (using circuits like UnityLegacy5Proof) that prove:</p>
      <ul>
        <li>The document existed with a specific hash (anchored on Unity Token / XRPL / Stellar)</li>
        <li>A sufficient number of guardians approved (without revealing identities or exact count if desired)</li>
        <li>Time and Dead Man's Switch conditions are met</li>
      </ul>
      <p>Proofs are small, verifiable in seconds on Cloudflare Workers or on-chain.</p>

      <h2>3. 5-Proof Release Protocol</h2>
      <p>Release only happens when <strong>all five</strong> conditions are cryptographically satisfied and recorded:</p>
      <ol>
        <li>Executor identity verified (IAL 2/3)</li>
        <li>Death proof or court order uploaded + hashed</li>
        <li>Attorney or notary attestation</li>
        <li>Guardian quorum met</li>
        <li>Waiting period elapsed (no disputes)</li>
      </ol>
      <p>This is far stronger than traditional wills for crypto assets in Georgia.</p>

      <h2>4. On-Chain Anchoring + Unity Token</h2>
      <p>Manifest hashes, proof hashes, and key events are anchored immutably. Unity Token provides native settlement and verification rails integrated with the Troptions ecosystem.</p>

      <div className="not-prose mt-12 p-8 bg-warm-100 rounded-2xl border">
        <h3 className="font-black text-xl mb-2">Ready to protect your family?</h3>
        <p className="mb-4">14-day trial. No credit card. Data stays yours.</p>
        <Link href="/onboard" className="inline-block bg-estate-900 text-white px-8 py-3 rounded-2xl font-black">Get Started at Our Norcross Location</Link>
        <p className="text-xs mt-3">5655 Peachtree Parkway, Norcross, GA 30092 • Serving Gwinnett County &amp; Atlanta Metro</p>
      </div>

      <JsonLd data={howToSchema} />
      <JsonLd data={faqSchema} />
    </main>
  );
}
