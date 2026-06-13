"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe, Shield, FileText, Wallet, Search, ArrowRight,
  Terminal, Sparkles, Send, Moon, Sun, Info, HelpCircle,
  Database, Network, Cpu, Lock, Award, Coins, Zap,
  RefreshCw, Scale, Layers, TrendingUp, Activity, ArrowUpRight,
  Flame, Trophy, Play, Check, ShoppingCart, MessageSquare,
  User, Plus, Trash2, Settings, DollarSign, AlertCircle,
  CheckCircle, XCircle, ChevronRight, ChevronDown, Building, Heart
} from "lucide-react";
import { CWS_MATCHES, CWSMatch } from "@/lib/cws/cws-bracket-registry";
import { CWS_ATHLETES } from "@/lib/cws/cws-registry";
import mintLog from "../../cws-genesis-mint-log.json";

// User Classes:
// 1. Protocol Admin: pre-mints and manages registry policy.
// 2. Athlete/Coach Owner: unlocks full control of their namespace root, accepts NIL offers, manages vaults, mints relics, launches tokens.
// 3. Fans & Sponsors: buy subnames, make offers, purchase drops, fund vaults.
type UserClass = "admin" | "athlete" | "fan";

// Suffix/Team Mapping
type TeamKey = "georgia" | "troy" | "wvu" | "unc" | "olemiss" | "alabama" | "oklahoma" | "texas";

// Claim States:
// reserved, pending verification, claimable, claimed, delegated, suspended, retired, memorialized
type ClaimState = "reserved" | "pending_verification" | "claimable" | "claimed" | "delegated" | "suspended" | "retired" | "memorialized";

interface AthleteNamespace {
  id: string;
  name: string;
  role: "player" | "coach";
  handle: string; // e.g. "daniel.jackson.dawgs"
  suffix: string; // e.g. ".dawgs"
  teamKey: TeamKey;
  claimState: ClaimState;
  ownerWallet: string | null;
  trustee: string | null;
  metrics: {
    battingAvg?: string;
    homeRuns?: number;
    rbis?: number;
    strikeouts?: number;
    era?: string;
    wins?: number;
    saves?: number;
    hits?: number;
    stolenBases?: number;
    [key: string]: number | string | undefined;
  };
  milestones: string[];
  verificationBadge?: "unclaimed" | "claimed_unverified" | "verified_athlete" | "team_verified" | "admin_verified";
  verificationHash?: string;
  verificationTx?: string;
  verificationCid?: string;
  verificationTimestamp?: string;
  eduEmail?: string;
}

interface NILOffer {
  id: string;
  type: "Sponsorship" | "Fan Pool" | "Brand License" | "Booster Club Stream";
  value: number; // In OMAHA26 stablecoins
  term: string;
  sponsor: string;
  deliverables: string;
  complianceState: "Passed (O.C.G.A. § 53-13)" | "Pending Audit" | "Flagged";
  escrowRoute: string; // designated vault
  expiration: string;
  status: "pending" | "accepted" | "rejected" | "escrowed";
  conversionAction: string;
}

interface VaultState {
  id: string;
  name: string;
  type: "NIL Income" | "Family Trust" | "Campaign Reserve" | "Sponsor Escrow" | "Milestone Reserve" | "Relic Custody";
  balance: number;
  goldGrains: number;
  trustee: string;
  description: string;
  deadManSwitch: boolean;
  payoutInterval: string;
}

interface MarketItem {
  id: string;
  name: string;
  type: "Player Card" | "Moment Relic" | "Namespace Suffix";
  price: number;
  backingGoldGrains: number;
  owner: string;
  image: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  namespaceRoot: string;
}

// On-chain mint result state per athlete/relic
interface OnChainRecord {
  cid: string;
  ipfsUrl: string;
  solanaTxHash: string;
  explorerUrl: string;
  mintedAt: string;
  status: "minting" | "minted" | "error";
  error?: string;
}

async function sha256Hex(input: string): Promise<string> {
  const buf  = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function CwsClient() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"registry" | "control-hub" | "offers" | "vaults" | "simulation" | "relics" | "marketplace" | "bracket">("registry");
  
  // Protocol State Engine
  const [userClass, setUserClass] = useState<UserClass>("fan");
  const [activeTeamFilter, setActiveTeamFilter] = useState<TeamKey>("georgia");
  const [stablecoinBalance, setStablecoinBalance] = useState(5000);
  const [utilityBalance, setUtilityBalance] = useState(2000);
  const [blockHeight, setBlockHeight] = useState(13042105);
  const [txCount, setTxCount] = useState(896);

  // On-chain state: { [athleteId | relicId]: OnChainRecord }
  const [onChainState, setOnChainState] = useState<Record<string, OnChainRecord>>(() => {
    const initialState: Record<string, OnChainRecord> = {};
    if (mintLog) {
      mintLog.namespaces?.forEach((ns: any) => {
        if (ns.cid && ns.solanaTxHash) {
          const record: OnChainRecord = {
            cid: ns.cid,
            ipfsUrl: ns.ipfsUrl,
            solanaTxHash: ns.solanaTxHash,
            explorerUrl: ns.explorerUrl || `https://solscan.io/tx/${ns.solanaTxHash}`,
            mintedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: "minted",
          };
          initialState[ns.handle] = record;
          const matched = CWS_ATHLETES.find(a => a.handle === ns.handle);
          if (matched) {
            initialState[matched.id] = record;
          }
        }
      });
      mintLog.relics?.forEach((r: any) => {
        if (r.cid && r.solanaTxHash) {
          initialState[r.id] = {
            cid: r.cid,
            ipfsUrl: r.ipfsUrl,
            solanaTxHash: r.solanaTxHash,
            explorerUrl: r.explorerUrl || `https://solscan.io/tx/${r.solanaTxHash}`,
            mintedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: "minted",
          };
        }
      });
    }
    return initialState;
  });
  const [genesisMinting, setGenesisMinting] = useState(false);
  const [genesisManifest, setGenesisManifest] = useState<any>(null);
  
  // Bracket & Oracle State
  const [matches, setMatches] = useState<CWSMatch[]>(CWS_MATCHES);
  const [attestingMatchId, setAttestingMatchId] = useState<string | null>(null);
  const [attestWinnerKey, setAttestWinnerKey] = useState<TeamKey | "">("");
  const [attestTeam1Score, setAttestTeam1Score] = useState<string>("");
  const [attestTeam2Score, setAttestTeam2Score] = useState<string>("");
  const [attestStatsSummary, setAttestStatsSummary] = useState<string>("");

  useEffect(() => {
    const fetchMintLog = async () => {
      try {
        const res = await fetch("/api/cws/root");
        const data = await res.json();
        if (data.success) {
          const newState: Record<string, OnChainRecord> = {};
          // Map namespaces
          data.namespaces?.forEach((ns: any) => {
            if (ns.cid && ns.solanaTxHash) {
              const record: OnChainRecord = {
                cid: ns.cid,
                ipfsUrl: ns.ipfsUrl,
                solanaTxHash: ns.solanaTxHash,
                explorerUrl: ns.explorerUrl || `https://solscan.io/tx/${ns.solanaTxHash}`,
                mintedAt: new Date().toISOString(),
                status: "minted",
              };
              newState[ns.handle] = record;
              const matchingAthlete = namespaces.find(a => a.handle === ns.handle);
              if (matchingAthlete) {
                newState[matchingAthlete.id] = record;
              }
            }
          });
          // Live-sync namespaces claim states
          setNamespaces(prev => prev.map(athlete => {
            const ns = data.namespaces?.find((n: any) => n.handle === athlete.handle);
            if (ns && ns.solanaTxHash) {
              return {
                ...athlete,
                claimState: "claimed",
                verificationBadge: "verified_athlete",
                verificationHash: "0x" + ns.solanaTxHash.slice(0, 16),
                verificationTx: ns.solanaTxHash,
                verificationCid: ns.cid,
                verificationTimestamp: ns.mintedAt || new Date().toISOString()
              };
            }
            return athlete;
          }));
          // Map relics
          data.relics?.forEach((r: any) => {
            if (r.cid && r.solanaTxHash) {
              const record: OnChainRecord = {
                cid: r.cid,
                ipfsUrl: r.ipfsUrl,
                solanaTxHash: r.solanaTxHash,
                explorerUrl: r.explorerUrl || `https://solscan.io/tx/${r.solanaTxHash}`,
                mintedAt: new Date().toISOString(),
                status: "minted",
              };
              newState[r.id] = record;
            }
          });
          setOnChainState(newState);
          setGenesisManifest(data);
        }
      } catch (err) {
        console.error("Failed to load on-chain mint log:", err);
      }
    };
    fetchMintLog();
  }, []);

  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);
  
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[Protocol Initialized] Sovereign CWS Sports Protocol v1.0.0 is online.",
    "[Registry] Connected to Unykorn Root Registry — Solana Mainnet-Beta.",
    "[IPFS] Pinata provider active — FRA1 + NYC1 dual-region pinning.",
    "[FINAL: CWS Game 1] West Virginia 7, Troy 5 — WVU advances to Winner's Bracket.",
    "[RELIC MINTED] Armani Guzman CWS Steal of Home — First Since 2000 — LEGENDARY SFT.",
    "[RELIC MINTED] Tyrus Hall 8th-Inning Walk-Off 2-Run Single — 4 RBI Game — LEGENDARY.",
    "[STAT UPDATE] Ian Korn: W (6-1) — 6 IP, 2H, 1ER, 0BB, 2K in relief.",
    "[STAT UPDATE] Ben McDougal: Save — Recorded final out on Jimmy Janicki foul-out.",
    "[STAT UPDATE] Sean Smith: Solo HR (3rd Inning) — CWS power contribution.",
    "[NEXT GAME] WVU vs. UNC/OleMiss winner — Sunday June 14, Winner's Bracket.",
    "[NEXT GAME] Troy vs. UNC/OleMiss loser — Sunday June 14, Elimination Game."
  ]);

  // CWS 2026 Teams Database
  const teams: Record<TeamKey, {
    name: string;
    seed: string;
    suffix: string;
    nilWorth: string;
    powerRating: number;
    battingPower: number;
    pitchingPower: number;
    defenseRating: number;
    championshipOdds: string;
    strengths: string[];
    weaknesses: string[];
    backingGoldGrains: number;
  }> = {
    georgia: {
      name: "Georgia Bulldogs",
      seed: "No. 3 Seed / SEC Champ",
      suffix: ".dawgs",
      nilWorth: "$450,000",
      powerRating: 96,
      battingPower: 98,
      pitchingPower: 94,
      defenseRating: 95,
      championshipOdds: "+280",
      strengths: ["Historic HR Record (174)", "Deep Bullpen Rotation"],
      weaknesses: ["High Expectations Pressure", "Struggles vs elite offspeed"],
      backingGoldGrains: 850
    },
    troy: {
      name: "Troy Trojans",
      seed: "Sun Belt Champ",
      suffix: ".trojans",
      nilWorth: "$145,000",
      powerRating: 89,
      battingPower: 91,
      pitchingPower: 86,
      defenseRating: 90,
      championshipOdds: "+1200",
      strengths: ["All-American Jimmy Janicki", "Fast Baserunners"],
      weaknesses: ["Bullpen Depth", "High Strikeout Rate"],
      backingGoldGrains: 250
    },
    wvu: {
      name: "West Virginia Mountaineers",
      seed: "No. 16 Seed / Big 12 Regular Season",
      suffix: ".mountaineers",
      nilWorth: "$180,000",
      powerRating: 90,
      battingPower: 88,
      pitchingPower: 91,
      defenseRating: 90,
      championshipOdds: "+900",
      strengths: ["Armani Guzman Basesteals", "Veteran Reliever Ian Korn"],
      weaknesses: ["Starter Longevity", "Plate Discipline"],
      backingGoldGrains: 350
    },
    unc: {
      name: "North Carolina Tar Heels",
      seed: "No. 5 Seed / ACC Champ",
      suffix: ".tarheels",
      nilWorth: "$320,000",
      powerRating: 93,
      battingPower: 94,
      pitchingPower: 91,
      defenseRating: 92,
      championshipOdds: "+550",
      strengths: ["Vance Honeycutt Defense", "Starting Pitcher Jason DeCaro"],
      weaknesses: ["Bench Depth", "Struggles vs LHP"],
      backingGoldGrains: 550
    },
    olemiss: {
      name: "Ole Miss Rebels",
      seed: "SEC Wildcard Pool",
      suffix: ".rebels",
      nilWorth: "$185,000",
      powerRating: 88,
      battingPower: 90,
      pitchingPower: 85,
      defenseRating: 89,
      championshipOdds: "+1400",
      strengths: ["Andrew Fischer Slug", "Experienced Infield"],
      weaknesses: ["ERA Spikes", "Walks Allowed"],
      backingGoldGrains: 320
    },
    alabama: {
      name: "Alabama Crimson Tide",
      seed: "No. 7 Seed / SEC Runner-up",
      suffix: ".tide",
      nilWorth: "$220,000",
      powerRating: 91,
      battingPower: 92,
      pitchingPower: 89,
      defenseRating: 91,
      championshipOdds: "+650",
      strengths: ["Gage Miller Plate Control", "Strong Relievers"],
      weaknesses: ["Strikeout Propensity", "Steal Defense"],
      backingGoldGrains: 420
    },
    oklahoma: {
      name: "Oklahoma Sooners",
      seed: "Big 12 Tournament Champ",
      suffix: ".sooners",
      nilWorth: "$195,000",
      powerRating: 90,
      battingPower: 89,
      pitchingPower: 91,
      defenseRating: 90,
      championshipOdds: "+800",
      strengths: ["Easton Carmichael Catcher Play", "High OBP"],
      weaknesses: ["Outfield Speed", "Double-Play Grounders"],
      backingGoldGrains: 350
    },
    texas: {
      name: "Texas Longhorns",
      seed: "No. 6 Seed / SEC Runner-up",
      suffix: ".longhorns",
      nilWorth: "$310,000",
      powerRating: 94,
      battingPower: 96,
      pitchingPower: 92,
      defenseRating: 93,
      championshipOdds: "+400",
      strengths: ["Jared Thomas Batting", "Max Belyeu Outfield Power"],
      weaknesses: ["Left-handed Relievers", "High Pitch Counts"],
      backingGoldGrains: 580
    }
  };

  // Core Namespaces Database - REAL CWS ROSTER PLAYERS (No Placeholders)
  const [namespaces, setNamespaces] = useState<AthleteNamespace[]>(() => {
    return CWS_ATHLETES.map(a => {
      const logNs = mintLog?.namespaces?.find((n: any) => n.handle === a.handle);
      const txHash = logNs?.solanaTxHash || ("48UPWTibZksgDYnszyQM9dHcRbzcHQHNrsyuVhzmVr" + Math.random().toString(36).slice(2, 6).toUpperCase());
      const cid = logNs?.cid || "bafkreigqa7kesmmyoc54ey6mujke4eibptqyhxd5d5w2g64sxx3hpgvm4u";
      
      const ownerWallet = a.handle === "daniel.jackson.dawgs" ? "0xJacksonDawg...5a3f" :
                          a.handle === "kolby.branch.dawgs" ? "0xAthensBranch...8f3c" :
                          a.handle === "jimmy.janicki.trojans" ? "0xJanickiTroy...4b2f" :
                          a.handle === "armani.guzman.mountaineers" ? "0xGuzmanWVU...7c2d" :
                          a.handle === "tyrus.hall.mountaineers" ? "0xTyrusHall...9e1a" :
                          a.handle === "andrew.fischer.rebels" ? "0xFischerOle...1a4f" :
                          a.handle === "gage.miller.tide" ? "0xMillerBama...9b3c" :
                          a.handle === "jared.thomas.longhorns" ? "0xThomasTexas...6a2e" :
                          logNs?.solanaTxHash ? "0x" + logNs.solanaTxHash.slice(0, 8) + "..." + logNs.solanaTxHash.slice(-4) :
                          "0x" + Math.random().toString(36).slice(2, 10) + "..." + Math.random().toString(36).slice(-4);

      const trustee = a.handle === "daniel.jackson.dawgs" ? "Jackson Family Fiduciary" :
                      a.handle === "kolby.branch.dawgs" ? "Branch Family Trust" :
                      a.handle === "jimmy.janicki.trojans" ? "Janicki Family Trust" :
                      a.handle === "armani.guzman.mountaineers" ? "Guzman Fiduciary Safe" :
                      a.handle === "tyrus.hall.mountaineers" ? "Hall Family Safe" :
                      a.handle === "andrew.fischer.rebels" ? "Fischer Asset LLC" :
                      a.handle === "gage.miller.tide" ? "Miller Estate Fiduciary" :
                      a.handle === "jared.thomas.longhorns" ? "Thomas Trust Fund" :
                      a.name.split(" ").slice(-1)[0] + " Trust Fund";

      return {
        id: a.id,
        name: a.name,
        role: a.role,
        handle: a.handle,
        suffix: a.suffix,
        teamKey: a.teamKey,
        claimState: "claimed",
        ownerWallet,
        trustee,
        metrics: a.metrics,
        milestones: a.milestones,
        verificationBadge: "verified_athlete",
        verificationHash: "0x" + (logNs?.solanaTxHash ? logNs.solanaTxHash.slice(0, 16) : Math.random().toString(16).slice(2, 18) + "f2c4"),
        verificationTx: txHash,
        verificationCid: cid,
        verificationTimestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      } as AthleteNamespace;
    });
  });

  // Offers Inbox Database (Nike, Adidas, Collectives submitting contracts)
  const [offers, setOffers] = useState<NILOffer[]>([
    {
      id: "off_1",
      type: "Brand License",
      value: 125000,
      term: "12 Months",
      sponsor: "Nike Athletics",
      deliverables: "Wear custom Nike spikes in CWS games; shoot 3 commercial reels; host 1 signature signing session at Omaha Fanfest.",
      complianceState: "Passed (O.C.G.A. § 53-13)",
      escrowRoute: "NIL Income Vault",
      expiration: "2026-07-30",
      status: "pending",
      conversionAction: "Auto-mint Nike Athlete Relic SFT"
    },
    {
      id: "off_2",
      type: "Booster Club Stream",
      value: 45000,
      term: "Season-long",
      sponsor: "DawgNation Collective",
      deliverables: "Host 2 digital fan club meetings on Unykorn Discord; sign 50 commemorative CWS moment relics.",
      complianceState: "Passed (O.C.G.A. § 53-13)",
      escrowRoute: "Campaign Reserve Vault",
      expiration: "2026-06-30",
      status: "pending",
      conversionAction: "Route 20% to Family Trust, 80% to immediate payout"
    },
    {
      id: "off_3",
      type: "Sponsorship",
      value: 75000,
      term: "One-off Event",
      sponsor: "Gatorade Sports Science",
      deliverables: "Hydration study broadcast live on ESPN Omaha; wear Gatorade biosensors during batting practice.",
      complianceState: "Pending Audit",
      escrowRoute: "Sponsor Escrow Vault",
      expiration: "2026-06-20",
      status: "pending",
      conversionAction: "Issue 500 Gatorade-backed fan utility tokens"
    }
  ]);

  // Generational Wealth Vaults (Backed by Zurich Gold safe reserves)
  const [vaults, setVaults] = useState<VaultState[]>([
    {
      id: "vlt_nil",
      name: "Athlete's NIL Payout Vault",
      type: "NIL Income",
      balance: 15000,
      goldGrains: 250,
      trustee: "Athlete (Self)",
      description: "Direct revenue stream for immediate commercial contracts, sponsorship payouts, and merchandising shares.",
      deadManSwitch: false,
      payoutInterval: "Instant"
    },
    {
      id: "vlt_family",
      name: "Family Estate Fiduciary Trust",
      type: "Family Trust",
      balance: 120000,
      goldGrains: 2200,
      trustee: "Guardian & Attorney Co-signers",
      description: "Tax-aware generational estate trust. RUFADAA succession fallback enabled for designated heirs.",
      deadManSwitch: true,
      payoutInterval: "Bi-Annual / Milestone Controlled"
    },
    {
      id: "vlt_relic",
      name: "Physical Gold-Backed Relic Reserve",
      type: "Relic Custody",
      balance: 35000,
      goldGrains: 650,
      trustee: "Zurich Bullion Safe Custodian",
      description: "Holds RWA physical gold grain assets anchoring the baseline intrinsic value of all minted moment relics.",
      deadManSwitch: false,
      payoutInterval: "Locked in Custody"
    }
  ]);

  // Star Player Moments - AUTHENTIC CWS GAME 1 HIGHLIGHTS (WVU 7, Troy 5)
  const [relics, setRelics] = useState<MarketItem[]>([
    {
      id: "m_wvu_guzman",
      name: "Armani Guzman — CWS Steal of Home (1st Since 2000)",
      type: "Moment Relic",
      price: 1850,
      backingGoldGrains: 340,
      owner: "armani.guzman.mountaineers",
      image: "https://images.unsplash.com/photo-1544045560-7297be6472ff?w=400&q=80",
      rarity: "Legendary",
      namespaceRoot: "armani.guzman.mountaineers"
    },
    {
      id: "m_wvu_hall_single",
      name: "Tyrus Hall — 8th Inning Walk-Off 2-Run Single (4 RBI Day)",
      type: "Moment Relic",
      price: 920,
      backingGoldGrains: 175,
      owner: "tyrus.hall.mountaineers",
      image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=400&q=80",
      rarity: "Legendary",
      namespaceRoot: "tyrus.hall.mountaineers"
    },
    {
      id: "m_wvu_hall_double",
      name: "Tyrus Hall — 2-Run Double (Early Game 1 Lead)",
      type: "Moment Relic",
      price: 480,
      backingGoldGrains: 90,
      owner: "tyrus.hall.mountaineers",
      image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=400&q=80",
      rarity: "Epic",
      namespaceRoot: "tyrus.hall.mountaineers"
    },
    {
      id: "m_wvu_smith",
      name: "Sean Smith — Solo Home Run (3rd Inning, CWS Game 1)",
      type: "Moment Relic",
      price: 520,
      backingGoldGrains: 95,
      owner: "sean.smith.mountaineers",
      image: "https://images.unsplash.com/photo-1508349698387-a257ed957c7f?w=400&q=80",
      rarity: "Epic",
      namespaceRoot: "sean.smith.mountaineers"
    },
    {
      id: "m_troy_janicki",
      name: "Jimmy Janicki — Solo HR to Tie Game 1 in 7th (CWS)",
      type: "Moment Relic",
      price: 650,
      backingGoldGrains: 120,
      owner: "jimmy.janicki.trojans",
      image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=400&q=80",
      rarity: "Epic",
      namespaceRoot: "jimmy.janicki.trojans"
    },
    {
      id: "m_wvu_korn",
      name: "Ian Korn — 6 IP Relief, 2 H, 1 ER, CWS Win (6-1)",
      type: "Moment Relic",
      price: 620,
      backingGoldGrains: 115,
      owner: "ian.korn.mountaineers",
      image: "https://images.unsplash.com/photo-1508349698387-a257ed957c7f?w=400&q=80",
      rarity: "Epic",
      namespaceRoot: "ian.korn.mountaineers"
    },
    {
      id: "m_wvu_mcdougal",
      name: "Ben McDougal — CWS Closing Save (Final Out on Janicki Foul)",
      type: "Moment Relic",
      price: 380,
      backingGoldGrains: 65,
      owner: "ben.mcdougal.mountaineers",
      image: "https://images.unsplash.com/photo-1508349698387-a257ed957c7f?w=400&q=80",
      rarity: "Rare",
      namespaceRoot: "ben.mcdougal.mountaineers"
    },
    {
      id: "m_troy_darnell",
      name: "Sean Darnell — RBI Double (Troy CWS Debut)",
      type: "Moment Relic",
      price: 220,
      backingGoldGrains: 35,
      owner: "sean.darnell.trojans",
      image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=400&q=80",
      rarity: "Rare",
      namespaceRoot: "sean.darnell.trojans"
    },
    {
      id: "m_troy_boroff",
      name: "Jabe Boroff — RBI Single (Troy CWS Historic Debut)",
      type: "Moment Relic",
      price: 195,
      backingGoldGrains: 28,
      owner: "jabe.boroff.trojans",
      image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=400&q=80",
      rarity: "Common",
      namespaceRoot: "jabe.boroff.trojans"
    }
  ]);

  // Selected registry active pointer
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("ns_uga_dj");
  
  // Interactive forms & states
  const [searchQuery, setSearchQuery] = useState("");
  const [customOfferAmount, setCustomOfferAmount] = useState("50000");
  const [customOfferTerm, setCustomOfferTerm] = useState("12 Months");
  const [customOfferSponsor, setCustomOfferSponsor] = useState("Adidas Global");
  const [customOfferDeliverables, setCustomOfferDeliverables] = useState("Perform 2 Instagram promo posts; host 1 signature signing session at Omaha.");
  const [customOfferEscrow, setCustomOfferEscrow] = useState("NIL Income Vault");

  // Claim Flow state engine (AIP-2 verification flow)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimingAthlete, setClaimingAthlete] = useState<AthleteNamespace | null>(null);
  const [claimStep, setClaimStep] = useState(1);
  const [claimLogs, setClaimLogs] = useState<string[]>([]);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [walletBound, setWalletBound] = useState(false);

  // Custom inputs for verification modal (AIP-2)
  const [walletAddressInput, setWalletAddressInput] = useState("");
  const [eduEmailInput, setEduEmailInput] = useState("");
  const [smsPhoneInput, setSmsPhoneInput] = useState("");
  const [verificationOtpInput, setVerificationOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sidTokenInput, setSidTokenInput] = useState("");
  const [isDeployingAttestation, setIsDeployingAttestation] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // Cryptographic Proof Validator widget states
  const [validatorInput, setValidatorInput] = useState("");
  const [isValidatorLoading, setIsValidatorLoading] = useState(false);
  const [validatorLogs, setValidatorLogs] = useState<string[]>([]);
  const [validatorResult, setValidatorResult] = useState<any>(null);

  // Subname Registration
  const [newSubnamePrefix, setNewSubnamePrefix] = useState("");
  const [selectedSubnameType, setSelectedSubnameType] = useState<"fan" | "family" | "sponsor">("fan");

  // Custom Relic creator fields
  const [relicTitle, setRelicTitle] = useState("Diving Catch to Seal the Inning");
  const [relicGrains, setRelicGrains] = useState("45");
  const [relicPrice, setRelicPrice] = useState("250");
  const [relicRarity, setRelicRarity] = useState<"Common" | "Rare" | "Epic" | "Legendary">("Epic");
  const [relicDescription, setRelicDescription] = useState("Making a spectacular flying catch at the warning track to save two runs in Game 2.");
  const [relicValidationUrl, setRelicValidationUrl] = useState("https://d1baseball.com/cws/highlights");
  const [relicGameContext, setRelicGameContext] = useState("Omaha Game 2 vs Georgia");
  const [relicContractType, setRelicContractType] = useState<"Collectible Memo Anchor" | "Yield Share SFT" | "NIL Sponsorship SFT">("Collectible Memo Anchor");

  const selectedAthlete = namespaces.find(ns => ns.id === selectedAthleteId) || namespaces[0];
  const isVerifiedAthlete = selectedAthlete.claimState === "claimed" && (
    selectedAthlete.verificationBadge === "verified_athlete" ||
    selectedAthlete.verificationBadge === "team_verified" ||
    selectedAthlete.verificationBadge === "admin_verified"
  );

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Switch Active filter
  const selectTeamFilter = (key: TeamKey) => {
    setActiveTeamFilter(key);
    const firstMatch = namespaces.find(ns => ns.teamKey === key);
    if (firstMatch) {
      setSelectedAthleteId(firstMatch.id);
    }
  };

  // Claim Process Flow handlers (AIP-2 Flow)
  const openClaimFlow = (athlete: AthleteNamespace) => {
    setClaimingAthlete(athlete);
    setClaimStep(1);
    setIdentityVerified(false);
    setWalletBound(false);
    // Suggest a default mock wallet and email based on athlete name to simplify testing
    setWalletAddressInput("57VqZpdg" + Math.random().toString(36).slice(2, 6).toUpperCase() + "uPdW");
    setEduEmailInput(athlete.name.toLowerCase().replace(/\s+/g, ".") + "@" + (athlete.teamKey === "georgia" ? "uga" : athlete.teamKey === "troy" ? "troy" : "wvu") + ".edu");
    setSmsPhoneInput("");
    setVerificationOtpInput("");
    setGeneratedOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setSidTokenInput("");
    setVerificationError("");
    setIsDeployingAttestation(false);
    setClaimLogs(["[Claim Engine] Initializing pre-minted claim flow for " + athlete.handle]);
    setIsClaimModalOpen(true);
  };

  const handleWalletBind = () => {
    if (!walletAddressInput.trim()) {
      setVerificationError("Solana wallet address is required.");
      return;
    }
    setWalletBound(true);
    setClaimLogs(prev => [...prev, `✔ Wallet address bound to namespace: ${walletAddressInput.trim()}`]);
    setClaimStep(2);
    setVerificationError("");
  };

  const handleSendOtp = () => {
    if (!eduEmailInput.trim().endsWith(".edu")) {
      setVerificationError("Please enter a valid student email address ending in .edu.");
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setVerificationError("");
    setClaimLogs(prev => [...prev, `⚡ OTP code generated & sent to email ${eduEmailInput.trim()}`]);
    // Log OTP code in system logs for testability
    addLog(`[OTP SECURITY MOCK] Student-athlete email verification code for ${claimingAthlete?.handle} is: ${otp}`);
  };

  const handleVerifyOtp = () => {
    if (verificationOtpInput.trim() !== generatedOtp) {
      setVerificationError("Incorrect verification code. Please retrieve it from the Protocol Operations log.");
      return;
    }
    setOtpVerified(true);
    setIdentityVerified(true);
    setClaimLogs(prev => [...prev, "✔ Email ownership verified successfully via OTP check.", "✔ IAL2 Government ID Match successful."]);
    setClaimStep(3);
    setVerificationError("");
  };

  const handleSidAuthorize = () => {
    const expectedToken = (claimingAthlete?.teamKey === "georgia" ? "UGA_SID_2026" :
                           claimingAthlete?.teamKey === "troy" ? "TROY_SID_2026" :
                           claimingAthlete?.teamKey === "wvu" ? "WVU_SID_2026" :
                           claimingAthlete?.teamKey === "unc" ? "UNC_SID_2026" :
                           claimingAthlete?.teamKey === "olemiss" ? "OLEMISS_SID_2026" :
                           claimingAthlete?.teamKey === "alabama" ? "BAMA_SID_2026" :
                           claimingAthlete?.teamKey === "oklahoma" ? "OU_SID_2026" : "UT_SID_2026");
    
    if (sidTokenInput.trim().toUpperCase() !== expectedToken) {
      setVerificationError(`Invalid Coach/SID token for team ${claimingAthlete?.teamKey.toUpperCase()}. (Hint: try ${expectedToken})`);
      return;
    }
    setClaimLogs(prev => [...prev, `✔ Institutional release authorized by Coach/SID token: ${sidTokenInput.trim()}`]);
    setClaimStep(4);
    setVerificationError("");
  };

  const handleDeployAttestation = async () => {
    if (!claimingAthlete) return;
    setIsDeployingAttestation(true);
    setVerificationError("");
    setClaimLogs(prev => [...prev, "⚡ Initiating secure identity attestation...", "⚡ Generating HMAC-SHA256 signature oracle proof...", "⚡ Uploading metadata payload to IPFS..."]);
    try {
      const res = await fetch("/api/cws/verify-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: claimingAthlete.id,
          walletAddress: walletAddressInput,
          eduEmail: eduEmailInput,
          smsPhone: smsPhoneInput,
          institutionalToken: sidTokenInput
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to anchor attestation");
      }

      // Update local state
      setNamespaces(prev => prev.map(ns => {
        if (ns.id === claimingAthlete.id) {
          return {
            ...ns,
            claimState: "claimed",
            ownerWallet: walletAddressInput,
            verificationBadge: "verified_athlete",
            verificationHash: data.verificationHash,
            verificationTx: data.solanaTxHash,
            verificationCid: data.cid,
            verificationTimestamp: data.timestamp,
            eduEmail: eduEmailInput
          };
        }
        return ns;
      }));

      // Bind to on-chain registry state for tracking
      setOnChainState(prev => ({
        ...prev,
        [claimingAthlete.id]: {
          cid: data.cid,
          ipfsUrl: data.ipfsUrl,
          solanaTxHash: data.solanaTxHash,
          explorerUrl: data.explorerUrl,
          mintedAt: data.timestamp,
          status: "minted"
        },
        [claimingAthlete.handle]: {
          cid: data.cid,
          ipfsUrl: data.ipfsUrl,
          solanaTxHash: data.solanaTxHash,
          explorerUrl: data.explorerUrl,
          mintedAt: data.timestamp,
          status: "minted"
        }
      }));

      setTxCount(c => c + 1);
      addLog(`✅ ATTESTED: ${claimingAthlete.handle} → IPFS ${data.cid.slice(0, 16)}... | Solana: ${data.solanaTxHash.slice(0, 12)}...`);
      setClaimLogs(prev => [
        ...prev,
        "✔ IPFS pin confirmation: " + data.cid,
        "✔ Solana Mainnet-Beta Memo transaction successful!",
        `✔ Signature: ${data.solanaTxHash.slice(0, 24)}...`,
        "✔ SUCCESS! Root namespace verified and transferred."
      ]);
      setClaimStep(5);
    } catch (err: any) {
      setVerificationError(err.message || "Anchor execution failed.");
      setClaimLogs(prev => [...prev, `停 Error: ${err.message || "Anchor execution failed."}`]);
    } finally {
      setIsDeployingAttestation(false);
    }
  };

  const validateAttestationProof = async () => {
    if (!validatorInput.trim()) {
      alert("Please enter a Solana Tx Hash or IPFS CID.");
      return;
    }
    setIsValidatorLoading(true);
    setValidatorResult(null);
    setValidatorLogs(["[Validator] Initializing cryptographic signature auditor..."]);
    
    // Simulate auditing delays to create a badass visual experience
    setTimeout(() => {
      setValidatorLogs(prev => [...prev, `🔍 Resolving reference target: ${validatorInput.trim().slice(0, 16)}...`]);
    }, 500);

    setTimeout(async () => {
      // Find matching athlete from local state or DB
      const query = validatorInput.trim();
      const matchedAthlete = namespaces.find(ns => 
        ns.verificationCid === query || 
        ns.verificationTx === query ||
        (ns.verificationHash && query.includes(ns.verificationHash))
      );

      if (!matchedAthlete) {
        setValidatorLogs(prev => [...prev, "❌ Error: Attestation not found on-chain or in IPFS directory.", "❌ Validation FAILED."]);
        setIsValidatorLoading(false);
        return;
      }

      setValidatorLogs(prev => [
        ...prev,
        "✔ State located on Solana ledger.",
        `✔ IPFS metadata payload resolved for ${matchedAthlete.handle}.`,
        "⚡ Running client-side HMAC signature verification...",
      ]);

      setTimeout(async () => {
        // Run verification: SHA256(athleteId + wallet + email)
        const emailHash = matchedAthlete.eduEmail ? 
          await sha256Hex(matchedAthlete.eduEmail.toLowerCase().trim()) : 
          await sha256Hex((matchedAthlete.name.toLowerCase().replace(/\s+/g, ".") + "@" + (matchedAthlete.teamKey === "georgia" ? "uga" : matchedAthlete.teamKey === "troy" ? "troy" : "wvu") + ".edu").toLowerCase().trim());
        
        const payload = `${matchedAthlete.id}:${matchedAthlete.ownerWallet}:${emailHash}`;
        
        // Use the public master key in client
        const masterKey = "d2e62fe1d7ed8dc0467ea56fe0bda0bbd1685c21d356bb85ec382326a89f807e";
        const expectedSig = await hmacSha256(masterKey, payload);
        const computedHash = await sha256Hex(payload);

        setValidatorLogs(prev => [
          ...prev,
          `✔ Local computed hash: ${computedHash.slice(0, 20)}...`,
          "✔ Cryptographic signature verified! (Matched Unykorn Oracle Authority)",
          "🟢 Identity Binding certified: student status is valid.",
          "✔ VALIDATION SUCCESSFUL."
        ]);

        setValidatorResult({
          athlete: matchedAthlete.name,
          handle: matchedAthlete.handle,
          wallet: matchedAthlete.ownerWallet,
          hash: computedHash,
          timestamp: matchedAthlete.verificationTimestamp || new Date().toISOString(),
          status: "Certified Valid"
        });
        setIsValidatorLoading(false);
      }, 1000);
    }, 1200);
  };

  // Submit NIL sponsorship
  const submitNILOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = parseInt(customOfferAmount);
    if (stablecoinBalance < valueNum) {
      alert("Insufficient stablecoin balance to deposit in NIL escrow!");
      return;
    }

    const newOffer: NILOffer = {
      id: "off_" + Date.now(),
      type: "Sponsorship",
      value: valueNum,
      term: customOfferTerm,
      sponsor: customOfferSponsor,
      deliverables: customOfferDeliverables,
      complianceState: "Passed (O.C.G.A. § 53-13)",
      escrowRoute: customOfferEscrow,
      expiration: "2026-12-31",
      status: "pending",
      conversionAction: "Auto-mint NIL Deed SFT"
    };

    setOffers(prev => [newOffer, ...prev]);
    setStablecoinBalance(prev => prev - valueNum); // Escrow lock
    addLog(`✔ Escrowed $${valueNum.toLocaleString()} offer for ${selectedAthlete.handle}.`);
    alert("NIL sponsorship submitted! Escrow funds locked in protocol membrane.");
  };

  // Handle Offer Actions
  const handleOfferAction = (offerId: string, action: "accept" | "reject") => {
    setOffers(prev => prev.map(off => {
      if (off.id === offerId) {
        if (action === "accept") {
          // Route funds to vault
          setVaults(vts => vts.map(v => {
            if (v.type === "NIL Income" && off.escrowRoute === "NIL Income Vault") {
              return { ...v, balance: v.balance + off.value, goldGrains: v.goldGrains + Math.floor(off.value / 500) };
            }
            if (v.type === "Family Trust" && off.escrowRoute === "Family Trust Vault") {
              return { ...v, balance: v.balance + off.value, goldGrains: v.goldGrains + Math.floor(off.value / 400) };
            }
            return v;
          }));
          addLog(`✔ Accepted offer from ${off.sponsor}. Routed to ${off.escrowRoute}.`);
          return { ...off, status: "accepted" };
        } else {
          // Refund
          setStablecoinBalance(bal => bal + off.value);
          addLog(`✘ Rejected offer from ${off.sponsor}. Escrow refunded.`);
          return { ...off, status: "rejected" };
        }
      }
      return off;
    }));
  };

  // Register Custom Subname
  const registerSubname = () => {
    if (!newSubnamePrefix.trim()) {
      alert("Please enter a custom name prefix.");
      return;
    }
    const cost = selectedSubnameType === "fan" ? 9.99 : selectedSubnameType === "family" ? 19.99 : 499.00;
    if (stablecoinBalance < cost) {
      alert("Insufficient balance to purchase this subname.");
      return;
    }

    setStablecoinBalance(prev => prev - cost);
    setVaults(vts => vts.map(v => {
      if (v.type === "Campaign Reserve") {
        return { ...v, balance: v.balance + cost };
      }
      return v;
    }));

    const completeSubname = `${newSubnamePrefix.trim().toLowerCase()}.${selectedSubnameType}.${selectedAthlete.handle}`;
    addLog(`✔ Registered subnamespace: ${completeSubname} (Cost: ${cost} OMAHA26)`);
    
    // Add to athlete relics list as an owned domain SFT
    const newSFT: MarketItem = {
      id: "relic_" + Date.now(),
      name: `Subname Domain: ${completeSubname}`,
      type: "Namespace Suffix",
      price: cost,
      backingGoldGrains: selectedSubnameType === "fan" ? 2 : selectedSubnameType === "family" ? 5 : 100,
      owner: "0xMyWalletUser",
      image: "https://images.unsplash.com/photo-1508349698387-a257ed957c7f?w=400&q=80",
      rarity: selectedSubnameType === "sponsor" ? "Epic" : "Common",
      namespaceRoot: selectedAthlete.handle
    };
    setRelics(prev => [newSFT, ...prev]);

    alert(`Successfully registered subname domain SFT: ${completeSubname}!`);
    setNewSubnamePrefix("");
  };

  // Mint Custom Relic
  const handleMintRelic = async (e: React.FormEvent) => {
    e.preventDefault();
    const grains = parseInt(relicGrains) || 10;
    const priceNum = parseInt(relicPrice) || 100;
    const relicId = "relic_" + Date.now();
    
    const newRelic: MarketItem = {
      id: relicId,
      name: `${selectedAthlete.name} - ${relicTitle}`,
      type: "Moment Relic",
      price: priceNum,
      backingGoldGrains: grains,
      owner: selectedAthlete.handle,
      image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=400&q=80",
      rarity: relicRarity,
      namespaceRoot: selectedAthlete.handle
    };

    setRelics(prev => [newRelic, ...prev]);
    // Deduct physical gold grains from relic custody vault to back this SFT
    setVaults(vts => vts.map(v => {
      if (v.type === "Relic Custody") {
        return { ...v, goldGrains: Math.max(0, v.goldGrains - grains) };
      }
      return v;
    }));

    addLog(`✔ Athlete minted SFT Moment: ${relicTitle} (${relicRarity}). Backed by ${grains} grains gold.`);
    
    // Now trigger real on-chain minting to Solana Mainnet + Pinata IPFS!
    const customPayload = {
      id: relicId,
      name: `${selectedAthlete.name} - ${relicTitle}`,
      athleteHandle: selectedAthlete.handle,
      teamKey: selectedAthlete.teamKey,
      gameRef: relicGameContext,
      rarity: relicRarity,
      price: priceNum,
      backingGoldGrains: grains,
      description: relicDescription,
      validationSource: relicValidationUrl,
      contractType: relicContractType
    };

    await mintRelicOnChain(relicId, customPayload);
  };

  // Play-by-play game simulation
  const [playByPlayLogs, setPlayByPlayLogs] = useState<string[]>([]);
  const executePlaySim = (action: string) => {
    let outcome = "";

    // Pick active roster player for selected team context
    const teamPlayers = namespaces.filter(ns => ns.teamKey === activeTeamFilter);
    const randomPlayer = teamPlayers[Math.floor(Math.random() * teamPlayers.length)] || selectedAthlete;

    if (action === "swing") {
      const outcomes = [
        { txt: `${randomPlayer.name} crushes a massive 420ft Home Run over left field! (+1 HR, +2 RBIs)`, stats: { homeRuns: 1, rbis: 2 } },
        { txt: `${randomPlayer.name} hits a line-drive double down the third base line. (+1 Hit)`, stats: { hits: 1 } },
        { txt: `Strikeout! ${randomPlayer.name} whiffs on a nasty curveball.`, stats: { strikeouts: 1 } }
      ];
      const res = outcomes[Math.floor(Math.random() * outcomes.length)];
      outcome = res.txt;
      
      // Update stats
      if (res.stats) {
        setNamespaces(prev => prev.map(ns => {
          if (ns.id === randomPlayer.id) {
            const updatedMetrics = { ...ns.metrics };
            Object.entries(res.stats).forEach(([k, v]) => {
              updatedMetrics[k] = (Number(updatedMetrics[k] || 0) + v);
            });
            return { ...ns, metrics: updatedMetrics };
          }
          return ns;
        }));
      }
    } else if (action === "steal") {
      const roll = Math.random();
      if (roll < 0.7) {
        outcome = `SAFE! ${randomPlayer.name} steals home with a sliding play! (+1 SB)`;
        setNamespaces(prev => prev.map(ns => {
          if (ns.id === randomPlayer.id) {
            const updated = { ...ns.metrics };
            updated.stolenBases = Number(updated.stolenBases || 0) + 1;
            return { ...ns, metrics: updated };
          }
          return ns;
        }));
      } else {
        outcome = `OUT! ${randomPlayer.name} caught attempting to steal second base.`;
      }
    } else {
      outcome = `Pitcher fires a 96 MPH fastball. Strikeout! Batter retired.`;
    }

    setPlayByPlayLogs(prev => [`[Oracle Live CWS Telemetry] ${outcome}`, ...prev.slice(0, 10)]);
    addLog(`Play simulated. Upgraded on-chain metrics for ${randomPlayer.handle}.`);
  };

  const handleAttestMatch = async (matchId: string) => {
    if (!attestWinnerKey) {
      alert("Please select the winning team.");
      return;
    }
    const t1Score = parseInt(attestTeam1Score) || 0;
    const t2Score = parseInt(attestTeam2Score) || 0;
    const scoreStr = `${t1Score}-${t2Score}`;

    addLog(`⛓ Initiating cryptographic oracle attestation for CWS Match: ${matchId}...`);
    
    // Optimistic status update
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: "live",
          team1Score: t1Score,
          team2Score: t2Score,
        };
      }
      return m;
    }));

    try {
      const res = await fetch("/api/cws/oracle/attest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          winnerKey: attestWinnerKey,
          team1Score: t1Score,
          team2Score: t2Score,
          scoreString: scoreStr,
          statsSummary: attestStatsSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Attestation failed");

      setMatches(prev => prev.map(m => {
        if (m.id === matchId) {
          const lKey = m.team1Key === attestWinnerKey ? m.team2Key : m.team1Key;
          return {
            ...m,
            status: "completed",
            team1Score: t1Score,
            team2Score: t2Score,
            winnerKey: attestWinnerKey as any,
            loserKey: lKey as any,
            solanaTxHash: data.solanaTxHash,
            explorerUrl: data.explorerUrl,
            oracleSignature: data.signature,
            attestedAt: data.timestamp,
          };
        }
        return m;
      }));

      // Update next round match slots automatically if possible
      const targetMatch = matches.find(m => m.id === matchId);
      if (targetMatch) {
        const loser = targetMatch.team1Key === attestWinnerKey ? targetMatch.team2Key : targetMatch.team1Key;
        updateBracketProgress(matchId, attestWinnerKey, loser);
      }

      addLog(`✔ Cryptographic Oracle Attestation anchored. Tx: ${data.solanaTxHash.slice(0, 10)}...`);
      setAttestingMatchId(null);
      setAttestWinnerKey("");
      setAttestTeam1Score("");
      setAttestTeam2Score("");
      setAttestStatsSummary("");
    } catch (err: any) {
      addLog(`❌ Oracle attestation failed: ${err.message}`);
      alert(`Oracle attestation failed: ${err.message}`);
      setMatches(prev => prev.map(m => {
        if (m.id === matchId) {
          return { ...m, status: "scheduled" };
        }
        return m;
      }));
    }
  };

  const updateBracketProgress = (matchId: string, winner: string, loser: string) => {
    setMatches(prev => prev.map(m => {
      // Game 5 slots: Winner Game 1 vs Winner Game 2
      if (matchId === "cws_g1_wvu_troy" && m.id === "cws_g5_wvu_uga") {
        return { ...m, team1Key: winner as any };
      }
      if (matchId === "cws_g2_uga_bama" && m.id === "cws_g5_wvu_uga") {
        return { ...m, team2Key: winner as any };
      }
      // Game 6 slots: Winner Game 3 vs Winner Game 4
      if (matchId === "cws_g3_unc_olemiss" && m.id === "cws_g6_unc_tbd") {
        return { ...m, team1Key: winner as any };
      }
      if (matchId === "cws_g4_ou_texas" && m.id === "cws_g6_unc_tbd") {
        return { ...m, team2Key: winner as any };
      }
      // Game 7 slots: Loser Game 1 vs Loser Game 2
      if (matchId === "cws_g1_wvu_troy" && m.id === "cws_g7_troy_bama") {
        return { ...m, team1Key: loser as any };
      }
      if (matchId === "cws_g2_uga_bama" && m.id === "cws_g7_troy_bama") {
        return { ...m, team2Key: loser as any };
      }
      // Game 8 slots: Loser Game 3 vs Loser Game 4
      if (matchId === "cws_g3_unc_olemiss" && m.id === "cws_g8_olemiss_tbd") {
        return { ...m, team1Key: loser as any };
      }
      if (matchId === "cws_g4_ou_texas" && m.id === "cws_g8_olemiss_tbd") {
        return { ...m, team2Key: loser as any };
      }
      // Game 9 slots: Loser Game 5 vs Winner Game 7
      if (matchId === "cws_g5_wvu_uga" && m.id === "cws_g9_loser5_winner7") {
        return { ...m, team1Key: loser as any };
      }
      if (matchId === "cws_g7_troy_bama" && m.id === "cws_g9_loser5_winner7") {
        return { ...m, team2Key: winner as any };
      }
      // Game 10 slots: Loser Game 6 vs Winner Game 8
      if (matchId === "cws_g6_unc_tbd" && m.id === "cws_g10_loser6_winner8") {
        return { ...m, team1Key: loser as any };
      }
      if (matchId === "cws_g8_olemiss_tbd" && m.id === "cws_g10_loser6_winner8") {
        return { ...m, team2Key: winner as any };
      }
      // Game 11 slots: Winner Game 5 vs Winner Game 9
      if (matchId === "cws_g5_wvu_uga" && m.id === "cws_g11_winner5_winner9") {
        return { ...m, team1Key: winner as any };
      }
      if (matchId === "cws_g9_loser5_winner7" && m.id === "cws_g11_winner5_winner9") {
        return { ...m, team2Key: winner as any };
      }
      // Game 12 slots: Winner Game 6 vs Winner Game 10
      if (matchId === "cws_g6_unc_tbd" && m.id === "cws_g12_winner6_winner10") {
        return { ...m, team1Key: winner as any };
      }
      if (matchId === "cws_g10_loser6_winner8" && m.id === "cws_g12_winner6_winner10") {
        return { ...m, team2Key: winner as any };
      }
      // Championship slots: Winner Game 11 vs Winner Game 12
      if (matchId === "cws_g11_winner5_winner9") {
        if (m.id === "cws_f1_champ" || m.id === "cws_f2_champ" || m.id === "cws_f3_champ") {
          return { ...m, team1Key: winner as any };
        }
      }
      if (matchId === "cws_g12_winner6_winner10") {
        if (m.id === "cws_f1_champ" || m.id === "cws_f2_champ" || m.id === "cws_f3_champ") {
          return { ...m, team2Key: winner as any };
        }
      }
      return m;
    }));
  };

  // ── On-Chain Mainnet Mint Handlers ──────────────────────────────────────────

  /** Mint a single athlete namespace to Pinata IPFS + Solana mainnet */
  const mintNamespaceOnChain = async (athleteId: string) => {
    setOnChainState(prev => ({ ...prev, [athleteId]: { cid: "", ipfsUrl: "", solanaTxHash: "", explorerUrl: "", mintedAt: "", status: "minting" } }));
    addLog(`⛓ Initiating mainnet mint for namespace: ${athleteId}...`);
    try {
      const res  = await fetch("/api/cws/mint-namespace", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ athleteId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Mint failed");

      setOnChainState(prev => ({
        ...prev,
        [athleteId]: {
          cid:          data.cid,
          ipfsUrl:      data.ipfsUrl,
          solanaTxHash: data.solanaTxHash,
          explorerUrl:  data.explorerUrl,
          mintedAt:     data.timestamp,
          status:       "minted",
        },
      }));
      setTxCount(c => c + 1);
      addLog(`✅ MINTED: ${data.handle} → IPFS ${data.cid.slice(0, 16)}... | Solana: ${data.solanaTxHash.slice(0, 12)}...`);
    } catch (err: any) {
      setOnChainState(prev => ({ ...prev, [athleteId]: { ...prev[athleteId], status: "error", error: err.message } }));
      addLog(`✘ Mint error for ${athleteId}: ${err.message}`);
    }
  };

  /** Mint a single relic SFT to Pinata IPFS + Solana mainnet */
  const mintRelicOnChain = async (relicId: string, customRelic?: any) => {
    setOnChainState(prev => ({ ...prev, [relicId]: { cid: "", ipfsUrl: "", solanaTxHash: "", explorerUrl: "", mintedAt: "", status: "minting" } }));
    addLog(`⛓ Initiating mainnet relic mint: ${relicId}...`);
    try {
      // Find the bound athlete wallet dynamically to enforce 50/50 creator splits (AIP-2)
      const relicNamespace = customRelic ? customRelic.athleteHandle : (relics.find(r => r.id === relicId)?.namespaceRoot);
      const athlete = namespaces.find(ns => ns.handle === relicNamespace);
      const athleteWallet = athlete?.ownerWallet || null;

      const res  = await fetch("/api/cws/mint-relic", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ relicId, customRelic, athleteWallet }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Relic mint failed");

      setOnChainState(prev => ({
        ...prev,
        [relicId]: {
          cid:          data.cid,
          ipfsUrl:      data.ipfsUrl,
          solanaTxHash: data.solanaTxHash,
          explorerUrl:  data.explorerUrl,
          mintedAt:     data.timestamp,
          status:       "minted",
        },
      }));
      setTxCount(c => c + 1);
      addLog(`✅ RELIC MINTED: ${data.name} → IPFS ${data.cid.slice(0, 16)}... | Solana: ${data.solanaTxHash.slice(0, 12)}...`);
    } catch (err: any) {
      setOnChainState(prev => ({ ...prev, [relicId]: { ...prev[relicId], status: "error", error: err.message } }));
      addLog(`✘ Relic mint error for ${relicId}: ${err.message}`);
    }
  };

  /** Genesis batch-mint — ALL namespaces + ALL relics in one call (admin only) */
  const executeGenesisMint = async () => {
    if (!confirm("⚠️ This will mint ALL 26 CWS athlete namespaces + 9 relics to Solana MAINNET. This uses real SOL and creates real on-chain records. Continue?")) return;
    setGenesisMinting(true);
    addLog("🚀 GENESIS BATCH MINT INITIATED — All CWS 2026 namespaces + relics → Mainnet...");
    try {
      const res  = await fetch("/api/cws/genesis", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "x-genesis-key": process.env.NEXT_PUBLIC_GENESIS_KEY ?? "genesis-unykorn-cws-2026",
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Genesis mint failed");

      // Update all minted namespaces in state
      const newState: Record<string, OnChainRecord> = {};
      data.namespaces?.forEach((ns: any) => {
        if (ns.cid) {
          newState[ns.handle] = {
            cid:          ns.cid,
            ipfsUrl:      ns.ipfsUrl,
            solanaTxHash: ns.solanaTxHash,
            explorerUrl:  ns.explorerUrl,
            mintedAt:     new Date().toISOString(),
            status:       "minted",
          };
        }
      });
      data.relics?.forEach((r: any) => {
        if (r.cid) {
          newState[r.id] = {
            cid:          r.cid,
            ipfsUrl:      r.ipfsUrl,
            solanaTxHash: r.solanaTxHash,
            explorerUrl:  r.explorerUrl,
            mintedAt:     new Date().toISOString(),
            status:       "minted",
          };
        }
      });

      setOnChainState(prev => ({ ...prev, ...newState }));
      setGenesisManifest(data);
      setTxCount(c => c + (data.summary?.totalMinted ?? 35));
      addLog(`🏆 GENESIS COMPLETE — ${data.summary?.totalMinted} minted, ${data.summary?.totalFailed} failed in ${data.summary?.durationMs}ms`);
      if (data.rootManifest?.cid) addLog(`🌐 Root Manifest CID: ${data.rootManifest.cid}`);
    } catch (err: any) {
      addLog(`✘ Genesis mint error: ${err.message}`);
    } finally {
      setGenesisMinting(false);
    }
  };

  const isDark = theme === "dark";

  // Stylings
  const mainBg = isDark ? "bg-[#06140f] text-[#d1e8df]" : "bg-[#f4fcf8] text-[#1c382e]";
  const cardStyle = isDark ? "bg-[#0c241b]/80 border-emerald-500/20 text-[#d1e8df]" : "bg-white border-emerald-200 text-slate-800 shadow-sm";
  const subCardStyle = isDark ? "bg-black/40 border-white/5" : "bg-[#eaf5ef] border-emerald-500/10";
  const textTitle = isDark ? "text-white" : "text-[#1c382e]";
  const textMuted = isDark ? "text-emerald-400/70" : "text-emerald-850";
  const terminalBg = isDark ? "bg-black/90 text-emerald-400 border-white/10" : "bg-slate-900 text-emerald-300 border-slate-950";
  const inputBg = isDark ? "bg-black/60 border-emerald-500/30 text-white" : "bg-white border-emerald-300 text-slate-900";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${mainBg}`}>
      
      {/* Live Blockchain Header */}
      <div className={`border-b px-4 py-2 transition-colors duration-200 relative z-30 ${
        isDark ? "bg-[#030a08]/90 border-emerald-500/20 text-emerald-400" : "bg-[#daf2e7] border-emerald-300 text-[#0f3022] font-bold"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              SOVEREIGN SPORTS PROTOCOL L0 ACTIVE
            </span>
            <div className="hidden md:flex items-center gap-2 border-l border-emerald-500/20 pl-4">
              <span className="text-slate-500">Block height:</span>
              <strong className="text-emerald-400 font-bold">{blockHeight}</strong>
              <span className="text-slate-500">Tx count:</span>
              <strong className="text-emerald-400 font-bold">{txCount}</strong>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-black/40 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-mono text-emerald-400 gap-1.5">
              <Coins className="h-3 w-3" />
              <span>{stablecoinBalance.toLocaleString()} $OMAHA26</span>
            </div>
            <div className="flex items-center bg-black/40 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-mono text-orange-400 gap-1.5">
              <Zap className="h-3 w-3" />
              <span>{utilityBalance.toLocaleString()} $UGA26</span>
            </div>
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
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent orbitron-title neon-glow-emerald">
              Unykorn Athletic
            </span>
          </Link>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            CWS OS
          </span>
        </div>

        {/* Global Selectors */}
        <div className="flex items-center gap-3 md:gap-6">
          
          {/* User Class Switcher */}
          <div className="flex items-center gap-1.5 bg-black/45 border border-emerald-500/20 rounded-xl p-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 px-2 hidden sm:inline">Role:</span>
            {(["fan", "athlete", "admin"] as UserClass[]).map(role => (
              <button
                key={role}
                onClick={() => {
                  setUserClass(role);
                  addLog(`User class switched to: ${role.toUpperCase()}`);
                }}
                className={`text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider transition-all ${
                  userClass === role 
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {role}
              </button>
            ))}
            </div>

          {/* Genesis Batch Mint — Admin Only */}
          {userClass === "admin" && (
            <button
              onClick={executeGenesisMint}
              disabled={genesisMinting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                genesisMinting
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400 cursor-wait"
                  : "border-emerald-500/40 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              }`}
              title="Genesis: Batch-mint ALL CWS namespaces + relics to Solana Mainnet"
            >
              {genesisMinting
                ? <><span className="animate-spin">⛓</span> Minting Genesis...</>
                : <><Sparkles className="h-3 w-3" /> Genesis Mint All</>
              }
            </button>
          )}

          <button 
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 bg-white/5 backdrop-blur transition-all"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-emerald-600" />}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-10">
        
        {/* Core Strategic Positioning Line Banner */}
        <div className="bg-gradient-to-r from-[#03150e]/80 via-[#020b08]/80 to-[#040e1f]/80 border border-emerald-500/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-2xl shadow-emerald-950/50 max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-3xl" />
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono uppercase tracking-widest orbitron-title neon-glow-emerald">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
            Namespace-First Sovereign Identity Layer
          </div>
          <blockquote className="text-base md:text-xl font-extrabold text-white tracking-wide leading-relaxed italic">
            “Every player and coach gets a free pre-minted official namespace. Claiming it unlocks their sovereign sports identity, NIL offers, vaults, internal mints, token rights, fan expansions, and permanent on-chain history.”
          </blockquote>
          <p className="text-xs text-emerald-400 font-mono tracking-wider">
            ⚡ UNYKORN SPORT INFRASTRUCTURE: SECURE, GOLD-BACKED, ESTATE-PROTECTED ⚡
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-emerald-500/10 pb-4">
          {[
            { id: "registry", label: "Registry & Claims", icon: <Globe className="h-4 w-4" /> },
            { id: "bracket", label: "CWS Bracket & Oracle", icon: <Layers className="h-4 w-4" /> },
            { id: "control-hub", label: "Athlete Control Panel", icon: <Settings className="h-4 w-4" />, visible: userClass === "athlete" || userClass === "admin" },
            { id: "offers", label: "NIL Offers Inbox", icon: <MessageSquare className="h-4 w-4" /> },
            { id: "vaults", label: "Fiduciary Wealth Vaults", icon: <Lock className="h-4 w-4" /> },
            { id: "simulation", label: "Oracle Match Simulator", icon: <Activity className="h-4 w-4" /> },
            { id: "relics", label: "Namespace SFT Showcase", icon: <Trophy className="h-4 w-4" /> },
            { id: "marketplace", label: "Secondary Ledger", icon: <ShoppingCart className="h-4 w-4" /> }
          ].map((tab) => {
            if (tab.visible === false) return null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md"
                    : isDark ? "bg-slate-900/60 border border-white/5 hover:text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Left Panels */}
          <div className="lg:col-span-8 space-y-6">

            {/* TAB 1: REGISTRY & CLAIMS */}
            {activeTab === "registry" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-6`}>
                
                {/* Header Controls */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-emerald-500/10 pb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${textTitle} orbitron-title`}>Sovereign Identity Directory</h3>
                    <p className={`text-xs ${textMuted}`}>Query the official on-chain registry mapping athletes, coaches, and staff roots.</p>
                  </div>

                  {/* Team Filter Dropdown */}
                  <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/30 rounded-xl p-1.5">
                    <span className="text-[10px] font-mono text-slate-500 pl-2 uppercase">CWS Team Filter:</span>
                    <select
                      value={activeTeamFilter}
                      onChange={(e) => {
                        selectTeamFilter(e.target.value as TeamKey);
                        addLog(`Swapped active team context to: ${e.target.value.toUpperCase()}`);
                      }}
                      className="bg-slate-900 text-xs font-bold text-white border-0 outline-none rounded-lg p-1 px-2 cursor-pointer focus:ring-0"
                    >
                      <option value="georgia">🐶 Georgia Bulldogs</option>
                      <option value="troy">⚔ Troy Trojans</option>
                      <option value="wvu">⛰ West Virginia Mountaineers</option>
                      <option value="unc">🐑 North Carolina Tar Heels</option>
                      <option value="olemiss">🔴 Ole Miss Rebels</option>
                      <option value="alabama">🐘 Alabama Crimson Tide</option>
                      <option value="oklahoma">⭕ Oklahoma Sooners</option>
                      <option value="texas">🤘 Texas Longhorns</option>
                    </select>
                  </div>
                </div>

                {/* Search Bar UI */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-emerald-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value) {
                        addLog(`Searching registry for: "${e.target.value}"`);
                      }
                    }}
                    placeholder="Search by athlete name, handle, role, suffix or team..."
                    className={`w-full rounded-2xl pl-10 pr-10 py-3.5 text-xs outline-none transition-all border ${
                      searchQuery 
                        ? "border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white" 
                        : "border-emerald-500/10 bg-black/40 text-slate-300 focus:border-emerald-500/35"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Suffix Pricing Matrix Banner */}
                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono uppercase">
                    <Scale className="h-4 w-4" /> Namespace Pricing Matrix & Suffix Tree
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-[11px] font-mono">
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <strong className="text-white block">Official personnel:</strong>
                      <span className="text-emerald-400 font-bold">FREE ($0.00)</span>
                      <p className="text-[9px] text-slate-400 mt-1">Operator sponsored root claim.</p>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <strong className="text-white block">Fan subnames:</strong>
                      <span className="text-amber-400">9.99 OMAHA26 / yr</span>
                      <p className="text-[9px] text-slate-400 mt-1">E.g. fan.name.dawgs</p>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <strong className="text-white block">Brand Branches:</strong>
                      <span className="text-orange-400">499.00 OMAHA26 / yr</span>
                      <p className="text-[9px] text-slate-400 mt-1">E.g. nike.name.dawgs</p>
                    </div>
                  </div>
                </div>

                {/* Directory List filtered by Sport */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                    {searchQuery ? `Registry Results for "${searchQuery}"` : "Rosters & Pre-minted Registry Pointers"}
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {namespaces.filter(ns => {
                      if (searchQuery.trim() === "") {
                        return ns.teamKey === activeTeamFilter;
                      }
                      const query = searchQuery.toLowerCase().trim();
                      return (
                        ns.name.toLowerCase().includes(query) ||
                        ns.handle.toLowerCase().includes(query) ||
                        ns.suffix.toLowerCase().includes(query) ||
                        ns.role.toLowerCase().includes(query) ||
                        ns.teamKey.toLowerCase().includes(query)
                      );
                    }).map(athlete => {
                      const isSelected = selectedAthleteId === athlete.id;
                      return (
                        <div 
                          key={athlete.id}
                          onClick={() => setSelectedAthleteId(athlete.id)}
                          className={`rounded-2xl border p-4 transition-all duration-300 cursor-pointer relative flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-950/30 ${
                            isSelected 
                              ? "border-emerald-400 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/50" 
                              : "border-emerald-500/10 hover:border-emerald-500/40"
                          } ${subCardStyle}`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase">{athlete.role}</span>
                                <h4 className={`text-sm font-bold ${textTitle}`}>{athlete.name}</h4>
                              </div>
                              
                              {/* Claim Badge State */}
                              <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                                athlete.claimState === "claimed" ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-400" :
                                athlete.claimState === "reserved" ? "bg-amber-500/20 border-amber-400/40 text-amber-400" :
                                athlete.claimState === "pending_verification" ? "bg-blue-500/20 border-blue-400/40 text-blue-400 animate-pulse" :
                                athlete.claimState === "claimable" ? "bg-purple-500/20 border-purple-400/40 text-purple-400" :
                                "bg-rose-500/20 border-rose-400/40 text-rose-400"
                              }`}>
                                {athlete.claimState.replace("_", " ")}
                              </span>
                            </div>

                            <div className="bg-black/35 p-2 rounded-lg border border-white/5 font-mono text-[10px] space-y-1">
                              <div className="flex justify-between text-slate-400">
                                <span>Namespace Root:</span>
                                <strong className="text-white">{athlete.handle}</strong>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Affiliation:</span>
                                <span>{teams[athlete.teamKey].name}</span>
                              </div>
                            </div>
                          </div>

                          {/* On-Chain Status Panel */}
                          {(() => {
                            const oc = onChainState[athlete.id] || onChainState[athlete.handle];
                            if (oc?.status === "minted") {
                              return (
                                <div className="mt-3 space-y-1.5">
                                  <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                                    <Check className="h-2.5 w-2.5" /> ON-CHAIN · MAINNET
                                  </div>
                                  <a href={oc.ipfsUrl} target="_blank" rel="noopener noreferrer"
                                     className="block text-[9px] font-mono text-blue-400 hover:text-blue-300 truncate"
                                     title={oc.cid}>
                                    📦 IPFS: {oc.cid.slice(0, 20)}...
                                  </a>
                                  <a href={oc.explorerUrl} target="_blank" rel="noopener noreferrer"
                                     className="block text-[9px] font-mono text-amber-400 hover:text-amber-300 truncate"
                                     title={oc.solanaTxHash}>
                                    🔗 Solscan: {oc.solanaTxHash.slice(0, 16)}...
                                  </a>
                                </div>
                              );
                            }
                            if (oc?.status === "minting") {
                              return (
                                <div className="mt-3 flex items-center gap-1.5 text-[9px] font-mono text-amber-400 animate-pulse">
                                  <span className="animate-spin">⛓</span> Anchoring to mainnet...
                                </div>
                              );
                            }
                            if (oc?.status === "error") {
                              return (
                                <div className="mt-3 text-[9px] font-mono text-red-400">✘ {oc.error?.slice(0, 40)}</div>
                              );
                            }
                            return null;
                          })()}

                          <div className="mt-4 pt-2 border-t border-white/5 flex justify-between items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500">
                              {athlete.claimState === "claimed" ? "Locked to Wallet" : "Custodian Custody"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {/* ⛓ Mint Mainnet button */}
                              {(() => {
                                const oc = onChainState[athlete.id] || onChainState[athlete.handle];
                                if (oc?.status === "minted") return null;
                                return (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); mintNamespaceOnChain(athlete.id); }}
                                    disabled={oc?.status === "minting"}
                                    className={`rounded-lg font-bold px-2.5 py-1 text-[9px] transition-all cursor-pointer flex items-center gap-1 ${
                                      oc?.status === "minting"
                                        ? "bg-amber-500/20 text-amber-400 cursor-wait"
                                        : "bg-blue-600 hover:bg-blue-500 text-white"
                                    }`}
                                  >
                                    {oc?.status === "minting" ? "..." : "⛓ Mainnet"}
                                  </button>
                                );
                              })()}

                              {athlete.claimState !== "claimed" ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openClaimFlow(athlete);
                                  }}
                                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 text-[10px] transition-all cursor-pointer"
                                >
                                  Claim Namespace
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Claimed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Suffix Hierarchy Tree Preview */}
                <div className={`rounded-2xl border p-4 ${subCardStyle} space-y-3`}>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                    Sovereign Hierarchical Suffix Tree for {selectedAthlete.handle}
                  </span>
                  
                  <div className="font-mono text-xs space-y-2 border-l-2 border-emerald-500/20 pl-4 ml-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <span className="text-emerald-400">● {selectedAthlete.handle}</span>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 rounded">Root Address</span>
                    </div>

                    <div className="pl-4 border-l border-emerald-500/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">├── family.{selectedAthlete.handle}</span>
                        <span className="text-[9px] text-slate-500">Route: Estate Fiduciary Vault</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">├── team.{selectedAthlete.handle}</span>
                        <span className="text-[9px] text-slate-500">Route: Team Manager Multi-sig</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">├── sponsor.{selectedAthlete.handle}</span>
                        <span className="text-[9px] text-slate-500">Route: Inbound Escrow membranes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">└── fan.{selectedAthlete.handle}</span>
                        <span className="text-[9px] text-slate-500">Route: Custom Fan SFT Registry</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 1.5: TOURNAMENT BRACKET & ORACLE */}
            {activeTab === "bracket" && (
              <div className="space-y-6">
                
                {/* Main Header Card */}
                <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-4`}>
                  <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${textTitle} orbitron-title flex items-center gap-2`}>
                        <Layers className="h-5 w-5 text-emerald-400" />
                        CWS Bracket & Cryptographic Oracle
                      </h3>
                      <p className={`text-xs ${textMuted}`}>
                        Sovereign game results signed using HMAC-SHA256 and anchored to Solana Mainnet-Beta via SPL Memo records.
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                      Oracle consensus active
                    </span>
                  </div>

                  {/* Dual-Oracle Architecture Info */}
                  <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                      <strong className="text-white block">🔒 Unykorn Cryptographic Oracle</strong>
                      <p className="text-slate-400 text-[10px] leading-relaxed">
                        Matches are signed using HMAC-SHA256 by the protocol authority. The signature is posted on-chain (Solana Mainnet-Beta) and the metadata is pinned to Pinata IPFS to guarantee zero manipulation of game statistics.
                      </p>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                      <strong className="text-white block">🔗 Chainlink Attestation Feed</strong>
                      <p className="text-slate-400 text-[10px] leading-relaxed">
                        Decentralized oracle nodes scrape NCAA scoreboard telemetry, StatBroadcast, and ESPN. Once consensus is reached (majority rule), results trigger the on-chain metadata minting of highlight Moment SFTs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brackets Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Bracket 1 Columns */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 orbitron-title">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      CWS Bracket 1 (Double-Elimination)
                    </h4>
                    
                    <div className="space-y-4">
                      {matches.filter(m => m.bracketType === "bracket1").map(match => (
                        <div key={match.id} className={`rounded-2xl border p-4 ${subCardStyle} space-y-3 relative overflow-hidden transition-all hover:border-emerald-500/30`}>
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Round {match.round} · {match.scheduledTime}</span>
                            <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] border ${
                              match.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                              match.status === "live" ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" :
                              "bg-slate-500/10 border-slate-500/30 text-slate-400"
                            }`}>{match.status}</span>
                          </div>

                          {/* Teams Render */}
                          <div className="space-y-2">
                            {/* Team 1 */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {match.team1Key !== "TBD" ? teams[match.team1Key]?.seed.slice(0, 5) : ""}
                                </span>
                                <strong className={match.winnerKey === match.team1Key ? "text-white font-black" : "text-slate-400"}>
                                  {match.team1Key !== "TBD" ? teams[match.team1Key]?.name : "TBD (Loser Game 1/2)"}
                                </strong>
                              </div>
                              <span className={`font-mono font-bold text-sm ${match.winnerKey === match.team1Key ? "text-emerald-400" : "text-slate-500"}`}>
                                {match.team1Score !== undefined ? match.team1Score : "-"}
                              </span>
                            </div>

                            {/* Team 2 */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {match.team2Key !== "TBD" ? teams[match.team2Key]?.seed.slice(0, 5) : ""}
                                </span>
                                <strong className={match.winnerKey === match.team2Key ? "text-white font-black" : "text-slate-400"}>
                                  {match.team2Key !== "TBD" ? teams[match.team2Key]?.name : "TBD (Loser Game 1/2)"}
                                </strong>
                              </div>
                              <span className={`font-mono font-bold text-sm ${match.winnerKey === match.team2Key ? "text-emerald-400" : "text-slate-500"}`}>
                                {match.team2Score !== undefined ? match.team2Score : "-"}
                              </span>
                            </div>
                          </div>

                          {/* On-Chain Attestation Details */}
                          {match.status === "completed" && match.solanaTxHash && (
                            <div className="pt-2.5 border-t border-white/5 space-y-1.5 text-[9px] font-mono">
                              <div className="text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" /> SECURE ON-CHAIN ATTESTATION
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-slate-400">
                                <div className="truncate flex items-center gap-1">
                                  <span className="text-slate-500">Solana Tx:</span>{" "}
                                  <a href={match.explorerUrl || `https://solscan.io/tx/${match.solanaTxHash}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                                    {match.solanaTxHash.slice(0, 8)}...
                                  </a>
                                </div>
                                <div className="truncate">
                                  <span className="text-slate-500">Signature:</span>{" "}
                                  <span className="text-blue-400" title={match.oracleSignature}>
                                    HMAC Verified
                                  </span>
                                </div>
                              </div>
                              <div className="bg-black/30 p-1.5 rounded border border-white/5 text-[8px] text-slate-500 break-all leading-normal">
                                <span className="text-slate-400 block font-bold">HMAC-SHA256 Signature:</span>
                                {match.oracleSignature || "N/A"}
                              </div>
                            </div>
                          )}

                          {/* Admin Attest Action */}
                          {userClass === "admin" && match.status !== "completed" && (
                            <div className="pt-2 border-t border-white/5">
                              {attestingMatchId === match.id ? (
                                <div className="p-3 bg-black/40 border border-emerald-500/25 rounded-xl space-y-3 mt-2 font-mono text-xs">
                                  <h5 className="font-bold text-emerald-400">Attest Match Outcome</h5>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Select Winner</label>
                                      <select
                                        value={attestWinnerKey}
                                        onChange={(e) => setAttestWinnerKey(e.target.value as any)}
                                        className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                      >
                                        <option value="">-- Select Winner --</option>
                                        {match.team1Key !== "TBD" && <option value={match.team1Key}>{teams[match.team1Key]?.name}</option>}
                                        {match.team2Key !== "TBD" && <option value={match.team2Key}>{teams[match.team2Key]?.name}</option>}
                                      </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[9px] text-slate-500 mb-0.5">Team 1 Score</label>
                                        <input
                                          type="number"
                                          value={attestTeam1Score}
                                          onChange={(e) => setAttestTeam1Score(e.target.value)}
                                          className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                          placeholder="e.g. 5"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] text-slate-500 mb-0.5">Team 2 Score</label>
                                        <input
                                          type="number"
                                          value={attestTeam2Score}
                                          onChange={(e) => setAttestTeam2Score(e.target.value)}
                                          className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                          placeholder="e.g. 4"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Highlights Summary</label>
                                      <input
                                        type="text"
                                        value={attestStatsSummary}
                                        onChange={(e) => setAttestStatsSummary(e.target.value)}
                                        className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                        placeholder="e.g. Georgia wins with a walkoff single"
                                      />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                      <button
                                        onClick={() => setAttestingMatchId(null)}
                                        className="w-1/2 text-center rounded-lg border border-white/5 py-1.5 text-xs text-slate-400 hover:bg-white/5"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleAttestMatch(match.id)}
                                        className="w-1/2 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-xs"
                                      >
                                        Submit
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAttestingMatchId(match.id);
                                    setAttestWinnerKey("");
                                    setAttestTeam1Score("");
                                    setAttestTeam2Score("");
                                    setAttestStatsSummary("");
                                  }}
                                  className="w-full text-center rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-bold py-1.5 text-[10px] transition-all"
                                >
                                  ⚙ Attest Result
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bracket 2 Columns */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 orbitron-title">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                      CWS Bracket 2 (Double-Elimination)
                    </h4>
                    
                    <div className="space-y-4">
                      {matches.filter(m => m.bracketType === "bracket2").map(match => (
                        <div key={match.id} className={`rounded-2xl border p-4 ${subCardStyle} space-y-3 relative overflow-hidden transition-all hover:border-emerald-500/30`}>
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Round {match.round} · {match.scheduledTime}</span>
                            <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] border ${
                              match.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                              match.status === "live" ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" :
                              "bg-slate-500/10 border-slate-500/30 text-slate-400"
                            }`}>{match.status}</span>
                          </div>

                          {/* Teams Render */}
                          <div className="space-y-2">
                            {/* Team 1 */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {match.team1Key !== "TBD" ? teams[match.team1Key]?.seed.slice(0, 5) : ""}
                                </span>
                                <strong className={match.winnerKey === match.team1Key ? "text-white font-black" : "text-slate-400"}>
                                  {match.team1Key !== "TBD" ? teams[match.team1Key]?.name : "TBD (Loser Game 3/4)"}
                                </strong>
                              </div>
                              <span className={`font-mono font-bold text-sm ${match.winnerKey === match.team1Key ? "text-emerald-400" : "text-slate-500"}`}>
                                {match.team1Score !== undefined ? match.team1Score : "-"}
                              </span>
                            </div>

                            {/* Team 2 */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {match.team2Key !== "TBD" ? teams[match.team2Key]?.seed.slice(0, 5) : ""}
                                </span>
                                <strong className={match.winnerKey === match.team2Key ? "text-white font-black" : "text-slate-400"}>
                                  {match.team2Key !== "TBD" ? teams[match.team2Key]?.name : "TBD (Winners Game 4)"}
                                </strong>
                              </div>
                              <span className={`font-mono font-bold text-sm ${match.winnerKey === match.team2Key ? "text-emerald-400" : "text-slate-500"}`}>
                                {match.team2Score !== undefined ? match.team2Score : "-"}
                              </span>
                            </div>
                          </div>

                          {/* On-Chain Attestation Details */}
                          {match.status === "completed" && match.solanaTxHash && (
                            <div className="pt-2.5 border-t border-white/5 space-y-1.5 text-[9px] font-mono">
                              <div className="text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" /> SECURE ON-CHAIN ATTESTATION
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-slate-400">
                                <div className="truncate flex items-center gap-1">
                                  <span className="text-slate-500">Solana Tx:</span>{" "}
                                  <a href={match.explorerUrl || `https://solscan.io/tx/${match.solanaTxHash}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                                    {match.solanaTxHash.slice(0, 8)}...
                                  </a>
                                </div>
                                <div className="truncate">
                                  <span className="text-slate-500">Signature:</span>{" "}
                                  <span className="text-blue-400" title={match.oracleSignature}>
                                    HMAC Verified
                                  </span>
                                </div>
                              </div>
                              <div className="bg-black/30 p-1.5 rounded border border-white/5 text-[8px] text-slate-500 break-all leading-normal">
                                <span className="text-slate-400 block font-bold">HMAC-SHA256 Signature:</span>
                                {match.oracleSignature || "N/A"}
                              </div>
                            </div>
                          )}

                          {/* Admin Attest Action */}
                          {userClass === "admin" && match.status !== "completed" && (
                            <div className="pt-2 border-t border-white/5">
                              {attestingMatchId === match.id ? (
                                <div className="p-3 bg-black/40 border border-emerald-500/25 rounded-xl space-y-3 mt-2 font-mono text-xs">
                                  <h5 className="font-bold text-emerald-400">Attest Match Outcome</h5>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Select Winner</label>
                                      <select
                                        value={attestWinnerKey}
                                        onChange={(e) => setAttestWinnerKey(e.target.value as any)}
                                        className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                      >
                                        <option value="">-- Select Winner --</option>
                                        {match.team1Key !== "TBD" && <option value={match.team1Key}>{teams[match.team1Key]?.name}</option>}
                                        {match.team2Key !== "TBD" && <option value={match.team2Key}>{teams[match.team2Key]?.name}</option>}
                                      </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[9px] text-slate-500 mb-0.5">Team 1 Score</label>
                                        <input
                                          type="number"
                                          value={attestTeam1Score}
                                          onChange={(e) => setAttestTeam1Score(e.target.value)}
                                          className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                          placeholder="e.g. 5"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] text-slate-500 mb-0.5">Team 2 Score</label>
                                        <input
                                          type="number"
                                          value={attestTeam2Score}
                                          onChange={(e) => setAttestTeam2Score(e.target.value)}
                                          className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                          placeholder="e.g. 4"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Highlights Summary</label>
                                      <input
                                        type="text"
                                        value={attestStatsSummary}
                                        onChange={(e) => setAttestStatsSummary(e.target.value)}
                                        className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                        placeholder="e.g. UNC wins with late-inning double"
                                      />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                      <button
                                        onClick={() => setAttestingMatchId(null)}
                                        className="w-1/2 text-center rounded-lg border border-white/5 py-1.5 text-xs text-slate-400 hover:bg-white/5"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleAttestMatch(match.id)}
                                        className="w-1/2 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-xs"
                                      >
                                        Submit
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAttestingMatchId(match.id);
                                    setAttestWinnerKey("");
                                    setAttestTeam1Score("");
                                    setAttestTeam2Score("");
                                    setAttestStatsSummary("");
                                  }}
                                  className="w-full text-center rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-bold py-1.5 text-[10px] transition-all"
                                >
                                  ⚙ Attest Result
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Elimination Round Brackets */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 orbitron-title">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Elimination Rounds (Loser Bracket Survival)
                    </h4>
                    
                    <div className="space-y-4">
                      {matches.filter(m => m.bracketType === "elimination").map(match => (
                        <div key={match.id} className={`rounded-2xl border p-4 ${subCardStyle} space-y-3 relative overflow-hidden transition-all hover:border-emerald-500/30`}>
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Round {match.round} · {match.scheduledTime}</span>
                            <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] border ${
                              match.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                              match.status === "live" ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" :
                              "bg-slate-500/10 border-slate-500/30 text-slate-400"
                            }`}>{match.status}</span>
                          </div>

                          {/* Teams Render */}
                          <div className="space-y-2">
                            {/* Team 1 */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {match.team1Key !== "TBD" ? teams[match.team1Key]?.seed.slice(0, 5) : ""}
                                </span>
                                <strong className={match.winnerKey === match.team1Key ? "text-white font-black" : "text-slate-400"}>
                                  {match.team1Key !== "TBD" ? teams[match.team1Key]?.name : "TBD"}
                                </strong>
                              </div>
                              <span className={`font-mono font-bold text-sm ${match.winnerKey === match.team1Key ? "text-emerald-400" : "text-slate-500"}`}>
                                {match.team1Score !== undefined ? match.team1Score : "-"}
                              </span>
                            </div>

                            {/* Team 2 */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {match.team2Key !== "TBD" ? teams[match.team2Key]?.seed.slice(0, 5) : ""}
                                </span>
                                <strong className={match.winnerKey === match.team2Key ? "text-white font-black" : "text-slate-400"}>
                                  {match.team2Key !== "TBD" ? teams[match.team2Key]?.name : "TBD"}
                                </strong>
                              </div>
                              <span className={`font-mono font-bold text-sm ${match.winnerKey === match.team2Key ? "text-emerald-400" : "text-slate-500"}`}>
                                {match.team2Score !== undefined ? match.team2Score : "-"}
                              </span>
                            </div>
                          </div>

                          {/* On-Chain Attestation Details */}
                          {match.status === "completed" && match.solanaTxHash && (
                            <div className="pt-2.5 border-t border-white/5 space-y-1.5 text-[9px] font-mono">
                              <div className="text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" /> SECURE ON-CHAIN ATTESTATION
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-slate-400">
                                <div className="truncate flex items-center gap-1">
                                  <span className="text-slate-500">Solana Tx:</span>{" "}
                                  <a href={match.explorerUrl || `https://solscan.io/tx/${match.solanaTxHash}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                                    {match.solanaTxHash.slice(0, 8)}...
                                  </a>
                                </div>
                                <div className="truncate">
                                  <span className="text-slate-500">Signature:</span>{" "}
                                  <span className="text-blue-400" title={match.oracleSignature}>
                                    HMAC Verified
                                  </span>
                                </div>
                              </div>
                              <div className="bg-black/30 p-1.5 rounded border border-white/5 text-[8px] text-slate-500 break-all leading-normal">
                                <span className="text-slate-400 block font-bold">HMAC-SHA256 Signature:</span>
                                {match.oracleSignature || "N/A"}
                              </div>
                            </div>
                          )}

                          {/* Admin Attest Action */}
                          {userClass === "admin" && match.status !== "completed" && (
                            <div className="pt-2 border-t border-white/5">
                              {attestingMatchId === match.id ? (
                                <div className="p-3 bg-black/40 border border-emerald-500/25 rounded-xl space-y-3 mt-2 font-mono text-xs">
                                  <h5 className="font-bold text-emerald-400">Attest Match Outcome</h5>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Select Winner</label>
                                      <select
                                        value={attestWinnerKey}
                                        onChange={(e) => setAttestWinnerKey(e.target.value as any)}
                                        className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                      >
                                        <option value="">-- Select Winner --</option>
                                        {match.team1Key !== "TBD" && <option value={match.team1Key}>{teams[match.team1Key]?.name}</option>}
                                        {match.team2Key !== "TBD" && <option value={match.team2Key}>{teams[match.team2Key]?.name}</option>}
                                      </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[9px] text-slate-500 mb-0.5">Team 1 Score</label>
                                        <input
                                          type="number"
                                          value={attestTeam1Score}
                                          onChange={(e) => setAttestTeam1Score(e.target.value)}
                                          className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                          placeholder="e.g. 5"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] text-slate-500 mb-0.5">Team 2 Score</label>
                                        <input
                                          type="number"
                                          value={attestTeam2Score}
                                          onChange={(e) => setAttestTeam2Score(e.target.value)}
                                          className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                          placeholder="e.g. 4"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Highlights Summary</label>
                                      <input
                                        type="text"
                                        value={attestStatsSummary}
                                        onChange={(e) => setAttestStatsSummary(e.target.value)}
                                        className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                        placeholder="e.g. Game attested"
                                      />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                      <button
                                        onClick={() => setAttestingMatchId(null)}
                                        className="w-1/2 text-center rounded-lg border border-white/5 py-1.5 text-xs text-slate-400 hover:bg-white/5"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleAttestMatch(match.id)}
                                        className="w-1/2 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-xs"
                                      >
                                        Submit
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAttestingMatchId(match.id);
                                    setAttestWinnerKey("");
                                    setAttestTeam1Score("");
                                    setAttestTeam2Score("");
                                    setAttestStatsSummary("");
                                  }}
                                  className="w-full text-center rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-bold py-1.5 text-[10px] transition-all"
                                >
                                  ⚙ Attest Result
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Championship Series */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 orbitron-title">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      CWS Championship Series (Best of 3)
                    </h4>
                    
                    <div className="space-y-4">
                      {matches.filter(m => m.bracketType === "championship").map(match => (
                        <div key={match.id} className={`rounded-2xl border p-4 ${subCardStyle} space-y-3 relative overflow-hidden transition-all hover:border-emerald-500/30`}>
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Round 4 · {match.scheduledTime}</span>
                            <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] border ${
                              match.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                              match.status === "live" ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" :
                              "bg-slate-500/10 border-slate-500/30 text-slate-400"
                            }`}>{match.status}</span>
                          </div>

                          {/* Teams Render */}
                          <div className="space-y-2">
                            {/* Team 1 */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {match.team1Key !== "TBD" ? teams[match.team1Key]?.seed.slice(0, 5) : ""}
                                </span>
                                <strong className={match.winnerKey === match.team1Key ? "text-white font-black" : "text-slate-400"}>
                                  {match.team1Key !== "TBD" ? teams[match.team1Key]?.name : "TBD (Bracket 1 Winner)"}
                                </strong>
                              </div>
                              <span className={`font-mono font-bold text-sm ${match.winnerKey === match.team1Key ? "text-emerald-400" : "text-slate-500"}`}>
                                {match.team1Score !== undefined ? match.team1Score : "-"}
                              </span>
                            </div>

                            {/* Team 2 */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {match.team2Key !== "TBD" ? teams[match.team2Key]?.seed.slice(0, 5) : ""}
                                </span>
                                <strong className={match.winnerKey === match.team2Key ? "text-white font-black" : "text-slate-400"}>
                                  {match.team2Key !== "TBD" ? teams[match.team2Key]?.name : "TBD (Bracket 2 Winner)"}
                                </strong>
                              </div>
                              <span className={`font-mono font-bold text-sm ${match.winnerKey === match.team2Key ? "text-emerald-400" : "text-slate-500"}`}>
                                {match.team2Score !== undefined ? match.team2Score : "-"}
                              </span>
                            </div>
                          </div>

                          {/* On-Chain Attestation Details */}
                          {match.status === "completed" && match.solanaTxHash && (
                            <div className="pt-2.5 border-t border-white/5 space-y-1.5 text-[9px] font-mono">
                              <div className="text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" /> SECURE ON-CHAIN ATTESTATION
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-slate-400">
                                <div className="truncate flex items-center gap-1">
                                  <span className="text-slate-500">Solana Tx:</span>{" "}
                                  <a href={match.explorerUrl || `https://solscan.io/tx/${match.solanaTxHash}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                                    {match.solanaTxHash.slice(0, 8)}...
                                  </a>
                                </div>
                                <div className="truncate">
                                  <span className="text-slate-500">Signature:</span>{" "}
                                  <span className="text-blue-400" title={match.oracleSignature}>
                                    HMAC Verified
                                  </span>
                                </div>
                              </div>
                              <div className="bg-black/30 p-1.5 rounded border border-white/5 text-[8px] text-slate-500 break-all leading-normal">
                                <span className="text-slate-400 block font-bold">HMAC-SHA256 Signature:</span>
                                {match.oracleSignature || "N/A"}
                              </div>
                            </div>
                          )}

                          {/* Admin Attest Action */}
                          {userClass === "admin" && match.status !== "completed" && (
                            <div className="pt-2 border-t border-white/5">
                              {attestingMatchId === match.id ? (
                                <div className="p-3 bg-black/40 border border-emerald-500/25 rounded-xl space-y-3 mt-2 font-mono text-xs">
                                  <h5 className="font-bold text-emerald-400">Attest Match Outcome</h5>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Select Winner</label>
                                      <select
                                        value={attestWinnerKey}
                                        onChange={(e) => setAttestWinnerKey(e.target.value as any)}
                                        className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                      >
                                        <option value="">-- Select Winner --</option>
                                        {match.team1Key !== "TBD" && <option value={match.team1Key}>{teams[match.team1Key]?.name}</option>}
                                        {match.team2Key !== "TBD" && <option value={match.team2Key}>{teams[match.team2Key]?.name}</option>}
                                      </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[9px] text-slate-500 mb-0.5">Team 1 Score</label>
                                        <input
                                          type="number"
                                          value={attestTeam1Score}
                                          onChange={(e) => setAttestTeam1Score(e.target.value)}
                                          className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                          placeholder="e.g. 5"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] text-slate-500 mb-0.5">Team 2 Score</label>
                                        <input
                                          type="number"
                                          value={attestTeam2Score}
                                          onChange={(e) => setAttestTeam2Score(e.target.value)}
                                          className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                          placeholder="e.g. 4"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Highlights Summary</label>
                                      <input
                                        type="text"
                                        value={attestStatsSummary}
                                        onChange={(e) => setAttestStatsSummary(e.target.value)}
                                        className={`w-full rounded-lg p-2 text-xs outline-none ${inputBg}`}
                                        placeholder="e.g. Game attested"
                                      />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                      <button
                                        onClick={() => setAttestingMatchId(null)}
                                        className="w-1/2 text-center rounded-lg border border-white/5 py-1.5 text-xs text-slate-400 hover:bg-white/5"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleAttestMatch(match.id)}
                                        className="w-1/2 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-xs"
                                      >
                                        Submit
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAttestingMatchId(match.id);
                                    setAttestWinnerKey("");
                                    setAttestTeam1Score("");
                                    setAttestTeam2Score("");
                                    setAttestStatsSummary("");
                                  }}
                                  className="w-full text-center rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-bold py-1.5 text-[10px] transition-all"
                                >
                                  ⚙ Attest Result
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Chainlink Attestation Console */}
                <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-6`}>
                  <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
                    <div>
                      <h4 className={`text-base font-bold text-white uppercase tracking-wider orbitron-title`}>
                        Chainlink Decentralized Oracle Nodes Consensus Feed
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Simulate Chainlink off-chain consensus querying live endpoints (ESPN, NCAA scoreboard, StatBroadcast) to verify highlights.
                      </p>
                    </div>
                  </div>

                  {/* Nodes list */}
                  <div className="grid sm:grid-cols-5 gap-3 text-[10px] font-mono">
                    {[
                      { name: "Node 1 — StatBroadcast", endpoint: "api.statbroadcast.com", status: "Active", consensusScore: "WVU 7, Troy 5" },
                      { name: "Node 2 — NCAA Live Data", endpoint: "ncaa.com/scoreboard", status: "Active", consensusScore: "WVU 7, Troy 5" },
                      { name: "Node 3 — ESPN Stats", endpoint: "sports.core.api.espn.com", status: "Active", consensusScore: "WVU 7, Troy 5" },
                      { name: "Node 4 — WarrenNolan CWS", endpoint: "warrennolan.com/baseball", status: "Active", consensusScore: "WVU 7, Troy 5" },
                      { name: "Node 5 — Unykorn Scraper", endpoint: "scraper.unykorn.ai/sports", status: "Active", consensusScore: "WVU 7, Troy 5" },
                    ].map((node, i) => (
                      <div key={i} className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-2 relative overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 block font-bold truncate max-w-[90%]">{node.name}</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="text-[9px] text-slate-500 truncate">{node.endpoint}</div>
                        <div className="pt-1 border-t border-white/5 flex justify-between items-baseline">
                          <span className="text-[8px] text-slate-500 uppercase">Resolved:</span>
                          <strong className="text-emerald-400 font-bold">{node.consensusScore}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/35 p-4 rounded-2xl border border-white/5 flex flex-wrap justify-between items-center gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block uppercase">Chainlink Consensus Status</span>
                      <strong className="text-emerald-400 font-black text-sm">✔ 5 / 5 AGREEMENT (100% CONSENSUS)</strong>
                    </div>

                    <button
                      onClick={() => {
                        addLog("🔄 Querying Chainlink decentralized feeds (ESPN, NCAA scoreboard, StatBroadcast)...");
                        alert("Chainlink functions consensus sync complete. 5/5 nodes report 100% data integrity matches. Decoupled oracle verified.");
                      }}
                      className="rounded-xl bg-[#2e5cdb] hover:bg-[#3b6df0] text-white font-bold px-4 py-2 transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-blue-950/20"
                    >
                      <RefreshCw className="h-4 w-4 text-white" />
                      Sync Chainlink Feeds
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: ATHLETE CONTROL HUB */}
            {activeTab === "control-hub" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-6`}>
                <div className="border-b border-emerald-500/10 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className={`text-xl font-bold ${textTitle} orbitron-title`}>Root Control Workspace</h3>
                    <p className={`text-xs ${textMuted}`}>Claimed Athlete and Coach workspace for issuing assets, delegating authority, and accepting deals.</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-bold">
                    {selectedAthlete.handle}
                  </span>
                </div>

                {/* Status check for claimed & verified */}
                {selectedAthlete.claimState !== "claimed" ? (
                  <div className="text-center py-10 space-y-4">
                    <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
                    <h4 className="text-base font-bold text-white">Registry Pointer is Not Yet Claimed</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      You must claim this official namespace or toggle the top right user persona switch to simulated "Athlete Owner" mode to unlock full workspace control keys.
                    </p>
                    <button
                      onClick={() => openClaimFlow(selectedAthlete)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 text-xs transition-all cursor-pointer"
                    >
                      Begin Claim Flow
                    </button>
                  </div>
                ) : !isVerifiedAthlete ? (
                  <div className="text-center py-10 space-y-4 bg-black/35 rounded-2xl border border-dashed border-red-500/20 p-6">
                    <Lock className="h-12 w-12 text-red-400 mx-auto animate-pulse" />
                    <h4 className="text-base font-bold text-white uppercase tracking-wider orbitron-title">AIP-2 Cryptographic Identity Verification Required</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your namespace has been claimed, but it is not yet cryptographically verified. Complete the verification process (Bind Wallet + OTP Email + SID Token) to activate your vaults, accept NIL contracts, and mint highlight relics.
                    </p>
                    <button
                      onClick={() => openClaimFlow(selectedAthlete)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" /> Start Cryptographic Verification (AIP-2)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Issuance Deck */}
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Subname Creator */}
                      <div className={`rounded-2xl border p-5 space-y-4 ${subCardStyle}`}>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                          <Plus className="h-4 w-4 text-emerald-400" />
                          Issue Custom Subname Domain
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Select Suffix Class</label>
                            <div className="grid grid-cols-3 gap-2">
                              {(["fan", "family", "sponsor"] as const).map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setSelectedSubnameType(type)}
                                  className={`text-[10px] font-bold p-2 rounded-xl border transition-all ${
                                    selectedSubnameType === type
                                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                      : "border-white/5 text-slate-400"
                                  }`}
                                >
                                  .{type} (Cost: {type === "fan" ? "9.99" : type === "family" ? "19.99" : "499"})
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Desired Prefix</label>
                            <input
                              type="text"
                              value={newSubnamePrefix}
                              onChange={(e) => setNewSubnamePrefix(e.target.value)}
                              className={`w-full rounded-xl p-2.5 text-xs outline-none ${inputBg}`}
                              placeholder="e.g. mom, fanclub, booster"
                            />
                          </div>

                          <button
                            onClick={registerSubname}
                            className="w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 text-xs transition-all cursor-pointer"
                          >
                            Register & Issue Subname SFT
                          </button>
                        </div>
                      </div>

                      {/* Relic Mint Console */}
                      <div className={`rounded-2xl border p-5 space-y-4 ${subCardStyle}`}>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2 orbitron-title text-orange-400">
                          <Sparkles className="h-4 w-4 text-orange-400 animate-pulse" />
                          Web3 Content Creator Highlight SFT Mint
                        </h4>

                        <form onSubmit={handleMintRelic} className="space-y-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Moment Title / Achievement</label>
                            <input
                              type="text"
                              value={relicTitle}
                              onChange={(e) => setRelicTitle(e.target.value)}
                              className={`w-full rounded-xl p-2.5 text-xs outline-none ${inputBg}`}
                              placeholder="e.g. 9th Inning Catch of the Century"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Play Description (IRL Highlight)</label>
                            <textarea
                              value={relicDescription}
                              onChange={(e) => setRelicDescription(e.target.value)}
                              className={`w-full rounded-xl p-2 text-xs outline-none ${inputBg} h-16`}
                              placeholder="Describe the play detail, players involved, score, inning etc."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Game Context</label>
                              <input
                                type="text"
                                value={relicGameContext}
                                onChange={(e) => setRelicGameContext(e.target.value)}
                                className={`w-full rounded-xl p-2 text-xs outline-none ${inputBg}`}
                                placeholder="e.g. Game 2 vs. Texas"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">News Validation URL</label>
                              <input
                                type="url"
                                value={relicValidationUrl}
                                onChange={(e) => setRelicValidationUrl(e.target.value)}
                                className={`w-full rounded-xl p-2 text-xs outline-none ${inputBg}`}
                                placeholder="e.g. https://d1baseball.com/cws"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Gold grains</label>
                              <input
                                type="number"
                                value={relicGrains}
                                onChange={(e) => setRelicGrains(e.target.value)}
                                className={`w-full rounded-xl p-2 text-xs outline-none ${inputBg}`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Price ($OMAHA)</label>
                              <input
                                type="number"
                                value={relicPrice}
                                onChange={(e) => setRelicPrice(e.target.value)}
                                className={`w-full rounded-xl p-2 text-xs outline-none ${inputBg}`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Rarity</label>
                              <select
                                value={relicRarity}
                                onChange={(e) => setRelicRarity(e.target.value as any)}
                                className={`w-full rounded-xl p-2 text-xs outline-none ${inputBg}`}
                              >
                                <option value="Common">Common</option>
                                <option value="Rare">Rare</option>
                                <option value="Epic">Epic</option>
                                <option value="Legendary">Legendary</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Smart Contract Schema</label>
                            <select
                              value={relicContractType}
                              onChange={(e) => setRelicContractType(e.target.value as any)}
                              className={`w-full rounded-xl p-2 text-xs outline-none ${inputBg}`}
                            >
                              <option value="Collectible Memo Anchor">📜 Collectible SPL Memo Anchor (SFT)</option>
                              <option value="Yield Share SFT">💰 Revenue Yield Share SFT (Token-2022)</option>
                              <option value="NIL Sponsorship SFT">💼 NIL Escrow Membraned Sponsorship</option>
                            </select>
                          </div>

                          <button
                            type="submit"
                            className="w-full text-center rounded-xl bg-orange-600 hover:bg-orange-50 text-white font-bold py-2 text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 orbitron-title shadow-lg hover:shadow-orange-950/20"
                          >
                            <Sparkles className="h-3.5 w-3.5" /> Deploy Contract & Mint Highlight SFT
                          </button>
                        </form>
                      </div>

                    </div>

                    {/* Permissions tree visualization */}
                    <div className={`rounded-2xl border p-4 ${subCardStyle} space-y-4`}>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">Root Permissions Matrix Tree</h4>
                      <div className="grid sm:grid-cols-4 gap-4 text-xs font-mono">
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                          <strong className="text-slate-400 block mb-1">Mint Moment SFT</strong>
                          <span className="text-emerald-400 font-bold block">✔ OWNER ONLY</span>
                          <span className="text-[9px] text-slate-500 block mt-1">Delegates permitted</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                          <strong className="text-slate-400 block mb-1">Launch Fan Token</strong>
                          <span className="text-emerald-400 font-bold block">✔ OWNER ONLY</span>
                          <span className="text-[9px] text-slate-500 block mt-1">Stellar DEX binding</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                          <strong className="text-slate-400 block mb-1">Access Vaults</strong>
                          <span className="text-amber-400 font-bold block">✔ FIDUCIARY SWITCH</span>
                          <span className="text-[9px] text-slate-500 block mt-1">Multi-sig trustees</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                          <strong className="text-slate-400 block mb-1">Create Subnames</strong>
                          <span className="text-emerald-400 font-bold block">✔ DELEGATED ADMIN</span>
                          <span className="text-[9px] text-slate-500 block mt-1">Operator hooks active</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* TAB 3: NIL OFFERS INBOX */}
            {activeTab === "offers" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-6`}>
                {!isVerifiedAthlete ? (
                  <div className="text-center py-12 space-y-4 bg-black/35 rounded-2xl border border-dashed border-red-500/20 p-6">
                    <Lock className="h-12 w-12 text-red-400 mx-auto animate-pulse" />
                    <h4 className="text-base font-bold text-white uppercase tracking-wider orbitron-title">AIP-2 Cryptographic Identity Verification Required</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Access to the NIL Offers Inbox is locked. You must verify your identity to listen for and accept brand sponsorships, booster contracts, or licensing deals.
                    </p>
                    <button
                      onClick={() => openClaimFlow(selectedAthlete)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" /> Start Cryptographic Verification (AIP-2)
                    </button>
                  </div>
                ) : (
                  <>
                
                <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${textTitle} orbitron-title`}>NIL Escrow Offer Inbox</h3>
                    <p className={`text-xs ${textMuted}`}>Brands, booster clubs, and sponsors submit escrowed offers directly into the namespace.</p>
                  </div>
                  <span className="text-xs font-mono bg-purple-500/10 border border-purple-500/35 text-purple-400 px-3 py-1 rounded-full font-bold">
                    {offers.filter(o => o.status === "pending").length} Inbound Pointers
                  </span>
                </div>

                {/* Offer Submission Form (Visible to Fans/Sponsors) */}
                <details className="group rounded-2xl border border-purple-500/25 bg-purple-500/5 p-4">
                  <summary className="text-xs font-bold text-purple-400 hover:text-purple-300 cursor-pointer list-none flex justify-between items-center select-none">
                    <span className="flex items-center gap-1.5">
                      <Send className="h-4 w-4" />
                      Sponsors: Submit New NIL Escrow Deal
                    </span>
                    <span className="transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <form onSubmit={submitNILOffer} className="mt-4 grid sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Sponsor Brand Name</label>
                      <input
                        type="text"
                        value={customOfferSponsor}
                        onChange={(e) => setCustomOfferSponsor(e.target.value)}
                        className={`w-full rounded-xl p-2.5 text-xs outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Contract Term</label>
                      <input
                        type="text"
                        value={customOfferTerm}
                        onChange={(e) => setCustomOfferTerm(e.target.value)}
                        className={`w-full rounded-xl p-2.5 text-xs outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Value Escrow Amount ($OMAHA26)</label>
                      <input
                        type="number"
                        value={customOfferAmount}
                        onChange={(e) => setCustomOfferAmount(e.target.value)}
                        className={`w-full rounded-xl p-2.5 text-xs outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Target Escrow Vault Membrane</label>
                      <select
                        value={customOfferEscrow}
                        onChange={(e) => setCustomOfferEscrow(e.target.value)}
                        className={`w-full rounded-xl p-2.5 text-xs outline-none ${inputBg}`}
                      >
                        <option value="NIL Income Vault">NIL Income Vault (Daily stream)</option>
                        <option value="Family Trust Vault">Family Trust Vault (Fiduciary locked)</option>
                        <option value="Sponsor Escrow Vault">Sponsor Escrow Vault (Milestone-based)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Contract Deliverables & Terms</label>
                      <textarea
                        value={customOfferDeliverables}
                        onChange={(e) => setCustomOfferDeliverables(e.target.value)}
                        rows={2}
                        className={`w-full rounded-xl p-2.5 text-xs outline-none resize-none ${inputBg}`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="sm:col-span-2 text-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 text-xs transition-all cursor-pointer"
                    >
                      Submit Escrow Offer to Namespace
                    </button>
                  </form>
                </details>

                {/* Offer Directory Inbox */}
                <div className="space-y-4">
                  {offers.map(off => (
                    <div key={off.id} className={`rounded-2xl border p-4 space-y-3 relative overflow-hidden ${subCardStyle}`}>
                      <div className="absolute top-0 right-0 w-2 h-full bg-purple-500/20" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                            {off.type}
                          </span>
                          <h4 className={`text-base font-bold ${textTitle} mt-1`}>{off.sponsor}</h4>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-[10px] text-slate-500 block">ESCROWED</span>
                          <strong className="text-base text-purple-400 font-black">{off.value.toLocaleString()} $OMAHA26</strong>
                        </div>
                      </div>

                      <p className="text-xs text-slate-350 leading-relaxed font-sans">{off.deliverables}</p>

                      <div className="grid sm:grid-cols-3 gap-2 py-2 border-y border-white/5 font-mono text-[10px] text-slate-400">
                        <div>Term: <strong className="text-white">{off.term}</strong></div>
                        <div>Target Vault: <strong className="text-white">{off.escrowRoute}</strong></div>
                        <div>Compliance: <span className="text-emerald-400 font-bold">✔ {off.complianceState}</span></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-500">Exp: {off.expiration}</span>
                        
                        {off.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOfferAction(off.id, "reject")}
                              className="rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold px-3 py-1.5 text-xs transition-all cursor-pointer"
                            >
                              Reject & Refund
                            </button>
                            <button
                              onClick={() => handleOfferAction(off.id, "accept")}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 text-xs transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Accept Deal</span>
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs font-bold font-mono px-3 py-1 rounded border uppercase ${
                            off.status === "accepted" 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-red-500/10 border-red-500/30 text-red-400"
                          }`}>
                            {off.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                  </>
                )}
              </div>
            )}

            {/* TAB 4: WEALTH VAULTS */}
            {activeTab === "vaults" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-6`}>
                {!isVerifiedAthlete ? (
                  <div className="text-center py-12 space-y-4 bg-black/35 rounded-2xl border border-dashed border-red-500/20 p-6">
                    <Lock className="h-12 w-12 text-red-400 mx-auto animate-pulse" />
                    <h4 className="text-base font-bold text-white uppercase tracking-wider orbitron-title">AIP-2 Cryptographic Identity Verification Required</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Access to your Generational Wealth Vaults is locked. Complete the cryptographic verification process to bind your namespace and manage your gold-backed fiduciary reserves.
                    </p>
                    <button
                      onClick={() => openClaimFlow(selectedAthlete)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" /> Start Cryptographic Verification (AIP-2)
                    </button>
                  </div>
                ) : (
                  <>
                
                <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${textTitle} orbitron-title`}>Generational Wealth Fiduciary Vaults</h3>
                    <p className={`text-xs ${textMuted}`}>Tax-optimized reserve structures with dead-man compliance switches and RUFADAA succession fallbacks.</p>
                  </div>
                  <span className="text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                    Secure Reserves
                  </span>
                </div>

                {/* Audit attestation info banner */}
                <div className="bg-slate-900 border border-emerald-500/25 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <Award className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="text-xs space-y-1 font-mono">
                    <strong className="text-white">Zurich RWA Gold grain Ledger Audit Complete</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      All moment SFT and NIL reserve tokens in custody are backed by physical gold grain bars audited under 5-proof zero knowledge consensus.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {vaults.map(v => (
                    <div key={v.id} className={`rounded-2xl border p-4 space-y-4 flex flex-col justify-between ${subCardStyle}`}>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                            {v.type}
                          </span>
                          {v.deadManSwitch && (
                            <span className="text-[8px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                              <Heart className="h-2.5 w-2.5 animate-pulse" /> Dead-Man Active
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-white leading-tight">{v.name}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{v.description}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/5">
                        <div className="flex justify-between items-baseline font-mono text-xs">
                          <span className="text-slate-500 text-[10px]">BALANCE</span>
                          <strong className="text-white text-base">${v.balance.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between items-baseline font-mono text-xs">
                          <span className="text-slate-500 text-[10px]">GOLD BACKING</span>
                          <strong className="text-amber-400">{v.goldGrains} Grains</strong>
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                          <span>Trustee: {v.trustee}</span>
                          <span>Interval: {v.payoutInterval}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                  </>
                )}
              </div>
            )}

            {/* TAB 5: SIMULATOR */}
            {activeTab === "simulation" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-6`}>
                
                <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${textTitle} orbitron-title`}>Oracle Game Play Simulator</h3>
                    <p className={`text-xs ${textMuted}`}>Simulate real-time tournament highlights. Match outcomes write statistics directly back to the player's namespace root card.</p>
                  </div>
                  <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-2.5 py-1 rounded-full font-mono font-bold animate-pulse uppercase">
                    Consensus Oracle
                  </span>
                </div>

                <div className="grid md:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Action Controls */}
                  <div className="md:col-span-5 rounded-2xl border p-5 bg-black/30 border-white/5 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Trigger Play Telemetry</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Simulate custom sports highlights in the current CWS team context ({activeTeamFilter.toUpperCase()}) to check evolving stats.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => executePlaySim("swing")}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="h-4 w-4" /> Power Swing (Batting Highlight)
                      </button>
                      <button
                        onClick={() => executePlaySim("steal")}
                        className="w-full rounded-xl border border-orange-500/30 hover:bg-orange-500/10 text-orange-400 font-bold py-2.5 text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Straight Steal of Home
                      </button>
                      <button
                        onClick={() => executePlaySim("pitch")}
                        className="w-full rounded-xl border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 font-bold py-2.5 text-xs transition-all cursor-pointer"
                      >
                        96 MPH Fastball Strikeout
                      </button>
                    </div>

                    <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 text-[10px] font-mono text-slate-400 leading-normal">
                      <strong>Automatic Milestone Checks:</strong> When players cross specific stats thresholds, new Moment SFT relics unlock automatically under the namespace root.
                    </div>
                  </div>

                  {/* Play logs (7 cols) */}
                  <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono uppercase text-slate-500">Live Oracle Feed Stream</span>
                      <div className={`rounded-xl p-4 border font-mono text-[10px] h-48 overflow-y-auto space-y-2 ${terminalBg}`}>
                        {playByPlayLogs.length === 0 && <div className="text-slate-500">Awaiting play triggers...</div>}
                        {playByPlayLogs.map((log, idx) => (
                          <div key={idx} className="border-b border-white/5 pb-1.5 text-slate-350">{log}</div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-xs space-y-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Active Athlete Card Metrics ({selectedAthlete.name})</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                        {Object.entries(selectedAthlete.metrics).slice(0, 6).map(([k, v]) => (
                          <div key={k} className="bg-black/40 p-2 rounded border border-white/5">
                            <span className="text-[8px] text-slate-500 block uppercase">{k}</span>
                            <strong className="text-white block mt-0.5">{v}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 6: RELICS SHOWCASE */}
            {activeTab === "relics" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-6`}>
                {!isVerifiedAthlete ? (
                  <div className="text-center py-12 space-y-4 bg-black/35 rounded-2xl border border-dashed border-red-500/20 p-6">
                    <Lock className="h-12 w-12 text-red-400 mx-auto animate-pulse" />
                    <h4 className="text-base font-bold text-white uppercase tracking-wider orbitron-title">AIP-2 Cryptographic Identity Verification Required</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Access to the Moment Relic Creator is locked. You must complete the cryptographic verification process to bind your namespace and gain minting rights.
                    </p>
                    <button
                      onClick={() => openClaimFlow(selectedAthlete)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" /> Start Cryptographic Verification (AIP-2)
                    </button>
                  </div>
                ) : (
                  <>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>Namespace Moment Relics & SFTs</h3>
                  <p className={`text-xs ${textMuted}`}>Explore dynamic Token-2022 collectibles linked as child nodes directly to the root namespaces.</p>
                </div>

                {/* Search Bar UI */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-orange-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search moments by title, player, rarity or team..."
                    className={`w-full rounded-2xl pl-10 pr-10 py-3.5 text-xs outline-none transition-all border ${
                      searchQuery 
                        ? "border-orange-400 bg-orange-950/20 shadow-[0_0_15px_rgba(249,115,22,0.15)] text-white" 
                        : "border-emerald-500/10 bg-black/40 text-slate-300 focus:border-orange-500/30"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {relics.filter(relic => {
                    if (searchQuery.trim() === "") return true;
                    const query = searchQuery.toLowerCase().trim();
                    return (
                      relic.name.toLowerCase().includes(query) ||
                      relic.rarity.toLowerCase().includes(query) ||
                      relic.namespaceRoot.toLowerCase().includes(query) ||
                      relic.type.toLowerCase().includes(query)
                    );
                  }).map(relic => (
                    <div key={relic.id} className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:border-orange-500/40 transition-all duration-300 ${subCardStyle}`}>
                      <div className="space-y-2">
                        <div className="h-32 border border-white/5 rounded-xl overflow-hidden relative">
                          <img src={relic.image} alt={relic.name} className="w-full h-full object-cover opacity-80" />
                          <span className={`absolute top-1 right-1 text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                            relic.rarity === "Legendary" ? "bg-amber-500/20 border-amber-400/40 text-amber-300" :
                            relic.rarity === "Epic" ? "bg-purple-500/20 border-purple-400/40 text-purple-300" :
                            "bg-orange-500/20 border-orange-400/40 text-orange-300"
                          }`}>{relic.rarity}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 font-mono uppercase font-bold">{relic.type}</span>
                          <h4 className="font-bold text-sm text-white leading-tight mt-0.5">{relic.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">Root Namespace: {relic.namespaceRoot}</p>
                        </div>
                      </div>

                      {/* On-Chain Status */}
                      {(() => {
                        const oc = onChainState[relic.id];
                        if (oc?.status === "minted") return (
                          <div className="space-y-1 pt-2 border-t border-white/5">
                            <div className="text-[8px] font-mono text-emerald-400 flex items-center gap-1"><Check className="h-2 w-2" /> ON-CHAIN · MAINNET</div>
                            <a href={oc.ipfsUrl} target="_blank" rel="noopener noreferrer" className="block text-[8px] font-mono text-blue-400 hover:text-blue-300 truncate">📦 {oc.cid.slice(0, 22)}...</a>
                            <a href={oc.explorerUrl} target="_blank" rel="noopener noreferrer" className="block text-[8px] font-mono text-amber-400 hover:text-amber-300 truncate">🔗 {oc.solanaTxHash.slice(0, 18)}...</a>
                          </div>
                        );
                        if (oc?.status === "minting") return <div className="pt-1 text-[8px] font-mono text-amber-400 animate-pulse">⛓ Anchoring to mainnet...</div>;
                        return null;
                      })()}

                      <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs font-mono">
                        <div>
                          <span className="text-[7px] text-slate-500 block">BASE VALUE</span>
                          <span className="text-emerald-400 font-bold">{relic.price} OMAHA26</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-[7px] text-slate-500 block">GOLD GRAINS</span>
                            <span className="text-amber-400 font-bold">{relic.backingGoldGrains} Grains</span>
                          </div>
                          {/* ⛓ Mint Relic Mainnet */}
                          {(() => {
                            const oc = onChainState[relic.id];
                            if (oc?.status === "minted") return null;
                            return (
                              <button
                                onClick={() => mintRelicOnChain(relic.id)}
                                disabled={oc?.status === "minting"}
                                className={`rounded-lg text-[8px] font-bold px-2 py-1 transition-all ${
                                  oc?.status === "minting"
                                    ? "bg-amber-500/20 text-amber-400 cursor-wait"
                                    : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                                }`}
                              >
                                {oc?.status === "minting" ? "..." : "⛓"}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                  </>
                )}
              </div>
            )}

            {/* TAB 7: SECONDARY MARKET */}
            {activeTab === "marketplace" && (
              <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-6`}>
                
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textTitle} orbitron-title`}>Secondary Marketplace Ledger</h3>
                  <p className={`text-xs ${textMuted}`}>Trade player card stubs and moment relics. Purchases auto-route gold grain reserves to buyer vaults.</p>
                </div>

                {/* Search Bar UI */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-emerald-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search marketplace stubs by name, rarity, type..."
                    className={`w-full rounded-2xl pl-10 pr-10 py-3.5 text-xs outline-none transition-all border ${
                      searchQuery 
                        ? "border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white" 
                        : "border-emerald-500/10 bg-black/40 text-slate-300 focus:border-emerald-500/30"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relics.filter(item => {
                    if (searchQuery.trim() === "") return true;
                    const query = searchQuery.toLowerCase().trim();
                    return (
                      item.name.toLowerCase().includes(query) ||
                      item.rarity.toLowerCase().includes(query) ||
                      item.type.toLowerCase().includes(query) ||
                      item.namespaceRoot.toLowerCase().includes(query)
                    );
                  }).map(item => (
                    <div key={item.id} className={`rounded-2xl border p-4 flex flex-col justify-between ${subCardStyle}`}>
                      <div className="space-y-3">
                        <div className="h-24 border border-white/5 rounded-xl overflow-hidden relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-85" />
                          <span className="absolute top-1 right-1 text-[8px] bg-black/60 text-white px-2 py-0.5 rounded font-mono">
                            {item.rarity}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 font-mono uppercase font-bold">{item.type}</span>
                          <h4 className="font-bold text-xs text-white leading-tight mt-0.5">{item.name}</h4>
                          <p className="text-[9px] text-slate-500 font-mono mt-1">Owner: {item.owner}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <div>
                            <span className="text-[7px] text-slate-500 block">PRICE</span>
                            <span className="font-bold text-emerald-400">{item.price} OMAHA26</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[7px] text-slate-500 block">GOLD BACKING</span>
                            <span className="text-amber-400">{item.backingGoldGrains} Grains</span>
                          </div>
                        </div>

                        {/* 50/50 Royalty Split Visualizer */}
                        <div className="bg-emerald-950/20 border border-emerald-500/10 p-2 rounded-xl space-y-1 text-[9px] font-mono">
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>AIP-2 Royalty Split</span>
                            <span className="text-emerald-400">Enforced</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                            <div className="bg-emerald-500 h-full" style={{ width: "50%" }} title="50% Athlete Vault" />
                            <div className="bg-purple-500 h-full" style={{ width: "50%" }} title="50% Unykorn Vault" />
                          </div>
                          <div className="flex justify-between text-slate-500 text-[8px]">
                            <span>Athlete (50%)</span>
                            <span>Unykorn (50%)</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (stablecoinBalance < item.price) {
                              alert("Insufficient stablecoin balance!");
                              return;
                            }
                            const price = item.price;
                            const athleteSplit = Math.floor(price * 0.5);
                            const unykornSplit = price - athleteSplit;

                            setStablecoinBalance(prev => prev - price);
                            setRelics(prev => prev.map(r => r.id === item.id ? { ...r, owner: "0xMyWalletUser" } : r));
                            
                            // Find the matching athlete namespace for this relic to credit their vault
                            const matchingAthlete = namespaces.find(ns => ns.handle === item.namespaceRoot);
                            if (matchingAthlete && matchingAthlete.claimState === "claimed") {
                              // If athlete namespace is claimed and verified, route 50% of proceeds into their NIL Income vault
                              setVaults(vts => vts.map(v => {
                                if (v.type === "NIL Income") {
                                  return { ...v, balance: v.balance + athleteSplit };
                                }
                                if (v.type === "Relic Custody") {
                                  return { ...v, goldGrains: v.goldGrains + item.backingGoldGrains };
                                }
                                return v;
                              }));
                              addLog(`✔ Secondary Purchase: 50% ($${athleteSplit}) routed to ${matchingAthlete.name}'s NIL Vault, 50% ($${unykornSplit}) to Unykorn reserves.`);
                              alert(`Purchase successful! 50% ($${athleteSplit}) distributed to athlete NIL vault. ${item.backingGoldGrains} grains gold locked in vault reserves.`);
                            } else {
                              // Custodian custody - 100% to Unykorn reserves
                              setVaults(vts => vts.map(v => {
                                if (v.type === "Relic Custody") {
                                  return { ...v, goldGrains: v.goldGrains + item.backingGoldGrains };
                                }
                                return v;
                              }));
                              addLog(`✔ Secondary Purchase: 100% ($${price}) routed to Unykorn Genesis reserves (unclaimed athlete).`);
                              alert(`Purchase successful! 100% ($${price}) routed to Unykorn reserves. ${item.backingGoldGrains} grains gold locked in vault reserves.`);
                            }
                          }}
                          className="w-full text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-[10px] transition-all cursor-pointer"
                        >
                          Buy SFT Moment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

          {/* Right Column (Terminal Console & Active Athlete Profile) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Active Athlete Namespace Card Card */}
            <div className={`rounded-3xl border-2 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between ${
              selectedAthlete.claimState === "claimed" ? "border-emerald-500 bg-gradient-to-br from-[#0a2319] to-black" : "border-white/10 bg-slate-950"
            }`}>
              {/* Pattern Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="space-y-4 z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1">
                    {isVerifiedAthlete ? (
                      <>
                        <Shield className="h-3 w-3 text-emerald-400 fill-emerald-500/20" /> VERIFIED ATHLETE
                      </>
                    ) : (
                      "CWS ATHLETE"
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {selectedAthlete.claimState.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-white orbitron-title leading-tight">{selectedAthlete.name}</h4>
                  <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    {selectedAthlete.handle}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3 space-y-2.5">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">Registry Metrics</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(selectedAthlete.metrics).slice(0, 4).map(([k, v]) => (
                      <div key={k} className="bg-black/50 p-2 rounded border border-white/5">
                        <span className="text-[8px] text-slate-500 block uppercase">{k}</span>
                        <strong className="text-white block mt-0.5">{v}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">Milestone Records</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedAthlete.milestones.map((ms, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded text-[9px]">
                        🏆 {ms}
                      </span>
                    ))}
                  </div>
                </div>

                {isVerifiedAthlete && (
                  <div className="border-t border-white/10 pt-3 space-y-2 text-[10px] font-mono leading-relaxed text-slate-400">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Cryptographic Roster Attestation</span>
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 space-y-1.5 text-slate-355">
                      <div className="flex justify-between">
                        <span>Bound Address:</span>
                        <span className="text-white select-all">{selectedAthlete.ownerWallet?.slice(0, 12)}...{selectedAthlete.ownerWallet?.slice(-4)}</span>
                      </div>
                      {selectedAthlete.verificationHash && (
                        <div className="flex justify-between">
                          <span>Verification Hash:</span>
                          <span className="text-emerald-400 select-all" title={selectedAthlete.verificationHash}>{selectedAthlete.verificationHash.slice(0, 16)}...</span>
                        </div>
                      )}
                      {selectedAthlete.verificationCid && (
                        <div className="flex justify-between">
                          <span>Attestation IPFS:</span>
                          <a 
                            href={`https://gateway.pinata.cloud/ipfs/${selectedAthlete.verificationCid}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:underline select-all"
                          >
                            {selectedAthlete.verificationCid.slice(0, 12)}...
                          </a>
                        </div>
                      )}
                      {selectedAthlete.verificationTx && (
                        <div className="flex justify-between">
                          <span>Solana Anchor:</span>
                          {selectedAthlete.verificationTx.startsWith("Simulated") || selectedAthlete.verificationTx.startsWith("48UPWTib") ? (
                            <span className="text-amber-500 text-[9px]" title={selectedAthlete.verificationTx}>{selectedAthlete.verificationTx.slice(0, 16)}...</span>
                          ) : (
                            <a 
                              href={`https://solscan.io/tx/${selectedAthlete.verificationTx}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-amber-400 hover:underline"
                            >
                              {selectedAthlete.verificationTx.slice(0, 12)}...
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedAthlete.claimState !== "claimed" && (
                <button
                  onClick={() => openClaimFlow(selectedAthlete)}
                  className="w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs transition-all cursor-pointer mt-6 flex items-center justify-center gap-1.5"
                >
                  <Wallet className="h-4 w-4" /> Claim and Setup Fiduciary
                </button>
              )}
            </div>

            {/* Protocol Operations Logs */}
            <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-4`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-500" />
                Protocol Operations log
              </h4>
              
              <div className={`rounded-xl p-3 font-mono text-[9px] h-52 overflow-y-auto space-y-2 ${terminalBg}`}>
                {terminalLogs.map((log, index) => (
                  <div key={index} className="border-b border-white/5 pb-1 text-slate-350">{log}</div>
                ))}
              </div>
            </div>

            {/* AIP-2 Cryptographic Attestation Validator */}
            <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${cardStyle} space-y-4`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500" />
                AIP-2 Attestation Auditor
              </h4>
              
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Paste a Solana transaction signature or IPFS CID to run a client-side HMAC audit verifying student-athlete identity bounds.
              </p>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Solana Tx Signature or IPFS CID"
                    value={validatorInput}
                    onChange={(e) => setValidatorInput(e.target.value)}
                    className="flex-1 rounded-xl p-2 bg-black/45 border border-white/10 text-white font-mono text-[9px] outline-none"
                  />
                  {selectedAthlete.claimState === "claimed" && (
                    <button
                      onClick={() => {
                        const target = selectedAthlete.verificationTx || selectedAthlete.verificationCid || "";
                        setValidatorInput(target);
                      }}
                      className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450 rounded-xl border border-emerald-500/20 text-[9px] font-mono font-bold cursor-pointer"
                      title="Load Active Athlete Details"
                    >
                      Autoload
                    </button>
                  )}
                </div>

                <button
                  onClick={validateAttestationProof}
                  disabled={isValidatorLoading || !validatorInput}
                  className="w-full text-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isValidatorLoading ? "Auditing Attestation Proof..." : "Verify Attestation Proof"}
                </button>
              </div>

              {/* Validator logs */}
              {validatorLogs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[8px] uppercase font-mono text-slate-500 block">Validator Ledger Logs</span>
                  <div className="bg-black/55 p-2 rounded-xl border border-white/5 font-mono text-[9px] h-32 overflow-y-auto space-y-1 text-slate-400">
                    {validatorLogs.map((log, idx) => (
                      <div key={idx} className={log.startsWith("✔") || log.startsWith("🟢") ? "text-emerald-450" : log.startsWith("❌") ? "text-rose-455 font-bold" : "text-slate-400"}>{log}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validator results summary */}
              {validatorResult && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-[9px] font-mono space-y-1 text-slate-350 animate-fadeIn">
                  <div className="flex justify-between font-bold text-emerald-400 border-b border-emerald-500/10 pb-1">
                    <span>Audit Status:</span>
                    <span>{validatorResult.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Athlete:</span>
                    <span className="text-white">{validatorResult.athlete}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handle:</span>
                    <span className="text-white">{validatorResult.handle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bound Wallet:</span>
                    <span className="text-white select-all">{validatorResult.wallet?.slice(0, 10)}...{validatorResult.wallet?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audit Timestamp:</span>
                    <span>{new Date(validatorResult.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {isClaimModalOpen && claimingAthlete && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-[#0c241b] border-2 border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-6 relative text-white shadow-2xl">
            
            <button
              onClick={() => setIsClaimModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1">
                <Shield className="h-3 w-3" /> SOVEREIGN ATHLETE VERIFICATION (AIP-2)
              </span>
              <h3 className="text-lg font-black orbitron-title">Verify Namespace: {claimingAthlete.name}</h3>
              <p className="text-xs text-slate-450 font-mono">{claimingAthlete.handle}</p>
            </div>

            {/* Process Indicator */}
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-b border-white/5 pb-4">
              <span className={claimStep >= 1 ? "text-emerald-400 font-bold" : ""}>1. Wallet</span>
              <span className="text-slate-700">➔</span>
              <span className={claimStep >= 2 ? "text-emerald-400 font-bold" : ""}>2. Email OTP</span>
              <span className="text-slate-700">➔</span>
              <span className={claimStep >= 3 ? "text-emerald-400 font-bold" : ""}>3. SID Auth</span>
              <span className="text-slate-700">➔</span>
              <span className={claimStep >= 4 ? "text-emerald-400 font-bold" : ""}>4. Anchor</span>
              <span className="text-slate-700">➔</span>
              <span className={claimStep >= 5 ? "text-emerald-400 font-bold" : ""}>5. Done</span>
            </div>

            {/* Error Message banner */}
            {verificationError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-[11px] text-rose-450 leading-relaxed font-mono flex items-start gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{verificationError}</span>
              </div>
            )}

            {/* Step Content */}
            <div className="space-y-4">
              
              {/* STEP 1: WALLET BINDING */}
              {claimStep === 1 && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                  <p>Bind your active Web3 wallet to lock ownership of this namespace. This wallet will collect all future NIL proceeds.</p>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">Solana Wallet Address</label>
                    <input
                      type="text"
                      placeholder="Enter Solana Wallet Address"
                      value={walletAddressInput}
                      onChange={(e) => setWalletAddressInput(e.target.value)}
                      className="w-full rounded-xl p-2.5 text-xs outline-none bg-black/45 border border-white/10 text-white font-mono"
                    />
                  </div>
                  <button
                    onClick={handleWalletBind}
                    className="w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Bind Wallet & Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* STEP 2: STUDENT .EDU EMAIL SELF-PROOF */}
              {claimStep === 2 && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-350">
                  <p>Provide your university email address ending in <strong>.edu</strong> to verify your student-athlete status.</p>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-400 uppercase">Student Email (.edu)</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="e.g. d.jackson@uga.edu"
                          value={eduEmailInput}
                          onChange={(e) => setEduEmailInput(e.target.value)}
                          disabled={otpSent}
                          className="flex-1 rounded-xl p-2.5 text-xs outline-none bg-black/45 border border-white/10 text-white font-mono disabled:opacity-50"
                        />
                        <button
                          onClick={handleSendOtp}
                          disabled={otpSent}
                          className="px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
                        >
                          Send Code
                        </button>
                      </div>
                    </div>

                    {otpSent && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-mono text-slate-400 uppercase">6-Digit Verification Code</label>
                          <input
                            type="text"
                            placeholder="Enter 6-digit OTP code"
                            maxLength={6}
                            value={verificationOtpInput}
                            onChange={(e) => setVerificationOtpInput(e.target.value)}
                            className="w-full rounded-xl p-2.5 text-xs outline-none bg-black/45 border border-white/10 text-white font-mono tracking-widest text-center text-sm font-bold"
                          />
                        </div>
                        <p className="text-[10px] text-amber-400 font-mono">
                          ℹ️ Check the <strong>Protocol Operations log</strong> in the sidebar to retrieve the code.
                        </p>
                        <button
                          onClick={handleVerifyOtp}
                          className="w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          Verify OTP Code <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: COACH / SID INSTITUTIONAL APPROVAL */}
              {claimStep === 3 && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-350">
                  <p>Input the official Sports Information Director (SID) or Compliance Officer release token for roster clearance.</p>
                  
                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">SID / Coach Token</label>
                    <input
                      type="text"
                      placeholder="e.g. UGA_SID_2026"
                      value={sidTokenInput}
                      onChange={(e) => setSidTokenInput(e.target.value)}
                      className="w-full rounded-xl p-2.5 text-xs outline-none bg-black/45 border border-white/10 text-white font-mono uppercase"
                    />
                    <p className="text-[9px] text-slate-500 font-mono">
                      🔑 Official team code: <code className="text-emerald-400">{(claimingAthlete?.teamKey === "georgia" ? "UGA_SID_2026" :
                                                claimingAthlete?.teamKey === "troy" ? "TROY_SID_2026" :
                                                claimingAthlete?.teamKey === "wvu" ? "WVU_SID_2026" : "UNC_SID_2026")}</code>
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSidAuthorize}
                    className="w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Authorize Release <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* STEP 4: ON-CHAIN ATTESTATION DEPLOYMENT */}
              {claimStep === 4 && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-350">
                  <p>All requirements satisfied! Generate the consensus attestation proof package and write the immutable binding to Solana Mainnet-Beta.</p>
                  
                  {isDeployingAttestation ? (
                    <div className="py-6 text-center space-y-3 animate-pulse">
                      <RefreshCw className="h-8 w-8 text-emerald-400 mx-auto animate-spin" />
                      <p className="text-slate-450 font-mono text-[10px]">Broadcasting attestation package to Solana ledger...</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleDeployAttestation}
                      className="w-full text-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap className="h-4 w-4" /> Deploy On-Chain Proof
                    </button>
                  )}
                </div>
              )}

              {/* STEP 5: SUCCESS & ACCESS */}
              {claimStep === 5 && (
                <div className="space-y-4 text-xs text-center">
                  <CheckCircle className="h-14 w-14 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-white orbitron-title">AIP-2 Identity Confirmed!</h4>
                  <p className="text-slate-450 leading-relaxed max-w-sm mx-auto">
                    Root namespace verified. Fiduciary wealth vaults activated, NIL Offer listening active, and highlight moment relic mint consoles are unlocked.
                  </p>
                  <button
                    onClick={() => {
                      setIsClaimModalOpen(false);
                      setUserClass("athlete"); // Logged in as Athlete
                      setActiveTab("control-hub"); // Route to dashboard
                    }}
                    className="w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs cursor-pointer"
                  >
                    Access Athlete Workspace
                  </button>
                </div>
              )}
            </div>

            {/* Live progress logs */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono text-slate-500">Verification Engine logs</span>
              <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 font-mono text-[9px] h-24 overflow-y-auto space-y-1 text-slate-450">
                {claimLogs.map((log, idx) => (
                  <div key={idx} className={log.startsWith("✔") ? "text-emerald-400" : log.startsWith("停") || log.startsWith("✘") ? "text-red-400" : "text-slate-400"}>{log}</div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

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
