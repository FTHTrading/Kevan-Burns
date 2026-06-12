"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet, Globe, Shield, Lock, AlertTriangle, CheckCircle2, Key, QrCode } from "lucide-react";
import QRCodeView from "@/app/components/QRCodeView";

type WalletStatus = "OWNER_AUTHORIZED" | "EXECUTOR_READY" | "BENEFICIARY_SCOPED" | "REFERENCE_ONLY" | "PRODUCTION_REQUIRES_KEYS";

const WS: Record<WalletStatus, string> = {
  OWNER_AUTHORIZED:          "border-gold-500/30 bg-gold-500/10 text-gold-400",
  EXECUTOR_READY:            "border-purple-500/30 bg-purple-500/10 text-purple-400",
  BENEFICIARY_SCOPED:        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  REFERENCE_ONLY:            "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  PRODUCTION_REQUIRES_KEYS:  "border-slate-500/30 bg-slate-500/10 text-slate-400",
};

const WALLET_TYPES = [
  {
    icon: <Shield className="h-5 w-5 text-gold-400" />,
    chain: "TROPTIONS / TSN",
    label: "TROPTIONS Wallet",
    desc: "Owner-registered TROPTIONS wallet address within the TSN identity model. Primary namespace owner identity.",
    custody: "Owner holds private key. Never stored in Legacy system.",
    executorReady: true,
    status: "OWNER_AUTHORIZED" as WalletStatus,
  },
  {
    icon: <Globe className="h-5 w-5 text-blue-400" />,
    chain: "XRPL",
    label: "XRPL Wallet Reference",
    desc: "XRP Ledger wallet address registered for trustline and cross-chain asset references. bridge-xrpl adapter routes proof packets.",
    custody: "Owner holds seed. Only public address stored in vault manifest.",
    executorReady: true,
    status: "REFERENCE_ONLY" as WalletStatus,
  },
  {
    icon: <Globe className="h-5 w-5 text-purple-400" />,
    chain: "Stellar",
    label: "Stellar Wallet Reference",
    desc: "Stellar public key registered for asset trustline references and cross-chain proof packets. bridge-stellar adapter handles routing.",
    custody: "Owner holds seed. Only public key stored in vault manifest.",
    executorReady: true,
    status: "REFERENCE_ONLY" as WalletStatus,
  },
  {
    icon: <Globe className="h-5 w-5 text-cyan-400" />,
    chain: "EVM (Ethereum/Polygon/Base)",
    label: "EVM Wallet Reference",
    desc: "Ethereum-compatible address for USDC, USDT, DAI, EURC holdings and DeFi asset references.",
    custody: "Owner holds seed phrase. Only public address stored in vault manifest.",
    executorReady: true,
    status: "REFERENCE_ONLY" as WalletStatus,
  },
  {
    icon: <Globe className="h-5 w-5 text-emerald-400" />,
    chain: "Solana",
    label: "Solana Wallet Reference",
    desc: "Solana public key for SPL token and NFT references. Executor packet includes Solana transfer instructions.",
    custody: "Owner holds seed phrase. Only public key stored in vault manifest.",
    executorReady: true,
    status: "REFERENCE_ONLY" as WalletStatus,
  },
  {
    icon: <Lock className="h-5 w-5 text-purple-400" />,
    chain: "All chains",
    label: "Executor Wallet Map",
    desc: "Executor-specific wallet references authorized to receive transfer instructions upon release. Multi-chain coverage.",
    custody: "Executor holds keys. Legacy generates signed transfer instruction packets only.",
    executorReady: true,
    status: "EXECUTOR_READY" as WalletStatus,
  },
  {
    icon: <Key className="h-5 w-5 text-emerald-400" />,
    chain: "All chains",
    label: "Beneficiary Wallet Map",
    desc: "Per-beneficiary wallet references for scoped access packets. Each beneficiary sees only their allocated wallets.",
    custody: "Beneficiary holds keys. Legacy generates scoped access packets only.",
    executorReady: false,
    status: "BENEFICIARY_SCOPED" as WalletStatus,
  },
];

const SECURITY = [
  "Raw seed phrases are never stored, collected, or transmitted by Legacy Vault Protocol",
  "Only public addresses / public keys are registered in vault manifests",
  "Private key discovery of unknown wallets is not performed",
  "Wallet maps are owner-authorized — only wallets you explicitly register appear",
  "All wallet references are encrypted client-side before IPFS storage",
  "Executor transfer instructions are generated as signed packets — not live on-chain transactions",
  "TROPTIONS x402 meters wallet snapshot generation — billed to the namespace",
];

export default function WalletsPage() {
  const [qrType, setQrType] = useState("evm");
  const [qrInput, setQrInput] = useState("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">

      {/* ── Hero ── */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Wallet Infrastructure</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          TROPTIONS{" "}
          <span className="text-gold-400">Wallet Model</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Legacy Vault Protocol registers owner, executor, and beneficiary wallet maps across
          all major chains through the TROPTIONS wallet identity model — without ever holding
          private keys, seeds, or sensitive credentials.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400">
            <Shield className="h-3 w-3" /> Owner-authorized only
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
            <Lock className="h-3 w-3" /> No seed storage
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Globe className="h-3 w-3" /> Multi-chain coverage
          </span>
        </div>
      </section>

      {/* ── Wallet type cards ── */}
      <section className="border-b border-navy-800 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Chain Coverage</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">Supported wallet types</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WALLET_TYPES.map((w) => (
              <div key={w.label} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="mt-0.5">{w.icon}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${WS[w.status]}`}>{w.status.replace(/_/g, " ")}</span>
                </div>
                <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-500">{w.chain}</p>
                <p className="mb-2 text-sm font-bold text-white">{w.label}</p>
                <p className="mb-3 text-xs leading-relaxed text-slate-500">{w.desc}</p>
                <div className="rounded-lg border border-navy-700 bg-navy-900/60 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Custody</p>
                  <p className="mt-0.5 text-xs text-slate-400">{w.custody}</p>
                </div>
                {w.executorReady && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-400">
                    <CheckCircle2 className="h-3 w-3" /> Included in executor packets
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive QR Code Generator ── */}
      <section className="border-b border-navy-800 bg-navy-900/30 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Utilities</p>
          <h2 className="mb-4 text-center text-2xl font-bold text-white">Address QR Generator</h2>
          <p className="mb-10 text-center text-sm text-slate-400 max-w-lg mx-auto">
            Generate secure, shareable QR codes for your wallets, namespace, or payment requests. Entirely client-side and private.
          </p>
          
          <div className="grid gap-8 md:grid-cols-2 items-center bg-navy-900/60 rounded-2xl border border-navy-850 p-6 md:p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">QR Target Format</label>
                <select
                  value={qrType}
                  onChange={(e) => {
                    setQrType(e.target.value);
                    if (e.target.value === "evm") setQrInput("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
                    else if (e.target.value === "solana") setQrInput("HN7cRh21AZv7P4KEPt17tgRPJ67Dvw621287RT");
                    else if (e.target.value === "xrpl") setQrInput("rPT1S4GAhVTED3A53t2C3n4n54t74a2C1");
                    else if (e.target.value === "stellar") setQrInput("GCO2S45F54FEDC3n4t2C3n4t2C3n4t2C3n4t2C3");
                    else if (e.target.value === "namespace") setQrInput("architect.legacy");
                  }}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-gold-500/50 outline-none"
                >
                  <option value="evm">EVM Address (Ethereum/Polygon/Base)</option>
                  <option value="solana">Solana Address</option>
                  <option value="xrpl">XRPL Address</option>
                  <option value="stellar">Stellar Public Key</option>
                  <option value="namespace">.legacy Namespace Address</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Wallet Address or Text</label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Enter address or text..."
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-gold-500/50 outline-none font-mono"
                />
              </div>

              <div className="rounded-lg border border-white/5 bg-navy-950/40 p-4 text-xs text-slate-500">
                <p className="font-semibold text-slate-400 mb-1">How it works:</p>
                <p className="leading-relaxed">
                  This tool generates a golden premium QR code linked to your public address. Scan with any wallet app to send funds or verify ownership. No keys are ever exposed or transmitted.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              {qrInput ? (
                <QRCodeView
                  data={qrInput}
                  label={`${qrType.toUpperCase()} Wallet QR`}
                  size={200}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-navy-750 bg-navy-900/20 text-slate-500 w-full max-w-sm aspect-square">
                  <QrCode className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-xs">Enter address to preview QR</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Security principles ── */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Security Model</p>
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Wallet security principles</h2>
          <div className="space-y-3">
            {SECURITY.map((s) => (
              <div key={s} className="flex items-start gap-3 rounded-lg border border-navy-700 bg-navy-800/60 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <p className="text-sm text-slate-300">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chain links ── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl flex flex-wrap justify-center gap-4">
          <Link href="/xrpl" className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-blue-500/40 hover:text-blue-400 transition-colors">
            XRPL Rail →
          </Link>
          <Link href="/stellar" className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-purple-500/40 hover:text-purple-400 transition-colors">
            Stellar Rail →
          </Link>
          <Link href="/stablecoins" className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Stablecoin Assets →
          </Link>
        </div>
      </section>

    </div>
  );
}
