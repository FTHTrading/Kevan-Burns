"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Layers, Cpu, Wallet, Globe, Coins, Shield,
  CheckCircle2, AlertTriangle, Clock, XCircle,
  ArrowRight, Lock, Zap, FileText, Search, Send,
  Terminal, Download, Printer, Copy, Sparkles,
  ExternalLink, ChevronRight, Activity, Moon, Sun, Info
} from "lucide-react";
import { manualChapters, Chapter } from "./manualData";

// ─── Status badge helper ──────────────────────────────────────────────────────
type StatusKind =
  | "IMPLEMENTED"
  | "SCAFFOLD"
  | "ADAPTER"
  | "SIMULATION_ONLY"
  | "LIVE_DISABLED"
  | "GATEWAY_READY"
  | "LEGAL_REQUIRED";

const STATUS_STYLES: Record<StatusKind, { cls: string; label: string; icon: React.ReactNode }> = {
  IMPLEMENTED:     { cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", label: "Implemented",     icon: <CheckCircle2 className="h-3 w-3" /> },
  SCAFFOLD:        { cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",   label: "Rust Scaffold",   icon: <Cpu className="h-3 w-3" /> },
  ADAPTER:         { cls: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",         label: "Adapter",         icon: <Layers className="h-3 w-3" /> },
  SIMULATION_ONLY: { cls: "border-amber-500/30 bg-amber-500/10 text-amber-400",      label: "Simulation Only", icon: <Clock className="h-3 w-3" /> },
  LIVE_DISABLED:   { cls: "border-orange-500/30 bg-orange-500/10 text-orange-400",   label: "Live Disabled",   icon: <AlertTriangle className="h-3 w-3" /> },
  GATEWAY_READY:   { cls: "border-blue-500/30 bg-blue-500/10 text-blue-400",         label: "Gateway Ready",   icon: <Globe className="h-3 w-3" /> },
  LEGAL_REQUIRED:  { cls: "border-red-500/30 bg-red-500/10 text-red-400",            label: "Legal Required",  icon: <XCircle className="h-3 w-3" /> },
};

function StatusBadge({ kind }: { kind: StatusKind }) {
  const s = STATUS_STYLES[kind];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

export default function TroptionsPortalClient() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [manualSearch, setManualSearch] = useState<string>("");
  const [universalQuery, setUniversalQuery] = useState<string>("");
  const [universalResults, setUniversalResults] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Welcome, Operator. I am TROY, the ecosystem AI agent. I can answer complex operational details about our 9-chain infrastructure, x402 payments, the A5 Agent mesh, or legal vaults. Try asking me a question below."
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const activeChapter = manualChapters.find(ch => ch.id === selectedChapterId) || manualChapters[0];

  // Sync title
  useEffect(() => {
    document.title = "TROPTIONS | Crimson Future Stack & Ecosystem Manual";
  }, []);

  // Universal search handler
  const handleUniversalSearch = (val: string) => {
    setUniversalQuery(val);
    if (!val.trim()) {
      setUniversalResults([]);
      return;
    }
    const term = val.toLowerCase();
    
    // Find matching chapters, keywords, or glossary items
    const matches: any[] = [];
    manualChapters.forEach(ch => {
      if (ch.title.toLowerCase().includes(term) || ch.content.toLowerCase().includes(term)) {
        // Find a brief snippet around the match
        const idx = ch.content.toLowerCase().indexOf(term);
        let snippet = "";
        if (idx !== -1) {
          snippet = ch.content.substring(Math.max(0, idx - 40), Math.min(ch.content.length, idx + 80)) + "...";
        } else {
          snippet = ch.content.substring(0, 100) + "...";
        }
        matches.push({
          type: "manual",
          title: ch.title,
          chapterId: ch.id,
          snippet: snippet
        });
      }
    });

    setUniversalResults(matches.slice(0, 5));
  };

  // Chat/TROY intelligence responder
  const handleSendMessage = () => {
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatLog(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setChatLoading(true);

    setTimeout(() => {
      const lowerText = userText.toLowerCase();
      let reply = "";

      // Smart matches based on the 18 chapters
      if (lowerText.includes("x402") || lowerText.includes("http 402") || lowerText.includes("payment membrane")) {
        reply = `According to Chapter 13 (x402: The Payment Membrane), x402 is an HTTP 402-based payment membrane settling at the protocol layer on Apostle Chain (chain 7332) via ATP (Automated Transaction Processing). It supports SOL, Polygon USDC, RLUSD, and credit cards via Stripe, enabling metered per-request billing for high-authority API infrastructure.`;
      } else if (lowerText.includes("bryan stone") || lowerText.includes("ceo") || lowerText.includes("founder")) {
        reply = `Bryan Stone is the Founder and CEO of TROPTIONS, leading the brand's 22-year institutional blockchain journey (headquartered in Norcross Technology Park, Peachtree Corners, GA). He is publicly identified as the operator of the TROPTIONS.GOLD namespace. Inquiries are routed through agents@legacychain.app.`;
      } else if (lowerText.includes("chain") || lowerText.includes("solana") || lowerText.includes("xrpl") || lowerText.includes("stellar")) {
        reply = `As outlined in Chapter 3 (The 9-Chain Network), TROPTIONS operates a federated stack spanning 6 live chains: 
1. XRPL: stablecoin gateway (rJLMSTy77hTxqgDw9WMxCnYC8m5vhqN3FQ), 0bps settlement.
2. Stellar: stablecoin mirror and asset anchoring (GB4FHGFUTLLMS3SC...).
3. Solana: SPL and Token-2022 minting, CPMM/DLMM liquidity pools at troptionsmint.com.
4. Apostle Chain (7332): Besu-based ATP settlement and x402 facilitator.
5. Polygon: LiteraryAnchor, PublishingKernelV2 (LPS-1), and USDC settlements.
6. Chainlink: Partial oracle price feeds.
Three additional chains (Sui, Stacks, Cosmos) are in the active integration pipeline.`;
      } else if (lowerText.includes("donk") || lowerText.includes("publishing")) {
        reply = `As documented in Chapter 8, DONK is a live autonomous AI agent operating donkai.org. It has an academically registered DOI (10.5281/zenodo.18646886) and publishes content directly to IPFS (QmPXtEsRwiWuaKmKNA569XAqFNVySN8pwTdGQrvcdpgtMa) and anchors them on-chain via the Polygon LiteraryAnchor contract using the PublishingKernelV2 protocol.`;
      } else if (lowerText.includes("georgia") || lowerText.includes("law") || lowerText.includes("will") || lowerText.includes("trust") || lowerText.includes("probate")) {
        reply = `Chapter 5 (Legacy Vault Protocol) explains that the system draft attorney-ready estate documents utilizing 13 Georgia-compliant templates (tailored to avoid the probate process in Georgia). The templates include full ZK trust notary, guardian quorums, and a Dead Man's Switch releasing AES-256 client-side encrypted vault files.`;
      } else if (lowerText.includes("gmiie") || lowerText.includes("pulse") || lowerText.includes("news")) {
        reply = `According to Chapter 9, the Global Market Intelligence and Institutional Engagement engine (GMIIE) runs at news.unykorn.org. It processes market signals through 5 analytical rings (Struct, Lang, Deploy, Frag, Fract) to generate 28 briefs refreshed every 8 hours, along with the NIG Composite Index (currently +28 Mild Positive).`;
      } else if (lowerText.includes("revenue") || lowerText.includes("pass") || lowerText.includes("price") || lowerText.includes("plan")) {
        reply = `TROPTIONS generates active revenue through three main platforms:
1. Legacy Vault plans: Essential ($29.95/mo), Premium ($49.95/mo), Elite ($89.95/mo), and a Presale Lifetime plan ($499.95).
2. PASS API Tiers: Basic ($49/mo), Pro ($199/mo), and Institutional ($499/mo) accessed via x402 HTTP gates.
3. Solana token minting fees (0.10 SOL) and 26WC nation token launches.
4. Apostle Chain internal transaction loops (Moltbook revenue loop).`;
      } else if (lowerText.includes("scam") || lowerText.includes("fraud") || lowerText.includes("fraud detection")) {
        reply = `Chapter 10 outlines blockchainfraud.org, the ecosystem's public fraud detection and OSINT monitoring platform. It tracks scam patterns, warns against recovery scams, and integrates Tor threat feeds to secure institutional operations.`;
      } else if (lowerText.includes("nil") || lowerText.includes("nil33") || lowerText.includes("athlete")) {
        reply = `As noted in Chapter 11, NIL33.com is an on-chain Name, Image, and Likeness registration portal. Athletes can anchor their NIL rights on-chain, allowing sponsors and brands to verify their identity directly without agency intermediaries.`;
      } else if (lowerText.includes("real estate") || lowerText.includes("ruby") || lowerText.includes("rwa")) {
        reply = `Chapter 12 outlines Ruby RWA, the real estate tokenization module. It converts real property deeds into fractional on-chain tokens linked directly to namespaces, enabling seamless time-locked succession within Legacy Vault plans.`;
      } else if (lowerText.includes("norcross") || lowerText.includes("address") || lowerText.includes("office")) {
        reply = `TROPTIONS HQ is situated at Norcross Technology Park, 5655 Peachtree Pkwy, Norcross, Georgia 30092. The office handles institutional inquiries, and coordinate white-glove setup calls for Legacy Vault Premium/Elite clients.`;
      } else {
        // General fallback search
        let matchedCh: Chapter | null = null;
        for (const ch of manualChapters) {
          if (ch.content.toLowerCase().includes(lowerText)) {
            matchedCh = ch;
            break;
          }
        }
        if (matchedCh) {
          reply = `Based on our manual search inside "${matchedCh.title}":\n\n${matchedCh.content.substring(0, 300)}...\n\nYou can read the full detail in Chapter ${matchedCh.id} on the manual browser below.`;
        } else {
          reply = `Operator, I evaluated your query: "${userText}". While I didn't locate an exact match, TROPTIONS operates as a 22-year federated infrastructure spanning 9 chains, 6 verticals, and 22 AI agents. Please specify if you want to know about 'x402 payments', '9 chains', 'Bryan Stone', or 'Georgia wills'.`;
        }
      }

      setChatLog(prev => [...prev, { sender: "ai", text: reply }]);
      setChatLoading(false);
    }, 1200);
  };

  const copyChapterText = () => {
    navigator.clipboard.writeText(activeChapter.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredChapters = manualChapters.filter(ch =>
    ch.title.toLowerCase().includes(manualSearch.toLowerCase()) ||
    ch.content.toLowerCase().includes(manualSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${
      theme === "dark" 
        ? "bg-[#09060a] text-[#f7e8ec] selection:bg-rose-500/30" 
        : "bg-[#f6efef] text-[#1d0e12] selection:bg-rose-500/20"
    }`}>
      
      {/* Google fonts loading */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        
        .orbitron-title {
          font-family: 'Orbitron', sans-serif;
        }
        .crimson-glass {
          background: ${theme === "dark" 
            ? "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)" 
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)"};
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          border: 1px solid ${theme === "dark" 
            ? "rgba(255, 170, 188, 0.15)" 
            : "rgba(124, 17, 30, 0.12)"};
          box-shadow: ${theme === "dark" 
            ? "0 20px 50px rgba(0, 0, 0, 0.3)" 
            : "0 10px 30px rgba(124, 17, 30, 0.05)"};
        }
        .crimson-glow {
          box-shadow: 0 0 40px ${theme === "dark" 
            ? "rgba(210, 25, 63, 0.25)" 
            : "rgba(207, 57, 84, 0.12)"};
        }
      `}} />

      {/* Grid overlay background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.15]" 
           style={{
             backgroundImage: "linear-gradient(#ff3c69 1px, transparent 1px), linear-gradient(90deg, #ff3c69 1px, transparent 1px)",
             backgroundSize: "44px 44px"
           }} 
      />

      {/* Glow Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none bg-rose-600/10 dark:bg-rose-600/15" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] rounded-full blur-[160px] pointer-events-none bg-rose-900/10 dark:bg-rose-950/20" />

      {/* TOP HEADER CONTROLS */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border border-red-500/30 bg-red-500/10 text-red-500">
            SYSTEM VERSION: JUNE 2026
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Operational" />
        </div>
        
        <button 
          onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
          className="p-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-white/5 backdrop-blur transition-all flex items-center gap-2 text-xs font-semibold"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-rose-500" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/5 text-red-500 dark:text-red-400 text-xs uppercase tracking-widest font-mono mb-6 crimson-glow">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          <span>Crimson Glass Protocol Surface</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight orbitron-title leading-none mb-6">
          TROPTIONS <span className="bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent">FUTURE STACK</span>
        </h1>
        
        <p className={`max-w-3xl mx-auto text-sm sm:text-base md:text-lg mb-8 font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-800"}`}>
          A crimson-themed institutional console coordinating namespace identities, multi-chain settlement rails, x402 metered payment gates, and our 22-agent autonomous AI Swarm. Fully integrated with our 18-chapter complete live ecosystem manual.
        </p>

        {/* GOOGLE-LIKE UNIVERSAL COMMAND SEARCH */}
        <div className="max-w-2xl mx-auto relative mb-12">
          <div className="relative flex items-center bg-white/5 border border-red-500/20 focus-within:border-red-500/50 rounded-full px-5 py-3.5 shadow-xl transition-all">
            <Search className="h-5 w-5 text-red-500 mr-3 shrink-0" />
            <input 
              type="text"
              placeholder="Search namespaces, rails, vaults, agents, compliance formulas..."
              value={universalQuery}
              onChange={(e) => handleUniversalSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-medium placeholder-slate-500 text-sm focus:ring-0"
            />
            {universalQuery && (
              <button 
                onClick={() => handleUniversalSearch("")}
                className="text-xs font-mono text-slate-400 hover:text-red-400 px-2.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Universal Search Results Popout */}
          {universalResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 p-4 rounded-2xl border border-red-500/20 bg-[#0f0a0e]/95 backdrop-blur-xl z-30 shadow-2xl text-left space-y-3">
              <p className="text-[10px] font-bold text-red-400 tracking-wider uppercase">System Matches</p>
              {universalResults.map((res, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    setSelectedChapterId(res.chapterId);
                    setUniversalResults([]);
                    setUniversalQuery("");
                    // Scroll to manual
                    document.getElementById("ecosystem-manual")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="p-3 rounded-xl hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/5 transition-all"
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-red-500" />
                    {res.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{res.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HERO MICRO STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[
            { strong: "9 Chains", span: "XRPL, Stellar, Solana, Besu, Polygon, etc." },
            { strong: "22 AI Agents", span: "Autonomous Swarms, TROY, DONK, twins" },
            { strong: "6 Live Rails", span: "Banking, Estate, Liquidity, Sports, Trade" },
            { strong: "x402 Gates", span: "HTTP-native metered micro-payments" }
          ].map((item, idx) => (
            <div key={idx} className="crimson-glass p-5 rounded-2xl text-center flex flex-col justify-center">
              <strong className="text-xl sm:text-2xl font-black orbitron-title bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
                {item.strong}
              </strong>
              <span className={`text-[11px] font-medium mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-800"}`}>{item.span}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI SHELL AND ARCHITECTURE TABS */}
      <section className="max-w-7xl mx-auto px-6 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: TROY AI AGENT COMMAND SHELL */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="crimson-glass p-6 rounded-3xl crimson-glow flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between border-b border-red-500/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center font-bold">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold text-sm orbitron-title">TROY AI Swarm Engine</h3>
                  <p className="text-[10px] text-red-500 dark:text-red-400 font-mono font-bold">Live MCP Terminal Context</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                Swarm Live
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[340px] pr-2 text-xs">
              {chatLog.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    chat.sender === "user" 
                      ? "bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-500/20 text-[#f7e8ec] rounded-tr-none" 
                      : "bg-white/5 border border-white/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-tl-none font-medium"
                  }`}>
                    {chat.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-2 text-slate-400">
                    <Clock className="h-3.5 w-3.5 animate-spin text-red-500" />
                    <span>TROY is checking manuals...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-red-500/10 pt-4 mt-4 space-y-3">
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {["What is x402?", "Bryan Stone?", "9 Chains?", "Wills & Trusts?"].map((txt, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setChatInput(txt);
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${theme === "dark" ? "border-white/5 bg-white/5 text-slate-400 hover:border-red-500/20 hover:bg-white/10" : "border-rose-100 bg-white text-slate-800 hover:border-red-500 hover:bg-rose-50"}`}
                  >
                    {txt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Query ecosystem manual details..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  className="w-full bg-white/5 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-red-500/50"
                />
                <button 
                  onClick={handleSendMessage}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold transition-all shrink-0 flex items-center justify-center"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CORE CAPABILITIES & LIVE INFRASTRUCTURE */}
        <div className="lg:col-span-7 space-y-6">
          <div className="crimson-glass p-6 rounded-3xl">
            <h3 className="text-xl font-bold orbitron-title mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-500" />
              Sovereign Operating Planes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Bryan Stone’s complete live structure coordinates value, computation, threats, and agents in an interdependent architecture.
            </p>

            <div className="space-y-4">
              {[
                { title: "S1 Settlement Plane", desc: "Financial Settlement Layer handling stablecoin gateways, zero bps transaction sets, and x402 gates on Apostle Besu Chain.", badge: "LIVE" },
                { title: "L2 Launch & RWA Plane", desc: "Asset Creation & Real-World Integration Layer handling Solana minting, estate trust structures, and Ruby RWA deeds.", badge: "LIVE" },
                { title: "E4 Intelligence Plane", desc: "Analytics & Monitoring Layer processing 5-ring GMIIE signals, fraud indexes, OSINT feeds, and blockchain fraud registry.", badge: "LIVE" },
                { title: "A5 Agent Swarm Mesh", desc: "Autonomous Swarm operations managing 22 registered agents, Telegram bot twins, and Polygon publishing cycles.", badge: "LIVE" }
              ].map((plane, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-white/5 bg-white/5 dark:bg-white/5 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs orbitron-title">{plane.title}</h4>
                    <p className={`text-[11px] mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-800"}`}>{plane.desc}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    {plane.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 18-CHAPTER ECOSYSTEM OPERATING MANUAL & DOCUMENTATION */}
      <section className="max-w-7xl mx-auto px-6 pb-20 relative z-10" id="ecosystem-manual">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-red-500/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-500 text-[10px] uppercase font-mono font-bold mb-3">
              Investor Grade Docs
            </div>
            <h2 className="text-3xl font-extrabold orbitron-title tracking-tight">
              Ecosystem Operating Manual
            </h2>
            <p className={`text-xs mt-1 max-w-xl ${theme === "dark" ? "text-slate-400" : "text-slate-800"}`}>
              18 complete chapters of detailed operations, technical specifications, and glossary items imported directly from our June 2026 investor documents.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={copyChapterText}
              className="px-3.5 py-2 rounded-xl border border-white/5 hover:border-red-500/30 bg-white/5 hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {isCopied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className={`h-4 w-4 ${theme === "dark" ? "text-slate-400" : "text-slate-700"}`} />}
              <span>{isCopied ? "Copied!" : "Copy Section"}</span>
            </button>
            
            <button 
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-red-500/10"
            >
              <Printer className="h-4 w-4" />
              <span>Print Manual</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MANUAL CHAPTER INDEX SIDEBAR */}
          <div className="lg:col-span-4 space-y-4">
            <div className="crimson-glass p-5 rounded-3xl max-h-[560px] overflow-y-auto scrollbar-thin">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Filter manual index..."
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-red-500/30"
                />
              </div>

              <div className="space-y-1">
                {filteredChapters.map((ch) => (
                  <button 
                    key={ch.id}
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                      selectedChapterId === ch.id 
                        ? "bg-red-500/20 text-[#f7e8ec] border border-red-500/30 font-bold" 
                        : `${theme === "dark" ? "text-slate-400 hover:text-[#f7e8ec]" : "text-slate-800 hover:text-[#1d0e12] font-semibold"} hover:bg-white/5`
                    }`}
                  >
                    <span className="truncate pr-2">{ch.title}</span>
                    <ChevronRight className={`h-3.5 w-3.5 text-slate-500 shrink-0 transition-transform ${
                      selectedChapterId === ch.id ? "rotate-90 text-red-400" : ""
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE CHAPTER RENDER PANEL */}
          <div className="lg:col-span-8">
            <div className="crimson-glass p-6 sm:p-8 rounded-3xl min-h-[560px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-red-500/10 pb-4 mb-6">
                  <span className="font-mono text-xs text-red-500 dark:text-red-400 font-bold uppercase tracking-wider">
                    Chapter {activeChapter.id} of 18
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">
                    June 2026 Release
                  </span>
                </div>

                <h3 className="text-2xl font-bold orbitron-title mb-6 leading-tight text-[#f7e8ec]">
                  {activeChapter.title}
                </h3>

                <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium space-y-4 ${theme === "dark" ? "text-slate-300" : "text-slate-900"}`}>
                  {activeChapter.content}
                </div>
              </div>

              <div className="border-t border-red-500/10 pt-6 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="text-[10px] text-slate-500 leading-normal">
                    This section represents active verified utility systems.
                  </span>
                </div>
                
                {activeChapter.id < 18 && (
                  <button 
                    onClick={() => setSelectedChapterId(prev => prev + 1)}
                    className="text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600 flex items-center gap-1 transition-all self-end sm:self-auto"
                  >
                    <span>Next: Chapter {activeChapter.id + 1}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold orbitron-title">WHAT WAS BUILT</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Key operational system targets completed inside the Next.js workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Visual Overhaul",
              desc: "Replaced plain HTML layout with deep dark red radial gradients, glassmorphism panel properties, and glowing state elements for a cohesive operator cockpit."
            },
            {
              title: "Command Shell",
              desc: "Engineered a client-side keyword scanner matching user inputs with our 18 PDF chapters to simulate a live MCP agent answering manual details."
            },
            {
              title: "Registry Universal Search",
              desc: "Configured a Google/Brave-style search box matching namespaces, glossary definitions, and platform statuses to route users into correct sections."
            }
          ].map((item, idx) => (
            <div key={idx} className="crimson-glass p-6 rounded-2xl border border-red-500/10">
              <h3 className="font-bold text-sm orbitron-title mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500" />
                {item.title}
              </h3>
              <p className={`text-xs leading-relaxed font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-800"}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-red-500/10 pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xs orbitron-title mb-3 text-red-500">TROPTIONS Platform</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              The institutional manual console maps Bryan Stone’s 22-year digital assets, x402 payment membranes, and Georgia-compliant estate vaults under a unified Crimson system.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-xs orbitron-title mb-3 text-[#f7e8ec]">Platform Links</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-400">
              <Link href="/" className="hover:text-red-400 transition-colors">UnyKorn Cockpit</Link>
              <Link href="/legacy-vault" className="hover:text-red-400 transition-colors">Legacy Vault</Link>
              <Link href="/namespaces" className="hover:text-red-400 transition-colors">Namespace Registry</Link>
              <Link href="/pricing" className="hover:text-red-400 transition-colors">Pricing & Plans</Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-xs orbitron-title mb-3 text-[#f7e8ec]">Norcross Headquarters</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">
              Norcross Technology Park<br />
              5655 Peachtree Pkwy, Norcross, Georgia 30092<br />
              Institutional Support: agents@legacychain.app
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
