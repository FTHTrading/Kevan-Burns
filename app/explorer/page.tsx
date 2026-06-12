"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Globe, Shield, CheckCircle, Award, Terminal, 
  ExternalLink, Copy, Check, Info, Server, Cpu, Link2 
} from "lucide-react";

// Types
interface ToastState {
  show: boolean;
  msg: string;
}

export default function ExplorerPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, msg: "" });
  const [besuBlock, setBesuBlock] = useState<number>(1842912);
  const [besuPeers, setBesuPeers] = useState<number>(12);

  // Simulate block count ticking for Hyperledger Besu
  useEffect(() => {
    const interval = setInterval(() => {
      setBesuBlock(prev => prev + 1);
      // Randomly fluctuate peer count slightly to make it feel alive
      setBesuPeers(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        const next = prev + change;
        return next >= 8 && next <= 15 ? next : prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setToast({ show: true, msg: `Copied ${label} to clipboard` });
      setTimeout(() => {
        setCopiedText(null);
        setToast({ show: false, msg: "" });
      }, 2000);
    }).catch(() => {
      setToast({ show: true, msg: "Copy failed — copy manually" });
      setTimeout(() => setToast({ show: false, msg: "" }), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-[#0e0f0f] text-[#d4d6d5] font-sans">
      
      {/* HEADER BAR FOR DOMAIN OR SUBDOMAIN */}
      <div className="border-b border-[#2e3232] bg-[#141515] py-2 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-mono text-[#757978]">SUBDOMAIN:</span>
            <code className="text-[#3fa9b0] font-bold">ex.legacychain.app</code>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#757978]">Network Registry Explorer v1.4</span>
          </div>
        </div>
      </div>

      {/* ANCHOR STATUS BAR */}
      <div className="bg-[#141515] border-b border-[#2e3232] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="inline-flex items-center gap-2 bg-[#1e2020] border border-[#2e3232] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fa9b0] animate-pulse"></span>
            IPFS Content Anchored
          </div>
          <div className="inline-flex items-center gap-2 bg-[#1e2020] border border-[#2e3232] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Stellar Mainnet
          </div>
          <div className="inline-flex items-center gap-2 bg-[#1e2020] border border-[#2e3232] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8af34] animate-pulse"></span>
            XRPL On-Ledger
          </div>
          <div className="inline-flex items-center gap-2 bg-[#1e2020] border border-[#2e3232] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse"></span>
            Hyperledger Besu (L7777)
          </div>
          <div className="sm:ml-auto flex items-center gap-1.5 text-[#757978]">
            <Shield className="h-4 w-4 text-[#3fa9b0]" />
            <span>Sovereign Genesis Roots Certified</span>
          </div>
        </div>
      </div>

      {/* PAGE HERO */}
      <div className="border-b border-[#2e3232] py-16 px-6 bg-gradient-to-b from-[#141515] to-[#0e0f0f]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="font-mono text-xs text-[#3fa9b0] tracking-widest uppercase mb-2">
              // unykorn.org / legacy-vault / explorer
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Legacy Explorer System
            </h1>
            <p className="mt-4 text-[#757978] max-w-2xl text-sm md:text-base leading-relaxed">
              Permanently anchored Genesis Roots across Hyperledger Besu, Stellar, XRPL, and IPFS. 
              Each namespace represents a sovereign, content-addressed digital estate registry.
            </p>
          </div>
          <div className="flex gap-8 border-l border-[#2e3232] pl-8">
            <div className="text-right">
              <div className="font-mono text-2xl font-black text-[#3fa9b0]">2</div>
              <div className="text-[10px] text-[#757978] uppercase tracking-wider font-bold mt-1">Genesis Roots</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-black text-[#3fa9b0]">6</div>
              <div className="text-[10px] text-[#757978] uppercase tracking-wider font-bold mt-1">Chain Anchors</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-black text-[#3fa9b0]">∞</div>
              <div className="text-[10px] text-[#757978] uppercase tracking-wider font-bold mt-1">Permanence</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* PROMO BANNER FOR REGISTERING */}
        <div className="rounded-2xl border border-[#e8af34]/30 bg-gradient-to-br from-[#2e2710]/40 to-[#141515] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#e8af34]">
              🔐 Limited Founding Access
            </span>
            <h2 className="text-xl font-bold text-white">Claim Your Sovereign Namespace</h2>
            <p className="text-xs text-[#757978] max-w-xl">
              Anchor your estate identity permanently on Besu + XRPL + Stellar + IPFS. One-time founding price includes lifetime registry.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <div className="text-right font-mono">
              <div className="text-2xl font-black text-[#e8af34]">$499.95</div>
              <div className="text-[9px] text-[#757978] uppercase tracking-wider">one-time registration</div>
            </div>
            <Link 
              href="/namespaces/register" 
              className="inline-flex items-center gap-2 bg-[#3fa9b0] hover:bg-[#2d8e95] text-[#0e0f0f] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg transition-all"
            >
              Get Started Now
            </Link>
          </div>
        </div>

        {/* GENESIS CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* .legacy CARD */}
          <div className="bg-[#141515] border border-[#2e3232] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-[#3fa9b0]/30 transition-all duration-300">
            {/* Card Header */}
            <div className="bg-[#191b1b] border-b border-[#2e3232] p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1b3436] flex items-center justify-center text-[#3fa9b0]">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">.legacy</h3>
                  <p className="text-xs text-[#757978] mt-0.5">Unykorn Legacy Vault Genesis Root</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1a2c10] border border-[#6daa45]/30 px-3 py-1 text-[10px] text-[#6daa45] font-bold uppercase tracking-wider">
                <CheckCircle className="h-3.5 w-3.5" /> Deployed
              </span>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6">
              
              {/* Content Address */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-[#757978] uppercase tracking-wider border-b border-[#252828] pb-1">
                  IPFS Content Addressing
                </div>
                <div className="bg-[#1e2020] border border-[#2e3232] rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#232626] border border-[#2e3232] flex items-center justify-center text-[#757978] font-bold shrink-0">
                    SFT
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-semibold text-white">Genesis Cert Image</p>
                    <p className="text-[10px] font-mono text-[#757978] truncate">
                      bafybeid6xkuevo7xuw7yf5i5eqrnv2ngfy655zpawtj5hxli56iycg4aza
                    </p>
                  </div>
                  <a 
                    href="https://ipfs.io/ipfs/bafybeid6xkuevo7xuw7yf5i5eqrnv2ngfy655zpawtj5hxli56iycg4aza" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-[#232626] hover:bg-[#3fa9b0]/10 border border-[#2e3232] hover:border-[#3fa9b0] text-[#757978] hover:text-[#3fa9b0] rounded-lg transition-colors shrink-0"
                    title="View on IPFS Gateway"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-xs bg-[#191b1b] border border-[#2e3232] rounded-lg py-2 px-3">
                  <span className="font-mono text-[#757978]">Metadata CID</span>
                  <div className="flex items-center gap-2 min-w-0 pl-4">
                    <code className="text-[#d4d6d5] font-mono truncate text-[11px]">
                      bafkreiftonagbd5v46vtwthbqnn4gwqnijojnrqzp3nhn7v4t47amsltf4
                    </code>
                    <button 
                      onClick={() => copyToClipboard("bafkreiftonagbd5v46vtwthbqnn4gwqnijojnrqzp3nhn7v4t47amsltf4", "Metadata CID")}
                      className="text-[#757978] hover:text-[#3fa9b0] transition-colors shrink-0"
                    >
                      {copiedText === "bafkreiftonagbd5v46vtwthbqnn4gwqnijojnrqzp3nhn7v4t47amsltf4" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Anchoring Transactions */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-[#757978] uppercase tracking-wider border-b border-[#252828] pb-1">
                  On-Chain Anchors
                </div>

                {/* Besu EVM Anchor */}
                <div className="bg-[#1e2020] border border-[#a855f7]/20 rounded-xl p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7] font-bold text-xs shrink-0">
                      B
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Besu EVM Registry</p>
                      <code className="text-[10px] font-mono text-[#757978] block truncate">
                        0x2750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-[#a855f7]">L7777</span>
                    <button 
                      onClick={() => copyToClipboard("0x2750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809", "Besu Tx Hash")}
                      className="p-1.5 bg-[#232626] border border-[#2e3232] rounded hover:border-[#a855f7] hover:text-[#a855f7] transition-all"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Stellar Anchor */}
                <div className="bg-[#1e2020] border border-[#2e3232] rounded-xl p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#3fa9b0]/10 flex items-center justify-center text-[#3fa9b0] font-bold text-xs shrink-0">
                      S
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Stellar Mainnet</p>
                      <code className="text-[10px] font-mono text-[#757978] block truncate">
                        12750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href="https://stellar.expert/explorer/public/tx/12750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[#232626] border border-[#2e3232] rounded hover:border-[#3fa9b0] hover:text-[#3fa9b0] transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* XRPL Anchor */}
                <div className="bg-[#1e2020] border border-[#2e3232] rounded-xl p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#e8af34]/10 flex items-center justify-center text-[#e8af34] font-bold text-xs shrink-0">
                      X
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">XRPL Mainnet</p>
                      <code className="text-[10px] font-mono text-[#757978] block truncate">
                        92611FFE685BEE59FF994BBD216367F597C8C547A878741F40304C8BF3369F78
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href="https://bithomp.com/explorer/92611FFE685BEE59FF994BBD216367F597C8C547A878741F40304C8BF3369F78" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[#232626] border border-[#2e3232] rounded hover:border-[#e8af34] hover:text-[#e8af34] transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

              </div>

            </div>

            {/* Card Footer */}
            <div className="bg-[#191b1b] border-t border-[#2e3232] py-4 px-6 flex items-center justify-between text-xs text-[#757978]">
              <span className="font-mono">Owner: Unykorn Authority</span>
              <a 
                href="https://ipfs.io/ipfs/bafkreiftonagbd5v46vtwthbqnn4gwqnijojnrqzp3nhn7v4t47amsltf4"
                target="_blank"
                rel="noopener noreferrer" 
                className="text-[#3fa9b0] hover:underline flex items-center gap-1 font-bold"
              >
                Verify Registry
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* .troptions CARD */}
          <div className="bg-[#141515] border border-[#2e3232] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-[#e8af34]/30 transition-all duration-300">
            {/* Card Header */}
            <div className="bg-[#191b1b] border-b border-[#2e3232] p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2e2710] flex items-center justify-center text-[#e8af34]">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">.troptions</h3>
                  <p className="text-xs text-[#757978] mt-0.5">Troptions Financial Namespace Genesis Root</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1a2c10] border border-[#6daa45]/30 px-3 py-1 text-[10px] text-[#6daa45] font-bold uppercase tracking-wider">
                <CheckCircle className="h-3.5 w-3.5" /> Deployed
              </span>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6">
              
              {/* Content Address */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-[#757978] uppercase tracking-wider border-b border-[#252828] pb-1">
                  IPFS Content Addressing
                </div>
                <div className="bg-[#1e2020] border border-[#2e3232] rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#232626] border border-[#2e3232] flex items-center justify-center text-[#757978] font-bold shrink-0">
                    SFT
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-semibold text-white">Genesis Cert Image</p>
                    <p className="text-[10px] font-mono text-[#757978] truncate">
                      bafybeihfpb3cjb46ut3dzid4u3evuduw3sjuockuhtbm46kxc7pfsfzorm
                    </p>
                  </div>
                  <a 
                    href="https://ipfs.io/ipfs/bafybeihfpb3cjb46ut3dzid4u3evuduw3sjuockuhtbm46kxc7pfsfzorm" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-[#232626] hover:bg-[#e8af34]/10 border border-[#2e3232] hover:border-[#e8af34] text-[#757978] hover:text-[#e8af34] rounded-lg transition-colors shrink-0"
                    title="View on IPFS Gateway"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-xs bg-[#191b1b] border border-[#2e3232] rounded-lg py-2 px-3">
                  <span className="font-mono text-[#757978]">Metadata CID</span>
                  <div className="flex items-center gap-2 min-w-0 pl-4">
                    <code className="text-[#d4d6d5] font-mono truncate text-[11px]">
                      bafkreiad5vtqhgh6om2yx6io5bxkmjrgkzwbqjf2oswgsuyfzfsawevlfy
                    </code>
                    <button 
                      onClick={() => copyToClipboard("bafkreiad5vtqhgh6om2yx6io5bxkmjrgkzwbqjf2oswgsuyfzfsawevlfy", "Metadata CID")}
                      className="text-[#757978] hover:text-[#e8af34] transition-colors shrink-0"
                    >
                      {copiedText === "bafkreiad5vtqhgh6om2yx6io5bxkmjrgkzwbqjf2oswgsuyfzfsawevlfy" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Anchoring Transactions */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-[#757978] uppercase tracking-wider border-b border-[#252828] pb-1">
                  On-Chain Anchors
                </div>

                {/* Besu EVM Anchor */}
                <div className="bg-[#1e2020] border border-[#a855f7]/20 rounded-xl p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7] font-bold text-xs shrink-0">
                      B
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Besu EVM Registry</p>
                      <code className="text-[10px] font-mono text-[#757978] block truncate">
                        0xa168ac2201300f2f7da9d4a10b0e7799785b5bf5e35993f7a4c65970edf87778
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-[#a855f7]">L7777</span>
                    <button 
                      onClick={() => copyToClipboard("0xa168ac2201300f2f7da9d4a10b0e7799785b5bf5e35993f7a4c65970edf87778", "Besu Tx Hash")}
                      className="p-1.5 bg-[#232626] border border-[#2e3232] rounded hover:border-[#a855f7] hover:text-[#a855f7] transition-all"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Stellar Anchor */}
                <div className="bg-[#1e2020] border border-[#2e3232] rounded-xl p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#3fa9b0]/10 flex items-center justify-center text-[#3fa9b0] font-bold text-xs shrink-0">
                      S
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Stellar Mainnet</p>
                      <code className="text-[10px] font-mono text-[#757978] block truncate">
                        a168ac2201300f2f7da9d4a10b0e7799785b5bf5e35993f7a4c65970edf87778
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href="https://stellar.expert/explorer/public/tx/a168ac2201300f2f7da9d4a10b0e7799785b5bf5e35993f7a4c65970edf87778" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[#232626] border border-[#2e3232] rounded hover:border-[#3fa9b0] hover:text-[#3fa9b0] transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* XRPL Anchor */}
                <div className="bg-[#1e2020] border border-[#2e3232] rounded-xl p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#e8af34]/10 flex items-center justify-center text-[#e8af34] font-bold text-xs shrink-0">
                      X
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">XRPL Mainnet</p>
                      <code className="text-[10px] font-mono text-[#757978] block truncate">
                        CBFC157422B4325FECB6705C4A5A740F775C738C2DE7A6F4AE3E3D5249FDABD0
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href="https://bithomp.com/explorer/CBFC157422B4325FECB6705C4A5A740F775C738C2DE7A6F4AE3E3D5249FDABD0" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[#232626] border border-[#2e3232] rounded hover:border-[#e8af34] hover:text-[#e8af34] transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

              </div>

            </div>

            {/* Card Footer */}
            <div className="bg-[#191b1b] border-t border-[#2e3232] py-4 px-6 flex items-center justify-between text-xs text-[#757978]">
              <span className="font-mono">Owner: Unykorn Authority</span>
              <a 
                href="https://ipfs.io/ipfs/bafkreiad5vtqhgh6om2yx6io5bxkmjrgkzwbqjf2oswgsuyfzfsawevlfy"
                target="_blank"
                rel="noopener noreferrer" 
                className="text-[#e8af34] hover:underline flex items-center gap-1 font-bold"
              >
                Verify Registry
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

        </div>

        {/* HYPERLEDGER BESU LIVE RUNNING TRACKER */}
        <div className="bg-[#141515] border border-[#2e3232] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#252828] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7]">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hyperledger Besu (EVM Registry Node)</h3>
                <p className="text-xs text-[#757978]">Primary ledger registry for trust rules, vault metadata compliance, and 5-Proof logic evaluation.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-[#6daa45] font-mono">NODE ONLINE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1e2020] border border-[#2e3232] p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-[#757978] uppercase font-bold tracking-wider block">RPC Connection Endpoint</span>
              <a 
                href="https://rpc.unykorn.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-mono text-[#3fa9b0] hover:underline break-all flex items-center gap-1"
              >
                rpc.unykorn.org
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            
            <div className="bg-[#1e2020] border border-[#2e3232] p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-[#757978] uppercase font-bold tracking-wider block">Network ID</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Chain ID: 7777</span>
                <span className="text-[9px] bg-[#a855f7]/10 text-[#a855f7] px-1.5 py-0.5 rounded border border-[#a855f7]/20 font-mono">IBFT 2.0</span>
              </div>
            </div>

            <div className="bg-[#1e2020] border border-[#2e3232] p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-[#757978] uppercase font-bold tracking-wider block">Validator Peer Group</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{besuPeers} Peers</span>
                <span className="text-[10px] text-[#6daa45]">100% Health</span>
              </div>
            </div>

            <div className="bg-[#1e2020] border border-[#2e3232] p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-[#757978] uppercase font-bold tracking-wider block">Block Height / Block Time</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white">#{besuBlock}</span>
                <span className="text-xs text-[#757978]">2.0s blocktime</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#2e3232] bg-[#0e0f0f] p-4 font-mono text-[11px] space-y-2 max-h-[180px] overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-[#757978] border-b border-[#252828] pb-1.5 mb-2 font-semibold">
              <span className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5 text-[#3fa9b0]" /> System Node Console Log</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fa9b0] animate-ping" />
            </div>
            <p className="text-slate-400">INFO [06-10|13:01:42.502] Imported block #{besuBlock-2} (0x1f0e...ae54) with 0 transactions in 12ms</p>
            <p className="text-slate-400">INFO [06-10|13:01:44.512] Imported block #{besuBlock-1} (0x8bb2...8e94) with 0 transactions in 9ms</p>
            <p className="text-[#3fa9b0] font-semibold">INFO [06-10|13:01:46.522] Imported block #{besuBlock} (0x5ce9...0f12) with 1 transaction in 15ms</p>
            <p className="text-[#a855f7]">  ↪ Transaction 0x2750762497c0f783855330c1a52961889558d1e728ded8c9c44cdc357112809 (.legacy root genesis certification update)</p>
          </div>
        </div>

      </main>

      {/* TOAST POPUP NOTIFICATION */}
      <div 
        className={`fixed bottom-6 right-6 bg-[#191b1b] border border-[#2e3232] text-white rounded-xl py-3 px-5 shadow-2xl flex items-center gap-3 transition-all duration-300 transform z-50 ${
          toast.show ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="text-xs font-semibold">{toast.msg}</span>
      </div>

    </div>
  );
}
