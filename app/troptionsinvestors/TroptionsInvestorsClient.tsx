"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Layers, Cpu, Wallet, Globe, Coins, Shield,
  CheckCircle2, AlertTriangle, Clock, XCircle,
  ArrowRight, Lock, Zap, FileText, Search, Send,
  Terminal, Download, Printer, Copy, Sparkles,
  ExternalLink, ChevronRight, Activity, Moon, Sun, Info,
  LineChart, Database, Network, Users
} from "lucide-react";

// Suffix interface definition
interface NamespaceRoot {
  suffix: string;
  category: "Store of Value" | "Institutional" | "Utility & Energy" | "Tech & AI" | "Space & Land";
  multiplier: string;
  valuationUSD: number;
  useCase: string;
  structure: string;
  genesisHash: string;
}

// 50 Suffixes Data matching the Registry Gateway
const NAMESPACE_ROOTS_DATA: NamespaceRoot[] = [
  // Store of Value
  { suffix: ".1", category: "Store of Value", multiplier: "20x Premium", valuationUSD: 15000000, useCase: "Sovereign prime global index identity for elite brands.", structure: "Solana Token-2022 Non-Transferable SFT", genesisHash: "0xG1Prime..." },
  { suffix: ".gold", category: "Store of Value", multiplier: "15x RWA", valuationUSD: 12500000, useCase: "Zurich vault commodity gold physical allocations.", structure: "Stellar Asset Anchor with ZK Audit proofs", genesisHash: "0xG2Gold..." },
  { suffix: ".gas", category: "Store of Value", multiplier: "12x RWA", valuationUSD: 8500000, useCase: "Natural gas supply chain tokenized storage and custody.", structure: "ERC-6551 Token Bound Accounts on Base", genesisHash: "0xG3Gas..." },
  { suffix: ".oil", category: "Store of Value", multiplier: "12x RWA", valuationUSD: 9000000, useCase: "Crude oil barrel inventory tracking and dynamic pricing.", structure: "Stellar Mirror Anchor", genesisHash: "0xG4Oil..." },
  { suffix: ".money", category: "Store of Value", multiplier: "10x Yield", valuationUSD: 6500000, useCase: "High-yield cash reserves and liquidity pool tokenization.", structure: "Solana DLMM Dynamic Liquidity Pool SFT", genesisHash: "0xG6Money..." },
  { suffix: ".prime", category: "Store of Value", multiplier: "15x Premium", valuationUSD: 7500000, useCase: "Tier-1 sovereign reserves and index currency registry.", structure: "Besu ATP Ledger Settlement Hook", genesisHash: "0xG50Prime..." },
  
  // Institutional
  { suffix: ".bank", category: "Institutional", multiplier: "18x Compliance", valuationUSD: 14000000, useCase: "KYC/AML gated institutional banking routing namespaces.", structure: "ERC-20 compliance wrapper on Polygon", genesisHash: "0xG5Bank..." },
  { suffix: ".trust", category: "Institutional", multiplier: "15x Trust", valuationUSD: 11000000, useCase: "Estate succession trust and multi-sig heirs allocations.", structure: "Georgia Legal Template ZK Notary", genesisHash: "0xG12Trust..." },
  { suffix: ".fund", category: "Institutional", multiplier: "12x Capital", valuationUSD: 9500000, useCase: "Venture capital and private equity pooled SFT registry.", structure: "Besu ATP Ledger Token-2022 Account", genesisHash: "0xG13Fund..." },
  { suffix: ".pay", category: "Institutional", multiplier: "10x Settlement", valuationUSD: 8000000, useCase: "Edge payment routing hooks and multi-chain invoice settlement.", structure: "Stripe Worker Webhook Integration", genesisHash: "0xG14Pay..." },
  { suffix: ".yield", category: "Institutional", multiplier: "10x Yield", valuationUSD: 7200000, useCase: "Sovereign SFT interest and tokenized real estate yield pools.", structure: "Solana CPMM Liquidity Pool Hook", genesisHash: "0xG15Yield..." },
  { suffix: ".treasury", category: "Institutional", multiplier: "15x Premium", valuationUSD: 13000000, useCase: "Corporate and institutional multi-sig treasury reserves.", structure: "Stellar Multisig Account Anchor", genesisHash: "0xG16Treasury..." },
  { suffix: ".law", category: "Institutional", multiplier: "12x Compliance", valuationUSD: 6800000, useCase: "On-chain attorney verification and estate notary registries.", structure: "Georgia Legal Template Anchor", genesisHash: "0xG29Law..." },
  { suffix: ".doc", category: "Institutional", multiplier: "10x Audit", valuationUSD: 5200000, useCase: "On-chain document hash verification and metadata checks.", structure: "Polygon Publishing Kernel V2 Hash", genesisHash: "0xG28Doc..." },
  { suffix: ".id", category: "Institutional", multiplier: "15x Trust", valuationUSD: 8800000, useCase: "Soulbound SFT sovereign verification & digital identity.", structure: "ZK PLONK Public Key Anchor", genesisHash: "0xG30Id..." },
  { suffix: ".secure", category: "Institutional", multiplier: "18x Compliance", valuationUSD: 10500000, useCase: "Military-grade digital assets vault access control keys.", structure: "AES-256 Client-side Key + ZK Proofs", genesisHash: "0xG37Secure..." },

  // Utility & Energy
  { suffix: ".energy", category: "Utility & Energy", multiplier: "12x RWA", valuationUSD: 8900000, useCase: "Wholesale electricity distribution grid registries.", structure: "Besu ATP Ledger Settlement Hook", genesisHash: "0xG17Energy..." },
  { suffix: ".power", category: "Utility & Energy", multiplier: "12x RWA", valuationUSD: 8200000, useCase: "Renewable power plant output and fractional generation tracking.", structure: "ERC-6551 Account on Polygon", genesisHash: "0xG18Power..." },
  { suffix: ".grid", category: "Utility & Energy", multiplier: "10x Capacity", valuationUSD: 6700000, useCase: "Regional micro-grid load balance and routing automation.", structure: "Cloudflare Workers routing middleware", genesisHash: "0xG19Grid..." },
  { suffix: ".solar", category: "Utility & Energy", multiplier: "10x Yield", valuationUSD: 5800000, useCase: "Solar farm carbon offset tokenization and yield anchors.", structure: "Stellar Mirror Anchor", genesisHash: "0xG20Solar..." },
  { suffix: ".mining", category: "Utility & Energy", multiplier: "12x RWA", valuationUSD: 7400000, useCase: "Mineral extraction rights and gold mining reserve appraisals.", structure: "Solana SFT Token-2022 Account", genesisHash: "0xG21Mining..." },
  { suffix: ".carbon", category: "Utility & Energy", multiplier: "10x Compliance", valuationUSD: 5500000, useCase: "Regulated carbon credits and greenhouse gas registries.", structure: "Polygon Publishing Kernel V2 Anchor", genesisHash: "0xG22Carbon..." },
  { suffix: ".credit", category: "Utility & Energy", multiplier: "10x Settlement", valuationUSD: 6100000, useCase: "Corporate credit limits and invoice micro-financing routing.", structure: "Besu ATP Ledger Token-2022 Account", genesisHash: "0xG23Credit..." },
  { suffix: ".trade", category: "Utility & Energy", multiplier: "12x Capital", valuationUSD: 9200000, useCase: "Cross-border RWA commodities trade settlements.", structure: "Stellar Asset Anchor", genesisHash: "0xG24Trade..." },
  { suffix: ".swap", category: "Utility & Energy", multiplier: "10x Yield", valuationUSD: 7000000, useCase: "Liquidity pool swap routes and asset conversions.", structure: "Solana DLMM Dynamic Liquidity Pool", genesisHash: "0xG25Swap..." },
  { suffix: ".water", category: "Utility & Energy", multiplier: "15x RWA", valuationUSD: 9800000, useCase: "Tokenized water rights and regional aquifer supply chains.", structure: "Stellar Asset Anchor", genesisHash: "0xG46Water..." },
  { suffix: ".food", category: "Utility & Energy", multiplier: "10x RWA", valuationUSD: 5400000, useCase: "Agricultural supply chain tracking and delivery logs.", structure: "Cloudflare Worker middleware logs", genesisHash: "0xG47Food..." },

  // Tech & AI
  { suffix: ".mcp", category: "Tech & AI", multiplier: "15x Premium", valuationUSD: 11500000, useCase: "Model Context Protocol system tools and AI agent hubs.", structure: "Vertex AI / BigQuery JSON-RPC gateway", genesisHash: "0xG33Mcp..." },
  { suffix: ".ai", category: "Tech & AI", multiplier: "18x Premium", valuationUSD: 14500000, useCase: "Autonomous neural network registry and swarm routing.", structure: "Besu ATP Ledger Settlement Hook", genesisHash: "0xG31Ai..." },
  { suffix: ".agent", category: "Tech & AI", multiplier: "15x Premium", valuationUSD: 12000000, useCase: "Cognitive agent identities and autonomous wallet nodes.", structure: "Solana Token-2022 Non-Transferable Account", genesisHash: "0xG32Agent..." },
  { suffix: ".node", category: "Tech & AI", multiplier: "10x Capacity", valuationUSD: 7800000, useCase: "Apostle consensus validator node registration.", structure: "Besu QBFT Validator Account Link", genesisHash: "0xG34Node..." },
  { suffix: ".cloud", category: "Tech & AI", multiplier: "10x Capacity", valuationUSD: 8500000, useCase: "Decentralized storage allocation and routing rules.", structure: "Cloudflare Pages & Worker Webhooks", genesisHash: "0xG35Cloud..." },
  { suffix: ".quant", category: "Tech & AI", multiplier: "15x Premium", valuationUSD: 10200000, useCase: "High-frequency algorithmic trading strategies.", structure: "Solana DLMM Dynamic Liquidity Pool", genesisHash: "0xG36Quant..." },
  { suffix: ".proof", category: "Tech & AI", multiplier: "15x Trust", valuationUSD: 9100000, useCase: "Zero-Knowledge SNARK proofs repository.", structure: "ZK PLONK Public Key Anchor", genesisHash: "0xG38Proof..." },
  { suffix: ".sign", category: "Tech & AI", multiplier: "10x Trust", valuationUSD: 5900000, useCase: "Cryptographic signature registry for legal agreements.", structure: "Polygon Publishing Kernel V2 Hash", genesisHash: "0xG39Sign..." },
  { suffix: ".ipfs", category: "Tech & AI", multiplier: "10x Audit", valuationUSD: 6400000, useCase: "IPFS CID registry for SFT metadata and files.", structure: "IPFS public gateway CNAME link", genesisHash: "0xG40Ipfs..." },
  { suffix: ".dev", category: "Tech & AI", multiplier: "10x Capacity", valuationUSD: 6600000, useCase: "Developer API keys and edge worker configurations.", structure: "Cloudflare Worker middleware logs", genesisHash: "0xG43Dev..." },
  { suffix: ".build", category: "Tech & AI", multiplier: "10x Capacity", valuationUSD: 6800000, useCase: "Ecosystem build status and release log triggers.", structure: "Besu ATP Ledger Settlement Hook", genesisHash: "0xG42Build..." },

  // Space & Land
  { suffix: ".rwa", category: "Space & Land", multiplier: "18x RWA", valuationUSD: 13500000, useCase: "Physical real estate, deeds, and asset-backed tokens.", structure: "Stellar Asset Anchor with RWA deeds", genesisHash: "0xG7Rwa..." },
  { suffix: ".estate", category: "Space & Land", multiplier: "15x RWA", valuationUSD: 11000000, useCase: "Family estate planning and digital asset vaults.", structure: "Georgia Legal Template ZK Notary", genesisHash: "0xG8Estate..." },
  { suffix: ".vault", category: "Space & Land", multiplier: "15x Trust", valuationUSD: 12200000, useCase: "Sovereign client-side encrypted vaults.", structure: "AES-256 Client-side Key + ZK Proofs", genesisHash: "0xG9Vault..." },
  { suffix: ".legacy", category: "Space & Land", multiplier: "12x Trust", valuationUSD: 9600000, useCase: "Digital inheritance registry and succession conditions.", structure: "Georgia Legal Template Anchor", genesisHash: "0xG10Legacy..." },
  { suffix: ".chain", category: "Space & Land", multiplier: "12x Capacity", valuationUSD: 10000000, useCase: "Multi-chain asset routing and network gateway anchors.", structure: "Besu QBFT Validator Account Link", genesisHash: "0xG11Chain..." },
  { suffix: ".x", category: "Space & Land", multiplier: "15x Premium", valuationUSD: 11800000, useCase: "High-value premium single-character namespace records.", structure: "Solana Token-2022 Non-Transferable SFT", genesisHash: "0xG26X..." },
  { suffix: ".med", category: "Space & Land", multiplier: "12x Compliance", valuationUSD: 8000000, useCase: "Medical record hashes and physician credentials.", structure: "Polygon Publishing Kernel V2 Hash", genesisHash: "0xG27Med..." },
  { suffix: ".meta", category: "Space & Land", multiplier: "10x Yield", valuationUSD: 7400000, useCase: "Virtual land deeds and virtual space assets.", structure: "ERC-6551 Account on Polygon", genesisHash: "0xG41Meta..." },
  { suffix: ".land", category: "Space & Land", multiplier: "15x RWA", valuationUSD: 12000000, useCase: "Agricultural and commercial land title registry.", structure: "Stellar Asset Anchor with RWA deeds", genesisHash: "0xG44Land..." },
  { suffix: ".home", category: "Space & Land", multiplier: "10x RWA", valuationUSD: 7900000, useCase: "Residential real estate deeds and utility mappings.", structure: "Georgia Legal Template Anchor", genesisHash: "0xG45Home..." },
  { suffix: ".store", category: "Space & Land", multiplier: "10x Settlement", valuationUSD: 6900000, useCase: "Merchant gateway registrations and invoice checks.", structure: "Stripe Worker Webhook Integration", genesisHash: "0xG48Store..." },
  { suffix: ".world", category: "Space & Land", multiplier: "15x Premium", valuationUSD: 13800000, useCase: "Global registry operations and country-level namespaces.", structure: "Besu ATP Ledger Settlement Hook", genesisHash: "0xG49World..." }
];

export default function TroptionsInvestorsClient() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeDeckTab, setActiveDeckTab] = useState<"planes" | "chains" | "revenue" | "thesis" | "genesis" | "lanes">("planes");
  
  // Interactive Bubble Zone State
  const [activeBubble, setActiveBubble] = useState<string>("default");
  
  // Interactive Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Welcome, capital partner. I am TROY, the investor relations agent. Ask me about our 50 namespace roots, RWA multipliers, or how our dual-chain infrastructure scales via Google Cloud Vertex AI and TimesFM."
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Live MCP Sandbox State
  const [mcpLogs, setMcpLogs] = useState<string[]>([
    "[MCP] Server initialized. Registered tools: 3",
    "[MCP] Connected to BigQuery dataset: `unykorn_sovereign_prod`"
  ]);
  const [mcpRunning, setMcpRunning] = useState(false);

  useEffect(() => {
    document.title = "TROPTIONS Investors | Sovereign Web3 Namespace Capital & Scale";
  }, []);

  // Bubble Click handler
  const handleBubbleClick = (root: string) => {
    setActiveBubble(root);
    let response = "";
    if (root === ".1") {
      response = "GENESIS SUFFIX [.1]: The prime namespace class. Simple, extremely scarce, and optimized for global flagship organizations. Valued at $15M USD, it utilizes Solana Token-2022 to guarantee non-transferable SFT status.";
    } else if (root === ".gold") {
      response = "TREASURY SUFFIX [.gold]: Focuses on wealth-preservation assets. Directly anchored to physical Zurich gold vault reserves. Integrates ZK audit proof hooks via Stellar to certify real assets on-chain.";
    } else if (root === ".rwa") {
      response = "ASSET SUFFIX [.rwa]: Bridges digital networks to real-world property deeds, mineral rights, and physical assets, integrating our Ruby RWA contract hooks on Stellar.";
    } else if (root === ".estate") {
      response = "LEGACY SUFFIX [.estate]: Built for family trusts, digital wealth inheritance, and dead-man switches. Tied to Georgia-compliant legal document frameworks.";
    } else if (root === ".mcp") {
      response = "AI SUFFIX [.mcp]: Standardized gateway for Model Context Protocol systems. Enables cognitive AI agents to programmatically fetch schemas, sign payments, and query BigQuery pools.";
    } else if (root === ".bank") {
      response = "INSTITUTIONAL SUFFIX [.bank]: Gated compliance lane for regulated commercial banking networks, routing credits, and Stripe worker conversion hooks.";
    } else {
      response = "Troptions Registry is a dual-chain namespace system. Ask about identity, value, vaults, roots, or entering the full operating system.";
    }

    setChatLog(prev => [...prev, { sender: "ai", text: response }]);
  };

  // Conversational Responder
  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatLog(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const messages = chatLog.map(m => ({
        role: m.sender === "ai" ? "assistant" : "user",
        content: m.text
      }));
      messages.push({ role: "user", content: userText });

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });

      if (res.ok) {
        const data = await res.json();
        setChatLog(prev => [...prev, { sender: "ai", text: data.content }]);
      } else {
        setChatLog(prev => [...prev, { sender: "ai", text: "The sovereign AI node could not compile a response." }]);
      }
    } catch (e) {
      setChatLog(prev => [...prev, { sender: "ai", text: "Connection to TROY AI timed out." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Execute MCP Tool Trace
  const triggerMcpTrace = () => {
    if (mcpRunning) return;
    setMcpRunning(true);
    setMcpLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [MCP] Calling tool: \`get_namespace_valuation\` with parameters: { suffix: ".gold" }`,
    ]);

    setTimeout(() => {
      setMcpLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [MCP] Querying BigQuery historical benchmarks...`,
        `[${new Date().toLocaleTimeString()}] [MCP] Benchmarks recovered: Zurich gold pool index +14.2% YoY`
      ]);

      setTimeout(() => {
        setMcpLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [MCP] Running TimesFM inference forecast... Horizon target: $1,902/oz`,
          `[${new Date().toLocaleTimeString()}] [MCP] Tool Output: { success: true, valuationUSD: 12500000, multiplier: "15x RWA" }`,
          `[${new Date().toLocaleTimeString()}] [MCP] Trace Completed successfully.`
        ]);
        setMcpRunning(false);
      }, 1000);
    }, 1000);
  };

  // Filter Suffixes
  const filteredRoots = NAMESPACE_ROOTS_DATA.filter(r => {
    const matchesSearch = r.suffix.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.useCase.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${theme === "dark" ? "dark" : ""} ${
      theme === "dark" 
        ? "bg-[#09040a] text-[#ffdce6] selection:bg-rose-500/30" 
        : "bg-[#fbf5f6] text-[#250d14] selection:bg-rose-500/20"
    }`}>
      
      
      {/* Background grids */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.15]" 
           style={{
             backgroundImage: "linear-gradient(#ff3c69 1px, transparent 1px), linear-gradient(90deg, #ff3c69 1px, transparent 1px)",
             backgroundSize: "44px 44px"
           }} 
      />

      {/* Glow Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none bg-rose-600/10 dark:bg-rose-600/15" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] rounded-full blur-[160px] pointer-events-none bg-rose-900/10 dark:bg-rose-950/20" />

      {/* Top Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20 relative border-b border-rose-500/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent orbitron-title">
              Unykorn Investors
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Investor Portal
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
          <Link href="/troptions" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-500 px-4 py-2 rounded-xl transition-all">
            Ecosystem Manual
          </Link>
          <Link href="/" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-4 py-2 text-xs transition-all shadow-md shadow-red-500/10">
            Enter Cockpit
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-16">
        
        <section className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/5 text-red-500 dark:text-red-400 text-xs uppercase tracking-widest font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sovereign Identity & Capital Gateway</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none orbitron-title">
              Registry SFT Capital & <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Google AI Scale</span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-900 dark:text-slate-400 leading-relaxed max-w-xl">
              An institutional overview demonstrating how the 50 sovereign namespaces form the genesis anchor of digital estate planning, commodity wealth lanes, and energy systems—built to scale seamlessly using Google Cloud AI pipelines.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="#roots-directory" className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-3 text-xs transition-all shadow-md shadow-red-500/10">
                Explore 50 Suffixes
              </a>
              <a href="#google-scale" className="rounded-xl border border-red-500/20 hover:bg-white/5 font-bold px-5 py-3 text-xs transition-all">
                Google Cloud Architecture
              </a>
            </div>
          </div>

          {/* Interactive Gateway Zone from HTML template */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-red-500/20 bg-[#120813]/60 backdrop-blur-xl p-6 relative overflow-hidden shadow-2xl min-h-[500px] flex flex-col justify-between">
              
              {/* Floating Suffix Bubbles */}
              <div className="relative h-64 border-b border-white/5 pb-4">
                <button onClick={() => handleBubbleClick(".1")} className="absolute top-4 left-4 w-20 h-20 rounded-full border border-rose-500/20 bg-rose-950/20 hover:bg-rose-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg">
                  <span className="font-bold text-sm">.1</span>
                  <span className="text-[8px] text-rose-300">Prime ID</span>
                </button>
                <button onClick={() => handleBubbleClick(".gold")} className="absolute top-2 right-12 w-20 h-20 rounded-full border border-amber-500/25 bg-amber-950/20 hover:bg-amber-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg">
                  <span className="font-bold text-sm">.gold</span>
                  <span className="text-[8px] text-amber-300">Reserves</span>
                </button>
                <button onClick={() => handleBubbleClick(".rwa")} className="absolute top-24 left-32 w-20 h-20 rounded-full border border-blue-500/20 bg-blue-950/20 hover:bg-blue-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg">
                  <span className="font-bold text-sm">.rwa</span>
                  <span className="text-[8px] text-blue-300">Real Asset</span>
                </button>
                <button onClick={() => handleBubbleClick(".estate")} className="absolute bottom-4 left-10 w-20 h-20 rounded-full border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg">
                  <span className="font-bold text-sm">.estate</span>
                  <span className="text-[8px] text-emerald-300">Vaults</span>
                </button>
                <button onClick={() => handleBubbleClick(".mcp")} className="absolute bottom-6 right-8 w-20 h-20 rounded-full border border-purple-500/20 bg-purple-950/20 hover:bg-purple-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg">
                  <span className="font-bold text-sm">.mcp</span>
                  <span className="text-[8px] text-purple-300">AI tools</span>
                </button>
                <button onClick={() => handleBubbleClick(".bank")} className="absolute top-28 right-32 w-20 h-20 rounded-full border border-red-500/20 bg-red-950/20 hover:bg-red-900/30 text-white flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg">
                  <span className="font-bold text-sm">.bank</span>
                  <span className="text-[8px] text-red-300">Trust</span>
                </button>
              </div>

              {/* TROY AI Agentic presentation */}
              <div className="flex-grow pt-4 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">TROY AI Response Engine</p>
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4 text-xs leading-relaxed max-h-40 overflow-y-auto">
                    {chatLog[chatLog.length - 1].text}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask TROY about roots, scaling, or values..."
                    className="flex-grow bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-red-500/40"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
                  />
                  <button 
                    onClick={handleSendChat}
                    className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-bold transition-all"
                  >
                    <Send className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Investor Pitch & Scope Deck */}
        <section id="pitch-deck" className="space-y-6">
          <div className="border-b border-rose-500/10 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/5 text-red-500 dark:text-red-400 text-xs uppercase tracking-widest font-mono mb-3">
              <Layers className="h-3.5 w-3.5" />
              <span>Interactive System Scope Deck</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold orbitron-title">Ecosystem Architecture & Revenue Deck</h2>
            <p className="text-xs text-slate-900 dark:text-slate-400 mt-1">
              A comprehensive overview of the 4 operating planes, multi-chain settlement footprint, and monetizable streams.
            </p>
          </div>

          {/* Deck Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
            {[
              { id: "planes", label: "4 Operating Planes", icon: Layers },
              { id: "chains", label: "Chain Footprint Matrix", icon: Network },
              { id: "revenue", label: "6 Revenue Streams", icon: Coins },
              { id: "thesis", label: "Ecosystem Thesis", icon: Info },
              { id: "genesis", label: "Genesis & Structuring", icon: Shield },
              { id: "lanes", label: "Identity Lanes Matrix", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDeckTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    activeDeckTab === tab.id
                      ? "bg-red-600 text-white shadow-md shadow-red-500/10"
                      : `border border-red-500/20 hover:bg-red-500/5 ${theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-800 hover:text-slate-950 font-bold"}`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Deck Content */}
          <div className="rounded-3xl border border-red-500/20 bg-[#120813]/60 backdrop-blur-xl p-6 md:p-8">
            {activeDeckTab === "planes" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold orbitron-title text-white">4 Operating Planes</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      For institutional clarity, the Troptions platform is mapped into four distinct planes of operation, separating settlement, issuance, data analytics, and agent intelligence.
                    </p>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="bg-red-500/15 text-red-400 px-2.5 py-1 rounded text-[10px] font-mono font-bold">S1</span>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">S1 Settlement</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Financial stablecoin gateways, automated market routing, and x402 ATP contract hooks.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded text-[10px] font-mono font-bold">L2</span>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">L2 Launch RWA</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">SFT minting console, Legacy Vault document anchoring, and Ruby RWA deeds.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-center">
                    <div className="flex items-start gap-3">
                      <span className="bg-purple-500/15 text-purple-400 px-2.5 py-1 rounded text-[10px] font-mono font-bold">E4</span>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">E4 Intelligence</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Data mining, blockchain fraud registries, OSINT, and institutional search engines.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-4">
                      <span className="bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-mono font-bold">A5</span>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">A5 Agent Swarm</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">22 cognitive twins handling automated onboarding, trust notary, and client services.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDeckTab === "chains" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold orbitron-title text-white">Multi-Chain Settlement Footprint</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  By utilizing a diversified blockchain posture, Troptions minimizes single-point-of-failure risk. We separate high-frequency app logic from slow-moving institutional vaults.
                </p>
                <div className="overflow-x-auto border border-white/10 rounded-2xl">
                  <table className="w-full text-left border-collapse min-w-[600px] font-mono text-[11px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-slate-400">
                        <th className="p-3 font-semibold uppercase tracking-wider">Chain</th>
                        <th className="p-3 font-semibold uppercase tracking-wider">Role</th>
                        <th className="p-3 font-semibold uppercase tracking-wider">Status</th>
                        <th className="p-3 font-semibold uppercase tracking-wider">Strategic Reading</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      <tr>
                        <td className="p-3 font-bold text-white">XRPL</td>
                        <td className="p-3">Stablecoin gateway, IOUs, compliant assets</td>
                        <td className="p-3 text-emerald-400 font-bold">LIVE</td>
                        <td className="p-3">Core settlement layer for corporate vaults.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-white">Stellar</td>
                        <td className="p-3">Mirror anchoring, estate contracts</td>
                        <td className="p-3 text-emerald-400 font-bold">LIVE</td>
                        <td className="p-3">High compliance reserves, Zurich gold allocations.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-white">Solana</td>
                        <td className="p-3">SFT mints, token-2022, wallets</td>
                        <td className="p-3 text-emerald-400 font-bold">LIVE</td>
                        <td className="p-3">Fast smart-asset identity and namespace hooks.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-white">Apostle/Besu 7332</td>
                        <td className="p-3">x402 ATP ledger settlements</td>
                        <td className="p-3 text-emerald-400 font-bold">LIVE</td>
                        <td className="p-3">Proprietary private ledger membrane routing.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-white">Polygon</td>
                        <td className="p-3">Legal template hashes, publishing</td>
                        <td className="p-3 text-emerald-400 font-bold">LIVE</td>
                        <td className="p-3">Secondary document publishing and verification.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-white">Chainlink</td>
                        <td className="p-3">Dynamic RWA oracles</td>
                        <td className="p-3 text-yellow-500 font-bold">PARTIAL</td>
                        <td className="p-3">Data feed updates for gold/gas market valuation.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-white">Cosmos/Sui/Stacks</td>
                        <td className="p-3">Cross-chain relays & Smart assets</td>
                        <td className="p-3 text-slate-500 font-bold">ROADMAP</td>
                        <td className="p-3">Future optionality for tokenized expansion.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeDeckTab === "revenue" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold orbitron-title text-white">6 Revenue Streams</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The ecosystem generates cash flow across multiple independent pricing engines, balancing recurring SaaS software with high-velocity transactional fees.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider">01. Recurring SaaS</span>
                    <h4 className="text-sm font-bold text-white">Legacy Vault</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Subscription tiers at $29.95, $49.95, and $89.95/mo for secure estate succession vaulting.</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider">02. Usage Fees</span>
                    <h4 className="text-sm font-bold text-white">TROPTIONSMINT</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">0.10 SOL per namespace registration and SFT mint, scaling directly with registry load.</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider">03. API Subscriptions</span>
                    <h4 className="text-sm font-bold text-white">PASS API Tiers</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Developer and institutional tiers starting at $49 to $499/mo for intelligence data access.</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider">04. Enterprise Deals</span>
                    <h4 className="text-sm font-bold text-white">Stablecoin Gateways</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Enterprise routing integration fees for regulated financial partners on Stellar/XRPL.</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider">05. x402 Settlement</span>
                    <h4 className="text-sm font-bold text-white">ATP Transaction Gating</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Micro-payment transactional settlements processed on the Apostle 7332 private network.</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider">06. White-label Licensing</span>
                    <h4 className="text-sm font-bold text-white">T-Build Partners</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Long-tail B2B licensing royalties for banks and trusts deploying custom branded portals.</p>
                  </div>
                </div>
              </div>
            )}

            {activeDeckTab === "thesis" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold orbitron-title text-white">Investment Thesis & Regulatory Footprint</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Troptions is positioned as a holding company structured around real-world asset security and blockchain efficiency.
                </p>
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-3 font-mono text-[11px]">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Legal Entity:</span>
                        <span className="text-white font-bold">Americanos Trust (Marietta, GA)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Global LEI:</span>
                        <span className="text-red-400 font-bold">2549008J7LUHSQ73SI26</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Market Venue MIC:</span>
                        <span className="text-amber-500 font-bold">UBEC (Atlanta Registry)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">SEC Taxonomy Code:</span>
                        <span className="text-slate-300">exch:UBEC</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                    <p>
                      Rather than high-risk speculative trading, our focus lies in utility-aware registries (mineral rights, physical Zurich vault gold, estate wills) that require cryptographically secure records.
                    </p>
                    <p className="border-l-2 border-red-500 pl-3 italic text-[11px] text-slate-500">
                      Disclaimers: All tokens and namespaces are structured as tokenized barter-dollars and credit-units. They do not constitute statutory legal tender, or SEC-registered investment securities, and are subject to local jurisdiction legal review.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeDeckTab === "genesis" && (
              <div className="space-y-6 text-slate-300">
                <h3 className="text-xl font-bold orbitron-title text-white">Sovereign Namespaces & Genesis Structuring</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Understand how Web3 namespaces are structured as secure containers, and the role of Genesis Blocks, Hashes, and parameters.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Genesis Cryptographic Parameters</h4>
                    <div className="space-y-3 text-[11px]">
                      <div>
                        <strong className="text-red-400 block font-mono">1. Genesis Block:</strong>
                        <span className="text-slate-400">The first block written to the ledger (Solana or Stellar) that instantiates the namespace token.</span>
                      </div>
                      <div>
                        <strong className="text-red-400 block font-mono">2. Genesis Hash:</strong>
                        <span className="text-slate-400">Immutable cryptographic hash of the genesis block (e.g. <code>0xG1Prime...</code>), certifying the registry's origin.</span>
                      </div>
                      <div>
                        <strong className="text-red-400 block font-mono">3. Custom Parameters:</strong>
                        <span className="text-slate-400">Metadata rules specifying carrying capacity, valuation ceilings, and multi-sig ZK heirs quorums.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Best-Practice Structuring (Dual-Chain Model)</h4>
                    <div className="space-y-3 text-[11px]">
                      <div>
                        <strong className="text-amber-500 block font-mono">Solana (Token-2022 SFTs):</strong>
                        <span className="text-slate-400">Deploys fast, non-transferable soulbound identity hooks and developer API tokens at sub-second speeds.</span>
                      </div>
                      <div>
                        <strong className="text-amber-500 block font-mono">Stellar (Asset Anchoring):</strong>
                        <span className="text-slate-400">Secures Zurich gold commodity receipts, real estate deeds, and KYC-gated trustlines with compliance wrappers.</span>
                      </div>
                      <div>
                        <strong className="text-amber-500 block font-mono">Apostle Chain (Besu L1):</strong>
                        <span className="text-slate-400">Acts as our private consensus network, routing internal transaction quorums and x402 membranes.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDeckTab === "lanes" && (
              <div className="space-y-6 text-slate-300">
                <h3 className="text-xl font-bold orbitron-title text-white">Identity Lanes & User Segmentation</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  To prevent market confusion, we separate the ecosystem into five identity lanes. Normal users, merchants, and institutions register namespaces <strong>within</strong> existing systems, while only strategic buyers acquire top-level <strong>Genesis Roots</strong>.
                </p>
                <div className="overflow-x-auto border border-white/10 rounded-2xl">
                  <table className="w-full text-left border-collapse min-w-[650px] font-mono text-[11px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-slate-400">
                        <th className="p-4 font-semibold uppercase tracking-wider">User Type</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">What they claim/use</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">Primary Purpose & Features</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">Best Examples</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      <tr>
                        <td className="p-4 font-bold text-white">Individual / Family</td>
                        <td className="p-4">Personal namespace (often under <code>.legacy</code>)</td>
                        <td className="p-4 leading-relaxed">Identity containers, ZK heirs quorums, client-side encrypted document vaults, and succession-ready personal asset logs.</td>
                        <td className="p-4 text-emerald-400"><code>smithfamily.legacy</code><br/><code>james.legacy</code></td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white">Small Business / Merchant</td>
                        <td className="p-4">Business or Brand namespace (e.g. under <code>.pay</code>, <code>.store</code>)</td>
                        <td className="p-4 leading-relaxed">Edge invoice routing, dynamic checkout hooks, Stripe payment integrations, barter dollars, and stablecoin settlements.</td>
                        <td className="p-4 text-emerald-400"><code>novapay.store</code><br/><code>organicbarter.pay</code></td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white">Institution</td>
                        <td className="p-4">Institutional namespace (e.g. under <code>.bank</code>, <code>.trust</code>)</td>
                        <td className="p-4 leading-relaxed">KYC/AML compliance wrappers, department-level sub-routing, corporate treasury control, and multi-sig escrow quorums.</td>
                        <td className="p-4 text-emerald-400"><code>horizonbank.bank</code><br/><code>trust.apex.bank</code></td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white">Developer / Integrator</td>
                        <td className="p-4">Developer namespace (e.g. under <code>.mcp</code>, <code>.dev</code>)</td>
                        <td className="p-4 leading-relaxed">Model Context Protocol API keys, edge worker endpoints, secure JSON-RPC schemas, and serverless pipeline connectors.</td>
                        <td className="p-4 text-emerald-400"><code>geminiswarm.mcp</code><br/><code>router.node.dev</code></td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white">Strategic Root Buyer</td>
                        <td className="p-4">Top-Level Genesis Roots (one of the 50 suffixes)</td>
                        <td className="p-4 leading-relaxed">Category ownership of the suffix itself. Governs the category vertical, issues child names, and harvests downstream transaction fees.</td>
                        <td className="p-4 text-amber-400"><code>.gold</code> (Reserves)<br/><code>.rwa</code> (Property)<br/><code>.estate</code> (Trusts)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-red-500/5 border border-red-500/25 rounded-xl p-4 text-[11px] text-slate-400 leading-relaxed">
                  <strong>Strategic Framing:</strong> End-users claim personal or business names inside existing registries. Root buyers act as operators or holding entities, stewarding the top-level suffix and capturing transactional cash flow.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 50 Namespaces Directory Section */}
        <section id="roots-directory" className="space-y-6">
          <div className="border-b border-rose-500/10 pb-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold orbitron-title">50 Sovereign Suffixes Directory</h2>
            <p className="text-xs text-slate-900 dark:text-slate-400 mt-1">
              Genesis blockchain parameters, estimated RWA values, uses, and structuring setups for the top 50 registry suffixes.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {["All", "Store of Value", "Institutional", "Utility & Energy", "Tech & AI", "Space & Land"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    selectedCategory === cat 
                      ? "bg-red-600 text-white shadow-md shadow-red-500/10" 
                      : `border border-red-500/20 hover:bg-red-500/5 ${theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-800 hover:text-slate-950 font-bold"}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search suffix or use case..."
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none transition-all ${theme === "dark" ? "bg-black/60 border-white/10 text-white focus:border-red-500/40" : "bg-white border-rose-200 text-slate-900 focus:border-red-500"}`}
              />
            </div>
          </div>

          {/* Suffix Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoots.map((root) => (
              <div 
                key={root.suffix}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all ${
                  theme === "dark" 
                    ? "border-white/5 bg-[#120813]/40 hover:border-red-500/20" 
                    : "border-rose-100 bg-white text-slate-800 shadow-md hover:border-red-500/40"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-mono text-lg font-black ${theme === "dark" ? "text-white" : "text-slate-950"}`}>{root.suffix}</span>
                    <span className="bg-rose-500/15 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                      {root.category}
                    </span>
                  </div>
                  
                  <p className={`text-xs leading-relaxed font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-700"}`}>
                    {root.useCase}
                  </p>
                </div>

                <div className={`space-y-2 pt-3 border-t ${theme === "dark" ? "border-white/5" : "border-rose-100"}`}>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={theme === "dark" ? "text-slate-400" : "text-slate-700"}>Valuation Limit:</span>
                    <span className="text-amber-500 font-bold">${(root.valuationUSD / 1e6).toFixed(1)}M USD ({root.multiplier})</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={theme === "dark" ? "text-slate-400" : "text-slate-700"}>Anchor Stack:</span>
                    <span className={theme === "dark" ? "text-slate-300 font-semibold" : "text-slate-900 font-bold"}>{root.structure}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={theme === "dark" ? "text-slate-400" : "text-slate-700"}>Genesis Hash:</span>
                    <span className="text-rose-500 font-bold">{root.genesisHash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Google Cloud Scalability Stack */}
        <section id="google-scale" className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-3xl border border-red-500/20 bg-[#120813]/60 backdrop-blur-xl p-6 space-y-6">
            <h3 className="text-xl font-bold orbitron-title flex items-center gap-2">
              <LineChart className="h-5 w-5 text-red-500" />
              Google TimesFM Edge Forecasting
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              To prevent infrastructure saturation and dynamically evaluate real-world asset (RWA) value flows, we deploy Google's **TimesFM-200m** foundation model. It forecasts system load, pool carrying capacity limits, and pricing curves over a rolling 24-step horizon.
            </p>

            <div className="bg-black/60 rounded-xl p-4 border border-white/5 space-y-3 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">TimesFM Checkpoint:</span>
                <span className="text-slate-300">timesfm-200m-pytorch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GPU Edge Workers:</span>
                <span className="text-emerald-500 font-bold">ONLINE (0.015s inference latency)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Forecast Targets:</span>
                <span className="text-amber-500">.gold commodities comps, .gas capacity limits</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold orbitron-title mb-2 text-white">Strategic Advantage for Investors:</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                By predicting capacity utilization before congestion occurs, our AI automatically adjusts on-chain namespace lease fees using x402 payment membranes, locking in consistent utility yields.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-[#120813]/60 backdrop-blur-xl p-6 space-y-6">
            <h3 className="text-xl font-bold orbitron-title flex items-center gap-2">
              <Database className="h-5 w-5 text-red-500" />
              BigQuery & Vertex AI Swarm Scaling
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              We leverage **Google BigQuery** as our high-throughput transactional audit log repository, storing all namespace registration, transfer, and payout events. Cognitive agent swarms run on **Vertex AI Pipelines**, ensuring real-time operational scale.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-mono block">Data Ingestion</span>
                <span className="text-xs font-bold text-white mt-1 block">BigQuery Write API</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">125,000 events/sec throughput</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-mono block">Agent Swarm Mesh</span>
                <span className="text-xs font-bold text-white mt-1 block">Vertex AI Endpoints</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">22 distributed cognitive twins</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold orbitron-title mb-2 text-white">Security & Audit Compliance:</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Each namespace interaction generates an immutable cryptographic proof record stored in BigQuery. This enables instant regulatory audits of digital estate legacy distributions without compromising client-side private keys.
              </p>
            </div>
          </div>
        </section>

        {/* Live MCP Agent Sandbox */}
        <section className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xl font-bold orbitron-title">Agentic MCP AI Sandbox</h3>
            <p className="text-xs text-slate-900 dark:text-slate-400 leading-relaxed">
              Model Context Protocol (MCP) bridges high-level LLM reasoning with low-level secure workspace executors. Try running a simulated tool trace to see how our agents query BigQuery and write on-chain anchors.
            </p>
            
            <button
              onClick={triggerMcpTrace}
              disabled={mcpRunning}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold py-3 text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mcpRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Tracing MCP Pipeline...
                </>
              ) : (
                <>
                  <Terminal className="h-4 w-4" />
                  Execute Tool Trace
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-red-500/20 bg-slate-950 p-6 relative">
              <div className="absolute top-4 right-4 flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5 text-slate-400">
                <Terminal className="h-4 w-4 text-red-500" />
                MCP Executor Shell Output
              </h4>

              <div className="h-48 overflow-y-auto bg-black/60 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 space-y-2">
                {mcpLogs.map((log, index) => (
                  <div key={index} className={log.includes("[MCP] Calling") ? "text-rose-400" : log.includes("Output:") ? "text-emerald-400" : "text-slate-300"}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-rose-500/10 py-10 mt-16 text-xs text-slate-800 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Unykorn Platform · Sovereign Web3 Infrastructure</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-red-500 transition-all">Home</Link>
            <Link href="/troptions" className="hover:text-red-500 transition-all">Ecosystem Manual</Link>
            <Link href="/registry" className="hover:text-red-500 transition-all">Registry</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Simple fallback spinner for Next.js build
function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
