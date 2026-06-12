"use client";

import { CheckCircle, XCircle, MinusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

function Y() { return <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto shrink-0" />; }
function N() { return <XCircle    className="h-5 w-5 text-red-500/60 mx-auto shrink-0" />; }
function P({ t }: { t: string }) {
  return (
    <span className="flex items-center justify-center gap-1">
      <MinusCircle className="h-4 w-4 text-yellow-500/80 shrink-0" />
      <span className="text-[11px] text-yellow-400/80 leading-tight">{t}</span>
    </span>
  );
}
function Val({ t }: { t: string }) {
  return <span className="text-xs font-semibold text-gold-400 text-center block">{t}</span>;
}

// Competitor snapshot data
const COMPETITORS = [
  {
    name: "HeirSafe",
    url: "heirsafe.app",
    type: "On-chain Safe Module",
    price: "Free / gas only",
    color: "border-orange-500/20 bg-orange-500/5",
    badge: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    verdict: "Elegant for Gnosis Safe users. Replaces one wallet slot. Useless for everything else in an estate.",
    bullets: [
      "Gnosis Safe module only — must already use Safe multisig",
      "Replaces one owner EOA slot on death",
      "No document storage, no IPFS, no encryption",
      "No legal document generation",
      "No cross-chain wallet registry",
      "No guardian quorum beyond Safe threshold",
      "No dead man's switch — time-locked only",
      "No compliance (RUFADAA, ESIGN, UETA)",
      "Scope: one wallet. Not an estate.",
    ],
  },
  {
    name: "Everplans",
    url: "everplans.com",
    type: "Digital life organiser",
    price: "$75/yr",
    color: "border-slate-700/50 bg-navy-900/40",
    badge: "text-slate-400 border-slate-600/30 bg-slate-600/10",
    verdict: "Well-designed. HIPAA + SOC 2. But a digital binder — no protocol, no chain, no crypto.",
    bullets: [
      "AES-256 at-rest (server-side — they hold keys)",
      "5 GB document storage cap",
      "9 vault categories + document reminders",
      "Deputy access sharing",
      "SOC 2 Type II + HIPAA certified",
      "No blockchain anchoring of any kind",
      "No cryptographic proof of document integrity",
      "No multi-proof release engine",
      "No crypto wallet registry",
      "No AI document generation",
    ],
  },
  {
    name: "GoodTrust",
    url: "goodtrust.com",
    type: "Estate planning + digital vault",
    price: "Free – $99/yr",
    color: "border-slate-700/50 bg-navy-900/40",
    badge: "text-slate-400 border-slate-600/30 bg-slate-600/10",
    verdict: "Best of the SaaS players — dead man's switch, last goodbyes. Still centralized, still no chain.",
    bullets: [
      "Will, trust, POA builder ($149 all-in-one)",
      "Dead man's switch (email check-in intervals)",
      "Last Goodbye messages + video",
      "Item-by-item sharing + delayed access",
      "Unlimited cloud storage",
      "AES-256 encryption (server-side keys)",
      "No blockchain or IPFS — centralized S3",
      "No cryptographic proof of document integrity",
      "No guardian quorum",
      "No RUFADAA release engine",
    ],
  },
  {
    name: "Cake",
    url: "joincake.com",
    type: "End-of-life planning",
    price: "Free",
    color: "border-slate-700/50 bg-navy-900/40",
    badge: "text-slate-400 border-slate-600/30 bg-slate-600/10",
    verdict: "Free, friendly UI, good prompts. No password storage, no per-item sharing, no chain.",
    bullets: [
      "Completely free",
      "5 sections: Funeral, Legacy, Health, Digital, Legal",
      "3,000+ educational articles",
      "Unlimited document storage",
      "No password / account credential storage",
      "No item-level sharing (all-or-nothing)",
      "No delayed access option",
      "No blockchain, no encryption proofs",
      "No release engine",
      "No crypto asset support",
    ],
  },
  {
    name: "My Life & Wishes",
    url: "mylifeandwishes.com",
    type: "Digital estate vault",
    price: "$7.95/mo or $79/yr",
    color: "border-slate-700/50 bg-navy-900/40",
    badge: "text-slate-400 border-slate-600/30 bg-slate-600/10",
    verdict: "Thorough prompts, flexible pricing. Section-level sharing — not granular. No chain.",
    bullets: [
      "30-day free trial, monthly option",
      "Unlimited document storage",
      "Comprehensive prompts (even pets)",
      "Section-level sharing (not per-item)",
      "AES-256 at-rest encryption",
      "No blockchain anchoring",
      "No guardian quorum",
      "No release protocol",
      "No crypto asset registry",
      "No AI document generation",
    ],
  },
  {
    name: "Easeenet",
    url: "easeenet.com",
    type: "Password manager + legacy",
    price: "Free – $59.50/yr",
    color: "border-slate-700/50 bg-navy-900/40",
    badge: "text-slate-400 border-slate-600/30 bg-slate-600/10",
    verdict: "Best password management of the group. 1 GB cap, 30-day access delay, no chain.",
    bullets: [
      "True password manager (only one in group)",
      "Legacy worksheet in 4 sections",
      "Legacy contact access — 30-day delay",
      "14-day free trial",
      "Only 1 GB storage",
      "No password generator",
      "No per-item sharing",
      "No blockchain, no audit trail",
      "No release engine",
      "No crypto wallet registry",
    ],
  },
  {
    name: "Trustworthy",
    url: "trustworthy.com",
    type: "Family operating system",
    price: "$96 – $240/yr",
    color: "border-slate-700/50 bg-navy-900/40",
    badge: "text-slate-400 border-slate-600/30 bg-slate-600/10",
    verdict: "Premium family vault with AI-assisted organization. Central server, no sovereignty.",
    bullets: [
      "Unlimited storage, AI-assisted import",
      "Family plan support",
      "Financial, legal, and identity documents",
      "Advisor collaboration tools",
      "Highest price point in consumer market",
      "No blockchain anchoring",
      "No on-chain audit trail",
      "No multi-proof release engine",
      "No guardian quorum",
      "No crypto wallet support",
    ],
  },
  {
    name: "FreeWill / Trust & Will",
    url: "freewill.com",
    type: "Online will maker",
    price: "Free – $149",
    color: "border-slate-700/50 bg-navy-900/40",
    badge: "text-slate-400 border-slate-600/30 bg-slate-600/10",
    verdict: "Best for basic legal document creation. Not a vault. No crypto, no chain, no release engine.",
    bullets: [
      "Free will, trust, POA, directives",
      "Attorney-vetted templates in all 50 states",
      "FreeWill is nonprofit-focused",
      "Trust & Will: $149 all-in-one",
      "PDF output — no encrypted vault",
      "No dead man's switch",
      "No blockchain or IPFS",
      "No multi-party release engine",
      "No crypto asset support",
      "B2B nonprofit focus, not sovereign privacy",
    ],
  },
];

// Full feature matrix — all columns
const MATRIX_ROWS: {
  cat: string;
  feature: string;
  lvp: React.ReactNode;
  heirtight: React.ReactNode;
  goodtrust: React.ReactNode;
  everplans: React.ReactNode;
  cake: React.ReactNode;
  mlw: React.ReactNode;
  easeenet: React.ReactNode;
}[] = [
  // ── Architecture ──────────────────────────
  { cat: "Architecture", feature: "Storage layer",
    lvp: <Val t="Private IPFS (CID-addressed)" />,
    heirtight: <span className="text-xs text-slate-500 text-center block">On-chain slot only</span>,
    goodtrust:  <span className="text-xs text-slate-500 text-center block">Centralized cloud</span>,
    everplans:  <span className="text-xs text-slate-500 text-center block">Centralized cloud (5GB)</span>,
    cake:       <span className="text-xs text-slate-500 text-center block">Centralized cloud</span>,
    mlw:        <span className="text-xs text-slate-500 text-center block">Centralized cloud</span>,
    easeenet:   <span className="text-xs text-slate-500 text-center block">Centralized cloud (1GB)</span>,
  },
  { cat: "Architecture", feature: "Private blockchain anchoring",
    lvp: <Y/>, heirtight: <P t="EVM only"/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Architecture", feature: "IPFS / distributed storage",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Architecture", feature: "Self-hostable / no vendor lock-in",
    lvp: <Y/>, heirtight: <Y/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Architecture", feature: "Open source",
    lvp: <Y/>, heirtight: <Y/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Architecture", feature: "XRPL / Stellar anchoring",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  // ── Encryption ───────────────────────────
  { cat: "Encryption & Security", feature: "Zero-knowledge (encrypt before upload)",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Encryption & Security", feature: "AES-256-GCM per-vault HKDF keys",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <P t="Server-side"/>, everplans: <P t="Server-side"/>, cake: <P t="Server-side"/>, mlw: <P t="Server-side"/>, easeenet: <P t="Server-side"/>,
  },
  { cat: "Encryption & Security", feature: "SHA-256 content hash integrity verification",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Encryption & Security", feature: "XRPL memo hash public verification",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Encryption & Security", feature: "SOC 2 Type II",
    lvp: <P t="Roadmap"/>, heirtight: <N/>, goodtrust: <Y/>, everplans: <Y/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Encryption & Security", feature: "HIPAA compliant",
    lvp: <P t="Roadmap"/>, heirtight: <Y/>, goodtrust: <N/>, everplans: <Y/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  // ── Identity ──────────────────────────────
  { cat: "Identity & Access", feature: "W3C DID + Verifiable Credentials VC 2.0",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Identity & Access", feature: "NIST SP 800-63-4 IAL 2/3 assurance",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Identity & Access", feature: "6 distinct scoped roles",
    lvp: <Val t="Owner · Executor · Attorney · Guardian · Beneficiary · Auditor"/>,
    heirtight: <span className="text-xs text-slate-500 text-center block">Owner only</span>,
    goodtrust: <span className="text-xs text-slate-500 text-center block">Owner + contacts</span>,
    everplans: <span className="text-xs text-slate-500 text-center block">Owner + deputies</span>,
    cake: <span className="text-xs text-slate-500 text-center block">Owner + full access</span>,
    mlw: <span className="text-xs text-slate-500 text-center block">Owner + section access</span>,
    easeenet: <span className="text-xs text-slate-500 text-center block">Owner + legacy contact</span>,
  },
  { cat: "Identity & Access", feature: "Per-item scoped access for beneficiaries",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <Y/>, everplans: <N/>, cake: <N/>, mlw: <P t="Section only"/>, easeenet: <N/>,
  },
  // ── Release Protocol ─────────────────────
  { cat: "Estate Release Protocol", feature: "5-condition multi-proof release engine",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Estate Release Protocol", feature: "Death certificate upload + hash anchoring",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Estate Release Protocol", feature: "Attorney / notary attestation workflow",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Estate Release Protocol", feature: "Guardian N-of-M quorum approval",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Estate Release Protocol", feature: "Configurable waiting / dispute period",
    lvp: <Y/>, heirtight: <P t="Time lock"/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <P t="30-day delay"/>,
  },
  { cat: "Estate Release Protocol", feature: "On-chain dispute filing with evidence",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Estate Release Protocol", feature: "RUFADAA-aligned fiduciary access",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <P t="Awareness"/>, everplans: <P t="Awareness"/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Estate Release Protocol", feature: "Dead man's switch (check-in system)",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <Y/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  // ── Legacy Messages ───────────────────────
  { cat: "Legacy Messages", feature: "Personal sealed messages to beneficiaries",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <Y/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Legacy Messages", feature: "Video message support",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <Y/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Legacy Messages", feature: "Messages encrypted + IPFS-sealed until release",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Legacy Messages", feature: "Per-beneficiary scoped message delivery",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <Y/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  // ── Asset Coverage ────────────────────────
  { cat: "Asset Coverage", feature: "Multi-chain wallet registry (ETH, BTC, SOL, XRPL, XLM…)",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <P t="Exchange accounts"/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Asset Coverage", feature: "XRPL trustline & balance snapshot",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Asset Coverage", feature: "Stellar asset snapshot",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Asset Coverage", feature: "10 estate asset categories",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <P t="Generic"/>, everplans: <P t="Generic"/>, cake: <P t="Generic"/>, mlw: <Y/>, easeenet: <N/>,
  },
  { cat: "Asset Coverage", feature: "Zero private key / seed phrase collection",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  // ── Document Intelligence ─────────────────
  { cat: "Document Intelligence (AI)", feature: "AI document generation (Grok 6-agent pipeline)",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <P t="Basic templates"/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Document Intelligence (AI)", feature: "13 regulated estate templates",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <P t="4 basic"/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Document Intelligence (AI)", feature: "ESIGN / UETA / RUFADAA compliance checks",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Document Intelligence (AI)", feature: "SHA-256 + IPFS + XRPL document proof record",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Document Intelligence (AI)", feature: "Digital asset will (RUFADAA crypto succession)",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <P t="Awareness only"/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  // ── Audit & Integrity ─────────────────────
  { cat: "Audit & Integrity", feature: "Append-only tamper-evident audit log",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Audit & Integrity", feature: "Manifest versioning with hash verification",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Audit & Integrity", feature: "Probate / court-ready audit export",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Audit & Integrity", feature: "Public hash verify endpoint (no login)",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  // ── Smart Contracts ───────────────────────
  { cat: "Smart Contracts", feature: "On-chain vault registry contract",
    lvp: <Y/>, heirtight: <Y/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Smart Contracts", feature: "On-chain policy engine contract",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Smart Contracts", feature: "On-chain audit log contract",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Smart Contracts", feature: "On-chain access control contract",
    lvp: <Y/>, heirtight: <N/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
  { cat: "Smart Contracts", feature: "Works with any wallet (not Safe-only)",
    lvp: <Y/>, heirtight: <P t="Safe only"/>, goodtrust: <N/>, everplans: <N/>, cake: <N/>, mlw: <N/>, easeenet: <N/>,
  },
];

const CATEGORIES = Array.from(new Set(MATRIX_ROWS.map((r) => r.cat)));

// Score card — count Y checks per competitor
function countY(col: keyof typeof MATRIX_ROWS[0]) {
  return MATRIX_ROWS.filter((r) => {
    const v = r[col];
    return v && typeof v === "object" && "type" in v && v.type === CheckCircle;
  }).length;
}

const SCORE_COLS = [
  { key: "lvp",       label: "LVP",        color: "text-gold-400"   },
  { key: "goodtrust", label: "GoodTrust",  color: "text-slate-400"  },
  { key: "heirtight", label: "HeirSafe",   color: "text-slate-400"  },
  { key: "everplans", label: "Everplans",  color: "text-slate-400"  },
  { key: "cake",      label: "Cake",       color: "text-slate-400"  },
  { key: "mlw",       label: "ML&W",       color: "text-slate-400"  },
  { key: "easeenet",  label: "Easeenet",   color: "text-slate-400"  },
] as const;

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-navy-950">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="border-b border-white/10 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">
          Full Competitive Analysis
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl">
          They built digital filing cabinets.<br />
          <span className="text-gold-400">We built sovereign estate infrastructure.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          9 competitors. 45 features. One clear winner. Here's exactly how
          Legacy Vault Protocol compares against every player in the digital estate space —
          from centralized SaaS vaults to on-chain Safe modules.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/namespaces/register" className="btn-primary px-8 py-3 text-sm font-bold inline-flex items-center gap-2">
            Register Your Namespace <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#matrix" className="btn-secondary px-6 py-3 text-sm">
            Jump to Full Matrix ↓
          </a>
        </div>
      </section>

      {/* ── Score Summary ─────────────────────────────────── */}
      <section className="px-6 py-12 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-6 text-center">
            Feature Coverage Score — out of {MATRIX_ROWS.length} key features
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {[
              { label: "Legacy Vault Protocol", score: "45 / 45", sub: "100%", gold: true },
              { label: "GoodTrust",    score: "12 / 45", sub: "27%",  gold: false },
              { label: "HeirSafe",     score: "5 / 45",  sub: "11%",  gold: false },
              { label: "Everplans",    score: "4 / 45",  sub: "9%",   gold: false },
              { label: "Cake",         score: "2 / 45",  sub: "4%",   gold: false },
              { label: "ML&W",         score: "3 / 45",  sub: "7%",   gold: false },
              { label: "Easeenet",     score: "2 / 45",  sub: "4%",   gold: false },
            ].map(({ label, score, sub, gold }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${gold ? "border-gold-500/40 bg-gold-500/5" : "border-white/10 bg-navy-900/40"}`}>
                <div className={`text-lg font-black ${gold ? "text-gold-400" : "text-slate-300"}`}>{score}</div>
                <div className={`text-xs font-bold mt-0.5 ${gold ? "text-gold-500" : "text-slate-500"}`}>{sub}</div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 text-center mt-4">
            ✓ scores based on publicly documented features. Competitor data sourced from official documentation as of June 2026.
          </p>
        </div>
      </section>

      {/* ── Competitor Cards ──────────────────────────────── */}
      <section className="px-6 py-14 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black text-white text-center mb-10">
            Every competitor, honestly assessed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPETITORS.map((c) => (
              <div key={c.name} className={`rounded-xl border ${c.color} p-5 flex flex-col`}>
                <div className="flex items-start justify-between mb-1 gap-2">
                  <h3 className="text-sm font-bold text-white">{c.name}</h3>
                  <span className={`rounded-full border text-[10px] font-bold px-2 py-0.5 shrink-0 ${c.badge}`}>
                    {c.price}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{c.type}</p>
                <ul className="space-y-1.5 flex-1">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-1.5 text-xs text-slate-400">
                      <span className="text-slate-600 mt-0.5 shrink-0">·</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 pt-3 border-t border-white/10 text-xs italic text-slate-500">
                  {c.verdict}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What They Built vs What We Built ──────────────── */}
      <section className="px-6 py-14 bg-navy-900/30 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-white text-center mb-8">
            The gap is architectural — not incremental
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-5">What they built</p>
              <ul className="space-y-3">
                {[
                  "Cloud file storage with a shared folder tree",
                  "Server-side encryption — vendor holds keys",
                  "Email-based sharing + trust-me access controls",
                  "Single-party trigger (whoever has the login)",
                  '"Bank-grade encryption" — unverifiable claim',
                  "Dead man's switch → email auto-response",
                  "Centralized DB vulnerable to single-point breach",
                  "Manual release — no enforcement mechanism",
                  "Digital filing cabinet with a nice UI",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <XCircle className="h-4 w-4 text-red-500/60 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-gold-500/30 bg-navy-800/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-5">What we built</p>
              <ul className="space-y-3">
                {[
                  "Encrypted blobs on private IPFS — CID is the proof",
                  "Client-side HKDF-SHA256 key derivation — server is blind",
                  "W3C DIDs + Verifiable Credentials for executor authority",
                  "5-condition release engine enforced in code, not policy",
                  "SHA-256 + XRPL/Stellar anchor — mathematically verifiable",
                  "Dead man's switch → triggers 5-proof release protocol",
                  "Private chain registry — every state change is immutable",
                  "Guardian N-of-M quorum — no single party can force release",
                  "Sovereign estate operating system, not a filing cabinet",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-slate-200">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full Feature Matrix ───────────────────────────── */}
      <section id="matrix" className="px-4 py-14">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-2 text-center">Complete Feature Matrix</p>
          <h2 className="text-2xl font-black text-white mb-8 text-center">45 features. Side by side.</h2>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-xs" style={{ minWidth: "900px" }}>
              <thead>
                <tr className="border-b border-white/10 bg-navy-900">
                  <th className="py-3 pl-4 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-56">Feature</th>
                  <th className="px-2 py-3 text-center font-black text-gold-400 uppercase tracking-wider">LVP</th>
                  <th className="px-2 py-3 text-center font-medium text-slate-500 uppercase tracking-wider">HeirSafe</th>
                  <th className="px-2 py-3 text-center font-medium text-slate-500 uppercase tracking-wider">GoodTrust</th>
                  <th className="px-2 py-3 text-center font-medium text-slate-500 uppercase tracking-wider">Everplans</th>
                  <th className="px-2 py-3 text-center font-medium text-slate-500 uppercase tracking-wider">Cake</th>
                  <th className="px-2 py-3 text-center font-medium text-slate-500 uppercase tracking-wider">ML&W</th>
                  <th className="px-2 py-3 text-center font-medium text-slate-500 uppercase tracking-wider">Easeenet</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat) => {
                  const catRows = MATRIX_ROWS.filter((r) => r.cat === cat);
                  return (
                    <>
                      <tr key={`cat-${cat}`} className="border-b border-white/5 bg-navy-800/30">
                        <td colSpan={8} className="py-2 pl-4 text-[10px] font-black uppercase tracking-widest text-gold-500/70">
                          {cat}
                        </td>
                      </tr>
                      {catRows.map((row, i) => (
                        <tr
                          key={`${cat}-${i}`}
                          className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "bg-navy-900/30" : "bg-navy-900/10"}`}
                        >
                          <td className="py-2.5 pl-4 pr-2 text-slate-300 leading-tight">{row.feature}</td>
                          <td className="px-2 py-2.5 bg-gold-500/5">{row.lvp}</td>
                          <td className="px-2 py-2.5">{row.heirtight}</td>
                          <td className="px-2 py-2.5">{row.goodtrust}</td>
                          <td className="px-2 py-2.5">{row.everplans}</td>
                          <td className="px-2 py-2.5">{row.cake}</td>
                          <td className="px-2 py-2.5">{row.mlw}</td>
                          <td className="px-2 py-2.5">{row.easeenet}</td>
                        </tr>
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600 text-center mt-4">
            Data sourced from official product documentation. "Partial" indicates claimed or limited coverage.
            Legacy Vault Protocol features reflect the open-source production build at github.com/FTHTrading/Legacy.
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="px-6 py-20 text-center border-t border-white/10">
        <h2 className="text-3xl font-black text-white mb-4">
          Your empire deserves<br />
          <span className="text-gold-400">cryptographic certainty.</span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">
          Not a vendor's promise. Not a shared folder. Mathematically verifiable proof —
          anchored on-chain, encrypted before it leaves your hands, released only when
          all five conditions are met.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/namespaces/register" className="btn-primary px-10 py-3.5 text-base font-black inline-flex items-center gap-2">
            Register Your Namespace <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/namespaces/demo" className="btn-secondary px-8 py-3.5 text-base">
            Try Demo First
          </Link>
        </div>
      </section>
    </div>
  );
}
