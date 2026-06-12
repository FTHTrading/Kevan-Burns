"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, Coins, Users, TrendingUp, Lock, Unlock, 
  ExternalLink, FileText, CheckCircle2, Activity, Sparkles, Copy, Check 
} from "lucide-react";
import QRCodeView from "@/app/components/QRCodeView";
import { UnlockPremiumAccess } from "@/app/components/lit/UnlockPremiumAccess";

interface ReferralStat {
  referredUser: string;
  status: string;
  date: string;
}

interface RewardStat {
  txHash: string;
  amount: string;
  currency: string;
  date: string;
}

const GMIIE_ALERTS = [
  {
    id: 1,
    title: "TSN Liquidity Spill Alert",
    timestamp: "10 mins ago",
    severity: "HIGH",
    content: "Macro signal indicators show a 14.8% volume spike in Polygon TSN pools. Recommended action: Adjust FlashRouter collateral ratio to 1.12x to capture immediate flash loan arbitrage yield."
  },
  {
    id: 2,
    title: "XRPL Trustline Rebalancing",
    timestamp: "2 hours ago",
    severity: "MEDIUM",
    content: "Ecosystem bridge adapters report elevated routing requests on XRPL gateway. Norcross digital vaults are processing automatic yield lockups."
  },
  {
    id: 3,
    title: "TROPTIONS Settlement Epoch Alert",
    timestamp: "5 hours ago",
    severity: "LOW",
    content: "Moltbot x402 payment gateway on Polygon has completed the epoch settlement. Yield payouts to Level 1 and Level 2 referrers have been routed."
  }
];

export default function AffiliateDashboard() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasBadge, setHasBadge] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "gated">("stats");

  const [stats, setStats] = useState({
    referralCode: "KB-LEGACY",
    referralUrl: "",
    activeReferrals: 0,
    volumeGenerated: "0 USDC",
    totalEarned: "0 USDC",
    pendingEarned: "0 USDC",
    referrals: [] as ReferralStat[],
    rewards: [] as RewardStat[],
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);

  async function fetchStats() {
    try {
      const res = await fetch("/api/affiliate/stats?userId=demo-user-id");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  async function handleConnectWallet() {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          return;
        }
      } catch (err) {
        console.error("MetaMask connection failed:", err);
      }
    }
    // Fallback to simulated connection for premium demo experience
    setWalletConnected(true);
    setWalletAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
  }

  async function handleVerifyBadge() {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await fetch("/api/gated/verify-affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: walletAddress,
          userId: "demo-user-id"
        })
      });

      const data = await res.json();

      if (data.access) {
        setJwt(data.jwt);
        setHasBadge(true);
        setActiveTab("gated");
      } else {
        setVerificationError(data.error || "Verification failed");
      }
    } catch (err: any) {
      setVerificationError("Connection error: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleClaimRewards() {
    setIsClaiming(true);
    setClaimTxHash(null);
    try {
      const res = await fetch("/api/affiliate/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user-id" }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimTxHash(data.txHash);
        await fetchStats();
      } else {
        alert(data.error || "Claim failed");
      }
    } catch (err: any) {
      alert("Claim request failed: " + err.message);
    } finally {
      setIsClaiming(false);
    }
  }

  async function handleCopyLink() {
    if (!stats.referralUrl) return;
    try {
      await navigator.clipboard.writeText(stats.referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Hero Header */}
      <section className="relative border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,160,23,0.05),transparent)] pointer-events-none" />
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Affiliate Portal</p>
        <h1 className="mx-auto max-w-4xl text-3xl font-black leading-tight text-white md:text-5xl">
          Partner <span className="text-gold-400">Dashboard</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-slate-400">
          Track referral earnings, manage your .legacy namespaces, and access token-gated GMIIE macro intelligence alerts.
        </p>

        {/* Tab Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={() => setActiveTab("stats")}
            className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
              activeTab === "stats" 
                ? "border-gold-500 bg-gold-500/10 text-gold-400" 
                : "border-navy-700 bg-navy-900/30 hover:border-navy-600 text-slate-400"
            }`}
          >
            Stats & Payouts
          </button>
          <button 
            onClick={() => setActiveTab("gated")}
            className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "gated" 
                ? "border-gold-500 bg-gold-500/10 text-gold-400" 
                : "border-navy-700 bg-navy-900/30 hover:border-navy-600 text-slate-400"
            }`}
          >
            {hasBadge ? <Unlock className="h-4 w-4 text-gold-400" /> : <Lock className="h-4 w-4" />}
            GMIIE Intelligence
          </button>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {activeTab === "stats" ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Active Referrals", value: loadingStats ? "..." : stats.activeReferrals, icon: <Users className="h-5 w-5 text-cyan-400" />, desc: "Converted vault users" },
                { label: "Volume Generated", value: loadingStats ? "..." : stats.volumeGenerated, icon: <TrendingUp className="h-5 w-5 text-emerald-400" />, desc: "Platform fees generated" },
                { label: "Total Earnings", value: loadingStats ? "..." : stats.totalEarned, icon: <Coins className="h-5 w-5 text-gold-400" />, desc: "Paid out rewards" },
                { label: "Affiliate Level", value: "Level 1 + 2", icon: <Shield className="h-5 w-5 text-purple-400" />, desc: "15% L1 + 5% L2 splits" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-navy-800 bg-navy-900/50 p-6 shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
                    <div className="p-2 rounded-lg bg-navy-950 border border-navy-800">{s.icon}</div>
                  </div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-2">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Claim Rewards Banner */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Coins className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pending Referral Rewards</h3>
                  <p className="text-xs text-slate-400">Available rewards for converted referrals: <strong className="text-emerald-400">{loadingStats ? "..." : stats.pendingEarned}</strong></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClaimRewards}
                  disabled={isClaiming || loadingStats || stats.pendingEarned === "0 USDC" || stats.pendingEarned === "0" || stats.pendingEarned === "0 USDC"}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                    stats.pendingEarned !== "0 USDC" && stats.pendingEarned !== "0" && !loadingStats
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                      : "bg-navy-800 text-slate-500 cursor-not-allowed border border-navy-700"
                  }`}
                >
                  {isClaiming ? "Processing Claim..." : "Claim Payout"}
                </button>
              </div>
            </div>

            {/* Claim Transaction Hash Notification */}
            {claimTxHash && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-xs text-emerald-400 flex items-center justify-between gap-4 shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Claim transaction executed successfully! Rewards routed to your wallet.</span>
                </div>
                <a 
                  href={`https://basescan.org/tx/${claimTxHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold underline flex items-center gap-1 hover:text-emerald-300 transition-colors shrink-0"
                >
                  View on Explorer <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* Link Sharing & Badge Verification Area */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Referral link creation */}
              <div className="rounded-2xl border border-navy-850 bg-navy-900/60 p-6 md:p-8 flex flex-col justify-between shadow-xl backdrop-blur-md">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-gold-400" />
                    <h3 className="text-lg font-bold text-white">Your Referral Link</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Share your unique link with clients or estates. When they register a namespace or activate a vault under this link, they are automatically bound to your wallet for native/ERC-20 commission payments.
                  </p>

                  <div className="flex gap-2 items-center bg-navy-950 border border-navy-800 rounded-xl p-2 font-mono text-xs text-cyan-400 select-all mb-6">
                    <span className="truncate flex-1 pl-2">{loadingStats ? "Generating link..." : stats.referralUrl}</span>
                    <button 
                      onClick={handleCopyLink}
                      disabled={loadingStats || !stats.referralUrl}
                      className="p-2 bg-navy-900 border border-navy-700 rounded-lg hover:bg-navy-800 transition-colors text-slate-300 disabled:opacity-40"
                    >
                      {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 border-t border-navy-800 pt-4 flex items-center justify-between">
                  <span>Referral Code: <strong className="text-gold-400 font-mono">{stats.referralCode}</strong></span>
                  <span>15% Commission Rate</span>
                </div>
              </div>

              {/* Lit Gating / Wallet Connection */}
              <div className="rounded-2xl border border-navy-850 bg-navy-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-gold-400" />
                  <h3 className="text-lg font-bold text-white">Affiliate Badge Verification</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Access to premium macro signals is token-gated. Connect your wallet to verify ownership of your **Soulbound Affiliate Badge NFT** via Lit Protocol.
                </p>

                {!walletConnected ? (
                  <button 
                    onClick={handleConnectWallet}
                    className="w-full btn-primary py-3 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Connect Web3 Wallet
                  </button>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-navy-950 border border-navy-800 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Connected Wallet</p>
                        <p className="text-xs font-mono text-cyan-400 mt-0.5">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    </div>

                    {hasBadge ? (
                      <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 px-4 py-3 flex items-center gap-3">
                        <Unlock className="h-5 w-5 text-gold-400 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-gold-400">Lit Token Gated Access Enabled</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Your Affiliate Badge NFT has been verified. GMIIE is unlocked.</p>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={handleVerifyBadge}
                        disabled={isVerifying}
                        className="w-full bg-gold-500 text-navy-950 hover:bg-gold-400 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isVerifying ? "Verifying..." : "Verify Affiliate Badge via Lit Protocol"}
                      </button>
                    )}

                    {verificationError && (
                      <p className="text-xs text-red-400 text-center font-semibold mt-2">{verificationError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Referrals list & payout lists */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Referrals list */}
              <div className="rounded-2xl border border-navy-850 bg-navy-900/60 p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-cyan-400" /> Recent Referrals
                </h3>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {loadingStats ? (
                    <p className="text-xs text-slate-500 text-center py-6">Loading referrals...</p>
                  ) : stats.referrals.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No referrals recorded yet.</p>
                  ) : (
                    stats.referrals.map((r, index) => (
                      <div key={r.referredUser + index} className="rounded-xl border border-navy-800 bg-navy-950/40 p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-200">{r.referredUser}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Namespace Owner</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                            r.status === "CONVERTED" 
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
                              : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {r.status}
                          </span>
                          <p className="text-[9px] text-slate-500 mt-1 font-mono">{r.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payouts list */}
              <div className="rounded-2xl border border-navy-850 bg-navy-900/60 p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Coins className="h-4.5 w-4.5 text-gold-400" /> Recent Payouts
                </h3>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {loadingStats ? (
                    <p className="text-xs text-slate-500 text-center py-6">Loading payouts...</p>
                  ) : stats.rewards.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No payouts settled yet.</p>
                  ) : (
                    stats.rewards.map((rw) => (
                      <div key={rw.txHash} className="rounded-xl border border-navy-800 bg-navy-950/40 p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-200">+{rw.amount} {rw.currency}</p>
                          <p className="text-[9px] text-cyan-500 mt-0.5 font-mono truncate max-w-[200px]" title={rw.txHash}>
                            Tx: {rw.txHash.slice(0, 10)}...{rw.txHash.slice(-10)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex rounded-full border border-gold-500/20 bg-gold-500/10 px-2 py-0.5 text-[9px] font-bold text-gold-400">
                            SETTLED
                          </span>
                          <p className="text-[9px] text-slate-500 mt-1 font-mono">{rw.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Split levels info */}
            <div className="rounded-2xl border border-navy-800 bg-navy-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-300 mb-2">How multi-level splits function:</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you refer someone directly, you receive Level 1 commissions (15% of platform setup fees). If that referrer is registered as an affiliate under another affiliate, the parent referrer automatically receives Level 2 commissions (5% of platform setup fees). All calculations are verified on-chain by the referral contract.
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* Gated content section */}
            {!hasBadge ? (
              <div className="max-w-xl mx-auto py-8">
                <UnlockPremiumAccess 
                  walletAddress={walletAddress}
                  isConnected={walletConnected}
                  onAccessGranted={(jwtToken) => {
                    setJwt(jwtToken);
                    setHasBadge(true);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
                <div className="rounded-2xl border border-gold-500/20 bg-gold-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
                      <Unlock className="h-6 w-6 text-gold-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">GMIIE Gated Access Verified</h3>
                      <p className="text-xs text-slate-400">Authenticated via Lit Protocol. Session active.</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-400">
                    <Sparkles className="h-3.5 w-3.5" /> Premium member
                  </span>
                </div>

                {/* Macro Alerts Feed */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-cyan-400" /> Real-time Macro Yield Signals
                  </h3>
                  
                  {GMIIE_ALERTS.map((alert) => (
                    <div key={alert.id} className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6 relative overflow-hidden shadow-xl backdrop-blur-md">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gold-500" />
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3 pl-2">
                        <div>
                          <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{alert.timestamp}</span>
                        </div>
                        <span className={`inline-flex rounded border px-2 py-0.5 text-[9px] font-bold ${
                          alert.severity === "HIGH" ? "border-red-500/30 bg-red-500/10 text-red-400" :
                          alert.severity === "MEDIUM" ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" :
                          "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        }`}>
                          {alert.severity} PRIORITY
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-400 pl-2">{alert.content}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-white/5 bg-navy-900/20 p-4 text-xs text-slate-500">
                  <strong className="text-slate-400">Macro Intelligence Policy:</strong> These signals represent algorithmic feed aggregations from the GMIIE pipeline on-chain. Do not redistribute. All operations should comply with local estate planning regulations.
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
