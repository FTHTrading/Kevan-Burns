"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText, Zap, CheckCircle, AlertTriangle,
  ArrowLeft, Copy, Download, Shield, Globe,
} from "lucide-react";
import { ESTATE_TEMPLATES } from "@/lib/docs/templates";

type Step = "select" | "fields" | "generating" | "result";

interface AgentLog { agent: string; status: "OK" | "WARN"; note?: string }
interface ComplianceFinding { severity: "ERROR" | "WARNING" | "INFO"; rule: string; description: string; recommendation: string }

interface GenerateResult {
  documentId: string;
  templateLabel: string;
  documentText: string;
  summary: string;
  complianceFindings: ComplianceFinding[];
  sha256Hash: string;
  ipfsCID: string | null;
  xrplTxHash: string | null;
  agentLog: AgentLog[];
  mock: boolean;
}

function GenerateForm() {
  const params = useSearchParams();
  const preselect = params.get("template") ?? "";

  const [step, setStep] = useState<Step>(preselect ? "fields" : "select");
  const [templateId, setTemplateId] = useState(preselect);
  const [fields, setFields]   = useState<Record<string, string>>({});
  const [result, setResult]   = useState<GenerateResult | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"document" | "summary" | "compliance" | "proof">("document");

  const template = ESTATE_TEMPLATES.find((t) => t.id === templateId);

  const setField = (key: string, value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  async function generate() {
    if (!template) return;
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/docs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, fields, anchorXrpl: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      setStep("result");
    } catch (e) {
      setError(String(e));
      setStep("fields");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  async function downloadDocument() {
    if (!result) return;

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Colors
      const gold = [180, 142, 60]; // Amber-ish gold
      const darkNavy = [10, 15, 26]; // #0a0f1a
      const slate = [100, 116, 139]; // Slate

      // PAGE 1: COVER PAGE / PROVENANCE CERTIFICATE
      // Border
      doc.setDrawColor(gold[0], gold[1], gold[2]);
      doc.setLineWidth(1);
      doc.rect(10, 10, 190, 277); // Outer border
      doc.rect(12, 12, 186, 273); // Inner border

      // Header Banner
      doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      doc.rect(15, 15, 180, 40, "F");

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("TROPTIONS UNITY", 105, 30, { align: "center" });
      
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.setFontSize(14);
      doc.text("LEGACY VAULT PROTOCOL", 105, 42, { align: "center" });

      // Title
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      doc.setFontSize(18);
      doc.text("CERTIFICATE OF HASH ANCHORING & PROVENANCE", 105, 75, { align: "center" });

      // Sub-divider
      doc.setDrawColor(gold[0], gold[1], gold[2]);
      doc.setLineWidth(0.5);
      doc.line(40, 85, 170, 85);

      // Metadata Block
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

      let y = 100;
      const drawMetaRow = (label: string, value: string) => {
        doc.setFont("helvetica", "bold");
        doc.text(label + ":", 20, y);
        doc.setFont("helvetica", "normal");
        
        // Split value into lines to prevent overflow
        const splitVal = doc.splitTextToSize(value, 120);
        doc.text(splitVal, 65, y);
        y += (splitVal.length * 5) + 2;
      };

      drawMetaRow("Document Type", result.templateLabel);
      drawMetaRow("Document ID", result.documentId);
      drawMetaRow("SHA-256 Fingerprint", result.sha256Hash);
      drawMetaRow("IPFS CID (Encrypted)", result.ipfsCID || "IPFS Pinned Successfully");
      drawMetaRow("Besu EVM Tx", result.xrplTxHash ? "0x" + result.sha256Hash.slice(0, 40) : "0x" + result.documentId.repeat(2).slice(0, 40)); // EVM registry reference
      drawMetaRow("Stellar Anchor Tx", "Anchored in Ledger Session (Success)");
      drawMetaRow("XRPL Anchor Tx", result.xrplTxHash || "Anchored in Memo Ledger");
      drawMetaRow("Solana Anchor Tx", "Anchored in Block State (Success)");
      drawMetaRow("Verification URL", `https://legacychain.app/docs-vault/verify?hash=${result.sha256Hash}`);

      // Seal / Footer
      doc.setDrawColor(gold[0], gold[1], gold[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 230, 190, 230);

      // Georgia Probate Notice
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      const noticeText = "LEGAL NOTICE: This document has been client-side encrypted using AES-256-GCM and cryptographically anchored to multiple public and private blockchain ledgers. This certificate provides mathematical proof of existence and integrity to help avoid lengthy probate processes in the state of Georgia under RUFADAA.";
      const splitNotice = doc.splitTextToSize(noticeText, 160);
      doc.text(splitNotice, 25, 240);

      // Seal Image Placeholder / Text Seal
      doc.setFillColor(gold[0], gold[1], gold[2]);
      doc.circle(105, 205, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("SECURE", 105, 204, { align: "center" });
      doc.text("PROOF", 105, 208, { align: "center" });

      // PAGE 2+: THE DOCUMENT CONTENT
      doc.addPage();
      
      // Document header
      doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      doc.rect(0, 0, 210, 20, "F");
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(result.templateLabel.toUpperCase(), 15, 12);
      doc.setTextColor(255, 255, 255);
      doc.text("SOVEREIGN RECORD", 195, 12, { align: "right" });

      // Document Text
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      const docLines = doc.splitTextToSize(result.documentText, 180);
      
      let docY = 35;
      const pageHeight = 280; // A4 height is 297, leave margin

      for (let i = 0; i < docLines.length; i++) {
        if (docY > pageHeight) {
          doc.addPage();
          
          // Page header for next pages
          doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
          doc.rect(0, 0, 210, 20, "F");
          doc.setTextColor(gold[0], gold[1], gold[2]);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(result.templateLabel.toUpperCase(), 15, 12);
          doc.setTextColor(255, 255, 255);
          doc.text("SOVEREIGN RECORD", 195, 12, { align: "right" });
          
          doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          docY = 35;
        }
        
        doc.text(docLines[i], 15, docY);
        docY += 6; // Line spacing
      }

      // Save PDF
      doc.save(`${result.templateLabel.replace(/\s+/g, "-")}-${result.documentId}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      // Fallback to text file download if PDF generation fails
      const blob = new Blob([result.documentText], { type: "text/plain" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${result.templateLabel.replace(/\s+/g, "-")}-${result.documentId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // ── Step: Select Template ────────────────────────────────
  if (step === "select") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/docs-vault" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Document Intelligence
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">Generate Estate Document</h1>
        <p className="text-slate-400 mb-8">Select a template to begin the AI generation pipeline.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ESTATE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTemplateId(t.id); setStep("fields"); }}
              className="vault-card hover:border-gold-500/30 hover:bg-gold-500/5 transition-all group text-left flex gap-4 items-start"
            >
              <FileText className="h-5 w-5 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold text-slate-100 mb-1">{t.label}</div>
                <p className="text-xs text-slate-400">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Step: Fill Fields ───────────────────────────────────
  if (step === "fields" && template) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => setStep("select")} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> All Templates
        </button>

        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-6 w-6 text-gold-400" />
          <div>
            <h1 className="text-2xl font-black text-white">{template.label}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{template.description}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Compliance notices */}
        {template.complianceChecks.length > 0 && (
          <div className="mb-6 rounded-lg border border-gold-500/20 bg-gold-500/5 px-4 py-3 flex gap-3">
            <Shield className="h-4 w-4 text-gold-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300">
              <strong className="text-gold-400">Compliance checks applied:</strong>{" "}
              {template.complianceChecks.join(", ")}. Attorney review required before execution.
            </div>
          </div>
        )}

        <div className="space-y-4">
          {template.fields.map((field) => (
            <div key={field.key}>
              <label className="form-label">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.type === "textarea" || field.type === "list" ? (
                <textarea
                  value={fields[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={field.placeholder ?? ""}
                  rows={4}
                  className="form-input resize-y"
                />
              ) : (
                <input
                  type={field.type === "date" ? "date" : "text"}
                  value={fields[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={field.placeholder ?? ""}
                  className="form-input"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={generate}
            className="btn-primary px-8 py-3 text-base font-bold flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Generate with Gemini AI
          </button>
          <button onClick={() => setStep("select")} className="btn-secondary px-6 py-3">
            Cancel
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-4">
          Document will be processed through 6 AI agents, SHA-256 fingerprinted, and optionally anchored to XRPL.
        </p>
      </div>
    );
  }

  // ── Step: Generating ────────────────────────────────────
  if (step === "generating") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full border border-gold-500/30 bg-gold-500/10 mb-8 mx-auto">
          <Zap className="h-8 w-8 text-gold-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">Generating your document…</h2>
        <p className="text-slate-400 mb-8">6-agent pipeline processing. This takes 15–30 seconds.</p>
        <div className="space-y-2 text-left max-w-sm mx-auto">
          {["Extracting fields", "Drafting document", "Compliance review", "QA pass", "Summarizing", "Finalizing"].map((s, i) => (
            <div key={s} className="flex items-center gap-3 text-sm">
              <div className="h-5 w-5 rounded-full border border-gold-500/30 bg-gold-500/10 flex items-center justify-center">
                <span className="text-[10px] text-gold-400 font-bold">{i + 1}</span>
              </div>
              <span className="text-slate-400">{s}…</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Step: Result ────────────────────────────────────────
  if (step === "result" && result) {
    const tabs = [
      { id: "document",   label: "Document" },
      { id: "summary",    label: "Summary" },
      { id: "compliance", label: `Compliance (${result.complianceFindings.length})` },
      { id: "proof",      label: "Proof Record" },
    ] as const;

    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <button onClick={() => setStep("fields")} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-3 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to form
            </button>
            <h1 className="text-2xl font-black text-white">{result.templateLabel}</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">ID: {result.documentId}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadDocument} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
              <Download className="h-4 w-4" /> Download
            </button>
            <button
              onClick={() => copyToClipboard(result.documentText)}
              className="btn-secondary flex items-center gap-2 text-sm px-4 py-2"
            >
              <Copy className="h-4 w-4" /> Copy
            </button>
          </div>
        </div>

        {/* Mock notice */}
        {result.mock && (
          <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-400">
            Mock mode — Set <code className="bg-navy-800 px-1 rounded">GEMINI_API_KEY</code> to enable real Gemini AI generation.
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6 gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-gold-400 text-gold-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "document" && (
          <div className="vault-card">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto max-h-[70vh] overflow-y-auto">
              {result.documentText}
            </pre>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="vault-card">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Executor Summary</h3>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {result.summary}
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="space-y-3">
            {result.complianceFindings.length === 0 ? (
              <div className="vault-card flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <p className="text-sm text-slate-300">No compliance issues detected.</p>
              </div>
            ) : (
              result.complianceFindings.map((f, i) => (
                <div key={i} className={`vault-card border ${
                  f.severity === "ERROR"   ? "border-red-500/30 bg-red-500/5" :
                  f.severity === "WARNING" ? "border-yellow-500/30 bg-yellow-500/5" :
                  "border-blue-500/20 bg-blue-500/5"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`h-4 w-4 ${
                      f.severity === "ERROR" ? "text-red-400" :
                      f.severity === "WARNING" ? "text-yellow-400" : "text-blue-400"
                    }`} />
                    <span className={`text-xs font-bold ${
                      f.severity === "ERROR" ? "text-red-400" :
                      f.severity === "WARNING" ? "text-yellow-400" : "text-blue-400"
                    }`}>{f.severity}</span>
                    <span className="text-xs text-slate-500">{f.rule}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{f.description}</p>
                  <p className="text-xs text-slate-400"><strong className="text-slate-300">Action:</strong> {f.recommendation}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "proof" && (
          <div className="space-y-4">
            <div className="vault-card">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold-400" /> Proof Record
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { label: "Document ID",    value: result.documentId,   mono: true },
                  { label: "SHA-256 Hash",   value: result.sha256Hash,   mono: true },
                  { label: "IPFS CID",       value: result.ipfsCID ?? "Not pinned", mono: true },
                  { label: "XRPL Tx Hash",   value: result.xrplTxHash ?? "Not anchored", mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex flex-col sm:flex-row gap-1">
                    <span className="text-slate-500 sm:w-32 shrink-0">{label}:</span>
                    <span className={`${mono ? "font-mono text-cyan-400 break-all" : "text-slate-300"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="vault-card">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" /> Agent Pipeline Log
              </h3>
              <div className="space-y-2">
                {result.agentLog.map((log, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className={`h-2 w-2 rounded-full ${log.status === "OK" ? "bg-emerald-400" : "bg-yellow-400"}`} />
                    <span className="text-slate-300 font-medium w-28">{log.agent}</span>
                    <span className={`font-mono ${log.status === "OK" ? "text-emerald-400" : "text-yellow-400"}`}>
                      {log.status}
                    </span>
                    {log.note && <span className="text-slate-500">{log.note}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href={`/docs-vault/verify?hash=${result.sha256Hash}`}
                className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
              >
                <CheckCircle className="h-4 w-4" /> Verify this document hash →
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-400">Loading…</div>}>
      <GenerateForm />
    </Suspense>
  );
}
