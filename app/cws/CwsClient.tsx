"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Globe, Shield, FileText, Wallet, Search, ArrowRight,
  Terminal, Sparkles, Send, Moon, Sun, Info, HelpCircle,
  Database, Network, Cpu, Lock, Award, Coins, Zap,
  RefreshCw, Scale, Layers, TrendingUp, Activity, ArrowUpRight,
  Flame, Trophy, Play, Check, ShoppingCart, MessageSquare
} from "lucide-react";

type TabType = "bracket" | "nft" | "extension" | "compliance" | "registry" | "marketplace";

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

interface MarketItem {
  id: string;
  name: string;
  type: string;
  price: number;
  backingGoldGrains: number;
  owner: string;
  image: string;
  rarity: string;
}

export default function CwsClient() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<TabType>("bracket");

  // Scoreboard / Simulator States
  const [inning, setInning] = useState("Bottom 9th");
  const [outs, setOuts] = useState(2);
  const [strikes, setStrikes] = useState(2);
  const [balls, setBalls] = useState(3);
  const [score, setScore] = useState({ troy: 3, georgia: 4 });
  const [bases, setBases] = useState({ first: true, second: false, third: true });
  const [simulatorLog, setSimulatorLog] = useState<string[]>([
    "[Play-by-Play] Daniel Jackson steps up to the plate. Full count: 3 Balls, 2 Strikes, 2 Outs.",
    "[Play-by-Play] Base runners on 1st and 3rd. Georgia leads by 1 in the bottom of the 9th."
  ]);

  // Suffix Registry States
  const [suffixInput, setSuffixInput] = useState("");
  const [claimOutput, setClaimOutput] = useState("Search a collegiate handle to preview routing lanes.");

  // NIL Generator States
  const [nilName, setNilName] = useState("Daniel Jackson");
  const [nilSchool, setNilSchool] = useState("Georgia Bulldogs");
  const [nilMonthly, setNilMonthly] = useState("12500");
  const [nilStatus, setNilStatus] = useState("idle");
  const [nilDeed, setNilDeed] = useState("");

  // AI Scout Search & AI Twin States
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState(
    "Scout Oracle: Deployed L1 chain feeds active. Search players, simulate play-by-plays, or query Token-2022 byte arrays. Type 'generate relic' or ask a scouting question."
  );
  const [aiLoading, setAiLoading] = useState(false);

  // Card 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Marketplace states
  const [usdfBalance, setUsdfBalance] = useState(1500);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    {
      id: "m1",
      name: "Daniel Jackson - Rookie SFT",
      type: "Player Card",
      price: 250,
      backingGoldGrains: 40,
      owner: "0xAthens...8a39",
      image: "https://images.unsplash.com/photo-1544045560-7297be6472ff?w=400&q=80",
      rarity: "Epic"
    },
    {
      id: "m2",
      name: "Troy 2026 Omaha Relic Stub",
      type: "Moment Relic",
      price: 120,
      backingGoldGrains: 18,
      owner: "0xTroy...ef23",
      image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=400&q=80",
      rarity: "Rare"
    },
    {
      id: "m3",
      name: ".dawgs Faction Namespace SFT",
      type: "Namespace Suffix",
      price: 600,
      backingGoldGrains: 95,
      owner: "0xAthens...8a39",
      image: "https://images.unsplash.com/photo-1508349698387-a257ed957c7f?w=400&q=80",
      rarity: "Legendary"
    }
  ]);
  const [marketLogs, setMarketLogs] = useState<string[]>([
    "[Market] Node connected. Active trade membranes: Stellar DEX & Solana SPL."
  ]);

  // Blockchain Stats
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
    homeRuns: 3,
    rbi: 8,
    strikeouts: 12,
    cwsStage: "Omaha Bound",
    milestones: ["Regional Champion", "Omaha Qualified"]
  });

  const [nftLogs, setNftLogs] = useState<string[]>([
    "[Token-2022] Evolving NFT minted with MetadataPointer pointing to self.",
    "[Token-2022] Initial TLV fields initialized: home_runs=3, rbi=8, stage=Omaha Bound."
  ]);

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

      setAiResponse(
        `Athletic metrics processed. ${prev.name} has evolved to ${nextRarity} (Level ${nextLevel}) with ${nextHr} HRs and ${nextRbi} RBIs at the ${nextStage} stage. Dynamic on-chain extensions successfully updated.`
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

  // Card Mouse Move Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = -(y - yc) / 10;
    const rotateY = (x - xc) / 10;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Interactive Play-by-Play Game Simulator Actions
  const handleSimAction = (action: "pitch" | "powerswing" | "bunt" | "steal") => {
    let outcome = "";
    let solLog = "";
    
    if (action === "pitch") {
      const outcomes = ["Strike", "Ball", "Foul Ball", "Ball", "Strike"];
      const res = outcomes[Math.floor(Math.random() * outcomes.length)];
      if (res === "Strike") {
        setStrikes((s) => {
          if (s >= 2) {
            setOuts((o) => (o >= 2 ? 0 : o + 1));
            outcome = "Strikeout! Batter is retired.";
            return 0;
          }
          outcome = "Strike! Beautiful slider on the outer edge.";
          return s + 1;
        });
      } else if (res === "Ball") {
        setBalls((b) => {
          if (b >= 3) {
            setBases((prev) => {
              if (prev.first) {
                if (prev.second) {
                  return { ...prev, third: true };
                }
                return { ...prev, second: true };
              }
              return { ...prev, first: true };
            });
            outcome = "Base on Balls! Batter walks to first.";
            return 0;
          }
          outcome = "Ball! Pitch missed high and tight.";
          return b + 1;
        });
      } else {
        outcome = "Foul ball. Injected into the stands.";
      }
      solLog = `[Token-2022 Oracle] Pitch simulation executed. Inning: ${inning}, Out state: ${outs}.`;
    } else if (action === "powerswing") {
      const roll = Math.random();
      if (roll < 0.15) {
        // Home Run!
        outcome = "CRUSHED! Daniel Jackson hits a massive 450ft HOME RUN to center field!";
        let runs = 1;
        if (bases.first) runs++;
        if (bases.second) runs++;
        if (bases.third) runs++;
        setScore((s) => ({ ...s, georgia: s.georgia + runs }));
        setBases({ first: false, second: false, third: false });
        triggerStatMutation("hr");
      } else if (roll < 0.45) {
        outcome = "Line drive single to left field! Runners advance.";
        setBases((prev) => {
          const nextBases = { ...prev };
          if (prev.third) {
            setScore((s) => ({ ...s, georgia: s.georgia + 1 }));
            nextBases.third = false;
          }
          if (prev.second) {
            nextBases.third = true;
            nextBases.second = false;
          }
          if (prev.first) {
            nextBases.second = true;
          }
          nextBases.first = true;
          return nextBases;
        });
        triggerStatMutation("rbi");
      } else {
        outcome = "Power swing and a miss! Whiffed on the changeup.";
        setStrikes((s) => {
          if (s >= 2) {
            setOuts((o) => (o >= 2 ? 0 : o + 1));
            return 0;
          }
          return s + 1;
        });
      }
      solLog = `[Token-2022 Oracle] Power swing executed. Updating on-chain SFT stats.`;
    } else if (action === "bunt") {
      outcome = "Perfect sacrifice bunt down the third-base line! Runner advances.";
      setBases((prev) => {
        const nextBases = { ...prev, first: false };
        if (prev.first) nextBases.second = true;
        if (prev.second) nextBases.third = true;
        if (prev.third) {
          setScore((s) => ({ ...s, georgia: s.georgia + 1 }));
          nextBases.third = false;
        }
        return nextBases;
      });
      setOuts((o) => (o >= 2 ? 0 : o + 1));
      solLog = `[Token-2022 Oracle] Sac-bunt routed. Adjusting base positions.`;
    } else if (action === "steal") {
      const roll = Math.random();
      if (roll < 0.6) {
        outcome = "SAFE! Stole second base with a headfirst slide!";
        setBases((prev) => ({ ...prev, second: true, first: false }));
      } else {
        outcome = "OUT! Picked off attempting to steal second.";
        setBases((prev) => ({ ...prev, first: false }));
        setOuts((o) => (o >= 2 ? 0 : o + 1));
      }
      solLog = `[Token-2022 Oracle] Base stealing telemetry processed.`;
    }

    setSimulatorLog((prev) => [`[Play-by-Play] ${outcome}`, ...prev.slice(0, 15)]);
    setNftLogs((logs) => [solLog, ...logs.slice(0, 10)]);
  };

  // AI Agent Scout Search
  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    setAiLoading(true);
    setAiResponse("Analyzing sports database metrics...");
    
    // Check for custom triggers/actions
    const query = aiInput.toLowerCase().trim();
    if (query.includes("generate") || query.includes("draft") || query.includes("mint")) {
      setTimeout(() => {
        const newMint = "SFT" + Math.random().toString(36).substring(2, 9).toUpperCase();
        setAiResponse(`[AI Agent Generation] Compiled a new CWS baseball prospect card!
Name: Custom Player Relic
Mint Address: ${newMint}
Extension Config: TokenMetadata with MetadataPointer pointing to ${newMint}.
Status: Drafted locally. Ready to lock to Stellar gold-backing anchor.`);
        setSimulatorLog((prev) => [`[AI Agent] Drafted new prospect NFT stub: ${newMint}`, ...prev]);
        setAiLoading(false);
        setAiInput("");
      }, 1000);
      return;
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Scouting database inquiry: ${aiInput}` }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.content);
      } else {
        setAiResponse("AI Scout node offline.");
      }
    } catch {
      setAiResponse("Scouting connection timed out.");
    } finally {
      setAiLoading(false);
      setAiInput("");
    }
  };

  // Marketplace purchases
  const buyMarketItem = (item: MarketItem) => {
    if (usdfBalance < item.price) {
      setMarketLogs((prev) => [`[Market Error] Insufficient USDF balance to purchase: ${item.name}`, ...prev]);
      return;
    }
    setUsdfBalance((prev) => prev - item.price);
    setMarketLogs((prev) => [
      `[Market Transaction] Purchased ${item.name} for ${item.price} USDF! Backed by ${item.backingGoldGrains} grains Zurich Gold.`,
      `[Market Transaction] Anchor transfer complete. SFT hash updated: did:unykorn:mkt:${item.id}`,
      ...prev
    ]);
    // Remove or change owner
    setMarketItems((items) =>
      items.map((i) => (i.id === item.id ? { ...i, owner: "0xMyWallet...3b92" } : i))
    );
  };

  const placeBid = (item: MarketItem, bidAmount: number) => {
    setMarketLogs((prev) => [
      `[Market Bid] Placed bid of ${bidAmount} USDF on ${item.name}. Routing escrow through Stellar trust.`,
      ...prev
    ]);
  };

  const handleClaimPreview = () => {
    const name = suffixInput.trim().replace(/\s+/g, "");
    if (!name) {
      setClaimOutput("Enter a faction prefix (e.g. Dawgs, Trojans, Mountaineers).");
      return;
    }
    setClaimOutput(`Faction Suffix routing preview for ".${name.toLowerCase()}":
- Fan SFT: register.${name.toLowerCase()} (Solana Non-Transferable Mint)
- NIL Holding: escrow.${name.toLowerCase()} (Stellar Anchor vault)
- Live Stats: play.${name.toLowerCase()} (Oracle endpoint)`);
  };

  const handleGenerateNil = () => {
    setNilStatus("generating");
    setTimeout(() => {
      const output = `==========================================================
NIL SOVEREIGN COMPLIANCE DEED (RUFADAA / OCGA § 53-13)
==========================================================
ATHLETE: ${nilName}
AFFILIATION: ${nilSchool}
ESCROW HOLDING: $${parseInt(nilMonthly).toLocaleString()} USDF Equivalent
ROUTING: did:unykorn:nil:${nilName.toLowerCase().replace(/\s+/g, "-")}
VAULT HASH: 0x9b3fecb27a8dc0e5bc86edae42aee402e187

TERMS:
1. Licensing rights are encrypted client-side with AES-256-GCM.
2. Metered payouts execute via x402 membranes.
3. RUFADAA succession fallback enabled for designated heirs.

AUTHENTICATION:
[Solana Signature: did:unykorn:sol:${Math.random().toString(36).substring(7)}]
[Stellar Hash Pointer: did:unykorn:stellar:${Math.random().toString(36).substring(7)}]
`;
      setNilDeed(output);
      setNilStatus("success");
    }, 1200);
  };

  const isDark = theme === "dark";

  const mainBg = isDark ? "bg-[#06140f] text-[#d1e8df]" : "bg-[#f4fcf8] text-[#1c382e]";
  const cardStyle = isDark ? "bg-[#0c241b]/80 border-emerald-500/20 text-[#d1e8df]" : "bg-white border-emerald-200 text-slate-800";
  const subCardStyle = isDark ? "bg-black/50 border-white/5" : "bg-[#eaf5ef] border-emerald-500/10";
  const textTitle = isDark ? "text-white" : "text-[#1c382e]";
  const textMuted = isDark ? "text-emerald-400/70" : "text-emerald-800/80";
  const terminalBg = isDark ? "bg-black/90 text-emerald-400 border-white/10" : "bg-slate-900 text-emerald-300 border-slate-950";
  const inputBg = isDark ? "bg-black/60 border-emerald-500/30 text-white" : "bg-white border-emerald-300 text-slate-900";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${mainBg}`}>
      
      {/* Dynamic Stadium Game Scoreboard */}
      <div className={`border-b px-4 py-2 transition-colors duration-200 relative z-30 ${
        isDark ? "bg-[#030a08]/90 border-emerald-500/20 text-emerald-400" : "bg-[#daf2e7] border-emerald-300 text-[#0f3022] font-bold"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              LIVE CWS ORACLE
            </span>
            <div className="flex items-center gap-2 border-l border-emerald-500/20 pl-4">
              <span className="text-[10px] text-slate-500">TROY</span>
              <strong className="text-sm text-red-500">{score.troy}</strong>
              <span className="text-slate-500">vs</span>
              <span className="text-[10px] text-slate-500">UGA</span>
              <strong className="text-sm text-emerald-400">{score.georgia}</strong>
            </div>
            <span className="border-l border-emerald-500/20 pl-4">{inning}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span>B: <strong className="text-white">{balls}</strong></span>
              <span>S: <strong className="text-white">{strikes}</strong></span>
              <span>O: <strong className="text-white">{outs}</strong></span>
            </div>
            <div className="flex gap-2">
              <span className={`w-2 h-2 rounded-sm border ${bases.first ? "bg-red-500 border-red-500" : "border-emerald-500/30"}`} title="1st Base" />
              <span className={`w-2 h-2 rounded-sm border ${bases.second ? "bg-red-500 border-red-500" : "border-emerald-500/30"}`} title="2nd Base" />
              <span className={`w-2 h-2 rounded-sm border ${bases.third ? "bg-red-500 border-red-500" : "border-emerald-500/30"}`} title="3rd Base" />
            </div>
            <span className="hidden sm:inline border-l border-emerald-500/20 pl-4">Block Height: {blockHeight}</span>
          </div>
        </div>
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.15]" 
           style={{
             backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
             backgroundSize: "40px 40px"
           }} 
      />

      {/* Radiant Glow Spheres */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none bg-emerald-600/10 dark:bg-emerald-600/15" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] rounded-full blur-[160px] pointer-events-none bg-orange-600/5 dark:bg-orange-600/10" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20 relative border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-emerald-500 to-emerald-300 bg-clip-text text-transparent orbitron-title">
              Unykorn Athletic
            </span>
          </Link>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            Sports OS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 bg-white/5 backdrop-blur transition-all"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-emerald-600" />}
          </button>
          <Link href="/" className="text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition-all">
            Registry Shell
          </Link>
          <div className="flex items-center bg-black/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400 gap-1.5">
            <Coins className="h-3.5 w-3.5" />
            <span>Balance: {usdfBalance} USDF</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-xs uppercase tracking-widest font-mono">
            <Flame className="h-3.5 w-3.5 text-red-500 animate-pulse" />
            <span>Road to Omaha Sovereign Sports Protocol</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none orbitron-title text-slate-900 dark:text-white">
            CWS On-Chain Empire
          </h1>
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-300 leading-relaxed">
            Minting dynamic, stats-evolving player cards and relics on Solana via **Token-2022 extensions**. Evolve stats, register custom collegiate fan suffixes, and anchor compliant NIL deeds securely.
          </p>
        </div>

        {/* Dynamic Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-emerald-500/10 pb-4">
          {[
            { id: "bracket", label: "Omaha Bracket", icon: <Globe className="h-4 w-4" /> },
            { id: "nft", label: "Evolving NFT Showcase", icon: <Trophy className="h-4 w-4" /> },
            { id: "extension", label: "Token-2022 Byte View", icon: <Cpu className="h-4 w-4" /> },
            { id: "compliance", label: "NIL Compliance", icon: <Scale className="h-4 w-4" /> },
            { id: "registry", label: "Faction Namespaces", icon: <Network className="h-4 w-4" /> },
            { id: "marketplace", label: "Secondary Market", icon: <ShoppingCart className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md"
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
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>2026 Omaha Bracket & Teams</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Select a team to query their official Sun Belt/SEC stats, roster pipelines, and estimated NIL valuation pools.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {Object.keys(teams).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTeam(key)}
                      className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${
                        selectedTeam === key
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
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
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Scouting Profile</h4>
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
                        <strong className="text-sm text-rose-500">{teams[selectedTeam].stats.l}</strong>
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
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                      <Award className="h-8 w-8 text-emerald-500 opacity-60" />
                    </div>
                  </div>
                </div>

                {/* Bracket Layout Preview */}
                <div className="mt-8 border-t border-emerald-500/10 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Bracket Progression (2026 Omaha Setup)</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className={`border p-4 rounded-xl space-y-2 ${isDark ? "bg-black/20" : "bg-white"}`}>
                      <p className="font-bold text-emerald-400 border-b border-white/5 pb-1">Bracket 1 (Double Elim)</p>
                      <div className="flex justify-between"><span>Troy Trojans</span><span className="text-emerald-400">Sun Belt</span></div>
                      <div className="flex justify-between"><span>West Virginia</span><span className="text-emerald-400">Big 12</span></div>
                      <div className="flex justify-between"><span>North Carolina</span><span className="text-emerald-400">ACC</span></div>
                      <div className="flex justify-between"><span>Ole Miss Rebels</span><span className="text-emerald-400">SEC</span></div>
                    </div>
                    <div className={`border p-4 rounded-xl space-y-2 ${isDark ? "bg-black/20" : "bg-white"}`}>
                      <p className="font-bold text-emerald-400 border-b border-white/5 pb-1">Bracket 2 (Double Elim)</p>
                      <div className="flex justify-between"><span>Oklahoma Sooners</span><span className="text-emerald-400">Big 12</span></div>
                      <div className="flex justify-between"><span>Alabama Tide</span><span className="text-emerald-400">SEC</span></div>
                      <div className="flex justify-between"><span>Texas Longhorns</span><span className="text-emerald-400">SEC</span></div>
                      <div className="flex justify-between"><span>Georgia Bulldogs</span><span className="text-emerald-400">SEC (1)</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. EVOLVING NFT SHOWCASE */}
            {activeTab === "nft" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>3D Evolving NFT Showcase</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Simulate dynamic sports metrics. Hover over the card to experience depth effects, and watch stats update live.</p>

                <div className="grid md:grid-cols-12 gap-8 items-stretch">
                  
                  {/* 3D NFT Card Graphic */}
                  <div className="md:col-span-5 flex justify-center">
                    <div 
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                        transition: "transform 0.1s ease",
                      }}
                      className={`w-64 h-96 rounded-2xl border-4 p-4 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all ${
                        nftState.rarity === "Legendary" ? "border-amber-400 shadow-amber-500/20 bg-gradient-to-b from-amber-950/70 to-black" :
                        nftState.rarity === "Epic" ? "border-purple-500 shadow-purple-500/20 bg-gradient-to-b from-purple-950/70 to-black" :
                        nftState.rarity === "Rare" ? "border-orange-500 shadow-orange-500/20 bg-gradient-to-b from-orange-950/70 to-black" :
                        "border-emerald-600 shadow-emerald-500/10 bg-gradient-to-b from-[#0c261e] to-black"
                      }`}
                    >
                      {/* Leather/Mesh texture background */}
                      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      {/* Top Badge / Rarity */}
                      <div className="flex justify-between items-center z-10">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          nftState.rarity === "Legendary" ? "bg-amber-500/20 border-amber-400/40 text-amber-300" :
                          nftState.rarity === "Epic" ? "bg-purple-500/20 border-purple-400/40 text-purple-300" :
                          nftState.rarity === "Rare" ? "bg-orange-500/20 border-orange-400/40 text-orange-300" :
                          "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                        }`}>
                          {nftState.rarity}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">
                          LVL {nftState.level}
                        </span>
                      </div>

                      {/* Graphic Placeholder */}
                      <div className="h-44 border border-white/10 rounded-xl my-2 overflow-hidden relative bg-slate-900 flex items-center justify-center">
                        <img 
                          src={nftState.image} 
                          alt="Athlete" 
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] font-mono px-1.5 py-0.5 rounded text-white">
                          IPFS Asset
                        </div>
                      </div>

                      {/* Info & Stats */}
                      <div className="space-y-1 z-10 text-white">
                        <h4 className="font-bold text-xs uppercase leading-none text-white">{nftState.name}</h4>
                        <p className="text-[8px] text-slate-400 font-mono">Stage: {nftState.cwsStage}</p>
                        
                        <div className="grid grid-cols-3 gap-1 text-center font-mono text-[9px] pt-1">
                          <div className="bg-black/60 border border-white/10 p-1 rounded">
                            <span className="text-[6px] text-slate-500 block">HR</span>
                            <strong className="text-orange-400 text-xs">{nftState.homeRuns}</strong>
                          </div>
                          <div className="bg-black/60 border border-white/10 p-1 rounded">
                            <span className="text-[6px] text-slate-500 block">RBI</span>
                            <strong className="text-emerald-400 text-xs">{nftState.rbi}</strong>
                          </div>
                          <div className="bg-black/60 border border-white/10 p-1 rounded">
                            <span className="text-[6px] text-slate-500 block">SO</span>
                            <strong className="text-blue-400 text-xs">{nftState.strikeouts}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-1.5 text-center text-[7px] text-slate-500 font-mono border-t border-white/5 pt-1">
                        Mint: {nftState.mint.substring(0, 10)}...
                      </div>
                    </div>
                  </div>

                  {/* Mutator Actions */}
                  <div className="md:col-span-7 space-y-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Mutator Actions</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => triggerStatMutation("hr")}
                          className="rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 py-2.5 text-xs font-bold transition-all cursor-pointer text-orange-400 flex items-center justify-center gap-1.5"
                        >
                          Simulate HR (+1)
                        </button>
                        <button
                          onClick={() => triggerStatMutation("rbi")}
                          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 py-2.5 text-xs font-bold transition-all cursor-pointer text-emerald-400 flex items-center justify-center gap-1.5"
                        >
                          Simulate RBI (+1)
                        </button>
                        <button
                          onClick={() => triggerStatMutation("so")}
                          className="rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 py-2.5 text-xs font-bold transition-all cursor-pointer text-blue-400 flex items-center justify-center gap-1.5"
                        >
                          Simulate SO (+1)
                        </button>
                        <button
                          onClick={() => triggerStatMutation("stage")}
                          className="rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 py-2.5 text-xs font-bold transition-all cursor-pointer text-amber-400 flex items-center justify-center gap-1.5"
                        >
                          Advance CWS Stage
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">On-Chain Mutation Logs</h4>
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
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>Solana Token-2022 Byte View</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Natively store key-value traits on the mint account layout. Zero external metadata accounts, 100% on-chain auditability.</p>

                <div className="space-y-4">
                  <div className={`rounded-xl p-4 border ${isDark ? "bg-black/30" : "bg-white"}`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">TLV (Type-Length-Value) layout</h4>
                    
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-500">Extension Type:</span>
                        <span className="text-emerald-400 font-bold">MetadataPointer (0x12)</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-500">Metadata Pointer Target:</span>
                        <span className="text-slate-350 break-all">{nftState.mint}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-500">Extension Type:</span>
                        <span className="text-emerald-400 font-bold">TokenMetadata (0x13)</span>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-xl p-4 border ${isDark ? "bg-black/30" : "bg-white"}`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">additional_metadata Key-Value map</h4>
                    
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

            {/* 4. NIL LEGAL COMPLIANCE */}
            {activeTab === "compliance" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>NIL Compliance Vault</h3>
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
                    className="w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-xs transition-all cursor-pointer disabled:opacity-50"
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

            {/* 5. FACTION NAMESPACES */}
            {activeTab === "registry" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>Collegiate Suffix Registry</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Claim a custom suffix for your fan group, university, or athletic pool. Integrates directly with the dynamic Unykorn OS routing.</p>

                <div className="space-y-6">
                  <div className="flex gap-2 bg-black/60 border border-emerald-500/20 rounded-xl p-1.5 shadow-inner">
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
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 text-xs transition-all cursor-pointer"
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

            {/* 6. SECONDARY MARKETPLACE */}
            {activeTab === "marketplace" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>Secondary Marketplace Ledger</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Trade prospect cards and moment relics in real-time. Buy with USDF or check gold-backed reserves.</p>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  {marketItems.map((item) => (
                    <div key={item.id} className={`rounded-2xl border p-4 flex flex-col justify-between ${subCardStyle}`}>
                      <div className="space-y-3">
                        <div className="h-28 border border-white/5 rounded-xl overflow-hidden relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                          <span className={`absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            item.rarity === "Legendary" ? "bg-amber-500/30 text-amber-300" :
                            item.rarity === "Epic" ? "bg-purple-500/30 text-purple-300" :
                            "bg-orange-500/30 text-orange-300"
                          }`}>{item.rarity}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 font-mono uppercase font-bold">{item.type}</span>
                          <h4 className="font-bold text-xs text-white leading-tight mt-0.5">{item.name}</h4>
                          <p className="text-[9px] text-slate-400 font-mono mt-1">Owner: {item.owner.substring(0, 10)}...</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[7px] text-slate-500 block">PRICE</span>
                            <span className="font-bold text-emerald-400 font-mono">{item.price} USDF</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[7px] text-slate-500 block">GOLD BACKING</span>
                            <span className="font-mono text-amber-400">{item.backingGoldGrains} grains</span>
                          </div>
                        </div>

                        {item.owner.startsWith("0xMyWallet") ? (
                          <div className="text-center text-[10px] font-bold text-emerald-400 py-1 border border-emerald-500/30 rounded bg-emerald-500/5">
                            Owned By You
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => buyMarketItem(item)}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              Buy Now
                            </button>
                            <button
                              onClick={() => placeBid(item, item.price + 10)}
                              className="rounded-lg border border-emerald-500/30 hover:bg-white/5 text-slate-300 font-bold py-1.5 text-[10px] transition-all cursor-pointer"
                            >
                              Bid
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Marketplace Transactions Log</h4>
                  <div className={`rounded-xl p-3 border font-mono text-[9px] h-24 overflow-y-auto space-y-1.5 ${terminalBg}`}>
                    {marketLogs.map((log, index) => (
                      <div key={index} className="text-slate-350">{log}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: AI Scout Search & Play-by-Play Simulator */}
          <div className="lg:col-span-4 space-y-6">

            {/* AI Scout Search Console */}
            <div className={`rounded-3xl border p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-[360px] ${cardStyle}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Cpu className="h-3.5 w-3.5 animate-pulse" />
                    AI Agent Scout Search
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono">Solana Oracle</span>
                </div>
                
                <div className={`rounded-2xl p-4 text-xs leading-relaxed max-h-48 overflow-y-auto font-mono ${terminalBg}`}>
                  {aiResponse}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <form onSubmit={handleAsk} className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask metrics or type 'generate relic'..."
                    className="flex-grow bg-black/50 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/40"
                  />
                  <button 
                    type="submit"
                    disabled={aiLoading}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 text-white" />
                  </button>
                </form>
              </div>
            </div>

            {/* Play-by-Play Game Simulator */}
            <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-4`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                Play-by-Play Game Simulator
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSimAction("powerswing")}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 py-2 text-xs font-bold transition-all cursor-pointer text-red-400"
                >
                  Power Swing
                </button>
                <button
                  onClick={() => handleSimAction("bunt")}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 py-2 text-xs font-bold transition-all cursor-pointer text-amber-400"
                >
                  Sac-Bunt
                </button>
                <button
                  onClick={() => handleSimAction("pitch")}
                  className="rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 py-2 text-xs font-bold transition-all cursor-pointer text-blue-400"
                >
                  Pitch Ball
                </button>
                <button
                  onClick={() => handleSimAction("steal")}
                  className="rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 py-2 text-xs font-bold transition-all cursor-pointer text-purple-400"
                >
                  Steal Base
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest block">Simulation Feed</span>
                <div className={`rounded-xl p-3 border font-mono text-[9px] h-40 overflow-y-auto space-y-2 ${terminalBg}`}>
                  {simulatorLog.map((log, index) => (
                    <div key={index} className="border-b border-white/5 pb-1 text-slate-350">{log}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* GCP/TimesFM Analytics */}
            <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
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
      <footer className="border-t border-emerald-500/10 py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Unykorn Platform · Sovereign Web3 Sports Infrastructure</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-emerald-500 transition-all">Home</Link>
            <Link href="/registry" className="hover:text-emerald-500 transition-all">Registry</Link>
            <Link href="/troptionsinvestors" className="hover:text-emerald-500 transition-all">Investor Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
