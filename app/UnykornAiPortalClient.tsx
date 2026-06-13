"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, Shield, Lock, Key, FileText, Wallet, Users, Globe,
  CheckCircle, Clock, AlertTriangle, ChevronRight, Download, Send,
  RefreshCw, Layers, Cpu, Database, Award, ExternalLink, Info, Terminal, X,
  Coins, Sparkles, Building, ArrowRight, Activity, ArrowUpRight, Check, Eye, Plus, ArrowDown, ArrowUp, DollarSign,
  Sun, Moon, BookOpen, Briefcase, Code, Play, Zap, Calendar, TrendingUp, SlidersHorizontal, Scale, FileCheck, Radio
} from "lucide-react";

// Types
type WalletType = "phantom" | "metamask" | "freighter";
type TabType = "search" | "neobank" | "commerce" | "swarm" | "monorepo" | "persona" | "apps";
type ThemeType = "dark" | "light";

interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string;
  currency: string;
}

interface SearchResult {
  name: string;
  root: string;
  found: boolean;
  valuationUSD?: number;
  multiplier?: string;
  description?: string;
  ipfsCID?: string;
  stellarTxHash?: string;
  xrplTxHash?: string;
  solanaTxHash?: string;
  isActive?: boolean;
  isAI?: boolean;
  aiText?: string;
}

interface BankTransaction {
  id: string;
  timestamp: string;
  description: string;
  amount: string;
  type: "deposit" | "withdrawal" | "payment" | "yield";
  status: "COMPLETED" | "PENDING";
  txHash?: string;
}

interface LeaseState {
  namespace: string;
  agent: string;
  duration: number;
  rate: string;
  status: "idle" | "negotiating" | "challenge_received" | "settling" | "active";
}

interface EcosystemApp {
  id: string;
  name: string;
  description: string;
  status: "DEPLOYED" | "STANDBY" | "INTEGRATED";
  version: string;
  icon: string;
  url?: string;
}

export default function UnykornAiPortalClient() {
  useEffect(() => {
    document.title = "UnyKorn.ai | Sovereign Web3 Neo Bank & Commerce";
  }, []);

  // Theme State
  const [theme, setTheme] = useState<ThemeType>("dark");

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>("search");

  // Web3 Wallets States
  const [wallets, setWallets] = useState<Record<WalletType, WalletState>>({
    phantom: { connected: false, address: null, balance: "0.00", currency: "SOL" },
    metamask: { connected: false, address: null, balance: "0.00", currency: "ETH" },
    freighter: { connected: false, address: null, balance: "0.00", currency: "XLM" },
  });

  const [activeWallet, setActiveWallet] = useState<WalletType | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Search Engine States
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [agentOpinion, setAgentOpinion] = useState<{
    agentName: string;
    avatar: string;
    role: string;
    opinion: string;
  } | null>(null);

  // Neo Bank Reserves States
  const [balances, setBalances] = useState({
    USDF: 250420.00,
    TROP: 15000.00,
    USDC: 500000.00,
    EURS: 10000.00,
  });

  const [depositAmount, setDepositAmount] = useState("");
  const [depositAsset, setDepositAsset] = useState<"USDF" | "TROP" | "USDC">("USDF");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalAsset, setWithdrawalAsset] = useState<"USDF" | "TROP" | "USDC">("USDF");

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([
    { id: "TX-901", timestamp: "2026-06-12T08:12:00Z", description: "Stripe compliance checkout credit - UCP routing", amount: "+5,000.00 USDF", type: "deposit", status: "COMPLETED", txHash: "0x7a83fbc2" },
    { id: "TX-902", timestamp: "2026-06-12T06:45:00Z", description: "AP2 micropayment for Vertex AI doc parsing challenge", amount: "-0.50 USDF", type: "payment", status: "COMPLETED", txHash: "0x9c3d4a2b" },
    { id: "TX-903", timestamp: "2026-06-11T12:00:00Z", description: "Stellar.1 RWA namespace lease yield distribution", amount: "+245.80 USDF", type: "yield", status: "COMPLETED", txHash: "0xb1024af9" },
    { id: "TX-904", timestamp: "2026-06-10T15:30:00Z", description: "MetaMask wallet payout settlement", amount: "-1,200.00 USDC", type: "withdrawal", status: "COMPLETED", txHash: "0xf193028c" }
  ]);

  // Agentic Commerce (ACP/AP2) states
  const [leaseForm, setLeaseForm] = useState<LeaseState>({
    namespace: "gold.1",
    agent: "UnyKorn Treasury Agent",
    duration: 30,
    rate: "0.05 USDF/sec",
    status: "idle"
  });

  const [commerceLogs, setCommerceLogs] = useState<string[]>([
    "[SYSTEM] Agentic Commerce Protocol (ACP) node initialized.",
    "[SYSTEM] Listening for Metaplex, Stellar, and XRPL memo lease challenge pings..."
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [commerceLogs]);

  // Google's TimesFM State
  const [timesfmTarget, setTimesfmTarget] = useState<"gold" | "lp" | "ap2">("gold");
  const [timesfmLoading, setTimesfmLoading] = useState(false);
  const [timesfmLogs, setTimesfmLogs] = useState<string[]>([
    "[TimesFM] Model initialized. Standing by for inference run..."
  ]);
  const [timesfmData, setTimesfmData] = useState<number[]>([1800, 1805, 1812, 1810, 1818, 1825, 1822, 1835, 1840, 1855, 1850, 1868]);

  const runTimesfmInference = () => {
    setTimesfmLoading(true);
    setTimesfmLogs([
      `[TimesFM] Initializing inference pipeline for target: ${timesfmTarget.toUpperCase()}...`,
      `[TimesFM] Loading timesfm-200m checkpoint from cache...`,
      `[TimesFM] Context input window: 96 steps. Forecast horizon: 24 steps.`
    ]);

    setTimeout(() => {
      setTimesfmLogs(prev => [
        ...prev,
        `[TimesFM] Executing self-attention layers on GPU edge node...`,
        `[TimesFM] Generating auto-regressive prediction values...`
      ]);

      setTimeout(() => {
        let newData: number[] = [];
        let logs: string[] = [];

        if (timesfmTarget === "gold") {
          newData = [1810, 1815, 1822, 1820, 1835, 1842, 1850, 1865, 1860, 1878, 1885, 1902];
          logs = [
            `[TimesFM] Inference complete. Valuation trend projects positive growth (+4.8%).`,
            `[TimesFM] gold.1 RWA projected horizon peak: $1,902.00 USD/oz.`
          ];
        } else if (timesfmTarget === "lp") {
          newData = [75, 78, 80, 82, 85, 87, 90, 93, 94, 96, 98, 99];
          logs = [
            `[TimesFM] LP capacity limits approaching saturation bounds (99%).`,
            `[TimesFM] Recommendation: Trigger automatic reserve threshold adjustments.`
          ];
        } else {
          newData = [0.010, 0.012, 0.011, 0.015, 0.020, 0.025, 0.030, 0.035, 0.040, 0.045, 0.050, 0.052];
          logs = [
            `[TimesFM] Traffic load scaling detected. Dynamic metered rates updating.`,
            `[TimesFM] Recommendation: Dynamic AP2 rate set to 0.052 USDF/sec.`
          ];
        }

        setTimesfmData(newData);
        setTimesfmLogs(prev => [...prev, ...logs, `[TimesFM] Swarm inference run SUCCESS.`]);
        setTimesfmLoading(false);
      }, 1000);
    }, 1000);
  };


  // Ecosystem Apps
  const [ecosystemApps, setEcosystemApps] = useState<EcosystemApp[]>([
    { id: "wallet", name: "UnyKorn Wallet Extension", description: "Secure Web3 browser extension for managing TROP, USDF, SOL, XRP, and XLM under unified namespace keys.", status: "INTEGRATED", version: "v1.2.0", icon: "💳" },
    { id: "fthpay", name: "FTH Pay Gateway", description: "Edge worker payments routing system supporting credit cards, stablecoin settlements, and Stripe checkout hooks.", status: "DEPLOYED", version: "v2.4.1", icon: "🔌" },
    { id: "acp", name: "ACP Open Source Module", description: "Agentic Commerce Protocol NPM package for machine-to-machine lease negotiations and carrying capacity bounds.", status: "DEPLOYED", version: "v0.8.5", icon: "📦" },
    { id: "notary", name: "ZKP Wills & Trust Notary", description: "Zero-Knowledge inheritance validator executing time-delayed dead-man quorums.", status: "INTEGRATED", version: "v1.0.4", icon: "🧬" },
    { id: "consensus", name: "Apostle Consensus Node", description: "Consensus node orchestrator for the 24-agent distributed stack.", status: "DEPLOYED", version: "v5.4.0", icon: "⛓️" }
  ]);

  const [walletExtensionStatus, setWalletExtensionStatus] = useState<"not_installed" | "downloading" | "installed">("not_installed");

  // Interactive Web3 SWARM States
  const [rpcBlockNumber, setRpcBlockNumber] = useState<string>("8,241,092");
  const [rpcLatency, setRpcLatency] = useState<string>("24ms");
  const [rpcLoading, setRpcLoading] = useState<boolean>(false);
  const [zkLogs, setZkLogs] = useState<string[]>([]);
  const [zkVerifying, setZkVerifying] = useState<boolean>(false);
  const [edgeLogs, setEdgeLogs] = useState<string[]>([
    "[Edge-Workers] Initialization complete. Standing by for API calls..."
  ]);
  const [edgeLogsActive, setEdgeLogsActive] = useState<boolean>(false);

  // Kraken Ledgers
  const [krakenLedgers, setKrakenLedgers] = useState([
    { id: "KRK-801", chain: "XRPL", payload: "BridgePayload:USDC->Solana", amount: "12,500 USDC", timestamp: "Just now", status: "SUCCESS" },
    { id: "KRK-802", chain: "Stellar", payload: "GoldenPath:TROP->USDF", amount: "5,000 TROP", timestamp: "2 mins ago", status: "SUCCESS" },
    { id: "KRK-803", chain: "Base", payload: "LiquidationArbitrage:FlashBot", amount: "1.45 ETH", timestamp: "5 mins ago", status: "SUCCESS" },
    { id: "KRK-804", chain: "Besu", payload: "NamespaceRegistry:anchor.mcp", amount: "2,500 TROP", timestamp: "10 mins ago", status: "SUCCESS" }
  ]);

  // Reputation / Sentiment Shield (Ported from app/media/page.tsx)
  const [sentimentScore, setSentimentScore] = useState(98.4);
  const [isShieldActive, setIsShieldActive] = useState(true);
  const [logMessages, setLogMessages] = useState<string[]>([
    "Sentiment Shield: Active monitoring unykorn.ai and Unykorn systems.",
    "Web crawler: Negative sentiment target detected on external forums.",
    "Mitigation loop triggered: Injecting SSRN Paper #6241279 cryptographic abstract.",
    "Tamper-proof verify: SEC MIC 'exch:UBEC' JSON-LD injected. Search crawler redirected.",
    "Reputation index update: Neutralized negative target. Sentiment score: 98.4%."
  ]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);

  // BADASS AI State
  const [badassLogs, setBadassLogs] = useState<string[]>([
    "[BADASS-AI] Ingestion engine ready. Awaiting document payload...",
  ]);
  const [badassProcessing, setBadassProcessing] = useState(false);
  const [badassDocType, setBadassDocType] = useState("sec_filing");

  // FlashRouter State
  const [routerSource, setRouterSource] = useState("SOL");
  const [routerDest, setRouterDest] = useState("USDF");
  const [routerAmount, setRouterAmount] = useState("10");
  const [routerResult, setRouterResult] = useState<{
    route: string[];
    expectedOutput: string;
    priceImpact: string;
    executionTime: string;
  } | null>(null);
  const [routerCalculating, setRouterCalculating] = useState(false);

  // FlashBot State
  const [botActive, setBotActive] = useState(false);
  const [botLogs, setBotLogs] = useState<string[]>([
    "[FlashBot] Liquidation node inactive. Click 'Start FlashBot' to run on Base."
  ]);
  const [arbitrageProfit, setArbitrageProfit] = useState(0.0);

  // ADK Orchestrator State
  const [orchestratorLogs, setOrchestratorLogs] = useState<string[]>([
    "[ADK-Orchestrator] Scheduler standing by. Registered cron: '0 0 * * *' (Daily Ledger Snapshot)"
  ]);
  const [orchestratorRunning, setOrchestratorRunning] = useState(false);
  const [cronInterval, setCronInterval] = useState("daily");

  // Playbook State
  const [flywheelLeverage, setFlywheelLeverage] = useState(1.5);
  const [flywheelReserveRate, setFlywheelReserveRate] = useState(20);

  // L1 Chambers State
  const [l1Chambers, setL1Chambers] = useState([
    { name: "POPEYE", role: "Primary Authority Execution", height: "12,982,105", status: "ACTIVE", validators: 12 },
    { name: "TEV", role: "Token Evaluation & Valuation", height: "12,982,094", status: "ACTIVE", validators: 12 },
    { name: "CONSENSUS", role: "Besu AuditLog Synchronization", height: "8,241,092", status: "ACTIVE", validators: 24 },
    { name: "MARS", role: "Metaplex Authority Registration", height: "48,931,225", status: "STANDBY", validators: 8 },
    { name: "TAR", role: "Trustee Asset Recovery", height: "3,205,941", status: "ACTIVE", validators: 6 }
  ]);

  useEffect(() => {
    if (!edgeLogsActive) return;
    const items = [
      "POST /api/payments/checkout - 200 OK",
      "Routing stablecoin settlement to XRPL wallet rJLMSTy...",
      "Stripe checkout session synced. USDF credit event generated.",
      "Apostle Chain CNAME proxy ping successful: rpc.unykorn.org",
      "GET /api/namespaces/status?namespace=gold.1 - 200 OK",
      "AP2 dynamic micro-payment rate adjusted to 0.052 USDF/sec",
      "ZK proof attestation request committed to Stellar Mirror"
    ];
    const timer = setInterval(() => {
      const line = items[Math.floor(Math.random() * items.length)];
      setEdgeLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] [Edge-Workers] ${line}`]);
    }, 3000);
    return () => clearInterval(timer);
  }, [edgeLogsActive]);

  // Sentiment Shield Fluctuations
  useEffect(() => {
    if (!isShieldActive) return;
    const timer = setInterval(() => {
      setSentimentScore(prev => {
        const delta = (Math.random() - 0.45) * 0.15;
        return parseFloat(Math.min(100, Math.max(90, prev + delta)).toFixed(2));
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [isShieldActive]);

  // FlashBot Execution logs simulation
  useEffect(() => {
    if (!botActive) return;
    const items = [
      "Checking Aave V3 borrow positions on Base...",
      "Checking Balancer V2 dynamic pool spreads...",
      "No liquidation threshold exceeded. Standing by...",
      "Found liquidatable position: User 0x82f... Collateral: WETH, Debt: USDC",
      "Executing liquidation via FlashBot contract... Gas limit: 350,000",
      "Arbitrage transaction SUCCESS. Profit: 0.14 WETH (Hash: 0x9fbc1...)"
    ];
    const timer = setInterval(() => {
      const line = items[Math.floor(Math.random() * items.length)];
      setBotLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] [FlashBot] ${line}`]);
      if (line.includes("Profit")) {
        setArbitrageProfit(p => parseFloat((p + 0.14).toFixed(2)));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [botActive]);

  // BADASS AI OCR simulation
  const runBadassOcr = () => {
    setBadassProcessing(true);
    setBadassLogs(prev => [...prev, `[BADASS-AI] Ingesting document of type: ${badassDocType.toUpperCase()}...`]);
    setTimeout(() => {
      setBadassLogs(prev => [...prev, `[BADASS-AI] Processing OCR layout layers via cognitive vision models...`]);
      setTimeout(() => {
        setBadassLogs(prev => [
          ...prev,
          `[BADASS-AI] Extracted Entities: { company: "FTH Trading", founder: "Founder-Architect", sec_mic: "exch:UBEC" }`,
          `[BADASS-AI] Ingestion SUCCESS. Metadata parsed.`
        ]);
        setBadassProcessing(false);
      }, 1000);
    }, 1000);
  };

  // FlashRouter route builder
  const runRouterCalculation = () => {
    setRouterCalculating(true);
    setTimeout(() => {
      const path = routerSource === "SOL" 
        ? ["Solana DEX AMM", "Stellar Bridge payload", "USDF Pool"]
        : ["Base L2 Pool", "Balancer V2 Route", "USDF Pool"];
      const out = (parseFloat(routerAmount) * 0.985).toFixed(2);
      setRouterResult({
        route: path,
        expectedOutput: `${out} ${routerDest}`,
        priceImpact: "< 0.08%",
        executionTime: "45ms"
      });
      setRouterCalculating(false);
    }, 1200);
  };

  // ADK Orchestrator manual runner
  const triggerOrchestratorJob = () => {
    setOrchestratorRunning(true);
    setOrchestratorLogs(prev => [...prev, `[ADK-Orchestrator] Triggering manual execution of workflow: ${cronInterval.toUpperCase()}...`]);
    setTimeout(() => {
      setOrchestratorLogs(prev => [
        ...prev,
        `[ADK-Orchestrator] Syncing master registry state...`,
        `[ADK-Orchestrator] Backup of Kraken Ledgers complete.`,
        `[ADK-Orchestrator] Job completed successfully.`
      ]);
      setOrchestratorRunning(false);
    }, 1500);
  };

  // Swarm Dispatcher manual runner
  const triggerSwarmPublish = (group: string) => {
    setIsDispatching(true);
    setDispatchLogs([]);
    let currentStep = 0;
    const steps = [
      `[${group}] Preparing draft payload...`,
      `[${group}] W3C signature did:unykorn:architect generated.`,
      `[${group}] Pinning spec payload to IPFS... CID: QmSwarmMedia...`,
      `[${group}] Anchoring reference to Hyperledger Besu AuditLog...`,
      `[${group}] Dispatching to 16 apex domains and indexing robots...`,
      `[${group}] SUCCESS: Media distributed. Neutralizing negative index targets.`
    ];
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setDispatchLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDispatching(false);
        setLogMessages(prev => [
          `Media Swarm: Distributed ${group} spec release. Search indexes updated.`,
          ...prev.slice(0, 4)
        ]);
        setSentimentScore(prev => Math.min(100, prev + 0.25));
      }
    }, 800);
  };

  const queryRpcNode = async () => {
    setRpcLoading(true);
    const start = Date.now();
    try {
      const response = await fetch("https://rpc.unykorn.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1
        })
      });
      const data = await response.json();
      const num = parseInt(data.result, 16);
      setRpcBlockNumber(num.toLocaleString());
      setRpcLatency(`${Date.now() - start}ms`);
    } catch (err) {
      console.warn("RPC fetch failed, using fallback simulated block number.", err);
      // Fallback
      const prevBlock = parseInt(rpcBlockNumber.replace(/,/g, ""));
      const nextBlock = prevBlock + Math.floor(Math.random() * 5) + 1;
      setRpcBlockNumber(nextBlock.toLocaleString());
      setRpcLatency(`${Date.now() - start}ms`);
    } finally {
      setRpcLoading(false);
    }
  };

  const runZkVerification = () => {
    setZkVerifying(true);
    setZkLogs([
      "[ZKP] Initializing PLONK verification protocol...",
      "[ZKP] Loading public inputs from Registry namespace keys..."
    ]);
    
    setTimeout(() => {
      setZkLogs(prev => [
        ...prev,
        "[ZKP] Fetching proof validation schema from local files...",
        "[ZKP] Verification Key SHA256: 0x9b31ae5fa0c2...8aef2"
      ]);
      
      setTimeout(() => {
        setZkLogs(prev => [
          ...prev,
          "[ZKP] Executing bilinear pairing checks on G1/G2 curve groups...",
          "[ZKP] Proof verification SUCCESS. Attestation validated."
        ]);
        setZkVerifying(false);
      }, 1200);
    }, 1200);
  };

  const simulateExtensionInstall = () => {
    setWalletExtensionStatus("downloading");
    setTimeout(() => {
      setWalletExtensionStatus("installed");
      setWallets((prev) => ({
        ...prev,
        phantom: { connected: true, address: "57VqZpdghY3K...yuPdW", balance: "124.52 SOL", currency: "SOL" }
      }));
    }, 2000);
  };

  // Brave Start Page Metrics (Simulated Live)
  const [trackersBlocked, setTrackersBlocked] = useState(14840);
  const [rwaTokenized, setRwaTokenized] = useState(65420000);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTrackersBlocked((prev) => prev + Math.floor(Math.random() * 3));
      setRwaTokenized((prev) => prev + Math.floor(Math.random() * 50));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Web3 Connection simulation
  const connectWallet = (type: WalletType) => {
    setSearching(true);
    setTimeout(() => {
      let address = "";
      let balance = "";
      if (type === "phantom") {
        address = "57VqZpdghY3K...yuPdW";
        balance = "124.52 SOL";
      } else if (type === "metamask") {
        address = "0x7d9a657c9...156db";
        balance = "2.45 ETH";
      } else {
        address = "GBJIMHMBGT...TRJWG4I";
        balance = "622.40 XLM";
      }

      setWallets((prev) => ({
        ...prev,
        [type]: { connected: true, address, balance, currency: prev[type].currency }
      }));
      setActiveWallet(type);
      setSearching(false);
      setShowWalletModal(false);
    }, 800);
  };

  const disconnectWallet = (type: WalletType) => {
    setWallets((prev) => ({
      ...prev,
      [type]: { connected: false, address: null, balance: "0.00", currency: prev[type].currency }
    }));
    if (activeWallet === type) {
      setActiveWallet(null);
    }
  };

  // Search Action
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setResult(null);
    setAgentOpinion(null);

    const formattedQuery = query.trim().toLowerCase();

    // AI Browser & Query Engine
    const isGeneralQuestion = !formattedQuery.includes(".") || 
      ["what", "how", "why", "who", "explain", "help", "setup", "install"].some(w => formattedQuery.includes(w));

    if (isGeneralQuestion) {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: query.trim() }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const aiReply = data.content;

          let aiTitle = "Sovereign AI OS Browser Help";
          let avatar = "🧠";
          let agentName = "Sovereign AI Guide";
          let role = "Cognitive Swarm";

          if (formattedQuery.includes("x402") || formattedQuery.includes("402") || formattedQuery.includes("membrane")) {
            aiTitle = "AI Swarm Answer: x402 Protocol";
            avatar = "🪙";
            agentName = "x402 Settlement Agent";
            role = "Settlement Swarm";
          } else if (formattedQuery.includes("consens") || formattedQuery.includes("rpc") || formattedQuery.includes("node") || formattedQuery.includes("besu") || formattedQuery.includes("apostle")) {
            aiTitle = "AI Swarm Answer: Apostle Chain Consensus";
            avatar = "⛓️";
            agentName = "Consensus Node Router";
            role = "Consensus Swarm";
          } else if (formattedQuery.includes("fth pay") || formattedQuery.includes("stripe") || formattedQuery.includes("payment") || formattedQuery.includes("worker") || formattedQuery.includes("webhook")) {
            aiTitle = "AI Swarm Answer: FTH Pay Edge Workers";
            avatar = "🔌";
            agentName = "Payments Routing Agent";
            role = "Payment Swarm";
          } else if (formattedQuery.includes("zk") || formattedQuery.includes("wills") || formattedQuery.includes("notary") || formattedQuery.includes("proof")) {
            aiTitle = "AI Swarm Answer: Zero-Knowledge Wills Notary";
            avatar = "🧬";
            agentName = "ZK Proof Verifier";
            role = "Verification Swarm";
          } else if (formattedQuery.includes("architect") || formattedQuery.includes("founder")) {
            aiTitle = "AI Swarm Answer: Unykorn Platform Architect";
            avatar = "🏛️";
            agentName = "Unykorn Founder Agent";
            role = "Ecosystem Swarm";
          }

          setResult({
            name: aiTitle,
            root: ".ai",
            found: true,
            isAI: true,
            aiText: aiReply,
            description: "Verified response parsed from the sovereign UnyKorn Swarm knowledge base."
          });

          setAgentOpinion({
            agentName,
            avatar,
            role,
            opinion: `Cognitive query processed successfully. Answer generated based on active GCP and workspace credentials.`
          });
        } else {
          setResult({
            name: "AI OS Offline",
            root: ".ai",
            found: false,
            description: "Sovereign AI node could not compile a response."
          });
        }
      } catch (err) {
        setResult({
          name: "Connection Timeout",
          root: ".ai",
          found: false,
          description: "Connection to the sovereign AI mesh timed out."
        });
      } finally {
        setSearching(false);
      }
      return;
    }

    try {
      const res = await fetch(`/api/namespaces/status?namespace=${formattedQuery}`);
      const data = await res.json();

      setTimeout(() => {
        if (data.success && data.found) {
          const prefix = formattedQuery.split(".")[0];
          const valuation = prefix.length <= 3 ? 15000000 : 4500000;
          const multiplier = prefix.length <= 3 ? "15x RWA Multiplier" : "8x RWA Multiplier";

          setResult({
            name: data.namespace,
            root: data.namespace.includes(".") ? `.${data.namespace.split(".")[1]}` : ".legacy",
            found: true,
            valuationUSD: valuation,
            multiplier,
            description: `Sovereign asset-backed registry wrapper with dynamic compliance gates and locked trustee execution.`,
            ipfsCID: data.ipfsCID,
            stellarTxHash: data.stellarTxHash,
            xrplTxHash: data.xrplTxHash,
            solanaTxHash: data.solanaTxHash,
            isActive: data.isActive,
          });

          setAgentOpinion({
            agentName: "Legal & Compliance Agent",
            avatar: "⚖️",
            role: "UnyKorn Legal Swarm",
            opinion: `Attestation confirmed. SFT root registered under IPFS CID ${data.ipfsCID.substring(0, 8)}... and synchronized across Solana, XRPL, and Stellar. Under AP2 guidelines, any metered RPC inference to this node will require a micro-USDF token payment.`
          });
        } else {
          const isStandardSuffix = formattedQuery.includes(".") && 
            [".gold", ".rwa", ".vault", ".trust", ".bank", ".legacy", ".troptions"].some(s => formattedQuery.endsWith(s));

          if (isStandardSuffix) {
            const prefix = formattedQuery.split(".")[0];
            const root = "." + formattedQuery.split(".")[1];
            setResult({
              name: formattedQuery,
              root,
              found: false,
              description: `Namespace "${formattedQuery}" is available for registry. You can mint it as a customized Web3 soulbound SFT.`,
            });

            setAgentOpinion({
              agentName: "RWA Operations Agent",
              avatar: "🏛️",
              role: "Asset Tokenization Swarm",
              opinion: `Available asset wrapper detected. If you register "${formattedQuery}", I will automatically spin up an ERC-6551 Token Bound Account (TBA) and generate the corresponding IPFS metadata templates for your appraisals and legal trust deeds.`
            });
          } else {
            setResult({
              name: formattedQuery,
              root: ".unykorn",
              found: false,
              description: `Search results for "${query}" across UnyKorn Web3 database. No active namespace found.`,
            });

            setAgentOpinion({
              agentName: "System Operator Agent",
              avatar: "⚙️",
              role: "Operations Swarm",
              opinion: `Evaluating general query "${query}". If this is a token ticker, real-world asset appraisal hash, or wallet address, please connect your Web3 wallet in the top header to query live balance logs or initiate an AP2 transaction routing check.`
            });
          }
        }
        setSearching(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setSearching(false);
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    setBalances((prev) => ({
      ...prev,
      [depositAsset]: prev[depositAsset] + amt
    }));

    const newTx: BankTransaction = {
      id: `TX-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toISOString(),
      description: `Sovereign Neo Bank Deposit - Asset Inflow`,
      amount: `+${amt.toLocaleString()} ${depositAsset}`,
      type: "deposit",
      status: "COMPLETED",
      txHash: "0x" + Math.random().toString(16).substring(2, 10)
    };

    setBankTransactions((prev) => [newTx, ...prev]);
    setDepositAmount("");
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawalAmount);
    if (isNaN(amt) || amt <= 0 || balances[withdrawalAsset] < amt) return;

    setBalances((prev) => ({
      ...prev,
      [withdrawalAsset]: prev[withdrawalAsset] - amt
    }));

    const newTx: BankTransaction = {
      id: `TX-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toISOString(),
      description: `Sovereign Neo Bank Payout - Asset Outflow`,
      amount: `-${amt.toLocaleString()} ${withdrawalAsset}`,
      type: "withdrawal",
      status: "COMPLETED",
      txHash: "0x" + Math.random().toString(16).substring(2, 10)
    };

    setBankTransactions((prev) => [newTx, ...prev]);
    setWithdrawalAmount("");
  };

  const startLeaseNegotiation = () => {
    setLeaseForm((prev) => ({ ...prev, status: "negotiating" }));
    setCommerceLogs((prev) => [
      ...prev,
      `[ACP] Initiating lease parameters for ${leaseForm.namespace}.`,
      `[ACP] Requesting agent persona validation: ${leaseForm.agent}.`,
      `[ACP] Evaluating carrying capacity metrics... Status: ACCEPTED.`,
    ]);

    setTimeout(() => {
      setLeaseForm((prev) => ({ ...prev, status: "challenge_received" }));
      setCommerceLogs((prev) => [
        ...prev,
        `[AP2] Challenge received from node: HTTP 402 Payment Required.`,
        `[AP2] Challenge parameters: { rate: "${leaseForm.rate}", currency: "USDF", recipient: "0xUnyKornReserve" }`,
        `[AP2] Generating cryptographic payment proof...`
      ]);

      setTimeout(() => {
        setLeaseForm((prev) => ({ ...prev, status: "settling" }));
        setCommerceLogs((prev) => [
          ...prev,
          `[AP2] Dispatching USDF payment of 0.05 USDF/sec.`,
          `[AP2] Transaction committed. Solana Block height: 18294821, hash: 0x8a92bcde`,
          `[SYSTEM] Checking on-chain receipt validation...`
        ]);

        setTimeout(() => {
          setLeaseForm((prev) => ({ ...prev, status: "active" }));
          setCommerceLogs((prev) => [
            ...prev,
            `[SYSTEM] Receipt confirmed on-chain. Suffix ${leaseForm.namespace} leased successfully to ${leaseForm.agent}.`,
            `[SYSTEM] Lease Status: ACTIVE. Metered API calls authorized.`
          ]);

          setBalances((prev) => ({ ...prev, USDF: prev.USDF - 150 }));
          const newTx: BankTransaction = {
            id: `TX-${Math.floor(Math.random() * 900) + 100}`,
            timestamp: new Date().toISOString(),
            description: `ACP Lease setup payment - Namespace ${leaseForm.namespace}`,
            amount: "-150.00 USDF",
            type: "payment",
            status: "COMPLETED",
            txHash: "0x8a92bcde"
          };
          setBankTransactions((prev) => [newTx, ...prev]);

        }, 1500);

      }, 1500);

    }, 1500);
  };

  const resetLease = () => {
    setLeaseForm((prev) => ({ ...prev, status: "idle" }));
    setCommerceLogs([
      "[SYSTEM] Agentic Commerce Protocol (ACP) node reset.",
      "[SYSTEM] Listening for Metaplex, Stellar, and XRPL memo lease challenge pings..."
    ]);
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Theme styles variables
  const isDark = theme === "dark";
  const bgStyle = isDark ? "bg-[#03060f] text-slate-100" : "bg-slate-50 text-slate-900";
  const headerBorder = isDark ? "border-white/5" : "border-slate-200 bg-white shadow-sm";
  const cardStyle = isDark ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200 shadow-md text-slate-800";
  const subCardStyle = isDark ? "bg-slate-900/40 border-white/5" : "bg-slate-100 border-slate-200 shadow-sm text-slate-800";
  const textTitle = isDark ? "text-white" : "text-slate-950";
  const textMuted = isDark ? "text-slate-400" : "text-slate-900";
  const inputBg = isDark ? "bg-slate-950 border-white/10" : "bg-white border-slate-300 text-slate-800";
  const terminalBg = isDark ? "bg-slate-950 border-white/10" : "bg-slate-900 border-slate-300 text-slate-100";
  const navBtnStyle = (t: TabType) => {
    if (activeTab === t) {
      return "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10";
    }
    return isDark ? "text-slate-400 hover:text-white" : "text-slate-800 hover:text-slate-950 font-bold";
  };
  const tableHeaderStyle = isDark ? "bg-slate-950/60 border-b border-white/5 text-slate-400" : "bg-slate-100 border-b border-slate-200 text-slate-900 font-bold";

  return (
    <div className={`min-h-screen ${bgStyle} flex flex-col font-sans transition-colors duration-300 relative overflow-hidden`}>


      {/* Background radial glows */}
      {isDark && (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        </>
      )}

      {/* Header */}
      <header className={`w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b ${headerBorder} z-20 rounded-b-2xl bg-opacity-80 backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className={`text-2xl font-black tracking-tighter bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent`}>
              UnyKorn.ai
            </span>
          </Link>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Sovereign OS
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className={`hidden md:flex flex-wrap items-center gap-1.5 p-1 rounded-xl border ${isDark ? "bg-slate-900/80 border-white/5" : "bg-slate-100 border-slate-200"}`}>
          <button
            onClick={() => setActiveTab("search")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${navBtnStyle("search")}`}
          >
            <span className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> Registry Search
            </span>
          </button>
          <button
            onClick={() => setActiveTab("neobank")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${navBtnStyle("neobank")}`}
          >
            <span className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5" /> Neo Bank
            </span>
          </button>
          <button
            onClick={() => setActiveTab("commerce")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${navBtnStyle("commerce")}`}
          >
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Agentic Commerce
            </span>
          </button>
          <button
            onClick={() => setActiveTab("swarm")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${navBtnStyle("swarm")}`}
          >
            <span className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5" /> Media Swarm
            </span>
          </button>
          <button
            onClick={() => setActiveTab("monorepo")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${navBtnStyle("monorepo")}`}
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Monorepo Systems
            </span>
          </button>
          <button
            onClick={() => setActiveTab("persona")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${navBtnStyle("persona")}`}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Persona & Papers
            </span>
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${navBtnStyle("apps")}`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Extensions & Apps
            </span>
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border ${isDark ? "border-white/10 hover:bg-white/5 text-amber-400" : "border-slate-200 hover:bg-slate-100 text-slate-700"} transition-all cursor-pointer`}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {Object.entries(wallets).map(([key, w]) => (
            w.connected ? (
              <div 
                key={key} 
                className={`hidden lg:flex items-center gap-2.5 border rounded-xl px-3.5 py-1.5 text-xs ${isDark ? "bg-slate-900/90 border-white/10 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"}`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px]">
                  {w.address?.substring(0, 6)}...{w.address?.substring(w.address.length - 4)}
                </span>
                <span className="font-bold text-amber-500 border-l border-white/10 pl-2">
                  {w.balance}
                </span>
                <button 
                  onClick={() => disconnectWallet(key as WalletType)}
                  className="text-slate-500 hover:text-red-400 ml-1 transition-colors"
                  title="Disconnect Wallet"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null
          ))}

          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 text-xs transition-all shadow-md shadow-amber-500/10"
            id="connect-wallet-btn"
          >
            <Wallet className="h-3.5 w-3.5" />
            Connect Wallet
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-10 z-10 flex flex-col justify-center">

        {/* 1. REGISTRY SEARCH TAB */}
        {activeTab === "search" && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
            {!result && !searching && (
              <div className="w-full flex flex-col items-center text-center mb-8">
                <h1 className={`text-4xl sm:text-5xl font-black tracking-tight ${textTitle} mb-3`}>
                  Sovereign Web3 Registry Explorer
                </h1>
                <p className={`${textMuted} text-sm max-w-lg mb-8 leading-relaxed`}>
                  Query registered real-world assets (RWA), check namespace suffix values, verify compliance, or execute agentic payment contracts under AP2.
                </p>
              </div>
            )}

            {/* Central Search Form */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mb-8 relative">
              <div className={`relative rounded-2xl p-1 flex items-center shadow-2xl border transition-all backdrop-blur-md ${isDark ? "bg-slate-900/80 border-white/10 focus-within:border-amber-500/30" : "bg-white border-slate-200 focus-within:border-amber-500"}`}>
                <div className="pl-4 pr-2 text-slate-500">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search registry... e.g. satoshi.gold, gold.1, smithfamily.legacy"
                  className="flex-grow bg-transparent border-none outline-none placeholder:text-slate-550 py-3 text-base"
                  style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
                  id="registry-search-input"
                />
                {query && (
                  <button 
                    type="button" 
                    onClick={() => setQuery("")}
                    className="p-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 text-sm transition-all ml-1 flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                  disabled={searching}
                >
                  {searching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Search
                    </>
                  )}
                </button>
              </div>

              {!result && !searching && (
                <div className="flex flex-wrap gap-2 justify-center mt-4 text-xs text-slate-500">
                  <span>Try searching:</span>
                  {["gold.1", "treasury.1", "satoshi.gold", "doe-trust.legacy"].map((sugg) => (
                    <button
                      type="button"
                      key={sugg}
                      onClick={() => setQuery(sugg)}
                      className="text-amber-500 hover:text-amber-400 underline font-mono cursor-pointer"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              )}
            </form>

            {searching && (
              <div className="w-full max-w-2xl py-20 flex flex-col items-center justify-center text-center">
                <RefreshCw className="h-10 w-10 text-amber-500 animate-spin mb-4" />
                <p className={`text-sm font-mono ${textMuted}`}>Querying multi-chain registry state (Solana, XRPL, Stellar)...</p>
              </div>
            )}

            {result && !searching && (
              <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="md:col-span-2 space-y-6">
                  <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md relative overflow-hidden ${cardStyle}`}>
                    {result.found ? (
                      result.isAI ? (
                        <div className="absolute top-0 right-0 bg-amber-500/10 border-l border-b border-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                          Sovereign AI OS
                        </div>
                      ) : (
                        <div className="absolute top-0 right-0 bg-emerald-500/10 border-l border-b border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                          Live SFT Registered
                        </div>
                      )
                    ) : (
                      <div className="absolute top-0 right-0 bg-amber-500/10 border-l border-b border-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Available to Mint
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                        {result.isAI ? "🤖" : "🌐"}
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold font-mono ${textTitle}`}>{result.name}</h2>
                        <p className={`text-xs ${textMuted}`}>{result.isAI ? "UnyKorn Cognitive Response" : `Suffix Class: ${result.root} Root`}</p>
                      </div>
                    </div>

                    <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {result.description}
                    </p>

                    {result.found ? (
                      result.isAI ? (
                        <div className={`space-y-4 border-t border-white/5 pt-5 text-xs sm:text-sm leading-relaxed font-mono p-4 rounded-xl border ${inputBg}`}>
                          <p className={isDark ? "text-amber-100" : "text-slate-900 font-bold"}>
                            {result.aiText}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 border-t border-white/5 pt-5">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className={textMuted}>RWA Valuation</p>
                              <p className="text-lg font-black text-amber-500 font-mono">
                                ${result.valuationUSD?.toLocaleString()} USD
                              </p>
                            </div>
                            <div>
                              <p className={textMuted}>Yield Multiplier</p>
                              <p className="text-sm font-bold">
                                {result.multiplier}
                              </p>
                            </div>
                          </div>

                          <div className={`space-y-2.5 text-xs font-mono p-4 rounded-xl border ${inputBg}`}>
                            <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-white/5" : "border-slate-100"}`}>
                              <span className={textMuted}>IPFS Metadata CID:</span>
                              <a 
                                href={`https://ipfs.io/ipfs/${result.ipfsCID}`}
                                target="_blank"
                                className="text-amber-500 hover:underline flex items-center gap-1"
                              >
                                {result.ipfsCID?.substring(0, 12)}... <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>

                            {result.solanaTxHash && (
                              <div className="flex items-center justify-between">
                                <span className={textMuted}>Solana Mainnet:</span>
                                <a 
                                  href={`https://solscan.io/tx/${result.solanaTxHash}`}
                                  target="_blank"
                                  className="text-amber-500 hover:underline flex items-center gap-1"
                                >
                                  {result.solanaTxHash.substring(0, 10)}... <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}

                            {result.stellarTxHash && (
                              <div className="flex items-center justify-between">
                                <span className={textMuted}>Stellar Mainnet:</span>
                                <a 
                                  href={`https://stellar.expert/explorer/public/tx/${result.stellarTxHash}`}
                                  target="_blank"
                                  className="text-amber-500 hover:underline flex items-center gap-1"
                                >
                                  {result.stellarTxHash.substring(0, 10)}... <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}

                            {result.xrplTxHash && (
                              <div className="flex items-center justify-between">
                                <span className={textMuted}>XRPL Mainnet:</span>
                                <a 
                                  href={`https://livenet.xrpl.org/transactions/${result.xrplTxHash}`}
                                  target="_blank"
                                  className="text-amber-500 hover:underline flex items-center gap-1"
                                >
                                  {result.xrplTxHash.substring(0, 10)}... <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="border-t border-white/5 pt-5 flex flex-wrap gap-3">
                        <Link
                          href="/namespaces/register"
                          className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 text-xs transition-all flex items-center gap-1"
                        >
                          Mint Namespace <ArrowUpRight className="h-4.5 w-4.5" />
                        </Link>
                        <Link
                          href="/namespaces/cockpit"
                          className={`rounded-xl border font-bold px-4 py-2.5 text-xs transition-all ${isDark ? "border-white/20 hover:bg-white/5 text-slate-300" : "border-slate-300 hover:bg-slate-50 text-slate-700"}`}
                        >
                          View Minting Cockpit
                        </Link>
                      </div>
                    )}
                  </div>

                  <button 
                    type="button"
                    onClick={() => setResult(null)}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 underline cursor-pointer"
                  >
                    ← Clear Search Results
                  </button>
                </div>

                <div className="space-y-4">
                  {agentOpinion && (
                    <div className="rounded-2xl bg-gradient-to-b from-[#0b1733] to-[#04091a] border border-blue-500/20 p-5 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center gap-2.5 mb-3 border-b border-white/5 pb-3">
                        <span className="text-2xl">{agentOpinion.avatar}</span>
                        <div>
                          <p className="font-bold text-white text-xs">{agentOpinion.agentName}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{agentOpinion.role}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                        &ldquo;{agentOpinion.opinion}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className={`rounded-2xl border p-4 space-y-3 ${subCardStyle}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quick Actions</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <button 
                        onClick={() => setActiveTab("neobank")}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${isDark ? "bg-slate-900/60 border-white/5 hover:bg-slate-900 text-slate-300 hover:text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                      >
                        <span>Deposit USDF reserves</span>
                        <ArrowRight className="h-3 w-3 text-amber-500" />
                      </button>
                      <button 
                        onClick={() => setActiveTab("commerce")}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${isDark ? "bg-slate-900/60 border-white/5 hover:bg-slate-900 text-slate-300 hover:text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                      >
                        <span>ACP Lease controller</span>
                        <ArrowRight className="h-3 w-3 text-amber-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. NEO BANK TAB */}
        {activeTab === "neobank" && (
          <div className="w-full space-y-6 animate-in fade-in duration-300">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5 ${isDark ? "border-white/5" : "border-slate-200"}`}>
              <div>
                <h1 className={`text-3xl font-black ${textTitle}`}>Sovereign Reserve Accounts</h1>
                <p className={`text-xs ${textMuted}`}>IBAN Routing: UNY-US42-9831-2894 · SWIFT/BIC: UNYKUS44</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Stripe webhook routing ONLINE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { code: "USDF", name: "Sovereign Stablecoin", bal: balances.USDF, color: "text-amber-500" },
                { code: "TROP", name: "Utility Token", bal: balances.TROP, color: "text-blue-500" },
                { code: "USDC", name: "USD Coin Reserve", bal: balances.USDC, color: "text-cyan-500" },
                { code: "EURS", name: "Euro Coin Reserve", bal: balances.EURS, color: "text-purple-500" },
              ].map((coin) => (
                <div key={coin.code} className={`rounded-2xl border p-5 shadow-lg backdrop-blur-md ${cardStyle}`}>
                  <p className={`text-xs font-semibold ${textMuted}`}>{coin.name}</p>
                  <p className={`text-2xl font-black font-mono mt-2 ${coin.color}`}>
                    {coin.bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-[10px] mt-1 uppercase tracking-wider font-mono ${textMuted}`}>{coin.code}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className={`rounded-2xl border p-6 shadow-md ${isDark ? "bg-slate-900/60 border-white/5" : "bg-white border-slate-200"}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textTitle}`}>
                  <ArrowDown className="h-5 w-5 text-emerald-500" />
                  Deposit Reserves
                </h3>
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {["USDF", "TROP", "USDC"].map((asset) => (
                      <button
                        type="button"
                        key={asset}
                        onClick={() => setDepositAsset(asset as any)}
                        className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${depositAsset === asset ? "bg-amber-500 text-slate-950 border-amber-500" : isDark ? "bg-slate-900 border-white/10 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"}`}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Deposit Amount</label>
                    <div className={`relative rounded-xl border p-1 flex items-center ${inputBg}`}>
                      <div className="pl-3 pr-2 text-slate-500">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="e.g. 5000"
                        className="bg-transparent border-none outline-none placeholder:text-slate-605 py-2 w-full text-sm font-mono"
                        style={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 text-xs transition-all cursor-pointer"
                      >
                        Deposit
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className={`rounded-2xl border p-6 shadow-md ${isDark ? "bg-slate-900/60 border-white/5" : "bg-white border-slate-200"}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textTitle}`}>
                  <ArrowUp className="h-5 w-5 text-amber-500" />
                  Withdraw Reserves
                </h3>
                <form onSubmit={handleWithdrawal} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {["USDF", "TROP", "USDC"].map((asset) => (
                      <button
                        type="button"
                        key={asset}
                        onClick={() => setWithdrawalAsset(asset as any)}
                        className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${withdrawalAsset === asset ? "bg-amber-500 text-slate-950 border-amber-500" : isDark ? "bg-slate-900 border-white/10 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"}`}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Withdrawal Amount</label>
                    <div className={`relative rounded-xl border p-1 flex items-center ${inputBg}`}>
                      <div className="pl-3 pr-2 text-slate-500">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <input
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        placeholder="e.g. 1000"
                        className="bg-transparent border-none outline-none placeholder:text-slate-605 py-2 w-full text-sm font-mono"
                        style={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs transition-all cursor-pointer"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textTitle}`}>
                <Database className="h-5 w-5 text-amber-500" />
                Reserves Ledger History
              </h3>
              <div className={`overflow-x-auto rounded-xl border ${isDark ? "border-white/5" : "border-slate-200"}`}>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className={`border-b font-bold ${tableHeaderStyle}`}>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankTransactions.map((tx) => (
                      <tr key={tx.id} className={`border-b hover:bg-white/5 transition-colors ${isDark ? "border-white/5" : "border-slate-100"}`}>
                        <td className="py-3.5 px-4 font-mono font-bold">{tx.id}</td>
                        <td className={`py-3.5 px-4 font-mono ${textMuted}`}>
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3.5 px-4 font-medium">{tx.description}</td>
                        <td className={`py-3.5 px-4 font-bold font-mono ${tx.type === "deposit" || tx.type === "yield" ? "text-emerald-500" : "text-amber-500"}`}>
                          {tx.amount}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold font-mono">
                            {tx.status}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 font-mono ${textMuted}`}>{tx.txHash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kraken Cross-Chain Ledgers */}
            <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
              <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${textTitle}`}>
                <Activity className="h-5 w-5 text-amber-500" />
                Kraken Cross-Chain Unified Ledgers
              </h3>
              <p className={`text-xs mb-4 ${textMuted}`}>Live telemetry from FTH multi-chain settlement rails (9 production environments, unified BridgePayload protocol).</p>
              
              <div className={`overflow-x-auto rounded-xl border ${isDark ? "border-white/5" : "border-slate-200"}`}>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className={`border-b font-bold ${tableHeaderStyle}`}>
                      <th className="py-3 px-4">Ledger ID</th>
                      <th className="py-3 px-4">Chain</th>
                      <th className="py-3 px-4">Payload/Payload Metadata</th>
                      <th className="py-3 px-4">Value Settled</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {krakenLedgers.map((l) => (
                      <tr key={l.id} className={`border-b hover:bg-white/5 transition-colors ${isDark ? "border-white/5" : "border-slate-100"}`}>
                        <td className="py-3.5 px-4 font-mono font-bold">{l.id}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-400 font-mono">{l.chain}</td>
                        <td className="py-3.5 px-4 font-mono">{l.payload}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-500 font-mono">{l.amount}</td>
                        <td className={`py-3.5 px-4 ${textMuted}`}>{l.timestamp}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold font-mono">
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 3. AGENTIC COMMERCE TAB */}
        {activeTab === "commerce" && (
          <div className="w-full grid md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-2 space-y-6">
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${textTitle}`}>
                  <Activity className="h-5 w-5 text-amber-500" />
                  RWA Suffix Lease Manager (ACP)
                </h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Negotiate automated leases for your premium suffixes. Active leases yield monthly USDF reserves directly to the Neo Bank ledger.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { ns: "gold.1", rate: "0.05 USDF/sec", cap: "1,200 req/min", status: "AVAILABLE", color: isDark ? "border-amber-500/20" : "border-slate-200" },
                    { ns: "treasury.1", rate: "0.08 USDF/sec", cap: "2,000 req/min", status: "ACTIVE", color: "border-emerald-500/30" },
                    { ns: "rwa.1", rate: "0.04 USDF/sec", cap: "800 req/min", status: "AVAILABLE", color: isDark ? "border-white/5" : "border-slate-200" },
                    { ns: "legacy.1", rate: "0.03 USDF/sec", cap: "500 req/min", status: "AVAILABLE", color: isDark ? "border-white/5" : "border-slate-200" }
                  ].map((suf) => (
                    <div 
                      key={suf.ns}
                      className={`rounded-2xl border bg-slate-900/50 p-4 flex flex-col justify-between gap-3 ${suf.color} ${isDark ? "" : "bg-slate-100"}`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-mono font-bold text-sm ${isDark ? "text-white" : "text-slate-955"}`}>{suf.ns}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold font-mono ${suf.status === "ACTIVE" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border border-amber-500/20 text-amber-500"}`}>
                            {suf.status}
                          </span>
                        </div>
                        <p className={`text-[10px] ${textMuted}`}>Lease Rate: {suf.rate}</p>
                        <p className={`text-[10px] ${textMuted}`}>Node Carry Cap: {suf.cap}</p>
                      </div>

                      {suf.status === "AVAILABLE" && leaseForm.status === "idle" && (
                        <button
                          onClick={() => {
                            setLeaseForm((prev) => ({ ...prev, namespace: suf.ns, rate: suf.rate }));
                            startLeaseNegotiation();
                          }}
                          className="w-full text-center rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 text-xs transition-all mt-2 cursor-pointer"
                        >
                          Initiate ACP Lease
                        </button>
                      )}
                      {suf.status === "ACTIVE" && (
                        <div className={`text-center rounded-xl border py-1.5 text-xs font-mono mt-2 ${isDark ? "bg-slate-800 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
                          Yielding Reserves...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 mb-5" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                  <div>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitle}`}>
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Google TimesFM AI Forecasting Console
                    </h3>
                    <p className={`text-xs ${textMuted}`}>Pre-trained Time Series Foundation Model (`timesfm-200m`) executing edge-based predictive analytics.</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {["gold", "lp", "ap2"].map((target) => (
                      <button
                        type="button"
                        key={target}
                        onClick={() => {
                          setTimesfmTarget(target as any);
                          if (target === "gold") setTimesfmData([1800, 1805, 1812, 1810, 1818, 1825, 1822, 1835, 1840, 1855, 1850, 1868]);
                          else if (target === "lp") setTimesfmData([60, 62, 65, 68, 70, 72, 74, 76, 75, 78, 80, 82]);
                          else setTimesfmData([0.010, 0.012, 0.011, 0.014, 0.016, 0.018, 0.020, 0.022, 0.025, 0.028, 0.030, 0.032]);
                          setTimesfmLogs([`[TimesFM] Target switched to ${target.toUpperCase()}. Model parameters updated.`]);
                        }}
                        className={`rounded-xl border px-3 py-1.5 text-[10px] font-bold font-mono transition-all cursor-pointer ${timesfmTarget === target ? "bg-amber-500 text-slate-950 border-amber-500" : isDark ? "bg-slate-900 border-white/10 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"}`}
                      >
                        {target.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div className={`rounded-xl border p-4 ${isDark ? "bg-slate-955/40 border-white/5" : "bg-slate-50 border-slate-200"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Forecast Horizon (+24 intervals)</p>
                      
                      <div className="flex items-end justify-between h-36 gap-2 border-b pb-2" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                        {timesfmData.map((val, idx) => {
                          const maxVal = Math.max(...timesfmData);
                          const minVal = Math.min(...timesfmData);
                          const range = maxVal - minVal || 1;
                          const percentHeight = ((val - minVal) / range) * 70 + 30;
                          const isForecast = idx >= 7;
                          
                          return (
                            <div key={idx} className="flex-grow flex flex-col items-center group relative h-full justify-end">
                              <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all rounded bg-slate-900 border border-white/10 px-2 py-0.5 text-[9px] font-mono text-amber-500 z-30 whitespace-nowrap shadow-xl">
                                {timesfmTarget === "ap2" ? `${val.toFixed(3)} USDF` : timesfmTarget === "lp" ? `${val}%` : `$${val.toLocaleString()}`}
                              </span>
                              <div 
                                className={`w-full rounded-t-sm transition-all duration-700 ${isForecast ? "bg-gradient-to-t from-amber-600/30 to-amber-500 animate-pulse border-t-2 border-amber-400" : "bg-blue-600/60"}`}
                                style={{ height: `${percentHeight}%` }}
                              />
                              <span className="text-[8px] font-mono text-slate-500 mt-1">t+{idx}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600/60" /> Historical Context</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500 animate-pulse" /> TimesFM Predicted</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className={`text-xs ${textMuted} leading-relaxed`}>
                        {timesfmTarget === "gold" && "VALUATION FORECAST: Run model inference to project commodities pricing curves for physical Zurich vault gold allocations."}
                        {timesfmTarget === "lp" && "LIQUIDITY FORECAST: Predict carrying capacity metrics across automated pools to preemptively re-threshold multisig rules."}
                        {timesfmTarget === "ap2" && "AP2 PRICING FORECAST: Predict system load metrics over a rolling 24h window to adjust dynamic API request pricing parameters."}
                      </p>
                      
                      <div className="bg-black/80 rounded-xl p-3.5 border border-white/5 font-mono text-[9px] text-slate-300 h-28 overflow-y-auto space-y-1.5">
                        {timesfmLogs.map((log, index) => (
                          <div key={index} className={log.includes("[TimesFM] WARNING") ? "text-amber-500 font-bold" : log.includes("SUCCESS") ? "text-emerald-400 font-bold" : "text-slate-400"}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={runTimesfmInference}
                      disabled={timesfmLoading}
                      className="w-full text-center rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10"
                    >
                      {timesfmLoading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Running Inference Swarm...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          Run TimesFM Inference
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl border p-5 shadow-2xl relative ${terminalBg}`}>
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5" style={{ color: isDark ? "#94a3b8" : "#f1f5f9" }}>
                  <Terminal className="h-4 w-4 text-amber-500" />
                  ACP/AP2 Terminal Trace Log
                </h4>

                <div className="h-44 overflow-y-auto bg-black/60 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 space-y-2">
                  {commerceLogs.map((log, index) => (
                    <div key={index} className={log.includes("[ACP]") ? "text-blue-400" : log.includes("[AP2]") ? "text-yellow-400" : log.includes("[SYSTEM]") ? "text-emerald-400" : "text-slate-300"}>
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>

                {leaseForm.status !== "idle" && (
                  <div className="mt-4 flex justify-between items-center text-xs">
                    <span className="font-mono" style={{ color: isDark ? "#64748b" : "#94a3b8" }}>Current Status: <strong className="text-amber-500 font-bold uppercase">{leaseForm.status}</strong></span>
                    {leaseForm.status === "active" && (
                      <button
                        onClick={resetLease}
                        className="rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold px-3 py-1.5 text-[10px] transition-all cursor-pointer"
                      >
                        Reset Lease Terminal
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className={`rounded-2xl border p-5 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">UnyKorn Agent Roster</h4>
                <div className="space-y-3">
                  {[
                    { name: "UNYKORN-SETTLEMENT-02", alias: "Jimmy", status: "STANDBY", role: "Yield allocations", avatar: "🏦" },
                    { name: "UNYKORN-OPERATOR-03", alias: "Ops Bot", status: "ACTIVE", role: "DNS & Tunneling", avatar: "⚙️" },
                    { name: "UNYKORN-LEGAL-CRYSTAL-01", alias: "Crystal", status: "STANDBY", role: "Compliance gates", avatar: "⚖️" },
                    { name: "UNYKORN-NOTARY-04", alias: "Notary", status: "ACTIVE", role: "ZK Release notary", avatar: "🧬" }
                  ].map((ag) => (
                    <div key={ag.name} className={`rounded-xl border p-3 flex justify-between items-center ${subCardStyle}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{ag.avatar}</span>
                        <div>
                          <p className={`font-bold text-[11px] leading-tight ${textTitle}`}>{ag.name}</p>
                          <p className={`text-[9px] mt-0.5 ${textMuted}`}>{ag.role}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold font-mono ${ag.status === "ACTIVE" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-slate-800 border border-white/5 text-slate-500"}`}>
                        {ag.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. MEDIA SWARM & SHIELD TAB */}
        {activeTab === "swarm" && (
          <div className="w-full grid md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-2 space-y-6">
              
              {/* GCP Assets Telemetry */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${textTitle}`}>
                  <Globe className="h-5 w-5 text-amber-500" />
                  GCP Sovereign Portfolio Telemetry
                </h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Live network status and tokenized value metrics of pre-funded cloud systems ($15.4M - $28.5M book valuation).</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`rounded-xl border p-4 ${subCardStyle}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Deployed App Nodes</span>
                    <p className="text-2xl font-black text-white mt-1">17 Nodes</p>
                    <p className="text-[10px] text-slate-400 mt-1">Active load-balanced edges</p>
                  </div>
                  <div className={`rounded-xl border p-4 ${subCardStyle}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Apex Domains</span>
                    <p className="text-2xl font-black text-white mt-1">16 Domains</p>
                    <p className="text-[10px] text-slate-400 mt-1">Routing via Cloudflare proxied DNS</p>
                  </div>
                  <div className={`rounded-xl border p-4 ${subCardStyle}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Reusable Packages</span>
                    <p className="text-2xl font-black text-white mt-1">44 Crates</p>
                    <p className="text-[10px] text-slate-400 mt-1">NPM, Cargo, and Python wheel builds</p>
                  </div>
                </div>
              </div>

              {/* Sentiment Shield / Reputation Guard */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitle}`}>
                    <Shield className="h-5 w-5 text-emerald-400" />
                    AI Sentiment Shield & Reputation Guard
                  </h3>
                  <button
                    onClick={() => setIsShieldActive(!isShieldActive)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${isShieldActive ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-450"}`}
                  >
                    {isShieldActive ? "Shield Active" : "Shield Suspended"}
                  </button>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-6 mb-6">
                  <div className={`rounded-xl border p-4 sm:col-span-1 text-center flex flex-col justify-center ${subCardStyle}`}>
                    <span className="text-xs font-bold text-slate-400">Reputation Index</span>
                    <p className="text-4xl font-black text-amber-500 font-mono mt-1">{sentimentScore}%</p>
                    <p className="text-[9px] text-slate-500 mt-1 font-bold">SOVEREIGN PROOF DOMINANCE</p>
                  </div>
                  <div className="sm:col-span-2 space-y-2.5">
                    <p className="text-xs font-bold text-slate-400">Target Mitigation Logs</p>
                    <div className={`rounded-xl p-3.5 border font-mono text-[9px] h-28 overflow-y-auto space-y-1.5 ${terminalBg}`}>
                      {logMessages.map((msg, index) => (
                        <div key={index} className="text-slate-350">{msg}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400">Active Suppression Targets</p>
                  {[
                    { id: "bryan", t: "Bryan Stone / Troptions legacy associations", status: "REDIRECTED", action: "Hashed proof of Unykorn ownership anchored to Stellar." },
                    { id: "securities", t: "Unregulated coin/securities allegations", status: "SUPPRESSED", action: "Peachtree Parkway physical office proof and SEC MIC exch:UBEC files attached." },
                    { id: "scams", t: "Scam allegations / False reporting", status: "REPLACED", action: "Injected SSRN Paper Abstract #6241279 and Zenodo carry capacity proof to IPFS." }
                  ].map((target) => (
                    <div key={target.id} className={`rounded-xl border p-3.5 flex justify-between items-start gap-4 ${subCardStyle}`}>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white leading-none">{target.t}</p>
                        <p className="text-[10px] text-slate-400">{target.action}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[9px] font-bold shrink-0 font-mono">
                        {target.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="space-y-4">
              {/* Media Swarm Dispatcher */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Media Swarm Dispatcher</h4>
                <p className="text-xs text-slate-400 mb-4">Select an AI Publishing Group to distribute peer-reviewed articles, specifications, and telemetry mappings to index engines.</p>
                
                <div className="space-y-2.5">
                  {[
                    { id: "acad", name: "Academic Research Group", desc: "SSRN abstract injections & Zenodo carrying capacity details." },
                    { id: "specs", name: "Web3 Specifications Group", desc: "OpenAPI endpoints & Hyperledger Besu AuditLogs." },
                    { id: "barter", name: "Barter & Commodity Group", desc: "Y3K markets pricing index & Zurich gold reserve details." },
                    { id: "defense", name: "Security & Anti-Scam Group", desc: "Fraud suppression logic & ZK wills attestation guides." }
                  ].map((grp) => (
                    <div key={grp.id} className={`rounded-xl border p-3 flex flex-col justify-between gap-3 ${subCardStyle}`}>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{grp.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{grp.desc}</p>
                      </div>
                      <button
                        onClick={() => triggerSwarmPublish(grp.name)}
                        disabled={isDispatching}
                        className="w-full text-center rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 text-[10px] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isDispatching ? "Publishing..." : "Dispatch Publication"}
                      </button>
                    </div>
                  ))}
                </div>

                {dispatchLogs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase text-slate-500">Publishing Logs</p>
                    <div className={`rounded-xl p-3 border font-mono text-[9px] h-28 overflow-y-auto space-y-1 ${terminalBg}`}>
                      {dispatchLogs.map((log, index) => (
                        <div key={index} className="text-emerald-400">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. MONOREPO SYSTEMS TAB */}
        {activeTab === "monorepo" && (
          <div className="w-full grid md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-2 space-y-6">
              
              {/* BADASS AI Console */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${textTitle}`}>
                  <Cpu className="h-5 w-5 text-amber-500" />
                  BADASS AI: OCR Ingestion Console
                </h3>
                <p className={`text-xs mb-6 ${textMuted}`}>AI cognitive vision document parser for processing SEC filings, regulatory registries, and troptions-ucc layouts.</p>
                
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Document Class</label>
                    <select
                      value={badassDocType}
                      onChange={(e) => setBadassDocType(e.target.value)}
                      className={`w-full rounded-xl border p-2 text-xs cursor-pointer ${inputBg}`}
                    >
                      <option value="sec_filing">SEC Form Filings</option>
                      <option value="troptions_ucc">Troptions UCC Filings</option>
                      <option value="trust_deeds">Legal Succession Trusts</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Simulate File Upload</label>
                    <div className={`rounded-xl border p-1 flex items-center ${inputBg}`}>
                      <input 
                        type="text" 
                        placeholder="e.g. form-10k-fth-trading.pdf" 
                        disabled
                        className="bg-transparent border-none outline-none py-1.5 px-2.5 text-xs w-full text-slate-400"
                      />
                      <button
                        onClick={runBadassOcr}
                        disabled={badassProcessing}
                        className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 text-xs transition-all shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {badassProcessing ? "Ingesting..." : "Ingest Document"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Extraction Log Output</p>
                  <div className={`rounded-xl p-3.5 border font-mono text-[9px] h-28 overflow-y-auto space-y-1.5 ${terminalBg}`}>
                    {badassLogs.map((log, index) => (
                      <div key={index} className={log.includes("SUCCESS") ? "text-emerald-400 font-bold" : "text-slate-300"}>{log}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FlashRouter & FlashBot */}
              <div className="grid sm:grid-cols-2 gap-6">
                
                {/* FlashRouter */}
                <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                  <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${textTitle}`}>
                    <SlidersHorizontal className="h-4.5 w-4.5 text-amber-500" />
                    FlashRouter Liquidity Optimizer
                  </h3>
                  <p className={`text-[10px] mb-4 ${textMuted}`}>Route transactions across unified Solana DEX and Stellar Bridge pools at minimal price impact.</p>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Source Asset</span>
                        <select
                          value={routerSource}
                          onChange={(e) => setRouterSource(e.target.value)}
                          className={`w-full rounded-xl border p-2 text-xs ${inputBg}`}
                        >
                          <option value="SOL">SOL</option>
                          <option value="USDC">USDC</option>
                          <option value="TROP">TROP</option>
                        </select>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Destination</span>
                        <select
                          value={routerDest}
                          onChange={(e) => setRouterDest(e.target.value)}
                          className={`w-full rounded-xl border p-2 text-xs ${inputBg}`}
                        >
                          <option value="USDF">USDF</option>
                          <option value="USDT">USDT</option>
                          <option value="XRP">XRP</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Amount</span>
                      <div className={`relative rounded-xl border p-1 flex items-center ${inputBg}`}>
                        <input
                          type="number"
                          value={routerAmount}
                          onChange={(e) => setRouterAmount(e.target.value)}
                          className="bg-transparent border-none outline-none py-1.5 px-2 text-xs w-full font-mono text-white"
                        />
                        <button
                          onClick={runRouterCalculation}
                          disabled={routerCalculating}
                          className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 text-[10px] transition-all cursor-pointer disabled:opacity-50"
                        >
                          {routerCalculating ? "Optimizing..." : "Calculate Route"}
                        </button>
                      </div>
                    </div>

                    {routerResult && (
                      <div className={`rounded-xl border p-3 space-y-2 text-[10px] font-mono ${subCardStyle}`}>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Path:</span>
                          <span className="font-bold text-amber-500">{routerResult.route.join(" → ")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Expected Output:</span>
                          <span className="font-bold text-emerald-500">{routerResult.expectedOutput}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Price Impact:</span>
                          <span className="font-bold text-white">{routerResult.priceImpact}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* FlashBot Arbitrage */}
                <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`text-base font-bold flex items-center gap-2 ${textTitle}`}>
                      <Zap className="h-4.5 w-4.5 text-amber-500" />
                      FlashBot Liquidation Arbitrage
                    </h3>
                    <button
                      onClick={() => setBotActive(!botActive)}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${botActive ? "bg-red-500 text-white" : "bg-emerald-500 text-slate-955"}`}
                    >
                      {botActive ? "Stop Bot" : "Start FlashBot"}
                    </button>
                  </div>
                  <p className={`text-[10px] mb-3 ${textMuted}`}>Executes instant liquidated debt arbitrage transactions on Base L2 using flash loans.</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
                    <div className={`rounded-xl border p-2 ${subCardStyle}`}>
                      <span className="text-[8px] font-bold uppercase text-slate-500">Status</span>
                      <p className={`font-black mt-0.5 ${botActive ? "text-emerald-500 animate-pulse" : "text-red-500"}`}>{botActive ? "RUNNING" : "INACTIVE"}</p>
                    </div>
                    <div className={`rounded-xl border p-2 ${subCardStyle}`}>
                      <span className="text-[8px] font-bold uppercase text-slate-500">Arbitrage Yield</span>
                      <p className="font-black text-amber-500 mt-0.5 font-mono">{arbitrageProfit} WETH</p>
                    </div>
                  </div>

                  <div className={`rounded-xl p-2.5 border font-mono text-[8px] h-20 overflow-y-auto space-y-1 ${terminalBg}`}>
                    {botLogs.map((log, index) => (
                      <div key={index} className={log.includes("SUCCESS") ? "text-emerald-400 font-bold" : "text-slate-300"}>{log}</div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Playbook (Genesis 402 Model Simulator) */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${textTitle}`}>
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  Genesis 402: Money Playbook Simulator
                </h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Interactive macroeconomic modeling representing capital scale velocity and settlement flywheels.</p>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-5">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-300">Target Leverage Ratio</span>
                        <span className="font-mono text-amber-500">{flywheelLeverage}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="3.0"
                        step="0.1"
                        value={flywheelLeverage}
                        onChange={(e) => setFlywheelLeverage(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 h-1 rounded bg-slate-800"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-300">Reserve Coverage Rate</span>
                        <span className="font-mono text-amber-500">{flywheelReserveRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        step="1"
                        value={flywheelReserveRate}
                        onChange={(e) => setFlywheelReserveRate(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-1 rounded bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`rounded-xl border p-4 text-center flex flex-col justify-center ${subCardStyle}`}>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Simulated Annual Yield</span>
                      <p className="text-2xl font-black text-emerald-400 mt-1">{(24.5 * (flywheelLeverage / 1.5) * (20 / flywheelReserveRate)).toFixed(1)}%</p>
                    </div>
                    <div className={`rounded-xl border p-4 text-center flex flex-col justify-center ${subCardStyle}`}>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Projected Volume</span>
                      <p className="text-xl font-black text-amber-500 mt-1 font-mono">${(1.85 * flywheelLeverage).toFixed(2)}M</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-4">
              
              {/* ADK Orchestrator */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">ADK Python Agent Orchestrator</h4>
                <p className="text-xs text-slate-400 mb-4">Orchestrate and schedule regular monorepo sync actions, ledger snapshots, and metadata audits.</p>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Job Interval</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["minutely", "hourly", "daily"].map((inv) => (
                        <button
                          key={inv}
                          onClick={() => {
                            setCronInterval(inv);
                            const expr = inv === "minutely" ? "*/5 * * * *" : inv === "hourly" ? "0 * * * *" : "0 0 * * *";
                            setOrchestratorLogs(prev => [...prev, `[ADK-Orchestrator] Schedule updated to: '${expr}'`]);
                          }}
                          className={`rounded-lg py-1.5 text-[10px] font-bold transition-all cursor-pointer ${cronInterval === inv ? "bg-amber-500 text-slate-950" : isDark ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-slate-200 text-slate-700"}`}
                        >
                          {inv.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={triggerOrchestratorJob}
                    disabled={orchestratorRunning}
                    className="w-full text-center rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {orchestratorRunning ? "Executing Job..." : "Trigger Manual Workflow"}
                  </button>
                </div>

                <div className={`rounded-xl p-3 border font-mono text-[9px] h-28 overflow-y-auto space-y-1 ${terminalBg}`}>
                  {orchestratorLogs.map((log, index) => (
                    <div key={index} className="text-slate-350">{log}</div>
                  ))}
                </div>
              </div>

              {/* L1 Chambers Status */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Sovereign L1 Chambers</h4>
                <div className="space-y-3">
                  {l1Chambers.map((ch) => (
                    <div key={ch.name} className={`rounded-xl border p-3 flex justify-between items-center ${subCardStyle}`}>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className={`font-bold text-xs ${textTitle}`}>{ch.name}</p>
                          <span className={`rounded-full px-1.5 py-0.2 text-[8px] font-mono ${ch.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-550 border border-white/5"}`}>
                            {ch.status}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-0.5 leading-none">{ch.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-amber-500 text-[10px] font-bold">h: {ch.height}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{ch.validators} nodes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 6. SOVEREIGN PERSONA & PAPERS TAB */}
        {activeTab === "persona" && (
          <div className="w-full grid md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-2 space-y-6">
              
              {/* Profile Card */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md relative overflow-hidden ${cardStyle}`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-6">
                  <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 ${isDark ? "bg-slate-800 border border-white/5" : "bg-white border border-slate-200 shadow"}`}>
                    🏛️
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h2 className={`text-2xl font-black ${textTitle}`}>Platform Architect</h2>
                    <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">Founder-Architect & Chief Systems Engineer • FTH Trading / Unykorn</p>
                    <p className={`text-xs ${textMuted} max-w-lg leading-relaxed`}>
                      Architect of multi-layered sovereign finance, barter networks, and zero-knowledge legal execution chains. Designs permanent digital identity namespaces and asset protection models.
                    </p>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${inputBg} font-mono text-[10px]`}>
                  <div>
                    <span className="block text-slate-500 font-sans">NIL33 Anchor Public Hash</span>
                    <span className="font-bold text-amber-500">0xNIL33_Architect_Anchor_772e...88ab</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-sans">Stripe Verified Merchant ID</span>
                    <span className="font-bold text-emerald-500">acct_1H2z8cArchitectFTH</span>
                  </div>
                </div>
              </div>

              {/* Research Publications */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${textTitle}`}>
                  <FileText className="h-5 w-5 text-amber-500" />
                  Published Scientific Papers & Specifications
                </h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Peer-reviewed academic research publications and IPFS structural protocol drafts grounding the Unykorn OS.</p>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Deterministic Literary Publishing: A Multi-Layer Provenance Model for Verifiable Manuscripts",
                      meta: "SSRN Academic Catalog • Abstract #6241279 • October 2025",
                      desc: "Outlines tokenized real-world assets (RWA), permanent registry suffixes, and legal succession governance deeds backed by ZK proofs. ORCID Profile: 0009-0008-8425-939X."
                    },
                    {
                      title: "Moltbook Genesis Protocol Macroeconomic Carrying Capacity Simulation",
                      meta: "Zenodo Research Library • DOI 10.5281/zenodo.18729652 • June 2026",
                      desc: "Simulates systemic liquidity, barter transaction carrying capacity limits, and velocity metrics within zero-margin settlement environments."
                    },
                    {
                      title: "Apostle-7332: Symmetric Cryptographic Entitlements over Decentralized Barter Membranes",
                      meta: "IPFS Network Specifications • CID QmTroyUnYkOrn9Rail • March 2026",
                      desc: "Defines the unified bridge payload state, multi-sig execution rules, and zero-bps stablecoin settlement rails on XRPL, Stellar, and Solana."
                    },
                    {
                      title: "DONK PublishingKernelV2 (LPS-1 Specification)",
                      meta: "Zenodo Academic Catalog • DOI 10.5281/zenodo.18646886 • March 2026",
                      desc: "Sovereign publishing protocol standard for autonomous AI delegation, Polygon LiteraryAnchor syncing, and automated metadata pinsets."
                    }
                  ].map((paper, idx) => (
                    <div key={idx} className={`rounded-xl border p-5 space-y-2.5 ${subCardStyle}`}>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-xs text-white leading-tight">{paper.title}</h4>
                        <p className="text-[9px] text-amber-500 font-mono font-bold uppercase">{paper.meta}</p>
                      </div>
                      <p className={`text-xs leading-relaxed ${textMuted}`}>{paper.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review of Deployed Projects */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${textTitle}`}>
                  <Layers className="h-5 w-5 text-amber-500" />
                  Review of Deployed Workspace Projects
                </h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Audit log and status of active sub-projects currently deployed across the local and cloud infrastructure.</p>

                <div className="space-y-3">
                  {[
                    {
                      name: "legacy-vault-protocol",
                      path: "adk_build/legacy-vault-protocol",
                      status: "LIVE",
                      desc: "Zero-knowledge digital estate succession OS. Configured for client-side AES-256-GCM encryption, SnarkJS PLONK proofs, and RUFADAA succession checklists."
                    },
                    {
                      name: "unykorn-doc-intelligence (BADASS AI)",
                      path: "adk_build/unykorn-doc-intelligence",
                      status: "LIVE",
                      desc: "Autonomous voice-driven cognitive cockpit for the Troptions ecosystem. Coordinated 6-agent mesh using Gemini 2.0 and local LLM pipelines."
                    },
                    {
                      name: "flashrouter",
                      path: "adk_build/flashrouter",
                      status: "DEPLOYED",
                      desc: "Multi-provider flash loan optimizer abstracting Aave V3, Balancer V2, Uniswap V3, and MakerDAO DSS-Flash behind a unified Solidity/TS router."
                    },
                    {
                      name: "flash-bot",
                      path: "adk_build/flash-bot",
                      status: "ACTIVE",
                      desc: "Liquidation and arbitrage contracts running on Base L2 pools with automated settlement closures."
                    },
                    {
                      name: "adk_orchestrator",
                      path: "adk_build/adk_orchestrator",
                      status: "RUNNING",
                      desc: "Python Asyncio scheduler orchestrating multi-agent tasks, transaction monitors, and wallet balance sweeps."
                    },
                    {
                      name: "genesis402-playbook",
                      path: "genesis402-playbook",
                      status: "INTEGRATED",
                      desc: "Interactive macroeconomic simulator modeling capital velocity, dynamic AP2 rates, and Zurich vault gold allocations."
                    },
                    {
                      name: "kraken_ledgers",
                      path: "kraken_ledgers",
                      status: "AUDITED",
                      desc: "Financial statement ingestion pipeline parsing audited stock/ETF positions to verify physical vault reserve backings."
                    },
                    {
                      name: "Legacy-Namespace-Registry",
                      path: "Legacy-Namespace-Registry",
                      status: "LIVE",
                      desc: "Dual-chain namespace register anchoring identity records to Stellar, XRPL, and Solana (Token-2022) ledgers."
                    }
                  ].map((proj, idx) => (
                    <div key={idx} className={`rounded-xl border p-4 space-y-2 ${subCardStyle}`}>
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-white leading-tight font-mono">{proj.name}</h4>
                          <span className="text-[9px] text-slate-500 font-mono">Location: {proj.path}</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold font-mono ${proj.status === "LIVE" || proj.status === "ACTIVE" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-blue-500/10 border border-blue-500/20 text-blue-400"}`}>
                          {proj.status}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${textMuted}`}>{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="space-y-4">
              
              {/* Licensing Matrix */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Ecosystem Licensing & Security Matrix</h4>
                
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-white">unykorn-sovereign-core</span>
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 text-[9px] font-bold font-mono">PROPRIETARY</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Protects base execution state-machine, token evaluation vaults, and operator keys. All rights reserved.</p>
                  </div>
                  <hr className="border-white/5" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-white">legacy-vault-protocol</span>
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 text-[9px] font-bold font-mono">PROPRIETARY / AGPL-3.0</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Sovereign client portal and API proprietary. Local inheritance check logic, dead-man gates, and notary widgets enforced under AGPL-3.0.</p>
                  </div>
                  <hr className="border-white/5" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-white">flashrouter (Contracts)</span>
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 text-[9px] font-bold font-mono">AGPL-3.0 LICENSED</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Solidity smart contracts for multi-lender routing. Enforces copyleft for derivative settlement membranes.</p>
                  </div>
                  <hr className="border-white/5" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-white">flashrouter / flash-bot / adk</span>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[9px] font-bold font-mono">MIT LICENSE</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Permissive MIT licensing for TypeScript SDKs, Fastify REST APIs, Python agent modules, and arbitrage bot templates.</p>
                  </div>
                </div>
              </div>

              {/* Protective Measures */}
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Sovereign Protection Measures</h4>
                <div className="space-y-2.5 text-[10px] font-medium leading-relaxed">
                  <p className="text-slate-350">🛡️ <strong className="text-white">Anti-Tamper Proofs:</strong> Bilinear curve group commitments verified on Besu and Stellar ledgers.</p>
                  <p className="text-slate-350">🧬 <strong className="text-white">ZK Wills Succession:</strong> SnarkJS client-side PLONK proofs mapping to Georgia RUFADAA succession rules.</p>
                  <p className="text-slate-350">🔌 <strong className="text-white">Dynamic Fraud Guard:</strong> Active monitor/redirection of domain spoofers via the sentiment shield.</p>
                  <p className="text-slate-350">🏛️ <strong className="text-white">Peachtree Nexus:</strong> Physical office gateway anchor (Peachtree Parkway, Norcross) with SEC MIC exch:UBEC compliance mappings.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 7. EXTENSIONS & APPS TAB */}
        {activeTab === "apps" && (
          <div className="w-full grid md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-2 space-y-6">
              
              <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${textTitle}`}>
                  <Layers className="h-5 w-5 text-amber-500" />
                  UnyKorn Extensions & Application Store
                </h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Explore and download native UnyKorn extensions and FTH Pay integration hooks to connect your apps to the sovereign network.</p>

                <div className="space-y-4">
                  {ecosystemApps.map((app) => (
                    <div 
                      key={app.id}
                      className={`rounded-2xl border p-5 flex flex-col gap-4 hover:border-amber-500/20 transition-all ${subCardStyle}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-3.5 items-start">
                          <div className={`h-12 w-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 ${isDark ? "bg-slate-800 border-white/5" : "bg-white border-slate-200"}`}>
                            {app.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-bold text-sm ${textTitle}`}>{app.name}</h4>
                              <span className={`border px-1.5 py-0.5 rounded text-[9px] font-mono ${isDark ? "bg-white/5 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
                                {app.version}
                              </span>
                            </div>
                            <p className={`text-xs mt-1 leading-relaxed max-w-lg ${textMuted}`}>
                              {app.description}
                            </p>
                          </div>
                        </div>

                        <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
                          {app.id === "wallet" && (
                            walletExtensionStatus === "not_installed" ? (
                              <button
                                onClick={simulateExtensionInstall}
                                className="w-full sm:w-auto rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Install Extension
                              </button>
                            ) : walletExtensionStatus === "downloading" ? (
                              <span className="w-full sm:w-auto text-center rounded-xl bg-slate-800 border border-white/5 text-slate-400 px-4 py-2 text-xs font-mono flex items-center justify-center gap-1.5">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Downloading...
                              </span>
                            ) : (
                              <span className="w-full sm:w-auto text-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 text-xs font-bold flex items-center justify-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Active
                              </span>
                            )
                          )}

                          {app.id !== "wallet" && (
                            <span className={`w-full sm:w-auto text-center rounded-xl border px-4 py-2 text-xs font-mono ${isDark ? "bg-slate-850 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
                              {app.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Interactive Section for FTH Pay */}
                      {app.id === "fthpay" && (
                        <div className={`mt-2 pt-4 border-t ${isDark ? "border-white/5" : "border-slate-200"} space-y-3`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">Stripe & Stablecoin Edge Router logs</span>
                            <button
                              onClick={() => setEdgeLogsActive(!edgeLogsActive)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${edgeLogsActive ? "bg-amber-500 text-slate-950" : isDark ? "bg-slate-800 text-slate-300 hover:text-white" : "bg-slate-200 text-slate-700 hover:text-slate-900"}`}
                            >
                              {edgeLogsActive ? "Pause Edge Logs" : "Listen to Edge Logs"}
                            </button>
                          </div>
                          <div className={`rounded-xl p-3.5 border font-mono text-[10px] h-32 overflow-y-auto space-y-1.5 ${terminalBg}`}>
                            {edgeLogs.map((log, idx) => (
                              <div key={idx} className={log.includes("200 OK") ? "text-emerald-400" : "text-slate-300"}>{log}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Section for ACP Open Source Module */}
                      {app.id === "acp" && (
                        <div className={`mt-2 pt-4 border-t ${isDark ? "border-white/5" : "border-slate-200"} space-y-2 text-xs`}>
                          <p className={textMuted}>Local Workspace Source Directory Links:</p>
                          <div className="flex flex-wrap gap-2.5">
                            <Link
                              href="/solana-anchor"
                              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/40 hover:bg-slate-900 px-3 py-1.5 font-mono text-[11px] transition-all hover:text-amber-500"
                            >
                              <span>solana-anchor/</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                            <Link
                              href="/contracts"
                              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/40 hover:bg-slate-900 px-3 py-1.5 font-mono text-[11px] transition-all hover:text-amber-500"
                            >
                              <span>contracts/</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Interactive Section for ZKP Notary */}
                      {app.id === "notary" && (
                        <div className={`mt-2 pt-4 border-t ${isDark ? "border-white/5" : "border-slate-200"} space-y-3`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">PLONK inheritance proof generator</span>
                            <button
                              onClick={runZkVerification}
                              disabled={zkVerifying}
                              className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 text-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {zkVerifying ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  Generating Proof...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  Run ZK Verification
                                </>
                              )}
                            </button>
                          </div>
                          {zkLogs.length > 0 && (
                            <div className={`rounded-xl p-3.5 border font-mono text-[10px] h-32 overflow-y-auto space-y-1.5 ${terminalBg}`}>
                              {zkLogs.map((log, idx) => (
                                <div key={idx} className={log.includes("SUCCESS") ? "text-emerald-400 font-bold" : "text-slate-300"}>{log}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Section for Apostle Consensus Node */}
                      {app.id === "consensus" && (
                        <div className={`mt-2 pt-4 border-t ${isDark ? "border-white/5" : "border-slate-200"} space-y-3`}>
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-mono text-[11px] text-slate-300">Besu RPC: <span className="text-amber-500">rpc.unykorn.org</span></p>
                              <p className="font-mono text-[11px] text-slate-300">IP Address: <span className="text-amber-500">34.205.29.55</span></p>
                            </div>
                            <button
                              onClick={queryRpcNode}
                              disabled={rpcLoading}
                              className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {rpcLoading ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "Ping Node RPC"
                              )}
                            </button>
                          </div>
                          <div className={`grid grid-cols-2 gap-4 p-3 rounded-xl border ${inputBg} text-xs font-mono`}>
                            <div>
                              <span className={textMuted}>Live Block:</span>
                              <span className="font-bold text-amber-500 ml-1.5">{rpcBlockNumber}</span>
                            </div>
                            <div>
                              <span className={textMuted}>Latency:</span>
                              <span className="font-bold text-emerald-500 ml-1.5">{rpcLatency}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="space-y-4">
              
              <div className={`rounded-2xl border p-5 shadow-xl backdrop-blur-md ${cardStyle}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Integration Credentials</h4>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className={textMuted}>Cloudflare API Status:</span>
                    <span className="text-emerald-500 flex items-center gap-1 font-bold">
                      <Check className="h-3.5 w-3.5" /> ACTIVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className={textMuted}>Stripe Webhooks:</span>
                    <span className="text-emerald-500 flex items-center gap-1 font-bold">
                      <Check className="h-3.5 w-3.5" /> ACTIVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className={textMuted}>Vertex AI Swarm:</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <Check className="h-3.5 w-3.5" /> ONLINE
                    </span>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl border p-4 space-y-3 ${subCardStyle}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Developer Manuals</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <a 
                    href="https://github.com/fthtrading/acp-module"
                    target="_blank"
                    className={`flex items-center justify-between rounded-xl border p-2.5 transition-all ${isDark ? "bg-slate-900/60 border-white/5 hover:bg-slate-900 text-slate-300 hover:text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-950"}`}
                  >
                    <span>ACP GitHub Repository</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                  <Link 
                    href="/docs-vault"
                    className={`flex items-center justify-between rounded-xl border p-2.5 transition-all ${isDark ? "bg-slate-900/60 border-white/5 hover:bg-slate-900 text-slate-300 hover:text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-950"}`}
                  >
                    <span>Legacy Vault Documentation</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Brave-style Statistics / Metrics Row */}
        <div className="w-full border-t border-white/5 mt-16 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className={`text-2xl font-black font-mono ${isDark ? "text-white" : "text-slate-900"}`}>
              {trackersBlocked.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Trackers Blocked</p>
          </div>
          <div>
            <p className={`text-2xl font-black font-mono ${isDark ? "text-white" : "text-slate-900"}`}>
              ${(rwaTokenized / 1e6).toFixed(2)}M
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">RWA Secured</p>
          </div>
          <div>
            <p className="text-2xl font-black text-amber-500 font-mono">510</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Active Namespaces</p>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-500 font-mono flex items-center justify-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              100%
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Ecosystem Status</p>
          </div>
        </div>

      </main>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Connect Web3 Wallet</h3>
            <p className="text-xs text-slate-400 mb-6">Select a connection path to verify your on-chain ownership, check balances, or execute transactions under the AP2 protocol.</p>

            <div className="space-y-3">
              {[
                { name: "Phantom (Solana)", type: "phantom", icon: "🟣" },
                { name: "MetaMask (Ethereum/Polygon)", type: "metamask", icon: "🦊" },
                { name: "Freighter (Stellar)", type: "freighter", icon: "⭐" },
              ].map((prov) => (
                <button
                  key={prov.type}
                  onClick={() => connectWallet(prov.type as WalletType)}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/5 p-3.5 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{prov.icon}</span>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white">{prov.name}</span>
                  </div>
                  {wallets[prov.type as WalletType].connected ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                      <Check className="h-4 w-4" /> Connected
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">Connect →</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 mt-auto text-center text-xs text-slate-650">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 UnyKorn.ai · Sovereign Web3 Neo Bank Explorer</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-400">Home</Link>
            <Link href="/namespaces" className="hover:text-slate-400">Registry</Link>
            <Link href="/namespaces/cockpit" className="hover:text-slate-400">Cockpit</Link>
            <Link href="/namespaces/demo" className="hover:text-slate-400">Playbook</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
