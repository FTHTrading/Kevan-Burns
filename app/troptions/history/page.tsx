import Link from "next/link";
import { Clock, Shield, Layers, ArrowRight, Globe, Cpu, Coins, AlertCircle } from "lucide-react";

const timeline = [
  {
    year: "2003",
    heading: "The Trade + Option Concept",
    body: "According to public TROPTIONS materials, the original TROPTION concept was created in 2003 as a Trade + Option instrument — designed to solve liquidity limitations in barter and trade exchange systems. Traditional barter networks created friction when parties could not find direct counterpart matches. TROPTIONS introduced an option-like mechanism: the right to trade for goods or services at a future time, without requiring immediate reciprocal exchange.",
  },
  {
    year: "2004",
    heading: "Private Placement & Formal Structure",
    body: "Public TROPTIONS materials indicate that Global Trading Partners Corp. filed a private placement memorandum under Rule 504 of Regulation D in 2004. According to TROPTIONS materials, this established TROPTIONS as a formal digital currency concept with documented legal structure — an early and unusual step in what would later become the broader cryptocurrency industry.",
  },
  {
    year: "2008",
    heading: "Global Troption Partners Corp.",
    body: "According to public TROPTIONS materials, Global Trading Partners Corp. was renamed Global Troption Partners Corp. in 2008 — reflecting the deepening commitment to the TROPTIONS concept and its role as a dedicated vehicle for trade-and-option exchange infrastructure.",
  },
  {
    year: "2016",
    heading: "TROPTIONS on Bitcoin via Counterparty",
    body: "Public TROPTIONS materials state that TROPTIONS appeared on the Bitcoin blockchain via the Counterparty protocol at Bitcoin block 428,459. This marked TROPTIONS' entry into the blockchain era as a tradeable digital asset — one of the early non-speculative utility tokens built on Bitcoin infrastructure.",
  },
  {
    year: "2021",
    heading: "TROPTIONS.GOLD & Expanded Ecosystem",
    body: "The TROPTIONS ecosystem expanded into multiple token variants: TROPTIONS.GOLD for high-value barter and balance sheet transactions, XTROPTIONS.GOLD for commodities trading, TROPTIONS PAY for retail merchant acceptance (used by over 480,000 merchants according to public TROPTIONS materials), and XTROPTIONS for exchange trading. Real estate transactions, business acquisitions, and asset tokenization use cases began to be documented publicly.",
  },
  {
    year: "2025–2026",
    heading: "TROPTIONS Ecosystem Expansion",
    body: "According to public TROPTIONS materials, the ecosystem continues to expand: TROPTIONS.UNITY for humanitarian initiatives, tokenization of physical assets (real estate, manufacturing, data centers), the TROPTIONS Television Network for education and media, partnerships across sports, food and beverage, music, and humanitarian sectors. TROPTIONS.GOLD price reached approximately $9,934 as of early 2026 according to public market data.",
  },
  {
    year: "Now",
    heading: "TROPTIONS Powers Legacy",
    body: "Legacy Vault Protocol uses TROPTIONS as the powering protocol fabric for estate-grade digital records infrastructure. TROPTIONS provides the namespace coordination layer, wallet identity model, x402 metered services, XRPL and Stellar asset rail adapters, stablecoin references, Control Hub governance, and the Rust-based Troptions Settlement Network scaffold. The TROPTIONS philosophy — that value can be coordinated and transferred without unnecessary friction or intermediaries — is exactly the right foundation for an estate system designed to protect what matters most.",
  },
];

export default function TroptionsHistoryPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">

      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">TROPTIONS · Origin & History</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          The TROPTIONS Story<br />
          <span className="text-gold-400">Why Legacy Is Built On This Foundation</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          TROPTIONS began in 2003 as a trade-and-option concept for unlocking value
          in barter systems. Two decades later, it powers Legacy Vault Protocol as a
          protocol fabric for estate-grade digital records infrastructure.
        </p>

        {/* Attribution notice */}
        <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4 text-left">
          <div className="flex gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
            <p className="text-xs text-yellow-300 leading-relaxed">
              <strong>Attribution:</strong> Historical claims on this page are based on public TROPTIONS materials, including their published white paper and official communications. Legacy Vault Protocol does not independently verify every historical business claim. Some TROPTIONS assertions represent their own materials and positioning. Legacy's technical integration uses TROPTIONS as protocol infrastructure — not as an endorsement of every claim made by third parties about TROPTIONS.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Timeline</p>
        <h2 className="mb-12 text-2xl font-bold text-white">Two decades of TROPTIONS development</h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-navy-700 hidden md:block" />

          <div className="space-y-10">
            {timeline.map((item, i) => (
              <div key={item.year} className="relative flex gap-6">
                {/* Year bubble */}
                <div className="hidden md:flex w-12 shrink-0 flex-col items-center">
                  <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border text-xs font-bold ${i === timeline.length - 1 ? "border-gold-500/50 bg-gold-500/20 text-gold-400" : "border-navy-600 bg-navy-800 text-slate-400"}`}>
                    {item.year.slice(0, 4)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 rounded-xl border border-navy-700 bg-navy-800/50 p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="md:hidden rounded-full border border-navy-600 bg-navy-800 px-2 py-0.5 text-xs font-bold text-slate-400">
                      {item.year}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold mb-3 ${i === timeline.length - 1 ? "text-gold-400" : "text-white"}`}>
                    {item.heading}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why TROPTIONS + Legacy */}
      <section className="border-t border-navy-800 bg-navy-900/50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Integration Purpose</p>
          <h2 className="mb-6 text-2xl font-bold text-white">Why TROPTIONS powers Legacy</h2>
          <p className="text-slate-400 leading-relaxed mb-8 text-base max-w-2xl">
            TROPTIONS began as a trade-and-option concept focused on unlocking value
            where traditional exchange systems created friction. Legacy extends that
            idea into digital estate infrastructure: protecting records, mapping assets,
            coordinating access, and giving families and operators a governed system
            when continuity matters most.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {[
              { icon: <Layers className="h-5 w-5 text-cyan-400" />, title: "Namespace Fabric", desc: "TROPTIONS Layer 0 provides the namespace governance and coordination layer for every .legacy identity." },
              { icon: <Globe className="h-5 w-5 text-blue-400" />, title: "Cross-Chain Rails", desc: "TROPTIONS bridge adapters for XRPL and Stellar connect Legacy vaults to the most important institutional asset networks." },
              { icon: <Coins className="h-5 w-5 text-yellow-400" />, title: "x402 Metering", desc: "The TROPTIONS x402 service layer provides machine-payable metering for every Legacy premium operation." },
              { icon: <Shield className="h-5 w-5 text-gold-400" />, title: "Governance Depth", desc: "The TROPTIONS Control Hub and Troptions-L1 governance crates provide the institutional governance layer for high-authority decisions." },
              { icon: <Cpu className="h-5 w-5 text-amber-400" />, title: "Rust Settlement Scaffold", desc: "Troptions-L1's 24-crate Rust network provides the compliance-native settlement infrastructure for future live execution." },
              { icon: <Clock className="h-5 w-5 text-purple-400" />, title: "20+ Years of Development", desc: "Legacy is not built on a new protocol. It is built on a concept with two decades of development, refinement, and real-world deployment." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="mb-3">{icon}</div>
                <p className="text-sm font-bold text-white mb-2">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Truth note */}
          <div className="rounded-xl border border-navy-700 bg-navy-900/60 p-6 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-2">Integration Truth Statement</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Legacy uses TROPTIONS as infrastructure positioning and protocol integration. 
              Live chain execution, live settlement, stablecoin issuance, and bridge operations 
              require separate production validation, legal approval, and operator configuration — 
              all of which are clearly labeled throughout this platform. The TROPTIONS ecosystem 
              operates independently of Legacy Vault Protocol; this page describes Legacy's 
              technical use of TROPTIONS infrastructure, not a formal partnership or business 
              arrangement between FTH Trading and any TROPTIONS entity.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/troptions" className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
              TROPTIONS Architecture →
            </Link>
            <Link href="/protocol/troptions-l1" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
              Troptions-L1 Rust Layer
            </Link>
            <Link href="/settlement" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
              Settlement Architecture
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
