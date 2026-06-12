"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe, Shield, FileText, Wallet, Search, ArrowRight,
  Terminal, Sparkles, Send, Moon, Sun, Info, HelpCircle,
  Database, Network, Cpu, Lock, HelpCircle as HelpIcon
} from "lucide-react";

export default function RegistryGatewayClient() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState(
    "Ask a question, touch a root, explore utility or value, claim a free namespace, or enter the full Web3 operating system. The interface is meant to feel alive and conversational without falling into hard boxed layouts."
  );
  const [namespaceInput, setNamespaceInput] = useState("");
  const [claimOutput, setClaimOutput] = useState("Type a name to see a quick gateway preview.");

  const responses: Record<string, string> = {
    default: "Troptions Registry is a dual-chain namespace system. Ask about identity, value, vaults, roots, or entering the full operating system.",
    ".1": ".1 is framed here as a prime identity root concept: simple, scarce-feeling, and useful as a clean starting namespace for people, brands, and systems.",
    ".gold": ".gold points toward store-of-value, treasury signaling, and premium identity lanes. Troptions documents already describe Gold as a wealth-preservation asset family concept.",
    ".rwa": ".rwa points toward real-world asset tokenization. The ecosystem documents connect RWA logic to Ruby RWA, real estate tokenization, and anchored ownership records.",
    ".estate": ".estate points toward legacy, beneficiary logic, vaults, and succession-ready naming. That maps closely to the Legacy Vault and namespace permanence materials.",
    ".mcp": ".mcp is shown as an agent-tooling concept root for MCP-style AI and orchestration surfaces. It is presented here as a future-facing namespace lane, not a documented live production root.",
    ".bank": ".bank signals regulated identity, compliance, treasury, and institutional trust. That aligns with the Institutional Gateway and banking rail positioning in the source materials."
  };

  const handleBubbleClick = (root: string) => {
    setAiResponse(responses[root] || responses.default);
  };

  const handleAsk = async (queryStr?: string) => {
    const q = (queryStr || aiInput).trim();
    if (!q) {
      setAiResponse(responses.default);
      return;
    }
    
    if (!queryStr) setAiInput("");

    // Quick local checks for predefined suffixes
    const lowerQ = q.toLowerCase();
    if (responses[lowerQ]) {
      setAiResponse(responses[lowerQ]);
      return;
    }

    setAiResponse("Querying UnyKorn AI mesh...");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.content);
      } else {
        setAiResponse("The sovereign AI mesh could not be reached at this time.");
      }
    } catch (e) {
      setAiResponse("Connection to UnyKorn AI timed out.");
    }
  };

  const handleClaim = () => {
    const name = namespaceInput.trim().replace(/\s+/g, "");
    if (!name) {
      setClaimOutput("Enter a namespace prefix first, for example: CedarValley, StoneFamily, NovaPay, or HorizonBank.");
      return;
    }
    setClaimOutput(`Preview Lanes for "${name}": 
- Personal: ${name}.legacy (Estate & Family Vaults)
- Business: ${name}.store (Payments & Barter)
- Institution: ${name}.bank (Gated Compliance)
- Developer: ${name}.mcp (API & Agent Swarms)
- Root Owner: Acquire and own the .${name.toLowerCase()} suffix layer.`);
    setAiResponse(`I have configured the routing template for "${name}". For individuals/families, register under the existing roots (e.g. ${name}.legacy). If you are a strategic partner or holding entity, you can apply to own the top-level .${name.toLowerCase()} root itself.`);
  };

  const suffixes = [
    ".1", ".gold", ".gas", ".oil", ".bank", ".money", ".rwa", ".estate", ".vault", ".legacy",
    ".chain", ".trust", ".fund", ".pay", ".yield", ".treasury", ".energy", ".power", ".grid", ".solar",
    ".mining", ".carbon", ".credit", ".trade", ".swap", ".x", ".med", ".doc", ".law", ".id",
    ".ai", ".agent", ".mcp", ".node", ".cloud", ".quant", ".secure", ".proof", ".sign", ".ipfs",
    ".meta", ".build", ".dev", ".land", ".home", ".water", ".food", ".store", ".world", ".prime"
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${theme === "dark" ? "dark" : ""} ${
      theme === "dark" 
        ? "bg-[#09040a] text-[#ffdce6] selection:bg-rose-500/30" 
        : "bg-[#fbf5f6] text-[#250d14] selection:bg-rose-500/20"
    }`}>
      

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
        .animate-float-1 { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-2 { animation: float-medium 8s ease-in-out infinite; }
        .animate-float-3 { animation: float-slow 9s ease-in-out infinite -2s; }
        .animate-float-4 { animation: float-medium 6s ease-in-out infinite -1.5s; }
        .animate-float-5 { animation: float-slow 8.5s ease-in-out infinite -3s; }
        .animate-float-6 { animation: float-medium 7.5s ease-in-out infinite -1s; }
      `}} />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.15]" 
           style={{
             backgroundImage: "linear-gradient(#ff3c69 1px, transparent 1px), linear-gradient(90deg, #ff3c69 1px, transparent 1px)",
             backgroundSize: "44px 44px"
           }} 
      />

      {/* Radiant Glow Spheres */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none bg-rose-600/10 dark:bg-rose-600/15" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] rounded-full blur-[160px] pointer-events-none bg-rose-900/10 dark:bg-rose-955/20" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20 relative border-b border-rose-500/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent orbitron-title">
              Unykorn Registry
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Gateway
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-white/5 backdrop-blur transition-all"
            title="Toggle Light/Dark Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-rose-600" />}
          </button>
          <Link href="/troptions" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-655 px-4 py-2 rounded-xl transition-all">
            Ecosystem Manual
          </Link>
          <Link href="/registry" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-4 py-2 text-xs transition-all shadow-md shadow-red-500/10">
            Enter Cockpit
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-20">
        
        <section className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/5 text-red-500 dark:text-red-400 text-xs uppercase tracking-widest font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Web3 Registry Gateway</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none orbitron-title">
              Unykorn Registry for Web3 Namespaces
            </h1>
            
            <p className="text-sm sm:text-base text-slate-900 dark:text-slate-300 leading-relaxed max-w-xl">
              This front page stays simple but feels alive: a conversational AI gateway, floating root bubbles, utility and valuer cues, and a direct path into free namespace registration before the deeper operating system opens up.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {[".1", ".gold", ".rwa", ".estate", ".bank", ".money"].map((root) => (
                <span 
                  key={root} 
                  onClick={() => handleBubbleClick(root)}
                  className="border border-red-500/20 bg-red-500/5 hover:border-red-500/45 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-xs font-mono font-bold cursor-pointer transition-all"
                >
                  {root}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href="#entry" className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-3 text-xs transition-all shadow-md shadow-red-500/10">
                Register free namespace
              </a>
              <a href="#questions" className="rounded-xl border border-red-500/20 hover:bg-black/5 dark:hover:bg-white/5 text-slate-900 dark:text-slate-200 font-bold px-5 py-3 text-xs transition-all">
                Ask what this is
              </a>
              <Link href="/" className="rounded-xl border border-red-500/20 hover:bg-black/5 dark:hover:bg-white/5 text-slate-900 dark:text-slate-200 font-bold px-5 py-3 text-xs transition-all">
                Enter full system
              </Link>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-400 font-mono">Simple first. Full registry and operating system after entry.</p>
          </div>

          {/* Interactive Gateway Zone (Floating Bubbles & Chat) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-red-500/20 bg-[#120813]/60 backdrop-blur-xl p-6 relative overflow-hidden shadow-2xl min-h-[520px] flex flex-col justify-between">
              
              {/* Bubble Zone */}
              <div className="relative h-64 border-b border-white/5 pb-4">
                <button 
                  onClick={() => handleBubbleClick(".1")} 
                  className="absolute top-4 left-4 w-20 h-20 rounded-full border border-rose-500/20 bg-rose-950/20 hover:bg-rose-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg animate-float-1"
                >
                  <strong className="font-bold text-sm">.1</strong>
                  <span className="text-[7px] text-rose-300">Prime ID</span>
                </button>
                <button 
                  onClick={() => handleBubbleClick(".gold")} 
                  className="absolute top-2 right-12 w-20 h-20 rounded-full border border-amber-500/25 bg-amber-950/20 hover:bg-amber-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg animate-float-2"
                >
                  <strong className="font-bold text-sm">.gold</strong>
                  <span className="text-[7px] text-amber-300">Value lane</span>
                </button>
                <button 
                  onClick={() => handleBubbleClick(".rwa")} 
                  className="absolute top-24 left-32 w-20 h-20 rounded-full border border-blue-500/20 bg-blue-950/20 hover:bg-blue-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg animate-float-3"
                >
                  <strong className="font-bold text-sm">.rwa</strong>
                  <span className="text-[7px] text-blue-300">Asset bridge</span>
                </button>
                <button 
                  onClick={() => handleBubbleClick(".estate")} 
                  className="absolute bottom-4 left-10 w-20 h-20 rounded-full border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg animate-float-4"
                >
                  <strong className="font-bold text-sm">.estate</strong>
                  <span className="text-[7px] text-emerald-300">Legacy logic</span>
                </button>
                <button 
                  onClick={() => handleBubbleClick(".mcp")} 
                  className="absolute bottom-6 right-8 w-20 h-20 rounded-full border border-purple-500/20 bg-purple-950/20 hover:bg-purple-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg animate-float-5"
                >
                  <strong className="font-bold text-sm">.mcp</strong>
                  <span className="text-[7px] text-purple-300">Agent tools</span>
                </button>
                <button 
                  onClick={() => handleBubbleClick(".bank")} 
                  className="absolute top-28 right-32 w-20 h-20 rounded-full border border-red-500/20 bg-red-950/20 hover:bg-red-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg animate-float-6"
                >
                  <strong className="font-bold text-sm">.bank</strong>
                  <span className="text-[7px] text-red-300">Institution</span>
                </button>
              </div>

              {/* Conversational Output */}
              <div className="flex-grow pt-4 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      Unykorn AI Live Guide
                    </p>
                    <span className="text-[9px] text-slate-500 font-mono">MCP Protocol</span>
                  </div>
                  <div className="bg-black/65 border border-white/10 rounded-xl p-4 text-xs leading-relaxed max-h-40 overflow-y-auto text-slate-200">
                    {aiResponse}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask about .gold, vaults, or free registration..."
                    className="flex-grow bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-red-500/40"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAsk(); }}
                  />
                  <button 
                    onClick={() => handleAsk()}
                    className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-bold transition-all"
                  >
                    <Send className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="space-y-6">
          <div className="border-b border-rose-500/10 pb-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold orbitron-title text-slate-900 dark:text-white">Utility, Value, Vault, & Market Lanes</h2>
            <p className="text-xs text-slate-800 dark:text-slate-300 mt-1">
              Deep technical structures supporting multi-ledger identities and institutional compliance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/70 dark:bg-[#120813]/60 border border-red-500/10 dark:border-red-500/20 p-6 rounded-3xl backdrop-blur space-y-4 shadow-sm">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-bold uppercase tracking-widest block">01. Utility Namespaces</span>
              <h3 className="text-lg font-bold orbitron-title text-slate-900 dark:text-white">Identity, Rights & Actions</h3>
              <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
                Namespaces act as the root identity from which assets, credentials, transaction history, permissions, and sub-namespaces branch. Utility roots function as active operational handles.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-[#120813]/60 border border-red-500/10 dark:border-red-500/20 p-6 rounded-3xl backdrop-blur space-y-4 shadow-sm">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-bold uppercase tracking-widest block">02. Valuers & Pricing AI</span>
              <h3 className="text-lg font-bold orbitron-title text-slate-900 dark:text-white">Rarity, Comps & Scarcity</h3>
              <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
                Ecosystem documentation emphasizes assets, trust, and registry logic rather than speculation. We deploy utility-aware forecasting based on scarcity, comparables, and strategic fit.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-[#120813]/60 border border-red-500/10 dark:border-red-500/20 p-6 rounded-3xl backdrop-blur space-y-4 shadow-sm">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-bold uppercase tracking-widest block">03. Vault-Ready Identity</span>
              <h3 className="text-lg font-bold orbitron-title text-slate-900 dark:text-white">Legacy, Estate & Succession</h3>
              <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
                The Legacy Vault functions as a sovereign namespace system for families and professionals, securing encrypted storage, multi-chain anchors, and automated successor workflows.
              </p>
            </div>
          </div>
        </section>

        {/* Claim / Entry Gateway */}
        <section id="entry" className="grid md:grid-cols-2 gap-8 items-start">
          <div className="rounded-3xl border border-red-500/20 bg-white/70 dark:bg-[#120813]/60 backdrop-blur-xl p-6 space-y-6 shadow-md">
            <div>
              <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-bold uppercase tracking-widest block mb-1">Onboarding Rails</span>
              <h3 className="text-xl font-bold orbitron-title text-slate-900 dark:text-white">Register Free Namespace Preview</h3>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
              The official Troptions onboarding flow is AI-guided. Type in your desired namespace prefix (e.g. CedarValley, StoneFamily, NovaPay) to verify namespace availability and structure quorums.
            </p>
            <div className="flex gap-2 bg-white/80 dark:bg-black/60 border border-red-500/20 dark:border-white/10 rounded-xl p-1.5 shadow-inner">
              <input 
                type="text" 
                value={namespaceInput}
                onChange={(e) => setNamespaceInput(e.target.value)}
                placeholder="Enter namespace prefix (e.g. CedarValley)"
                className="flex-grow bg-transparent border-0 text-xs text-slate-900 dark:text-white outline-none px-3 py-2"
                onKeyDown={(e) => { if (e.key === "Enter") handleClaim(); }}
              />
              <button 
                onClick={handleClaim}
                className="rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 text-xs transition-all shadow-md"
              >
                Claim Preview
              </button>
            </div>
            <p className="text-xs text-slate-900 dark:text-slate-300 font-mono italic leading-normal">
              {claimOutput}
            </p>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-white/70 dark:bg-[#120813]/60 backdrop-blur-xl p-6 space-y-6 shadow-md">
            <div>
              <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-bold uppercase tracking-widest block mb-1">Deeper Environment</span>
              <h3 className="text-xl font-bold orbitron-title text-slate-900 dark:text-white">After On-Chain Entry</h3>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
              Once you complete your namespace configuration, you gain access to the deeper operating system: minting consoles, merchant payment gateways, estate succession vaults, real-world asset registries, and secondary trading indices.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#fcfbf9]/90 dark:bg-black/40 border border-red-500/10 dark:border-white/5 p-4 rounded-xl space-y-2 animate-pulse-slow">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">What it does</h4>
                <p className="text-[10px] text-slate-800 dark:text-slate-300 leading-relaxed">
                  Troptions Registry allows users to deploy usable Web3 names linked to document hashes, payment addresses, and heir-release logic.
                </p>
              </div>
              <div className="bg-[#fcfbf9]/90 dark:bg-black/40 border border-red-500/10 dark:border-white/5 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Why this layout</h4>
                <p className="text-[10px] text-slate-800 dark:text-slate-300 leading-relaxed">
                  The front page remains lightweight, placing the AI guide at the center to answer questions immediately before initiating heavy blockchain setups.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Guide & 50 Suffixes Preview */}
        <section id="questions" className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-3xl border border-red-500/20 bg-white/70 dark:bg-[#120813]/60 backdrop-blur-xl p-6 space-y-6 shadow-md">
            <h3 className="text-xl font-bold orbitron-title flex items-center gap-2 text-slate-900 dark:text-white">
              <HelpIcon className="h-5 w-5 text-red-600 dark:text-red-500" />
              Conversational Prompt Guide
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
              Click any of the common prompts below to ask the AI guide about registry operations:
            </p>
            <div className="flex flex-col gap-2">
              {[
                "What is a namespace and why would I want one?",
                "Can I register a free Web3 identity for my business or family?",
                "How do Troptions roots like .1, .gold, and .rwa actually work?",
                "What happens after I enter the full system?"
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="w-full text-left bg-[#fcfbf9]/90 dark:bg-black/40 border border-red-500/10 dark:border-white/5 hover:border-red-500/30 p-3 rounded-xl text-xs text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all flex justify-between items-center"
                >
                  <span>{q}</span>
                  <ArrowRight className="h-3 w-3 text-red-600 dark:text-red-500 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-white/70 dark:bg-[#120813]/60 backdrop-blur-xl p-6 space-y-6 shadow-md">
            <h3 className="text-xl font-bold orbitron-title flex items-center gap-2 text-slate-900 dark:text-white">
              <Network className="h-5 w-5 text-red-600 dark:text-red-500" />
              Sovereign Root Universe (50 Suffixes)
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
              This concept universe is presented as a forward-looking namespace index for discovery, routing, and AI-assisted asset valuation:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-2">
              {suffixes.map((s) => (
                <span 
                  key={s}
                  onClick={() => handleBubbleClick(s)}
                  className="bg-[#fcfbf9]/90 dark:bg-black/60 border border-red-500/10 dark:border-white/5 hover:border-red-500/30 text-slate-800 dark:text-[#ffdce6] hover:text-rose-950 dark:hover:text-white px-2 py-1 rounded-lg text-[10px] font-mono cursor-pointer transition-all"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Alive Check */}
        <section className="space-y-6">
          <div className="border-b border-rose-500/10 pb-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold orbitron-title text-slate-900 dark:text-white">Why It Feels Alive</h2>
            <p className="text-xs text-slate-800 dark:text-slate-400 mt-1 font-mono">
              Embedded AI and dual-chain execution at Marietta, Georgia.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/70 dark:bg-[#120813]/60 border border-red-500/10 p-6 rounded-3xl space-y-3 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white orbitron-title">Dual-Chain Anchoring</h4>
              <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
                Stellar secures our financial compliance layers and commodity allocations (Zurich gold). Solana manages fast application flows, SFT tokens, and local agent keys.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-[#120813]/60 border border-red-500/10 p-6 rounded-3xl space-y-3 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white orbitron-title">AI-First Entry</h4>
              <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
                Instead of demanding complex cryptographic setup from the start, TROY AI guides on namespace choices, trust allocations, and legal settings in plain language.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-[#120813]/60 border border-red-500/10 p-6 rounded-3xl space-y-3 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white orbitron-title">Expandable Posture</h4>
              <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
                A simple gateway acts as a clean point of entry. Once users enter, they can access the full suite: wallets, swap pools, estate executors, and developer modules.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-rose-500/10 py-10 mt-16 text-xs text-slate-700 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Unykorn Platform · Sovereign Web3 Infrastructure</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-red-500 transition-all">Home</Link>
            <Link href="/about" className="hover:text-red-500 transition-all">About</Link>
            <Link href="/developers" className="hover:text-red-500 transition-all">Developers</Link>
            <Link href="/blog" className="hover:text-red-500 transition-all">Blog</Link>
            <Link href="/research" className="hover:text-red-500 transition-all">Research Portal</Link>
            <Link href="/connect" className="hover:text-red-500 transition-all">Connect Hub</Link>
            <Link href="/media" className="hover:text-red-500 transition-all">Media & Portfolio</Link>
            <Link href="/troptionsinvestors" className="hover:text-red-500 transition-all">Investor Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
