import Link from "next/link";
import { X402_SERVICES } from "@/lib/x402";

const mockUsage = [
  { service: "Executor Packet Export", namespace: "smithfamily.legacy", date: "2026-01-14", units: 1, total: "0.50 USDF", status: "COMPLETED" },
  { service: "Audit Log Export", namespace: "apexholdings.legacy", date: "2026-01-12", units: 3, total: "0.75 USDF", status: "COMPLETED" },
  { service: "Metered API Access", namespace: "founder-kevan.legacy", date: "2026-01-12", units: 42, total: "0.42 USDF", status: "COMPLETED" },
  { service: "Namespace Manifest Export", namespace: "doe-trust.legacy", date: "2026-01-10", units: 1, total: "0.25 USDF", status: "COMPLETED" },
  { service: "Beneficiary Packet Export", namespace: "smithfamily.legacy", date: "2026-01-09", units: 2, total: "1.00 USDF", status: "COMPLETED" },
];

export default function AdminX402Page() {
  const totalBilled = "2.92 USDF";
  const activeNamespaces = 4;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Header */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-16 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Operator Console</p>
        <h1 className="mx-auto max-w-3xl text-3xl font-bold text-white md:text-4xl">
          x402 Billing & Usage
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Track metered service usage, billing totals, and x402 gateway status across all namespaces.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
          LOCAL_ADAPTER mode — mock billing only
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-10">
        <div className="mx-auto max-w-4xl grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Billed (all time)", value: totalBilled },
            { label: "Active Namespaces", value: String(activeNamespaces) },
            { label: "Services Available", value: String(X402_SERVICES.length) },
            { label: "Gateway Status", value: "LOCAL ADAPTER" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-navy-700 bg-navy-800/60 p-4 text-center">
              <p className="text-xl font-bold text-gold-400 mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Usage log */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Usage History</p>
        <h2 className="mb-6 text-xl font-bold text-white">Recent x402 Transactions</h2>
        <div className="overflow-hidden rounded-xl border border-navy-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700 bg-navy-800">
                <th className="py-3 pl-5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Service</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Namespace</th>
                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Units</th>
                <th className="py-3 pr-5 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Charged</th>
              </tr>
            </thead>
            <tbody>
              {mockUsage.map((row, i) => (
                <tr key={i} className={`border-b border-navy-700/60 ${i % 2 === 0 ? "bg-navy-900/40" : "bg-navy-800/20"}`}>
                  <td className="py-3 pl-5 pr-4 font-medium text-slate-200 text-sm">{row.service}</td>
                  <td className="py-3 px-4 font-mono text-xs text-cyan-400">{row.namespace}</td>
                  <td className="py-3 px-4 text-center text-xs text-slate-400">{row.date}</td>
                  <td className="py-3 px-4 text-center text-xs text-slate-300">{row.units}</td>
                  <td className="py-3 pr-5 text-right font-mono text-xs text-gold-400">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Service catalog quick ref */}
      <section className="border-t border-navy-800 bg-navy-900 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-gold-500">Service Catalog</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {X402_SERVICES.map((svc) => (
              <div key={svc.id} className="rounded-lg border border-navy-700 bg-navy-800/40 p-3">
                <p className="font-semibold text-white text-xs mb-1">{svc.label}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gold-400 text-xs">{svc.unitPrice} {svc.currency}</span>
                  <span className="text-xs text-slate-500">{svc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nav */}
      <section className="px-6 py-12 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/x402" className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            x402 Overview →
          </Link>
          <Link href="/admin/audit" className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Audit Log
          </Link>
        </div>
      </section>
    </div>
  );
}
