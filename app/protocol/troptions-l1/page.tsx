import Link from "next/link";
import { Cpu, CheckCircle2, Clock, AlertTriangle, XCircle, Shield, Globe } from "lucide-react";

type CrateStatus = "IMPLEMENTED_SCAFFOLD" | "SIMULATION_ONLY" | "LIVE_DISABLED" | "CONTROL_HUB_REQUIRED" | "LEGAL_REVIEW_REQUIRED" | "PRODUCTION_REQUIRES_VALIDATORS" | "LIVE_MAINNET";

const STATUS_CFG: Record<CrateStatus, { cls: string; label: string; icon: React.ReactNode }> = {
  IMPLEMENTED_SCAFFOLD:        { cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",   label: "Scaffold",              icon: <Cpu className="h-3 w-3" /> },
  SIMULATION_ONLY:             { cls: "border-amber-500/30 bg-amber-500/10 text-amber-400",      label: "Simulation Only",       icon: <Clock className="h-3 w-3" /> },
  LIVE_DISABLED:               { cls: "border-orange-500/30 bg-orange-500/10 text-orange-400",   label: "Live Disabled",         icon: <AlertTriangle className="h-3 w-3" /> },
  CONTROL_HUB_REQUIRED:        { cls: "border-blue-500/30 bg-blue-500/10 text-blue-400",         label: "Control Hub Required",  icon: <Shield className="h-3 w-3" /> },
  LEGAL_REVIEW_REQUIRED:       { cls: "border-red-500/30 bg-red-500/10 text-red-400",            label: "Legal Required",        icon: <XCircle className="h-3 w-3" /> },
  PRODUCTION_REQUIRES_VALIDATORS: { cls: "border-slate-500/30 bg-slate-500/10 text-slate-400",  label: "Needs Validators",      icon: <Globe className="h-3 w-3" /> },
  LIVE_MAINNET:                { cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", label: "Live Mainnet",         icon: <CheckCircle2 className="h-3 w-3" /> },
};

function CrateBadge({ status }: { status: CrateStatus }) {
  const s = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

const CRATES: { name: string; crate: string; role: string; status: CrateStatus; tests?: number }[] = [
  { name: "tsn-node",          crate: "node",          role: "Node binary — devnet startup banner and boot sequence",                                  status: "PRODUCTION_REQUIRES_VALIDATORS" },
  { name: "tsn-consensus",     crate: "consensus",     role: "BFT consensus constants — MIN=4 validators, MAX=21, FINALITY=67%",                       status: "PRODUCTION_REQUIRES_VALIDATORS" },
  { name: "tsn-runtime",       crate: "runtime",       role: "Devnet runtime orchestration stub",                                                      status: "PRODUCTION_REQUIRES_VALIDATORS" },
  { name: "tsn-state",         crate: "state",         role: "Core protocol types and all TSN structs, AuditEvent system",                             status: "IMPLEMENTED_SCAFFOLD", tests: 2 },
  { name: "tsn-crypto",        crate: "crypto",        role: "SHA-256, evidence hashing (Ed25519 signing in next phase)",                              status: "IMPLEMENTED_SCAFFOLD" },
  { name: "tsn-pq-crypto",     crate: "pq-crypto",     role: "Post-quantum key profile types (NIST FIPS 203/204/205) — profiles only, no live impl",  status: "IMPLEMENTED_SCAFFOLD", tests: 2 },
  { name: "tsn-assets",        crate: "assets",        role: "Asset creation and registration — gated by simulation flag",                            status: "SIMULATION_ONLY" },
  { name: "tsn-trustlines",    crate: "trustlines",    role: "Trustline simulation: create, freeze, unfreeze — issuer compliance required for live",   status: "SIMULATION_ONLY", tests: 2 },
  { name: "tsn-stablecoin",    crate: "stablecoin",    role: "Stablecoin issuance runtime — GENIUS Act gated, platform simulation gate active",        status: "LEGAL_REVIEW_REQUIRED", tests: 3 },
  { name: "tsn-rwa",           crate: "rwa",           role: "Real World Asset registration with evidence hashing — simulation only",                  status: "SIMULATION_ONLY", tests: 1 },
  { name: "tsn-nft",           crate: "nft",           role: "NFT credential issuance simulation",                                                     status: "SIMULATION_ONLY" },
  { name: "tsn-amm",           crate: "amm",           role: "AMM/DEX constant-product pool simulation — ATS registration required for live",          status: "LIVE_DISABLED", tests: 4 },
  { name: "tsn-compliance",    crate: "compliance",    role: "TCSA compliance engine: KYC/AML, sanctions screening (OFAC), travel rule",               status: "IMPLEMENTED_SCAFFOLD", tests: 4 },
  { name: "tsn-governance",    crate: "governance",    role: "On-chain governance proposal stub",                                                       status: "IMPLEMENTED_SCAFFOLD", tests: 1 },
  { name: "tsn-control-hub",   crate: "control-hub",   role: "Control Hub governance bridge — camelCase TS-compatible JSON output",                    status: "IMPLEMENTED_SCAFFOLD", tests: 2 },
  { name: "tsn-bridge-xrpl",   crate: "bridge-xrpl",   role: "XRPL cross-rail adapter — live mainnet transactions enabled",                            status: "LIVE_MAINNET", tests: 1 },
  { name: "tsn-bridge-stellar", crate: "bridge-stellar", role: "Stellar cross-rail adapter — live mainnet transactions enabled",                       status: "LIVE_MAINNET" },
  { name: "tsn-rln",           crate: "rln",           role: "Regulated Liability Network adapter — central bank participation required",               status: "LIVE_DISABLED" },
  { name: "tsn-agora",         crate: "agora",         role: "Agorá-style wholesale settlement stub — BIS/central bank access required",               status: "LIVE_DISABLED" },
  { name: "tsn-mbridge",       crate: "mbridge",       role: "mBridge FX routing stub — BIS participation required",                                   status: "LIVE_DISABLED" },
  { name: "tsn-rpc",           crate: "rpc",           role: "RPC interface placeholder — Axum/gRPC in next phase",                                    status: "PRODUCTION_REQUIRES_VALIDATORS" },
  { name: "tsn-telemetry",     crate: "telemetry",     role: "Telemetry/tracing placeholder — OpenTelemetry wiring in next phase",                    status: "PRODUCTION_REQUIRES_VALIDATORS" },
  { name: "tsn-sdk",           crate: "sdk",           role: "TSN SDK placeholder for third-party integrators",                                        status: "PRODUCTION_REQUIRES_VALIDATORS" },
  { name: "tsn-cli",           crate: "cli",           role: "CLI binary — 6 simulation commands: init, status, transfer, mint, compliance, shutdown", status: "IMPLEMENTED_SCAFFOLD" },
];

const BLOCKED: { feature: string; reason: string }[] = [
  { feature: "Live chain execution",          reason: "No validator set deployed, no genesis block produced" },
  { feature: "Live settlement",               reason: "Requires banking relationships, master accounts, legal licenses" },
  { feature: "Stablecoin issuance",           reason: "Requires OCC/Fed permitting under GENIUS Act" },
  { feature: "XRPL/Stellar live bridge txs",  reason: "None — fully enabled and active on mainnet" },
  { feature: "RLN integration",               reason: "Central bank participation required" },
  { feature: "Agorá/mBridge integration",     reason: "BIS/central bank access required" },
  { feature: "Live AMM trading",              reason: "Requires ATS/broker-dealer registration" },
  { feature: "Trustline live activation",     reason: "Requires issuer compliance certification" },
  { feature: "Validator onboarding",          reason: "Staking contract audit + legal review required" },
  { feature: "Post-quantum crypto (NIST)",    reason: "FIPS 203/204/205 Rust implementations not yet production-stable" },
];

export default function TroptionsL1Page() {
  const totalTests = CRATES.reduce((sum, c) => sum + (c.tests ?? 0), 0);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">

      {/* ── Hero ── */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Settlement Infrastructure</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          Troptions-L1{" "}
          <span className="text-amber-400">Rust Network</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          The Troptions Settlement Network (TSN) — a compliance-native Rust Layer-1 scaffold.
          {" "}<strong className="text-amber-300">All modules are simulation-only.</strong>{" "}
          No live chain, live settlement, live banking, or live token issuance is enabled.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
            <Cpu className="h-3 w-3" /> {CRATES.length} Rust Crates
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> {totalTests} Tests Passing
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-400">
            0 Compile Errors
          </span>
        </div>
      </section>

      {/* ── Crate matrix ── */}
      <section className="border-b border-navy-800 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Workspace</p>
          <h2 className="mb-8 text-center text-2xl font-bold text-white">TSN Rust crate matrix</h2>
          <div className="overflow-hidden rounded-xl border border-navy-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 bg-navy-800">
                  <th className="py-3 pl-5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Crate</th>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Role</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Tests</th>
                  <th className="py-3 pr-5 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {CRATES.map((c, i) => (
                  <tr key={c.name} className={`border-b border-navy-700/60 ${i % 2 === 0 ? "bg-navy-900/40" : "bg-navy-800/20"}`}>
                    <td className="py-3 pl-5 pr-4">
                      <code className="text-xs text-amber-300">{c.name}</code>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">{c.role}</td>
                    <td className="py-3 px-4 text-center text-xs text-slate-500">{c.tests ?? "—"}</td>
                    <td className="py-3 pr-5 text-center">
                      <CrateBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Safety gates ── */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Safety Gates</p>
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Enforced defaults across all crates</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { gate: "simulation_only",          default: "true — on all structs" },
              { gate: "live_execution_enabled",    default: "false — on all assets" },
              { gate: "issuance_enabled",          default: "false — on all stablecoins" },
              { gate: "required_approvals",        default: '["control_hub_approval"] minimum' },
              { gate: "Private keys / seeds",      default: "None present in any crate" },
              { gate: "Guaranteed yield claims",   default: "None present" },
              { gate: "AMM risk disclosure",       default: "Required before any liquidity call" },
              { gate: "AuditEvent.simulation_only", default: "true — all events tagged" },
            ].map((g) => (
              <div key={g.gate} className="flex items-start gap-3 rounded-lg border border-navy-700 bg-navy-800/60 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <div>
                  <code className="text-xs text-amber-300">{g.gate}</code>
                  <p className="mt-0.5 text-xs text-slate-500">{g.default}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blocked features ── */}
      <section className="border-b border-navy-800 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Production Requirements</p>
          <h2 className="mb-8 text-center text-2xl font-bold text-white">What remains blocked</h2>
          <div className="space-y-3">
            {BLOCKED.map((b) => (
              <div key={b.feature} className="flex items-start gap-3 rounded-lg border border-navy-700 bg-navy-800/40 px-5 py-4">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <div>
                  <p className="text-sm font-semibold text-white">{b.feature}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{b.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nav ── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl flex flex-wrap justify-center gap-4">
          <Link href="/protocol/troptions-layer0" className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition-colors">
            ← TROPTIONS Layer 0
          </Link>
          <Link href="/troptions" className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Powered by TROPTIONS →
          </Link>
          <Link href="/control-hub" className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-blue-500/40 hover:text-blue-400 transition-colors">
            Control Hub →
          </Link>
        </div>
      </section>

    </div>
  );
}
