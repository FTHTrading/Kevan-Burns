"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Volume2, Loader2, MicOff, Send, ChevronRight,
  Shield, BookOpen, Layers, Wallet, Coins, Globe, Cpu, Zap, FileText
} from "lucide-react";

const KNOWLEDGE_AREAS = [
  { icon: <Shield className="h-4 w-4" />,   label: "Legacy Vault",       q: "What is Legacy Vault Protocol?",      color: "text-gold-400" },
  { icon: <Layers className="h-4 w-4" />,   label: "TROPTIONS",          q: "What is TROPTIONS?",                  color: "text-cyan-400" },
  { icon: <BookOpen className="h-4 w-4" />, label: "TROPTIONS History",   q: "What is the history of TROPTIONS?",   color: "text-purple-400" },
  { icon: <Zap className="h-4 w-4" />,      label: "x402 Services",      q: "What is x402 and how does it work?",  color: "text-yellow-400" },
  { icon: <Wallet className="h-4 w-4" />,   label: "Wallets",            q: "How does Legacy handle wallets?",     color: "text-blue-400" },
  { icon: <Coins className="h-4 w-4" />,    label: "Stablecoins",        q: "What stablecoins does Legacy support?", color: "text-emerald-400" },
  { icon: <Globe className="h-4 w-4" />,    label: "XRPL",               q: "How does XRPL integrate with Legacy?", color: "text-sky-400" },
  { icon: <Globe className="h-4 w-4" />,    label: "Stellar",            q: "How does Stellar integrate with Legacy?", color: "text-indigo-400" },
  { icon: <Cpu className="h-4 w-4" />,      label: "Settlement",         q: "How does TROPTIONS settlement work?", color: "text-amber-400" },
  { icon: <Layers className="h-4 w-4" />,   label: "Control Hub",        q: "What is the Control Hub?",            color: "text-red-400" },
  { icon: <FileText className="h-4 w-4" />, label: "Executor Workflows", q: "How do executor workflows work?",     color: "text-slate-300" },
  { icon: <Shield className="h-4 w-4" />,   label: "Security",           q: "How does Legacy protect my data?",    color: "text-green-400" },
];

export default function VoiceGuidePage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobRef = useRef<string | null>(null);

  const stopAudio = () => {
    audioRef.current?.pause();
    if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }
    setSpeaking(false);
  };

  const ask = async (q?: string) => {
    const finalQ = (q ?? question).trim();
    if (!finalQ) return;
    setQuestion(finalQ);
    setAnswer(null);
    setError(null);
    setLoading(true);
    stopAudio();

    try {
      // First get the text answer
      const textRes = await fetch("/api/voice/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: finalQ, mode: "text" }),
      });
      const data = await textRes.json() as { answer?: string; error?: string };
      if (!textRes.ok || !data.answer) throw new Error(data.error ?? "No answer");
      setAnswer(data.answer);
      setLoading(false);

      // Then request the spoken version
      setSpeaking(true);
      const spokenRes = await fetch("/api/voice/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: finalQ, mode: "spoken" }),
      });

      if (spokenRes.ok && spokenRes.headers.get("Content-Type")?.startsWith("audio")) {
        const blob = await spokenRes.blob();
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        await audio.play();
      } else {
        setSpeaking(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
      setLoading(false);
      setSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">

      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">TROPTIONS Voice Assurance</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          Legacy Voice Guide<br />
          <span className="text-gold-400">Powered by TROPTIONS + Deepgram</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Every page in Legacy has a professional narration you can listen to.
          Ask a question below to hear it spoken — or visit any page and press
          the <span className="text-gold-400 font-semibold">Listen</span> button.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400">
            <Volume2 className="h-3 w-3" /> Page narration on every major page
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Shield className="h-3 w-3" /> API key server-side only
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-400">
            <BookOpen className="h-3 w-3" /> LOCAL_GUIDE mode · no private vault data
          </span>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-14 space-y-14">

        {/* Ask section */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Voice Concierge</p>
          <h2 className="mb-4 text-2xl font-bold text-white">Ask a question — hear the answer</h2>
          <p className="mb-6 text-sm text-slate-400">
            The Legacy Voice Guide answers questions about Legacy, TROPTIONS, x402, wallets, stablecoins,
            XRPL, Stellar, settlement, Control Hub, and executor workflows — in a calm, professional voice.
            No private vault data is ever included.
          </p>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && ask()}
              placeholder="e.g. What is TROPTIONS? How does x402 work? What is the Control Hub?"
              className="flex-1 rounded-xl border border-navy-600 bg-navy-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
            />
            <button
              onClick={() => ask()}
              disabled={loading || !question.trim()}
              className="flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Asking…" : "Ask"}
            </button>
          </div>

          {/* Answer display */}
          {(answer || error) && (
            <div className="mt-6 rounded-xl border border-navy-700 bg-navy-800/60 p-6">
              {error ? (
                <div className="flex items-start gap-3">
                  <MicOff className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {speaking ? (
                        <>
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-500" />
                          </span>
                          <span className="text-xs font-semibold text-gold-400">Speaking…</span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400">Answer ready</span>
                      )}
                    </div>
                    {speaking && (
                      <button
                        onClick={stopAudio}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                      >
                        Stop audio
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{answer}</p>
                  <div className="mt-4 border-t border-navy-700/50 pt-3 flex items-center gap-2">
                    <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-500">LOCAL_GUIDE</span>
                    <span className="text-[10px] text-slate-600">Based on public Legacy + TROPTIONS knowledge. No private vault data.</span>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Quick questions */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Knowledge Areas</p>
          <h2 className="mb-6 text-2xl font-bold text-white">Ask about any part of Legacy</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {KNOWLEDGE_AREAS.map(({ icon, label, q, color }) => (
              <button
                key={label}
                onClick={() => ask(q)}
                disabled={loading}
                className="group flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-800/60 px-4 py-3 text-left transition-all hover:border-navy-600 hover:bg-navy-800 disabled:opacity-60"
              >
                <span className={`shrink-0 ${color}`}>{icon}</span>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>
            ))}
          </div>
        </section>

        {/* Page narrations */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Page Narrations</p>
          <h2 className="mb-4 text-2xl font-bold text-white">Listen on any page</h2>
          <p className="mb-6 text-sm text-slate-400">
            Every major page has a floating <span className="text-gold-400 font-semibold">Legacy Voice Guide</span> bar 
            in the bottom-right corner. Press it to hear that page explained in a professional, empathetic voice.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/",                            label: "Home" },
              { href: "/troptions",                   label: "Powered by TROPTIONS" },
              { href: "/troptions/history",            label: "TROPTIONS History" },
              { href: "/x402",                         label: "x402 Services" },
              { href: "/wallets",                      label: "Wallets" },
              { href: "/stablecoins",                  label: "Stablecoins" },
              { href: "/xrpl",                         label: "XRPL Rail" },
              { href: "/stellar",                      label: "Stellar Rail" },
              { href: "/settlement",                   label: "Settlement" },
              { href: "/control-hub",                  label: "Control Hub" },
              { href: "/protocol/troptions-layer0",    label: "Layer 0 Fabric" },
              { href: "/protocol/troptions-l1",        label: "Troptions-L1 Rust" },
              { href: "/namespaces",                   label: "Namespaces" },
              { href: "/downloads",                    label: "Downloads" },
              { href: "/status",                       label: "System Status" },
              { href: "/compare",                      label: "Why Legacy" },
              { href: "/flow",                         label: "Flow Map" },
              { href: "/glossary",                     label: "Glossary" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-800/40 px-4 py-2.5 text-sm text-slate-400 transition-all hover:border-gold-500/30 hover:text-gold-400 group"
              >
                <Volume2 className="h-3.5 w-3.5 shrink-0 text-slate-600 group-hover:text-gold-500 transition-colors" />
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* Security note */}
        <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">Security Assurance</p>
          <div className="space-y-2 text-sm text-slate-400 leading-relaxed">
            <p>• The Deepgram API key is <strong className="text-white">server-side only</strong> — it never reaches your browser, never appears in client-side code, and is never stored in NEXT_PUBLIC variables.</p>
            <p>• Voice narration uses only <strong className="text-white">public page content</strong>. Your private vault data, wallet addresses, executor assignments, and release policies are never narrated.</p>
            <p>• Voice concierge answers are drawn from a <strong className="text-white">local knowledge map</strong> of public Legacy and TROPTIONS information. No external LLM is connected unless explicitly configured by the operator.</p>
            <p>• No audio is stored server-side. Every narration is generated fresh from the preset script and returned directly to your browser.</p>
          </div>
        </section>

        {/* Future roadmap */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Roadmap</p>
          <h2 className="mb-4 text-2xl font-bold text-white">What comes next for Legacy Voice Guide</h2>
          <div className="space-y-3">
            {[
              { phase: "Current", label: "Page narration on all major pages", status: "LIVE", statusColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
              { phase: "Current", label: "Local knowledge Q&A with Deepgram spoken responses", status: "LIVE", statusColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
              { phase: "Next", label: "LLM-powered dynamic answers connected to full Legacy knowledge base", status: "PLANNED", statusColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
              { phase: "Next", label: "TROPTIONS ecosystem Q&A with real-time protocol data", status: "PLANNED", statusColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
              { phase: "Future", label: "Authenticated vault concierge — narrates your estate summary (read-only, authorized only)", status: "FUTURE", statusColor: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
              { phase: "Future", label: "Streaming real-time voice for executor walkthrough sessions", status: "FUTURE", statusColor: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
            ].map(({ phase, label, status, statusColor }) => (
              <div key={label} className="flex items-start gap-4 rounded-xl border border-navy-700 bg-navy-800/40 px-5 py-4">
                <span className="shrink-0 text-xs text-slate-600 w-14 pt-0.5">{phase}</span>
                <span className="flex-1 text-sm text-slate-300">{label}</span>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusColor}`}>{status}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
