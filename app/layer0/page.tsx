import Link from "next/link";
import { Server, Eye, Archive, Radio, Globe, Layers, Shield, GitBranch, Zap, FileText } from "lucide-react";

const nodeTypes = [
  {
    icon: <Shield className="h-6 w-6 text-gold-400" />,
    name: "Validator Node",
    role: "Consensus participant",
    description: "Proposes and validates blocks. Stakes identity in the namespace registry. Required for estate event finality.",
    status: "Planned — Rust scaffold ready",
    statusColor: "text-blue-400",
  },
  {
    icon: <Eye className="h-6 w-6 text-cyan-400" />,
    name: "Observer Node",
    role: "Read-only audit monitor",
    description: "Subscribes to all events without voting. Used by auditors, regulators, and compliance systems.",
    status: "Planned",
    statusColor: "text-blue-400",
  },
  {
    icon: <Archive className="h-6 w-6 text-purple-400" />,
    name: "Archive Node",
    role: "Historical retention",
    description: "Stores full state history. Required for legal evidence preservation and probate proceedings.",
    status: "Planned",
    statusColor: "text-blue-400",
  },
  {
    icon: <Radio className="h-6 w-6 text-emerald-400" />,
    name: "Relayer Node",
    role: "Cross-chain event relay",
    description: "Routes proof anchors and state events between Legacy Layer 0 and connected chains (ETH, SOL, XRPL, Stellar).",
    status: "Planned",
    statusColor: "text-blue-400",
  },
  {
    icon: <Globe className="h-6 w-6 text-blue-400" />,
    name: "Gateway Node",
    role: "External integration",
    description: "API-accessible entry point for institutional integrations, DID resolvers, and attorney systems.",
    status: "Planned",
    statusColor: "text-blue-400",
  },
];

const modules = [
  { icon: <Layers className="h-5 w-5 text-gold-400" />, name: "Namespace Registry", crate: "namespace-registry", detail: "On-chain namespace creation, ownership, member roles, and lifecycle state transitions." },
  { icon: <FileText className="h-5 w-5 text-cyan-400" />, name: "Vault Manifest Anchoring", crate: "vault-anchor", detail: "Immutable anchoring of SHA-256 manifest hashes per vault state change." },
  { icon: <Shield className="h-5 w-5 text-purple-400" />, name: "Policy Registry", crate: "policy-engine", detail: "On-chain release policy snapshots, guardian quorum configs, and waiting period enforcement." },
  { icon: <Server className="h-5 w-5 text-blue-400" />, name: "Executor / Guardian Attestations", crate: "vault-anchor", detail: "Cryptographic attestation records for executor authority and guardian approvals." },
  { icon: <GitBranch className="h-5 w-5 text-emerald-400" />, name: "Release Event Recording", crate: "audit-events", detail: "Final release proofs anchored with timestamp, parties involved, and condition satisfaction hash." },
  { icon: <Eye className="h-5 w-5 text-slate-400" />, name: "Audit Event Stream", crate: "audit-events", detail: "All 22 audit action types written to chain. Append-only. Tamper-detectable." },
  { icon: <Radio className="h-5 w-5 text-yellow-400" />, name: "Cross-chain Routing Metadata", crate: "cross-chain-relayer", detail: "External chain asset references, wallet mappings, and proof routing instructions." },
  { icon: <Zap className="h-5 w-5 text-gold-400" />, name: "x402 Payment Hooks", crate: "x402-hooks", detail: "Service metering, operator action billing, and machine-payable API access settlement." },
];

export default function Layer0Page() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Legacy Layer 0</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold text-white md:text-5xl leading-tight">
          A sovereign coordination layer<br />
          <span className="text-gold-400">built in Rust</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Legacy Layer 0 is the protocol substrate beneath the vault application — handling namespace
          registry, estate event anchoring, validator participation, cross-chain proof routing, and
          x402 service settlement.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400">
          Protocol Architecture — Rust Scaffold Ready · Production Deployment Planned
        </div>
      </section>

      {/* Protocol positioning */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Chain Role", value: "Namespace registry + estate event settlement + cross-chain proof coordination" },
              { label: "Runtime Language", value: "Rust — memory-safe, high-performance, ideal for sovereign protocol infrastructure" },
              { label: "Consensus Model", value: "Authority-based PoS for early institutional deployments. Upgrade path to permissionless PoS defined." },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">{item.label}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Node types */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Node Architecture</p>
        <h2 className="mb-10 text-center text-2xl font-bold text-white">5 node types</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nodeTypes.map((node) => (
            <div key={node.name} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5 hover:border-gold-600/30 transition-colors">
              <div className="mb-3 flex items-center justify-between">
                {node.icon}
                <span className={`text-xs font-semibold ${node.statusColor}`}>{node.status}</span>
              </div>
              <p className="font-bold text-white text-sm">{node.name}</p>
              <p className="text-xs text-gold-500/70 mb-2">{node.role}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core modules */}
      <section className="border-t border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Protocol Modules</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">8 core modules</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((mod) => (
              <div key={mod.name} className="flex gap-4 rounded-xl border border-navy-700 bg-navy-800/40 p-4">
                <div className="flex-shrink-0 mt-0.5">{mod.icon}</div>
                <div>
                  <p className="font-semibold text-white text-sm">{mod.name}</p>
                  <p className="text-xs text-slate-500 mb-1">crate: <code className="text-gold-500/70">{mod.crate}</code></p>
                  <p className="text-xs text-slate-400 leading-relaxed">{mod.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crate structure */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Repository Structure</p>
        <h2 className="mb-8 text-center text-2xl font-bold text-white">Rust crate layout</h2>
        <div className="rounded-xl border border-navy-700 bg-navy-900 p-6 font-mono text-sm">
          <pre className="text-slate-300 leading-relaxed whitespace-pre">{`protocol/layer0/
├── node/              # Node binary — CLI, P2P, RPC
├── runtime/           # Block execution runtime
└── crates/
    ├── namespace-registry/   # .legacy namespace on-chain model
    ├── vault-anchor/         # Manifest + attestation anchoring
    ├── policy-engine/        # Release policy on-chain enforcement
    ├── audit-events/         # Event stream + append-only log
    ├── x402-hooks/           # Payment settlement integration
    └── cross-chain-relayer/  # Proof routing + chain adapters`}</pre>
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          Scaffold created at <code className="text-gold-500/60">protocol/layer0/</code> — each crate has a README with purpose, types, events, interfaces, and TODOs.
        </p>
      </section>

      {/* CTA */}
      <section className="border-t border-navy-800 px-6 py-14 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/cross-chain" className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Cross-chain Design →
          </Link>
          <Link href="/x402" className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            x402 Integration
          </Link>
          <Link href="/architecture" className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Full Architecture
          </Link>
        </div>
      </section>
    </div>
  );
}
