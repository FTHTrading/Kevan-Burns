import Link from "next/link";
import Image from "next/image";
import {
  Shield, Lock, FileText, Wallet, Users, Clock, CheckCircle,
  ArrowRight, AlertTriangle, Globe, BookOpen, MessageSquare,
  Zap, Eye, Key, Hash,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Simple Client Hub — clean, approachable
   dashboard for clients who aren't crypto-native.
   Mobile-first. No jargon. Just "what do I do next?"
───────────────────────────────────────────── */

const QUICK_ACTIONS = [
  { href: "/onboard",            icon: Zap,          label: "Start Setup",      color: "text-gold-400  bg-gold-500/10  border-gold-500/30",  desc: "20-minute guided setup" },
  { href: "/vault/create",       icon: Shield,        label: "Create Vault",     color: "text-cyan-400  bg-cyan-500/10  border-cyan-500/30",   desc: "New encrypted vault" },
  { href: "/docs-vault/generate",icon: FileText,      label: "Generate Doc",     color: "text-purple-400 bg-purple-500/10 border-purple-500/30", desc: "AI estate documents" },
  { href: "/vault/wallets",      icon: Wallet,        label: "Add Wallets",      color: "text-blue-400  bg-blue-500/10  border-blue-500/30",   desc: "Register addresses" },
  { href: "/vault/documents",    icon: Lock,          label: "Upload Docs",      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", desc: "Encrypt & store" },
  { href: "/vault/messages",     icon: MessageSquare, label: "Write Messages",   color: "text-rose-400  bg-rose-500/10  border-rose-500/30",   desc: "Legacy letters" },
];

const VAULT_CHECKLIST = [
  { id: "namespace",   label: "Namespace registered",            detail: "yourname.legacy",                    critical: true },
  { id: "vault",       label: "Vault created",                   detail: "Encrypted container ready",          critical: true },
  { id: "executor",    label: "Executor designated",             detail: "Person who manages release",         critical: true },
  { id: "guardians",   label: "Guardians added (2+ recommended)", detail: "Independent approvers",             critical: true },
  { id: "policy",      label: "Release policy configured",       detail: "5 conditions set",                   critical: true },
  { id: "documents",   label: "Key documents uploaded",          detail: "Will, Trust, POA, directives",       critical: true },
  { id: "wallets",     label: "Wallet addresses registered",     detail: "All crypto accounts",                critical: false },
  { id: "assets",      label: "Asset inventory complete",        detail: "All accounts and holdings",          critical: false },
  { id: "beneficiaries", label: "Beneficiaries named with allocations", detail: "Who gets what",              critical: true },
  { id: "dms",         label: "Dead man's switch enabled",       detail: "Check-in intervals set",             critical: false },
  { id: "messages",    label: "Legacy messages written",         detail: "Sealed letters to loved ones",       critical: false },
];

const LEARN_LINKS = [
  { href: "/vault-explained",    icon: BookOpen,  label: "How Your Vault Works",     desc: "The complete visual guide — encryption, IPFS, blockchain, release" },
  { href: "/compare",            icon: Eye,       label: "Why Legacy Vault Protocol", desc: "How we compare to every other platform — 45 features" },
  { href: "/docs-vault",         icon: FileText,  label: "Document Intelligence",    desc: "13 AI-generated estate document templates" },
  { href: "/glossary",           icon: Hash,      label: "Terms & Definitions",      desc: "Every term explained clearly for non-technical clients" },
  { href: "/flow",               icon: Zap,       label: "Interactive Flow Map",     desc: "Visual walkthrough of the complete estate lifecycle" },
  { href: "/namespaces/demo",    icon: Globe,     label: "Live Demo Vault",          desc: "Explore a fully-populated example estate — no account needed" },
];

export default function ClientPage() {
  return (
    <main className="min-h-screen bg-navy-950">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 min-h-[400px] flex items-center">
        {/* Warm family background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/legacy/hero-family-warm.png"
            alt="Family protected by Legacy Vault Protocol"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-navy-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/images/legacy/logo-dark-square.png" alt="Legacy Vault Protocol" width={44} height={44} className="rounded-xl drop-shadow-[0_0_16px_rgba(212,160,23,0.4)]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gold-500">Legacy Vault Protocol</p>
                <p className="text-xs text-slate-400">Client Dashboard</p>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
              Your family is<br />
              <span className="text-gold-400">protected and prepared.</span>
            </h1>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Everything your family needs — organized, encrypted, and ready. When the time comes, they'll have everything. Not confusion.
            </p>

            {/* Status bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {[
                { label: "Vault",       value: "ACTIVE",         color: "text-emerald-400" },
                { label: "Documents",   value: "0 uploaded",     color: "text-yellow-400" },
                { label: "Team",        value: "0 added",        color: "text-yellow-400" },
                { label: "Policy",      value: "Not set",        color: "text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-white/15 bg-navy-950/70 backdrop-blur-sm px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
                  <p className={`text-sm font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <Link href="/onboard" className="btn-primary px-8 py-3 font-bold inline-flex items-center gap-2">
              Start 20-Minute Setup <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* ── QUICK ACTIONS ─────────────────────────────── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-4">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, color, desc }) => (
              <Link key={href} href={href} className={`vault-card border ${color.split("  ").slice(1).join(" ")} hover:opacity-90 transition-all flex flex-col items-center gap-2 py-4 text-center group`}>
                <div className={`h-10 w-10 rounded-xl ${color.split("  ").slice(1, 2).join(" ")} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className={`h-5 w-5 ${color.split("  ")[0]}`} />
                </div>
                <span className="text-xs font-bold text-slate-200">{label}</span>
                <span className="text-[10px] text-slate-600 leading-tight">{desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── VAULT HEALTH CHECKLIST ────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-500">Vault Completion Checklist</p>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-1.5 w-24 rounded-full bg-navy-800 overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-gold-500 to-gold-400 rounded-full" />
              </div>
              <span className="text-slate-500">0% complete</span>
            </div>
          </div>
          <div className="vault-card p-0 overflow-hidden">
            <div className="divide-y divide-white/5">
              {VAULT_CHECKLIST.map(({ id, label, detail, critical }) => (
                <div key={id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors group">
                  <div className="h-5 w-5 rounded-full border border-white/20 bg-navy-800 flex items-center justify-center shrink-0">
                    {/* Empty — will be filled when user completes */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-300 font-medium">{label}</span>
                      {critical && (
                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-400">Required</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-yellow-500/60 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT HAPPENS NEXT ─────────────────────────── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-4">When the Time Comes — What Your Family Experiences</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
                icon: Users,
                title: "Executor initiates claim",
                body: "Your executor submits a release claim. The system guides them step by step. They verify their identity and upload the death certificate.",
                time: "Day 1–3",
              },
              {
                step: "2",
                color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
                icon: Shield,
                title: "Guardian quorum approves",
                body: "Each guardian independently reviews and approves. Attorney attests legal authority. All conditions tracked on-chain — tamper-proof.",
                time: "Day 3–14",
              },
              {
                step: "3",
                color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
                icon: CheckCircle,
                title: "Vault releases to beneficiaries",
                body: "After the waiting period, each beneficiary receives their scoped access. Your legacy messages are delivered. The audit trail is preserved forever.",
                time: "Day 30–60",
              },
            ].map(({ step, color, icon: Icon, title, body, time }) => (
              <div key={step} className={`vault-card border ${color} relative`}>
                <div className={`absolute top-3 right-3 text-[10px] font-bold ${color.split(" ")[0]}`}>{time}</div>
                <div className={`text-xs font-black uppercase tracking-widest ${color.split(" ")[0]} mb-2`}>Step {step}</div>
                <Icon className={`h-6 w-6 ${color.split(" ")[0]} mb-3`} />
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── LEARN MORE ────────────────────────────────── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-4">Learn & Understand</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEARN_LINKS.map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="vault-card hover:border-white/20 transition-all flex gap-4 items-start group">
                <Icon className="h-5 w-5 text-gold-400 mt-0.5 shrink-0 group-hover:scale-105 transition-transform" />
                <div>
                  <p className="text-sm font-bold text-slate-200 mb-1">{label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-gold-400 transition-colors shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── SECURITY ASSURANCE ────────────────────────── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-4">Your Security Guarantees</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Lock,         label: "AES-256-GCM",     desc: "Military-grade encryption",     color: "text-gold-400" },
              { icon: Globe,        label: "Private IPFS",    desc: "Distributed, tamper-proof",     color: "text-cyan-400" },
              { icon: Hash,         label: "SHA-256 Hashing", desc: "Every document fingerprinted",  color: "text-purple-400" },
              { icon: Key,          label: "Zero Server Keys", desc: "We never see your data",        color: "text-emerald-400" },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="vault-card text-center">
                <Icon className={`h-6 w-6 ${color} mx-auto mb-2`} />
                <p className="text-xs font-bold text-slate-200">{label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SUPPORT ───────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Need Help?</p>
          <h3 className="text-lg font-black text-white mb-2">We're here to make this easy.</h3>
          <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
            Not sure where to start? The guided setup wizard walks you through every step in 20 minutes. Or read the full guide.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/onboard" className="btn-primary px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2">
              <Zap className="h-4 w-4" /> Start Guided Setup
            </Link>
            <Link href="/vault-explained" className="btn-secondary px-5 py-2.5 text-sm inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Read the Full Guide
            </Link>
            <Link href="/namespaces/demo" className="btn-secondary px-5 py-2.5 text-sm inline-flex items-center gap-2">
              <Eye className="h-4 w-4" /> Explore Demo
            </Link>
          </div>
        </section>

        <p className="text-xs text-slate-600 text-center pb-4">
          Legacy Vault Protocol is infrastructure software, not legal advice. Consult qualified legal counsel for estate planning.
        </p>
      </div>
    </main>
  );
}
