"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Globe, Shield, FileText, Wallet, Search, ArrowRight,
  Terminal, Sparkles, Send, Moon, Sun, Info, HelpCircle,
  Database, Network, Cpu, Lock, HelpCircle as HelpIcon,
  Plus, Check, Award, Coins, Zap, RefreshCw, Download,
  Scale, Layers, TrendingUp, Key, Activity, ArrowUpRight
} from "lucide-react";

type TabType = "bracket" | "nft" | "extension" | "compliance" | "registry";

interface TeamDetail {
  name: string;
  seed: string;
  bracket: 1 | 2;
  stats: { w: number; l: number; hr: number; era: number };
  roster: string[];
  pipeline: string;
  nilWorth: string;
}

interface DynamicNFTState {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  image: string;
  level: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  homeRuns: number;
  rbi: number;
  strikeouts: number;
  cwsStage: "Regional" | "Super Regional" | "Omaha Bound" | "Championship";
  milestones: string[];
}

export default function CwsClient() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<TabType>("bracket");

  // TROY AI Voice assistant states
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState(
    "Welcome to the Omaha On-Chain Hub, boss. I can query team scouting feeds, fetch dynamic NFT metadata layouts, simulate Token-2022 minting states, or generate RUFADAA-compliant NIL trust deeds. What are we building first?"
  );
  const [aiLoading, setAiLoading] = useState(false);

  // Factions Suffix States
  const [suffixInput, setSuffixInput] = useState("");
  const [claimOutput, setClaimOutput] = useState("Search a collegiate handle to preview routing lanes.");

  // NIL Generator States
  const [nilName, setNilName] = useState("Daniel Jackson");
  const [nilSchool, setNilSchool] = useState("Georgia Bulldogs");
  const [nilMonthly, setNilMonthly] = useState("12500");
  const [nilStatus, setNilStatus] = useState("idle");
  const [nilDeed, setNilDeed] = useState("");

  // Simulated live blocks
  const [blockHeight, setBlockHeight] = useState(12982105);
  const [txCount, setTxCount] = useState(452);

  useEffect(() => {
    document.title = "CWS On-Chain Empire | Road to Omaha Protocol";
    const timer = setInterval(() => {
      setBlockHeight((h) => h + 1);
      setTxCount((t) => t + Math.floor(Math.random() * 8) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // CWS 2026 Teams Database
  const teams: Record<string, TeamDetail> = {
    troy: {
      name: "Troy Trojans",
      seed: "Sun Belt Champ",
      bracket: 1,
      stats: { w: 46, l: 18, hr: 88, era: 3.42 },
      roster: ["Tyler Vance (SS)", "Jake Vance (P)", "Marcus Cole (C)", "Cody Bell (OF)"],
      pipeline: "Sun Belt / Alabama Pipelines",
      nilWorth: "$145,000"
    },
    wvu: {
      name: "West Virginia Mountaineers",
      seed: "Big 12 Regular Season",
      bracket: 1,
      stats: { w: 43, l: 20, hr: 74, era: 3.98 },
      roster: ["Logan Vance (P)", "Sam Miller (OF)", "Derek King (INF)"],
      pipeline: "Mid-Atlantic / Ohio Pipelines",
      nilWorth: "$120,000"
    },
    unc: {
      name: "North Carolina Tar Heels",
      seed: "ACC Tournament Champ",
      bracket: 1,
      stats: { w: 48, l: 14, hr: 96, era: 3.12 },
      roster: ["Alex Vance (3B)", "Luke Davis (OF)", "Gavin Gallaher (SS)"],
      pipeline: "East Coast / North Carolina Recruits",
      nilWorth: "$210,000"
    },
    olemiss: {
      name: "Ole Miss Rebels",
      seed: "SEC Wildcard Pool",
      bracket: 1,
      stats: { w: 42, l: 22, hr: 91, era: 4.15 },
      roster: ["Sam Vance (OF)", "Hunter Elliott (P)", "TJ McCants (OF)"],
      pipeline: "Mississippi / Texas Pipelines",
      nilWorth: "$185,000"
    },
    oklahoma: {
      name: "Oklahoma Sooners",
      seed: "Big 12 Champ",
      bracket: 2,
      stats: { w: 45, l: 19, hr: 82, era: 3.75 },
      roster: ["Matt Vance (OF)", "Jackson Nicklaus (INF)", "Easton Carmichael (C)"],
      pipeline: "Oklahoma / Texas Pipeline",
      nilWorth: "$195,000"
    },
    alabama: {
      name: "Alabama Crimson Tide",
      seed: "SEC Tournament Runner-up",
      bracket: 2,
      stats: { w: 44, l: 21, hr: 85, era: 3.82 },
      roster: ["Chris Vance (P)", "Mac Guscette (C)", "Justin Lebron (SS)"],
      pipeline: "Georgia / Florida / Alabama Pipelines",
      nilWorth: "$220,000"
    },
    texas: {
      name: "Texas Longhorns",
      seed: "SEC Regular Season Runner-up",
      bracket: 2,
      stats: { w: 47, l: 16, hr: 104, era: 3.25 },
      roster: ["Zach Vance (1B)", "Jalin Flores (SS)", "Kimble Schuessler (C)"],
      pipeline: "Texas / California Pipelines",
      nilWorth: "$310,000"
    },
    georgia: {
      name: "Georgia Bulldogs",
      seed: "SEC Top Seed / Transfer Pool",
      bracket: 2,
      stats: { w: 49, l: 13, hr: 120, era: 3.05 },
      roster: ["Daniel Jackson (OF - Transfer)", "Slate Alford (3B)", "Charlie Condon (INF/OF)"],
      pipeline: "Georgia / Transfer Portal Specialists",
      nilWorth: "$450,000"
    }
  };

  const [selectedTeam, setSelectedTeam] = useState<string>("georgia");

  // Dynamic Token Extension NFT State
  const [nftState, setNftState] = useState<DynamicNFTState>({
    mint: "57VqZpdg...Token2022MintAddress",
    name: "Daniel Jackson - Dynamic Card",
    symbol: "CWS-DJ",
    uri: "ipfs://QmDanielJacksonBaseMetadataJSON",
    image: "https://images.unsplash.com/photo-1544045560-7297be6472ff?w=400&q=80",
    level: 1,
    rarity: "Common",
    homeRuns: 0,
    rbi: 0,
    strikeouts: 0,
    cwsStage: "Regional",
    milestones: ["Regional Champion"]
  });

  const [nftLogs, setNftLogs] = useState<string[]>([
    "[Token-2022] Evolving NFT minted with MetadataPointer pointing to self.",
    "[Token-2022] Initial TLV fields initialized: home_runs=0, rbi=0, stage=Regional."
  ]);

  const [isMinting, setIsMinting] = useState(false);

  // Evolve Action
  const triggerStatMutation = (stat: "hr" | "rbi" | "so" | "stage") => {
    setNftState((prev) => {
      let nextHr = prev.homeRuns;
      let nextRbi = prev.rbi;
      let nextSo = prev.strikeouts;
      let nextStage = prev.cwsStage;
      let nextLevel = prev.level;
      let nextRarity = prev.rarity;
      let nextMilestones = [...prev.milestones];
      let newLog = "";

      if (stat === "hr") {
        nextHr += 1;
        nextRbi += Math.floor(Math.random() * 3) + 1;
        newLog = `[Oracle Trigger] Player recorded Home Run! Updating home_runs to ${nextHr}, rbi to ${nextRbi}.`;
        
        if (nextHr >= 5 && prev.level < 2) {
          nextLevel = 2;
          nextRarity = "Rare";
          nextMilestones.push("Power Hitter Upgrade");
          newLog += " Level Up! Evolved to Level 2 (Rare).";
        }
      } else if (stat === "rbi") {
        nextRbi += 1;
        newLog = `[Oracle Trigger] RBI registered. Updating rbi to ${nextRbi}.`;
      } else if (stat === "so") {
        nextSo += 1;
        newLog = `[Oracle Trigger] Pitcher Strikeout registered. Updating strikeouts to ${nextSo}.`;
      } else if (stat === "stage") {
        const stages: DynamicNFTState["cwsStage"][] = ["Regional", "Super Regional", "Omaha Bound", "Championship"];
        const curIdx = stages.indexOf(prev.cwsStage);
        if (curIdx < 3) {
          nextStage = stages[curIdx + 1];
          nextLevel += 1;
          newLog = `[Bracket Oracle] Team advanced to ${nextStage}! Evolving card layout. Level Up to ${nextLevel}.`;
          
          if (nextStage === "Omaha Bound") {
            nextRarity = "Epic";
            nextMilestones.push("Omaha Qualified");
          } else if (nextStage === "Championship") {
            nextRarity = "Legendary";
            nextMilestones.push("CWS Finalist");
          }
        } else {
          newLog = `[Bracket Oracle] Evolving NFT already reached ultimate Championship stage.`;
        }
      }

      setNftLogs((logs) => [newLog, ...logs.slice(0, 10)]);

      // Request TROY guide voice update
      setAiResponse(
        `Scouting metrics processed. ${prev.name} has evolved to ${nextRarity} (Level ${nextLevel}) with ${nextHr} HRs and ${nextRbi} RBIs at the ${nextStage} stage. Dynamic on-chain extensions successfully updated.`
      );

      return {
        ...prev,
        homeRuns: nextHr,
        rbi: nextRbi,
        strikeouts: nextSo,
        cwsStage: nextStage,
        level: nextLevel,
        rarity: nextRarity,
        milestones: nextMilestones
      };
    });
  };

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    setAiLoading(true);
    setAiResponse("Scouting Unykorn Omaha data feeds...");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `CWS Omaha scouting: ${aiInput}` }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.content);
      } else {
        setAiResponse("TROY AI could not reach the collegiate feed server.");
      }
    } catch {
      setAiResponse("Connection to TROY AI timed out.");
    } finally {
      setAiLoading(false);
      setAiInput("");
    }
  };

  const handleClaimPreview = () => {
    const name = suffixInput.trim().replace(/\s+/g, "");
    if (!name) {
      setClaimOutput("Enter a faction prefix (e.g. Dawgs, Trojans, Mountaineers).");
      return;
    }
    setClaimOutput(`Omaha Faction Suffix preview for ".${name.toLowerCase()}":
- Fan Club: register.${name.toLowerCase()} (Solana non-transferable SFT)
- NIL Escrow: vault.${name.toLowerCase()} (Stellar legal RWA trust hook)
- Dynamic Feed: live.${name.toLowerCase()} (Model Context Protocol stream)`);
  };

  const handleGenerateNil = () => {
    setNilStatus("generating");
    setTimeout(() => {
      const output = `==========================================================
NIL SOVEREIGN COMPLIANCE DEED (RUFADAA / OCGA § 53-13)
==========================================================
ATHLETE: ${nilName}
AFFILIATION: ${nilSchool}
ESCROW HOLDING: $${parseInt(nilMonthly).toLocaleString()} USD Equivalent
ROUTING: did:unykorn:nil:${nilName.toLowerCase().replace(/\s+/g, "-")}
VAULT HASH: 0x9b3fecb27a8dc0e5bc86edae42aee402e187

TERMS:
1. All licensing assets, image rights, and player metrics are verified
   client-side with AES-256-GCM.
2. Settlement executes via metered x402 membranes.
3. Trust deed anchored to Hyperledger Besu AuditLog.
4. RUFADAA succession fallback enabled for designated heirs.

AUTHENTICATION:
[Solana Signature: did:unykorn:sol:${Math.random().toString(36).substring(7)}]
[Stellar Hash Pointer: did:unykorn:stellar:${Math.random().toString(36).substring(7)}]
`;
      setNilDeed(output);
      setNilStatus("success");
      setAiResponse(`NIL compliance deed compiled for ${nilName}. Safe client-side encryption is complete. Ready to anchor.`);
    }, 1200);
  };

  const isDark = theme === "dark";

  const mainBg = isDark ? "bg-[#09040a] text-[#ffdce6]" : "bg-[#fbf5f6] text-[#250d14]";
  const cardStyle = isDark ? "bg-[#120813]/60 border-red-500/20 text-[#ffdce6]" : "bg-white/90 border-red-200 text-slate-800";
  const subCardStyle = isDark ? "bg-black/40 border-white/5" : "bg-[#f9f2f3] border-red-500/10";
  const textTitle = isDark ? "text-white" : "text-[#250d14]";
  const textMuted = isDark ? "text-slate-400" : "text-slate-650";
  const terminalBg = isDark ? "bg-black/90 text-amber-400 border-white/10" : "bg-slate-900 text-amber-300 border-slate-950";
  const inputBg = isDark ? "bg-black/55 border-white/10 text-white" : "bg-white border-slate-300 text-slate-900";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${mainBg}`}>
      
      {/* Live sports ticker / trust bar */}
      <div className={`border-b px-4 py-2 text-center transition-colors duration-200 relative z-30 ${
        isDark ? "bg-rose-950/40 border-rose-500/20 text-rose-300" : "bg-rose-50 border-rose-200/60 text-rose-800 font-bold"
      }`}>
        <span className="text-[10px] sm:text-xs font-mono tracking-wider flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            2026 ROAD TO OMAHA ORACLE ACTIVE
          </span>
          <span>SOL BLOCK: {blockHeight}</span>
          <span>MEMBERSHIP MINT: ACTIVE</span>
          <span>FOUNDED BY KEVAN BURNS</span>
        </span>
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.12]" 
           style={{
             backgroundImage: "linear-gradient(#f43f5e 1px, transparent 1px), linear-gradient(90deg, #f43f5e 1px, transparent 1px)",
             backgroundSize: "40px 40px"
           }} 
      />

      {/* Radiant Glow Spheres */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none bg-rose-600/10 dark:bg-rose-600/15" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] rounded-full blur-[160px] pointer-events-none bg-orange-600/5 dark:bg-orange-600/10" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20 relative border-b border-rose-500/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-orange-600 to-rose-400 bg-clip-text text-transparent orbitron-title">
              Omaha On-Chain
            </span>
          </Link>
          <span className="bg-orange-500/10 text-orange-500 border border-orange-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Token-2022
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border border-rose-500/20 hover:border-rose-500/40 bg-white/5 backdrop-blur transition-all"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-rose-600" />}
          </button>
          <Link href="/" className="text-xs font-bold border border-rose-500/20 hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all">
            Command Hub
          </Link>
          <a href="#troy-scout" className="rounded-xl bg-gradient-to-r from-orange-600 to-rose-500 hover:from-orange-500 hover:to-rose-400 text-white font-bold px-4 py-2 text-xs transition-all shadow-md">
            Ask TROY Scout
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/25 bg-orange-500/5 text-orange-500 text-xs uppercase tracking-widest font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Collegiate Sports Real-World Asset Protocol</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none orbitron-title text-slate-900 dark:text-white">
            CWS Omaha On-Chain Empire
          </h1>
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-300 leading-relaxed">
            Minting dynamic, stats-evolving player cards and relics on Solana via **Token-2022 extensions**. Evolve stats, register custom collegiate fan suffixes, and anchor compliant NIL deeds securely.
          </p>
        </div>

        {/* Dynamic Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-rose-500/10 pb-4">
          {[
            { id: "bracket", label: "Omaha Bracket & Teams", icon: <Globe className="h-4 w-4" /> },
            { id: "nft", label: "Evolving NFT Simulator", icon: <Award className="h-4 w-4" /> },
            { id: "extension", label: "Token-2022 Extension view", icon: <Cpu className="h-4 w-4" /> },
            { id: "compliance", label: "NIL Legal Vault", icon: <Scale className="h-4 w-4" /> },
            { id: "registry", label: "Faction Suffix Search", icon: <Network className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-600 to-rose-500 text-white shadow-md"
                  : isDark ? "bg-slate-900/60 border border-white/5 hover:text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Interface Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">

            {/* 1. BRACKET & TEAMS EXPLORER */}
            {activeTab === "bracket" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>2026 Omaha bracket & rosters</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Select a team to query their official Sun Belt/SEC stats, roster pipelines, and estimated NIL valuation pools.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {Object.keys(teams).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTeam(key)}
                      className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${
                        selectedTeam === key
                          ? "border-orange-500 bg-orange-500/10 text-orange-500 font-bold"
                          : isDark ? "bg-black/30 border-white/5 hover:border-white/20" : "bg-white border-slate-200 hover:border-slate-350"
                      }`}
                    >
                      <strong className="block text-xs uppercase tracking-wider">{teams[key].name.split(" ")[0]}</strong>
                      <span className="text-[9px] text-slate-500">{teams[key].seed}</span>
                    </button>
                  ))}
                </div>

                {/* Team Details Output */}
                <div className={`rounded-2xl border p-5 grid sm:grid-cols-2 gap-6 ${subCardStyle}`}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500">Scouting Profile</h4>
                      <h3 className={`text-2xl font-black ${textTitle} mt-0.5`}>{teams[selectedTeam].name}</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Bracket Group {teams[selectedTeam].bracket}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className={`rounded-lg p-2 border ${isDark ? "bg-black/30" : "bg-white"}`}>
                        <span className="text-[8px] text-slate-500 block">WINS</span>
                        <strong className="text-sm text-emerald-400">{teams[selectedTeam].stats.w}</strong>
                      </div>
                      <div className={`rounded-lg p-2 border ${isDark ? "bg-black/30" : "bg-white"}`}>
                        <span className="text-[8px] text-slate-500 block">LOSSES</span>
                        <strong className="text-sm text-rose-400">{teams[selectedTeam].stats.l}</strong>
                      </div>
                      <div className={`rounded-lg p-2 border ${isDark ? "bg-black/30" : "bg-white"}`}>
                        <span className="text-[8px] text-slate-500 block">HR</span>
                        <strong className="text-sm text-orange-400">{teams[selectedTeam].stats.hr}</strong>
                      </div>
                      <div className={`rounded-lg p-2 border ${isDark ? "bg-black/30" : "bg-white"}`}>
                        <span className="text-[8px] text-slate-500 block">ERA</span>
                        <strong className="text-sm text-blue-400">{teams[selectedTeam].stats.era}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Pipeline Origin</span>
                      <p className="text-xs mt-0.5">{teams[selectedTeam].pipeline}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Team Roster</span>
                      <ul className="text-xs space-y-1.5 mt-2">
                        {teams[selectedTeam].roster.map((player, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            <span>{player}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`rounded-xl border p-3.5 flex justify-between items-center ${isDark ? "bg-black/20" : "bg-white"}`}>
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase font-bold">Estimated NIL Value Pool</span>
                        <strong className="text-lg font-black text-emerald-400">{teams[selectedTeam].nilWorth}</strong>
                      </div>
                      <Award className="h-8 w-8 text-orange-500 opacity-60" />
                    </div>
                  </div>
                </div>

                {/* Bracket Layout Preview */}
                <div className="mt-8 border-t border-rose-500/10 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Bracket Progression (2026 Omaha Setup)</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className={`border p-4 rounded-xl space-y-2 ${isDark ? "bg-black/20" : "bg-white"}`}>
                      <p className="font-bold text-orange-500 border-b border-white/5 pb-1">Bracket 1 (Double Elim)</p>
                      <div className="flex justify-between"><span>Troy Trojans</span><span className="text-orange-500">Sun Belt</span></div>
                      <div className="flex justify-between"><span>West Virginia</span><span className="text-orange-500">Big 12</span></div>
                      <div className="flex justify-between"><span>North Carolina</span><span className="text-orange-500">ACC</span></div>
                      <div className="flex justify-between"><span>Ole Miss Rebels</span><span className="text-orange-500">SEC</span></div>
                    </div>
                    <div className={`border p-4 rounded-xl space-y-2 ${isDark ? "bg-black/20" : "bg-white"}`}>
                      <p className="font-bold text-orange-500 border-b border-white/5 pb-1">Bracket 2 (Double Elim)</p>
                      <div className="flex justify-between"><span>Oklahoma Sooners</span><span className="text-orange-500">Big 12</span></div>
                      <div className="flex justify-between"><span>Alabama Tide</span><span className="text-orange-500">SEC</span></div>
                      <div className="flex justify-between"><span>Texas Longhorns</span><span className="text-orange-500">SEC</span></div>
                      <div className="flex justify-between"><span>Georgia Bulldogs</span><span className="text-orange-500">SEC (1)</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. EVOLVING NFT SIMULATOR */}
            {activeTab === "nft" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>Evolving NFT Card Simulator</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Simulate game metrics to trigger real-time metadata updates. Watch the card's level, attributes, and on-chain state update dynamically.</p>

                <div className="grid md:grid-cols-12 gap-8 items-stretch">
                  
                  {/* NFT Card Graphic */}
                  <div className="md:col-span-5 flex justify-center">
                    <div className="w-64 h-96 rounded-2xl border-4 border-orange-500 bg-gradient-to-b from-[#1c0c1e] to-black p-4 relative overflow-hidden flex flex-col justify-between shadow-2xl animate-float-2">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />
                      
                      {/* Badge / Rarity */}
                      <div className="flex justify-between items-center z-10">
                        <span className="text-[8px] font-bold bg-orange-500/20 text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded-full uppercase">
                          {nftState.rarity}
                        </span>
                        <span className="text-[10px] font-bold text-orange-500 font-mono">
                          LVL {nftState.level}
                        </span>
                      </div>

                      {/* Graphic Placeholder */}
                      <div className="h-44 border border-white/10 rounded-xl my-3 overflow-hidden relative bg-slate-900 flex items-center justify-center">
                        <img 
                          src={nftState.image} 
                          alt="Athlete image" 
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] font-mono px-1.5 py-0.5 rounded text-white">
                          IPFS Asset
                        </div>
                      </div>

                      {/* Info & Stats */}
                      <div className="space-y-1.5 z-10 text-white">
                        <h4 className="font-bold text-xs uppercase leading-none">{nftState.name}</h4>
                        <p className="text-[8px] text-slate-400 font-mono">Stage: {nftState.cwsStage}</p>
                        
                        <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[9px] pt-1">
                          <div className="bg-black/60 border border-white/10 p-1 rounded">
                            <span className="text-[7px] text-slate-500 block">HR</span>
                            <strong className="text-orange-400 text-xs">{nftState.homeRuns}</strong>
                          </div>
                          <div className="bg-black/60 border border-white/10 p-1 rounded">
                            <span className="text-[7px] text-slate-500 block">RBI</span>
                            <strong className="text-emerald-400 text-xs">{nftState.rbi}</strong>
                          </div>
                          <div className="bg-black/60 border border-white/10 p-1 rounded">
                            <span className="text-[7px] text-slate-500 block">SO</span>
                            <strong className="text-blue-400 text-xs">{nftState.strikeouts}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-center text-[7px] text-slate-500 font-mono border-t border-white/5 pt-1.5">
                        Mint: {nftState.mint.substring(0, 10)}...
                      </div>
                    </div>
                  </div>

                  {/* Mutator Actions */}
                  <div className="md:col-span-7 space-y-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Simulate Oracle Game triggers</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => triggerStatMutation("hr")}
                          className="rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 py-2.5 text-xs font-bold transition-all cursor-pointer text-orange-500 flex items-center justify-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Simulate Home Run (+1)
                        </button>
                        <button
                          onClick={() => triggerStatMutation("rbi")}
                          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 py-2.5 text-xs font-bold transition-all cursor-pointer text-emerald-400 flex items-center justify-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Simulate RBI (+1)
                        </button>
                        <button
                          onClick={() => triggerStatMutation("so")}
                          className="rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 py-2.5 text-xs font-bold transition-all cursor-pointer text-blue-400 flex items-center justify-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Simulate Strikeout (+1)
                        </button>
                        <button
                          onClick={() => triggerStatMutation("stage")}
                          className="rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 py-2.5 text-xs font-bold transition-all cursor-pointer text-amber-500 flex items-center justify-center gap-1.5"
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          Advance CWS Stage
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Verification log</h4>
                      <div className={`rounded-xl p-3 border font-mono text-[9px] h-32 overflow-y-auto space-y-1.5 ${terminalBg}`}>
                        {nftLogs.map((log, index) => (
                          <div key={index} className="text-slate-350">{log}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 3. TOKEN EXTENSIONS INSPECTOR */}
            {activeTab === "extension" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>Solana Token-2022 Extensions state</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Natively store key-value traits on the mint account layout. Zero external metadata accounts, 100% on-chain auditability.</p>

                <div className="space-y-4">
                  <div className={`rounded-xl p-4 border ${isDark ? "bg-black/30" : "bg-white"}`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-3">TLV (Type-Length-Value) layout</h4>
                    
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-500">Extension Type:</span>
                        <span className="text-orange-500 font-bold">MetadataPointer (0x12)</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-500">Metadata Pointer Target:</span>
                        <span className="text-slate-350 break-all">{nftState.mint}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-500">Extension Type:</span>
                        <span className="text-orange-500 font-bold">TokenMetadata (0x13)</span>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-xl p-4 border ${isDark ? "bg-black/30" : "bg-white"}`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-3">additional_metadata Key-Value map</h4>
                    
                    <div className="space-y-2 font-mono text-xs">
                      {[
                        { key: "level", value: nftState.level.toString() },
                        { key: "rarity", value: nftState.rarity },
                        { key: "home_runs", value: nftState.homeRuns.toString() },
                        { key: "rbi", value: nftState.rbi.toString() },
                        { key: "cws_stage", value: nftState.cwsStage },
                        { key: "milestones", value: JSON.stringify(nftState.milestones) }
                      ].map((item) => (
                        <div key={item.key} className="flex justify-between items-center border-b border-white/5 pb-1">
                          <span className="text-slate-500">{item.key}:</span>
                          <span className="text-emerald-400 font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. NIL LEGAL COMPLIANCE VAULT */}
            {activeTab === "compliance" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>NIL Compliance & Legal Vault</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Draft RUFADAA-compliant NIL trust deeds. Encrypt locally client-side and commit hash anchors to Stellar/Solana.</p>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Athlete Name</label>
                      <input 
                        type="text" 
                        value={nilName}
                        onChange={(e) => setNilName(e.target.value)}
                        className={`w-full rounded-xl p-2.5 text-xs outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">School / Team</label>
                      <input 
                        type="text" 
                        value={nilSchool}
                        onChange={(e) => setNilSchool(e.target.value)}
                        className={`w-full rounded-xl p-2.5 text-xs outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Monthly Escrow (USD)</label>
                      <input 
                        type="number" 
                        value={nilMonthly}
                        onChange={(e) => setNilMonthly(e.target.value)}
                        className={`w-full rounded-xl p-2.5 text-xs outline-none ${inputBg}`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateNil}
                    disabled={nilStatus === "generating"}
                    className="w-full text-center rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {nilStatus === "generating" ? "Generating Compliance Deed..." : "Compile NIL Compliance Deed"}
                  </button>

                  {nilDeed && (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Deed Output & Signatures</span>
                      <pre className={`rounded-xl p-4 font-mono text-[9px] overflow-x-auto whitespace-pre ${terminalBg}`}>
                        {nilDeed}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. FACTION SUFFIX SEARCH */}
            {activeTab === "registry" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>Collegiate Factions Custom Suffix Registry</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Claim a custom suffix for your fan group, university, or athletic pool. Integrates directly with the dynamic Unykorn OS routing.</p>

                <div className="space-y-6">
                  <div className="flex gap-2 bg-black/60 border border-white/10 rounded-xl p-1.5 shadow-inner">
                    <input 
                      type="text" 
                      value={suffixInput}
                      onChange={(e) => setSuffixInput(e.target.value)}
                      placeholder="Enter faction handle (e.g. dawgs, trojans)"
                      className="flex-grow bg-transparent border-0 text-xs text-white outline-none px-3 py-2"
                      onKeyDown={(e) => { if (e.key === "Enter") handleClaimPreview(); }}
                    />
                    <button 
                      onClick={handleClaimPreview}
                      className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 text-xs transition-all cursor-pointer"
                    >
                      Search Suffix
                    </button>
                  </div>

                  <div className={`rounded-xl p-4 border font-mono text-xs ${isDark ? "bg-black/30" : "bg-white"}`}>
                    {claimOutput}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: AI Guide & Telemetry */}
          <div className="lg:col-span-4 space-y-6">

            {/* TROY AI Voice Panel */}
            <div id="troy-scout" className={`rounded-3xl border p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-[440px] ${cardStyle}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Cpu className="h-3.5 w-3.5 animate-pulse" />
                    TROY AI Sports Scout
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono">Solana Oracle</span>
                </div>
                <p className="text-xs text-slate-400">Ask TROY about bracket matchups, prospect player metrics, or minting instructions.</p>
                
                <div className={`rounded-2xl p-4 text-xs leading-relaxed max-h-56 overflow-y-auto ${terminalBg}`}>
                  {aiResponse}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask about team pipelines, specs, or RWA values..."
                    className="flex-grow bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-500/40"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAsk(); }}
                  />
                  <button 
                    onClick={() => handleAsk()}
                    disabled={aiLoading}
                    className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* GCP/TimesFM Analytics */}
            <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-orange-500" />
                GCP TimesFM Analytics
              </h4>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Scout Horizon:</span>
                  <span>24 slots (CWS Finals)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Predicted Mint Velocity:</span>
                  <span className="text-emerald-400 font-bold">+18.5% (TROY hype)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Asset Load Level:</span>
                  <span className="text-blue-400">OPTIMAL</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-rose-500/10 py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Unykorn Platform · Sovereign Web3 Sports Infrastructure</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-orange-500 transition-all">Home</Link>
            <Link href="/registry" className="hover:text-orange-500 transition-all">Registry</Link>
            <Link href="/troptionsinvestors" className="hover:text-orange-500 transition-all">Investor Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
