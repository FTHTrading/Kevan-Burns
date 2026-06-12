import Link from "next/link";
import { Globe, Link as LinkIcon, FileText, Shield, ArrowRight } from "lucide-react";

const chains = [
  { name: "Ethereum", symbol: "ETH", color: "border-blue-500/40 text-blue-400", status: "Connector Planned", note: "ERC-20/721 asset snapshot, ENS name resolution, proof anchoring via bridge" },
  { name: "Base", symbol: "BASE", color: "border-blue-400/40 text-blue-300", status: "Connector Planned", note: "L2 low-cost wallet registry updates and executor settlement" },
  { name: "Polygon", symbol: "MATIC", color: "border-purple-500/40 text-purple-400", status: "Connector Planned", note: "Cross-chain proof relay for high-volume estate operations" },
  { name: "Solana", symbol: "SOL", color: "border-emerald-500/40 text-emerald-400", status: "Connector Planned", note: "SPL token inventory, NFT estate records, validator attestations" },
  { name: "XRPL", symbol: "XRP", color: "border-cyan-500/40 text-cyan-400", status: "Bridge Active (Apostle Chain)", note: "XRPL settlement bridge operational via Apostle Chain infrastructure" },
  { name: "Stellar", symbol: "XLM", color: "border-sky-500/40 text-sky-400", status: "Bridge Active (Apostle Chain)", note: "Stellar settlement and USDF stablecoin routing via Apostle Chain" },
  { name: "Bitcoin", symbol: "BTC", color: "border-orange-500/40 text-orange-400", status: "Registry Only", note: "P2PKH / P2WPKH address registry for estate inventory. No key handling." },
  { name: "Future Chains", symbol: "...", color: "border-slate-600/40 text-slate-400", status: "EVM-compatible via relayer", note: "Any EVM-compatible or IBC-compatible chain can be added via relayer adapter" },
];

const crossChainCapabilities = [
  {
    icon: <Globe className="h-5 w-5 text-gold-400" />,
    title: "Owner-Authorized Wallet Mapping",
    body: "Estate owners register their public wallet addresses per chain. No private keys, no seed phrases, no secret discovery. Owner consent required for every entry.",
  },
  {
    icon: <FileText className="h-5 w-5 text-cyan-400" />,
    title: "Asset Snapshot Generation",
    body: "Generate chain-specific asset inventory reports showing public balances, token holdings, NFT registries, and DeFi positions at a point in time.",
  },
  {
    icon: <LinkIcon className="h-5 w-5 text-purple-400" />,
    title: "Proof Anchoring to Layer 0",
    body: "Cross-chain wallet states are hashed and anchored to Legacy Layer 0 via the relayer node. Creates tamper-detectable estate snapshots.",
  },
  {
    icon: <Shield className="h-5 w-5 text-emerald-400" />,
    title: "Executor Transfer-Readiness Reports",
    body: "After release, executors receive chain-specific instructions listing registered wallets, relevant protocols, and authorized transfer steps.",
  },
  {
    icon: <ArrowRight className="h-5 w-5 text-blue-400" />,
    title: "External Settlement Instructions",
    body: "Beneficiary packets include chain-by-chain instructions for claiming assets. Legacy does not execute transfers — it provides the verified record.",
  },
];

export default function CrossChainPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Cross-Chain Architecture</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold text-white md:text-5xl leading-tight">
          Your digital estate spans<br />
          <span className="text-gold-400">every chain you use</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Legacy Vault Protocol is chain-agnostic by design. Register wallet addresses across any chain
          your estate uses — then generate verified inventory, proofs, and executor instructions.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-400">
          Important: Legacy discovers no wallets without owner authorization. Public addresses only.
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Cross-chain Capabilities</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">5 cross-chain functions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {crossChainCapabilities.map((cap) => (
              <div key={cap.title} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="mb-3">{cap.icon}</div>
                <p className="font-bold text-white text-sm mb-2">{cap.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chain grid */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Supported Chains</p>
        <h2 className="mb-10 text-center text-2xl font-bold text-white">8 chains in scope</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {chains.map((chain) => (
            <div key={chain.name} className={`rounded-xl border ${chain.color} bg-navy-800/40 p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-white text-sm">{chain.name}</span>
                  <span className="ml-2 text-xs font-mono text-slate-500">{chain.symbol}</span>
                </div>
                <span className={`text-xs font-semibold ${chain.color.split(" ")[1]}`}>{chain.status}</span>
              </div>
              <p className="text-xs text-slate-400">{chain.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture note */}
      <section className="border-t border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-navy-700 bg-navy-800/60 p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Architecture Note</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Legacy Layer 0&apos;s cross-chain relayer node handles proof routing between external chains and the
              namespace registry. For XRPL and Stellar, the existing Apostle Chain bridge infrastructure
              is leveraged. Ethereum, Base, Polygon, and Solana connectors are planned in the next protocol phase.
            </p>
            <p className="text-xs text-slate-500">
              Legacy does not custody assets on any external chain. It provides the registry, the proof, and the
              executor instructions. Asset transfers are the responsibility of the authorized executor and applicable law.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-14 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/vault/wallets" className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Register Wallets →
          </Link>
          <Link href="/layer0" className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Layer 0 Design
          </Link>
        </div>
      </section>
    </div>
  );
}
