"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, MessageSquare, Shield, Lock, Key, FileText, Wallet, Users, Globe,
  CheckCircle, Clock, AlertTriangle, ChevronRight, Eye, Download, Send,
  RefreshCw, Layers, Cpu, Database, Award, ExternalLink, Info, Terminal, X,
  Coins, Sparkles, Building, Briefcase, Plus, Minus, ArrowRight, Activity, ArrowUpRight
} from "lucide-react";

// ── Types & Interfaces ────────────────────────────────────────────────────────

type Path = "/" | "/roots" | "/mint" | "/name" | "/vaults" | "/pricing" | "/chains";
type AgentId = "namespace" | "vault" | "chain" | "support" | "compliance" | "wallet";
type SuffixFamily = "reserve" | "professional" | "monetary" | "house";

interface Message {
  sender: "user" | "agent";
  text: string;
  time: string;
}

interface SuffixRoot {
  suffix: string;
  class: string;
  family: SuffixFamily;
  utility: string;
  restricted: boolean;
  costTROP: number;
  costUSD: number;
  supportedChains: string[];
}

interface Namespace {
  name: string;
  root: string;
  chain: string;
  rarity: "Standard" | "Rare" | "Mythic" | "Genesis";
  vaultEnabled: boolean;
  smartWalletEnabled: boolean;
  status: "ACTIVE" | "LOCKED" | "REVIEW_PENDING";
  owner: string;
  created: string;
  ipfsCID: string;
  solanaTx: string;
  stellarTx: string;
  xrplTx: string;
  vaultAddress: string;
  vaultBalances: { token: string; balance: string; valUSD: string; color: string }[];
  subnames: string[];
  solanaMirror: string;
  xrplMirror: string;
  policy: {
    deathCert: boolean;
    executorQuorum: number;
    executorTotal: number;
    attorneySig: boolean;
    guardianQuorum: number;
    guardianTotal: number;
    cooldownDays: number;
  };
}

// ── Constant Mock Data ────────────────────────────────────────────────────────

const SUFFIX_DETAILS: SuffixRoot[] = [
  { suffix: ".gold", class: "Prestige Commodity", family: "reserve", utility: "Reserve collateral, treasury vaulting, precious asset backing.", restricted: false, costTROP: 500, costUSD: 500, supportedChains: ["Ethereum", "Polygon", "Base"] },
  { suffix: ".silver", class: "Commodity Asset", family: "reserve", utility: "Tier-2 treasury backing, tokenized industrial metals.", restricted: false, costTROP: 250, costUSD: 250, supportedChains: ["Polygon", "Base"] },
  { suffix: ".copper", class: "Commodity Asset", family: "reserve", utility: "Commercial supply chain records, volume-based backing.", restricted: false, costTROP: 100, costUSD: 100, supportedChains: ["Polygon", "Base"] },
  { suffix: ".med", class: "Gated Professional", family: "professional", utility: "Verified physician identification, HIPAA compliant records.", restricted: true, costTROP: 1000, costUSD: 1000, supportedChains: ["Polygon", "Ethereum"] },
  { suffix: ".bank", class: "Gated Financial", family: "professional", utility: "Restricted banking routing, high-trust settlement hubs.", restricted: true, costTROP: 2500, costUSD: 2500, supportedChains: ["Ethereum"] },
  { suffix: ".doc", class: "Gated Professional", family: "professional", utility: "Clinical practitioner identities, credential vaults.", restricted: true, costTROP: 800, costUSD: 800, supportedChains: ["Polygon", "Base"] },
  { suffix: ".$$$", class: "Premium Commerce", family: "monetary", utility: "High-tier merchant processing, loyalty program roots.", restricted: false, costTROP: 1500, costUSD: 1500, supportedChains: ["Ethereum", "Polygon"] },
  { suffix: ".neo", class: "Digital Commerce", family: "monetary", utility: "Next-gen retail points, web3 merchant storefronts.", restricted: false, costTROP: 300, costUSD: 300, supportedChains: ["Polygon", "Base"] },
  { suffix: ".troptions", class: "Sovereign Suffix", family: "house", utility: "Canonical ecosystem governance, TROPTIONS reward farming.", restricted: false, costTROP: 200, costUSD: 200, supportedChains: ["Ethereum", "Polygon", "Base", "Solana", "XRPL"] },
  { suffix: ".legacy", class: "Succession Suffix", family: "house", utility: "Decentralized trust assets, 5-condition estate policies.", restricted: false, costTROP: 100, costUSD: 100, supportedChains: ["Ethereum", "Polygon", "Base", "Solana", "XRPL"] }
];

const MOCK_AGENTS = {
  namespace: {
    name: "Namespace Agent",
    avatar: "👑",
    role: "Search & Valuation",
    desc: "Checks availability, character length, and rarity tiers.",
    greeting: "Hello, I am the Namespace Agent. Type a name or select a prompt to check availability, suffix rules, and rarity tiers.",
    prompts: ["One root, every chain", "Find reserve-grade names", "Compare rarity tiers", "Search satoshi.gold"]
  },
  vault: {
    name: "Vault Builder",
    avatar: "🏦",
    role: "ERC-6551 TBA Configurator",
    desc: "Configures Token-Bound Accounts (TBA), estate holdings, and token storage.",
    greeting: "Vault interface active. Every namespace can anchor an ERC-6551 wallet to hold tokens, NFTs, or deeds natively. Let's design your storage.",
    prompts: ["Mint with vault", "Create a role-bound namespace", "How does ERC-6551 work?", "Check vault balances"]
  },
  chain: {
    name: "Chain Agent",
    avatar: "⛓️",
    role: "Routing & Cost Advisor",
    desc: "Advises on Polygon vs Ethereum vs Base suitability, gas costs, and mirrors.",
    greeting: "Greetings. I can help you compare transaction fees, target audiences, and deployment costs across chains. Where would you like to mint?",
    prompts: ["Polygon vs Ethereum gas", "Solana & XRPL mirror rules", "What is Base suitability?", "Best chain for consumer scaling"]
  },
  support: {
    name: "Support Agent",
    avatar: "💡",
    role: "Registry Helpdesk",
    desc: "Helps with metadata manifests, public proofs, and general system guidance.",
    greeting: "Support center active. Ask me about public proof pages, metadata manifests, or general help on managing active SFTs.",
    prompts: ["View public proof pages", "How is metadata secured?", "How to resolve routing?", "System documentation"]
  },
  wallet: {
    name: "Smart Wallet Agent",
    avatar: "🔌",
    role: "Smart-Account Integrator",
    desc: "Sets up account abstraction (ERC-4337), sponsored gas, and recovery methods.",
    greeting: "Smart Wallet module initialized. I can guide you through gas sponsorship setup, transaction batching, and multi-sig guardian assignments.",
    prompts: ["What is ERC-4337?", "Setup gasless transactions", "Configure guardian recovery", "Batch transaction steps"]
  },
  compliance: {
    name: "Compliance Agent",
    avatar: "⚖️",
    role: "Credential Gater",
    desc: "Verifies medical, legal, or institutional credentials for gated roots.",
    greeting: "Compliance node ready. Suffixes like .med and .bank require verified credentials. Let's check practitioner status.",
    prompts: ["Gated roots eligibility", "Verify medical license", "Attach soulbound compliance proof", "HIPAA custody rules"]
  }
};

const CHAIN_MATRIX = [
  { name: "Polygon", type: "EVM", cost: "Low (~$0.05)", vaults: "Full ERC-6551", smartWallets: "Full ERC-4337", speed: "Fast", notes: "Default recommended for scalability." },
  { name: "Ethereum", type: "EVM", cost: "High (~$15.00)", vaults: "Full ERC-6551", smartWallets: "Full ERC-4337", speed: "Medium", notes: "Best for high-value flagship assets." },
  { name: "Base", type: "EVM", cost: "Low (~$0.02)", vaults: "Full ERC-6551", smartWallets: "Full ERC-4337", speed: "Instant", notes: "Optimal for consumer onboarding." },
  { name: "Solana", type: "Non-EVM", cost: "Low (~$0.001)", vaults: "Mirror Address", smartWallets: "Solana Account", speed: "Instant", notes: "Linked identity resolver / parallel mint." },
  { name: "XRPL", type: "Non-EVM", cost: "Low (~$0.002)", vaults: "Mirror Address", smartWallets: "Ripple Wallet", speed: "Instant", notes: "Settlement ledger references." }
];

export default function RebuiltRegistryConsole() {
  // ── Simulated Navigation Router ─────────────────────────────────────────────
  const [currentPath, setCurrentPath] = useState<Path>("/");
  const [selectedRootSlug, setSelectedRootSlug] = useState<string>(".gold");
  const [selectedNamespaceName, setSelectedNamespaceName] = useState<string>("wealth.troptions");
  
  // ── UI Control States ───────────────────────────────────────────────────────
  const [activeAgent, setActiveAgent] = useState<AgentId>("namespace");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"overview" | "vault" | "policies" | "subnames" | "proofs" | "chain-links">("overview");
  const [activeRootFamilyTab, setActiveRootFamilyTab] = useState<SuffixFamily>("reserve");
  
  // Conversational states
  const [chatInput, setChatInput] = useState("Suggest five premium .gold alternatives and show the best chain for minting with vaults enabled.");
  const [isChatActive, setIsChatActive] = useState(false);
  const [agentChats, setAgentChats] = useState<Record<AgentId, Message[]>>({
    namespace: [{ sender: "agent", text: MOCK_AGENTS.namespace.greeting, time: "15:00" }],
    vault: [{ sender: "agent", text: MOCK_AGENTS.vault.greeting, time: "15:01" }],
    chain: [{ sender: "agent", text: MOCK_AGENTS.chain.greeting, time: "15:02" }],
    support: [{ sender: "agent", text: MOCK_AGENTS.support.greeting, time: "15:03" }],
    wallet: [{ sender: "agent", text: MOCK_AGENTS.wallet.greeting, time: "15:04" }],
    compliance: [{ sender: "agent", text: MOCK_AGENTS.compliance.greeting, time: "15:05" }]
  });

  // Search details state
  const [searchResult, setSearchResult] = useState<{
    name: string;
    root: string;
    available: boolean;
    rarity: "Standard" | "Rare" | "Mythic" | "Genesis";
    rarityColor: string;
    priceTROP: number;
    priceUSD: number;
    description: string;
    vaultEligible: boolean;
    smartWalletEligible: boolean;
    chainRecommend: string;
    utility: string;
  } | null>(null);

  // Guided Minting Stepper State
  const [mintStep, setMintStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [mintForm, setMintForm] = useState({
    name: "satoshi",
    suffix: ".gold",
    chain: "Polygon",
    rarity: "Premium" as "Standard" | "Rare" | "Mythic" | "Genesis",
    vaultEnabled: true,
    smartWalletEnabled: true,
    guardianAddress: "",
    attorneyAttest: false
  });
  
  // Mint execution console logs
  const [mintLogs, setMintLogs] = useState<string[]>([]);
  const [mintProgress, setMintProgress] = useState(0);
  const [isMinting, setIsMinting] = useState(false);

  // Active Namespaces Registry State
  const [namespacesList, setNamespacesList] = useState<Namespace[]>([
    {
      name: "estate.legacy",
      root: ".legacy",
      chain: "Polygon",
      rarity: "Standard",
      vaultEnabled: true,
      smartWalletEnabled: true,
      status: "ACTIVE",
      owner: "Kevan Smith",
      created: "2024-03-15",
      ipfsCID: "bafkreiftonagbd5v46vtwthbqnn4gwqnijojnrqzp3nhn7v4t47amsltf4",
      solanaTx: "SOLANA_TX_A49AAA1B44FE193BDC8C2B4A9B56",
      stellarTx: "12750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809",
      xrplTx: "92611FFE685BEE59FF994BBD216367F597C8C547A878741F40304C8BF3369F78",
      vaultAddress: "0x655188aF88d0F9288eE728ded8C9c44cdc357112",
      vaultBalances: [
        { token: "TROP", balance: "1,200.00", valUSD: "$1,200.00", color: "text-amber-405" },
        { token: "USDC", balance: "500.00", valUSD: "$500.00", color: "text-blue-400" },
        { token: "ETH", balance: "0.15", valUSD: "$430.50", color: "text-purple-400" }
      ],
      subnames: ["vault.estate.legacy", "trustee.estate.legacy"],
      solanaMirror: "7xKXtg2CW87d97TXJSDpbD5jBkheT1aF289GMA1b8e",
      xrplMirror: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
      policy: {
        deathCert: true,
        executorQuorum: 2,
        executorTotal: 2,
        attorneySig: true,
        guardianQuorum: 2,
        guardianTotal: 3,
        cooldownDays: 30
      }
    },
    {
      name: "wealth.troptions",
      root: ".troptions",
      chain: "Ethereum",
      rarity: "Rare",
      vaultEnabled: true,
      smartWalletEnabled: true,
      status: "ACTIVE",
      owner: "Kevan Smith",
      created: "2024-05-10",
      ipfsCID: "bafkreiad5vtqhgh6om2yx6io5bxkmjrgkzwbqjf2oswgsuyfzfsawevlfy",
      solanaTx: "SOLANA_TX_631C49F740A738FD674967AB3631",
      stellarTx: "a168ac2201300f2f7da9d4a10b0e7799785b5bf5e35993f7a4c65970edf87778",
      xrplTx: "CBFC157422B4325FECB6705C4A5A740F775C738C2DE7A6F4AE3E3D5249FDABD0",
      vaultAddress: "0x6551bFc2DE7A6F4AE3E3D5249FDABD0775C738C2",
      vaultBalances: [
        { token: "TROP", balance: "14,500.00", valUSD: "$14,500.00", color: "text-amber-405" },
        { token: "USDC", balance: "2,500.00", valUSD: "$2,500.00", color: "text-blue-400" },
        { token: "ETH", balance: "2.40", valUSD: "$6,850.12", color: "text-purple-400" },
        { token: "XLM", balance: "1,200.00", valUSD: "$144.00", color: "text-indigo-400" }
      ],
      subnames: ["payout.wealth.troptions", "invest.wealth.troptions"],
      solanaMirror: "8BKxtW7PxZJpbD5jBkheT1aF289GMA1b8eA49AAA1b",
      xrplMirror: "r92611FFE685BEE59FF994BBD216367F597C8",
      policy: {
        deathCert: true,
        executorQuorum: 1,
        executorTotal: 2,
        attorneySig: false,
        guardianQuorum: 2,
        guardianTotal: 2,
        cooldownDays: 14
      }
    }
  ]);

  // Post-mint workspace interactions
  const [newSubnameInput, setNewSubnameInput] = useState("");
  const [vaultDepositForm, setVaultDepositForm] = useState({ token: "TROP", amount: "" });
  const [isDepositing, setIsDepositing] = useState(false);
  const [yieldClaimedStatus, setYieldClaimedStatus] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentChats, activeAgent]);

  // Find active namespace object
  const activeNS = namespacesList.find(n => n.name === selectedNamespaceName) || namespacesList[0];

  // ── Controller Handlers ─────────────────────────────────────────────────────

  // Dynamic Namespace Search Engine
  const runNamespaceQuery = (query: string) => {
    const clean = query.toLowerCase().trim();
    if (!clean) return;

    let suffix = ".gold";
    SUFFIX_DETAILS.forEach(s => {
      if (clean.endsWith(s.suffix)) {
        suffix = s.suffix;
      }
    });

    // Extract name label
    let label = clean;
    if (clean.includes(".")) {
      label = clean.split(".")[0];
    } else {
      query = clean + suffix;
    }

    const len = label.length;
    let rarity: "Standard" | "Rare" | "Mythic" | "Genesis" = "Standard";
    let color = "text-cyan-400 border-cyan-500/25 bg-cyan-500/10";
    let desc = "Standard tier namespace. Perfect for personal estates.";

    if (len <= 3) {
      rarity = "Mythic";
      color = "text-red-400 border-red-500/25 bg-red-500/10";
      desc = "Mythic Sovereign class. Extremely short and highly prestigious.";
    } else if (len === 4) {
      rarity = "Rare";
      color = "text-purple-400 border-purple-500/25 bg-purple-500/10";
      desc = "Rare Sovereign class. Premium 4-character identifier.";
    }

    // Determine default recommendation based on name length/cost
    let recChain = "Polygon";
    if (len <= 3) recChain = "Ethereum";
    else if (clean.includes("app") || clean.includes("play")) recChain = "Base";

    const matchedRoot = SUFFIX_DETAILS.find(s => s.suffix === suffix) || SUFFIX_DETAILS[0];

    const result = {
      name: query,
      root: suffix,
      available: !clean.includes("taken") && !clean.includes("reserve.gold") && !clean.includes("clinic.med"),
      rarity,
      rarityColor: color,
      priceTROP: len <= 3 ? 1200 : len === 4 ? 600 : matchedRoot.costTROP,
      priceUSD: len <= 3 ? 1200 : len === 4 ? 600 : matchedRoot.costUSD,
      description: desc,
      vaultEligible: true,
      smartWalletEligible: true,
      chainRecommend: recChain,
      utility: matchedRoot.utility
    };

    setSearchResult(result);
    setMintForm(prev => ({
      ...prev,
      name: label,
      suffix,
      chain: recChain,
      rarity
    }));
  };

  // Submit Chat compositor input
  const submitAgentChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput("");
    setIsChatActive(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentChats(prev => ({
      ...prev,
      [activeAgent]: [...prev[activeAgent], { sender: "user", text: userText, time: now }]
    }));

    const lowText = userText.toLowerCase();

    // Trigger AI Agent Reply with simulated context updates
    setTimeout(() => {
      let responseText = "";

      if (lowText.includes("search") || lowText.includes(".gold") || lowText.includes(".med") || lowText.includes(".bank") || lowText.includes(".troptions") || lowText.includes(".legacy") || lowText.includes("satoshi")) {
        let keyword = userText.replace(/search/gi, "").trim();
        // Extract word that looks like domain
        const words = keyword.split(" ");
        const domainWord = words.find(w => w.includes(".") || w.length > 3) || "satoshi.gold";
        runNamespaceQuery(domainWord);
        
        responseText = `Checking availability matrix for "${domainWord}". Evaluating length, rarity class, and active root suffixes. I've populated the search results box. It qualifies as a ${domainWord.split(".")[0].length <= 3 ? "Mythic" : "Standard"} tier.`;
      } else if (lowText.includes("mint") || lowText.includes("buy") || lowText.includes("purchase")) {
        responseText = "Initializing the guided Mint stepper. Let's choose a root, select your target chain, and deploy the Token-Bound Account.";
        setMintStep(1);
        setCurrentPath("/mint");
      } else if (lowText.includes("vault") || lowText.includes("erc-6551") || lowText.includes("balance") || lowText.includes("tokens")) {
        responseText = `Showing active vault ledger details for ${activeNS.name}. You can review your ERC-6551 contract balances, yield yields, or submit mock deposits.`;
        setActiveWorkspaceTab("vault");
        setCurrentPath("/name");
      } else if (lowText.includes("policy") || lowText.includes("rules") || lowText.includes("gate") || lowText.includes("quorum")) {
        responseText = `Loading trust release gates for ${activeNS.name}. You can edit death certificates, attorney sign-offs, and executor cooldown periods.`;
        setActiveWorkspaceTab("policies");
        setCurrentPath("/name");
      } else if (lowText.includes("subname") || lowText.includes("sub-identity")) {
        responseText = `Accessing subname records for ${activeNS.name}. Here you can register child domains and configure custom sub-resolution routing.`;
        setActiveWorkspaceTab("subnames");
        setCurrentPath("/name");
      } else if (lowText.includes("chain") || lowText.includes("polygon") || lowText.includes("ethereum") || lowText.includes("solana") || lowText.includes("xrpl")) {
        responseText = "Opening the Chains Matrix dashboard. Here you can review fees, speeds, and mirror resolutions (EVM vs Solana/XRPL parallel anchors).";
        setCurrentPath("/chains");
      } else {
        // Agent Persona Custom responses
        switch (activeAgent) {
          case "namespace":
            responseText = "I can guide your namespace discovery. Ask me to search names (e.g., 'search satoshi.gold') or check premium suffix guidelines.";
            break;
          case "chain":
            responseText = "EVM chains like Polygon and Base allow fully executable vaults. I recommend Polygon for scale, Ethereum for prestige registries, and Solana/XRPL for mirror resolutions.";
            break;
          case "vault":
            responseText = "As the Vault Builder, I focus on ERC-6551 token-bound wallets. They behave like normal on-chain accounts but are owned by the namespace token itself.";
            break;
          case "support":
            responseText = "Support desk initialized. I can guide you through manifest verification, IPFS uploads, and audit records.";
            break;
          case "wallet":
            responseText = "Smart accounts utilize ERC-4337 to sponsor gas fees, batch actions, and add multi-sig guardians. Would you like me to explain gas sponsorship rules?";
            break;
          case "compliance":
            responseText = "Compliance verification is mandatory for gated namespaces like .med (requires NPI medical certificate) and .bank (financial registration).";
            break;
        }
      }

      setAgentChats(prev => ({
        ...prev,
        [activeAgent]: [...prev[activeAgent], { sender: "agent", text: responseText, time: now }]
      }));
    }, 1000);
  };

  // Conversational suggestion cards
  const handlePromptCardClick = (prompt: string) => {
    setChatInput(prompt);
    setIsChatActive(true);
    
    // Auto-trigger submit behavior
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentChats(prev => ({
      ...prev,
      [activeAgent]: [...prev[activeAgent], { sender: "user", text: prompt, time: now }]
    }));

    setTimeout(() => {
      let response = "";
      if (prompt.includes("Search satoshi.gold")) {
        runNamespaceQuery("satoshi.gold");
        response = "Check results complete. 'satoshi.gold' is available! It's a Rare Sovereign. You can mint on Polygon or Ethereum now.";
        setCurrentPath("/");
      } else if (prompt.includes("One root, every chain") || prompt.includes("Polygon vs Ethereum")) {
        setCurrentPath("/chains");
        response = "Loaded the Chains matrix. Note that EVM chains support full ERC-6551 vaults, while Solana/XRPL serve as mirrors.";
      } else if (prompt.includes("Mint with vault") || prompt.includes("Create a role-bound")) {
        setMintStep(1);
        setCurrentPath("/mint");
        response = "Guided Minting wizard loaded on the workspace. Choose a name to begin your setup.";
      } else if (prompt.includes("Build subnames") || prompt.includes("Build a verified hierarchy")) {
        setActiveWorkspaceTab("subnames");
        setCurrentPath("/name");
        response = "Opened Subnames panel. You can generate sub-records for your active namespaces now.";
      } else if (prompt.includes("Check vault balances")) {
        setActiveWorkspaceTab("vault");
        setCurrentPath("/name");
        response = "Opened Vault manager. Review token balances and yield yields.";
      } else {
        response = `Registry status: loaded workspace matching query: "${prompt}". Let me know how you'd like to configure settings.`;
      }

      setAgentChats(prev => ({
        ...prev,
        [activeAgent]: [...prev[activeAgent], { sender: "agent", text: response, time: now }]
      }));
    }, 1000);
  };

  // Guided Minting Steps handler
  const handleMintAction = async () => {
    if (isMinting) return;
    setIsMinting(true);
    setMintLogs([]);
    setMintProgress(0);

    const logs = [
      "⚡ Constructing Troptions multi-chain namespace contract payload...",
      "🔍 Resolving availability for target name: " + mintForm.name + mintForm.suffix,
      "🛡️ Creating Soulbound Registry metadata manifest...",
      "📤 Uploading manifest to IPFS gateway...",
      "✓ Manifest upload complete. CID: bafkreiftonagbd5v46vtwthbqnn4gwqnijojnrqzp3nhn7v4t47amsltf4",
      `⛓️ Connecting to execution chain: ${mintForm.chain}...`,
      "✍️ Signing transaction with Unykorn Registry Key...",
      `⚙️ Deploying ERC-6551 Token-Bound Account on ${mintForm.chain}...`,
      `⚙️ Initializing ERC-4337 smart-account policies with ${mintForm.vaultEnabled ? 'Vault' : 'Registry'} controls...`,
      "✓ Execution Chain anchor transaction finalized!",
      "🔗 Connecting to parallel identity chains...",
      "📡 Anchoring reference hash on Stellar Ledger (Memo-Hash)...",
      "✓ Stellar Signature anchored: 12750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809",
      "📡 Anchoring reference pointer on XRPL Consensus (AccountSet)...",
      "✓ XRPL Signature anchored: 92611FFE685BEE59FF994BBD216367F597C8C547A878741F40304C8BF3369F78",
      "📡 Provisioning mirror resolution account on Solana (Token-2022)...",
      "✓ Solana Signature anchored: SOLANA_TX_A49AAA1B44FE193BDC8C2B4A9B56",
      "🎉 Mint sequence finished successfully!"
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          setMintLogs(prev => [...prev, logs[i]]);
          setMintProgress(Math.round(((i + 1) / logs.length) * 100));
          resolve();
        }, 300);
      });
    }

    // Create the new Namespace object and append to list
    const newName = mintForm.name + mintForm.suffix;
    const newNsObj: Namespace = {
      name: newName,
      root: mintForm.suffix,
      chain: mintForm.chain,
      rarity: newName.split(".")[0].length <= 3 ? "Mythic" : newName.split(".")[0].length === 4 ? "Rare" : "Standard",
      vaultEnabled: mintForm.vaultEnabled,
      smartWalletEnabled: mintForm.smartWalletEnabled,
      status: "ACTIVE",
      owner: "Kevan Smith",
      created: new Date().toISOString().split("T")[0],
      ipfsCID: "bafkreiftonagbd5v46vtwthbqnn4gwqnijojnrqzp3nhn7v4t47amsltf4",
      solanaTx: "SOLANA_TX_A49AAA1B44FE193BDC8C2B4A9B56",
      stellarTx: "12750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809",
      xrplTx: "92611FFE685BEE59FF994BBD216367F597C8C547A878741F40304C8BF3369F78",
      vaultAddress: mintForm.chain === "Ethereum" ? "0x6551a37Fd26A668FAF72338FC2E7a6F4aE3E3D52" : "0x6551bFc2DE7A6F4AE3E3D5249FDABD0775C738C2",
      vaultBalances: [
        { token: "TROP", balance: "200.00", valUSD: "$200.00", color: "text-amber-45" },
        { token: "USDC", balance: "0.00", valUSD: "$0.00", color: "text-blue-400" }
      ],
      subnames: ["vault." + newName],
      solanaMirror: "7xKXtg2CW87d97TXJSDpbD5jBkheT1aF289GMA1b8e",
      xrplMirror: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
      policy: {
        deathCert: true,
        executorQuorum: 1,
        executorTotal: 1,
        attorneySig: mintForm.attorneyAttest,
        guardianQuorum: 2,
        guardianTotal: 3,
        cooldownDays: 30
      }
    };

    setNamespacesList(prev => [newNsObj, ...prev]);
    setSelectedNamespaceName(newName);
    setIsMinting(false);
    
    // Advance step
    setMintStep(5);

    // Notify user in active chats
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentChats(prev => ({
      ...prev,
      namespace: [...prev.namespace, {
        sender: "agent",
        text: `Namespace "${newName}" has been minted on ${mintForm.chain}. Your token-bound account (ERC-6551) is active. Let's explore its operating workspace.`,
        time: timeNow
      }]
    }));
  };

  // Mock deposit into vault
  const handleVaultDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(vaultDepositForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsDepositing(true);
    setTimeout(() => {
      setNamespacesList(prev => prev.map(ns => {
        if (ns.name === selectedNamespaceName) {
          const updatedBalances = ns.vaultBalances.map(bal => {
            if (bal.token === vaultDepositForm.token) {
              const currentVal = parseFloat(bal.balance.replace(/,/g, ""));
              const newVal = currentVal + amountNum;
              const formattedVal = newVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              
              let usdPrice = 1.0;
              if (bal.token === "ETH") usdPrice = 2850.0;
              if (bal.token === "XLM") usdPrice = 0.12;
              
              const newValUSD = (newVal * usdPrice).toLocaleString(undefined, { style: "currency", currency: "USD" });
              return { ...bal, balance: formattedVal, valUSD: newValUSD };
            }
            return bal;
          });

          // If token wasn't in balances list, add it
          const tokenExists = ns.vaultBalances.some(b => b.token === vaultDepositForm.token);
          if (!tokenExists) {
            let usdPrice = 1.0;
            if (vaultDepositForm.token === "ETH") usdPrice = 2850.0;
            if (vaultDepositForm.token === "XLM") usdPrice = 0.12;
            const formattedVal = amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const valUSD = (amountNum * usdPrice).toLocaleString(undefined, { style: "currency", currency: "USD" });
            updatedBalances.push({
              token: vaultDepositForm.token,
              balance: formattedVal,
              valUSD,
              color: vaultDepositForm.token === "ETH" ? "text-purple-400" : vaultDepositForm.token === "XLM" ? "text-indigo-400" : "text-amber-45"
            });
          }

          return { ...ns, vaultBalances: updatedBalances };
        }
        return ns;
      }));

      setIsDepositing(false);
      setVaultDepositForm(prev => ({ ...prev, amount: "" }));
      
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAgentChats(prev => ({
        ...prev,
        vault: [...prev.vault, {
          sender: "agent",
          text: `Confirmed deposit of ${amountNum} ${vaultDepositForm.token} into vault smart wallet for ${selectedNamespaceName}. Balances have been re-indexed.`,
          time: now
        }]
      }));
    }, 1000);
  };

  // Mock subname creation
  const handleCreateSubname = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSub = newSubnameInput.toLowerCase().trim();
    if (!cleanSub) return;

    const fullSubname = cleanSub.includes(".") ? cleanSub : `${cleanSub}.${selectedNamespaceName}`;
    
    setNamespacesList(prev => prev.map(ns => {
      if (ns.name === selectedNamespaceName) {
        if (ns.subnames.includes(fullSubname)) return ns;
        return { ...ns, subnames: [...ns.subnames, fullSubname] };
      }
      return ns;
    }));

    setNewSubnameInput("");

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentChats(prev => ({
      ...prev,
      support: [...prev.support, {
        sender: "agent",
        text: `Subname Node "${fullSubname}" has been registered under root "${selectedNamespaceName}". Resolution routing points to the parent ERC-6551 vault.`,
        time: now
      }]
    }));
  };

  // Claim Yield
  const handleClaimYield = (nsName: string) => {
    setYieldClaimedStatus(prev => ({ ...prev, [nsName]: true }));
    
    // Add mock balance update
    setNamespacesList(prev => prev.map(ns => {
      if (ns.name === nsName) {
        const updated = ns.vaultBalances.map(bal => {
          if (bal.token === "TROP") {
            const currentVal = parseFloat(bal.balance.replace(/,/g, ""));
            const newVal = currentVal + 150.0;
            return {
              ...bal,
              balance: newVal.toLocaleString(undefined, { minimumFractionDigits: 2 }),
              valUSD: `$${newVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            };
          }
          return bal;
        });
        return { ...ns, vaultBalances: updated };
      }
      return ns;
    }));

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentChats(prev => ({
      ...prev,
      vault: [...prev.vault, {
        sender: "agent",
        text: `Yield claimed for ${nsName}. 150 TROP has been minted and added to your token-bound account. Transaction Hash: SOLANA_TX_MINT_YIELD_CONFIRMED_88291`,
        time: now
      }]
    }));
  };

  return (
    <div className="app">
      {/* Inline styles taken directly from HTML Mockup */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #0b0e12;
          --surface: #0f141a;
          --surface-2: #131920;
          --line: rgba(255,255,255,.08);
          --line-strong: rgba(255,255,255,.12);
          --text: #edf2f7;
          --muted: #9ca6b4;
          --faint: #67707d;
          --gold: #c4a05f;
          --gold-soft: rgba(196,160,95,.12);
          --mint: #86c7b3;
          --radius: 18px;
        }
        .app {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 280px 1fr;
          background:
            radial-gradient(circle at 20% 10%, rgba(196,160,95,.10), transparent 24%),
            radial-gradient(circle at 80% 20%, rgba(134,199,179,.08), transparent 24%),
            linear-gradient(180deg, #0a0d11 0%, #0c1015 100%);
          color: var(--text);
          font-family: Inter, system-ui, sans-serif;
        }
        .sidebar {
          border-right: 1px solid var(--line);
          padding: 18px 14px;
          background: rgba(9,12,16,.92);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,.02);
          cursor: pointer;
        }
        .mark {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--gold), rgba(134,199,179,.45));
          color: #0c1014;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 14px;
          shrink: 0;
        }
        .brand strong { display: block; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #fff; }
        .brand span { display: block; font-size: 10px; color: var(--muted); letter-spacing: .14em; text-transform: uppercase; margin-top: 2px; }
        .side-section { margin-top: 18px; }
        .side-label {
          margin: 0 0 8px;
          padding: 0 8px;
          color: var(--faint);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .18em;
          font-weight: 700;
        }
        .side-btn {
          width: 100%;
          text-align: left;
          padding: 11px 12px;
          margin-bottom: 6px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .side-btn.active, .side-btn:hover {
          background: rgba(255,255,255,.04);
          border-color: var(--line);
          color: #fff;
        }
        .tiny {
          font-size: 10px;
          color: var(--text);
          border: 1px solid rgba(196,160,95,.25);
          background: var(--gold-soft);
          border-radius: 999px;
          padding: 2px 7px;
          font-weight: 700;
        }
        .tiny.mint {
          border-color: rgba(134,199,179,.25);
          background: rgba(134,199,179,.08);
          color: var(--mint);
        }
        .main {
          padding: 24px 32px;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
        }
        .top-nav, .top-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .pill {
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 16px;
          color: var(--muted);
          font-size: 12.5px;
          font-weight: 600;
          background: rgba(255,255,255,.02);
          cursor: pointer;
          transition: all 0.2s;
        }
        .pill.active, .pill:hover {
          color: var(--text);
          border-color: rgba(196,160,95,.22);
          background: rgba(196,160,95,.08);
        }
        .center {
          max-width: 860px;
          margin: 40px auto 0;
          width: 100%;
        }
        h1 {
          margin: 0 0 24px;
          text-align: center;
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -.04em;
          color: #fff;
        }
        .composer {
          border: 1px solid var(--line-strong);
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(18,23,30,.98), rgba(12,16,22,.98));
          padding: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,.35);
          margin-bottom: 30px;
        }
        textarea {
          width: 100%;
          min-height: 80px;
          resize: none;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text);
          font: inherit;
          font-size: 16px;
          line-height: 1.55;
        }
        .composer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .quick, .agents { display: flex; gap: 8px; flex-wrap: wrap; }
        .chip {
          border: 1px solid var(--line);
          background: rgba(255,255,255,.03);
          color: var(--muted);
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chip:hover, .chip.active {
          border-color: rgba(196,160,95,.3);
          background: rgba(196,160,95,.06);
          color: #fff;
        }
        .send {
          border: 1px solid rgba(196,160,95,.24);
          background: rgba(196,160,95,.12);
          color: var(--text);
          border-radius: 12px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .send:hover {
          background: rgba(196,160,95,.2);
          color: #fff;
        }
        h2 {
          margin: 32px 0 16px;
          font-size: 20px;
          text-align: center;
          font-weight: 700;
          letter-spacing: -.03em;
          color: #fff;
        }
        .prompt-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .prompt {
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(255,255,255,.02);
          padding: 18px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .prompt:hover {
          background: rgba(255,255,255,.04);
          border-color: var(--line-strong);
          transform: translateY(-2px);
        }
        .prompt .try {
          color: var(--gold);
          font-size: 10px;
          letter-spacing: .14em;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 700;
        }
        .prompt strong {
          display: block;
          font-size: 14px;
          margin-bottom: 6px;
          color: #fff;
        }
        .prompt p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }
        
        /* Interactive features layout style */
        .chat-area {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 8px;
          max-height: 50vh;
        }
        .chat-bubble {
          margin-bottom: 16px;
          max-width: 85%;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .chat-bubble.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }
        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--surface-2);
          border: 1px solid var(--line-strong);
          display: grid;
          place-items: center;
          font-size: 14px;
          shrink: 0;
        }
        .bubble-content {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 12px 16px;
          font-size: 13.5px;
          line-height: 1.55;
        }
        .chat-bubble.user .bubble-content {
          background: rgba(196,160,95,.08);
          border-color: rgba(196,160,95,.22);
        }
        .result-card {
          background: linear-gradient(135deg, var(--surface), var(--surface-2));
          border: 1px solid var(--line-strong);
          border-radius: var(--radius);
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,.2);
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-b: 1px solid var(--line);
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .result-header h4 {
          margin: 0;
          font-family: monospace;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
        }
        .row-spec {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .btn-mint {
          width: 100%;
          border: 1px solid var(--gold);
          background: var(--gold-soft);
          color: var(--text);
          border-radius: 12px;
          padding: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          margin-top: 16px;
          transition: all 0.2s;
        }
        .btn-mint:hover {
          background: rgba(196,160,95,.2);
          color: #fff;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 10px;
        }
        .panel-box {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 20px;
        }
        .form-input {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--line-strong);
          border-radius: 10px;
          padding: 10px;
          color: #fff;
          font-size: 13px;
          margin-bottom: 12px;
          outline: none;
        }
        .form-select {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--line-strong);
          border-radius: 10px;
          padding: 10px;
          color: #fff;
          font-size: 13px;
          margin-bottom: 12px;
          outline: none;
          cursor: pointer;
        }
        .sub-tab-bar {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 16px;
          overflow-x: auto;
        }
        .sub-tab-btn {
          background: transparent;
          border: 0;
          border-bottom: 2px solid transparent;
          color: var(--muted);
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .sub-tab-btn.active {
          color: var(--gold);
          border-color: var(--gold);
        }
        .terminal-screen {
          background: #05070a;
          border: 1px solid #1a2233;
          border-radius: 12px;
          padding: 14px;
          font-family: monospace;
          font-size: 11px;
          color: #8fa0ba;
          min-height: 200px;
          max-height: 250px;
          overflow-y: auto;
        }
      ` }} />

      {/* ── COLUMN 1: SIDEBAR ────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div>
          {/* Brand logo card */}
          <div className="brand" onClick={() => { setCurrentPath("/"); setIsChatActive(false); }}>
            <div className="mark">T</div>
            <div>
              <strong>Troptions Registry</strong>
              <span>Sovereign Build</span>
            </div>
          </div>

          <div className="side-section">
            <button 
              className={`side-btn ${currentPath === "/" && !isChatActive ? "active" : ""}`}
              onClick={() => {
                setCurrentPath("/");
                setIsChatActive(false);
                setSearchResult(null);
              }}
            >
              <span>New Chat</span>
              <span className="tiny">Live</span>
            </button>
            <button 
              className={`side-btn ${currentPath === "/" && isChatActive ? "active" : ""}`}
              onClick={() => {
                setCurrentPath("/");
                setIsChatActive(true);
              }}
            >
              <span>Search / Chat</span>
            </button>
          </div>

          <div className="side-section">
            <p className="side-label">Group by</p>
            <button 
              className={`side-btn ${currentPath === "/vaults" ? "active" : ""}`}
              onClick={() => setCurrentPath("/vaults")}
            >
              <span>Projects / Vaults</span>
            </button>
          </div>

          <div className="side-section">
            <p className="side-label">Roots</p>
            {SuffixRootsList()}
          </div>

          <div className="side-section">
            <p className="side-label">Active Namespaces</p>
            {ActiveNamespacesList()}
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="side-section border-t border-slate-900 pt-3 text-[10px] text-slate-500 font-mono">
          <p>Operator: 0x71C7...3fA2</p>
          <p className="text-amber-500/80">TROP: 12,450.00</p>
        </div>
      </aside>

      {/* ── COLUMN 2: MAIN CONTAINER ─────────────────────────────────────────── */}
      <main className="main">
        {/* Top Navbar */}
        <div className="top">
          <div className="top-nav">
            <span 
              className={`pill ${currentPath === "/" ? "active" : ""}`}
              onClick={() => { setCurrentPath("/"); setIsChatActive(false); }}
            >
              AI Namespace Search
            </span>
            <span 
              className={`pill ${currentPath === "/vaults" ? "active" : ""}`}
              onClick={() => setCurrentPath("/vaults")}
            >
              Vault Builder
            </span>
            <span 
              className={`pill ${currentPath === "/pricing" ? "active" : ""}`}
              onClick={() => setCurrentPath("/pricing")}
            >
              Pricing
            </span>
            <span 
              className={`pill ${currentPath === "/chains" ? "active" : ""}`}
              onClick={() => setCurrentPath("/chains")}
            >
              Chains Matrix
            </span>
          </div>
          <div className="top-actions">
            <span className="pill">Watchlist</span>
            <span className="pill">Log In</span>
            <span 
              className="pill active"
              onClick={() => { setMintStep(1); setCurrentPath("/mint"); }}
            >
              Get Started
            </span>
          </div>
        </div>

        {/* Central Workspace Content based on path */}
        <div className="flex-1 flex flex-col">
          {RenderPathContent()}
        </div>
      </main>

    </div>
  );

  // ── Helper Render Sub-functions ─────────────────────────────────────────────

  // Sidebar Suffix roots list
  function SuffixRootsList() {
    return (
      <>
        {[
          { suffix: ".gold", label: "Reserve" },
          { suffix: ".med", label: "Verified" },
          { suffix: ".bank", label: "Restricted" },
          { suffix: ".$$$", label: "Premium" },
        ].map(item => (
          <button
            key={item.suffix}
            onClick={() => {
              setSelectedRootSlug(item.suffix);
              setMintForm(prev => ({ ...prev, suffix: item.suffix }));
              runNamespaceQuery(`estate${item.suffix}`);
              setCurrentPath("/");
            }}
            className="side-btn"
          >
            <span>{item.suffix}</span>
            <span className="tiny">{item.label}</span>
          </button>
        ))}
      </>
    );
  }

  // Sidebar Active Namespaces SFTs list
  function ActiveNamespacesList() {
    return (
      <div className="space-y-1 mt-1">
        {namespacesList.map((ns) => (
          <button
            key={ns.name}
            onClick={() => {
              setSelectedNamespaceName(ns.name);
              setActiveWorkspaceTab("overview");
              setCurrentPath("/name");
            }}
            className={`side-btn ${selectedNamespaceName === ns.name && currentPath === "/name" ? "active" : ""}`}
          >
            <span>{ns.name}</span>
            <span className="tiny mint">{ns.chain}</span>
          </button>
        ))}
      </div>
    );
  }

  // Router dispatcher
  function RenderPathContent() {
    switch (currentPath) {
      case "/":
        return RenderHomeOrChatView();
      case "/mint":
        return RenderMintStepperView();
      case "/name":
        return RenderNamespaceWorkspaceView();
      case "/vaults":
        return RenderGlobalVaultsView();
      case "/chains":
        return RenderChainsCapabilityMatrixView();
      case "/pricing":
        return RenderPricingTableView();
      default:
        return RenderHomeOrChatView();
    }
  }

  // ── VIEW 1: Conversational Home / Active Chat View ─────────────────────────
  function RenderHomeOrChatView() {
    return (
      <section className="center flex-1 flex flex-col justify-between">
        
        {/* Upper Content: Welcome or Messages Thread */}
        <div className="flex-1 overflow-y-auto">
          {!isChatActive ? (
            <div className="text-center py-12">
              <h1>Let’s chat about namespaces</h1>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Message thread */}
              <div className="chat-area">
                {agentChats[activeAgent].map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.sender === "user" ? "user" : "agent"}`}>
                    <div className="avatar-circle">
                      {m.sender === "user" ? "👤" : MOCK_AGENTS[activeAgent].avatar}
                    </div>
                    <div className="bubble-content">
                      <p className="margin-0">{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Renders Search Evaluation Card if name has been queried */}
              {searchResult && (
                <div className="result-card">
                  <div className="result-header">
                    <h4>{searchResult.name}</h4>
                    <span className={`tiny ${
                      searchResult.rarity === "Mythic" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      searchResult.rarity === "Rare" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" :
                      "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    }`}>
                      {searchResult.rarity} Sovereign
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="row-spec">
                      <span className="text-slate-500">Availability</span>
                      <span className="text-emerald-400 font-bold">✓ Available to Mint</span>
                    </div>
                    <div className="row-spec">
                      <span className="text-slate-500">Registry Root</span>
                      <code className="text-amber-500 font-mono">{searchResult.root}</code>
                    </div>
                    <div className="row-spec">
                      <span className="text-slate-500">ERC-6551 TBA Vault</span>
                      <span className="text-emerald-400 font-bold">Supported (EVM Native)</span>
                    </div>
                    <div className="row-spec">
                      <span className="text-slate-500">Suggested Suffix Use</span>
                      <span className="text-slate-300 text-right max-w-[300px] block">{searchResult.utility}</span>
                    </div>
                    <div className="row-spec">
                      <span className="text-slate-500">Registry Mint Fee</span>
                      <span className="text-amber-500 font-bold font-mono">{searchResult.priceTROP} TROP (~${searchResult.priceUSD} USD)</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setMintForm(prev => ({
                        ...prev,
                        name: searchResult.name.split(".")[0],
                        suffix: searchResult.root,
                        chain: searchResult.chainRecommend,
                        rarity: searchResult.rarity
                      }));
                      setMintStep(1);
                      setCurrentPath("/mint");
                    }}
                    className="btn-mint"
                  >
                    Configure & Mint Vault-Bound Namespace →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lower Content: Composer input box & prompt grids */}
        <div className="mt-auto">
          {/* Obsidian Composer */}
          <div className="composer">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Ask ${MOCK_AGENTS[activeAgent].name}... e.g. "search satoshi.gold"`}
            />
            
            {/* composer actions: chips and send */}
            <div className="composer-actions">
              <div className="quick">
                {[
                  { label: "Search roots", action: () => setCurrentPath("/roots") },
                  { label: "Mint namespace", action: () => { setMintStep(1); setCurrentPath("/mint"); } },
                  { label: "Manage vaults", action: () => setCurrentPath("/vaults") },
                  { label: "View proofs", action: () => { setSelectedNamespaceName("wealth.troptions"); setActiveWorkspaceTab("proofs"); setCurrentPath("/name"); } }
                ].map((chip) => (
                  <span key={chip.label} className="chip" onClick={chip.action}>
                    {chip.label}
                  </span>
                ))}
              </div>
              
              <button className="send" onClick={() => submitAgentChat()}>
                <span>Send message</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* agent selectors */}
            <div className="composer-actions border-t border-slate-900 pt-3" style={{ marginTop: "12px" }}>
              <div className="agents">
                {(Object.keys(MOCK_AGENTS) as AgentId[]).map((id) => {
                  const active = activeAgent === id;
                  return (
                    <span 
                      key={id} 
                      className={`chip ${active ? "active" : ""}`}
                      onClick={() => setActiveAgent(id)}
                    >
                      <span className="mr-1">{MOCK_AGENTS[id].avatar}</span>
                      {MOCK_AGENTS[id].name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Prompt cards grid (Only visible if chat is inactive) */}
          {!isChatActive && (
            <>
              <h2>Start your namespace search</h2>
              
              <div className="prompt-grid">
                {[
                  { title: "One root, every chain", desc: "Compare a namespace across Ethereum, Polygon, Base, and linked rails.", prompt: "One root, every chain" },
                  { title: "Find reserve-grade names", desc: "Surface premium .gold and .$$$ names with rarity and vault support.", prompt: "Find reserve-grade names" },
                  { title: "Build a verified hierarchy", desc: "Create .med and .bank namespace structures with policy-aware issuance.", prompt: "Build a verified hierarchy" },
                  { title: "Mint with vault", desc: "Issue the name, create the vault, and open the workspace immediately.", prompt: "Mint with vault" },
                ].map((item, idx) => (
                  <div key={idx} className="prompt" onClick={() => handlePromptCardClick(item.prompt)}>
                    <div className="try">Try this</div>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </section>
    );
  }

  // ── VIEW 2: Guided Stepper Wizard (/mint) ──────────────────────────────────
  function RenderMintStepperView() {
    return (
      <section className="center">
        <div className="composer p-6 space-y-5">
          <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-3">
            <span className="text-slate-400 font-bold">MINT STEPPER</span>
            <span className="font-mono text-amber-500">Step {mintStep} of 5</span>
          </div>

          {mintStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Step 1: Choose Name Suffix Pointer</h4>
              <p className="text-xs text-slate-500">
                Confirm your target name. This pointer will anchor in the decentralized SFT registry.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={mintForm.name} 
                    onChange={(e) => setMintForm(prev => ({ ...prev, name: e.target.value.toLowerCase() }))}
                    className="form-input font-mono flex-1 mb-0"
                  />
                  <select
                    value={mintForm.suffix}
                    onChange={(e) => setMintForm(prev => ({ ...prev, suffix: e.target.value }))}
                    className="form-select font-mono mb-0"
                    style={{ width: "130px" }}
                  >
                    {SUFFIX_DETAILS.map(s => (
                      <option key={s.suffix} value={s.suffix}>{s.suffix}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setMintStep(2)}
                disabled={!mintForm.name.trim()}
                className="btn-mint"
              >
                Next: Select Chain →
              </button>
            </div>
          )}

          {mintStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Step 2: Select Execution Chain</h4>
              <p className="text-xs text-slate-500">
                Choose the primary hosting ledger. ERC-6551 and smart-account policies deploy to EVM networks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {CHAIN_MATRIX.map((c) => {
                  const active = mintForm.chain === c.name;
                  return (
                    <div 
                      key={c.name}
                      onClick={() => setMintForm(prev => ({ ...prev, chain: c.name }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        active 
                          ? "bg-slate-900 border-slate-700 text-white" 
                          : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{c.name}</span>
                        <span className="tiny font-mono">{c.type}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">{c.notes}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-4">
                <button className="pill font-bold py-2 w-1/3" onClick={() => setMintStep(1)}>Back</button>
                <button className="btn-mint flex-1 mt-0 py-2.5" onClick={() => setMintStep(3)}>Next: Vault Rules →</button>
              </div>
            </div>
          )}

          {mintStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Step 3: Vault Settings</h4>
              <p className="text-xs text-slate-500">
                Setup executable smart-wallet options. ERC-6551 allocates a TBA; ERC-4337 enables gasless features.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-900">
                  <div>
                    <span className="font-bold text-white block">ERC-6551 Token-Bound Account</span>
                    <span className="text-[10px] text-slate-500">Deploy linked smart-contract container</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={mintForm.vaultEnabled}
                    onChange={(e) => setMintForm(prev => ({ ...prev, vaultEnabled: e.target.checked }))}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-900">
                  <div>
                    <span className="font-bold text-white block">ERC-4337 Smart Account</span>
                    <span className="text-[10px] text-slate-500">Enable gas sponsorship and recovery policies</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={mintForm.smartWalletEnabled}
                    onChange={(e) => setMintForm(prev => ({ ...prev, smartWalletEnabled: e.target.checked }))}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-900">
                  <div>
                    <span className="font-bold text-white block">Attorney Attestation Lock</span>
                    <span className="text-[10px] text-slate-500">Restrict release triggers to legal notary validation</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={mintForm.attorneyAttest}
                    onChange={(e) => setMintForm(prev => ({ ...prev, attorneyAttest: e.target.checked }))}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button className="pill font-bold py-2 w-1/3" onClick={() => setMintStep(2)}>Back</button>
                <button className="btn-mint flex-1 mt-0 py-2.5" onClick={() => setMintStep(4)}>Next: Review & Anchor →</button>
              </div>
            </div>
          )}

          {mintStep === 4 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Step 4: Finalize Registry Anchors</h4>
              <p className="text-xs text-slate-500">
                Confirm configurations. Executing the mint will anchor SFT records across parallel chains.
              </p>

              <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Name</span>
                  <code className="text-amber-500 font-bold font-mono">{mintForm.name}{mintForm.suffix}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Chain</span>
                  <span className="text-white font-semibold">{mintForm.chain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TBA Vault Contract</span>
                  <span className="text-white font-semibold">{mintForm.vaultEnabled ? "Active (ERC-6551)" : "Disabled"}</span>
                </div>
              </div>

              {isMinting && (
                <div className="terminal-screen font-mono space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-amber-500 font-bold border-b border-slate-900 pb-1 mb-2">
                    <span>Anchoring Pipeline Status</span>
                    <span>{mintProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mb-2">
                    <div className="bg-amber-500 h-1" style={{ width: `${mintProgress}%` }} />
                  </div>
                  {mintLogs.map((log, i) => (
                    <p key={i} className="margin-0 truncate">{log}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button className="pill font-bold py-2 w-1/3" onClick={() => setMintStep(3)} disabled={isMinting}>Back</button>
                <button className="btn-mint flex-1 mt-0 py-2.5" onClick={handleMintAction} disabled={isMinting}>
                  {isMinting ? "Executing Anchors..." : "Anchor Namespace & Vault"}
                </button>
              </div>
            </div>
          )}

          {mintStep === 5 && (
            <div className="space-y-4 text-center py-4">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-base font-black text-white">Sovereign SFT anchored successfully!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Decentralized registry record established for <code className="text-amber-500 font-mono font-bold">{mintForm.name}{mintForm.suffix}</code> on {mintForm.chain}.
              </p>

              <button
                onClick={() => {
                  setSelectedNamespaceName(`${mintForm.name}${mintForm.suffix}`);
                  setActiveWorkspaceTab("overview");
                  setCurrentPath("/name");
                }}
                className="btn-mint max-w-xs mx-auto"
              >
                Open Workspace
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── VIEW 3: Name Workspace with sub-tabs (/name/:fullName) ────────────────
  function RenderNamespaceWorkspaceView() {
    return (
      <section className="center">
        <div className="panel-box space-y-5">
          {/* Header */}
          <div className="flex justify-between items-start gap-4 flex-wrap border-b border-slate-900 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">OPERATING IDENTITY</span>
              <h3 className="text-xl font-black font-mono text-white mt-1">{activeNS.name}</h3>
              <p className="text-[10px] text-slate-500 mt-1">Anchored on {activeNS.chain} • Rarity Class: {activeNS.rarity}</p>
            </div>
            <span className="tiny font-bold uppercase">{activeNS.status}</span>
          </div>

          {/* Sub-tab navigation */}
          <div className="sub-tab-bar">
            {[
              { id: "overview", label: "Overview" },
              { id: "vault", label: "Vault CBA" },
              { id: "policies", label: "Release Policies" },
              { id: "subnames", label: "Subnames" },
              { id: "chain-links", label: "Chain Mirrors" },
              { id: "proofs", label: "Registry Proofs" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveWorkspaceTab(tab.id as any)}
                className={`sub-tab-btn ${activeWorkspaceTab === tab.id ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-tab content */}
          {activeWorkspaceTab === "overview" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Identity Owner</span>
                  <span className="text-white font-semibold">{activeNS.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created Date</span>
                  <span className="text-white font-semibold">{activeNS.created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Smart Vault CBA</span>
                  <span className={activeNS.vaultEnabled ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {activeNS.vaultEnabled ? "Active (ERC-6551)" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Smart Wallet AA</span>
                  <span className={activeNS.smartWalletEnabled ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {activeNS.smartWalletEnabled ? "Active (ERC-4337)" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 space-y-2">
                <h4 className="font-bold text-white">IPFS Manifest Metadata</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Private client-side encrypted manifests are anchored via decentralized storage.
                </p>
                <code className="block bg-[#05070a] p-2.5 rounded border border-slate-900 text-[10px] break-all select-all text-slate-400">
                  {activeNS.ipfsCID}
                </code>
              </div>
            </div>
          )}

          {activeWorkspaceTab === "vault" && (
            <div className="space-y-4 text-xs">
              {activeNS.vaultEnabled ? (
                <>
                  <div className="p-3 bg-[#080d1e] border border-slate-900 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-mono block">CBA Wallet Address</span>
                    <code className="text-[11px] font-mono text-slate-300 block break-all select-all">{activeNS.vaultAddress}</code>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset Ledger</p>
                    {activeNS.vaultBalances.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
                        <span className="font-bold text-white">{item.token}</span>
                        <div className="text-right font-mono">
                          <p className="font-bold text-slate-200">{item.balance}</p>
                          <p className="text-[9px] text-slate-500">{item.valUSD}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-500/20 bg-[#090f1d] flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        Yields
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                        Accumulated yield: 150 TROP.
                      </p>
                    </div>
                    <button
                      onClick={() => handleClaimYield(activeNS.name)}
                      disabled={yieldClaimedStatus[activeNS.name]}
                      className="send mt-0"
                    >
                      {yieldClaimedStatus[activeNS.name] ? "Claimed" : "Claim TROP"}
                    </button>
                  </div>

                  <form onSubmit={handleVaultDeposit} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deposit Mock Assets</h4>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={vaultDepositForm.amount}
                        onChange={(e) => setVaultDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="form-input flex-1 mb-0"
                      />
                      <select
                        value={vaultDepositForm.token}
                        onChange={(e) => setVaultDepositForm(prev => ({ ...prev, token: e.target.value }))}
                        className="form-select mb-0"
                        style={{ width: "90px" }}
                      >
                        <option value="TROP">TROP</option>
                        <option value="USDC">USDC</option>
                        <option value="ETH">ETH</option>
                        <option value="XLM">XLM</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isDepositing || !vaultDepositForm.amount}
                      className="btn-mint mt-0 py-2 text-[11px]"
                    >
                      {isDepositing ? "Processing..." : "Submit Deposit"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <Wallet className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                  <p>No ERC-6551 vault deployed for this namespace.</p>
                </div>
              )}
            </div>
          )}

          {activeWorkspaceTab === "policies" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 space-y-4">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Inheritance release rules</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-200">Death Certificate Attestation</p>
                    <p className="text-[9px] text-slate-500">Requires certified public upload of death record</p>
                  </div>
                  <span className="text-emerald-400 font-bold">Enabled</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>Executor Signature Quorum</span>
                    <span className="font-mono text-amber-500">{activeNS.policy.executorQuorum} of {activeNS.policy.executorTotal}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max={activeNS.policy.executorTotal}
                    value={activeNS.policy.executorQuorum}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNamespacesList(prev => prev.map(ns => {
                        if (ns.name === selectedNamespaceName) {
                          return { ...ns, policy: { ...ns.policy, executorQuorum: val } };
                        }
                        return ns;
                      }));
                    }}
                    className="w-full accent-amber-500 bg-slate-900 h-1 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-200">Attorney Attestation Lock</p>
                    <p className="text-[9px] text-slate-500">Requires notary validation signature</p>
                  </div>
                  <span className={activeNS.policy.attorneySig ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {activeNS.policy.attorneySig ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>Guardian Quorum Approval</span>
                    <span className="font-mono text-amber-500">{activeNS.policy.guardianQuorum} of {activeNS.policy.guardianTotal}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max={activeNS.policy.guardianTotal}
                    value={activeNS.policy.guardianQuorum}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNamespacesList(prev => prev.map(ns => {
                        if (ns.name === selectedNamespaceName) {
                          return { ...ns, policy: { ...ns.policy, guardianQuorum: val } };
                        }
                        return ns;
                      }));
                    }}
                    className="w-full accent-amber-500 bg-slate-900 h-1 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>Mandatory Waiting Cooldown</span>
                    <span className="font-mono text-amber-500">{activeNS.policy.cooldownDays} Days</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="180" 
                    step="10"
                    value={activeNS.policy.cooldownDays}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNamespacesList(prev => prev.map(ns => {
                        if (ns.name === selectedNamespaceName) {
                          return { ...ns, policy: { ...ns.policy, cooldownDays: val } };
                        }
                        return ns;
                      }));
                    }}
                    className="w-full accent-amber-500 bg-slate-900 h-1 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeWorkspaceTab === "subnames" && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleCreateSubname} className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Register subname node</h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. clinic" 
                    value={newSubnameInput}
                    onChange={(e) => setNewSubnameInput(e.target.value)}
                    className="form-input flex-1 mb-0 font-mono"
                  />
                  <button type="submit" className="send mt-0">Register</button>
                </div>
              </form>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registered nodes</p>
                {activeNS.subnames.map((sub, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900 font-mono">
                    <span>{sub}</span>
                    <span className="tiny mint">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeWorkspaceTab === "chain-links" && (
            <div className="space-y-4 text-xs">
              <p className="text-[11px] text-slate-500 leading-normal">
                Decentralized mirror pointer links mapping the namespace to parallel address targets.
              </p>

              <div className="space-y-2 font-mono">
                <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Solana Mirror Target</span>
                  <code className="text-slate-300 break-all select-all block">{activeNS.solanaMirror}</code>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">XRPL Mirror Target</span>
                  <code className="text-slate-300 break-all select-all block">{activeNS.xrplMirror}</code>
                </div>
              </div>
            </div>
          )}

          {activeWorkspaceTab === "proofs" && (
            <div className="space-y-3 font-mono text-[10px]">
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block">Stellar Memo-Hash</span>
                  <span className="text-amber-500 block truncate max-w-[200px] mt-0.5">{activeNS.stellarTx}</span>
                </div>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block">XRPL AccountSet Tx</span>
                  <span className="text-amber-500 block truncate max-w-[200px] mt-0.5">{activeNS.xrplTx}</span>
                </div>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block">Solana Token-2022 Tx</span>
                  <span className="text-amber-500 block truncate max-w-[200px] mt-0.5">{activeNS.solanaTx}</span>
                </div>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── VIEW 4: Global Vaults Builder Directory (/vaults) ────────────────────
  function RenderGlobalVaultsView() {
    return (
      <section className="center">
        <h2 className="text-left font-bold text-white text-base mb-4 mt-0">Global smart Vault Directory</h2>
        
        <div className="dashboard-grid">
          {/* Active Vault list */}
          <div className="space-y-3 flex flex-col">
            {namespacesList.map((ns) => (
              <div 
                key={ns.name}
                onClick={() => setSelectedNamespaceName(ns.name)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedNamespaceName === ns.name 
                    ? "bg-[#091024] border-slate-700" 
                    : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <code className="text-xs font-bold font-mono text-amber-500">{ns.name}</code>
                  <span className="tiny font-mono">{ns.chain}</span>
                </div>
                <div className="flex gap-4 text-[10px] text-slate-500 mt-2">
                  <span>{ns.vaultEnabled ? "CBA Active" : "No Vault"}</span>
                  <span>{ns.subnames.length} Subname</span>
                </div>
              </div>
            ))}
          </div>

          {/* CBA detailed balance visualizer */}
          <div className="panel-box">
            {activeNS.vaultEnabled ? (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white">CBA Asset Ledger</h4>
                    <code className="text-[10px] font-mono text-slate-500 block mt-0.5 truncate max-w-[180px]">{activeNS.vaultAddress}</code>
                  </div>
                  <span className="tiny">Active</span>
                </div>

                <div className="space-y-2 border-t border-slate-900 pt-3">
                  {activeNS.vaultBalances.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                      <span className="font-bold text-white">{item.token}</span>
                      <span className="font-mono text-slate-300">{item.balance}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-900 pt-3">
                  <button 
                    onClick={() => {
                      setActiveWorkspaceTab("vault");
                      setCurrentPath("/name");
                    }}
                    className="btn-mint mt-0 py-2.5"
                  >
                    Open Vault Controls
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Wallet className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                <p>Selected namespace does not have an active ERC-6551 vault.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── VIEW 5: Suffix roots explorer (/roots) ─────────────────────────────────
  // Note: Sidebar roots click also routes here
  function RenderSuffixExplorerView() {
    return (
      <section className="center">
        <h2 className="text-left font-bold text-white text-base mb-4 mt-0">Suffix Roots Registry Explorer</h2>

        <div className="sub-tab-bar">
          {[
            { id: "reserve", label: "Commodity & Reserve" },
            { id: "professional", label: "Trust & Verified" },
            { id: "monetary", label: "Commerce & Points" },
            { id: "house", label: "Canonical Suffixes" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveRootFamilyTab(tab.id as any)}
              className={`sub-tab-btn ${activeRootFamilyTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUFFIX_DETAILS.filter(s => s.family === activeRootFamilyTab).map((s) => (
            <div 
              key={s.suffix}
              onClick={() => {
                setSelectedRootSlug(s.suffix);
                setMintForm(prev => ({ ...prev, suffix: s.suffix }));
                runNamespaceQuery(`estate${s.suffix}`);
                setCurrentPath("/");
              }}
              className="panel-box hover:border-slate-800 transition-all cursor-pointer space-y-3"
            >
              <div className="flex justify-between items-center">
                <code className="text-sm font-bold font-mono text-amber-500">{s.suffix}</code>
                <span className="tiny">{s.class}</span>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">{s.utility}</p>
              
              <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-2">
                <span>Fee: {s.costTROP} TROP</span>
                <span>{s.restricted ? "⚠️ Gated Issuance" : "✓ Open Suffix"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── VIEW 6: Chains capability matrix (/chains) ────────────────────────────
  function RenderChainsCapabilityMatrixView() {
    return (
      <section className="center">
        <h2 className="text-left font-bold text-white text-base mb-4 mt-0">Multi-Chain Deployment Matrix</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          EVM rails support decentralized quorums and smart-contract balances (ERC-6551/4337). Non-EVM rails serve as mirror destinations.
        </p>

        <div className="space-y-4">
          {CHAIN_MATRIX.map((c) => (
            <div key={c.name} className="panel-box space-y-3">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-sm font-bold text-white">{c.name}</span>
                <span className="tiny font-mono">{c.type} Ledger</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Vault Mode</span>
                  <span className="text-white font-semibold block mt-0.5">{c.vaults}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Smart Wallet</span>
                  <span className="text-white font-semibold block mt-0.5">{c.smartWallets}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Est. Gas Fee</span>
                  <span className="text-amber-500 font-bold block mt-0.5 font-mono">{c.cost}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Tx Speed</span>
                  <span className="text-white font-semibold block mt-0.5">{c.speed}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 border-t border-slate-900 pt-2 leading-relaxed">
                {c.notes}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── VIEW 7: Pricing Tiers table (/pricing) ───────────────────────────────
  function RenderPricingTableView() {
    return (
      <section className="center">
        <h2 className="text-left font-bold text-white text-base mb-4 mt-0">Sovereign Registry Pricing</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Pricing models dynamically index based on character length and gated root suffix categories.
        </p>

        <div className="panel-box space-y-4">
          {[
            { title: "Mythic Sovereign", sub: "3 characters or less (.gold, .$$$)", fee: "1200 TROP (~$1,200)" },
            { title: "Rare Sovereign", sub: "Exact 4 characters (.gold, .$$$, .troptions)", fee: "600 TROP (~$600)" },
            { title: "Standard Suffix SFT", sub: "5+ characters for house roots (.legacy, .troptions)", fee: "100-200 TROP (~$100-200)" },
            { title: "Gated Professional Roots", sub: "Verified professional extensions (.med, .bank, .doc)", fee: "800-2500 TROP (~$800-2,500)" },
          ].map((tier, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-slate-900 pb-3 last:border-b-0 last:pb-0 text-xs">
              <div>
                <p className="font-bold text-white text-sm">{tier.title}</p>
                <p className="text-[10px] text-slate-500 mt-1">{tier.sub}</p>
              </div>
              <span className="font-mono font-bold text-amber-500 text-sm">{tier.fee}</span>
            </div>
          ))}
        </div>

        <div className="panel-box bg-[#090f1d] border-slate-900 text-xs text-slate-400 mt-4">
          <p className="leading-relaxed margin-0">
            * Transaction gas fees are sponsored and gasless on Polygon and Base when using an active ERC-4337 smart-account.
          </p>
        </div>
      </section>
    );
  }
}
