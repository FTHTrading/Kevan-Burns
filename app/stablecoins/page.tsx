import Link from "next/link";
import { Coins, Globe, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

type AssetStatus = "WATCHED" | "ADAPTER_READY" | "LOCAL_ADAPTER" | "PLANNED_GATED" | "SIMULATION_GATED";

const AS: Record<AssetStatus, { cls: string; label: string; icon: React.ReactNode }> = {
  WATCHED:          { cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", label: "Watched",          icon: <CheckCircle2 className="h-3 w-3" /> },
  ADAPTER_READY:    { cls: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",          label: "Adapter Ready",    icon: <Globe className="h-3 w-3" /> },
  LOCAL_ADAPTER:    { cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",    label: "Local Adapter",    icon: <Clock className="h-3 w-3" /> },
  PLANNED_GATED:    { cls: "border-amber-500/30 bg-amber-500/10 text-amber-400",       label: "Planned / Gated",  icon: <AlertTriangle className="h-3 w-3" /> },
  SIMULATION_GATED: { cls: "border-red-500/30 bg-red-500/10 text-red-400",             label: "Simulation Gated", icon: <XCircle className="h-3 w-3" /> },
};

function AssetBadge({ s }: { s: AssetStatus }) {
  const cfg = AS[s];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

const ASSETS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    color: "text-blue-400",
    rail: "Ethereum / Polygon / Solana / Base",
    category: "External stablecoin",
    role: "Executor packet asset reference, stablecoin report",
    custodyNote: "External asset — Legacy references balances only, does not hold or issue USDC",
    x402: true,
    executorIncluded: true,
    status: "WATCHED" as AssetStatus,
    issuanceLive: false,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    color: "text-emerald-400",
    rail: "Ethereum / Tron / Polygon",
    category: "External stablecoin",
    role: "Executor packet asset reference, stablecoin report",
    custodyNote: "External asset — Legacy references balances only, does not hold or issue USDT",
    x402: true,
    executorIncluded: true,
    status: "WATCHED" as AssetStatus,
    issuanceLive: false,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    color: "text-yellow-400",
    rail: "Ethereum / Polygon / Optimism",
    category: "Decentralized stablecoin",
    role: "Executor packet asset reference, stablecoin report",
    custodyNote: "External asset — Legacy references balances only, does not hold or issue DAI",
    x402: true,
    executorIncluded: true,
    status: "WATCHED" as AssetStatus,
    issuanceLive: false,
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    color: "text-blue-300",
    rail: "Ethereum / Avalanche / Stellar",
    category: "Euro stablecoin",
    role: "Euro-denominated asset reference, international estate proceedings",
    custodyNote: "External asset — Legacy references balances only, does not hold or issue EURC",
    x402: true,
    executorIncluded: true,
    status: "WATCHED" as AssetStatus,
    issuanceLive: false,
  },
  {
    symbol: "RLUSD",
    name: "Ripple USD",
    color: "text-cyan-400",
    rail: "XRPL / Ethereum",
    category: "XRPL-compatible stablecoin",
    role: "XRPL wallet stablecoin reference, bridge-xrpl proof packets",
    custodyNote: "Watched asset via XRPL bridge-xrpl adapter — simulation mode only",
    x402: true,
    executorIncluded: true,
    status: "ADAPTER_READY" as AssetStatus,
    issuanceLive: false,
  },
  {
    symbol: "USDF",
    name: "TROPTIONS USDF",
    color: "text-gold-400",
    rail: "TROPTIONS / TSN",
    category: "TROPTIONS protocol unit",
    role: "x402 service metering unit, Legacy stablecoin reference, executor packet",
    custodyNote: "TROPTIONS protocol unit. Local adapter in dev. Production requires TROPTIONS gateway.",
    x402: true,
    executorIncluded: true,
    status: "LOCAL_ADAPTER" as AssetStatus,
    issuanceLive: false,
  },
  {
    symbol: "FTHX",
    name: "FTH Stablecoin",
    color: "text-amber-400",
    rail: "TSN / Planned",
    category: "FTH concept stablecoin",
    role: "Future FTH ecosystem stablecoin reference",
    custodyNote: "Planned concept. Troptions-L1 stablecoin crate is scaffolded but issuance is GENIUS Act gated.",
    x402: false,
    executorIncluded: false,
    status: "SIMULATION_GATED" as AssetStatus,
    issuanceLive: false,
  },
  {
    symbol: "FTHG",
    name: "FTH Gold-Wrapped",
    color: "text-yellow-300",
    rail: "TSN / Planned",
    category: "Gold-backed concept",
    role: "Gold-wrapped concept token for RWA estate planning references",
    custodyNote: "Planned concept. Requires RWA registration, legal structure, and gold reserve proof.",
    x402: false,
    executorIncluded: false,
    status: "PLANNED_GATED" as AssetStatus,
    issuanceLive: false,
  },
];

export default function StablecoinsPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">

      {/* ── Hero ── */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Asset References</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          Stablecoin{" "}
          <span className="text-gold-400">Asset View</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Legacy Vault Protocol references major stablecoins and TROPTIONS-native assets across
          executor packets, beneficiary packets, stablecoin reports, and XRPL/Stellar proof packets.
          No stablecoin issuance is performed — balances are <em>referenced</em>, not held or managed.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Reference model — no custody
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
            <XCircle className="h-3 w-3" /> Issuance blocked — GENIUS Act gated
          </span>
        </div>
      </section>

      {/* ── Asset grid ── */}
      <section className="border-b border-navy-800 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Asset Registry</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">Supported stablecoin references</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ASSETS.map((a) => (
              <div key={a.symbol} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className={`text-2xl font-black ${a.color}`}>{a.symbol}</div>
                  <AssetBadge s={a.status} />
                </div>
                <p className="mb-0.5 text-xs font-medium text-slate-300">{a.name}</p>
                <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-600">{a.category}</p>
                <p className="mb-3 text-[10px] text-slate-500">{a.rail}</p>
                <div className="space-y-1.5">
                  <div className="rounded border border-navy-700 bg-navy-900/60 px-2.5 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Role in Legacy</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{a.role}</p>
                  </div>
                  <div className="rounded border border-navy-700 bg-navy-900/60 px-2.5 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Custody</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{a.custodyNote}</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {a.x402 && (
                      <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-1.5 py-0.5 text-[9px] font-semibold text-yellow-400">x402 unit</span>
                    )}
                    {a.executorIncluded && (
                      <span className="rounded-full border border-purple-500/20 bg-purple-500/5 px-1.5 py-0.5 text-[9px] font-semibold text-purple-400">executor packet</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full status table ── */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Summary Table</p>
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Stablecoin support model</h2>
          <div className="overflow-hidden rounded-xl border border-navy-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 bg-navy-800">
                  <th className="py-3 pl-5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Asset</th>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Role</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="py-3 pr-5 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Issuance</th>
                </tr>
              </thead>
              <tbody>
                {ASSETS.map((a, i) => (
                  <tr key={a.symbol} className={`border-b border-navy-700/60 ${i % 2 === 0 ? "bg-navy-900/40" : "bg-navy-800/20"}`}>
                    <td className="py-3 pl-5 pr-4">
                      <span className={`font-black text-sm ${a.color}`}>{a.symbol}</span>
                      <span className="ml-2 text-xs text-slate-500">{a.name}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">{a.role}</td>
                    <td className="py-3 px-4 text-center"><AssetBadge s={a.status} /></td>
                    <td className="py-3 pr-5 text-center">
                      <span className="text-[10px] font-semibold text-red-400">Blocked</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-slate-600">
            Legacy Vault Protocol does not issue, custody, or redeem any stablecoin. All references are for estate inventory and executor packet generation only.
          </p>
        </div>
      </section>

      {/* ── Nav ── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl flex flex-wrap justify-center gap-4">
          <Link href="/wallets" className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500/40 hover:text-gold-400 transition-colors">
            ← TROPTIONS Wallets
          </Link>
          <Link href="/xrpl" className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-blue-500/40 hover:text-blue-400 transition-colors">
            XRPL Rail →
          </Link>
          <Link href="/stellar" className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-purple-500/40 hover:text-purple-400 transition-colors">
            Stellar Rail →
          </Link>
        </div>
      </section>

    </div>
  );
}
