import Link from "next/link";
import { CheckCircle, MapPin, Shield, Users } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import PricingCards from "../components/PricingCards";

export const metadata = {
  title: "Pricing — Troptions Unity Legacy Vault | Essential $29.95, Premium Estate $49.95, Elite Trust $89.95/mo Norcross GA",
  description: "Essential Vault $29.95/mo (secure legacy protection), Premium Estate Vault $49.95/mo (complex families & estates), Elite Trust Vault $89.95/mo (advanced privacy & trust quorums). Zero-knowledge crypto estate planning at 5655 Peachtree Parkway, Norcross, GA 30092. 14-day trial. Best digital legacy vault in Gwinnett County and Atlanta Metro.",
  alternates: { canonical: "/pricing" },
};

const ADDRESS = "5655 Peachtree Parkway, Norcross, GA 30092";

export default function PricingPage() {
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Troptions Unity Legacy Vault",
    description: "Zero-knowledge blockchain-anchored digital estate vault with 5-Proof Release Protocol.",
    brand: { "@type": "Brand", name: "Troptions Unity Legacy Vault" },
    offers: [
      {
        "@type": "Offer",
        name: "Essential Vault",
        price: "29.95",
        priceCurrency: "USD",
        priceSpecification: { "@type": "UnitPriceSpecification", price: 29.95, priceCurrency: "USD", billingDuration: "P1M" },
        availability: "https://schema.org/InStock",
        url: "https://troptionsunity.com/onboard?plan=essential",
      },
      {
        "@type": "Offer",
        name: "Premium Estate Vault",
        price: "49.95",
        priceCurrency: "USD",
        priceSpecification: { "@type": "UnitPriceSpecification", price: 49.95, priceCurrency: "USD", billingDuration: "P1M" },
        availability: "https://schema.org/InStock",
        url: "https://troptionsunity.com/onboard?plan=premium",
      },
      {
        "@type": "Offer",
        name: "Elite Trust Vault",
        price: "89.95",
        priceCurrency: "USD",
        priceSpecification: { "@type": "UnitPriceSpecification", price: 89.95, priceCurrency: "USD", billingDuration: "P1M" },
        availability: "https://schema.org/InStock",
        url: "https://troptionsunity.com/onboard?plan=elitetrust",
      },
      {
        "@type": "Offer",
        name: "Sovereign Lifetime Presale",
        price: "499.95",
        priceCurrency: "USD",
        priceSpecification: { "@type": "UnitPriceSpecification", price: 499.95, priceCurrency: "USD" },
        availability: "https://schema.org/InStock",
        url: "https://troptionsunity.com/onboard?plan=lifetime_presale",
      },
    ],
    areaServed: { "@type": "City", name: "Norcross" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is included in the $29.95 Essential Vault plan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Straightforward legacy protection for families and individuals. Includes 1 sovereign namespace, unlimited client-side AES-256 encrypted documents, full 5-Proof Release + Dead Man's Switch, 8+ chain wallet registry, Grok AI document generation (13 templates), legacy messages, XRPL + Stellar + Unity Token anchoring, and basic guardian quorum. At 5655 Peachtree Parkway, Norcross, GA 30092 (helps avoid 18+ month Georgia probate).",
        },
      },
      {
        "@type": "Question",
        name: "How does the $49.95 Premium Estate Vault differ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Everything in Essential plus multiple time-locked releases, tiered heir access, up to 5 vaults, business succession, multi-family support, priority attorney coordination, white-glove setup, SOC 2 reports, custom ZK, and Heirloom Strategist AI mode. The features are scaled here for complex estates in Atlanta Metro and beyond.",
        },
      },
      {
        "@type": "Question",
        name: "Who is the $89.95 Elite Trust Vault designed for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It is designed for wealth protection and complex trust configurations. Includes advanced multi-jurisdiction data privacy controls, custom zero-knowledge quorums, secure asset protection triggers, biometric triggers, and active Heirloom Trust Defense AI.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a Georgia-specific probate advantage?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Our 5-Proof Release Protocol (time + guardian signatures + legal proof + on-chain + email/SMS) + client-side encryption helps families avoid lengthy Georgia probate (average 18+ months) by providing cryptographically verifiable instructions and asset inventories without exposing raw data.",
        },
      },
      {
        "@type": "Question",
        name: "How does the Sovereign Lifetime Presale work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Sovereign Lifetime Presale is a limited-time launch offer. For a one-time fee of $499.95, you receive permanent, lifetime access to the Premium Estate Vault (normally $49.95/month, saving over 91% compared to a 10-year subscription), a sovereign namespace (.legacy or .troptions) registered permanently on-chain, and 1,000 TROPTIONS tokens.",
        },
      },
    ],
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Troptions Unity Legacy Vault",
    address: {
      "@type": "PostalAddress",
      streetAddress: "5655 Peachtree Parkway",
      addressLocality: "Norcross",
      addressRegion: "GA",
      postalCode: "30092",
      addressCountry: "US",
    },
  };

  return (
    <main className="min-h-screen bg-warm-50 text-estate-900">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-black tracking-widest mb-3">
            <MapPin className="h-4 w-4" /> 5655 Peachtree Parkway, Norcross, GA 30092
          </div>
          <h1 className="text-5xl font-black mb-4">Transparent Pricing for Sovereign Legacy Protection</h1>
          <p className="text-xl text-estate-600 max-w-2xl mx-auto">
            Less than a dinner out per month. The most loving thing you can do for your family in Georgia.
            Zero-knowledge. Blockchain-anchored at our Technology Park location.
          </p>
        </div>

        <PricingCards
          plans={[
            {
              plan:     "Essential Vault",
              price:    "$29.95",
              period:   "/month",
              desc:     "Straightforward legacy protection for families and individuals",
              features: [
                "1 Sovereign Namespace (.legacy or .troptions)",
                "Unlimited client-side AES-256 encrypted documents",
                "Full 5-Proof Release Protocol + Dead Man's Switch",
                "Crypto wallet registry (8+ chains including Unity Token)",
                "Grok AI document generation — 13 Georgia-compliant templates",
                "Legacy messages to beneficiaries",
                "XRPL + Stellar + Unity Token hash anchoring",
                "Basic guardian quorum",
              ],
              cta:      "Start 14-Day Free Trial",
              href:     "/onboard",
              highlight: false,
            },
            {
              plan:     "Premium Estate Vault",
              price:    "$49.95",
              period:   "/month",
              desc:     "Scaled for complex families, trusts, and estates (most popular)",
              features: [
                "Everything in Essential Vault",
                "Up to 5 vaults under one namespace",
                "Business succession documents & real estate tokenization",
                "Multi-family namespace support",
                "Priority attorney coordination (Georgia licensed referrals)",
                "White-glove setup call from our Norcross Technology Park office",
                "SOC 2 audit reports on request",
                "Custom guardian quorum + advanced PLONK ZK configurations",
                "Troptions Pay + Unity Token priority perks",
                "Multiple time-locked releases + tiered heir access",
                "Heirloom Sovereign Vault AI — Strategist mode (private executor, death scenario sims, heir tutor)",
              ],
              cta:      "Start Premium Plan",
              href:     "/onboard",
              highlight: true,
            },
            {
              plan:     "Elite Trust Vault",
              price:    "$89.95",
              period:   "/month",
              desc:     "Advanced privacy controls, custom ZK trust quorums, and active Heirloom Trust Defense AI",
              features: [
                "Everything in Premium Estate Vault",
                "Multi-jurisdiction data privacy layers (US + Swiss/offshore)",
                "Multiple ZK trust quorums with customizable thresholds",
                "Asset protection triggers (secure redirection on unauthorized access)",
                "Biometric + geographic + time-based release triggers",
                "Suspicious death protocol (failsafe release to verified legal counsel)",
                "Plausible deniability trust architecture",
                "Up to 10 vaults, full custom ZK + SOC 2 audits",
                "Heirloom Trust AI — Trust Defense mode (advanced kill-switch simulations, active scenario analysis)",
              ],
              cta:      "Start Elite Trust Plan",
              href:     "/onboard",
              highlight: false,
            },
          ]}
        />

        {/* Sovereign Lifetime Presale Promo Banner */}
        <div className="my-16 bg-gradient-to-r from-[#03060f] via-[#0b1733] to-[#03060f] rounded-3xl border-2 border-amber-500 overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-12 gap-8 p-8 md:p-12 items-center">
            <div className="md:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black tracking-widest text-amber-400 uppercase">
                💥 Limited Launch Presale
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Get Lifetime Sovereign Protection & Save 91.7%
              </h2>
              <p className="text-slate-300 text-base leading-relaxed font-semibold">
                Skip the monthly subscriptions forever. Register your sovereign Web3 space with the <strong className="text-amber-400">Sovereign Lifetime Presale</strong>. Pay once, own your namespace, vaults, and IPFS data backups forever.
              </p>
              
              <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-5">
                <div>
                  <p className="text-xs text-slate-400">10-Year Subscription Value</p>
                  <p className="text-2xl font-black text-slate-300 line-through">$5,994.00</p>
                </div>
                <div>
                  <p className="text-xs text-amber-400 font-bold">Lifetime Presale Price</p>
                  <p className="text-3xl font-black text-amber-400">$499.95</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">What you receive immediately:</p>
                <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ Permanent Premium Estate Vaults (Up to 10)</li>
                  <li className="flex items-center gap-2">✓ 1,000 TROPTIONS utility tokens included</li>
                  <li className="flex items-center gap-2">✓ Permanent Sovereign Namespace (.legacy)</li>
                  <li className="flex items-center gap-2">✓ Multi-Chain Wallets (EVM, Solana, XRPL, Stellar)</li>
                  <li className="flex items-center gap-2">✓ 5-Proof ZK release gates + DMS</li>
                  <li className="flex items-center gap-2">✓ White-glove heirloom strategist setup call</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/onboard?plan=lifetime_presale"
                  className="inline-flex justify-center items-center rounded-2xl bg-amber-500 hover:bg-amber-400 text-estate-900 font-black px-8 py-4 text-base transition-all text-center shadow-lg shadow-amber-500/20"
                >
                  Claim Lifetime Presale Now
                </Link>
                <Link
                  href="/onboard?plan=lifetime_presale&crypto=1"
                  className="inline-flex justify-center items-center rounded-2xl border border-white/20 hover:bg-white/5 text-white font-bold px-6 py-4 text-sm transition-all text-center"
                >
                  Pay with USDC / TROPTIONS
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                <img
                  src="/images/presale.png"
                  alt="Legacy Presale Lifetime Offer"
                  className="w-full max-w-sm md:max-w-md h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Local + E-E-A-T Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex justify-center gap-2 mb-3">
            <Shield className="h-5 w-5" /> <Users className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-black mb-4">Built for Georgia Families. Anchored in Norcross.</h2>
          <p className="text-estate-600">
            Located at <strong>5655 Peachtree Parkway, Norcross, GA 30092</strong> in Technology Park / Peachtree Corners.
            We help families across Gwinnett County and the Atlanta Metro protect digital assets from Georgia probate delays (often 18+ months),
            lost seed phrases, and family disputes — with verifiable, zero-knowledge proofs.
          </p>
          <p className="mt-4 text-sm text-estate-500">
            All documents encrypted client-side with AES-256-GCM. Proofs generated with PLONK + Poseidon circuits.
            Never sent in the clear. Your data stays sovereign.
          </p>
        </div>

        {/* Add-on / Lifetime */}
        <div className="text-center">
          <h3 className="font-black mb-2">One-Time Options</h3>
          <p className="text-estate-600 mb-4">Lifetime Legacy Lock: <strong>$1,299</strong> (no monthly) • Self-Hosted Enterprise Version: <strong>$4,999</strong> + support</p>
          <Link href="/onboard?plan=lifetime" className="underline">Contact for Lifetime or Self-Hosted Setup</Link>
        </div>
      </div>

      {/* Schemas for GEO / AI citation */}
      <JsonLd data={pricingSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={localBusiness} />
    </main>
  );
}










