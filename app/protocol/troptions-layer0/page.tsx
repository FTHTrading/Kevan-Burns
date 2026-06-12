import Link from "next/link";
import {
  Layers, ArrowRight, Globe, Zap, Wallet, Shield,
  FileText, Coins, Lock, CheckCircle2,
} from "lucide-react";

const COORDINATES = [
  { icon: <Globe className="h-4 w-4 text-gold-400" />,   title: ".legacy namespace registry",       desc: "Namespace identity, slug resolution, IPFS CID binding, state coordination" },
  { icon: <Shield className="h-4 w-4 text-cyan-400" />,  title: "Vault event proofs",               desc: "Guardian attestations, executor verification, release status — all anchored as Layer 0 proof records" },
  { icon: <Globe className="h-4 w-4 text-blue-400" />,   title: "Cross-chain asset references",     desc: "Routes asset references across XRPL, Stellar, EVM, and Solana via adapter crates" },
  { icon: <Zap className="h-4 w-4 text-yellow-400" />,   title: "x402 metered service events",      desc: "Every TROPTIONS x402 service call is metered and logged as a Layer 0 coordination event" },
  { icon: <FileText className="h-4 w-4 text-purple-400" />, title: "Executor & guardian attestations", desc: "Signed executor packets, guardian quorum records, and attorney/notary attestations" },
  { icon: <Coins className="h-4 w-4 text-emerald-400" />, title: "Stablecoin asset references",     desc: "USDC, USDT, DAI, EURC, USDF, FTHX, FTHG references routed through Layer 0 asset model" },
  { icon: <Wallet className="h-4 w-4 text-gold-400" />,  title: "Wallet identity mappings",        desc: "Owner, executor, beneficiary wallet maps — TROPTIONS, XRPL, Stellar, EVM, Solana" },
  { icon: <Lock className="h-4 w-4 text-red-400" />,     title: "Release status events",           desc: "Multi-condition release gate status: waiting period, death cert, guardian quorum, court order" },
  { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, title: "Audit anchors",           desc: "Every vault action produces a tamper-evident Layer 0 audit anchor for legal proceedings" },
  { icon: <Layers className="h-4 w-4 text-slate-400" />, title: "Validator readiness",             desc: "Layer 0 surfaces TSN validator readiness state from the Troptions-L1 Rust network below" },
];

export default function TroptionsLayer0Page() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">

      {/* ── Hero ── */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Protocol Architecture</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          TROPTIONS{" "}
          <span className="text-cyan-400">Layer 0 Fabric</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          The coordination fabric between the Legacy estate application layer and the
          Troptions-L1 Rust settlement network. Layer 0 routes namespace events, wallet
          maps, x402 metering, cross-chain asset references, and proof anchoring.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Layers className="h-3 w-3" /> Coordination Fabric
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Wired into Legacy
          </span>
        </div>
      </section>

      {/* ── Stack diagram ── */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Layer Architecture</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">Where Layer 0 sits</h2>
          <div className="space-y-2">
            {[
              { label: "Legacy Vault App", note: "Estate workflows · namespaces · exports · downloads", color: "border-gold-500/40 bg-gold-500/8", textColor: "text-gold-400" },
              { label: "↓ calls into ↓", note: "", color: "border-transparent bg-transparent", textColor: "text-slate-600" },
              { label: "TROPTIONS Layer 0 Fabric", note: "Coordination · x402 · wallet map · cross-chain routing · proof anchoring", color: "border-cyan-500/40 bg-cyan-500/8", textColor: "text-cyan-400" },
              { label: "↓ coordinates with ↓", note: "", color: "border-transparent bg-transparent", textColor: "text-slate-600" },
              { label: "Troptions-L1 / TSN Rust Layer 1", note: "Settlement scaffold · consensus · stablecoin runtime · bridges · compliance", color: "border-amber-500/40 bg-amber-500/8", textColor: "text-amber-400" },
              { label: "↓ bridges to ↓", note: "", color: "border-transparent bg-transparent", textColor: "text-slate-600" },
              { label: "External Rails", note: "XRPL · Stellar · EVM · Solana · stablecoin networks", color: "border-slate-600/40 bg-slate-800/30", textColor: "text-slate-400" },
            ].map((item) => (
              item.label.startsWith("↓") ? (
                <div key={item.label} className="flex justify-center py-0.5">
                  <span className="text-xs text-slate-600">{item.label}</span>
                </div>
              ) : (
                <div key={item.label} className={`rounded-xl border px-5 py-4 ${item.color}`}>
                  <p className={`font-bold ${item.textColor}`}>{item.label}</p>
                  {item.note && <p className="mt-0.5 text-xs text-slate-500">{item.note}</p>}
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* ── What Layer 0 coordinates ── */}
      <section className="border-b border-navy-800 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Coordination Scope</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">What Layer 0 coordinates</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COORDINATES.map((c) => (
              <div key={c.title} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="mb-3">{c.icon}</div>
                <p className="mb-1 text-sm font-bold text-white">{c.title}</p>
                <p className="text-xs leading-relaxed text-slate-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Distinction: Layer 0 vs Layer 1 ── */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Key Distinction</p>
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Layer 0 vs Layer 1</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-400">Layer 0 — Fabric</p>
              <p className="text-sm text-white font-medium mb-3">Coordination layer</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-cyan-500 shrink-0" />Routes namespace state and events</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-cyan-500 shrink-0" />Maps wallet identities across chains</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-cyan-500 shrink-0" />Meters x402 service calls</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-cyan-500 shrink-0" />Anchors proof records</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-cyan-500 shrink-0" />Does not execute settlement directly</li>
              </ul>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-400">Layer 1 — Settlement</p>
              <p className="text-sm text-white font-medium mb-3">Rust settlement network scaffold</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />24 Rust crates (TSN workspace)</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />Consensus, runtime, state, crypto</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />Stablecoin runtime (GENIUS Act gated)</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />XRPL + Stellar bridge adapters</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />Simulation-only until validators live</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Links ── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl flex flex-wrap justify-center gap-4">
          <Link href="/troptions" className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500/40 hover:text-gold-400 transition-colors">
            ← Powered by TROPTIONS
          </Link>
          <Link href="/protocol/troptions-l1" className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-500 transition-colors">
            Troptions-L1 Rust Network →
          </Link>
        </div>
      </section>

    </div>
  );
}
