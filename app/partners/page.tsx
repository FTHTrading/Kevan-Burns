import Link from "next/link";
import { ExternalLink, Shield, ArrowRight, Globe, Handshake, Layers } from "lucide-react";
import { PARTNERS } from "@/lib/partners/registry";

export default function PartnersPage() {
  const active = PARTNERS.filter((p) => p.active);

  return (
    <main className="min-h-screen bg-warm-50">

      {/* Header */}
      <section className="border-b border-estate-200 bg-white px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border-2 border-amber-300 px-4 py-1.5 text-xs font-black text-amber-900 mb-6">
          <Layers className="h-3.5 w-3.5" />
          Our Ecosystem
        </div>
        <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight" style={{ color: '#1a0f00' }}>
          The full estate protection stack.
        </h1>
        <p className="text-xl max-w-2xl mx-auto leading-relaxed mb-3" style={{ color: '#2d1a00' }}>
          Legacy Vault Protocol and EternalChain together cover the complete picture —
          your digital estate and your physical memorial property.
          Both platforms. One ecosystem. One mission.
        </p>
        <p className="text-base max-w-xl mx-auto mb-10" style={{ color: '#4a3520' }}>
          Powered by TROPTIONS, XRPL, Stellar, Grok AI, Pinata IPFS, and Genesis Sentience Protocol.
        </p>

        {/* Quick ecosystem links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/" className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 transition-all px-7 py-3 font-black text-white text-sm">
            Legacy Vault Protocol
          </Link>
          <Link href="/go/eternalchain?src=partners-header" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-estate-300 hover:border-amber-400 transition-all px-7 py-3 font-bold text-estate-800 text-sm hover:text-amber-700">
            EternalChain <ExternalLink className="h-4 w-4" />
          </Link>
          <Link href="/go/genesis?src=partners-header" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-estate-300 hover:border-amber-400 transition-all px-7 py-3 font-bold text-estate-800 text-sm hover:text-amber-700">
            Genesis Protocol <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Side-by-side platform comparison */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-8 text-center">Two Platforms. One Complete Solution.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">

          {/* Legacy Vault Protocol */}
          <div className="rounded-3xl border-2 border-amber-300 bg-white p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[10px] font-black text-amber-800 mb-4">
              DIGITAL ESTATE
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ color: '#1a0f00' }}>Legacy Vault Protocol</h2>
            <p className="text-sm font-bold text-amber-700 mb-4">vault.genesis402.com (branded entry • serves latest 4-tier app)</p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#2d1a00' }}>
              The complete digital estate operating system. Encrypts and organizes every digital asset, legal document, crypto wallet, and succession instruction. 5-proof release gate ensures your family gets what you intended — no fraud, no court delays.
            </p>
            <ul className="space-y-2 mb-6">
              {[
                "AI-drafted wills, trusts, and directives",
                "Crypto wallet registry across 8 chains",
                "Cloudflare Web3 IPFS Gateway (branded, edge-cached) + Pinata pinning for durability",
                "Blockchain-anchored audit trail",
                "Dead man's switch + legacy messages",
                "Guardian N-of-M quorum release gate",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#2d1a00' }}>
                  <Shield className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/onboard" className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-6 py-2.5 text-sm font-black text-white transition-all">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* EternalChain */}
          <div className="rounded-3xl border-2 border-estate-800 bg-estate-900 p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-[10px] font-black text-amber-300 mb-4">
              PHYSICAL ESTATE
            </div>
            <h2 className="text-2xl font-black text-white mb-2">EternalChain</h2>
            <p className="text-sm font-bold text-amber-400 mb-4">eternalchain.pages.dev</p>
            <p className="text-sm leading-relaxed mb-5 text-estate-300">
              The first platform to tokenize cemetery property on XRPL, Stellar, and EVM. AI fraud protection eliminates fake cashier's checks and wire fraud. Smart escrow settles in seconds. The first regulated secondary market for memorial real estate.
            </p>
            <ul className="space-y-2 mb-6">
              {[
                "Cemetery plots, crypts, and niches on-chain",
                "AI FraudShield — 12-pattern scam detection",
                "Smart escrow — no fake checks, no wire fraud",
                "XRPL + Stellar multi-chain architecture",
                "SEC Reg D compliant · Patent pending",
                "Beneficiary routing to verified recipients",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs font-semibold text-estate-300">
                  <Globe className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/go/eternalchain?src=partners-card" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-black text-estate-900 transition-all">
              Visit EternalChain <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Shared infrastructure */}
        <div className="rounded-3xl border-2 border-purple-200 bg-purple-50 p-8 mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-purple-700 mb-4">Shared Infrastructure</p>
          <h3 className="text-xl font-black mb-4" style={{ color: '#1a0f00' }}>
            Same rails. Same mission. Different assets.
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "XRPL",           desc: "Memorial NFTs and document hash anchoring on the same ledger" },
              { label: "Stellar",        desc: "Asset issuance and compliance rails used by both platforms" },
              { label: "TROPTIONS",      desc: "Namespace fabric, x402 metering, and settlement infrastructure" },
              { label: "LegacyVault EVM", desc: "EternalChain's smart contract is named LegacyVault — built for this integration" },
            ].map(({ label, desc }) => (
              <div key={label} className="rounded-xl bg-white border border-purple-200 p-4">
                <p className="text-sm font-black text-purple-800 mb-1">{label}</p>
                <p className="text-xs text-estate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why together */}
        <div className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-8">
          <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-4">Why This Matters</p>
          <h3 className="text-xl font-black mb-4" style={{ color: '#1a0f00' }}>
            Your physical and digital estate — finally protected together.
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-bold mb-2" style={{ color: '#2d1a00' }}>The problem with separate systems:</p>
              <ul className="space-y-2 text-sm text-estate-600">
                {[
                  "Cemetery deed stored in a filing cabinet — no fraud protection",
                  "Crypto wallets unknown to the family after death",
                  "Legal documents expired or inaccessible",
                  "No single source of truth for executors",
                ].map((i) => <li key={i} className="flex gap-2"><span className="text-red-400 shrink-0">x</span>{i}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold mb-2" style={{ color: '#2d1a00' }}>What the ecosystem delivers:</p>
              <ul className="space-y-2 text-sm text-estate-600">
                {[
                  "Physical memorial property tokenized and fraud-proof",
                  "Digital assets encrypted, organized, and succession-ready",
                  "All estate records under one governed protocol",
                  "Executors guided step-by-step through both systems",
                ].map((i) => <li key={i} className="flex gap-2"><span className="text-emerald-500 shrink-0 font-bold">+</span>{i}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TROPTIONS infrastructure */}
      <section className="border-t border-estate-200 bg-white px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-6 text-center">Protocol Infrastructure</p>
          <h2 className="text-3xl font-black text-center mb-8" style={{ color: '#1a0f00' }}>
            Powered by TROPTIONS.
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                name:  "TROPTIONS",
                desc:  "The protocol fabric beneath the entire ecosystem. Namespace registry, x402 metered services, wallet coordination, and Rust-based TSN settlement infrastructure.",
                url:   "https://troptions.com",
                slug:  "troptions",
                color: "border-gold-500/40 bg-gold-500/5",
              },
              {
                name:  "XRPL",
                desc:  "XRP Ledger — fast finality, native escrow, NFT standard for memorial assets, trustline stablecoins. Used by both Legacy Vault and EternalChain for anchoring.",
                url:   "https://xrpl.org",
                slug:  null,
                color: "border-blue-200 bg-blue-50",
              },
              {
                name:  "Stellar",
                desc:  "Asset issuance, compliance authorization flags, and Soroban smart contracts. Provides regulated stablecoin rails and cross-border settlement paths.",
                url:   "https://stellar.org",
                slug:  null,
                color: "border-blue-200 bg-blue-50",
              },
            ].map(({ name, desc, url, slug, color }) => (
              <div key={name} className={`rounded-2xl border-2 ${color} p-6`}>
                <h3 className="text-base font-black mb-2" style={{ color: '#1a0f00' }}>{name}</h3>
                <p className="text-xs text-estate-600 leading-relaxed mb-4">{desc}</p>
                <a href={slug ? `/go/${slug}?src=partners-infra` : url}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-600 transition-colors">
                  Learn more <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center bg-estate-900">
        <h2 className="text-3xl font-black text-white mb-4">
          The last estate platform you will ever need.
        </h2>
        <p className="text-estate-300 text-lg mb-8 max-w-xl mx-auto">
          Digital assets. Physical memorial property. Legal documents. Crypto wallets. All of it — organized, protected, and ready for your family when the time comes.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/onboard" className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-8 py-3.5 font-black text-estate-900 transition-all">
            Start Legacy Vault <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/go/eternalchain?src=partners-footer" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-estate-600 hover:border-amber-500 px-7 py-3.5 font-bold text-estate-300 hover:text-amber-300 transition-all">
            Visit EternalChain <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
