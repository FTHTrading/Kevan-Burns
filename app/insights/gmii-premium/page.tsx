"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, Lock, Unlock, Activity, Sparkles, AlertTriangle, 
  ArrowLeft, Coins, TrendingUp, RefreshCw, BarChart2
} from "lucide-react";
import { UnlockPremiumAccess } from "@/app/components/lit/UnlockPremiumAccess";

interface Alert {
  id: number;
  title: string;
  timestamp: string;
  severity: string;
  content: string;
}

interface Metrics {
  volume24h: string;
  activeArbitrageRoutes: number;
  averageYieldBps: number;
  systemHealth: string;
}

export default function GmiiPremiumInsights() {
  const [hasAccess, setHasAccess] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<string>("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function verifyAndLoad(token: string) {
    try {
      const res = await fetch("/api/gated/insight", {
        method: "GET",
        headers: {
          "x-lit-jwt": token,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setHasAccess(true);
        setInsights(data.content);
        setAlerts(data.alerts || []);
        setMetrics(data.metrics || null);
      } else {
        setHasAccess(false);
        setError(data.error || "Failed to retrieve gated insights.");
        localStorage.removeItem("lit_jwt");
      }
    } catch (err: any) {
      setError("Network error reading gated content.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const savedJwt = localStorage.getItem("lit_jwt");
    if (savedJwt) {
      setJwt(savedJwt);
      verifyAndLoad(savedJwt);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAccessGranted = (newJwt: string) => {
    setJwt(newJwt);
    setIsLoading(true);
    verifyAndLoad(newJwt);
  };

  const handleRefresh = async () => {
    if (!jwt) return;
    setIsRefreshing(true);
    await verifyAndLoad(jwt);
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 text-slate-200 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gold-500 border-t-transparent" />
        <p className="text-sm font-bold text-slate-400">Verifying session via Lit Protocol...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 font-sans relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,160,23,0.06),transparent)] pointer-events-none" />

      {/* Top Navigation Strip */}
      <nav className="border-b border-navy-850 bg-navy-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/affiliate/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-gold-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gold-400" />
            <span className="text-sm font-bold tracking-tight text-white">GMIIE Gated Insights</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {!hasAccess ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 py-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/20 bg-gold-500/5 shadow-inner">
              <Lock className="h-8 w-8 text-gold-400 animate-pulse" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-white leading-tight">
                xxxiii.io <span className="text-gold-400">GMIIE Gated Panel</span>
              </h1>
              <p className="text-sm leading-relaxed text-slate-400 max-w-md mx-auto">
                Welcome to the premium macro intelligence feed. Exclusive liquidity forecasts and flash loan yields are secured by Lit Protocol access tokens.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-4">
              <UnlockPremiumAccess onAccessGranted={handleAccessGranted} />
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-fadeIn">
            {/* Header section with verified tag */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-850 pb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-2.5 py-0.5 text-[10px] font-bold text-gold-400">
                    <Unlock className="h-3 w-3" /> Secure Gating Verified
                  </span>
                </div>
                <h1 className="text-3xl font-black text-white mt-3">
                  xxxiii.io <span className="text-gold-400">GMIIE Macro Portal</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1.5">{insights}</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-navy-900 border border-navy-800 hover:border-navy-750 hover:bg-navy-850 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-gold-400" : ""}`} />
                  Refresh Signals
                </button>
              </div>
            </div>

            {/* Metrics cards grid */}
            {metrics && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "24h Volume Screened", value: metrics.volume24h, icon: <TrendingUp className="h-5 w-5 text-emerald-400" />, desc: "Total bridge volume indexed" },
                  { label: "Active Arbitrage Routes", value: metrics.activeArbitrageRoutes, icon: <Activity className="h-5 w-5 text-cyan-400" />, desc: "Real-time routing options" },
                  { label: "Average Route Yield", value: `${metrics.averageYieldBps} bps`, icon: <Coins className="h-5 w-5 text-gold-400" />, desc: "Platform net arbitrage return" },
                  { label: "System Health Rate", value: metrics.systemHealth, icon: <Sparkles className="h-5 w-5 text-purple-400" />, desc: "Edge routing network uptime" },
                ].map((m) => (
                  <div key={m.label} className="rounded-2xl border border-navy-800 bg-navy-900/40 p-6 shadow-xl backdrop-blur-md hover:border-navy-750 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{m.label}</p>
                      <div className="p-2 rounded-lg bg-navy-950 border border-navy-800">{m.icon}</div>
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight">{m.value}</p>
                    <p className="text-[10px] text-slate-400 mt-2">{m.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Main Content Areas */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Alert Feed List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <BarChart2 className="h-4.5 w-4.5 text-gold-400" /> Active Yield & Arbitrage Signals
                </h3>

                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6 relative overflow-hidden shadow-xl hover:border-navy-750 transition-all">
                      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                        alert.severity === "HIGH" ? "bg-red-500" :
                        alert.severity === "MEDIUM" ? "bg-yellow-500" :
                        "bg-cyan-500"
                      }`} />
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3 pl-2">
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-tight">{alert.title}</h4>
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
              </div>

              {/* Sidebar Info/Policy panel */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-navy-800 bg-navy-900/40 p-6 shadow-xl backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white mb-3">Lit Gating Mechanics</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Access to these reports is validated at the edge using the Lit Protocol network. 
                    The network verifies your wallet owns a Soulbound **AffiliateBadge NFT** (or is whitelisted) 
                    and signs a short-lived cryptographically secure JWT session token stored in your browser.
                  </p>
                  <div className="border-t border-navy-800 mt-4 pt-4 text-xs font-mono text-cyan-400">
                    <span className="block text-[10px] uppercase text-slate-500 font-sans">Active Session Key</span>
                    <span className="truncate block mt-1 select-all">{jwt ? `${jwt.slice(0, 20)}...${jwt.slice(-20)}` : "None"}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-gold-500/20 bg-gold-500/5 p-6 shadow-xl backdrop-blur-md">
                  <h3 className="text-sm font-bold text-gold-400 mb-2">Alpha Distribution Alert</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    All GMIIE alpha feeds are strictly confidential and encrypted. Sharing or redistributing these feeds to non-gated users is a direct violation of the affiliate community guidelines.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer footer */}
            <div className="text-center text-[10px] text-slate-500 border-t border-navy-850 pt-6">
              © 2026 Troptions Unity & FlashRouter Labs. Gated content delivered compliance-screened. All forecasts represent mathematical simulations.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
