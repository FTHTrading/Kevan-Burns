"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, Moon, Terminal, Cpu, Database, Key, HelpCircle, Activity, Sparkles } from "lucide-react";
import { JsonLd } from "../components/JsonLd";

export default function DevelopersPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [apiLogs, setApiLogs] = useState<string[]>([
    "GET /health - 200 OK",
    "GET /status - 200 OK - 510 active namespaces synced",
    "GET /api/v1/namespaces/gold.1 - 200 OK"
  ]);

  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardBg = isDark ? "bg-[#120813]/60 border-white/5" : "bg-white border-rose-100 shadow-md";
  const textMuted = isDark ? "text-slate-400" : "text-slate-800";
  const titleColor = isDark ? "text-white" : "text-slate-955";
  const textBody = isDark ? "text-slate-300" : "text-slate-900";
  const codeBg = isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-rose-100 shadow-sm";
  const codeText = isDark ? "text-slate-300" : "text-slate-900 font-semibold";

  const devSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Unykorn Developer Portal",
    description: "API specifications, OpenAPI schemas, and documentation for Unykorn permanent Web3 namespace registry.",
    url: "https://unykorn.ai/developers"
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
              Unykorn Devs
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            API & Docs
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
          <Link href="/troptions" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-500 px-4 py-2 rounded-xl transition-all">
            Ecosystem Manual
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
            <Terminal className="h-3.5 w-3.5" />
            <span>Developer Center</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${titleColor} orbitron-title`}>
            Unykorn API & Integrations
          </h1>
          <p className={`${textMuted} text-base max-w-2xl mx-auto leading-relaxed`}>
            Build sovereign integrations, interact with our dual-chain registries, query BigQuery logs, or set up automated ZK notary quorums.
          </p>
        </div>

        {/* API endpoints */}
        <section className="grid lg:grid-cols-2 gap-8 items-start">
          <div className={`rounded-3xl border p-6 space-y-6 ${cardBg}`}>
            <h2 className={`text-xl font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
              <Cpu className="h-5 w-5 text-red-500" /> API Endpoints & Health Check
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
              Query public metadata or check registry sync states. We expose a direct \`/health\` and \`/status\` check to certify that our distributed node agents are fully synced.
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] text-red-500 font-mono font-bold">1. Health check:</span>
                <div className={`p-3 rounded-xl font-mono text-xs flex justify-between ${codeBg}`}>
                  <span>GET https://unykorn.ai/health</span>
                  <span className="text-emerald-500 font-bold">200 OK</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-red-500 font-mono font-bold">2. Registry Status check:</span>
                <div className={`p-3 rounded-xl font-mono text-xs flex justify-between ${codeBg}`}>
                  <span>GET https://unykorn.ai/status</span>
                  <span className="text-emerald-500 font-bold">200 OK</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-red-500 font-mono font-bold">3. Suffix lookup:</span>
                <div className={`p-3 rounded-xl font-mono text-xs flex justify-between ${codeBg}`}>
                  <span>GET /api/namespaces/status?namespace=gold.1</span>
                  <span className="text-emerald-500 font-bold">200 OK</span>
                </div>
              </div>
            </div>
          </div>

          {/* OpenAPI spec */}
          <div className={`rounded-3xl border p-6 space-y-4 ${cardBg}`}>
            <h2 className={`text-xl font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
              <Terminal className="h-5 w-5 text-red-500" /> OpenAPI Spec & Shell Output
            </h2>
            <div className={`p-4 rounded-2xl font-mono text-[11px] h-56 overflow-y-auto ${codeBg} ${codeText} space-y-2`}>
              <div>{`{`}</div>
              <div className="pl-4">{`"openapi": "3.0.0",`}</div>
              <div className="pl-4">{`"info": {`}</div>
              <div className="pl-8">{`"title": "Unykorn Sovereign API",`}</div>
              <div className="pl-8">{`"version": "1.2.0"`}</div>
              <div className="pl-4">{`},`}</div>
              <div className="pl-4">{`"paths": {`}</div>
              <div className="pl-8">{`"/api/namespaces/status": {`}</div>
              <div className="pl-12">{`"get": {`}</div>
              <div className="pl-16">{`"summary": "Check namespace registry details",`}</div>
              <div className="pl-16">{`"parameters": [{"name": "namespace", "in": "query", "required": true}]`}</div>
              <div className="pl-12">{`}`}</div>
              <div className="pl-8">{`}`}</div>
              <div className="pl-4">{`}`}</div>
              <div>{`}`}</div>
            </div>
          </div>
        </section>

        {/* PASS Subscription API Tiers */}
        <section className={`rounded-3xl border p-8 backdrop-blur text-center space-y-6 ${cardBg}`}>
          <h3 className={`text-xl font-bold ${titleColor} orbitron-title`}>PASS API Developer Subscriptions</h3>
          <p className={`text-xs ${textMuted} max-w-lg mx-auto`}>
            To access our Vertex AI pipelines, Google TimesFM edge forecasting forecasting, and raw BigQuery audit trails, subscribe to our developer API keys.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-black/10 dark:bg-black/40 border border-rose-500/5">
              <span className="text-xs text-red-500 font-bold font-mono">DEVELOPER</span>
              <h4 className={`text-base font-bold ${titleColor} mt-1`}>$49 / mo</h4>
              <p className="text-[11px] text-slate-500 mt-2">Up to 10,000 queries/mo, standard latency. Core namespace metadata access.</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/10 dark:bg-black/40 border border-rose-500/5">
              <span className="text-xs text-red-500 font-bold font-mono">INTEGRATOR</span>
              <h4 className={`text-base font-bold ${titleColor} mt-1`}>$199 / mo</h4>
              <p className="text-[11px] text-slate-500 mt-2">Up to 100,000 queries/mo, low latency. Includes x402 payment webhook setup.</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/10 dark:bg-black/40 border border-rose-500/5">
              <span className="text-xs text-red-500 font-bold font-mono">ENTERPRISE</span>
              <h4 className={`text-base font-bold ${titleColor} mt-1`}>$499 / mo</h4>
              <p className="text-[11px] text-slate-500 mt-2">Unlimited queries/mo. Direct BigQuery schema mapping and Vertex AI Swarm integration.</p>
            </div>
          </div>
          <div className="pt-2">
            <Link href="/" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-5 py-3 text-xs transition-all shadow-md">
              Get Developer API Key
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-500/10 py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Unykorn Platform · Sovereign Web3 Infrastructure</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-red-500 transition-all">Home</Link>
            <Link href="/troptions" className="hover:text-red-500 transition-all">Ecosystem Manual</Link>
            <Link href="/troptionsinvestors" className="hover:text-red-500 transition-all">Investor Portal</Link>
          </div>
        </div>
      </footer>

      <JsonLd data={devSchema} />
    </div>
  );
}
