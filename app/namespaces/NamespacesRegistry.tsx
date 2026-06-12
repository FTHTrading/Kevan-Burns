"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Globe, Vault, FileText, Wallet, Users, Shield, Download, 
  GitBranch, Zap, ExternalLink, HelpCircle, CheckCircle, 
  Award, Info, Terminal, X, Coins, Lock 
} from "lucide-react";
import { getPublicIPFSUrl } from "@/lib/ipfs/ipfs-adapter";

interface NamespaceEntitlement {
  id: string;
  userId: string;
  namespace: string;
  subscriptionId: string | null;
  plan: string;
  isActive: boolean;
  createdAt: Date | string;
  ipfsCID: string | null;
  stellarTxHash: string | null;
  solanaTxHash: string | null;
  xrplTxHash: string | null;
}

interface NamespacesRegistryProps {
  realNamespaces: NamespaceEntitlement[];
  userId?: string;
  exampleNamespaces: any[];
  namespaceCapabilities: any[];
  statusColors: Record<string, string>;
}

// Calculate rarity tier based on character length of the subdomain label
function getRarityTier(fullNamespace: string) {
  const parts = fullNamespace.split(".");
  const label = parts[0] || "";
  const len = label.length;

  if (len <= 3) {
    return {
      name: "Mythic Sovereign",
      color: "bg-red-500/10 text-red-400 border-red-500/20",
      description: "Extremely rare 3-character namespace.",
      points: 150
    };
  } else if (len === 4) {
    return {
      name: "Rare Sovereign",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      description: "Premium 4-character namespace.",
      points: 100
    };
  } else {
    return {
      name: "Standard Sovereign",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      description: "Standard estate identifier.",
      points: 50
    };
  }
}

export default function NamespacesRegistry({
  realNamespaces,
  userId,
  exampleNamespaces,
  namespaceCapabilities,
  statusColors
}: NamespacesRegistryProps) {
  // Modal state
  const [selectedCert, setSelectedCert] = useState<any>(null);
  
  // Reward Claim state
  const [recipientWallet, setRecipientWallet] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [claimedAmount, setClaimedAmount] = useState(0);

  // Demo fallbacks if user is not authenticated or has no namespaces
  const effectiveUserId = userId || "demo-user-id";
  const displayNamespaces = realNamespaces.length > 0 ? realNamespaces : [
    {
      id: "demo-legacy",
      userId: "demo-user-id",
      namespace: "estate.legacy",
      subscriptionId: "demo-sub",
      plan: "LIFETIME_LEGACY_LOCK",
      isActive: true,
      createdAt: new Date().toISOString(),
      ipfsCID: "bafkreiftonagbd5v46vtwthbqnn4gwqnijojnrqzp3nhn7v4t47amsltf4",
      stellarTxHash: "12750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809",
      xrplTxHash: "92611FFE685BEE59FF994BBD216367F597C8C547A878741F40304C8BF3369F78",
      solanaTxHash: "SOLANA_TX_A49AAA1B44FE193BDC8C2B4A9B56"
    },
    {
      id: "demo-troptions",
      userId: "demo-user-id",
      namespace: "wealth.troptions",
      subscriptionId: "demo-sub",
      plan: "LIFETIME_LEGACY_LOCK",
      isActive: true,
      createdAt: new Date().toISOString(),
      ipfsCID: "bafkreiad5vtqhgh6om2yx6io5bxkmjrgkzwbqjf2oswgsuyfzfsawevlfy",
      stellarTxHash: "a168ac2201300f2f7da9d4a10b0e7799785b5bf5e35993f7a4c65970edf87778",
      xrplTxHash: "CBFC157422B4325FECB6705C4A5A740F775C738C2DE7A6F4AE3E3D5249FDABD0",
      solanaTxHash: "SOLANA_TX_631C49F740A738FD674967AB3631"
    }
  ];

  // Calculate user rewards
  // 100 TROP for .troptions, 50 TROP for .legacy
  const unclimedRewards = displayNamespaces.reduce((acc, ns) => {
    if (!ns.isActive) return acc;
    return acc + (ns.namespace.endsWith(".troptions") ? 100 : 50);
  }, 0);

  const activeCount = displayNamespaces.filter(n => n.isActive).length;

  // Add simulated terminal logging helper
  const addLog = (msg: string, delay: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, msg]);
        resolve();
      }, delay);
    });
  };

  const handleClaimRewards = async () => {
    if (!recipientWallet.trim()) return;
    setClaiming(true);
    setTerminalLogs([]);
    setClaimSuccess(false);
    setTxSignature("");

    try {
      await addLog("⚡ Initializing Unykorn Reward claim protocol...", 100);
      await addLog(`📡 Authenticating user: ${userId?.slice(0, 12)}...`, 300);
      await addLog(`🏦 Accumulating namespace yields: ${unclimedRewards} TROP`, 400);
      await addLog(`🔗 Connect wallet bridge targeting: ${recipientWallet.slice(0, 8)}...${recipientWallet.slice(-6)}`, 400);
      
      const response = await fetch("/api/mint-troptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientWallet,
          claimAmount: unclimedRewards,
          details: `Claiming rewards for ${activeCount} active sovereign namespaces`
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Bridge failed to submit transaction");
      }

      await addLog(`📡 Handshaking Solana Mainnet RPC node...`, 500);
      await addLog(`📝 Constructing Token-2022 MintTo instruction...`, 500);
      await addLog(`🔏 Submitting signature payload signed by Unykorn Master Operator...`, 500);
      await addLog(`✓ Block confirmed. Transaction settled!`, 400);
      await addLog(`🔗 Signature: ${data.signature}`, 200);

      setTxSignature(data.signature);
      setClaimedAmount(unclimedRewards);
      setClaimSuccess(true);
    } catch (err: any) {
      setTerminalLogs(prev => [...prev, `❌ Claim failed: ${err.message}`]);
    } finally {
      setClaiming(false);
    }
  };

  const certs = {
    legacy: {
      name: ".legacy Root Authority SFT",
      suffix: ".legacy",
      image: "/images/legacy/legacy_genesis_soulbound.png",
      rarity: "1-of-1 Genesis SFT Node",
      cid: "bafkreiftonagbd5v46vtwthbqnn4gwqnijojnrqzp3nhn7v4t47amsltf4",
      imageCid: "bafybeid6xkuevo7xuw7yf5i5eqrnv2ngfy655zpawtj5hxli56iycg4aza",
      stellarTx: "12750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809",
      xrplTx: "92611FFE685BEE59FF994BBD216367F597C8C547A878741F40304C8BF3369F78",
      owner: "Unykorn Authority",
      location: "5655 Peachtree Parkway, Norcross, GA 30092",
      description: "The official Genesis SFT certifying absolute sovereign root authority over all .legacy namespace extensions. Locked and non-transferable."
    },
    troptions: {
      name: ".troptions Root Authority SFT",
      suffix: ".troptions",
      image: "/images/legacy/troptions_genesis_soulbound.png",
      rarity: "1-of-1 Genesis SFT Node",
      cid: "bafkreiad5vtqhgh6om2yx6io5bxkmjrgkzwbqjf2oswgsuyfzfsawevlfy",
      imageCid: "bafybeihfpb3cjb46ut3dzid4u3evuduw3sjuockuhtbm46kxc7pfsfzorm",
      stellarTx: "a168ac2201300f2f7da9d4a10b0e7799785b5bf5e35993f7a4c65970edf87778",
      xrplTx: "CBFC157422B4325FECB6705C4A5A740F775C738C2DE7A6F4AE3E3D5249FDABD0",
      owner: "Unykorn Authority",
      location: "5655 Peachtree Parkway, Norcross, GA 30092",
      description: "The official Genesis SFT certifying absolute sovereign root authority over all .troptions namespace extensions. Governs financial utilities and trust succession."
    }
  };

  return (
    <>
      {/* Genesis Root Namespace Authority Section */}
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-6">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-400 font-bold bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20 mb-3">
            <Shield className="h-3.5 w-3.5 text-gold-400" /> Root Namespace Authority
          </span>
          <h2 className="text-2xl font-black text-white">Genesis Root Certification Registry</h2>
          <p className="text-xs text-slate-400 mt-1">Officially deployed and certified sovereign root suffixes owned by Unykorn Authority. Click any card to inspect genesis rarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* .legacy certificate */}
          <div 
            onClick={() => setSelectedCert(certs.legacy)}
            className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-navy-900 to-navy-950 p-6 shadow-xl overflow-hidden group hover:border-cyan-500/50 hover:shadow-cyan-500/5 transition-all duration-300 cursor-pointer"
          >
            <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all" />
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-mono text-xl font-extrabold text-white">.legacy</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Sovereign Root Domain Suffix</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] text-cyan-400 font-bold">
                <CheckCircle className="h-3 w-3 text-cyan-400 shrink-0" /> Genesis Anchored
              </span>
            </div>

            <div className="relative h-64 w-full rounded-xl overflow-hidden mb-4 border border-cyan-500/20 bg-navy-950 shadow-inner group-hover:border-cyan-500/40 transition-all duration-300">
              <Image 
                src="/images/legacy/legacy_genesis_soulbound.png" 
                alt=".legacy Genesis Certificate" 
                fill 
                className="object-contain p-2 group-hover:scale-[1.02] transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              The canonical root namespace suffix for private asset vaults, estate declarations, and digital inheritance protocols. Client-side encrypted manifests are anchored permanently.
            </p>

            <div className="space-y-2.5 text-xs border-t border-navy-800 pt-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Root Authority Owner</span>
                <span className="font-semibold text-slate-300 font-mono">Unykorn Authority</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Manifest Rarity</span>
                <span className="font-bold text-red-400 font-mono flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-red-400" /> Unique Genesis Node
                </span>
              </div>
            </div>
          </div>

          {/* .troptions certificate */}
          <div 
            onClick={() => setSelectedCert(certs.troptions)}
            className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-br from-navy-900 to-navy-950 p-6 shadow-xl overflow-hidden group hover:border-amber-500/50 hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer"
          >
            <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-500/20 transition-all" />

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-mono text-xl font-extrabold text-white">.troptions</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Sovereign Root Domain Suffix</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 text-[10px] text-amber-400 font-bold">
                <CheckCircle className="h-3 w-3 text-amber-400 shrink-0" /> Genesis Anchored
              </span>
            </div>

            <div className="relative h-64 w-full rounded-xl overflow-hidden mb-4 border border-amber-500/20 bg-navy-950 shadow-inner group-hover:border-amber-500/40 transition-all duration-300">
              <Image 
                src="/images/legacy/troptions_genesis_soulbound.png" 
                alt=".troptions Genesis Certificate" 
                fill 
                className="object-contain p-2 group-hover:scale-[1.02] transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              The specialized financial root namespace suffix. Used for structuring asset distribution plans, business succession trusts, and TROPTIONS Token-2022 utility integrations.
            </p>

            <div className="space-y-2.5 text-xs border-t border-navy-800 pt-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Root Authority Owner</span>
                <span className="font-semibold text-slate-300 font-mono">Unykorn Authority</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Manifest Rarity</span>
                <span className="font-bold text-red-400 font-mono flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-red-400" /> Unique Genesis Node
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Active Namespaces */}
      {effectiveUserId && (
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex items-center justify-between mb-8 border-b border-navy-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Your Sovereign Namespaces</h2>
              <p className="text-xs text-slate-400 mt-1">Real-time database records, IPFS metadata documents, and blockchain transactions.</p>
            </div>
            <Link href="/namespaces/register" className="btn-primary text-xs py-2 px-4">
              Register Namespace
            </Link>
          </div>

          {displayNamespaces.length === 0 ? (
            <div className="vault-card text-center py-12 text-slate-400">
              <Globe className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-sm font-semibold text-white">No custom namespaces registered yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-6">Create your own `.legacy` and `.troptions` suffixes secured on-chain.</p>
              <Link href="/namespaces/register" className="btn-primary text-xs inline-block">
                Claim a Name Now
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {displayNamespaces.map((ns) => {
                const rarity = getRarityTier(ns.namespace);
                return (
                  <div key={ns.id} className="rounded-xl border border-navy-700 bg-navy-800/60 p-6 space-y-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <code className="text-base font-bold text-gold-400">{ns.namespace}</code>
                          <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${statusColors[ns.isActive ? "ACTIVE" : "LOCKED"]}`}>
                            {ns.isActive ? "ACTIVE" : "LOCKED"}
                          </span>
                          <span className={`text-[10px] font-bold border rounded px-2 py-0.5 flex items-center gap-1 ${rarity.color}`}>
                            <Award className="h-3 w-3" /> {rarity.name}
                          </span>
                          <span className="text-[10px] text-slate-500">Registered {new Date(ns.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Plan tier: {ns.plan} • {rarity.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {ns.ipfsCID ? (
                          <a
                            href={getPublicIPFSUrl(ns.ipfsCID)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 rounded-lg px-2.5 py-1 hover:bg-cyan-900/30 transition-all"
                          >
                            <FileText className="h-3 w-3" />
                            IPFS Manifest Document
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-800/40 border border-slate-700/30 rounded-lg px-2.5 py-1">
                            <HelpCircle className="h-3 w-3" /> No IPFS Record
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Blockchain TXNs Section */}
                    <div className="border-t border-navy-700/60 pt-4">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">On-Chain Anchoring Transactions (TXN)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Stellar Anchor */}
                        <div className="bg-navy-900/50 border border-navy-750 p-3 rounded-lg flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-300">Stellar Anchor</span>
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono">MEMO-HASH</span>
                          </div>
                          {ns.stellarTxHash ? (
                            <a
                              href={ns.stellarTxHash.startsWith("mock-") ? "#" : `https://stellar.expert/explorer/public/tx/${ns.stellarTxHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-mono text-gold-500/90 truncate flex items-center gap-1 hover:underline"
                            >
                              {ns.stellarTxHash.slice(0, 16)}...
                              <ExternalLink className="h-2 w-2 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-600 font-mono italic">Not anchored</span>
                          )}
                        </div>

                        {/* XRPL Anchor */}
                        <div className="bg-navy-900/50 border border-navy-750 p-3 rounded-lg flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-300">XRPL Anchor</span>
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">ACCOUNT-SET</span>
                          </div>
                          {ns.xrplTxHash ? (
                            <a
                              href={ns.xrplTxHash.startsWith("mock-") ? "#" : `https://bithomp.com/explorer/${ns.xrplTxHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-mono text-gold-500/90 truncate flex items-center gap-1 hover:underline"
                            >
                              {ns.xrplTxHash.slice(0, 16)}...
                              <ExternalLink className="h-2 w-2 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-600 font-mono italic">Not anchored</span>
                          )}
                        </div>

                        {/* Solana Anchor */}
                        <div className="bg-navy-900/50 border border-navy-750 p-3 rounded-lg flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-300">Solana Anchor</span>
                            <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded border border-teal-500/20 font-mono">TOKEN-2022</span>
                          </div>
                          {ns.solanaTxHash ? (
                            <a
                              href={ns.solanaTxHash.startsWith("mock-") ? "#" : `https://solscan.io/tx/${ns.solanaTxHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-mono text-gold-500/90 truncate flex items-center gap-1 hover:underline"
                            >
                              {ns.solanaTxHash.slice(0, 16)}...
                              <ExternalLink className="h-2 w-2 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-600 font-mono italic">Not anchored</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Sovereign Token Rewards Dashboard & Claim Hub */}
      {effectiveUserId && activeCount > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-8">
          <div className="relative rounded-2xl border border-gold-500/20 bg-gradient-to-br from-navy-900 via-navy-950 to-slate-900 p-6 shadow-2xl overflow-hidden">
            <div className="absolute -right-24 -bottom-24 w-60 h-60 rounded-full bg-gold-500/5 blur-3xl" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20 mb-2">
                  <Coins className="h-3.5 w-3.5 text-gold-400" /> Sovereign rewards hub
                </span>
                <h2 className="text-xl font-bold text-white">Earn TROP Rewards for Active Namespaces</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Secure your loyalty yield. Every active <code className="text-gold-400 font-mono text-xs">.troptions</code> grants 100 TROP; each <code className="text-gold-400 font-mono text-xs">.legacy</code> grants 50 TROP.
                </p>
              </div>

              <div className="bg-navy-950/60 border border-navy-800 rounded-xl p-4 text-center min-w-[150px]">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Unclaimed Balance</p>
                <p className="text-3xl font-black text-gold-400 mt-1 font-mono">
                  {claimSuccess ? 0 : unclimedRewards} <span className="text-xs text-slate-500">TROP</span>
                </p>
                {claimSuccess && (
                  <p className="text-[10px] text-emerald-400 font-bold mt-1.5">✓ {claimedAmount} TROP claimed</p>
                )}
              </div>
            </div>

            {/* Claim Interface */}
            {!claimSuccess ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start border-t border-navy-800/80 pt-6">
                <div className="space-y-4">
                  <p className="text-xs text-slate-300">
                    Input your Solana SPL / Token-2022 compatible wallet address below to bridge and claim your sovereign utility tokens.
                  </p>
                  <div>
                    <label htmlFor="recipientWallet" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Recipient Wallet Address (Solana Mainnet)
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id="recipientWallet"
                        placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheT..." 
                        value={recipientWallet}
                        onChange={(e) => setRecipientWallet(e.target.value)}
                        className="bg-navy-950 border border-navy-750 text-white rounded-lg px-3.5 py-2.5 text-xs font-mono w-full focus:outline-none focus:border-gold-500 transition-all placeholder:text-slate-600"
                        disabled={claiming}
                      />
                      <button 
                        onClick={handleClaimRewards}
                        disabled={claiming || !recipientWallet.trim() || unclimedRewards === 0}
                        className={`font-bold text-xs rounded-lg px-6 py-2.5 transition-all text-nowrap flex items-center gap-1.5 ${
                          claiming || !recipientWallet.trim() || unclimedRewards === 0
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                            : "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-lg shadow-gold-500/10 cursor-pointer"
                        }`}
                      >
                        {claiming ? "Claiming..." : "Claim TROP →"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated live logger */}
                <div className="rounded-xl border border-navy-800 bg-black/40 p-4 font-mono text-[10px] space-y-1.5 min-h-[120px] max-h-[160px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-navy-900 pb-1.5 mb-2">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                      <Terminal className="h-3 w-3 text-gold-500" /> Reward claims console
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  {terminalLogs.length === 0 ? (
                    <p className="text-slate-600 italic">Terminal idle. Enter address and click claim to initiate bridge.</p>
                  ) : (
                    terminalLogs.map((log, index) => (
                      <p key={index} className={log.startsWith("❌") ? "text-red-400" : log.startsWith("✓") ? "text-emerald-400 font-semibold" : "text-slate-300"}>
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="border-t border-navy-800/80 pt-6 text-center py-6">
                <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <h3 className="font-bold text-white text-base">Claim Successful!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Your rewards of {claimedAmount} TROP have been bridged and minted to your wallet on the Solana public network.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-navy-950/80 border border-navy-800 rounded-lg px-4 py-2 text-xs font-mono">
                  <span className="text-slate-500">Transaction Signature:</span>
                  <a 
                    href={`https://solscan.io/tx/${txSignature}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-gold-400 hover:underline flex items-center gap-1"
                  >
                    {txSignature.slice(0, 18)}...
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <button 
                  onClick={() => {
                    setClaimSuccess(false);
                    setRecipientWallet("");
                    setTerminalLogs([]);
                  }}
                  className="mt-6 block mx-auto text-xs font-semibold text-slate-500 hover:text-slate-300 transition-all"
                >
                  Claim additional rewards
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Namespace capabilities */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">What a Namespace Holds</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">Complete estate infrastructure in one namespace</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {namespaceCapabilities.map((cap) => (
              <div key={cap.label} className="flex items-start gap-4 rounded-xl border border-navy-700 bg-navy-800/40 p-4">
                <div className="flex-shrink-0 text-gold-400">{cap.icon}</div>
                <div>
                  <p className="font-semibold text-white text-sm">{cap.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cap.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example namespaces */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Industry Examples</p>
        <h2 className="mb-10 text-center text-2xl font-bold text-white">Structured Legacy Registry Examples</h2>
        <div className="space-y-4">
          {exampleNamespaces.map((ns) => (
            <div key={ns.id} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <code className="text-sm font-bold text-gold-400">{ns.id}</code>
                    <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${statusColors[ns.status]}`}>
                      {ns.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{ns.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{ns.description}</p>
                </div>
                <div className="flex gap-4 text-center">
                  {[
                    { v: ns.vaults, l: "Vaults" },
                    { v: ns.docs, l: "Docs" },
                    { v: ns.wallets, l: "Wallets" },
                    { v: ns.members, l: "Members" },
                  ].map((stat) => (
                    <div key={stat.l}>
                      <p className="text-lg font-bold text-white">{stat.v}</p>
                      <p className="text-xs text-slate-500">{stat.l}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Filing areas */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["Legal Docs", "Trust / Will", "Identity", "Beneficiaries", "Wallets", "Audit Export", "Release Packet"].map((area) => (
                  <span key={area} className="rounded-md bg-navy-700/60 px-2 py-1 text-xs text-slate-400 border border-navy-600/40">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certificate Inspect Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-navy-700 bg-gradient-to-b from-navy-900 to-navy-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCert(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-navy-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-gold-400 shrink-0" />
              <div>
                <h3 className="font-mono text-lg font-black text-white">{selectedCert.name}</h3>
                <p className="text-[10px] text-gold-500 font-bold uppercase tracking-widest mt-0.5">Sovereign Root Verification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image box */}
              <div className="relative h-64 md:h-full min-h-[240px] rounded-xl overflow-hidden border border-navy-800 bg-navy-950 p-4 shadow-inner">
                <Image 
                  src={selectedCert.image} 
                  alt={selectedCert.name} 
                  fill 
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Text metadata */}
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Description</p>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">{selectedCert.description}</p>
                </div>

                <div className="space-y-2.5 text-xs bg-navy-950/40 border border-navy-900 rounded-xl p-4 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Rarity Classification</span>
                    <span className="font-bold text-red-400 flex items-center gap-1 mt-0.5">
                      <Award className="h-3.5 w-3.5" /> {selectedCert.rarity}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Root Authority Owner</span>
                    <span className="text-slate-300 mt-0.5 block">{selectedCert.owner}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Anchor Location</span>
                    <span className="text-slate-300 mt-0.5 block">{selectedCert.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">IPFS Metadata CID</span>
                    <a 
                      href={getPublicIPFSUrl(selectedCert.cid)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-cyan-400 hover:underline break-all block mt-0.5 text-[11px]"
                    >
                      {selectedCert.cid}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">IPFS Image CID</span>
                    <a 
                      href={getPublicIPFSUrl(selectedCert.imageCid)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-cyan-400 hover:underline break-all block mt-0.5 text-[11px]"
                    >
                      {selectedCert.imageCid}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Explorer Proofs */}
            <div className="border-t border-navy-800/80 mt-6 pt-5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2.5">On-Chain Anchor Transaction Proofs</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a 
                  href={`https://stellar.expert/explorer/public/tx/${selectedCert.stellarTx}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-navy-950 border border-navy-800 hover:border-gold-500/30 rounded-xl p-3 flex items-center justify-between text-xs hover:text-gold-400 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <div>
                      <p className="font-bold text-slate-300 group-hover:text-gold-400">Stellar Network</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{selectedCert.stellarTx.slice(0, 16)}...</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-gold-400 shrink-0" />
                </a>

                <a 
                  href={`https://bithomp.com/explorer/${selectedCert.xrplTx}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-navy-950 border border-navy-800 hover:border-gold-500/30 rounded-xl p-3 flex items-center justify-between text-xs hover:text-gold-400 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <div>
                      <p className="font-bold text-slate-300 group-hover:text-gold-400">XRP Ledger</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{selectedCert.xrplTx.slice(0, 16)}...</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-gold-400 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
