import Link from "next/link";
import { ArrowDown, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const layers = [
  {
    level: "01",
    name: "Legacy Vault Protocol",
    color: "border-gold-500/40 bg-gold-500/5",
    titleColor: "text-gold-400",
    items: [
      "Estate vault creation & management",
      "Executor / beneficiary workflows",
      "Document upload & encryption",
      "Release policy engine",
      "Audit trail generation",
    ],
    status: "IMPLEMENTED",
    statusColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  {
    level: "02",
    name: "TROPTIONS x402 Metering",
    color: "border-cyan-500/40 bg-cyan-500/5",
    titleColor: "text-cyan-400",
    items: [
      "HTTP 402 Payment Required service fabric",
      "Executor packet metering (0.50 USDF)",
      "Compliance report metering (1.00 USDF)",
      "Cross-chain snapshot metering (0.75 USDF)",
      "Namespace manifest metering (0.25 USDF)",
    ],
    status: "LOCAL_ADAPTER",
    statusColor: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  },
  {
    level: "03",
    name: "TROPTIONS Layer 0 Fabric",
    color: "border-purple-500/40 bg-purple-500/5",
    titleColor: "text-purple-400",
    items: [
      "Namespace coordination fabric",
      "Wallet identity mapping",
      "x402 event routing",
      "Cross-chain proof anchor events",
      "Estate event coordination",
    ],
    status: "SCAFFOLD",
    statusColor: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  },
  {
    level: "04",
    name: "Troptions-L1 / TSN Rust Layer",
    color: "border-blue-500/40 bg-blue-500/5",
    titleColor: "text-blue-400",
    items: [
      "Rust workspace: 24 crates",
      "consensus, runtime, state, crypto modules",
      "compliance & governance runtime",
      "stablecoin module (simulation-gated)",
      "Control Hub approval surface",
    ],
    status: "SIMULATION_ONLY",
    statusColor: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  {
    level: "05",
    name: "External Rails (XRPL · Stellar · EVM · Solana)",
    color: "border-slate-500/40 bg-slate-500/5",
    titleColor: "text-slate-300",
    items: [
      "XRPL: bridge-xrpl adapter (live mainnet)",
      "Stellar: bridge-stellar adapter (live mainnet)",
      "EVM: wallet reference model",
      "Solana: wallet reference model",
      "Stablecoin networks: USDC · USDT · DAI · EURC",
    ],
    status: "LIVE",
    statusColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
];

const capabilities = [
  { cap: "Legacy estate workflows", status: "LIVE", note: "Implemented — build validated" },
  { cap: "TROPTIONS x402 metering", status: "LOCAL_ADAPTER", note: "Dev mode — no real payment" },
  { cap: "USDF stablecoin unit", status: "PLANNED", note: "Local adapter only — no live issuance" },
  { cap: "Troptions-L1 settlement", status: "SIMULATION", note: "Rust scaffold — no live validators" },
  { cap: "XRPL bridge execution", status: "LIVE", note: "Live on mainnet via operator keys" },
  { cap: "Stellar bridge execution", status: "LIVE", note: "Live on mainnet via operator keys" },
  { cap: "Stablecoin issuance", status: "BLOCKED", note: "Legal + issuer + governance approvals required" },
  { cap: "Production validators", status: "FUTURE", note: "Requires TSN validator onboarding" },
];

const capCfg: Record<string, string> = {
  LIVE:         "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  LOCAL_ADAPTER:"border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  PLANNED:      "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  SIMULATION:   "border-blue-500/30 bg-blue-500/10 text-blue-400",
  ADAPTER:      "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  BLOCKED:      "border-red-500/30 bg-red-500/10 text-red-400",
  FUTURE:       "border-slate-500/30 bg-slate-500/10 text-slate-400",
};

export default function SettlementPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">

      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">TROPTIONS · Settlement Architecture</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          Settlement &amp; Coordination<br />
          <span className="text-gold-400">Powered by TROPTIONS</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Legacy Vault Protocol uses the TROPTIONS protocol fabric for x402 metering, namespace coordination,
          cross-chain proof anchoring, stablecoin asset references, and Rust-based TSN settlement infrastructure.
          No live settlement is claimed unless validators, legal rails, and Control Hub approvals are connected.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {[
            { label: "x402 Metering", color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
            { label: "TROPTIONS Layer 0", color: "border-gold-500/30 bg-gold-500/10 text-gold-400" },
            { label: "TSN Rust Scaffold", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
            { label: "Control Hub Gated", color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
          ].map(({ label, color }) => (
            <span key={label} className={`rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>{label}</span>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-14 space-y-16">

        {/* Layer stack */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Settlement Layer Stack</p>
          <h2 className="mb-8 text-2xl font-bold text-white">Five-layer coordination architecture</h2>
          <div className="space-y-4">
            {layers.map((layer, idx) => (
              <div key={layer.name}>
                <div className={`rounded-xl border ${layer.color} p-5`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 mr-2">LAYER {layer.level}</span>
                      <span className={`text-sm font-bold ${layer.titleColor}`}>{layer.name}</span>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${layer.statusColor}`}>{layer.status}</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {layer.items.map((item) => (
                      <li key={item} className="text-xs text-slate-400 flex items-start gap-1.5">
                        <span className="text-slate-600 mt-0.5">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                {idx < layers.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className="h-4 w-4 text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* x402 flow */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Settlement Flow</p>
          <h2 className="mb-6 text-2xl font-bold text-white">How a metered service call settles</h2>
          <div className="space-y-2">
            {[
              { step: "01", label: "User or operator requests a metered service", note: "Executor packet, compliance report, cross-chain snapshot, etc." },
              { step: "02", label: "x402 Payment Required returned", note: "HTTP 402 response with TROPTIONS payment requirements" },
              { step: "03", label: "USDF payment submitted to x402 gateway", note: "Dev: LOCAL_ADAPTER mock. Prod: TROPTIONS TSN gateway required" },
              { step: "04", label: "TROPTIONS Layer 0 validates event", note: "Namespace billing record written, service authorized" },
              { step: "05", label: "Service rendered & proof anchored", note: "PDF/JSON artifact returned, IPFS CID + chain hash recorded" },
              { step: "06", label: "Audit trail logged", note: "Tamper-evident event written to estate audit log" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4 rounded-xl border border-navy-700 bg-navy-800/40 px-5 py-3">
                <span className="shrink-0 font-mono text-xs font-bold text-gold-500 mt-0.5">{s.step}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{s.label}</p>
                  <p className="text-xs text-slate-500">{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Capability matrix */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Capability Matrix</p>
          <h2 className="mb-6 text-2xl font-bold text-white">What is live, adapter, scaffold, or blocked</h2>
          <div className="overflow-hidden rounded-xl border border-navy-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 bg-navy-800">
                  <th className="py-3 pl-5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Capability</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="py-3 pr-5 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {capabilities.map((c, i) => (
                  <tr key={c.cap} className={`border-b border-navy-700/60 ${i % 2 === 0 ? "bg-navy-900/40" : "bg-navy-800/20"}`}>
                    <td className="py-3 pl-5 text-sm font-medium text-white">{c.cap}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${capCfg[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="py-3 pr-5 text-xs text-slate-400 hidden sm:table-cell">{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Production path */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Production Path</p>
          <h2 className="mb-4 text-2xl font-bold text-white">Requirements to enable live settlement</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Clock className="h-5 w-5 text-blue-400" />, title: "TSN Validators", desc: "Troptions-L1 validator nodes must be onboarded and running on production hardware." },
              { icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />, title: "Legal & Compliance", desc: "Stablecoin issuance, money transmission, and cross-border settlement require attorney sign-off." },
              { icon: <CheckCircle2 className="h-5 w-5 text-purple-400" />, title: "Control Hub Approval", desc: "Live bridge, issuance, and settlement events require multi-sig governance approval." },
              { icon: <CheckCircle2 className="h-5 w-5 text-cyan-400" />, title: "XRPL Operator Keys", desc: "Live XRPL bridge requires operator account, RPC endpoint, and trustline setup." },
              { icon: <CheckCircle2 className="h-5 w-5 text-cyan-400" />, title: "Stellar Horizon RPC", desc: "Live Stellar bridge requires Horizon endpoint, operator account, and asset authorization." },
              { icon: <CheckCircle2 className="h-5 w-5 text-gold-400" />, title: "TROPTIONS x402 Gateway", desc: "Production metering requires a live x402 gateway connected to TSN or Apostle Chain." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="mb-3">{icon}</div>
                <p className="text-sm font-bold text-white mb-2">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Link href="/control-hub" className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Control Hub →
          </Link>
          <Link href="/troptions" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Powered by TROPTIONS
          </Link>
          <Link href="/x402" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            x402 Service Catalog
          </Link>
          <Link href="/protocol/troptions-l1" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Troptions-L1 Rust Layer
          </Link>
        </div>

      </div>
    </div>
  );
}
