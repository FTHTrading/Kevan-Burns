import Image from "next/image";
import Link from "next/link";
import { Shield, Lock, Key, FileText, Wallet, Users, Eye, GitBranch, Clock } from "lucide-react";

const capabilities = [
  {
    icon: <Lock className="h-6 w-6 text-gold-400" />,
    title: "Encrypted Vaults",
    status: "Implemented",
    statusColor: "text-emerald-400",
    body: "AES-256-GCM encryption applied to every document before IPFS upload. The server stores only ciphertext, IVs, and tags — never plaintext.",
  },
  {
    icon: <Users className="h-6 w-6 text-gold-400" />,
    title: "Executor Workflow",
    status: "Implemented",
    statusColor: "text-emerald-400",
    body: "Guided executor portal with claim submission, identity verification step, and multi-stage review. Role-scoped access enforced at the API layer.",
  },
  {
    icon: <Shield className="h-6 w-6 text-gold-400" />,
    title: "Guardian Quorum",
    status: "Implemented (schema + engine)",
    statusColor: "text-yellow-400",
    body: "N-of-M guardian approval required before any release. No single party — executor, attorney, or beneficiary — can force a vault open.",
  },
  {
    icon: <Key className="h-6 w-6 text-gold-400" />,
    title: "Multi-Proof Release",
    status: "Implemented",
    statusColor: "text-emerald-400",
    body: "5 simultaneous conditions: identity verification, death proof hash, attorney attestation, guardian quorum, and configurable waiting period.",
  },
  {
    icon: <FileText className="h-6 w-6 text-gold-400" />,
    title: "Legal Document Filing",
    status: "Implemented",
    statusColor: "text-emerald-400",
    body: "13 document types supported: will, trust deed, power of attorney, advance directive, beneficiary designation, and more.",
  },
  {
    icon: <Wallet className="h-6 w-6 text-gold-400" />,
    title: "Crypto Wallet Registry",
    status: "Implemented",
    statusColor: "text-emerald-400",
    body: "Owner-authorized public wallet addresses registered per vault. ETH, SOL, BTC, XRPL, Stellar, Base, and more. Zero private key collection — by design.",
  },
  {
    icon: <GitBranch className="h-6 w-6 text-gold-400" />,
    title: "Blockchain Audit Registry",
    status: "Mock adapter",
    statusColor: "text-yellow-400",
    body: "Vault registrations, manifest updates, and audit events anchored immutably. Chain adapter ready — mock in dev, production node required for live.",
  },
  {
    icon: <Eye className="h-6 w-6 text-gold-400" />,
    title: "Beneficiary Access",
    status: "Implemented",
    statusColor: "text-emerald-400",
    body: "Scoped read access granted only after full release conditions are met. Beneficiaries see only what the release policy grants them.",
  },
  {
    icon: <Clock className="h-6 w-6 text-gold-400" />,
    title: "Immutable Audit Trail",
    status: "Implemented",
    statusColor: "text-emerald-400",
    body: "22 audit action types. Append-only log with chain anchor hashes. Every mutation is recorded — create, update, upload, release, dispute.",
  },
];

const assetCategories = [
  "Cryptocurrency & Digital Assets",
  "Real Estate & Property Deeds",
  "Business Equity & Shares",
  "Investment Accounts",
  "Bank & Financial Accounts",
  "Intellectual Property",
  "Collectibles & Physical Assets",
  "Insurance Policies",
  "Retirement Accounts",
  "Digital Accounts & Subscriptions",
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Capabilities</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold text-white md:text-5xl leading-tight">
          Every feature your estate<br />
          <span className="text-gold-400">actually needs</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          From encrypted document storage to multi-chain wallet inventory and guardian quorum governance —
          Legacy Vault Protocol covers the full estate infrastructure lifecycle.
        </p>
      </section>

      {/* Capabilities wheel visual */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="overflow-hidden rounded-2xl border border-navy-700 bg-navy-900">
          <Image
            src="/images/legacy/capabilities-wheel.png"
            alt="Legacy Vault Protocol — Capabilities Overview"
            width={1200}
            height={675}
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* Capability cards */}
      <section className="border-t border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Feature Set</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">9 core capabilities</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <div key={cap.title} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5 hover:border-gold-600/40 transition-colors">
                <div className="mb-3 flex items-start justify-between">
                  {cap.icon}
                  <span className={`text-xs font-semibold ${cap.statusColor}`}>{cap.status}</span>
                </div>
                <h3 className="mb-2 font-bold text-white">{cap.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asset categories */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Asset Coverage</p>
        <h2 className="mb-8 text-center text-2xl font-bold text-white">10 asset categories</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assetCategories.map((cat, i) => (
            <div key={cat} className="flex items-center gap-3 rounded-lg border border-navy-700 bg-navy-800/40 px-4 py-3">
              <span className="text-xs font-bold text-gold-500/60">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm text-slate-300">{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-navy-800 px-6 py-14 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/vault/create" className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Create Your Vault →
          </Link>
          <Link href="/namespaces" className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Explore Namespaces
          </Link>
        </div>
      </section>
    </div>
  );
}
