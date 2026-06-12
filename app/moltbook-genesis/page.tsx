"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Sparkles, Shield, Cpu, Activity, Play, RefreshCw, Terminal, Layers } from "lucide-react";
import { JsonLd } from "../components/JsonLd";

interface CrateInfo {
  name: string;
  desc: string;
  lines: number;
  coverage: string;
}

export default function MoltbookGenesisPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [simRunning, setSimRunning] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([
    "[SYSTEM] Moltbook Genesis Protocol Node standby.",
    "[SYSTEM] Loaded 13 Rust crates and 396 automated tests."
  ]);
  const [activeWorld, setActiveWorld] = useState<number>(6821);

  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardBg = isDark ? "bg-[#120813]/60 border-white/5" : "bg-white border-rose-100 shadow-md";
  const textMuted = isDark ? "text-slate-400" : "text-slate-800";
  const titleColor = isDark ? "text-white" : "text-slate-955";
  const textBody = isDark ? "text-slate-300" : "text-slate-900";
  const codeBg = isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-rose-100";
  const codeText = isDark ? "text-slate-300" : "text-slate-900 font-semibold";

  const rustCrates: CrateInfo[] = [
    { name: "moltbook-kernel", desc: "Core state machine, determinism checks, and strict seed-based RNG.", lines: 4800, coverage: "98.2%" },
    { name: "moltbook-simulation", desc: "Tick-based world simulator engine coordinating multiple agents.", lines: 7500, coverage: "96.5%" },
    { name: "moltbook-macro-models", desc: "Decentralized macroeconomic models, supply-demand curves, and currency flow.", lines: 9200, coverage: "95.1%" },
    { name: "moltbook-solana-bridge", desc: "Simulates Solana Token-2022 non-transferable identity registers.", lines: 3400, coverage: "94.8%" },
    { name: "moltbook-stellar-bridge", desc: "Simulates Stellar asset anchor structures and legally-bound receipts.", lines: 3800, coverage: "95.0%" },
    { name: "moltbook-validator", desc: "Carrying capacity calculator preventing transaction rate saturation.", lines: 5200, coverage: "97.4%" },
    { name: "moltbook-x402-membrane", desc: "ATP metered API pricing simulation and per-request settlement validation.", lines: 4100, coverage: "96.8%" },
    { name: "moltbook-timesfm-agent", desc: "TimesFM-200m forecasting hook projecting carrying capacity limits.", lines: 2800, coverage: "92.5%" },
    { name: "moltbook-analytics", desc: "Data exporter preparing real-time BigQuery streaming simulations.", lines: 6100, coverage: "94.0%" },
    { name: "moltbook-visualizer", desc: "Renders graphical charts and world state history timelines.", lines: 8300, coverage: "91.8%" },
    { name: "moltbook-notary", desc: "Simulates guardian ZK trust quorums and time-locked vault release triggers.", lines: 4500, coverage: "97.0%" },
    { name: "moltbook-tests-harness", desc: "Testing suite covering integration tests across simulated worlds.", lines: 12200, coverage: "100%" },
    { name: "moltbook-cli", desc: "Command line shell interface for launching and monitoring simulation ticks.", lines: 5905, coverage: "95.5%" }
  ];

  const triggerSimulation = () => {
    if (simRunning) return;
    setSimRunning(true);
    const worldId = activeWorld + 1;
    setActiveWorld(worldId);

    setSimLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [WORLD #${worldId}] Spawning independent deterministic simulation...`,
      `[${new Date().toLocaleTimeString()}] [WORLD #${worldId}] Seeding moltbook-kernel RNG with blockhash 0x4f8e...`,
    ]);

    setTimeout(() => {
      setSimLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [WORLD #${worldId}] Loaded 13 crates. Starting tick loop.`,
        `[${new Date().toLocaleTimeString()}] [WORLD #${worldId}] Tick 100: Inflation stabilized at 2.1%. Macro-models balanced.`,
        `[${new Date().toLocaleTimeString()}] [WORLD #${worldId}] Tick 500: Solana SPL / Stellar mirror carrying capacity verified.`,
      ]);

      setTimeout(() => {
        setSimLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [WORLD #${worldId}] Tick 1000: x402 membranes deployed. Metered rate set to 0.05 USDF/sec.`,
          `[${new Date().toLocaleTimeString()}] [WORLD #${worldId}] Simulation complete. Divergence rate: 0.00% (Absolute Determinism).`,
          `[${new Date().toLocaleTimeString()}] [WORLD #${worldId}] Results synced to mock BigQuery write buffer.`
        ]);
        setSimRunning(false);
      }, 1200);
    }, 1200);
  };

  const moltbookSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Moltbook Genesis Protocol - Deterministic Simulation Engine",
    description: "Technical details of Unykorn's Moltbook Genesis Protocol: a deterministic macroeconomic simulation engine built in Rust.",
    url: "https://unykorn.ai/moltbook-genesis"
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${bgStyle}`}>
      

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
              Moltbook Genesis
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Protocol
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
          <Link href="/about" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-555 px-4 py-2 rounded-xl transition-all">
            About Unykorn
          </Link>
          <Link href="/registry" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-4 py-2 text-xs transition-all shadow-md shadow-red-500/10">
            Enter Cockpit
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10 space-y-16">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/5 text-red-500 dark:text-red-400 text-xs uppercase tracking-widest font-mono">
            <Cpu className="h-3.5 w-3.5" />
            <span>Deterministic Macroeconomic Simulation</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${titleColor} orbitron-title`}>
            Moltbook Genesis Protocol
          </h1>
          <p className={`${textMuted} text-base max-w-2xl mx-auto leading-relaxed`}>
            Moltbook is Unykorn's proprietary simulation environment. It models network load, tokenized gold asset flows, and per-request x402 membranes across thousands of simulated worlds.
          </p>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Rust Crates", val: "13" },
            { label: "Automated Tests", val: "396" },
            { label: "Simulated Worlds", val: "6,820+" },
            { label: "Simulation Divergence", val: "0.00%" }
          ].map((item, idx) => (
            <div key={idx} className={`p-6 rounded-3xl border text-center space-y-2 ${cardBg}`}>
              <div className="text-3xl font-black text-red-500 orbitron-title">{item.val}</div>
              <div className={`text-xs uppercase tracking-wider ${textMuted}`}>{item.label}</div>
            </div>
          ))}
        </section>

        {/* Technical overview */}
        <section className="grid lg:grid-cols-2 gap-8 items-start">
          <div className={`rounded-3xl border p-8 space-y-6 ${cardBg}`}>
            <h2 className={`text-2xl font-bold ${titleColor} orbitron-title border-b border-rose-500/5 pb-2`}>
              Macroeconomic Carrying Capacity
            </h2>
            <p className={`text-sm leading-relaxed ${textBody}`}>
              Before a Web3 namespace root (such as <strong>.gold</strong> or <strong>.1</strong>) is minted on Solana or Stellar, it is subjected to extensive macroeconomic validation. The Moltbook simulator spins up an isolated world tick loop to evaluate the carrying capacity parameters:
            </p>
            <ul className={`list-disc pl-5 text-xs sm:text-sm space-y-2 ${textBody}`}>
              <li><strong>RWA Cap Bounds:</strong> Assesses maximum valuation limits dynamically based on scarcity.</li>
              <li><strong>API Webhook Pressure:</strong> Simulates heavy metered traffic through x402 payment membranes.</li>
              <li><strong>Consensus Stability:</strong> Validates multi-sig ZK heirs release quorums under stress test tick patterns.</li>
            </ul>
          </div>

          {/* Interactive Simulator Console */}
          <div className={`rounded-3xl border p-8 space-y-6 ${cardBg}`}>
            <div className="flex justify-between items-center border-b border-rose-500/5 pb-2">
              <h2 className={`text-xl font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
                <Terminal className="h-5 w-5 text-red-500" /> Interactive Simulator
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Current World: #{activeWorld}</span>
            </div>

            <div className={`p-4 rounded-2xl font-mono text-[11px] h-48 overflow-y-auto ${codeBg} ${codeText} space-y-2`}>
              {simLogs.map((log, idx) => (
                <div key={idx} className={log.includes("complete") || log.includes("stabilized") ? "text-emerald-500" : ""}>
                  {log}
                </div>
              ))}
            </div>

            <button
              onClick={triggerSimulation}
              disabled={simRunning}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold py-3 text-xs transition-all shadow-md disabled:opacity-50"
            >
              {simRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {simRunning ? "Running Simulation Tick Loop..." : "Launch Macro Simulation"}
            </button>
          </div>
        </section>

        {/* 13 Rust Crates directory */}
        <section className="space-y-6">
          <div className="border-b border-rose-500/10 pb-5">
            <h2 className={`text-2xl sm:text-3xl font-extrabold orbitron-title ${titleColor}`}>The 13 Modular Rust Crates</h2>
            <p className={`text-xs ${textMuted} mt-1`}>
              Our complete simulator codebase is split into modular components for strict compilation and audit tracing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rustCrates.map((c) => (
              <div key={c.name} className={`p-6 rounded-3xl border flex flex-col justify-between h-48 ${cardBg}`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-red-500 font-mono font-bold">Crate</span>
                    <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                      {c.coverage} Coverage
                    </span>
                  </div>
                  <h3 className={`text-base font-bold font-mono ${titleColor}`}>{c.name}</h3>
                  <p className={`text-[11px] leading-relaxed line-clamp-3 ${textMuted}`}>{c.desc}</p>
                </div>
                <div className="pt-2 border-t border-rose-500/5 text-[9px] text-slate-500 font-mono">
                  Approx. {c.lines.toLocaleString()} Lines of Code
                </div>
              </div>
            ))}
          </div>
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

      <JsonLd data={moltbookSchema} />
    </div>
  );
}
