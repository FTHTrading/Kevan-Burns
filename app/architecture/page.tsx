import Image from "next/image";
import Link from "next/link";
import { Shield, Database, Lock, GitBranch, Users, FileText, ArrowRight } from "lucide-react";

const layers = [
  {
    step: "01",
    label: "Identity Layer",
    detail: "W3C DID + Verifiable Credentials · NIST SP 800-63-4 IAL 2/3 · owner, executor, attorney, guardian, beneficiary, auditor",
    color: "border-gold-500/40",
    icon: <Users className="h-5 w-5 text-gold-400" />,
  },
  {
    step: "02",
    label: "Vault Manifest",
    detail: "SHA-256 hashed asset manifest · versioned · signed by owner key · tamper-detectable",
    color: "border-cyan-500/40",
    icon: <FileText className="h-5 w-5 text-cyan-400" />,
  },
  {
    step: "03",
    label: "Private IPFS Storage",
    detail: "AES-256-GCM encrypted blobs · content-addressed CIDs · server never holds plaintext",
    color: "border-blue-500/40",
    icon: <Database className="h-5 w-5 text-blue-400" />,
  },
  {
    step: "04",
    label: "Blockchain Registry",
    detail: "Private chain anchoring · vault state · manifest hashes · audit events immutably recorded",
    color: "border-purple-500/40",
    icon: <GitBranch className="h-5 w-5 text-purple-400" />,
  },
  {
    step: "05",
    label: "Release Engine",
    detail: "5-condition multi-proof release · death certificate · attorney attestation · guardian quorum · waiting period",
    color: "border-emerald-500/40",
    icon: <Lock className="h-5 w-5 text-emerald-400" />,
  },
  {
    step: "06",
    label: "Beneficiary Access",
    detail: "Scoped credential release · executor-mediated · audit-logged · dispute-capable",
    color: "border-gold-500/40",
    icon: <Shield className="h-5 w-5 text-gold-400" />,
  },
];

const stackDetails = [
  { label: "Frontend", value: "Next.js 15 (App Router) · TypeScript 5 · Tailwind CSS 3.4" },
  { label: "Database", value: "PostgreSQL 15 · Prisma 5.22 (library engine)" },
  { label: "Encryption", value: "AES-256-GCM · Node.js crypto · SHA-256 manifest hashing" },
  { label: "Storage", value: "Private IPFS (helia/kubo) — mock adapter in dev" },
  { label: "Chain Registry", value: "Private JSON-RPC node — mock adapter in dev" },
  { label: "Identity", value: "W3C DID · Verifiable Credentials 2.0 · NIST SP 800-63-4" },
  { label: "Testing", value: "Vitest 2.1 (33 tests) · Playwright smoke suite" },
  { label: "Layer 0", value: "Legacy Layer 0 — Rust protocol scaffold (planned)" },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">System Architecture</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold text-white md:text-5xl leading-tight">
          Protocol stack built for<br />
          <span className="text-gold-400">cryptographic certainty</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Every layer of Legacy Vault Protocol is purpose-designed. From identity assurance to
          immutable audit anchoring — no hand-wavy security claims.
        </p>
      </section>

      {/* Architecture visual */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="overflow-hidden rounded-2xl border border-navy-700 bg-navy-900">
          <Image
            src="/images/legacy/system-architecture.png"
            alt="Legacy Vault Protocol — System Architecture"
            width={1200}
            height={675}
            className="w-full object-cover"
            priority
          />
        </div>
      </section>

      {/* Layer flow */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Protocol Layers</p>
        <h2 className="mb-10 text-center text-2xl font-bold text-white">How the stack flows</h2>
        <div className="relative">
          {/* connector line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-gold-500/40 via-cyan-500/20 to-emerald-500/40 hidden md:block" />
          <div className="space-y-4">
            {layers.map((l, i) => (
              <div key={l.step} className={`flex gap-5 rounded-xl border ${l.color} bg-navy-800/60 p-5 hover:bg-navy-800 transition-colors`}>
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-slate-600">{l.step}</span>
                  {l.icon}
                  {i < layers.length - 1 && <ArrowRight className="h-3 w-3 rotate-90 text-slate-700 mt-1 hidden md:block" />}
                </div>
                <div>
                  <p className="font-bold text-white mb-1">{l.label}</p>
                  <p className="text-sm text-slate-400">{l.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack table */}
      <section className="border-t border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Tech Stack</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">What it is built on</h2>
          <div className="overflow-hidden rounded-xl border border-navy-700">
            <table className="w-full text-sm">
              <tbody>
                {stackDetails.map((row, i) => (
                  <tr key={row.label} className={`border-b border-navy-700/60 ${i % 2 === 0 ? "bg-navy-800/40" : "bg-navy-900/40"}`}>
                    <td className="py-3 pl-5 pr-4 font-semibold text-gold-400 w-40">{row.label}</td>
                    <td className="py-3 pr-5 text-slate-300">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Implementation status */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Transparency</p>
        <h2 className="mb-10 text-center text-2xl font-bold text-white">Implemented vs. planned</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { badge: "Implemented", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5", items: ["AES-256-GCM encryption", "SHA-256 manifest hashing", "Prisma 14-model schema", "Multi-proof release engine", "5 Vitest test suites (33 tests)", "16 Next.js pages", "8 API routes", "Append-only audit log"] },
            { badge: "Mock / Adapter", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5", items: ["Private IPFS (in-memory mock)", "Blockchain registry (JSON mock)", "W3C DID (identity stub)", "Guardian quorum (schema ready)", "x402 billing (adapter stub)", "Attorney attestation (UI flow)"] },
            { badge: "Planned / Layer 0", color: "text-blue-400 border-blue-500/30 bg-blue-500/5", items: ["Legacy Layer 0 Rust chain", "Validator / node network", "Cross-chain relayer", "Live IPFS swarm node", ".legacy namespace DNS", "x402 production gateway", "Verifiable Credentials production"] },
          ].map((col) => (
            <div key={col.badge} className={`rounded-xl border p-5 ${col.color}`}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest">{col.badge}</p>
              <ul className="space-y-1.5">
                {col.items.map((item) => (
                  <li key={item} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="mt-0.5 text-slate-600">·</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-navy-800 px-6 py-14 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/layer0" className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Explore Layer 0 →
          </Link>
          <Link href="/compare" className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Compare vs Competitors
          </Link>
        </div>
      </section>
    </div>
  );
}
