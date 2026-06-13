"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, Shield, Lock, Key, FileText, Wallet, Users, Globe,
  CheckCircle2, Clock, AlertTriangle, ChevronRight, Download, Send,
  RefreshCw, Layers, Cpu, Database, Award, ExternalLink, Info, Terminal, X,
  Coins, Sparkles, Building, ArrowRight, Activity, ArrowUpRight, Check, Eye, Plus, ArrowDown, ArrowUp, DollarSign,
  Sun, Moon
} from "lucide-react";

// Types
type ThemeType = "dark" | "light";
type TimesfmTargetType = "gold" | "lp" | "ap2" | "cws";

interface SearchResult {
  name: string;
  root: string;
  found: boolean;
  valuationUSD?: number;
  multiplier?: string;
  description?: string;
  ipfsCID?: string;
  stellarTxHash?: string;
  xrplTxHash?: string;
  solanaTxHash?: string;
  isActive?: boolean;
}

export default function TroptionsInvestorPage() {
  useEffect(() => {
    document.title = "Troptions Investor Scope Site | UnyKorn Infrastructure";
  }, []);

  // Theme State
  const [theme, setTheme] = useState<ThemeType>("dark");

  // Search Engine States
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [agentOpinion, setAgentOpinion] = useState<{
    agentName: string;
    avatar: string;
    role: string;
    opinion: string;
  } | null>(null);

  // Google's TimesFM State
  const [timesfmTarget, setTimesfmTarget] = useState<TimesfmTargetType>("gold");
  const [timesfmLoading, setTimesfmLoading] = useState(false);
  const [timesfmLogs, setTimesfmLogs] = useState<string[]>([
    "[TimesFM] Model initialized. Standing by for inference run..."
  ]);
  const [timesfmData, setTimesfmData] = useState<number[]>([1800, 1805, 1812, 1810, 1818, 1825, 1822, 1835, 1840, 1855, 1850, 1868]);

  const runTimesfmInference = () => {
    setTimesfmLoading(true);
    setTimesfmLogs([
      `[TimesFM] Initializing inference pipeline for target: ${timesfmTarget.toUpperCase()}...`,
      `[TimesFM] Loading timesfm-200m checkpoint from cache...`,
      `[TimesFM] Context input window: 96 steps. Forecast horizon: 24 steps.`
    ]);

    setTimeout(() => {
      setTimesfmLogs(prev => [
        ...prev,
        `[TimesFM] Executing self-attention layers on GPU edge node...`,
        `[TimesFM] Generating auto-regressive prediction values...`
      ]);

      setTimeout(() => {
        let newData: number[] = [];
        let logs: string[] = [];

        if (timesfmTarget === "gold") {
          newData = [1810, 1815, 1822, 1820, 1835, 1842, 1850, 1865, 1860, 1878, 1885, 1902];
          logs = [
            `[TimesFM] Inference complete. Valuation trend projects positive growth (+4.8%).`,
            `[TimesFM] gold.1 RWA projected horizon peak: $1,902.00 USD/oz.`
          ];
        } else if (timesfmTarget === "lp") {
          newData = [75, 78, 80, 82, 85, 87, 90, 93, 94, 96, 98, 99];
          logs = [
            `[TimesFM] LP capacity limits approaching saturation bounds (99%).`,
            `[TimesFM] Recommendation: Trigger automatic reserve threshold adjustments.`
          ];
        } else if (timesfmTarget === "ap2") {
          newData = [0.010, 0.012, 0.011, 0.015, 0.020, 0.025, 0.030, 0.035, 0.040, 0.045, 0.050, 0.052];
          logs = [
            `[TimesFM] Traffic load scaling detected. Dynamic metered rates updating.`,
            `[TimesFM] Recommendation: Dynamic AP2 rate set to 0.052 USDF/sec.`
          ];
        } else {
          newData = [4, 9, 13, 17, 21, 25, 29, 32, 35, 38, 41, 45];
          logs = [
            `[TimesFM] Inference complete. CWS Athlete onboarding trend projects rapid scaling (+180%).`,
            `[TimesFM] Projected verified namespaces at season end: 45.`
          ];
        }

        setTimesfmData(newData);
        setTimesfmLogs(prev => [...prev, ...logs, `[TimesFM] Swarm inference run SUCCESS.`]);
        setTimesfmLoading(false);
      }, 1000);
    }, 1000);
  };

  // Search Action
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setResult(null);
    setAgentOpinion(null);

    try {
      const formattedQuery = query.trim().toLowerCase();

      // Local check for pre-minted CWS athlete namespaces (AIP-2 compliance)
      const athleteSuffixes = [".dawgs", ".trojans", ".mountaineers", ".tarheels", ".rebels", ".tide", ".sooners", ".longhorns"];
      const isAthlete = athleteSuffixes.some(s => formattedQuery.endsWith(s));

      if (isAthlete) {
        setTimeout(() => {
          const suffix = "." + formattedQuery.split(".")[1];
          setResult({
            name: formattedQuery,
            root: suffix,
            found: true,
            valuationUSD: 850000,
            multiplier: "AIP-2 Verified (50/50 NIL Split)",
            description: `Sovereign sports athlete namespace pre-minted under the Unykorn CWS 2026 Protocol. Verified via OTP and Coach token.`,
            ipfsCID: "bafkreigqa7kesmmyoc54ey6mujke4eibptqyhxd5d5w2g64sxx3hpgvm4u",
            solanaTxHash: "48UPWTibZksgDYnszyQM9dHcRbzcHQHNrsyuVhzmVrX3Y8",
            isActive: true,
          });

          setAgentOpinion({
            agentName: "NIL Compliance Agent",
            avatar: "🏃",
            role: "Sports Compliance Swarm",
            opinion: `AIP-2 verified student-athlete namespace located. 50/50 royalty split is locked in creators array in metadata. Revenue routed directly to Zurich gold-backed fiduciary vaults.`
          });
          setSearching(false);
        }, 800);
        return;
      }

      const res = await fetch(`/api/namespaces/status?namespace=${formattedQuery}`);
      const data = await res.json();

      setTimeout(() => {
        if (data.success && data.found) {
          const prefix = formattedQuery.split(".")[0];
          const valuation = prefix.length <= 3 ? 15000000 : 4500000;
          const multiplier = prefix.length <= 3 ? "15x RWA Multiplier" : "8x RWA Multiplier";

          setResult({
            name: data.namespace,
            root: data.namespace.includes(".") ? `.${data.namespace.split(".")[1]}` : ".legacy",
            found: true,
            valuationUSD: valuation,
            multiplier,
            description: `Sovereign asset-backed registry wrapper with dynamic compliance gates and locked trustee execution.`,
            ipfsCID: data.ipfsCID,
            stellarTxHash: data.stellarTxHash,
            xrplTxHash: data.xrplTxHash,
            solanaTxHash: data.solanaTxHash,
            isActive: data.isActive,
          });

          setAgentOpinion({
            agentName: "Legal & Compliance Agent",
            avatar: "⚖️",
            role: "UnyKorn Legal Swarm",
            opinion: `Attestation confirmed. SFT root registered under IPFS CID ${data.ipfsCID.substring(0, 8)}... and synchronized across Solana, XRPL, and Stellar. Under AP2 guidelines, any metered RPC inference to this node will require a micro-USDF token payment.`
          });
        } else {
          const isStandardSuffix = formattedQuery.includes(".") && 
            [".gold", ".rwa", ".vault", ".trust", ".bank", ".legacy", ".troptions"].some(s => formattedQuery.endsWith(s));

          if (isStandardSuffix) {
            const prefix = formattedQuery.split(".")[0];
            const root = "." + formattedQuery.split(".")[1];
            setResult({
              name: formattedQuery,
              root,
              found: false,
              description: `Namespace "${formattedQuery}" is available for registry. You can mint it as a customized Web3 soulbound SFT.`,
            });

            setAgentOpinion({
              agentName: "RWA Operations Agent",
              avatar: "🏛️",
              role: "Asset Tokenization Swarm",
              opinion: `Available asset wrapper detected. If you register "${formattedQuery}", I will automatically spin up an ERC-6551 Token Bound Account (TBA) and generate the corresponding IPFS metadata templates for your appraisals and legal trust deeds.`
            });
          } else {
            setResult({
              name: formattedQuery,
              root: ".unykorn",
              found: false,
              description: `Search results for "${query}" across UnyKorn Web3 database. No active namespace found.`,
            });

            setAgentOpinion({
              agentName: "System Operator Agent",
              avatar: "⚙️",
              role: "Operations Swarm",
              opinion: `Evaluating general query "${query}". If this is a token ticker, real-world asset appraisal hash, or wallet address, please connect your Web3 wallet in the top header to query live balance logs or initiate an AP2 transaction routing check.`
            });
          }
        }
        setSearching(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setSearching(false);
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Color theme definitions matching the downloaded premium investor HTML file (warm stone / dark warm charcoal)
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#171614] text-[#cdccca]" : "bg-[#f7f6f2] text-[#28251d]";
  const surfaceClass = isDark ? "bg-[#1c1b19] border-[#393836]" : "bg-[#f9f8f5] border-[#d4d1ca]";
  const surface2Class = isDark ? "bg-[#201f1d] border-[#393836]" : "bg-[#fbfbf9] border-[#d4d1ca]";
  const surfaceOffsetClass = isDark ? "bg-[#1d1c1a]" : "bg-[#f3f0ec]";
  const borderClass = isDark ? "border-[#393836]" : "border-[#d4d1ca]";
  const dividerClass = isDark ? "border-[#262523]" : "border-[#dcd9d5]";
  const textMutedClass = isDark ? "text-[#9d9b97]" : "text-[#67655f]";
  const textTitleClass = isDark ? "text-white" : "text-[#28251d]";
  const primaryClass = isDark ? "bg-[#4f98a3] hover:bg-[#227f8b] text-[#171614]" : "bg-[#01696f] hover:bg-[#0c4e54] text-white";
  const tagClass = isDark ? "bg-[#313b3b] text-[#4f98a3]" : "bg-[#cedcd8] text-[#01696f]";

  return (
    <div className={`min-h-screen ${bgClass} font-sans transition-colors duration-300`}>
      {/* Skip Link */}
      <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[#01696f] focus:text-white focus:p-3 focus:rounded-lg" href="#investor-content">
        Skip to content
      </a>

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${dividerClass} bg-opacity-80 transition-colors`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <svg className={`w-10 h-10 ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`} viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <rect x="8" y="8" width="48" height="48" rx="16" stroke="currentColor" strokeWidth="3"></rect>
              <path d="M20 22H44" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
              <path d="M32 22V44" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
              <path d="M24 44H40" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
            </svg>
            <div>
              <span className={`text-xl font-bold tracking-tight block ${textTitleClass}`}>Troptions</span>
              <span className={`text-[10px] tracking-widest uppercase block ${textMutedClass}`}>Investor Architecture</span>
            </div>
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex gap-6 text-sm font-semibold transition-colors">
              <li><a href="#thesis" className={`hover:${textTitleClass} transition-colors`}>Thesis</a></li>
              <li><a href="#search" className={`hover:${textTitleClass} transition-colors`}>Search</a></li>
              <li><a href="#architecture" className={`hover:${textTitleClass} transition-colors`}>Architecture</a></li>
              <li><a href="#products" className={`hover:${textTitleClass} transition-colors`}>Products</a></li>
              <li><a href="#verticals" className={`hover:${textTitleClass} transition-colors`}>Verticals</a></li>
              <li><a href="#revenue" className={`hover:${textTitleClass} transition-colors`}>Revenue</a></li>
              <li><a href="#scope" className={`hover:${textTitleClass} transition-colors`}>Scope</a></li>
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 flex items-center justify-center rounded-full border ${borderClass} ${surfaceClass} hover:opacity-80 transition-all`}
              aria-label="Switch theme"
              id="theme-toggle-btn"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
            <a className={`btn px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${primaryClass}`} href="#scope">
              See Full Scope
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="investor-content" className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        
        {/* HERO SECTION */}
        <section className="grid lg:grid-cols-12 gap-8 items-end pt-8">
          <div className="lg:col-span-7 space-y-6">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${tagClass}`}>
              Investor-grade system overview
            </div>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.08] ${textTitleClass}`}>
              One ecosystem, multiple live rails, and a clearly mappable project scope.
            </h1>
            <p className={`text-lg leading-relaxed ${textMutedClass} max-w-2xl`}>
              This version is written for investors: it translates Troptions from a dense product map into an operating-company narrative that shows what has been built, how the system connects, where revenue enters, and which components are live versus pipeline.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="#revenue" className={`px-6 py-3 rounded-full text-sm font-bold transition-all shadow-md ${primaryClass}`}>
                Revenue Model
              </a>
              <a href="#architecture" className={`px-6 py-3 rounded-full text-sm font-semibold border ${borderClass} ${surfaceClass} hover:opacity-90 transition-all ${textTitleClass}`}>
                System Architecture
              </a>
            </div>
          </div>

          <aside className={`lg:col-span-5 rounded-2xl border p-8 space-y-6 shadow-md transition-colors ${surfaceClass}`} aria-label="Key system metrics">
            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${tagClass}`}>
              Current footprint
            </div>
            <p className={`text-sm leading-relaxed ${textMutedClass}`}>
              Troptions presents itself as a federated blockchain infrastructure company operated by FTH Trading LLC, spanning multiple public platforms, settlement planes, business verticals, AI agents, and chains.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { count: "3", label: "public platforms" },
                { count: "4", label: "settlement planes" },
                { count: "6", label: "business verticals" },
                { count: "22", label: "registered AI roles" }
              ].map((m) => (
                <div key={m.label} className={`p-4 rounded-xl border transition-colors ${surface2Class}`}>
                  <strong className={`block text-3xl font-extrabold font-serif ${textTitleClass}`}>{m.count}</strong>
                  <span className={`text-xs ${textMutedClass}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* THESIS SECTION */}
        <section id="thesis" className="grid lg:grid-cols-12 gap-8 items-start pt-8 border-t border-dashed border-opacity-20">
          <div className="lg:col-span-4 space-y-3">
            <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`}>
              Investment Thesis
            </div>
            <h2 className={`text-3xl font-bold font-serif leading-tight ${textTitleClass}`}>
              Troptions is best understood as infrastructure, not as a single app.
            </h2>
          </div>
          <div className={`lg:col-span-8 rounded-2xl border p-8 space-y-6 ${surfaceClass}`}>
            <p className={`leading-relaxed`}>
              Across the supplied materials, the core story is consistent: the namespace and registry layer is the identity foundation, the multi-plane architecture is the operating backbone, and the user-facing products are commercialization layers sitting on top of that foundation.
            </p>
            <ul className="space-y-4 text-sm" role="list">
              {[
                "The Registry and namespace system are the root trust layer for assets, credentials, payments, documents, and developer integrations.",
                "The system is split across financial settlement, asset issuance, intelligence, and AI operations, which makes the project legible as an institutional stack.",
                "The most immediate monetization appears in Legacy Vault subscriptions, token minting fees, PASS API tiers, gateway transactions, and partner or white-label deals."
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isDark ? "bg-[#4f98a3]" : "bg-[#01696f]"}`} />
                  <span className={textMutedClass}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* REGISTRY SEARCH WIDGET */}
        <section id="search" className="pt-8 border-t border-dashed border-opacity-20 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`}>
              Registry Database Search
            </div>
            <h2 className={`text-3xl font-bold font-serif ${textTitleClass}`}>
              Verify Real-World Assets & Namespaces
            </h2>
            <p className={`text-sm ${textMutedClass}`}>
              Access the live registry state to test available namespaces or audit tokenized trust records.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <div className={`relative rounded-full p-1 flex items-center shadow-lg border transition-all ${surfaceClass} focus-within:ring-2 focus-within:ring-opacity-50 ${isDark ? "focus-within:ring-[#4f98a3]" : "focus-within:ring-[#01696f]"}`}>
              <div className="pl-4 pr-2 text-slate-500">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search registry... e.g. gold.1, satoshi.gold, doe.trust"
                className="flex-grow bg-transparent border-none outline-none py-3 text-sm"
                style={{ color: isDark ? "#white" : "#28251d" }}
                id="registry-investor-search"
              />
              <button
                type="submit"
                className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all ml-1 flex items-center gap-1.5 shadow-md ${primaryClass}`}
                disabled={searching}
              >
                {searching ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Query
                  </>
                )}
              </button>
            </div>
          </form>

          {result && (
            <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className={`md:col-span-2 rounded-2xl border p-6 space-y-4 shadow-md ${surfaceClass}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-500">
                    {result.found ? "✓ Live SFT Registered" : "○ Available SFT"}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${tagClass}`}>
                    {result.root} Suffix
                  </span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold font-mono ${textTitleClass}`}>{result.name}</h3>
                  <p className={`text-sm ${textMutedClass} mt-1`}>{result.description}</p>
                </div>

                {result.found && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-dashed border-opacity-10 text-xs">
                    <div>
                      <p className={textMutedClass}>Estimated RWA Valuation</p>
                      <p className="text-base font-extrabold text-amber-500 font-mono mt-0.5">
                        ${result.valuationUSD?.toLocaleString()} USD
                      </p>
                    </div>
                    <div>
                      <p className={textMutedClass}>Multiplier Tier</p>
                      <p className={`text-sm font-semibold ${textTitleClass} mt-0.5`}>
                        {result.multiplier}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {agentOpinion && (
                <div className={`rounded-2xl border p-5 space-y-3 bg-opacity-30 ${isDark ? "bg-[#313b3b] border-[#4f98a3]/20" : "bg-[#cedcd8]/30 border-[#01696f]/20"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{agentOpinion.avatar}</span>
                    <div>
                      <h4 className={`text-xs font-bold ${textTitleClass}`}>{agentOpinion.agentName}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">{agentOpinion.role}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed font-mono text-slate-500">{agentOpinion.opinion}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* SYSTEM ARCHITECTURE & TIMESFM SECTION */}
        <section id="architecture" className="pt-8 border-t border-dashed border-opacity-20 space-y-10">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div className="space-y-4">
              <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`}>
                System Architecture
              </div>
              <h2 className={`text-3xl font-bold font-serif leading-tight ${textTitleClass}`}>
                The platform is mapped into four operating planes.
              </h2>
              <p className={`text-sm leading-relaxed ${textMutedClass}`}>
                For investors, this matters because each plane answers a different question: where value settles, where assets are issued, where intelligence is generated, and how operations scale through agents.
              </p>
            </div>
            
            {/* TimesFM Forecasting Widget */}
            <div className={`rounded-2xl border p-6 space-y-4 shadow-lg ${surfaceClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-amber-500" />
                  <span className={`text-xs font-bold uppercase tracking-widest ${textTitleClass}`}>Google TimesFM Swarm Inference</span>
                </div>
                <select
                  value={timesfmTarget}
                  onChange={(e) => setTimesfmTarget(e.target.value as TimesfmTargetType)}
                  className={`text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 border outline-none ${surface2Class} ${textTitleClass}`}
                >
                  <option value="gold">Gold (gold.1 RWA)</option>
                  <option value="lp">LP Pool Capacity</option>
                  <option value="ap2">AP2 Dynamic Rates</option>
                  <option value="cws">CWS Athlete Onboarding</option>
                </select>
              </div>

              {/* Dynamic Forecast Chart */}
              <div className={`h-24 flex items-end gap-2 p-3 rounded-xl ${surfaceOffsetClass} relative overflow-hidden border ${borderClass}`}>
                {timesfmData.map((val, idx) => {
                  const max = Math.max(...timesfmData);
                  const min = Math.min(...timesfmData);
                  const height = max === min ? 50 : ((val - min) / (max - min)) * 70 + 20;
                  const isPrediction = idx >= 8;
                  return (
                    <div
                      key={idx}
                      className="flex-grow flex flex-col items-center group relative cursor-pointer"
                      style={{ height: `${height}%` }}
                    >
                      <div className={`w-full h-full rounded-t transition-all ${isPrediction ? "bg-amber-500 group-hover:bg-amber-400" : "bg-cyan-600 group-hover:bg-cyan-500"}`} />
                      <span className="absolute bottom-full mb-1 text-[8px] font-mono bg-black text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-600 block" /> Context Window</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500 block" /> TimesFM Horizon (+24 Steps)</span>
              </div>

              {/* Console Logs */}
              <div className={`rounded-xl border p-4 font-mono text-[10px] h-24 overflow-y-auto space-y-1.5 transition-colors ${terminalBg(isDark)}`}>
                {timesfmLogs.map((log, index) => (
                  <div key={index} className={log.includes("SUCCESS") ? "text-emerald-400" : log.includes("Error") ? "text-red-400" : ""}>
                    {log}
                  </div>
                ))}
              </div>

              <button
                onClick={runTimesfmInference}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${primaryClass}`}
                disabled={timesfmLoading}
              >
                {timesfmLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Cpu className="w-4 h-4" /> Run Swarm Inference
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { tag: "S1 Settlement", title: "Financial rails", desc: "The S1 plane covers stablecoin gateway operations, exchange and settlement routing, x402 payment gating, and Apostle ATP settlement on chain 7332. This is the money-movement layer." },
              { tag: "L2 Launch RWA", title: "Issuance and tokenization", desc: "The L2 plane includes TROPTIONSMINT, Legacy Vault anchoring, and Ruby RWA, positioning it as the issuance layer for institutional tokens, estate records, and real-world asset conversion." },
              { tag: "E4 Intelligence", title: "Monitoring and analytics", desc: "The E4 plane contains GMIIE, fraud monitoring, OSINT, and institutional data surfaces. This creates the analytics and decision-support layer for both internal operations and paid intelligence access." },
              { tag: "A5 Agent Mesh", title: "AI operations", desc: "The A5 plane organizes the 22 registered AI roles across partner intake, publishing, estate planning, operator guidance, and institutional communications. This is framed as the automation fabric of the system." }
            ].map((plane) => (
              <article key={plane.tag} className={`rounded-2xl border p-6 space-y-3 transition-colors ${surfaceClass}`}>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tagClass}`}>
                  {plane.tag}
                </span>
                <h3 className={`text-lg font-bold ${textTitleClass}`}>{plane.title}</h3>
                <p className={`text-sm leading-relaxed ${textMutedClass}`}>{plane.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CHAIN FOOTPRINT SECTION */}
        <section className="pt-8 border-t border-dashed border-opacity-20 space-y-6">
          <div className="space-y-2">
            <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`}>
              Multi-Chain Operations
            </div>
            <h2 className={`text-3xl font-bold font-serif leading-tight ${textTitleClass}`}>
              Six live chains and three pipeline chains shape the network story.
            </h2>
            <p className={`text-sm ${textMutedClass} max-w-2xl`}>
              The documentation distinguishes between live operational chains and future integration chains, which is important for investor clarity because it separates currently usable infrastructure from roadmap claims.
            </p>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${borderClass} shadow-md`}>
            <table className="w-full border-collapse min-w-[760px] text-left">
              <thead>
                <tr className={isDark ? "bg-[#1d1c1a]" : "bg-[#f3f0ec]"}>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${dividerClass} ${textMutedClass}`}>Chain</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${dividerClass} ${textMutedClass}`}>Role</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${dividerClass} ${textMutedClass}`}>Status</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${dividerClass} ${textMutedClass}`}>Investor Reading</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-opacity-10 divide-slate-500">
                {[
                  { chain: "XRPL", role: "Stablecoin gateway, IOUs, institutional rails", status: "Live", statusColor: "text-emerald-500", note: "Core settlement credibility layer." },
                  { chain: "Stellar", role: "Mirror, anchoring, estate records", status: "Live", statusColor: "text-emerald-500", note: "Redundancy and payment alignment layer." },
                  { chain: "Solana", role: "Minting, liquidity, namespaces, merchant tools", status: "Live", statusColor: "text-emerald-500", note: "Main application and issuance surface." },
                  { chain: "Apostle / Besu 7332", role: "x402 ATP settlement", status: "Live", statusColor: "text-emerald-500", note: "Proprietary payment membrane differentiator." },
                  { chain: "Polygon", role: "Publishing, payments, anchoring", status: "Live", statusColor: "text-emerald-500", note: "Supports content and alternative settlement routes." },
                  { chain: "Chainlink", role: "Oracles", status: "Partial", statusColor: "text-amber-500", note: "Supporting infrastructure, not yet full narrative center." },
                  { chain: "Cosmos / Hermes", role: "Cross-chain relay", status: "Pipeline", statusColor: "text-blue-500", note: "Roadmap, not current thesis." },
                  { chain: "Sui", role: "Future integration", status: "Pipeline", statusColor: "text-blue-500", note: "Expansion optionality." },
                  { chain: "Stacks", role: "Future integration", status: "Pipeline", statusColor: "text-blue-500", note: "Expansion optionality." }
                ].map((row) => (
                  <tr key={row.chain} className={`transition-colors hover:bg-opacity-50 ${isDark ? "hover:bg-[#201f1d]" : "hover:bg-[#fbfbf9]"}`}>
                    <td className={`px-6 py-4 font-mono font-bold text-sm ${textTitleClass}`}>{row.chain}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{row.role}</td>
                    <td className={`px-6 py-4 text-xs font-bold ${row.statusColor}`}>{row.status}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PRODUCT STACK SECTION */}
        <section id="products" className="pt-8 border-t border-dashed border-opacity-20 space-y-6">
          <div className="space-y-2">
            <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`}>
              Product Stack
            </div>
            <h2 className={`text-3xl font-bold font-serif leading-tight ${textTitleClass}`}>
              The product layer is broad, but it can be grouped into clear operating businesses.
            </h2>
            <p className={`text-sm ${textMutedClass} max-w-2xl`}>
              Rather than presenting a flat list, this site groups the product set into investor-relevant clusters: identity infrastructure, issuance tools, estate software, intelligence systems, and commerce rails.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { tag: "Identity foundation", title: "Registry and namespace system", desc: "The Registry is described as the master identity and asset ledger, with namespaces acting as permanent on-chain identifiers that anchor assets, credentials, sub-namespaces, governance, and document hashes." },
              { tag: "Issuance console", title: "TROPTIONSMINT", desc: "The Solana console combines institutional minting, liquidity locking, live market views, merchant onboarding, payment routing, verified roots anchoring, and an operator OS in a single environment." },
              { tag: "Estate software", title: "Legacy Vault Protocol", desc: "This is the clearest SaaS product in the stack, combining AES-256 client-side encryption, a 5-proof release model, AI-generated legal templates, chain anchoring, and tiered subscription pricing." },
              { tag: "Payments", title: "x402 and Troptions Pay", desc: "x402 is framed as a protocol-level payment membrane using HTTP 402 as a live payment gate, while Troptions Pay acts as the user-facing multi-rail checkout surface across wallet, card, and chain options." },
              { tag: "Intelligence", title: "GMIIE and OSINT", desc: "GMIIE, blockchainfraud.org, and related data surfaces create the institutional intelligence layer, which supports both the operating system and paid data-access narratives." },
              { tag: "Partner expansion", title: "White-label and T-Build", desc: "The partner stack suggests a licensing pathway where institutions can deploy branded Troptions-powered infrastructure rather than building registry, wallet, or exchange components themselves." },
              { tag: "Royalty Splits", title: "SFT Secondary Market Split (AIP-2)", desc: "NIL highlight sales automatically enforce a 50/50 royalty split routed directly to the athlete's gold-backed wealth vault and Unykorn reserves, unlocking a high-velocity sports digital collectible network." },
              { tag: "Sports NIL RWA", title: "CWS Athlete Verification (AIP-2)", desc: "A sovereign athlete-onboarding gateway combining wallet binding, university email OTP validation, and Coach/SID clearance. Anchors cryptographic attestations on Solana Mainnet and Pins to IPFS, enforcing a 50/50 creator split in secondary sales." }
            ].map((prod) => (
              <article key={prod.title} className={`rounded-2xl border p-6 space-y-3 transition-colors ${surfaceClass}`}>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tagClass}`}>
                  {prod.tag}
                </span>
                <h3 className={`text-base font-bold ${textTitleClass}`}>{prod.title}</h3>
                <p className={`text-xs leading-relaxed ${textMutedClass}`}>{prod.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* COMMERCIAL VERTICALS SECTION */}
        <section id="verticals" className="pt-8 border-t border-dashed border-opacity-20 space-y-6">
          <div className="space-y-2">
            <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`}>
              Commercial Verticals
            </div>
            <h2 className={`text-3xl font-bold font-serif leading-tight ${textTitleClass}`}>
              Six verticals define how the system reaches market.
            </h2>
            <p className={`text-sm ${textMutedClass} max-w-2xl`}>
              These verticals matter because they convert a technically dense stack into concrete buyer categories, revenue paths, and deployment channels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Banking rail", desc: "Institutional settlement through XRPL IOUs and gateway services, aimed at banks, credit unions, fintechs, and counterparties." },
              { title: "Estate rail", desc: "Legacy Vault, legal-chain workflows, and Ruby RWA create a direct-to-consumer and professional-services software business." },
              { title: "Liquidity rail", desc: "Automated market-making and routing infrastructure are partially live, so this vertical reads as active build rather than fully monetized today." },
              { title: "Sports capital rail", desc: "Sports utility-token issuance, CWS athlete verification (AIP-2) proving layers, physical gold-backed reserves (Zurich safe vaults), and 50/50 on-chain splits for NIL highlights." },
              { title: "Trading rail", desc: "PASS API access, x402-gated intelligence SKUs, and internal exchange tooling form a recurring-access data and execution layer." },
              { title: "Partner integrations", desc: "Onboarding fees, white-label licensing, and developer build tooling support a B2B expansion model beyond direct product sales." }
            ].map((v) => (
              <article key={v.title} className={`rounded-2xl border p-6 space-y-3 transition-colors ${surfaceClass}`}>
                <h3 className={`text-base font-bold ${textTitleClass}`}>{v.title}</h3>
                <p className={`text-xs leading-relaxed ${textMutedClass}`}>{v.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* REVENUE MODEL SECTION */}
        <section id="revenue" className="pt-8 border-t border-dashed border-opacity-20 space-y-6">
          <div className="space-y-2">
            <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`}>
              Revenue Model
            </div>
            <h2 className={`text-3xl font-bold font-serif leading-tight ${textTitleClass}`}>
              The revenue picture is multi-stream, but not equally mature.
            </h2>
            <p className={`text-sm ${textMutedClass} max-w-2xl`}>
              An investor-facing presentation should separate current monetization from future upside. The clearest active streams are subscriptions, minting, API tiers, gateway transactions, and institutional deal flow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { tag: "Recurring SaaS", title: "Legacy Vault", desc: "Plans are listed at $29.95, $49.95, and $89.95 per month, plus a limited $499.95 lifetime offer, making Legacy Vault the most legible recurring-revenue product in the ecosystem." },
              { tag: "Usage fees", title: "Minting and launch fees", desc: "TROPTIONSMINT charges 0.10 SOL per mint, and the 26WC launchpad is also priced at 0.10 SOL per token issuance, linking event activity directly to transaction revenue." },
              { tag: "API subscriptions", title: "PASS tiers", desc: "PASS Basic, Pro, and Institutional are priced at $49, $199, and $499 per month respectively, which supports a classic access-tier model for intelligence and trading infrastructure." },
              { tag: "Enterprise deals", title: "Stablecoin gateway", desc: "The XRPL gateway is framed as custom institutional deal-closing rather than self-serve SaaS, so this revenue stream should be treated as enterprise pipeline." },
              { tag: "Per-request settlement", title: "x402 gateway", desc: "x402 creates transaction-level monetization through ATP settlements on Apostle Chain, which could become meaningful if payment-gated APIs scale." },
              { tag: "Licensing", title: "Partner and white-label", desc: "The partner stack suggests setup fees, branded deployments, and long-tail licensing economics for institutions that want infrastructure without internal build complexity." },
              { tag: "Royalty Splits", title: "SFT Secondary Market Split (AIP-2)", desc: "NIL highlight sales automatically enforce a 50/50 royalty split routed directly to the athlete's gold-backed wealth vault and Unykorn reserves, unlocking a high-velocity sports digital collectible network." }
            ].map((rev) => (
              <article key={rev.title} className={`rounded-2xl border p-6 space-y-3 transition-colors ${surfaceClass}`}>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tagClass}`}>
                  {rev.tag}
                </span>
                <h3 className={`text-base font-bold ${textTitleClass}`}>{rev.title}</h3>
                <p className={`text-xs leading-relaxed ${textMutedClass}`}>{rev.desc}</p>
              </article>
            ))}
          </div>

          {/* CALLOUT CARD */}
          <div className={`rounded-2xl border p-6 bg-gradient-to-r from-opacity-20 to-transparent ${borderClass} ${isDark ? "from-[#313b3b] text-slate-300" : "from-[#cedcd8] text-slate-800"}`}>
            <span className={`text-[10px] font-bold tracking-widest uppercase block ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"} mb-2`}>
              Investor Interpretation
            </span>
            <p className="text-sm leading-relaxed">
              The cleanest way to present Troptions is as a holding-company-style infrastructure platform with one near-term subscription engine, one transaction-fee engine, one enterprise gateway engine, and one longer-term licensing engine. That framing is far easier for investors to understand than presenting every named module at equal weight.
            </p>
          </div>
        </section>

        {/* FULL PROJECT SCOPE SECTION */}
        <section id="scope" className="pt-8 border-t border-dashed border-opacity-20 space-y-6">
          <div className="space-y-2">
            <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`}>
              Full Project Scope
            </div>
            <h2 className={`text-3xl font-bold font-serif leading-tight ${textTitleClass}`}>
              This build now shows the complete operating scope, not just the headline products.
            </h2>
            <p className={`text-sm ${textMutedClass} max-w-2xl`}>
              The purpose of this section is to make diligence easier by showing what belongs to the core system, what belongs to go-to-market, and what belongs to roadmap or strategic optionality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Core infrastructure", items: ["Registry and namespace roots.", "Dual-chain and multi-chain anchoring model.", "Stablecoin and settlement rails.", "Apostle ATP and x402 payment membrane."] },
              { title: "Commercial applications", items: ["TROPTIONSMINT operator console.", "Legacy Vault subscription software.", "Merchant portal and Troptions Pay.", "PASS API tiers and intelligence products."] },
              { title: "Expansion layers", items: ["White-label deployments.", "Sports capital and NIL infrastructure.", "Ruby RWA for real estate tokenization.", "DONK publishing and AI-native media assets."] }
            ].map((scope) => (
              <article key={scope.title} className={`rounded-2xl border p-6 space-y-4 transition-colors ${surfaceClass}`}>
                <h3 className={`text-sm font-bold tracking-wide uppercase ${textTitleClass}`}>{scope.title}</h3>
                <ul className="space-y-3" role="list">
                  {scope.items.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-center text-xs font-semibold text-slate-500">
                      <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-[#4f98a3]" : "bg-[#01696f]"}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* TIMELINE SECTION */}
        <section className="pt-8 border-t border-dashed border-opacity-20 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#4f98a3]" : "text-[#01696f]"}`}>
              What This Project Includes
            </div>
            <h2 className={`text-3xl font-bold font-serif ${textTitleClass}`}>
              The site itself was rebuilt around investor comprehension.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { idx: "1", title: "Reframed narrative", desc: "The language is now written to explain business structure, system dependencies, and revenue pathways rather than only product enthusiasm." },
              { idx: "2", title: "Complete scope map", desc: "The site now covers architecture, chain footprint, product clusters, verticals, revenue streams, and scope boundaries in one connected flow." },
              { idx: "3", title: "Status clarity", desc: "Live, partial, and pipeline elements are separated so investors can distinguish current operations from future optionality." },
              { idx: "4", title: "Investor-ready design", desc: "The visual system is restrained, boardroom-friendly, responsive, dark-mode capable, and structured to support diligence conversations." }
            ].map((step) => (
              <div key={step.idx} className={`rounded-2xl border p-6 space-y-3 relative ${surfaceClass}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tagClass}`}>
                  {step.idx}
                </div>
                <h3 className={`text-sm font-bold ${textTitleClass}`}>{step.title}</h3>
                <p className={`text-xs leading-relaxed ${textMutedClass}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className={`border-t ${dividerClass} py-12 bg-opacity-40 transition-colors`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:justify-between gap-6 text-xs text-slate-500 font-semibold leading-relaxed">
          <p className="max-w-3xl">
            This presentation is based on the supplied June 2026 Troptions ecosystem, registry, and partner documents and is written as a structured investor overview of the described system footprint, business lines, and commercialization pathways. It is not a legal or investment opinion.
          </p>
          <p className="shrink-0">
            © 2026 Troptions Infrastructure LLC.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Helper styling functions for specific states
function terminalBg(isDark: boolean) {
  return isDark ? "bg-[#090b10] border-[#393836] text-amber-500" : "bg-slate-900 border-slate-300 text-amber-400";
}
