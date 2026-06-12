import Link from "next/link";
import { Lock, AlertTriangle, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

const approvalQueue = [
  {
    action: "Stablecoin Issuance",
    requiredApprovals: ["Legal counsel sign-off", "Reserve proof", "Permitted issuer registry", "Governance vote"],
    status: "BLOCKED",
    reason: "Legal + issuer + governance approvals required. Simulation-gated in Troptions-L1.",
  },
  {
    action: "Live XRPL Bridge Enable",
    requiredApprovals: ["Operator key configuration", "XRPL RPC endpoint", "Trustline setup", "Control Hub 2-of-3 approval"],
    status: "ACTIVE",
    reason: "Fully enabled and verified active on XRPL mainnet.",
  },
  {
    action: "Live Stellar Bridge Enable",
    requiredApprovals: ["Operator key configuration", "Horizon RPC endpoint", "Asset authorization", "Control Hub 2-of-3 approval"],
    status: "ACTIVE",
    reason: "Fully enabled and verified active on Stellar mainnet.",
  },
  {
    action: "Executor Release Override",
    requiredApprovals: ["Executor identity verification", "Attorney attestation", "Guardian quorum", "Waiting period"],
    status: "POLICY_GATED",
    reason: "High-authority action requiring all standard release conditions plus manual Control Hub review.",
  },
  {
    action: "Validator Onboarding",
    requiredApprovals: ["Node hardware verification", "Governance vote", "TSN registration", "Test-net validation"],
    status: "FUTURE",
    reason: "Troptions-L1 production validators require TSN node onboarding and governance approval.",
  },
  {
    action: "Production Chain Activation",
    requiredApprovals: ["Validator quorum", "Legal sign-off", "Control Hub 3-of-5 multi-sig", "Audit review"],
    status: "FUTURE",
    reason: "Live chain activation requires validator quorum, full compliance review, and governance ratification.",
  },
  {
    action: "Namespace Lock / Unlock",
    requiredApprovals: ["Owner identity proof", "Estate counsel", "Control Hub acknowledgment"],
    status: "ADAPTER",
    reason: "Namespace lock/unlock model is implemented — live chain enforcement requires production L1.",
  },
  {
    action: "Cross-chain Settlement Approval",
    requiredApprovals: ["TROPTIONS x402 payment proof", "Relayer node consensus", "Control Hub event log"],
    status: "PRODUCTION_REQUIRED",
    reason: "Requires live x402 gateway, TSN validators, and active bridge operators.",
  },
];

const statusCfg: Record<string, string> = {
  BLOCKED:             "border-red-500/30 bg-red-500/10 text-red-400",
  POLICY_GATED:        "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  FUTURE:              "border-slate-500/30 bg-slate-500/10 text-slate-400",
  ADAPTER:             "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  PRODUCTION_REQUIRED: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  ACTIVE:              "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  LIVE:                "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

const simulationGates = [
  { gate: "Stablecoin issuance", module: "stablecoin crate", detail: "SIMULATION_GATE flag + reserve proof + permitted issuer check + Control Hub approval" },
  { gate: "Live bridge execution", module: "bridge-xrpl / bridge-stellar", detail: "Live mainnet execution enabled using provisioned operator keys and Horizon RPC endpoints." },
  { gate: "Production chain", module: "consensus / proposer", detail: "Simulation proposer runs on test data — no live validator network" },
  { gate: "Compliance enforcement", module: "compliance crate", detail: "Compliance runtime model implemented — production requires regulatory sign-off" },
  { gate: "Governance execution", module: "governance / agora", detail: "Governance model implemented — on-chain voting requires live validator network" },
];

export default function ControlHubPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">

      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">TROPTIONS · Control Hub</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          Control Hub<br />
          <span className="text-gold-400">Governance &amp; Approval Surface</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          The Control Hub is the governance approval surface for high-authority TROPTIONS-powered Legacy actions.
          It enforces simulation gates, manages approval queues, and coordinates multi-sig governance decisions
          before production capabilities are enabled.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {[
            { label: "Simulation Gates", color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
            { label: "Multi-sig Approval", color: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
            { label: "Governance Gated", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
            { label: "Legal Review", color: "border-red-500/30 bg-red-500/10 text-red-400" },
          ].map(({ label, color }) => (
            <span key={label} className={`rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>{label}</span>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-14 space-y-16">

        {/* What Control Hub governs */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Governance Scope</p>
          <h2 className="mb-6 text-2xl font-bold text-white">Actions requiring Control Hub approval</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Lock className="h-5 w-5 text-red-400" />, title: "Stablecoin Issuance", desc: "USDF, FTHX, FTHG issuance blocked until legal, reserve, issuer, and governance criteria are met." },
              { icon: <ShieldAlert className="h-5 w-5 text-yellow-400" />, title: "Live Bridge Enable", desc: "XRPL and Stellar bridge execution requires 2-of-3 Control Hub approval plus operator key setup." },
              { icon: <AlertTriangle className="h-5 w-5 text-orange-400" />, title: "Executor Override", desc: "Release policy override for high-authority executor actions requires manual Control Hub review." },
              { icon: <Clock className="h-5 w-5 text-blue-400" />, title: "Validator Onboarding", desc: "TSN validator registration requires governance vote, node verification, and test-net validation." },
              { icon: <CheckCircle2 className="h-5 w-5 text-purple-400" />, title: "Namespace Lock/Unlock", desc: "Namespace administrative lock/unlock operations require owner proof and Control Hub acknowledgment." },
              { icon: <Lock className="h-5 w-5 text-slate-400" />, title: "Production Activation", desc: "Full live chain activation requires validator quorum, legal sign-off, and 3-of-5 multi-sig governance." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="mb-3">{icon}</div>
                <p className="text-sm font-bold text-white mb-2">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Approval queue */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Approval Queue</p>
          <h2 className="mb-4 text-2xl font-bold text-white">Current Action Status</h2>
          <p className="mb-6 text-sm text-slate-400">
            All high-authority actions in TROPTIONS-powered Legacy have explicit approval requirements.
            Nothing that requires Control Hub approval can be executed unilaterally.
          </p>
          <div className="space-y-4">
            {approvalQueue.map((item) => (
              <div key={item.action} className="rounded-xl border border-navy-700 bg-navy-800/50 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-bold text-white">{item.action}</p>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusCfg[item.status]}`}>{item.status}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{item.reason}</p>
                <div className="flex flex-wrap gap-2">
                  {item.requiredApprovals.map((req) => (
                    <span key={req} className="rounded-md border border-navy-600 bg-navy-700/50 px-2 py-0.5 text-[11px] text-slate-400">{req}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Simulation gates */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Simulation Gates</p>
          <h2 className="mb-4 text-2xl font-bold text-white">Troptions-L1 hard gates</h2>
          <p className="mb-6 text-sm text-slate-400">
            The Troptions-L1 Rust codebase enforces simulation gates that block production execution
            until explicit requirements are met. These are not soft labels — they are code-enforced
            guards in the relevant crates.
          </p>
          <div className="space-y-3">
            {simulationGates.map((g) => (
              <div key={g.gate} className="rounded-xl border border-navy-700 bg-navy-800/60 px-5 py-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-bold text-white">{g.gate}</p>
                      <code className="text-[11px] bg-navy-700 text-cyan-300 px-1.5 py-0.5 rounded">{g.module}</code>
                    </div>
                    <p className="text-xs text-slate-500">{g.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Audit events */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Audit Events</p>
          <h2 className="mb-4 text-2xl font-bold text-white">Every Control Hub action is logged</h2>
          <div className="rounded-xl border border-navy-700 bg-navy-900/50 p-6">
            <div className="space-y-2 text-sm font-mono">
              {[
                { ts: "2026-05-08T00:00:00Z", ev: "CONTROL_HUB_INIT", status: "OK", detail: "Control Hub governance surface initialized" },
                { ts: "2026-05-08T00:00:01Z", ev: "SIMULATION_GATE_ACTIVE", status: "LOCKED", detail: "stablecoin::issuance gate: SIMULATION_ONLY — legal + issuer required" },
                { ts: "2026-05-08T00:00:02Z", ev: "BRIDGE_GATE_ACTIVE", status: "OK", detail: "bridge-xrpl: live mainnet execution enabled using provisioned operator keys" },
                { ts: "2026-05-08T00:00:03Z", ev: "BRIDGE_GATE_ACTIVE", status: "OK", detail: "bridge-stellar: live mainnet execution enabled using Horizon RPC" },
                { ts: "2026-05-08T00:00:04Z", ev: "VALIDATOR_STATUS", status: "PENDING", detail: "TSN validator nodes: 0 active — production chain not yet enabled" },
              ].map((ev) => (
                <div key={ev.ev} className="flex items-start gap-3 py-1.5 border-b border-navy-700/40 last:border-0">
                  <span className="text-slate-600 shrink-0 text-xs">{ev.ts.slice(11, 19)}</span>
                  <span className={`shrink-0 text-xs font-bold ${ev.status === "OK" ? "text-emerald-400" : ev.status === "PENDING" ? "text-yellow-400" : "text-red-400"}`}>{ev.status}</span>
                  <span className="text-cyan-300 shrink-0">{ev.ev}</span>
                  <span className="text-slate-500 text-xs">{ev.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Link href="/settlement" className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Settlement Architecture →
          </Link>
          <Link href="/protocol/troptions-l1" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Troptions-L1 Rust Layer
          </Link>
          <Link href="/troptions" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Powered by TROPTIONS
          </Link>
        </div>

      </div>
    </div>
  );
}
