"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BLOG_POSTS } from "../blogData";
import { Sun, Moon, ArrowLeft, Calendar, BookOpen, Clock } from "lucide-react";
import { use } from "react";

export const runtime = "edge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const post = BLOG_POSTS.find((p) => p.slug === resolvedParams.slug);

  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardBg = isDark ? "bg-[#120813]/60 border-white/5" : "bg-white border-rose-100 shadow-md";
  const textMuted = isDark ? "text-slate-400" : "text-slate-850";
  const titleColor = isDark ? "text-white" : "text-slate-950";
  const textBody = isDark ? "text-slate-300" : "text-slate-900";

  if (!post) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgStyle}`}>
        <p className="text-xl font-bold">Post not found</p>
        <Link href="/blog" className="text-red-500 mt-4 underline">Back to Blog</Link>
      </div>
    );
  }

  // Split content into paragraphs for clean rendering
  const paragraphs = post.content
    .split("\n\n")
    .filter((p) => p.trim().length > 0)
    .map((p) => {
      const trimmed = p.trim();
      if (trimmed.startsWith("# ")) return { type: "h1", text: trimmed.substring(2) };
      if (trimmed.startsWith("## ")) return { type: "h2", text: trimmed.substring(3) };
      if (trimmed.startsWith("### ")) return { type: "h3", text: trimmed.substring(4) };
      if (trimmed.startsWith("* ")) {
        return { 
          type: "list", 
          items: trimmed.split("\n* ").map(item => item.replace(/^\* /, "")) 
        };
      }
      return { type: "p", text: trimmed };
    });

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
            Article
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
      <main className="max-w-3xl mx-auto px-6 py-16 relative z-10 space-y-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to all articles
        </Link>

        {/* Article Meta */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-red-500" /> {post.date}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-red-500" /> Unykorn Registry
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-red-500" /> 4 min read
            </span>
          </div>

          <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${titleColor} orbitron-title leading-tight`}>
            {post.title}
          </h1>

          <p className="text-slate-500 text-xs font-mono">
            Tags: {post.keywords}
          </p>
        </div>

        {/* Dynamic content rendering with rich typography */}
        <div className={`space-y-6 text-sm sm:text-base leading-relaxed ${textBody} ${cardBg} p-8 rounded-3xl`}>
          {paragraphs.map((item, idx) => {
            if (item.type === "h1") return null; // already rendered title
            if (item.type === "h2") {
              return (
                <h2 key={idx} className={`text-xl sm:text-2xl font-bold ${titleColor} pt-4 border-b border-rose-500/5 pb-2 orbitron-title`}>
                  {item.text}
                </h2>
              );
            }
            if (item.type === "h3") {
              return (
                <h3 key={idx} className={`text-lg font-bold ${titleColor} pt-2`}>
                  {item.text}
                </h3>
              );
            }
            if (item.type === "list") {
              return (
                <ul key={idx} className="list-disc list-inside pl-4 space-y-2">
                  {item.items?.map((li, liIdx) => (
                    <li key={liIdx}>{li}</li>
                  ))}
                </ul>
              );
            }
            return <p key={idx}>{item.text}</p>;
          })}
        </div>

        {/* CTA */}
        <div className={`p-8 rounded-3xl border border-red-500/20 text-center space-y-4 ${cardBg}`}>
          <h3 className={`text-lg font-bold ${titleColor} orbitron-title`}>Secure Your Sovereign Digital Identity Today</h3>
          <p className={`text-xs ${textMuted} max-w-lg mx-auto`}>
            Claim your permanent namespace, set up client-side encrypted estate planning vaults, and connect to Solana & Stellar.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold px-4 py-2 text-xs transition-all">
              Claim Namespace
            </Link>
            <Link href="/registry" className="rounded-xl border border-red-500/20 hover:bg-white/5 font-bold px-4 py-2 text-xs transition-all">
              Enter Cockpit
            </Link>
          </div>
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
    </div>
  );
}
