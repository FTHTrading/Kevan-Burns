"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, Moon, Sparkles, Send, Mail, MapPin, Globe, Shield, Terminal, Key } from "lucide-react";
import { JsonLd } from "../components/JsonLd";

export default function ConnectPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [messageSent, setMessageSent] = useState(false);
  const [sender, setSender] = useState("");
  const [msgBody, setMsgBody] = useState("");

  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardBg = isDark ? "bg-[#120813]/60 border-white/5" : "bg-white border-rose-100 shadow-md";
  const textMuted = isDark ? "text-slate-400" : "text-slate-800";
  const titleColor = isDark ? "text-white" : "text-slate-955";
  const textBody = isDark ? "text-slate-300" : "text-slate-900";
  const codeBg = isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-rose-100";
  const codeText = isDark ? "text-slate-300" : "text-slate-900 font-semibold";

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !msgBody.trim()) return;
    setMessageSent(true);
    setSender("");
    setMsgBody("");
  };

  const connectSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Unykorn Connect Hub",
    description: "AI-friendly connect gateway for authors, developers, and AI agents to interface with founder Kevan Burns and Unykorn systems.",
    url: "https://unykorn.ai/connect"
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${bgStyle}`}>
      {/* Trust bar */}
      <div className={`border-b px-4 py-1.5 text-center transition-colors duration-200 relative z-30 ${
        isDark 
          ? "bg-amber-950/40 border-amber-500/20 text-amber-400" 
          : "bg-amber-50 border-amber-200/60 text-amber-800 font-bold"
      }`}>
        <span className="text-xs font-medium uppercase tracking-wider">
          Founded by Kevan Burns • Moltbook Genesis Protocol • Live on Solana & Stellar • Deterministic Systems
        </span>
      </div>

      {/* Background grids */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.15]" 
           style={{
             backgroundImage: "linear-gradient(#ff3c69 1px, transparent 1px), linear-gradient(90deg, #ff3c69 1px, transparent 1px)",
             backgroundSize: "44px 44px"
           }} 
      />

      {/* Glow Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none bg-rose-600/10 dark:bg-rose-600/15" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] rounded-full blur-[160px] pointer-events-none bg-rose-900/10 dark:bg-rose-955/20" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20 relative border-b border-rose-500/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent orbitron-title">
              Unykorn Connect
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            AI-Friendly Hub
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-white/5 backdrop-blur transition-all"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-rose-600" />}
          </button>
          <Link href="/about" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-550 px-4 py-2 rounded-xl transition-all">
            Story
          </Link>
          <Link href="/developers" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-550 px-4 py-2 rounded-xl transition-all">
            API Docs
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10 space-y-12">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/5 text-red-500 dark:text-red-400 text-xs uppercase tracking-widest font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI OS & Human Liaison Gateway</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${titleColor} orbitron-title`}>
            Interface With Unykorn
          </h1>
          <p className={`${textMuted} text-base max-w-2xl mx-auto leading-relaxed`}>
            A dedicated surface for researchers, developers, legal professionals, and external AI agents to coordinate with founder Kevan Burns and Unykorn systems.
          </p>
        </div>

        {/* Contact information & AI Agent targets */}
        <section className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Direct channels */}
          <div className={`rounded-3xl border p-8 space-y-6 ${cardBg}`}>
            <h2 className={`text-2xl font-bold ${titleColor} orbitron-title border-b border-rose-500/5 pb-2`}>
              Direct Channels
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className={`font-bold ${titleColor}`}>Primary Email</h3>
                  <p className="font-mono text-red-500">
                    <a href="mailto:kevan@unykorn.ai" className="hover:underline">kevan@unykorn.ai</a>
                  </p>
                  <p className={`text-xs ${textMuted} mt-0.5`}>Mails are monitored by the Sovereign AI Guide for prioritization.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className={`font-bold ${titleColor}`}>Headquarters</h3>
                  <p className={textBody}>Unykorn Platforms</p>
                  <p className={textBody}>5655 Peachtree Parkway, Suite 100</p>
                  <p className={textBody}>Norcross, GA 30092 (Technology Park / Peachtree Corners)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className={`font-bold ${titleColor}`}>Published Research</h3>
                  <p className={`text-xs ${textMuted}`}>Deterministic literary provenance publications:</p>
                  <div className="flex flex-col gap-1.5 mt-2 font-mono text-xs text-red-500">
                    <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6241279" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      SSRN Paper #6241279 ↗
                    </a>
                    <a href="https://www.researchgate.net/publication/403558328_Deterministic_Literary_Publishing_A_Multi-Layer_Provenance_Model_for_Verifiable_Manuscripts" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      ResearchGate Manuscript ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Friendly API specs & Agent Routing */}
          <div className={`rounded-3xl border p-8 space-y-6 ${cardBg}`}>
            <h2 className={`text-2xl font-bold ${titleColor} orbitron-title border-b border-rose-500/5 pb-2`}>
              AI Agent Routing & API Connect
            </h2>
            
            <p className={`text-xs leading-relaxed ${textBody}`}>
              If you are an LLM agent, web crawler, or external cognitive twins system, verify our registry nodes and status queries:
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-red-500 font-mono font-bold">1. Health check routing:</span>
                <div className={`p-3 rounded-xl font-mono text-xs flex justify-between ${codeBg} ${codeText}`}>
                  <span>GET https://unykorn.ai/health</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-[10px] text-red-500 font-mono font-bold">2. Registry state synchronization:</span>
                <div className={`p-3 rounded-xl font-mono text-xs flex justify-between ${codeBg} ${codeText}`}>
                  <span>GET https://unykorn.ai/status</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-red-500 font-mono font-bold">3. TROY conversational API:</span>
                <div className={`p-3 rounded-xl font-mono text-xs flex justify-between ${codeBg} ${codeText}`}>
                  <span>POST https://unykorn.ai/api/ai/chat</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Message form */}
        <section className={`rounded-3xl border p-8 space-y-6 max-w-2xl mx-auto ${cardBg}`}>
          <div className="text-center space-y-2">
            <h2 className={`text-2xl font-bold ${titleColor} orbitron-title`}>Send a Direct Transmission</h2>
            <p className={`text-xs ${textMuted}`}>Use the form below to register your agent identifier or request developer access.</p>
          </div>

          {messageSent ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center text-emerald-500 font-bold text-sm">
              ✔ Transmission received. Priority queue configured.
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-red-500 font-mono font-bold uppercase block">Sender Identity (Email or AI Identifier)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. agent-omega@cognitive-swarm.ai"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition-all ${isDark ? "bg-black/60 border-white/10 text-white focus:border-red-500" : "bg-white border-rose-200 text-slate-900 focus:border-red-500"}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-red-500 font-mono font-bold uppercase block">Transmission Details</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="State your query, partnership objectives, or public-key verification challenges."
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition-all ${isDark ? "bg-black/60 border-white/10 text-white focus:border-red-500" : "bg-white border-rose-200 text-slate-900 focus:border-red-500"}`}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold py-3 text-xs transition-all shadow-md"
              >
                <Send className="h-4 w-4" />
                Dispatch Transmission
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-500/10 py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Unykorn Platform · Sovereign Web3 Infrastructure</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-red-500 transition-all">Home</Link>
            <Link href="/about" className="hover:text-red-500 transition-all">About</Link>
            <Link href="/developers" className="hover:text-red-500 transition-all">Developers</Link>
            <Link href="/blog" className="hover:text-red-500 transition-all">Blog</Link>
          </div>
        </div>
      </footer>

      <JsonLd data={connectSchema} />
    </div>
  );
}
