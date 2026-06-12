"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, Moon, Sparkles, Shield, Award, Users, BookOpen } from "lucide-react";
import { JsonLd } from "../components/JsonLd";

export default function AboutPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardBg = isDark ? "bg-[#120813]/60 border-white/5" : "bg-white border-rose-100 shadow-md";
  const textMuted = isDark ? "text-slate-400" : "text-slate-800";
  const titleColor = isDark ? "text-white" : "text-slate-950";
  const textBody = isDark ? "text-slate-300" : "text-slate-900";

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "LocalBusiness",
      name: "Unykorn",
      url: "https://unykorn.ai",
      logo: "https://unykorn.ai/images/legacy/logo-nav.png",
      founder: {
        "@type": "Person",
        name: "Kevan Burns"
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "5655 Peachtree Parkway",
        addressLocality: "Norcross",
        addressRegion: "GA",
        postalCode: "30092",
        addressCountry: "US"
      }
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
              About Unykorn
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Founder & Story
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
      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10 space-y-16">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/5 text-red-500 dark:text-red-400 text-xs uppercase tracking-widest font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sovereign Web3 Infrastructure</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${titleColor} orbitron-title`}>
            The Unykorn Story & Founder
          </h1>
          <p className={`${textMuted} text-base max-w-2xl mx-auto leading-relaxed`}>
            Unykorn is a global Web3 platform pioneering permanent namespaces, digital legacy inheritance, and real-world asset tokenization across Solana and Stellar.
          </p>
        </div>

        {/* Story Section */}
        <section className={`rounded-3xl border p-8 backdrop-blur space-y-6 ${cardBg}`}>
          <h2 className={`text-2xl font-bold ${titleColor} orbitron-title border-b border-rose-500/5 pb-2`}>
            Our Evolution Since 2011
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed ${textBody}`}>
            Long before the advent of modern blockchains or smart contracts, Unykorn's founder, **Kevan Burns**, began developing alternative digital barter architectures, accounting frameworks, and credit-unit networks in 2004, transitioning to building sovereign Web3 infrastructure in 2011. The core thesis was simple: the internet lacks a native identity and payment settlement layer. 
          </p>
          <p className={`text-sm sm:text-base leading-relaxed ${textBody}`}>
            Over the years, those early barter designs evolved to incorporate decentralized ledger tech. In 2026, Unykorn operates as a comprehensive sovereign Web3 ecosystem. By separating high-frequency application logic (on Solana) from institutional compliance (on Stellar), we deliver a dual-chain network that keeps users in complete control of their digital presence.
          </p>
        </section>

        {/* Moltbook Genesis Protocol */}
        <section className={`rounded-3xl border p-8 backdrop-blur space-y-6 ${cardBg}`}>
          <h2 className={`text-2xl font-bold ${titleColor} orbitron-title border-b border-rose-500/5 pb-2`}>
            Moltbook Genesis Protocol
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed ${textBody}`}>
            A core component of Unykorn's sovereign infrastructure is the **Moltbook Genesis Protocol** — a deterministic macroeconomic simulation engine. Designed to evaluate network health, carrying capacity limits, and pricing curves before on-chain deployment, Moltbook consists of 13 modular Rust crates and 396 automated tests, simulating over 6,820 independent worlds.
          </p>
        </section>

        {/* Key Published Works */}
        <section className={`rounded-3xl border p-8 backdrop-blur space-y-6 ${cardBg}`}>
          <h2 className={`text-2xl font-bold ${titleColor} orbitron-title border-b border-rose-500/5 pb-2`}>
            Key Published Works
          </h2>
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="border-l-2 border-amber-500 pl-4 space-y-1">
              <h3 className={`font-bold ${titleColor}`}>“Deterministic Literary Publishing: A Multi-Layer Provenance Model for Verifiable Manuscripts”</h3>
              <p className={textMuted}>By Kevan Burns — February 2026</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 font-mono text-[11px] text-red-500">
                <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6241279" target="_blank" rel="noopener noreferrer" className="hover:underline">SSRN Abstract</a>
                <a href="https://www.researchgate.net/publication/403558328_Deterministic_Literary_Publishing_A_Multi-Layer_Provenance_Model_for_Verifiable_Manuscripts" target="_blank" rel="noopener noreferrer" className="hover:underline">ResearchGate Publication</a>
              </div>
            </div>
          </div>
        </section>

        {/* Georgia estate info */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className={`rounded-3xl border p-8 backdrop-blur space-y-4 ${cardBg}`}>
            <h3 className={`text-lg font-bold ${titleColor} flex items-center gap-2`}>
              <Shield className="h-5 w-5 text-red-500" /> Physical & Digital Trust
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${textMuted}`}>
              Unykorn coordinates physical real estate and commodity titles (such as Zurich vault gold) with permanent on-chain metadata. Headquartered at <strong>5655 Peachtree Parkway, Norcross, GA 30092</strong> (Technology Park / Peachtree Corners), we serve Atlanta Metro families looking to bypass the Gwinnett County probate court delays.
            </p>
          </div>
          <div className={`rounded-3xl border p-8 backdrop-blur space-y-4 ${cardBg}`}>
            <h3 className={`text-lg font-bold ${titleColor} flex items-center gap-2`}>
              <Award className="h-5 w-5 text-red-500" /> Verified Credentials
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${textMuted}`}>
              Our Legacy Vault uses client-side AES-256-GCM encryption and ZK (Zero-Knowledge) PLONK proofs. By implementing a 5-Proof Release Protocol + Dead Man's Switch, Unykorn ensures secure digital asset inheritance without intermediate trustees or exposure of private keys.
            </p>
          </div>
        </section>

        {/* Pricing Tiers summary */}
        <section className={`rounded-3xl border p-8 backdrop-blur text-center space-y-6 ${cardBg}`}>
          <h3 className={`text-xl font-bold ${titleColor} orbitron-title`}>Simple, Transparent Pricing</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-black/10 dark:bg-black/40 border border-rose-500/5">
              <span className="text-xs text-red-500 font-bold font-mono">ESSENTIAL</span>
              <h4 className={`text-base font-bold ${titleColor} mt-1`}>$29.95 / mo</h4>
              <p className="text-[11px] text-slate-500 mt-2">Core namespace and legacy succession protection for single estates.</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/10 dark:bg-black/40 border border-rose-500/5">
              <span className="text-xs text-red-500 font-bold font-mono">PREMIUM</span>
              <h4 className={`text-base font-bold ${titleColor} mt-1`}>$49.95 / mo</h4>
              <p className="text-[11px] text-slate-500 mt-2">Up to 5 vaults, business document anchoring, and white-glove setup.</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/10 dark:bg-black/40 border border-rose-500/5">
              <span className="text-xs text-red-500 font-bold font-mono">ELITE TRUST</span>
              <h4 className={`text-base font-bold ${titleColor} mt-1`}>$89.95 / mo</h4>
              <p className="text-[11px] text-slate-500 mt-2">Advanced ZK quorums, multi-sig heir allocations, and corporate vaulting.</p>
            </div>
          </div>
          <div className="pt-2">
            <Link href="/" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-5 py-3 text-xs transition-all shadow-md">
              Start Free Registry Preview
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

      <JsonLd data={aboutSchema} />
    </div>
  );
}
