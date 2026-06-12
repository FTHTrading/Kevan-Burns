import Link from "next/link";

export const metadata = {
  title: "Atlanta Crypto Estate Planning & Digital Legacy Vault | Troptions Unity Legacy Vault",
  description: "Best blockchain-based estate planning for Atlanta Metro families. $29.95–$49.95/mo plans with ZK proofs and 5-Proof Release. Serving from Norcross Technology Park.",
};

export default function AtlantaPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1>Atlanta Metro Crypto Estate Planning</h1>
      <p className="text-xl">The sovereign standard for digital asset protection across Atlanta, serving Gwinnett, Fulton, DeKalb, and surrounding counties from our Norcross headquarters at 5655 Peachtree Parkway.</p>

      <h2 className="mt-8">Why Atlanta Families Choose Us</h2>
      <p>Traditional estate attorneys struggle with crypto. We combine:</p>
      <ul>
        <li>Client-side encryption + PLONK zero-knowledge proofs</li>
        <li>5-Proof Release Protocol designed for Georgia law</li>
        <li>Unity Token + multi-chain anchoring</li>
        <li>Transparent pricing: Family Vault $29.95 (normal/middle class), High Level Vault $49.95 (scaled)</li>
      </ul>

      <Link href="/pricing" className="font-black">Get started — 14 days free →</Link>
    </main>
  );
}
