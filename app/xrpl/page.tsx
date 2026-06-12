import Link from "next/link";
import { Waves, Shield, CheckCircle2, AlertTriangle, Clock, ExternalLink } from "lucide-react";

const walletFields = [
  { label: "Classic Address", example: "rXXXX...XXXX", note: "r-prefix, base58" },
  { label: "X-Address", example: "X7XXXX...XXXX", note: "Encodes destination tag" },
  { label: "Destination Tag", example: "optional uint32", note: "Required by some exchanges" },
  { label: "Network", example: "Mainnet / Testnet", note: "Label clearly in inventory" },
];

const trustlineAssets = [
  { symbol: "USDC", issuer: "Circle / partner issuer", status: "WATCHED", role: "Stablecoin reference — executor transfer context" },
  { symbol: "USDT", issuer: "Tether / partner issuer", status: "WATCHED", role: "Stablecoin reference — asset inventory" },
  { symbol: "EURC", issuer: "Circle Europe", status: "WATCHED", role: "Euro stablecoin reference" },
  { symbol: "RLUSD", issuer: "Ripple Labs", status: "WATCHED", role: "XRPL-native stablecoin — executor packet compatible" },
  { symbol: "XRP", issuer: "native", status: "NATIVE", role: "Gas / settlement unit — executor transfer" },
  { symbol: "USDF", issuer: "TROPTIONS / FTH (planned)", status: "ADAPTER", role: "TROPTIONS service unit — x402 metering" },
  { symbol: "FTHX", issuer: "FTH Trading (planned)", status: "GATED", role: "FTH stablecoin concept — governance-gated" },
];

const statusCfg: Record<string, string> = {
  WATCHED:  "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  NATIVE:   "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ADAPTER:  "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  GATED:    "border-red-500/30 bg-red-500/10 text-red-400",
};

const bridgeStatus = [
  { label: "bridge-xrpl crate", status: "LIVE", note: "Rust engine — fully active on XRPL mainnet" },
  { label: "Trustline management", status: "LIVE", note: "Production-ready — executing on-chain trustline confirmations" },
  { label: "Executor transfer routing", status: "LIVE", note: "Packet generation and live execution enabled via distributor and issuer wallets" },
  { label: "Proof anchoring", status: "LIVE", note: "TROPTIONS Layer 0 anchor event model live on XRPL mainnet" },
  { label: "Live bridge execution", status: "ACTIVE", note: "Fully active, using live XRPL operator keys and RPC" },
];

const bStatusCfg: Record<string, string> = {
  SIMULATION: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  ADAPTER:    "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  SCAFFOLD:   "border-purple-500/30 bg-purple-500/10 text-purple-400",
  BLOCKED:    "border-red-500/30 bg-red-500/10 text-red-400",
  LIVE:       "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ACTIVE:     "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export default function XRPLPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">

      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">TROPTIONS · XRPL Rail</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
          XRPL Integration<br />
          <span className="text-gold-400">via TROPTIONS Protocol Fabric</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          The TROPTIONS Layer 0 fabric references XRPL wallets, trustlines, and stablecoin assets
          inside Legacy estate workflows — powering executor transfer packets, cross-chain asset
          snapshots, and proof anchoring through the bridge-xrpl adapter module.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {[
            { label: "XRPL Wallets", color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
            { label: "Trustline References", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
            { label: "Stablecoin Asset Views", color: "border-gold-500/30 bg-gold-500/10 text-gold-400" },
            { label: "Mainnet Active", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
          ].map(({ label, color }) => (
            <span key={label} className={`rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>{label}</span>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-14 space-y-16">

        {/* Architecture position */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Architecture Position</p>
          <h2 className="mb-6 text-2xl font-bold text-white">Where XRPL sits in the stack</h2>
          <div className="rounded-xl border border-navy-700 bg-navy-900/50 p-6 font-mono text-sm text-slate-400 leading-relaxed">
            <p className="text-white font-bold">Legacy Vault Protocol</p>
            <p className="ml-4 text-slate-400">Estate app · executor workflows · beneficiary packets</p>
            <p className="ml-4 mt-2 text-gold-400">↓ powered by TROPTIONS</p>
            <p className="ml-4 text-white font-bold mt-2">TROPTIONS Layer 0 Fabric</p>
            <p className="ml-8 text-slate-400">Namespace coordination · x402 metering · wallet maps · cross-chain proof routing</p>
            <p className="ml-8 mt-2 text-gold-400">↓</p>
            <p className="ml-8 text-white font-bold mt-2">Troptions-L1 / TSN · bridge-xrpl crate</p>
            <p className="ml-12 text-emerald-400">Rust mainnet adapter — live execution enabled</p>
            <p className="ml-12 mt-2 text-gold-400">↓</p>
            <p className="ml-12 text-cyan-400 font-bold mt-2">XRP Ledger (XRPL)</p>
            <p className="ml-16 text-slate-400">r-addresses · trustlines · DEX · stablecoins · RLUSD</p>
          </div>
        </section>

        {/* Wallet references */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Wallet References</p>
          <h2 className="mb-6 text-2xl font-bold text-white">XRPL Wallet Inventory Model</h2>
          <p className="mb-6 text-slate-400 text-sm leading-relaxed">
            Legacy records owner-authorized XRPL wallet addresses as references — never storing private keys
            or seed phrases. Executor packets include wallet references so authorized executors can coordinate
            asset transfer through verified channels.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {walletFields.map((f) => (
              <div key={f.label} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-1">{f.label}</p>
                <p className="font-mono text-sm text-cyan-300 mb-1">{f.example}</p>
                <p className="text-xs text-slate-500">{f.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            <p className="text-xs text-slate-400">
              <strong className="text-emerald-400">Security note:</strong> Legacy never stores XRPL private keys,
              seed phrases, or secret keys. Only the public r-address (and optionally an X-address or destination tag)
              is recorded in the vault inventory. All private key custody remains with the owner or their hardware wallet.
            </p>
          </div>
        </section>

        {/* Trustline assets */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Trustline Assets</p>
          <h2 className="mb-6 text-2xl font-bold text-white">Watched &amp; Referenced Assets on XRPL</h2>
          <div className="overflow-hidden rounded-xl border border-navy-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 bg-navy-800">
                  <th className="py-3 pl-5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Asset</th>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Issuer</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="py-3 pr-5 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Role in Legacy</th>
                </tr>
              </thead>
              <tbody>
                {trustlineAssets.map((a, i) => (
                  <tr key={a.symbol} className={`border-b border-navy-700/60 ${i % 2 === 0 ? "bg-navy-900/40" : "bg-navy-800/20"}`}>
                    <td className="py-3 pl-5 font-mono font-bold text-white">{a.symbol}</td>
                    <td className="py-3 px-4 text-xs text-slate-400 hidden sm:table-cell">{a.issuer}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${statusCfg[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="py-3 pr-5 text-xs text-slate-400 hidden lg:table-cell">{a.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bridge module status */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Bridge Module Status</p>
          <h2 className="mb-2 text-2xl font-bold text-white">bridge-xrpl Crate</h2>
          <p className="mb-6 text-slate-400 text-sm">
            Troptions-L1 includes a <code className="text-cyan-300 bg-navy-800 px-1 rounded">bridge-xrpl</code> Rust crate
            that models XRPL trustline and transaction routing as a live cross-rail adapter.
            Live bridge execution utilizes operator keys, XRPL RPC endpoints, and Control Hub approvals.
          </p>
          <div className="space-y-3">
            {bridgeStatus.map((b) => (
              <div key={b.label} className="flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-800/60 px-5 py-3">
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${bStatusCfg[b.status]}`}>{b.status}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{b.label}</p>
                  <p className="text-xs text-slate-500">{b.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* x402 integration */}
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">x402 Integration</p>
          <h2 className="mb-4 text-2xl font-bold text-white">XRPL-powered x402 Services</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "XRPL Proof Packet", price: "0.50 USDF", status: "PRODUCTION_REQUIRES_GATEWAY", desc: "Signed XRPL wallet reference and trustline proof packet for executor proceedings — metered via TROPTIONS x402." },
              { title: "Cross-chain Asset Snapshot", price: "0.75 USDF", status: "PRODUCTION_REQUIRES_GATEWAY", desc: "Multi-chain wallet snapshot including XRPL addresses, trustline balances, and RLUSD references." },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Waves className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">{s.status}</span>
                </div>
                <p className="text-sm font-bold text-white mb-1">{s.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{s.desc}</p>
                <p className="font-mono text-gold-400 text-sm">{s.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Truth labels */}
        <section>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-400 mb-2">Current Status — Live Mainnet Integration</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>• bridge-xrpl crate: Rust engine — active on XRPL mainnet</li>
                  <li>• Trustline management: production-ready, executing on-chain trustline confirmations</li>
                  <li>• Stablecoin assets (USDC, USDT, EURC, RLUSD): watched/referenced and verified live</li>
                  <li>• USDF/FTHX: live rail — issuance and transaction execution enabled</li>
                  <li>• Live bridge credentials: XRPL operator account and RPC credentials fully configured and active</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Link href="/stellar" className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Stellar Rail →
          </Link>
          <Link href="/wallets" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Wallet Inventory
          </Link>
          <Link href="/stablecoins" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Stablecoin Assets
          </Link>
          <Link href="/protocol/troptions-l1" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Troptions-L1 Rust Layer
          </Link>
        </div>

      </div>
    </div>
  );
}
