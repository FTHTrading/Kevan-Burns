"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import {
  Download, FileText, Table, FileJson, Loader2,
  CheckCircle2, Sparkles, Shield, Lock, AlertTriangle,
  Scale, FolderOpen, Coins, Link2,
} from "lucide-react";
import EstateAI from "../components/EstateAI";

// ─── Download catalogue ───────────────────────────────────────────────────────
type Fmt = "PDF" | "JSON" | "CSV";

interface DownloadItem {
  icon: React.ReactNode;
  name: string;
  desc: string;
  format: Fmt;
  route: string;
  planned?: boolean;
}

interface DownloadSection {
  category: string;
  catIcon: React.ReactNode;
  catColor: string;
  items: DownloadItem[];
}

const SECTIONS: DownloadSection[] = [
  {
    category: "Estate Summary",
    catIcon: <FolderOpen className="h-4 w-4" />,
    catColor: "text-gold-400",
    items: [
      {
        icon: <FileText className="h-5 w-5 text-gold-400" />,
        name: "Estate Summary PDF",
        desc: "Full estate overview: vault manifest, asset inventory, guardian and executor assignments, and release policy snapshot.",
        format: "PDF",
        route: "/api/export/estate-summary",
      },
      {
        icon: <FileJson className="h-5 w-5 text-cyan-400" />,
        name: "Namespace Manifest JSON",
        desc: "Signed JSON manifest of the namespace: members, roles, namespace status, IPFS CID, and chain anchor hash.",
        format: "JSON",
        route: "/api/export/namespace-manifest",
      },
      {
        icon: <Table className="h-5 w-5 text-blue-400" />,
        name: "Vault Asset Inventory CSV",
        desc: "Spreadsheet-ready asset list: all document types, wallets, and registrations with categories and IPFS references.",
        format: "CSV",
        route: "/api/export/asset-inventory",
      },
    ],
  },
  {
    category: "Executor & Beneficiary Packets",
    catIcon: <Scale className="h-4 w-4" />,
    catColor: "text-purple-400",
    items: [
      {
        icon: <FileText className="h-5 w-5 text-purple-400" />,
        name: "Executor Packet PDF",
        desc: "Court-facing authority packet: signed release authorization, digital asset transfer instructions, and notarization record.",
        format: "PDF",
        route: "/api/export/executor-packet",
      },
      {
        icon: <FileText className="h-5 w-5 text-emerald-400" />,
        name: "Beneficiary Packet PDF",
        desc: "Scoped access packet per beneficiary: their allocation, access instructions, chain wallet references, and custodian statement.",
        format: "PDF",
        route: "/api/export/beneficiary-packet",
      },
    ],
  },
  {
    category: "Audit & Compliance",
    catIcon: <Shield className="h-4 w-4" />,
    catColor: "text-slate-400",
    items: [
      {
        icon: <Table className="h-5 w-5 text-slate-400" />,
        name: "Audit Log CSV",
        desc: "Full tamper-evident audit trail as spreadsheet. All event types, timestamps, actor addresses, and action hashes.",
        format: "CSV",
        route: "/api/export/audit-log",
      },
      {
        icon: <FileJson className="h-5 w-5 text-slate-400" />,
        name: "Audit Log JSON",
        desc: "Machine-readable audit log with chain anchor verification hashes. Suitable for external compliance system ingestion.",
        format: "JSON",
        route: "/api/export/audit-log-json",
      },
      {
        icon: <FileText className="h-5 w-5 text-blue-300" />,
        name: "Release Policy Snapshot PDF",
        desc: "Point-in-time snapshot of all active release conditions, guardian quorum requirements, and waiting period configurations.",
        format: "PDF",
        route: "/api/export/release-policy",
      },
    ],
  },
  {
    category: "Cross-chain & Technical",
    catIcon: <Link2 className="h-4 w-4" />,
    catColor: "text-cyan-400",
    items: [
      {
        icon: <FileText className="h-5 w-5 text-cyan-300" />,
        name: "Cross-chain Asset Summary PDF",
        desc: "Multi-chain wallet registry report: registered addresses per chain, last snapshot date, and proof anchor references.",
        format: "PDF",
        route: "/api/export/cross-chain-summary",
      },
      {
        icon: <FileJson className="h-5 w-5 text-gold-400" />,
        name: "Node Configuration Pack",
        desc: "Legacy Layer 0 validator node configuration bundle for operator deployment. Includes genesis file and network config.",
        format: "PDF",
        route: "#",
        planned: true,
      },
      {
        icon: <Table className="h-5 w-5 text-gold-300" />,
        name: "x402 Billing Summary CSV",
        desc: "Namespace-scoped x402 usage export: service IDs, units, USDF charged, timestamps, and gateway status.",
        format: "CSV",
        route: "/api/export/x402-billing",
      },
    ],
  },
];

const FORMAT_COLORS: Record<Fmt, string> = {
  PDF:  "border-red-500/30 bg-red-500/10 text-red-400",
  JSON: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  CSV:  "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function DownloadsPage() {
  const [mounted, setMounted] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = useCallback(
    async (item: DownloadItem) => {
      if (item.planned || generating) return;
      setGenerating(item.name);
      setErrors(prev => { const n = { ...prev }; delete n[item.name]; return n; });

      try {
        const [{ downloadExport }, res] = await Promise.all([
          import("@/lib/pdf/legalPdf"),
          fetch(item.route),
        ]);
        if (!res.ok) throw new Error(`Export failed (${res.status})`);
        const data = await res.json() as Record<string, unknown>;
        await downloadExport(
          data as Parameters<typeof downloadExport>[0],
          item.name,
          item.format
        );
        setGenerated(prev => new Set([...prev, item.name]));
      } catch (err) {
        setErrors(prev => ({
          ...prev,
          [item.name]: err instanceof Error ? err.message : "Generation failed",
        }));
      } finally {
        setGenerating(null);
      }
    },
    [generating]
  );

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* ── Hero ── */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">
          Downloads & Exports
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          Every estate document,
          <br />
          <span className="text-gold-400">formatted and verified</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Generate executor packets, beneficiary access documents, audit logs, compliance
          reports, and cross-chain summaries — all signed, IPFS-referenced, and ready for
          legal proceedings.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {[
            { icon: <Sparkles className="h-3 w-3" />, label: "AI-Assisted Generation", color: "border-gold-500/30 bg-gold-500/10 text-gold-400" },
            { icon: <Shield className="h-3 w-3" />, label: "Legal-Grade Formatting", color: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
            { icon: <Lock className="h-3 w-3" />, label: "IPFS-Anchored Docs", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
            { icon: <Coins className="h-3 w-3" />, label: "x402 Metered", color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
          ].map(({ icon, label, color }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>
              {icon} {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Main: downloads + AI panel ── */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-12">

          {/* ── Download catalogue (left 7 cols) ── */}
          <div className="space-y-12 lg:col-span-7">
            {SECTIONS.map((sec) => (
              <div key={sec.category}>
                <div className="mb-5 flex items-center gap-2">
                  <span className={sec.catColor}>{sec.catIcon}</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-gold-500">{sec.category}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {sec.items.map((item) => {
                    const isGenerating = generating === item.name;
                    const isDone = generated.has(item.name);
                    const err = errors[item.name];
                    return (
                      <div
                        key={item.name}
                        className={`group rounded-xl border bg-navy-800/60 p-5 transition-all ${
                          item.planned
                            ? "border-navy-700 opacity-60"
                            : isDone
                            ? "border-emerald-600/40 hover:border-emerald-500/50"
                            : "border-navy-700 hover:border-gold-600/30"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="mt-0.5">{item.icon}</div>
                          <div className="flex items-center gap-1.5">
                            {item.planned ? (
                              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">Planned</span>
                            ) : isDone ? (
                              <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Generated
                              </span>
                            ) : (
                              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Live</span>
                            )}
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${FORMAT_COLORS[item.format]}`}>
                              {item.format}
                            </span>
                          </div>
                        </div>

                        <p className="mb-1 text-sm font-bold text-white">{item.name}</p>
                        <p className="mb-4 text-xs leading-relaxed text-slate-500">{item.desc}</p>

                        {err && (
                          <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                            {err}
                          </div>
                        )}

                        <button
                          onClick={() => handleDownload(item)}
                          disabled={!!item.planned || !!generating}
                          className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 ${
                            item.planned
                              ? "cursor-not-allowed border border-navy-600 bg-navy-700/40 text-slate-500"
                              : isDone
                              ? "border border-emerald-600/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : isGenerating
                              ? "border border-gold-500/30 bg-gold-500/10 text-gold-400"
                              : "border border-navy-600 bg-navy-700/60 text-slate-300 hover:border-gold-500/40 hover:bg-gold-500/10 hover:text-gold-400"
                          }`}
                        >
                          {isGenerating ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating…</>
                          ) : isDone ? (
                            <><CheckCircle2 className="h-3.5 w-3.5" />Download Again</>
                          ) : item.planned ? (
                            "Coming Soon"
                          ) : (
                            <><Download className="h-3.5 w-3.5" />Generate &amp; Download</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Footer note */}
            <div className="rounded-xl border border-navy-700 bg-navy-800/40 px-5 py-4 text-xs text-slate-500 leading-relaxed">
              Downloads are generated on-demand and metered via x402. Each PDF includes
              legal-grade letterhead, CONFIDENTIAL marking, IPFS CID, and chain hash printed
              directly in the document. Ask the Estate AI assistant on the right for guidance.
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/vault/downloads" className="rounded-lg bg-gold-500 px-4 py-2 font-bold text-navy-950 hover:bg-gold-400 transition-colors">
                  Vault-scoped Downloads →
                </Link>
                <Link href="/x402" className="rounded-lg border border-navy-600 px-4 py-2 font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
                  x402 Billing
                </Link>
              </div>
            </div>
          </div>

          {/* ── Estate AI (right 5 cols, sticky) ── */}
          <div className="lg:col-span-5">
            <div className="sticky top-20">
              <div className="mb-3 flex items-start gap-3 rounded-xl border border-gold-500/20 bg-gold-500/5 px-4 py-3">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-400" />
                <div>
                  <p className="text-xs font-bold text-gold-400">AI Estate Assistant</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Ask questions about your documents, upload estate text for analysis, or get
                    guidance on which exports to generate.
                  </p>
                </div>
              </div>
              {mounted ? <EstateAI /> : <div className="h-96 rounded-xl border border-navy-800 bg-navy-900/60 animate-pulse" />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}



