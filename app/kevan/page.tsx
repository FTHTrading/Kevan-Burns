"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Terminal, Shield, Cpu, Database, Award, BookOpen, Calendar, Clock, 
  Mail, MessageSquare, ArrowRight, Check, AlertTriangle, RefreshCw, 
  Send, Globe, Layers, User, Briefcase, FileText, ChevronRight, CheckCircle2,
  Sun, Moon
} from "lucide-react";
import { JsonLd } from "../components/JsonLd";

// Definitive Organization Portfolio Map
const ORGANIZATIONS = [
  {
    name: "FTHTrading",
    purpose: "Core financial, blockchain, and deterministic intelligence systems.",
    highlightRepos: [
      { name: "fth-treasury-stack", lang: "Rust", desc: "Sovereign financial infrastructure monorepo with 56 Rust crates." },
      { name: "troptions-rails", lang: "Solidity/Sol", desc: "9 production multi-chain rails with BridgePayload and golden path flows." },
      { name: "genesis-world", lang: "Rust", desc: "Sovereign Sentience Protocol L0 engine with 12 crates." }
    ]
  },
  {
    name: "kevanbtc",
    purpose: "Original sovereign rails, wallet descriptor structures, and bitcoin integrations.",
    highlightRepos: [
      { name: "forensic-wallet-recovery", lang: "TypeScript", desc: "Multi-sig key derivation and recovery utilities." },
      { name: "btc-multisig-vault", lang: "Go/Python", desc: "Descriptor-based cold storage orchestration tools." }
    ]
  },
  {
    name: "unykornai",
    purpose: "Web3 naming registries, digital legacy vaults, and A5 agent meshes.",
    highlightRepos: [
      { name: "legacy-vault-protocol", lang: "TSX/Rust", desc: "Zero-knowledge private estate OS and 5-Proof release engine." },
      { name: "donk-ai", lang: "TypeScript", desc: "AI voice synthesis, SMS, and Telnyx telephony routing." }
    ]
  },
  {
    name: "y3kmarkets",
    purpose: "Institutional barter-dollar exchange clearinghouse and ledger scaling.",
    highlightRepos: [
      { name: "barter-core", lang: "C++", desc: "Barter market venue order book and clearing engine." },
      { name: "optkas-wallets-infrastructure", lang: "TypeScript", desc: "Custodian-grade wallet infrastructure." }
    ]
  },
  {
    name: "y3kdigital",
    purpose: "Digital twins, custody networks, and real-world asset (RWA) tokenization pipelines.",
    highlightRepos: [
      { name: "rwa-realestate", lang: "Solidity", desc: "Truth-to-TEV Solidity asset valuation contracts." },
      { name: "digital-twin-gas", lang: "Rust", desc: "Macro energy pipeline simulation and metadata anchoring." }
    ]
  }
];

const RESEARCH_PUBLICATIONS = [
  {
    title: "Deterministic Literary Publishing: A Multi-Layer Provenance Model for Verifiable Manuscripts",
    abstract: "Proposes a multi-layer cryptographic model for securing manuscript provenance, content integrity, and permanent peer review. Anchors zero-knowledge proofs (ZKP) to establish unlinkable, verifiable citations.",
    journal: "SSRN & ResearchGate",
    date: "February 2026",
    links: [
      { text: "SSRN Abstract #6241279", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6241279" },
      { text: "ResearchGate Publication", url: "https://www.researchgate.net/publication/403558328_Deterministic_Literary_Publishing_A_Multi-Layer_Provenance_Model_for_Verifiable_Manuscripts" }
    ]
  },
  {
    title: "Apostle-7332: Symmetric Cryptographic Entitlements over Decentralized Barter Membranes",
    abstract: "Defines the x402 payment membrane model, enabling autonomous AI-to-AI micro-payments (AP2) under compliance-gated consensus frameworks without intermediate banks.",
    journal: "Unykorn Protocol Hub",
    date: "March 2026",
    links: [
      { text: "IPFS Specifications CID", url: "https://ipfs.legacychain.app/ipfs/QmTroyUnYkOrn9Rail" }
    ]
  },
  {
    title: "Moltbook Genesis Protocol Macroeconomic Carrying Capacity Simulation",
    abstract: "Defines the carrying capacity boundary and dynamic tax rates of the Genesis Protocol. Simulates energy metabolism (ATP) and inequality stress (Gini Index) across 6,820 independent worlds with a 0.00% divergence rate.",
    journal: "Zenodo & Unykorn Research Group",
    date: "June 2026",
    links: [
      { text: "Zenodo DOI 10.5281/zenodo.18729652", url: "https://doi.org/10.5281/zenodo.18729652" }
    ]
  }
];

const CONSULTATION_SERVICES = [
  {
    id: "arch-review",
    title: "Technical Architecture Consult",
    desc: "Review your multi-chain stack, ZK designs, or Hyperledger/Stellar integration routes.",
    duration: "45 Minutes",
    rate: "Metered via x402"
  },
  {
    id: "estate-zk",
    title: "ZK Estate succession Audit",
    desc: "Configure client-side GCM encryption and custom 5-Proof quorums for family offices.",
    duration: "60 Minutes",
    rate: "Metered via x402"
  },
  {
    id: "barter-setup",
    title: "Barter Membrane Integration",
    desc: "Deploy x402 HTTP billing gateways and configure Google TimesFM dynamic lease pricing.",
    duration: "45 Minutes",
    rate: "Metered via x402"
  }
];

export default function KevanPortfolio() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [selectedService, setSelectedService] = useState("arch-review");
  const [bookingForm, setBookingForm] = useState({ name: "", email: "", details: "" });
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "success" | "error">("idle");
  
  // AI Twin Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { 
      role: "assistant", 
      text: "Connection established. I am Kevan's AI Twin, grounded in the full portfolio of FTH Trading, kevanbtc, and Unykorn. Ask me anything about our 343 builds, SSRN papers, or x402 rails." 
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardBg = isDark ? "bg-[#120813]/60 border-white/5" : "bg-white border-rose-100 shadow-md";
  const textMuted = isDark ? "text-slate-400" : "text-slate-800";
  const titleColor = isDark ? "text-white" : "text-slate-950";
  const textBody = isDark ? "text-slate-300" : "text-slate-900";
  const codeBg = isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-rose-100 shadow-sm";
  const inputBg = isDark ? "bg-black/60 border-white/10 text-white" : "bg-white border-rose-200 text-slate-900";

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.email || isBookingLoading) return;
    setIsBookingLoading(true);
    setBookingStatus("idle");

    try {
      const selectedServiceTitle = CONSULTATION_SERVICES.find(s => s.id === selectedService)?.title || selectedService;
      
      const res = await fetch("/api/ops/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "kevan@unykorn.ai",
          subject: `Consultation Booked: ${selectedServiceTitle}`,
          html: `
            <h3>New Consultation Booking</h3>
            <p><strong>Service:</strong> ${selectedServiceTitle}</p>
            <p><strong>Client Name:</strong> ${bookingForm.name}</p>
            <p><strong>Client Email:</strong> ${bookingForm.email}</p>
            <p><strong>Project Details:</strong> ${bookingForm.details}</p>
            <p><em>This notification was triggered programmatically by the Unykorn AI Twin Scheduler.</em></p>
          `,
          text: `Consultation Booked:\nService: ${selectedServiceTitle}\nName: ${bookingForm.name}\nEmail: ${bookingForm.email}\nDetails: ${bookingForm.details}`
        })
      });

      if (res.ok) {
        setBookingStatus("success");
        setBookingForm({ name: "", email: "", details: "" });
      } else {
        setBookingStatus("error");
      }
    } catch (err) {
      setBookingStatus("error");
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleTwinSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsAiLoading(true);

    try {
      const promptContext = `[Context: Kevan Burns Portfolio Twin Assistant]
You represent Kevan's professional digital twin, running 24/7. You are grounded in:
- SSRN Paper Abstract #6241279, ResearchGate publications.
- 5 organizations: FTHTrading (monorepo fth-treasury-stack, troptions-rails, LVP), kevanbtc (btc multisig, forensic tools), unykornai (naming, donk-ai), y3kmarkets (barter clearing, optkas), y3kdigital (rwa deeds, gas-sims).
- Norcross, GA office address: 5655 Peachtree Parkway.
- Standard email: kevan@unykorn.ai.

Provide clear, professional, ZK-knowledge answers. Do not act like a salesperson.

USER QUESTION: ${userMessage}`;

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
        setChatMessages(prev => [...prev, { role: "assistant", text: "AI Twin Offline: SMTP/Vertex handshake failed." }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: "assistant", text: `AI Twin Offline: ${err.message}` }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const portfolioSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Kevan Burns",
    "jobTitle": "Founder-Architect & Chief Systems Engineer",
    "worksFor": {
      "@type": "Organization",
      "name": "FTH Trading"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "5655 Peachtree Parkway",
      "addressLocality": "Norcross",
      "addressRegion": "GA",
      "postalCode": "30092",
      "addressCountry": "US"
    },
    "url": "https://unykorn.ai/kevan",
    "email": "kevan@unykorn.ai"
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
        Kevan Burns • Founder-Architect & Chief Systems Engineer • Norcross GA • Active 24/7 AI Twin
      </span>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.10]" 
           style={{
             backgroundImage: "linear-gradient(#ff3c69 1px, transparent 1px), linear-gradient(90deg, #ff3c69 1px, transparent 1px)",
             backgroundSize: "36px 36px"
           }} 
      />

      <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-20 relative border-b border-rose-500/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-red-600 to-rose-400 bg-clip-text text-transparent orbitron-title">
              Kevan Burns
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Sovereign OS Architect
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
          <Link href="/research" className="text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-500 px-4 py-2 rounded-xl transition-all">
            Research Hub
          </Link>
          <Link href="/registry" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-4 py-2 text-xs transition-all shadow-md">
            Enter Cockpit
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10 space-y-12">
        
        {/* Bio Hero */}
        <section className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/25 bg-rose-500/5 text-rose-500 dark:text-rose-400 text-xs uppercase tracking-widest font-mono">
              <User className="h-3.5 w-3.5" />
              <span>Founder & Chief Systems Engineer</span>
            </div>
            <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${titleColor} orbitron-title`}>
              Designing Sovereign Financial & Intelligence Systems
            </h1>
            <p className={`${textBody} text-sm sm:text-base leading-relaxed max-w-3xl`}>
              I design and operate multi-layered financial, blockchain, and intelligence networks—turning complex cryptographic primitives into production-ready products. Headquartered in the Norcross Technology Park (GA), I engineer deterministic solutions for wealth preservation, digital legacy vaults, and barter-dollar clearing.
            </p>
          </div>
          <div className="md:col-span-4">
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
              <h3 className={`text-xs font-bold ${titleColor} uppercase tracking-wider orbitron-title`}>Contact & Anchor</h3>
              <ul className="text-xs space-y-2.5 font-mono">
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-rose-500" />
                  <span>5655 Peachtree Pkwy, Norcross, GA</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-rose-500" />
                  <a href="mailto:kevan@unykorn.ai" className="hover:underline">kevan@unykorn.ai</a>
                </li>
                <li className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-rose-500" />
                  <span>Github: @FTHTrading</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Organizations & Repos Split */}
        <section className="space-y-6">
          <h2 className={`text-2xl font-bold ${titleColor} orbitron-title border-b border-rose-500/5 pb-2`}>
            Organization & Repository Matrix
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ORGANIZATIONS.map((org, index) => (
              <div key={index} className={`p-6 rounded-3xl border ${cardBg} space-y-4 flex flex-col justify-between`}>
                <div className="space-y-2">
                  <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {org.name}
                  </span>
                  <p className="text-xs text-slate-500">{org.purpose}</p>
                </div>
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Highlighted Repositories</span>
                  {org.highlightRepos.map((repo, rIdx) => (
                    <div key={rIdx} className={`p-3 rounded-xl ${codeBg} space-y-1`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-rose-300">{repo.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{repo.lang}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{repo.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Research & Publications */}
        <section className="space-y-6">
          <h2 className={`text-2xl font-bold ${titleColor} orbitron-title border-b border-rose-500/5 pb-2`}>
            Key Research & Scientific Publications
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {RESEARCH_PUBLICATIONS.map((pub, idx) => (
              <div key={idx} className={`p-6 rounded-3xl border ${cardBg} space-y-4 flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full font-bold uppercase">
                      {pub.journal}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{pub.date}</span>
                  </div>
                  <h3 className={`font-bold text-sm ${titleColor}`}>{pub.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{pub.abstract}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {pub.links.map((link, lIdx) => (
                    <a key={lIdx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold border border-red-500/20 hover:bg-red-500/10 text-red-500 px-3 py-1.5 rounded-xl transition-all">
                      {link.text} ↗
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Booking & AI twin */}
        <section className="grid lg:grid-cols-12 gap-8">
          
          {/* Scheduling Console (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-6`}>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider">
                  <Calendar className="h-2.5 w-2.5" />
                  AI Twin Scheduler
                </div>
                <h3 className={`text-xl font-bold ${titleColor} orbitron-title`}>Consultation & Attestation Services</h3>
                <p className="text-xs text-slate-500">
                  Select a metered service below to coordinate directly with my office. All bookings automatically trigger SMTP notifications to my queue.
                </p>
              </div>

              {/* Service Selection */}
              <div className="grid sm:grid-cols-3 gap-3">
                {CONSULTATION_SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedService === service.id 
                        ? "bg-red-500/10 border-red-500/40 text-white" 
                        : "border-white/5 bg-black/10 hover:bg-black/20 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold">{service.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">{service.desc}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-rose-500/5 text-[9px] font-mono text-slate-500">
                      <span>{service.duration}</span>
                      <span className="text-rose-400 font-bold">{service.rate}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4 border-t border-rose-500/5 pt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="Name"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full ${inputBg} rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500/40`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</label>
                    <input 
                      type="email"
                      required
                      placeholder="Email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full ${inputBg} rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500/40`}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Project / Consultation Details</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe your architecture requirements..."
                    value={bookingForm.details}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, details: e.target.value }))}
                    className={`w-full ${inputBg} rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500/40 resize-none`}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    {bookingStatus === "success" && (
                      <div className="text-xs text-emerald-500 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="h-4 w-4" /> Booking notification sent!
                      </div>
                    )}
                    {bookingStatus === "error" && (
                      <div className="text-xs text-rose-500 flex items-center gap-1 font-bold">
                        <AlertTriangle className="h-4 w-4" /> Failed to send notification.
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isBookingLoading}
                    className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-5 py-2.5 text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    {isBookingLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* AI Twin Chat (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
              <div className="flex items-center justify-between border-b border-rose-500/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className={`text-sm font-bold ${titleColor} orbitron-title`}>
                      Kevan's AI Twin
                    </h3>
                    <p className="text-[10px] text-slate-500">Grounded Portfolio Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">Grounded</span>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="h-56 overflow-y-auto p-4 rounded-2xl bg-black/20 space-y-3 scrollbar-thin text-xs">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-2.5 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
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
                  <div className="flex gap-2.5 max-w-[90%] mr-auto">
                    <div className="h-6.5 w-6.5 rounded-full bg-purple-900/60 border border-purple-500/25 flex items-center justify-center text-pink-300 text-xs shrink-0">
                      🦄
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/5 text-red-400 flex items-center gap-1.5">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Twin mapping codebase...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Form */}
              <form onSubmit={handleTwinSendMessage} className="flex gap-2">
                <input
                  type="text"
                  required
                  disabled={isAiLoading}
                  placeholder="Ask Kevan's Twin about the repos or SSRN..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className={`flex-1 ${inputBg} rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500/40`}
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !chatInput.trim()}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-3 py-2 text-xs transition-all shadow-md shrink-0 flex items-center justify-center"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-rose-500/10 py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Kevan Burns · Sovereign Web3 Infrastructure Architect</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-red-500 transition-all">Home</Link>
            <Link href="/about" className="hover:text-red-500 transition-all">About</Link>
            <Link href="/research" className="hover:text-red-500 transition-all">Research Portal</Link>
          </div>
        </div>
      </footer>

      <JsonLd data={portfolioSchema} />
    </div>
  );
}
