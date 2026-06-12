"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Globe, Shield, Cpu, Database, Activity, Sparkles, Send, 
  RefreshCw, Sliders, Lock, HelpCircle, Sun, Moon, ArrowRight, 
  Check, AlertTriangle, Radio, BarChart2, MessageSquare, Layers, FileText, Info
} from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { REGISTRY_SITES, REGISTRY_DOMAINS } from "@/lib/registryArchive";

// Ecosystem Asset Data
const DEPLOYED_APPS = [
  { name: "Mint Cockpit", url: "ai-troptionsmint.pages.dev", desc: "Voice-operated capital deployment & namespace minting console.", status: "LIVE" },
  { name: "Nano Bana 3D OS", url: "os.troptionsmint.com", desc: "3D operating system shell interface.", status: "LIVE" },
  { name: "Apostle Edge Node", url: "localhost:7332", desc: "Local edge inference consensus node.", status: "SYNCED" },
  { name: "Jarvis Legal Shield", url: "hail.unykorn.org", desc: "Decentralized legal attestation and compliance engine.", status: "LIVE" },
  { name: "Legacy Vault OS", url: "vault.genesis402.com", desc: "Estate succession planning and ZK release notary.", status: "LIVE" },
  { name: "Troptions Investors", url: "investors.unykorn.ai", desc: "Investor relations portal and capital scale cockpit.", status: "LIVE" }
];

const APEX_DOMAINS = [
  { domain: "unykorn.ai", traffic: "High", purpose: "Core Web3 infrastructure gateway" },
  { domain: "unykorn.org", traffic: "Medium", purpose: "Federated namespace documentation" },
  { domain: "xxxiii.io", traffic: "High", purpose: "NIL33 cryptographic anchor" },
  { domain: "mensofgod.com", traffic: "Medium", purpose: "Community/organizational routing" },
  { domain: "y3kmarkets.com", traffic: "High", purpose: "Barter exchange pricing engine" },
  { domain: "donkai.org", traffic: "Medium", purpose: "AI cognitive swarm hub" }
];

const REUSABLE_PACKAGES = [
  { name: "blockchain-adapters", type: "Rust/TS", desc: "Stellar, Solana Token-2022, Hyperledger Besu cross-chain integrations." },
  { name: "x402-membrane", type: "TypeScript", desc: "ATP Pay-per-request metered client middleware." },
  { name: "neural-policy", type: "Python/Rust", desc: "TimesFM edge forecasting and Vertex AI agent weights." },
  { name: "client-crypto", type: "CJS/ESM", desc: "Browser-side AES-256-GCM and Poseidon ZK proof generator." }
];

// Reputation targets
const SENTIMENT_TARGETS = [
  { 
    id: "scam-association",
    target: "Bryan Stone / Troptions legacy associations", 
    status: "MITIGATED & REDIRECTED", 
    action: "Hashed proof of Unykorn's ownership anchored to Stellar; traffic automatically redirected to sovereign trust portal.", 
    impact: "+14.2% Authority Boost" 
  },
  { 
    id: "unregulated-coins",
    target: "Unregulated coin/securities allegations", 
    status: "SUPPRESSED & AUDITED", 
    action: "Gated W3C KYC credentials injected; Peachtree Parkway physical office proof linked; SEC MIC exch:UBEC XBRL files attached.", 
    impact: "Legal Compliance Confirmed" 
  },
  { 
    id: "negative-reviews",
    target: "Scam allegations / False reporting search targets", 
    status: "SCRUBBED & REPLACED", 
    action: "Injected SSRN Paper Abstract #6241279 and ResearchGate provenance proof to IPFS. Replaced negative search index targets.", 
    impact: "Positive Search Dominance" 
  }
];

export default function MediaDashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"portfolio" | "shield" | "persona" | "swarm" | "registry">("portfolio");
  
  // Master Registry Search/Filters
  const [registrySearch, setRegistrySearch] = useState("");
  const [systemFilter, setSystemFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredRegistrySites = useMemo(() => {
    return REGISTRY_SITES.filter(site => {
      const matchesSearch = 
        site.name.toLowerCase().includes(registrySearch.toLowerCase()) ||
        site.id.toLowerCase().includes(registrySearch.toLowerCase()) ||
        (site.url && site.url.toLowerCase().includes(registrySearch.toLowerCase())) ||
        site.system.toLowerCase().includes(registrySearch.toLowerCase());
      
      const matchesSystem = !systemFilter || site.system === systemFilter;
      const matchesStatus = !statusFilter || site.status === statusFilter;
      
      return matchesSearch && matchesSystem && matchesStatus;
    });
  }, [registrySearch, systemFilter, statusFilter]);

  // AI Sentiment simulator states
  const [sentimentScore, setSentimentScore] = useState(98.4);
  const [isShieldActive, setIsShieldActive] = useState(true);
  const [logMessages, setLogMessages] = useState<string[]>([
    "Sentiment Shield: Active monitoring unykorn.ai and Founder-Architect.",
    "Web crawler: Negative sentiment target detected on external forums.",
    "Mitigation loop triggered: Injecting SSRN Paper #6241279 cryptographic abstract.",
    "Tamper-proof verify: SEC MIC 'exch:UBEC' JSON-LD injected. Search crawler redirected.",
    "Reputation index update: Neutralized negative target. Sentiment score: 98.4%."
  ]);
  
  // AI Agent console chat states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { 
      role: "assistant", 
      text: "Portfolio Agent ready. I am TROY. I represent the Unykorn GCP Sovereign core mesh. You can ask me any technical question about our $15.4M - $28.5M asset base, 17 deployed apps, or 16 apex domains." 
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Swarm Dispatch States
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);

  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardBg = isDark ? "bg-[#120813]/60 border-white/5" : "bg-white border-rose-100 shadow-md";
  const textMuted = isDark ? "text-slate-400" : "text-slate-800";
  const titleColor = isDark ? "text-white" : "text-slate-955";
  const textBody = isDark ? "text-slate-300" : "text-slate-900";
  const codeBg = isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-rose-100 shadow-sm";
  const codeText = isDark ? "text-slate-300" : "text-slate-900 font-semibold";
  const inputBg = isDark ? "bg-black/60 border-white/10 text-white" : "bg-white border-rose-200 text-slate-900";

  // Simulate sentiment fluctuation
  useEffect(() => {
    if (!isShieldActive) return;
    const interval = setInterval(() => {
      setSentimentScore(prev => {
        const delta = (Math.random() - 0.45) * 0.2;
        const newScore = Math.min(100, Math.max(90, prev + delta));
        return parseFloat(newScore.toFixed(2));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isShieldActive]);

  // Handle AI Chat
  const handleChatQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsAiLoading(true);

    try {
      const promptContext = `[GCP Portfolio & Media Strategy Context]\nAssets: $15.4M-$28.5M build, 17 apps, 44 packages, 16 apex domains. Reputation Guard: Active suppression of scams and negative allegations; injection of SSRN/ResearchGate proofs and W3C keys.\n\nUSER QUESTION: ${userMsg}`;
      
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptContext }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", text: data.content }]);
      } else {
        setChatMessages(prev => [...prev, { role: "assistant", text: "Error: Could not reach agentic mesh." }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: "assistant", text: `Error: ${err.message || "Timeout."}` }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run publishing dispatcher
  const triggerPublish = (group: string) => {
    setIsDispatching(true);
    setDispatchLogs([]);
    let currentStep = 0;
    
    const logs = [
      `[${group}] Preparing draft payload...`,
      `[${group}] W3C signature did:unykorn:architect generated.`,
      `[${group}] Pinning spec payload to IPFS... CID: QmSwarmMedia...`,
      `[${group}] Anchoring reference to Hyperledger Besu AuditLog...`,
      `[${group}] Dispatching to 16 apex domains and indexing robots...`,
      `[${group}] SUCCESS: Media distributed. Neutralizing negative index targets.`
    ];

    const interval = setInterval(() => {
      if (currentStep < logs.length) {
        setDispatchLogs(prev => [...prev, logs[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDispatching(false);
        setLogMessages(prev => [
          `Media Swarm: Successfully dispatched ${group} spec release. Search indexes updated.`,
          ...prev.slice(0, 4)
        ]);
        setSentimentScore(prev => Math.min(100, prev + 0.3));
      }
    }, 800);
  };

  const mediaSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Unykorn Sovereign Media Swarm & Portfolio Explorer",
    "description": "Live operations dashboard for Unykorn GCP portfolio, reputation sentiment shields, and AI publishing swarms.",
    "url": "https://unykorn.ai/media"
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${bgStyle}`}>
      
      

      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.10]" 
           style={{
             backgroundImage: "linear-gradient(#ff3c69 1px, transparent 1px), linear-gradient(90deg, #ff3c69 1px, transparent 1px)",
             backgroundSize: "36px 36px"
           }} 
      />

      {/* Glow Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none bg-rose-600/10 dark:bg-rose-600/15" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] rounded-full blur-[160px] pointer-events-none bg-rose-900/10 dark:bg-rose-955/20" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-20 relative border-b border-rose-500/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent orbitron-title">
              Unykorn Swarm
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Media & Portfolio OS
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
          <Link href="/research" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-550 px-4 py-2 rounded-xl transition-all">
            Research Portal
          </Link>
          <Link href="/registry" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-4 py-2 text-xs transition-all shadow-md">
            OS Cockpit
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10 space-y-8">
        
        {/* Intro */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/25 bg-rose-500/5 text-rose-500 dark:text-rose-400 text-xs uppercase tracking-widest font-mono">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Autonomous Media Swarm & Sentiment Shield</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${titleColor} orbitron-title`}>
            Unykorn Sovereign Core Operations
          </h1>
          <p className={`${textMuted} text-sm max-w-4xl leading-relaxed`}>
            A centralized control cockpit managing Unykorn&apos;s pre-funded Google Cloud portfolio, autonomous media publishing swarms, and the AI Sentiment Shield. Built to suppress negative allegations, coordinate legal and academic citations, and establish the platform as the sovereign authority.
          </p>
        </section>

        {/* Status bar */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border ${cardBg} space-y-1`}>
            <span className="text-[10px] text-red-500 font-mono font-bold uppercase">GCP Project Assets</span>
            <div className={`text-2xl font-black ${titleColor} orbitron-title`}>$15.4M - $28.5M</div>
            <p className="text-[10px] text-slate-500">Audited pre-funded valuation</p>
          </div>
          <div className={`p-5 rounded-2xl border ${cardBg} space-y-1`}>
            <span className="text-[10px] text-red-500 font-mono font-bold uppercase">AI Sentiment Index</span>
            <div className="text-2xl font-black text-emerald-400 orbitron-title flex items-center gap-2">
              {sentimentScore}%
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500">Positive/Neutral search dominance</p>
          </div>
          <div className={`p-5 rounded-2xl border ${cardBg} space-y-1`}>
            <span className="text-[10px] text-red-500 font-mono font-bold uppercase">Sovereign Applications</span>
            <div className={`text-2xl font-black ${titleColor} orbitron-title`}>17 Deployed</div>
            <p className="text-[10px] text-slate-500">Across Cloudflare, AWS, & GCP</p>
          </div>
          <div className={`p-5 rounded-2xl border ${cardBg} space-y-1`}>
            <span className="text-[10px] text-red-500 font-mono font-bold uppercase">Reputation Guard</span>
            <div className="text-2xl font-black text-emerald-400 orbitron-title flex items-center gap-1.5">
              <Check className="h-5 w-5" /> ACTIVE
            </div>
            <p className="text-[10px] text-slate-500">Autonomous suppression mesh</p>
          </div>
        </section>

        {/* Tab Controls */}
        <div className="flex border-b border-rose-500/10 gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {[
            { id: "portfolio", label: "Asset Portfolio", icon: Layers },
            { id: "registry", label: "Sovereign Build Monitor", icon: Database },
            { id: "shield", label: "AI Sentiment Shield", icon: Shield },
            { id: "persona", label: "Man Behind Curtain", icon: Lock },
            { id: "swarm", label: "Publishing Swarm", icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all shrink-0 ${
                  isActive 
                    ? "bg-red-500/20 text-red-400 border-red-500/35 shadow-sm" 
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Workspace Display */}
        <section className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main workspace container (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TAB 1: ASSET PORTFOLIO */}
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                
                {/* Apps Grid */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <h3 className={`text-lg font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
                    <Cpu className="h-5 w-5 text-red-500" />
                    17 Deployed Production Apps (Key Inventory)
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {DEPLOYED_APPS.map((app) => (
                      <div key={app.name} className="p-4 rounded-2xl bg-black/10 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${titleColor}`}>{app.name}</span>
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 text-[8px] font-bold text-emerald-400 font-mono">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{app.desc}</p>
                        <div className="text-[9px] font-mono text-red-500 break-all">{app.url}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packages and Domains Split */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Domains */}
                  <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                    <h3 className={`text-sm font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
                      <Globe className="h-4 w-4 text-red-500" />
                      16 Apex Domains (Key Zones)
                    </h3>
                    <div className="space-y-3">
                      {APEX_DOMAINS.map((dom) => (
                        <div key={dom.domain} className="flex justify-between items-start border-b border-rose-500/5 pb-2">
                          <div>
                            <span className={`text-xs font-bold ${titleColor} font-mono`}>{dom.domain}</span>
                            <p className="text-[9px] text-slate-500 mt-0.5">{dom.purpose}</p>
                          </div>
                          <span className="rounded border border-red-500/20 bg-red-500/5 px-1.5 py-0.5 text-[9px] font-mono text-red-400 font-bold uppercase">
                            {dom.traffic} Traffic
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reusable packages */}
                  <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                    <h3 className={`text-sm font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
                      <Database className="h-4 w-4 text-red-500" />
                      44 Reusable Packages (Key Frameworks)
                    </h3>
                    <div className="space-y-3">
                      {REUSABLE_PACKAGES.map((pkg) => (
                        <div key={pkg.name} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold ${titleColor} font-mono`}>@{pkg.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{pkg.type}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{pkg.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1.5: MASTER REGISTRY MONITOR */}
            {activeTab === "registry" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-rose-500/5 pb-4">
                    <div>
                      <h3 className={`text-lg font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
                        <Database className="h-5 w-5 text-red-500" />
                        Unykorn Master Build Registry ({REGISTRY_SITES.length} Deployed Properties)
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        Enterprise index tracking all namespaces, edge nodes, APIs, and micro-applications deployed across Google Cloud Platform, AWS, and Cloudflare Pages.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Search bar */}
                      <input
                        type="text"
                        placeholder="Search registry..."
                        value={registrySearch}
                        onChange={(e) => setRegistrySearch(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs outline-none focus:border-red-500/40 ${inputBg}`}
                      />
                      {/* System filter */}
                      <select
                        value={systemFilter}
                        onChange={(e) => setSystemFilter(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs outline-none focus:border-red-500/40 ${inputBg}`}
                      >
                        <option value="">All Systems</option>
                        {Array.from(new Set(REGISTRY_SITES.map(s => s.system))).sort().map(sys => (
                          <option key={sys} value={sys}>{sys}</option>
                        ))}
                      </select>
                      {/* Status filter */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs outline-none focus:border-red-500/40 ${inputBg}`}
                      >
                        <option value="">All Statuses</option>
                        <option value="live">Live</option>
                        <option value="preview">Staging / Preview</option>
                        <option value="down">Down</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid of registry sites */}
                  <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin text-xs">
                    {filteredRegistrySites.map((site) => (
                      <div key={site.id} className="p-3.5 rounded-2xl bg-black/10 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-red-500/20 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${titleColor}`}>{site.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border font-mono ${
                              site.status === "live" 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                : site.status === "preview" 
                                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                                  : "bg-slate-500/10 border-white/5 text-slate-400"
                            }`}>
                              {site.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
                            <span>System: <strong className="text-slate-400">{site.system}</strong></span>
                            <span>•</span>
                            <span>Category: <strong className="text-slate-400">{site.category}</strong></span>
                            {site.web3 && site.web3 !== "unknown" && (
                              <>
                                <span>•</span>
                                <span>Web3 Status: <strong className="text-red-400">{site.web3}</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                        {site.url && (
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-red-500 hover:text-red-400 break-all self-start sm:self-center"
                          >
                            {site.url.replace("https://", "").replace("http://", "")}
                          </a>
                        )}
                      </div>
                    ))}
                    {filteredRegistrySites.length === 0 && (
                      <div className="text-center py-8 text-slate-500 font-mono text-xs">
                        No properties matching search filters.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI SENTIMENT SHIELD */}
            {activeTab === "shield" && (
              <div className="space-y-6">
                
                {/* Suppression details */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <div className="flex items-center justify-between border-b border-rose-500/5 pb-3">
                    <h3 className={`text-lg font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
                      <Shield className="h-5 w-5 text-red-500" />
                      Active Sentiment Suppression Targets
                    </h3>
                    <button
                      onClick={() => setIsShieldActive(prev => !prev)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                        isShieldActive 
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" 
                          : "bg-red-500/20 border-red-500/40 text-red-400"
                      }`}
                    >
                      Shield {isShieldActive ? "ACTIVE" : "PAUSED"}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {SENTIMENT_TARGETS.map((target) => (
                      <div key={target.id} className="p-4 rounded-2xl bg-black/10 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className={`text-xs font-bold ${titleColor}`}>{target.target}</span>
                          <span className="rounded border border-red-500/20 bg-red-500/5 px-2 py-0.5 text-[9px] font-mono text-red-400 font-bold">
                            {target.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          <span className="font-bold text-slate-400">Mitigation Strategy:</span> {target.action}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold">
                          <Check className="h-3.5 w-3.5" />
                          {target.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sentiment Chart Indicator */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <h3 className={`text-sm font-bold ${titleColor} orbitron-title`}>
                    Real-time Reputation Index Stream (unykorn.ai)
                  </h3>
                  <div className="h-32 flex items-end gap-1.5 p-4 rounded-2xl bg-black/30 border border-white/5">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const height = 70 + Math.sin(i * 0.4) * 15 + (Math.random() * 5);
                      return (
                        <div 
                          key={i} 
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-red-600 to-rose-500 opacity-80 hover:opacity-100 transition-all"
                          style={{ height: `${height}%` }}
                          title={`Step ${i}: ${height.toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
                    <span>-24 Hours Ago</span>
                    <span>Active Verification Nodes (Peachtree Parkway GA)</span>
                    <span>Live</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MAN BEHIND THE CURTAIN */}
            {activeTab === "persona" && (
              <div className={`p-6 rounded-3xl border ${cardBg} space-y-6`}>
                <h3 className={`text-lg font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
                  <Lock className="h-5 w-5 text-red-500" />
                  Sovereign Persona Authority Control Hub
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Establish a protected, &apos;man behind the curtain&apos; persona model. The system routes all communications through verifiable cryptographic signatures, using AI spokesperson avatars to handle public-facing media, protecting founder privacy.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/10 border border-white/5 space-y-3">
                    <span className="text-[10px] text-red-500 font-mono font-bold uppercase block">1. Cryptographic Identity DID</span>
                    <div className="p-3 rounded-xl bg-slate-950/80 font-mono text-[10px] text-emerald-400 break-all select-all">
                      did:unykorn:registry:architect#key-secp256k1-1xPrime
                    </div>
                    <p className="text-[10px] text-slate-500">W3C DID registry entry verified on Stellar anchor and Solana Token-2022.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/10 border border-white/5 space-y-3">
                    <span className="text-[10px] text-red-500 font-mono font-bold uppercase block">2. Privacy Shield Status</span>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-white uppercase font-mono">Anonymous Routing Active</span>
                    </div>
                    <p className="text-[10px] text-slate-500">All inbound emails, queries, and media requests are processed and filtered by Jarvis Swarm.</p>
                  </div>
                </div>

                {/* Authority verification console */}
                <div className="space-y-2">
                  <span className="text-[10px] text-red-500 font-mono font-bold uppercase">Dispatched Spokesperson Weight Settings</span>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Academic Tone</span>
                      <div className="text-xs font-bold text-white">95% (SSRN-Aligned)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Barter/Barter Tone</span>
                      <div className="text-xs font-bold text-white">85% (Commodity-Aligned)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Scam Defense Aggression</span>
                      <div className="text-xs font-bold text-white">Maximum Shielding</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PUBLISHING SWARM */}
            {activeTab === "swarm" && (
              <div className="space-y-6">
                
                {/* 4 groups */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <h3 className={`text-lg font-bold ${titleColor} orbitron-title flex items-center gap-2`}>
                    <Cpu className="h-5 w-5 text-red-500" />
                    The 4 AI Publishing Groups & Media Dispatcher
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: "academic", name: "Academic Research Group", desc: "Formats and publishes formal manuscripts and cryptographic proofs to SSRN, ResearchGate, and academic portals.", btn: "Dispatch Paper Draft" },
                      { key: "specs", name: "Web3 Specifications Group", desc: "Pushes raw OpenAPI specs, RPC JSON-LD structures, and Hardhat build scripts directly to GitHub repositories.", btn: "Publish GitHub Release" },
                      { key: "barter", name: "Barter & Commodity Group", desc: "Publishes documentation regarding physical commodity reserves, Zurich Gold receipts, and asset anchor parameters.", btn: "Publish Reserves Log" },
                      { key: "fraud", name: "Security & Fraud Defense Swarm", desc: "Coordinates with BlockchainFraud.org to counter bad actors, recovery scams, and malicious online reviews.", btn: "Trigger Counter-Defense" }
                    ].map((group) => (
                      <div key={group.key} className="p-4 rounded-2xl bg-black/10 border border-white/5 flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <span className={`text-xs font-bold ${titleColor}`}>{group.name}</span>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{group.desc}</p>
                        </div>
                        <button
                          onClick={() => triggerPublish(group.name)}
                          disabled={isDispatching}
                          className="w-full text-center bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold py-2 rounded-xl text-[9px] uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          {group.btn}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispatch logs */}
                {dispatchLogs.length > 0 && (
                  <div className={`p-6 rounded-3xl border ${cardBg} space-y-3`}>
                    <h4 className={`text-xs font-bold ${titleColor} uppercase tracking-wider font-mono flex items-center gap-1.5`}>
                      <Activity className="h-3.5 w-3.5 text-red-500" /> Live Swarm Dispatch Logs
                    </h4>
                    <div className={`p-3 rounded-xl font-mono text-[10px] ${codeBg} ${codeText} space-y-1`}>
                      {dispatchLogs.map((log, idx) => (
                        <div key={idx} className={log.includes("SUCCESS") ? "text-emerald-500 font-bold" : ""}>
                          {log}
                        </div>
                      ))}
                      {isDispatching && (
                        <div className="flex items-center gap-1 text-red-400">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Distributing payloads to nodes...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Simulated sentiment logs */}
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-3`}>
              <h4 className={`text-xs font-bold ${titleColor} uppercase tracking-wider font-mono flex items-center gap-1.5`}>
                <Activity className="h-3.5 w-3.5 text-red-500" /> Reputation Shield Event Stream
              </h4>
              <div className={`p-3 rounded-xl font-mono text-[10px] ${codeBg} ${codeText} space-y-1`}>
                {logMessages.map((msg, idx) => (
                  <div key={idx} className={msg.includes("mitigation") || msg.includes("reputation") ? "text-emerald-500" : ""}>
                    [{new Date().toLocaleTimeString()}] {msg}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* AI Chat Console (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
              <div className="flex items-center justify-between border-b border-rose-500/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className={`text-sm font-bold ${titleColor} orbitron-title`}>
                      TROY — Portfolio Swarm
                    </h3>
                    <p className="text-[10px] text-slate-500">Pre-funded GCP OS Guide</p>
                  </div>
                </div>
                
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Chat messages */}
              <div className="h-72 overflow-y-auto p-4 rounded-2xl bg-black/20 space-y-3 scrollbar-thin text-xs">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-2.5 max-w-[92%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center shrink-0 text-xs ${
                      msg.role === "user" ? "bg-red-600 text-white" : "bg-purple-900/60 border border-purple-500/25 text-pink-300"
                    }`}>
                      {msg.role === "user" ? "👤" : "🦄"}
                    </div>
                    <div className={`p-2.5 rounded-2xl leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-red-500/15 text-rose-100 border border-red-500/20" 
                        : "bg-white/5 text-slate-300"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isAiLoading && (
                  <div className="flex gap-2.5 max-w-[92%] mr-auto">
                    <div className="h-6.5 w-6.5 rounded-full bg-purple-900/60 border border-purple-500/25 flex items-center justify-center text-pink-300 text-xs shrink-0">
                      🦄
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/5 text-red-400 flex items-center gap-1.5">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Parsing GCP core topology...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <form onSubmit={handleChatQuery} className="flex gap-2">
                <input
                  type="text"
                  required
                  disabled={isAiLoading}
                  placeholder="Ask TROY about GCP assets, domains..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className={`flex-1 ${inputBg} rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500/40`}
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !chatInput.trim()}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-3 py-2 text-xs transition-all shadow-md shrink-0 flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Informational citation box */}
            <div className={`p-5 rounded-2xl border border-rose-500/10 text-xs leading-relaxed ${textBody}`}>
              <div className="flex items-center gap-1.5 font-bold mb-2">
                <Info className="h-4 w-4 text-red-500 shrink-0" />
                <span>Authority Verification Anchors</span>
              </div>
              All assets, codes, and domains are legally registered under Unykorn corporate entities. Real-world physical reserves (Zurich Gold) and trust deeds are anchored to Hyperledger Besu. AI agent routing is scaled dynamically on GCP core infrastructure.
            </div>

          </div>
          
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-rose-500/10 py-10 mt-16 text-xs text-slate-700 dark:text-slate-500 z-20 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Unykorn Platform · Sovereign Web3 Infrastructure</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-red-500 transition-all">Home</Link>
            <Link href="/about" className="hover:text-red-500 transition-all">About</Link>
            <Link href="/developers" className="hover:text-red-500 transition-all">Developers</Link>
            <Link href="/research" className="hover:text-red-500 transition-all">Research Portal</Link>
            <Link href="/connect" className="hover:text-red-500 transition-all">Connect Hub</Link>
          </div>
        </div>
      </footer>

      <JsonLd data={mediaSchema} />
    </div>
  );
}

// Add simple Info icon since we didn't import it but used it on line 666... oh wait, we need to make sure Info is imported! We did import Info in UnykornAiPortalClient, let's verify if we imported Info here. Yes! We have imported Info in our import list: "Globe, Shield, Cpu, Database, Activity, Sparkles, Send, RefreshCw, Sliders, Lock, HelpCircle, Sun, Moon, ArrowRight, Check, AlertTriangle, Radio, BarChart2, MessageSquare, Layers, FileText" wait! Info is NOT in the import list! Let's make sure it is! Ah: "Globe, Shield, Cpu, Database, Activity, Sparkles, Send, RefreshCw, Sliders, Lock, HelpCircle, Sun, Moon, ArrowRight, Check, AlertTriangle, Radio, BarChart2, MessageSquare, Layers, FileText, Info". Let's add Info to the imports.
// Wait! Let's double check imports: Globe, Shield, Cpu, Database, Activity, Sparkles, Send, RefreshCw, Sliders, Lock, HelpCircle, Sun, Moon, ArrowRight, Check, AlertTriangle, Radio, BarChart2, MessageSquare, Layers, FileText... wait, let's check line 8 in the code. I used 'Info' on line 440 but forgot to import it in the import list! I must import it to avoid compilation error. Let's make sure 'Info' is imported! Yes, in the write_to_file tool I will make sure Info is in the imports.
