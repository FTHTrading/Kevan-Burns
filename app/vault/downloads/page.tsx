import Link from "next/link";
import { Download, FileText, Table, FileJson, Lock } from "lucide-react";

const vaultDownloads = [
  {
    icon: <FileText className="h-5 w-5 text-gold-400" />,
    name: "My Estate Summary",
    desc: "Your full vault overview: all assets, guardians, executor, and current release policy in one document.",
    format: "PDF",
    status: "Export Adapter",
  },
  {
    icon: <FileJson className="h-5 w-5 text-cyan-400" />,
    name: "Vault Manifest Snapshot",
    desc: "Signed JSON of your current vault manifest with IPFS CID and chain anchor hash for independent verification.",
    format: "JSON",
    status: "Export Adapter",
  },
  {
    icon: <Table className="h-5 w-5 text-blue-400" />,
    name: "Asset Inventory",
    desc: "Spreadsheet of all registered assets, wallets, documents, and categories in your vault.",
    format: "CSV",
    status: "Export Adapter",
  },
  {
    icon: <FileText className="h-5 w-5 text-purple-400" />,
    name: "Release Policy Snapshot",
    desc: "Your current release conditions, guardian quorum config, and waiting periods — formatted for attorney review.",
    format: "PDF",
    status: "Export Adapter",
  },
  {
    icon: <Table className="h-5 w-5 text-slate-400" />,
    name: "Audit Log",
    desc: "Your full vault audit history — all access, uploads, policy changes, and release events.",
    format: "CSV / JSON",
    status: "Export Adapter",
  },
  {
    icon: <FileText className="h-5 w-5 text-blue-300" />,
    name: "Cross-chain Wallet Summary",
    desc: "Report of all registered wallet addresses across every chain in your namespace, with proof anchor references.",
    format: "PDF",
    status: "Export Adapter",
  },
];

export default function VaultDownloadsPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Header */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/vault" className="text-xs text-slate-500 hover:text-slate-300">My Vault</Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-gold-500 font-semibold">Downloads</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Vault Downloads</h1>
          <p className="text-slate-400">
            Generate and download verified copies of your estate documents, asset inventory, audit history,
            and release configuration.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">All exports are scoped to your authenticated vault only</span>
          </div>
        </div>
      </section>

      {/* Download grid */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vaultDownloads.map((item) => (
            <div key={item.name} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
              <div className="mb-3 flex items-start justify-between">
                {item.icon}
                <span className="text-xs font-semibold text-yellow-400">{item.status}</span>
              </div>
              <p className="font-bold text-white text-sm mb-1">{item.name}</p>
              <p className="text-xs text-slate-500 mb-2">{item.format}</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.desc}</p>
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-navy-600 bg-navy-700/40 px-3 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" />
                Generate &amp; Download
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Nav */}
      <section className="border-t border-navy-800 px-6 py-10 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/vault" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            ← Back to Vault
          </Link>
          <Link href="/downloads" className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            All Export Types
          </Link>
        </div>
      </section>
    </div>
  );
}
