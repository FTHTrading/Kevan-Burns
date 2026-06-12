import Link from "next/link";
import { FileText, Shield, CheckCircle, Zap, Globe, Lock, ArrowRight, Clock } from "lucide-react";
import { ESTATE_TEMPLATES } from "@/lib/docs/templates";

const categoryColors: Record<string, string> = {
  SUCCESSION:  "text-gold-400  border-gold-500/30  bg-gold-500/5",
  TRUST:       "text-purple-400 border-purple-500/30 bg-purple-500/5",
  AUTHORITY:   "text-blue-400  border-blue-500/30  bg-blue-500/5",
  FINANCIAL:   "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  HEALTHCARE:  "text-pink-400  border-pink-500/30  bg-pink-500/5",
  BUSINESS:    "text-orange-400 border-orange-500/30 bg-orange-500/5",
  CRYPTO:      "text-cyan-400  border-cyan-500/30  bg-cyan-500/5",
};

const PIPELINE_AGENTS = [
  { n: 1, label: "Extractor",   desc: "Parses and normalizes your field inputs — names, dates, jurisdictions", color: "text-gold-400" },
  { n: 2, label: "Drafter",     desc: "Generates complete legal document text from your template and data", color: "text-blue-400" },
  { n: 3, label: "Compliance",  desc: "Reviews for ESIGN, UETA, RUFADAA, state law, and HIPAA requirements", color: "text-red-400" },
  { n: 4, label: "Reviewer",    desc: "Final QA pass — completeness, internal consistency, enforceability", color: "text-purple-400" },
  { n: 5, label: "Summarizer",  desc: "Creates plain-English executor summary and action checklist", color: "text-emerald-400" },
  { n: 6, label: "Crypto Agent","desc": "Adds RUFADAA digital asset provisions for crypto-holding estates", color: "text-cyan-400" },
];

export default function DocsVaultPage() {
  const byCategory = ESTATE_TEMPLATES.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, typeof ESTATE_TEMPLATES>);

  return (
    <main className="min-h-screen">

      {/* Header */}
      <section className="border-b border-white/10 px-6 py-14 bg-navy-900/60">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 mb-6">
            <FileText className="h-3 w-3" /> Document Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Estate Document<br />
            <span className="text-gold-400">Intelligence System</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            13 regulated estate templates processed through a 6-agent AI pipeline.
            Every document is SHA-256 fingerprinted, IPFS-pinned, and XRPL-anchored.
            Powered by Grok.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/docs-vault/generate" className="btn-primary px-8 py-3 text-base font-bold inline-flex items-center gap-2">
              Generate a Document <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/docs-vault/verify" className="btn-secondary px-8 py-3 text-base inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> Verify a Hash
            </Link>
          </div>
        </div>
      </section>

      {/* 6-Agent Pipeline */}
      <section className="px-6 py-14 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">AI Processing Pipeline</p>
            <h2 className="text-2xl font-black text-white">Six agents. One sovereign document.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PIPELINE_AGENTS.map(({ n, label, desc, color }) => (
              <div key={n} className="vault-card flex gap-4">
                <div className={`text-2xl font-black font-mono ${color} shrink-0 w-8`}>
                  {String(n).padStart(2, "0")}
                </div>
                <div>
                  <div className={`text-sm font-bold ${color} mb-1`}>{label}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof record */}
      <section className="px-6 py-10 border-b border-white/5 bg-navy-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">8-Step Proof Record</p>
            <h2 className="text-2xl font-black text-white">Every document provably sealed.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { n: "01", label: "Input",      status: "LIVE",    icon: FileText },
              { n: "02", label: "Draft",       status: "LIVE",    icon: Zap },
              { n: "03", label: "Compliance",  status: "LIVE",    icon: Shield },
              { n: "04", label: "SHA-256",     status: "LIVE",    icon: Lock },
              { n: "05", label: "XRPL",        status: "READY",   icon: Globe },
              { n: "06", label: "KV Store",    status: "LIVE",    icon: CheckCircle },
              { n: "07", label: "IPFS",        status: "READY",   icon: Globe },
              { n: "08", label: "Verify",      status: "LIVE",    icon: CheckCircle },
            ].map(({ n, label, status, icon: Icon }) => (
              <div key={n} className="vault-card p-3 text-center">
                <div className="text-xs font-bold text-slate-500 mb-1">{n}</div>
                <Icon className="h-4 w-4 mx-auto mb-1 text-gold-400" />
                <div className="text-xs font-semibold text-slate-200">{label}</div>
                <div className={`text-[10px] font-bold mt-1 ${status === "LIVE" ? "text-emerald-400" : "text-yellow-400"}`}>
                  {status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Catalog */}
      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">Template Catalog</p>
            <h2 className="text-2xl font-black text-white">13 regulated estate templates.</h2>
          </div>

          {Object.entries(byCategory).map(([cat, templates]) => (
            <div key={cat} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${categoryColors[cat]}`}>
                  {cat.replace("_", " ")}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((t) => (
                  <Link
                    key={t.id}
                    href={`/docs-vault/generate?template=${t.id}`}
                    className="vault-card hover:border-gold-500/30 hover:bg-gold-500/5 transition-all group flex items-start gap-4"
                  >
                    <FileText className="h-5 w-5 text-gold-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-slate-100">{t.label}</span>
                        {t.xrplAnchor && (
                          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">XRPL</span>
                        )}
                        {t.ipfsPin && (
                          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-400">IPFS</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.complianceChecks.slice(0, 3).map((c) => (
                          <span key={c} className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">{c}</span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-gold-400 transition-colors shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scope note */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <p className="text-xs text-slate-500 max-w-2xl mx-auto">
          <strong className="text-slate-400">Scope note:</strong> Document Intelligence covers AI-assisted estate document drafting and proof records.
          All generated documents require review and execution by a licensed attorney in the applicable jurisdiction.
          This is not legal advice. XRPL and IPFS anchoring require funded accounts. See{" "}
          <Link href="/architecture" className="text-gold-400 hover:underline">architecture docs</Link> for infrastructure requirements.
        </p>
      </footer>
    </main>
  );
}
