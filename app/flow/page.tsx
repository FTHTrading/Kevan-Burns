"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe, Shield, Lock, Key, FileText, Wallet, Users, CheckCircle,
  Clock, ArrowRight, Zap, Server, GitBranch, AlertTriangle,
} from "lucide-react";

// ── Node types ──────────────────────────────────────────────────────────────

type NodeId =
  | "owner" | "namespace" | "vault" | "documents" | "wallets"
  | "executor" | "beneficiary" | "guardian" | "layer0"
  | "policy" | "release" | "ipfs" | "x402";

interface FlowNode {
  id: NodeId;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;          // tailwind border/text color token
  bg: string;             // tailwind bg token
  group: "owner" | "infrastructure" | "people" | "protocol";
  description: string;
  connections: NodeId[];
}

const NODES: FlowNode[] = [
  {
    id: "owner",
    label: "Vault Owner",
    sublabel: "Estate principal",
    icon: <Shield className="h-5 w-5" />,
    color: "text-gold-400 border-gold-500",
    bg: "bg-gold-500/10",
    group: "owner",
    description: "The person who creates and controls the namespace. Holds the master encryption key. Sets the release policy and appoints executors, beneficiaries, and guardians.",
    connections: ["namespace", "executor", "beneficiary", "guardian"],
  },
  {
    id: "namespace",
    label: ".legacy Namespace",
    sublabel: "Root estate identity",
    icon: <Globe className="h-5 w-5" />,
    color: "text-gold-400 border-gold-500",
    bg: "bg-gold-500/10",
    group: "owner",
    description: "The sovereign on-chain identity for this estate. Anchored on Layer 0. Parents all vaults, wallet registrations, and member assignments.",
    connections: ["vault", "layer0"],
  },
  {
    id: "vault",
    label: "Vault",
    sublabel: "Encrypted container",
    icon: <Lock className="h-5 w-5" />,
    color: "text-cyan-400 border-cyan-500",
    bg: "bg-cyan-500/10",
    group: "infrastructure",
    description: "A logical container within the namespace. Holds encrypted document CIDs, wallet references, and a release policy. One namespace can have many vaults.",
    connections: ["documents", "wallets", "policy", "ipfs"],
  },
  {
    id: "documents",
    label: "Documents",
    sublabel: "AES-256-GCM encrypted",
    icon: <FileText className="h-5 w-5" />,
    color: "text-slate-300 border-slate-600",
    bg: "bg-slate-700/20",
    group: "infrastructure",
    description: "Legal documents, deeds, will drafts, insurance policies — encrypted client-side with AES-256-GCM. Only CIDs stored on-chain. Server never sees plaintext.",
    connections: ["ipfs", "layer0"],
  },
  {
    id: "wallets",
    label: "Wallet Registry",
    sublabel: "Cross-chain addresses",
    icon: <Wallet className="h-5 w-5" />,
    color: "text-purple-400 border-purple-500",
    bg: "bg-purple-500/10",
    group: "infrastructure",
    description: "Registered wallet addresses across 8 chains (ETH, BTC, SOL, XRPL, XLM, MATIC, DOT, ATOM). Ownership verified via cross-chain relayer on Layer 0.",
    connections: ["layer0"],
  },
  {
    id: "executor",
    label: "Executor",
    sublabel: "Release trigger authority",
    icon: <Key className="h-5 w-5" />,
    color: "text-cyan-400 border-cyan-500",
    bg: "bg-cyan-500/10",
    group: "people",
    description: "Designated individual (attorney, trustee) with authority to begin the release process. Must verify identity via verifiable credential. Cannot release alone.",
    connections: ["policy"],
  },
  {
    id: "beneficiary",
    label: "Beneficiary",
    sublabel: "Post-release access",
    icon: <Users className="h-5 w-5" />,
    color: "text-purple-400 border-purple-500",
    bg: "bg-purple-500/10",
    group: "people",
    description: "Person or entity designated to receive scoped access to specific vault contents after the full release policy is satisfied. Receives decryption keys scoped to their allocation only.",
    connections: ["release"],
  },
  {
    id: "guardian",
    label: "Guardian",
    sublabel: "Policy attestation quorum",
    icon: <Shield className="h-5 w-5" />,
    color: "text-emerald-400 border-emerald-500",
    bg: "bg-emerald-500/10",
    group: "people",
    description: "Independent party whose signature is required in a quorum (e.g. 2-of-3) as part of the release policy. Protects against executor coercion or fraud.",
    connections: ["policy"],
  },
  {
    id: "layer0",
    label: "Layer 0",
    sublabel: "Validator network",
    icon: <Server className="h-5 w-5" />,
    color: "text-gold-400 border-gold-500",
    bg: "bg-gold-500/10",
    group: "protocol",
    description: "The infrastructure layer: Rust/Axum validator nodes that anchor namespace registrations, vault state, policy transitions, and cross-chain proofs. The source of truth.",
    connections: ["policy", "x402"],
  },
  {
    id: "ipfs",
    label: "IPFS",
    sublabel: "Encrypted document storage",
    icon: <GitBranch className="h-5 w-5" />,
    color: "text-slate-400 border-slate-600",
    bg: "bg-slate-700/20",
    group: "protocol",
    description: "Distributed content-addressed storage for encrypted vault documents. CIDs are anchored on Layer 0 — tampering changes the CID and breaks the anchor, making it detectable.",
    connections: [],
  },
  {
    id: "policy",
    label: "Release Policy",
    sublabel: "5-condition gate",
    icon: <Zap className="h-5 w-5" />,
    color: "text-yellow-400 border-yellow-500",
    bg: "bg-yellow-500/10",
    group: "protocol",
    description: "The multi-proof gate evaluated by the Layer 0 policy engine. Requires: death certificate + executor verification + attorney attestation + guardian quorum + 30-day waiting period.",
    connections: ["release"],
  },
  {
    id: "release",
    label: "Controlled Release",
    sublabel: "Scoped decryption keys",
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-emerald-400 border-emerald-500",
    bg: "bg-emerald-500/10",
    group: "protocol",
    description: "The terminal state: once all 5 policy conditions are met, the policy engine emits a release event. Beneficiaries receive scoped decryption keys for their allocation only.",
    connections: [],
  },
  {
    id: "x402",
    label: "x402 Gateway",
    sublabel: "Metered API services",
    icon: <Zap className="h-5 w-5" />,
    color: "text-gold-400 border-gold-500",
    bg: "bg-gold-500/10",
    group: "protocol",
    description: "HTTP 402 micro-payment protocol for metered services: verification, document notarisation, cross-chain relay proofs. Settled on Apostle Chain in ATP.",
    connections: [],
  },
];

const GROUP_LABELS: Record<string, string> = {
  owner: "Estate Owner",
  infrastructure: "Vault Infrastructure",
  people: "People & Roles",
  protocol: "Protocol Layer",
};

const GROUP_COLORS: Record<string, string> = {
  owner: "border-gold-500/30 bg-gold-500/5",
  infrastructure: "border-cyan-500/20 bg-cyan-500/5",
  people: "border-purple-500/20 bg-purple-500/5",
  protocol: "border-slate-600/30 bg-slate-700/10",
};

// Visual flow stages
const FLOW_STAGES = [
  {
    id: "setup",
    label: "1. Setup",
    color: "bg-blue-500",
    steps: [
      { icon: <Globe className="h-4 w-4 text-gold-400" />, text: "Register .legacy namespace on Layer 0" },
      { icon: <Shield className="h-4 w-4 text-cyan-400" />, text: "Create one or more vaults" },
      { icon: <FileText className="h-4 w-4 text-slate-300" />, text: "Upload & encrypt documents (AES-256-GCM)" },
      { icon: <Wallet className="h-4 w-4 text-purple-400" />, text: "Register cross-chain wallets" },
    ],
  },
  {
    id: "configure",
    label: "2. Configure",
    color: "bg-gold-500",
    steps: [
      { icon: <Key className="h-4 w-4 text-cyan-400" />, text: "Assign executors" },
      { icon: <Users className="h-4 w-4 text-purple-400" />, text: "Assign beneficiaries with allocations" },
      { icon: <Shield className="h-4 w-4 text-emerald-400" />, text: "Set guardian quorum" },
      { icon: <Zap className="h-4 w-4 text-yellow-400" />, text: "Configure 5-condition release policy" },
    ],
  },
  {
    id: "active",
    label: "3. Active",
    color: "bg-emerald-500",
    steps: [
      { icon: <CheckCircle className="h-4 w-4 text-emerald-400" />, text: "Vault live — contents encrypted at rest" },
      { icon: <Clock className="h-4 w-4 text-slate-400" />, text: "Annual reviews, document updates" },
      { icon: <GitBranch className="h-4 w-4 text-slate-400" />, text: "CIDs anchored on Layer 0 continuously" },
    ],
  },
  {
    id: "release",
    label: "4. Release",
    color: "bg-purple-500",
    steps: [
      { icon: <FileText className="h-4 w-4 text-red-400" />, text: "Death certificate uploaded by executor" },
      { icon: <Key className="h-4 w-4 text-cyan-400" />, text: "Executor identity verified (verifiable credential)" },
      { icon: <Shield className="h-4 w-4 text-emerald-400" />, text: "Attorney attestation + guardian quorum signed" },
      { icon: <Clock className="h-4 w-4 text-yellow-400" />, text: "30-day waiting period (contestable)" },
      { icon: <CheckCircle className="h-4 w-4 text-emerald-400" />, text: "Scoped decryption keys released to beneficiaries" },
    ],
  },
];

export default function FlowPage() {
  const [selected, setSelected] = useState<NodeId | null>(null);

  const selectedNode = selected ? NODES.find((n) => n.id === selected) : null;

  const groups = ["owner", "infrastructure", "people", "protocol"] as const;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Header */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Interactive</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold text-white md:text-5xl leading-tight mb-4">
          Protocol <span className="text-gold-400">Flow Map</span>
        </h1>
        <p className="mx-auto max-w-xl text-slate-400 text-lg">
          Click any node to explore how it connects. Trace the path from namespace creation to controlled asset release.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">

        {/* ── Interactive Node Map ─────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gold-500 mb-6">Component Map — click a node</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {groups.map((group) => (
              <div key={group} className={`rounded-2xl border p-4 ${GROUP_COLORS[group]}`}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{GROUP_LABELS[group]}</p>
                <div className="space-y-2">
                  {NODES.filter((n) => n.group === group).map((node) => {
                    const isSelected = selected === node.id;
                    const isConnected = selectedNode?.connections.includes(node.id) ||
                      NODES.find((n) => n.id === selected)?.id === node.id ||
                      (selected && node.connections.includes(selected));
                    const isDimmed = selected && !isSelected && !isConnected;

                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelected(isSelected ? null : node.id)}
                        className={`w-full rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                          isSelected
                            ? `${node.color} ${node.bg} shadow-lg scale-105`
                            : isConnected
                            ? `border-white/30 bg-white/5 scale-102`
                            : isDimmed
                            ? "border-navy-700 bg-navy-800/30 opacity-30"
                            : `border-navy-700 bg-navy-800/50 hover:border-navy-500 hover:bg-navy-800`
                        }`}
                      >
                        <div className={`flex items-center gap-2 mb-0.5 ${isSelected ? node.color.split(" ")[0] : isConnected ? "text-slate-200" : "text-slate-400"}`}>
                          {node.icon}
                          <span className="text-xs font-semibold">{node.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 pl-7">{node.sublabel}</p>
                        {isSelected && node.connections.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                            {node.connections.map((c) => (
                              <span key={c} className="text-xs bg-white/10 text-slate-300 rounded px-1.5 py-0.5 flex items-center gap-1">
                                <ArrowRight className="h-2.5 w-2.5" />
                                {NODES.find((n) => n.id === c)?.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selectedNode ? (
            <div className={`rounded-2xl border-2 p-6 ${selectedNode.color} ${selectedNode.bg} transition-all`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${selectedNode.color} shrink-0`}>
                  {selectedNode.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{selectedNode.label}</h3>
                  <p className="text-xs text-slate-400 mb-3">{selectedNode.sublabel}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedNode.description}</p>
                  {selectedNode.connections.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Connects to</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.connections.map((c) => {
                          const cn = NODES.find((n) => n.id === c)!;
                          return (
                            <button
                              key={c}
                              onClick={() => setSelected(c)}
                              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10 ${cn.color}`}
                            >
                              {cn.icon}
                              {cn.label}
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-xs">Close</button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-navy-700 bg-navy-800/30 p-6 text-center text-sm text-slate-500">
              ↑ Click any node above to see its description and connections
            </div>
          )}
        </section>

        {/* ── Linear Flow Diagram ──────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gold-500 mb-6">Lifecycle Flow</h2>

          {/* Desktop horizontal flow */}
          <div className="hidden md:flex items-stretch gap-0">
            {FLOW_STAGES.map((stage, si) => (
              <div key={stage.id} className="flex items-stretch flex-1">
                <div className="flex-1 rounded-none first:rounded-l-2xl last:rounded-r-2xl border border-navy-700 bg-navy-900 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                    <p className="text-xs font-bold text-white">{stage.label}</p>
                  </div>
                  <ul className="space-y-2.5">
                    {stage.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="shrink-0 mt-0.5">{step.icon}</span>
                        <span>{step.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {si < FLOW_STAGES.length - 1 && (
                  <div className="flex items-center px-0 z-10 -mx-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-0.5 bg-navy-600" />
                      <ArrowRight className="h-4 w-4 text-slate-600" />
                      <div className="w-6 h-0.5 bg-navy-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile vertical flow */}
          <div className="md:hidden space-y-4">
            {FLOW_STAGES.map((stage, si) => (
              <div key={stage.id}>
                <div className="rounded-2xl border border-navy-700 bg-navy-900 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                    <p className="text-xs font-bold text-white">{stage.label}</p>
                  </div>
                  <ul className="space-y-2.5">
                    {stage.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="shrink-0 mt-0.5">{step.icon}</span>
                        <span>{step.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {si < FLOW_STAGES.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-0.5 h-3 bg-navy-600" />
                      <ArrowRight className="h-4 w-4 text-slate-600 rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Release Gate Detail ──────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gold-500 mb-6">Release Gate — 5 Conditions</h2>
          <div className="relative">
            {/* Vertical wire */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-yellow-500/50 via-yellow-500/30 to-emerald-500/50 hidden sm:block" />

            <div className="space-y-3">
              {[
                { n: 1, label: "Death Certificate", detail: "Certified copy uploaded & hash anchored on Layer 0", icon: <FileText className="h-4 w-4 text-red-400" />, done: false },
                { n: 2, label: "Executor Verification", detail: "2-of-2 executors confirm via verifiable credential", icon: <Key className="h-4 w-4 text-cyan-400" />, done: false },
                { n: 3, label: "Attorney Attestation", detail: "Attorney signs release intent on Layer 0", icon: <Shield className="h-4 w-4 text-blue-400" />, done: false },
                { n: 4, label: "Guardian Quorum", detail: "2-of-3 guardians sign — prevents coercion", icon: <Users className="h-4 w-4 text-emerald-400" />, done: false },
                { n: 5, label: "30-Day Waiting Period", detail: "Contestable cool-down mirrors probate notice requirements", icon: <Clock className="h-4 w-4 text-yellow-400" />, done: false },
              ].map((c, i) => (
                <div key={c.n} className="flex items-center gap-4 sm:pl-16 relative">
                  {/* Node on wire */}
                  <div className="absolute left-4 hidden sm:flex h-8 w-8 items-center justify-center rounded-full border-2 border-yellow-500/50 bg-navy-900 text-xs font-bold text-yellow-400 z-10">
                    {c.n}
                  </div>
                  {/* Card */}
                  <div className="flex-1 flex items-center gap-4 rounded-xl border border-navy-700 bg-navy-800/50 px-5 py-4">
                    <div className="sm:hidden flex h-7 w-7 items-center justify-center rounded-full border border-yellow-500/30 bg-navy-900 text-xs font-bold text-yellow-400 shrink-0">
                      {c.n}
                    </div>
                    {c.icon}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">{c.label}</p>
                      <p className="text-xs text-slate-500">{c.detail}</p>
                    </div>
                    <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <AlertTriangle className="h-3 w-3" /> Awaiting
                    </span>
                  </div>
                </div>
              ))}

              {/* Terminal: Release */}
              <div className="flex items-center gap-4 sm:pl-16 relative mt-4">
                <div className="absolute left-4 hidden sm:flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/20 z-10">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1 flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-300">Controlled Release</p>
                    <p className="text-xs text-slate-400">Beneficiaries receive scoped decryption keys. Each allocation is independent.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex gap-3 flex-wrap border-t border-navy-800 pt-8">
          <Link href="/namespaces/register" className="btn-primary text-sm px-5 py-2.5">Register Your Namespace</Link>
          <Link href="/namespaces/demo" className="btn-secondary text-sm px-5 py-2.5">Try Demo Mode</Link>
          <Link href="/glossary" className="btn-secondary text-sm px-5 py-2.5">Terms & Definitions</Link>
        </div>
      </div>
    </div>
  );
}
