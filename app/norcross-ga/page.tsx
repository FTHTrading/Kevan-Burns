import Link from "next/link";
import { MapPin, CheckCircle } from "lucide-react";
import { JsonLd } from "../components/JsonLd";

export const metadata = {
  title: "Crypto Estate Planning Norcross GA | Troptions Unity Legacy Vault — 5655 Peachtree Parkway",
  description: "Best crypto inheritance and digital asset protection in Norcross, GA. Family plans from $29.95/mo at 5655 Peachtree Parkway, Technology Park. Zero-knowledge 5-Proof Release for Gwinnett County families.",
};

export default function NorcrossGAPage() {
  const localSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Troptions Unity Legacy Vault",
    address: { "@type": "PostalAddress", streetAddress: "5655 Peachtree Parkway", addressLocality: "Norcross", addressRegion: "GA", postalCode: "30092" },
    areaServed: "Norcross, GA",
    priceRange: "$29.95-$49.95",
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-4 text-amber-600 font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> 5655 Peachtree Parkway, Norcross, GA 30092</div>
      <h1 className="text-5xl font-black">Crypto Estate Planning in Norcross, GA</h1>
      <p className="text-2xl mt-2">Sovereign protection for your digital legacy — right in Technology Park / Peachtree Corners.</p>

      <div className="my-10 p-8 bg-white border rounded-2xl">
        <h2 className="font-black text-2xl mb-4">Why Norcross Families Trust Troptions Unity Legacy Vault</h2>
        <ul className="grid gap-3">
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /> Client-side encryption + PLONK ZK proofs (we never see your seeds or wills)</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /> 5-Proof Release that stands up in Georgia probate courts</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /> Unity Token + XRPL anchoring from our local Technology Park office</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /> Family Vault $29.95/mo (normal/middle class) or High Level Vault $49.95/mo (scaled) with 14-day trial</li>
        </ul>
        <Link href="/pricing" className="mt-6 inline-block font-black bg-amber-500 text-black px-8 py-3 rounded-2xl">See Pricing &amp; Start Trial</Link>
      </div>

      <h2 className="font-black mt-12">Serving All of Gwinnett County &amp; Atlanta Metro</h2>
      <p>We help families in Peachtree Corners, Duluth, Lawrenceville, and greater Atlanta protect crypto, NFTs, and digital assets from the lengthy Georgia probate process.</p>

      <JsonLd data={localSchema} />
    </main>
  );
}
