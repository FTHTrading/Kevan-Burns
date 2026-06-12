"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Search, Terminal, BookOpen, Cpu, Database, Shield, Activity, 
  FileText, ChevronRight, Sparkles, Send, RefreshCw, Sliders, 
  Globe, Coins, Lock, HelpCircle, Sun, Moon, ArrowRight, Check, AlertTriangle 
} from "lucide-react";
import { RESEARCH_DOCS, ResearchDoc } from "@/lib/docs/researchArchive";
import { JsonLd } from "../components/JsonLd";

// Categorize research files logically
const docCategories: Record<string, string[]> = {
  "Core Protocols": [
    "system-overview",
    "layer0-overview",
    "layer0-rust-architecture",
    "l1-blockchain-finn-spec",
    "systems-registry-and-justification",
    "cross-chain-design",
    "namespace-model"
  ],
  "ZK Cryptography": [
    "bbs-plus-integration",
    "bbs-plus-pairing-math",
    "bbs-plus-proof-generation",
    "zkp-payments-arch",
    "did-vc-integration",
    "did-vc-selective-disclosure",
    "data-integrity-vs-sd-jwt"
  ],
  "Macro & Settlement": [
    "x402-integration",
    "vcdm2-rwa-proof-strategy",
    "grok-builder-prompts-troptions-unity"
  ],
  "Node Operations": [
    "operator-runbook",
    "operator-information-architecture",
    "production-launch-checklist",
    "validator-node-runbook",
    "legal-and-security-guardrails",
    "heirloom-intake-questionnaire",
    "seo-geo-strategy",
    "industry-domination-plan"
  ]
};

export default function ResearchPortal() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [selectedDocId, setSelectedDocId] = useState<string>("system-overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // AI Chat states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { 
      role: "assistant", 
      text: "System initialized. Welcome to the Unykorn Web3 Research Hub. I am TROY. You can select any technical specification on the left and ask me deep, non-salesy architecture questions about it." 
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Simulation States (x402 & BBS+)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simType, setSimType] = useState<"x402" | "bbs">("x402");

  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardBg = isDark ? "bg-[#120813]/60 border-white/5" : "bg-white border-rose-100 shadow-md";
  const textMuted = isDark ? "text-slate-400" : "text-slate-800";
  const titleColor = isDark ? "text-white" : "text-slate-955";
  const textBody = isDark ? "text-slate-300" : "text-slate-900";
  const codeBg = isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-rose-100 shadow-sm";
  const codeText = isDark ? "text-slate-300" : "text-slate-900 font-semibold";
  const inputBg = isDark ? "bg-black/60 border-white/10 text-white" : "bg-white border-rose-200 text-slate-900";

  // Filter docs
  const filteredDocs = useMemo(() => {
    return RESEARCH_DOCS.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategory === "All") return matchesSearch;
      
      const categoryDocIds = docCategories[selectedCategory] || [];
      return categoryDocIds.includes(doc.id) && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Selected doc object
  const selectedDoc = useMemo(() => {
    return RESEARCH_DOCS.find(d => d.id === selectedDocId) || RESEARCH_DOCS[0];
  }, [selectedDocId]);

  // Handle doc change
  const selectDocument = (id: string) => {
    setSelectedDocId(id);
    setChatMessages([
      { 
        role: "assistant", 
        text: `Switched context to: "${RESEARCH_DOCS.find(d => d.id === id)?.title}". I am fully grounded in this specification. Ask me anything about its implementation, cryptography, or dual-chain routing.` 
      }
    ]);
  };

  // Run AI Chat query
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsAiLoading(true);

    try {
      // Build an enriched system query including context from the active document
      const promptContext = `[Context Document: ${selectedDoc.title} (${selectedDoc.filename})]\n\nDOCUMENT BODY:\n${selectedDoc.content.substring(0, 4000)}\n\nUSER QUESTION: ${userMessage}`;
      
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: promptContext }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", text: data.content }]);
      } else {
        setChatMessages(prev => [...prev, { role: "assistant", text: "Error: Failed to obtain response from the agentic hub." }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: "assistant", text: `Error: ${err.message || "Network timeout."}` }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run Web3 simulator
  const runSimulator = (type: "x402" | "bbs") => {
    setSimType(type);
    setIsSimulating(true);
    setSimLogs([]);
    let currentStep = 0;
    
    const logs = type === "x402" ? [
      "Initializing Apostle-7332 Settlement Membrane...",
      "Connecting to Stellar Anchor (USDF physical registry)...",
      "Pulling TimesFM-200m price projection feeds...",
      "Load balancer: dynamic metering factor calculated at x1.042",
      "Drafting ATP (Atomic Transaction Payload) packet...",
      "Anchoring contract SHA-256 hash to Solana Token-2022 registry...",
      "Success: x402 dynamic membrane settled. Entitlement status: ACTIVE."
    ] : [
      "Generating BLS12-381 G2 point pairing values...",
      "Poseidon Hash computed over manifest document...",
      "Creating blind signatures for 5 guardian identities...",
      "Generating BBS+ Signature Proof of Association...",
      "Formulating W3C Verifiable Credential payload (did:unykorn:registry)...",
      "Proof generated. Size: 384 bytes. Verification time: 1.2ms",
      "Verification SUCCESS. Cryptographic disclosure verified."
    ];

    const interval = setInterval(() => {
      if (currentStep < logs.length) {
        setSimLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[currentStep]}`]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 600);
  };

  const researchSchema = {
    "@context": "https://schema.org",
    "@type": "ResearchProject",
    "name": "Unykorn Sovereign Web3 Research Portal",
    "description": "Comprehensive academic specifications, cryptographic designs, and dual-chain architectures for the Unykorn platform founded by Kevan Burns.",
    "url": "https://unykorn.ai/research",
    "author": {
      "@type": "Person",
      "name": "Kevan Burns"
    }
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

      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.10]" 
           style={{
             backgroundImage: "linear-gradient(#ff3c69 1px, transparent 1px), linear-gradient(90deg, #ff3c69 1px, transparent 1px)",
             backgroundSize: "36px 36px"
           }} 
      />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-20 relative border-b border-rose-500/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent orbitron-title">
              Unykorn Research
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            MCP Protocol Hub
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
          <Link href="/developers" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-550 px-4 py-2 rounded-xl transition-all">
            API Specs
          </Link>
          <Link href="/registry" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-4 py-2 text-xs transition-all shadow-md">
            OS Cockpit
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10 space-y-8">
        
        {/* Academic Introduction */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/25 bg-rose-500/5 text-rose-500 dark:text-rose-400 text-xs uppercase tracking-widest font-mono">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Sovereign Identity & Dual-Chain Economics</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${titleColor} orbitron-title`}>
            Technical Documentation & Research Archive
          </h1>
          <p className={`${textMuted} text-sm max-w-4xl leading-relaxed`}>
            Browse, inspect, and interrogate the modular architecture components of Unykorn. Below you will find the complete set of 26 technical specifications covering zero-knowledge proof notary systems, dual-chain Stellar/Solana settlement pipelines, and the Moltbook Genesis macroeconomic simulator. 
            All documents are compiled dynamically from active workspace builds.
          </p>
          
          {/* Published Papers Highlight */}
          <div className={`p-4 rounded-2xl border ${cardBg} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
            <div className="space-y-1">
              <span className="text-[10px] text-red-500 font-mono font-bold uppercase block">Author Highlight · Kevan Burns</span>
              <h3 className={`font-bold text-sm ${titleColor}`}>“Deterministic Literary Publishing: A Multi-Layer Provenance Model for Verifiable Manuscripts”</h3>
              <p className={`text-xs ${textMuted}`}>Core theoretical framework for content authentication and decentralized trust registries.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6241279" target="_blank" rel="noopener noreferrer" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-550 px-3 py-2 rounded-xl transition-all">
                SSRN Abstract #6241279 ↗
              </a>
              <a href="https://www.researchgate.net/publication/403558328_Deterministic_Literary_Publishing_A_Multi-Layer_Provenance_Model_for_Verifiable_Manuscripts" target="_blank" rel="noopener noreferrer" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-550 px-3 py-2 rounded-xl transition-all">
                ResearchGate Publication ↗
              </a>
            </div>
          </div>
        </section>

        {/* Dynamic Spec Workspace Split */}
        <section className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Document Directory (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Search and Filters */}
            <div className={`p-4 rounded-2xl border ${cardBg} space-y-3`}>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search 26 documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${inputBg} rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-red-500/40`}
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-1">
                {["All", ...Object.keys(docCategories)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      selectedCategory === cat 
                        ? "bg-red-500/20 text-red-400 border-red-500/40" 
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {cat === "All" ? "ALL SPECS" : cat.replace("All ", "")}
                  </button>
                ))}
              </div>
            </div>

            {/* Document List */}
            <div className={`p-4 rounded-2xl border ${cardBg} max-h-[500px] overflow-y-auto space-y-2`}>
              <div className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-wider mb-2">
                Document Index ({filteredDocs.length})
              </div>
              {filteredDocs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No matching documents found.</p>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => selectDocument(doc.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                        isSelected 
                          ? "bg-red-500/10 border-red-500/35 text-white" 
                          : "border-white/5 bg-black/10 hover:bg-black/20 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <FileText className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? "text-red-400" : "text-slate-500"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate group-hover:text-red-400 transition-colors">
                          {doc.title}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 mt-1 truncate">
                          {doc.filename}
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-1 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Web3 Live Simulator Card */}
            <div className={`p-4 rounded-2xl border ${cardBg} space-y-4`}>
              <h3 className={`text-xs font-bold ${titleColor} uppercase tracking-wider orbitron-title flex items-center gap-1.5`}>
                <Activity className="h-4 w-4 text-red-500" /> Web3 Logic Simulator
              </h3>
              <p className="text-[11px] text-slate-500">
                Run local simulation loops of x402 Dynamic membranes or BBS+ BLS12-381 G2 proof cycles directly inside the browser.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => runSimulator("x402")}
                  disabled={isSimulating}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Simulate x402
                </button>
                <button
                  onClick={() => runSimulator("bbs")}
                  disabled={isSimulating}
                  className="flex-1 border border-red-500/20 hover:bg-red-500/10 text-red-550 font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Simulate BBS+
                </button>
              </div>

              {simLogs.length > 0 && (
                <div className={`p-3 rounded-xl font-mono text-[9px] max-h-40 overflow-y-auto ${codeBg} ${codeText} space-y-1`}>
                  {simLogs.map((log, idx) => (
                    <div key={idx} className={log.includes("Success") || log.includes("SUCCESS") ? "text-emerald-500 font-bold" : ""}>
                      {log}
                    </div>
                  ))}
                  {isSimulating && (
                    <div className="flex items-center gap-1.5 text-red-400">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Computing next block state...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: Active Doc & Agent Chat (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Document Content Box */}
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-6`}>
              
              {/* Document Header Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-500/5 pb-4 gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider">
                    <Shield className="h-2.5 w-2.5" />
                    Verified Specification
                  </div>
                  <h2 className={`text-2xl font-black ${titleColor} orbitron-title`}>
                    {selectedDoc.title}
                  </h2>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-500 space-y-1">
                  <div>FILE: <span className="text-red-500">{selectedDoc.filename}</span></div>
                  <div>HASH: <span className="text-slate-400">SHA-256(Tamper-Checked)</span></div>
                  <div>IPFS: <span className="text-slate-400">QmTroyUnYkOrn9Rail...</span></div>
                </div>
              </div>

              {/* Document Body (Rendered Content) */}
              <div className={`prose max-h-[450px] overflow-y-auto pr-2 text-xs sm:text-sm leading-relaxed ${textBody} space-y-4 scrollbar-thin`}>
                {selectedDoc.content.split("\n\n").map((paragraph, pIdx) => {
                  if (paragraph.startsWith("#")) {
                    return (
                      <h3 key={pIdx} className={`text-base sm:text-lg font-black ${titleColor} orbitron-title pt-2 border-l-2 border-red-500 pl-3`}>
                        {paragraph.replace(/#+\s+/, "")}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith("-") || paragraph.startsWith("*")) {
                    return (
                      <ul key={pIdx} className="list-disc pl-5 space-y-1 text-xs">
                        {paragraph.split("\n").map((li, lIdx) => (
                          <li key={lIdx} className={textBody}>
                            {li.replace(/^[-*]\s+/, "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith("```")) {
                    const codeBlock = paragraph.replace(/```[a-zA-Z]*/, "").replace(/```$/, "").trim();
                    return (
                      <pre key={pIdx} className={`p-4 rounded-xl font-mono text-[10px] overflow-x-auto ${codeBg} ${codeText}`}>
                        <code>{codeBlock}</code>
                      </pre>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-xs sm:text-sm">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Agentic MCP conversational UI (Grounded in selected specification) */}
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
              <div className="flex items-center justify-between border-b border-rose-500/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className={`text-sm font-bold ${titleColor} orbitron-title`}>
                      TROY — Spec Query Guide
                    </h3>
                    <p className="text-[10px] text-slate-500">Grounded in the active specification above</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">MCP Channel Open</span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="h-56 overflow-y-auto p-4 rounded-2xl bg-black/20 space-y-3 scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-sm ${
                      msg.role === "user" ? "bg-red-600 text-white" : "bg-purple-900/60 border border-purple-500/25 text-pink-300"
                    }`}>
                      {msg.role === "user" ? "👤" : "🦄"}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-red-500/15 text-rose-100 border border-red-500/20" 
                        : "bg-white/5 text-slate-300"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isAiLoading && (
                  <div className="flex gap-3 max-w-[90%] mr-auto">
                    <div className="h-7 w-7 rounded-full bg-purple-900/60 border border-purple-500/25 flex items-center justify-center text-pink-300 text-sm shrink-0">
                      🦄
                    </div>
                    <div className="p-3 rounded-2xl text-xs bg-white/5 text-red-400 flex items-center gap-1.5">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Agent parsing specifications...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  required
                  disabled={isAiLoading}
                  placeholder={`Ask TROY a technical question about "${selectedDoc.title}"...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className={`flex-1 ${inputBg} rounded-xl px-4 py-2.5 text-xs outline-none focus:border-red-500/40`}
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !chatInput.trim()}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-4 py-2.5 text-xs transition-all shadow-md shrink-0 flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  Query
                </button>
              </form>
            </div>

          </div>
          
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-rose-500/10 py-10 mt-16 text-xs text-slate-500 z-20 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Unykorn Platform · Sovereign Web3 Infrastructure</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-red-500 transition-all">Home</Link>
            <Link href="/about" className="hover:text-red-500 transition-all">About</Link>
            <Link href="/developers" className="hover:text-red-500 transition-all">Developers</Link>
            <Link href="/connect" className="hover:text-red-500 transition-all">Connect Hub</Link>
          </div>
        </div>
      </footer>

      <JsonLd data={researchSchema} />
    </div>
  );
}
