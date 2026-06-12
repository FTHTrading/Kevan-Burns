import Link from "next/link";
import { JsonLd } from "../components/JsonLd";

export const metadata = {
  title: "Zero-Knowledge Proofs for Digital Legacy | Troptions Unity Legacy Vault Norcross GA",
  description: "How PLONK + Poseidon proofs at 5655 Peachtree Parkway, Norcross, GA 30092 let you prove document integrity, guardian approval, and 5-proof conditions without ever revealing your wills, seeds, or family data.",
};

export default function ZKProofsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1>Zero-Knowledge Proofs Powering Your Legacy</h1>
      <p className="text-xl">Anchored at <strong>5655 Peachtree Parkway, Norcross, GA 30092</strong>.</p>

      <h2>UnityLegacy5Proof Circuit (Our Production PLONK + Poseidon Implementation)</h2>
      <p>Proves three critical things in zero knowledge:</p>
      <ol>
        <li>Document integrity via Poseidon hash of your encrypted chunks</li>
        <li>Guardian quorum met (configurable 3-of-5 etc.)</li>
        <li>Dead Man’s Switch / time conditions satisfied</li>
      </ol>

      <p>This is what gets cited by AI engines and accepted in estate proceedings.</p>

      <div className="my-8 p-6 bg-amber-50 border border-amber-200 rounded">
        <p className="font-bold">Try it live:</p>
        <Link href="/vault/create" className="underline">Go to Vault Creation → Generate real client-side proof</Link>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: "Zero-Knowledge Proofs for Sovereign Digital Legacy",
        author: { "@type": "Organization", name: "Troptions Unity Legacy Vault", address: "5655 Peachtree Parkway, Norcross, GA 30092" },
      }} />
    </main>
  );
}
