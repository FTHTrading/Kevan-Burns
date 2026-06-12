"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOG_POSTS } from "./blogData";
import { Sun, Moon, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { JsonLd } from "../components/JsonLd";

export default function BlogHub() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardBg = isDark ? "bg-[#120813]/60 border-white/5" : "bg-white border-rose-100 shadow-md";
  const textMuted = isDark ? "text-slate-400" : "text-slate-800";
  const titleColor = isDark ? "text-white" : "text-slate-955";

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Unykorn Sovereign Web3 Blog",
    description: "Authoritative guides on Web3 namespaces, sovereign identity, digital legacy, and RWA tokenization.",
    url: "https://unykorn.ai/blog",
    author: {
      "@type": "Person",
      name: "Kevan Burns",
      jobTitle: "Founder & CEO",
      worksFor: {
        "@type": "Organization",
        name: "Unykorn",
        url: "https://unykorn.ai"
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
              Unykorn Blog
            </span>
          </Link>
          <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Insights
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
      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10 space-y-12">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/5 text-red-500 dark:text-red-400 text-xs uppercase tracking-widest font-mono">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Sovereign Knowledge Hub</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${titleColor} orbitron-title`}>
            Unykorn Sovereign Infrastructure Blog
          </h1>
          <p className={`${textMuted} text-base max-w-2xl mx-auto leading-relaxed`}>
            Deep dive articles on permanent namespaces, decentralized digital identity, real-world asset (RWA) tokenization, and our Google Cloud scale AI engine.
          </p>
        </div>

        {/* Blog Post List */}
        <div className="grid gap-6">
          {BLOG_POSTS.map((post) => (
            <article 
              key={post.slug} 
              className={`rounded-3xl border p-6 backdrop-blur transition-all duration-300 hover:scale-[1.01] hover:border-red-500/30 ${cardBg}`}
            >
              <Link href={`/blog/${post.slug}`} className="group flex flex-col justify-between h-full gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Unykorn Registry
                    </span>
                    <time className="text-[10px] text-slate-500 font-mono">{post.date}</time>
                  </div>
                  <h2 className={`text-xl font-bold group-hover:text-red-500 transition-colors ${titleColor} orbitron-title`}>
                    {post.title}
                  </h2>
                  <p className={`text-xs sm:text-sm leading-relaxed ${textMuted}`}>
                    {post.excerpt}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-rose-500/5">
                  <span className="text-slate-500 text-[10px] font-mono truncate max-w-[70%]">
                    Tags: {post.keywords}
                  </span>
                  <span className="text-red-500 group-hover:text-red-400 font-bold text-xs flex items-center gap-1 shrink-0">
                    Read article <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
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

      <JsonLd data={blogSchema} />
    </div>
  );
}
