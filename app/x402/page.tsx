import Link from "next/link";
import { Zap, CreditCard, FileText, Shield, Globe, ArrowRight, Cpu } from "lucide-react";
import { X402_SERVICES } from "@/lib/x402";

const useCases = [
  {
    icon: <CreditCard className="h-5 w-5 text-gold-400" />,
    title: "API Metering",
    detail: "Machine-payable access to batch vault operations, programmatic queries, and automated estate workflows. Pay per call.",
  },
  {
    icon: <FileText className="h-5 w-5 text-cyan-400" />,
    title: "Downloadable Artifact Generation",
    detail: "Executor packets, beneficiary packets, compliance reports, and audit exports are metered via x402. Each generation costs USDF.",
  },
  {
    icon: <Shield className="h-5 w-5 text-purple-400" />,
    title: "Notarization Requests",
    detail: "Submit documents into the attorney / notary attestation workflow. x402 handles routing, billing, and proof-of-payment recording.",
  },
  {
    icon: <Globe className="h-5 w-5 text-blue-400" />,
    title: "Cross-chain Report Generation",
    detail: "Pulling multi-chain wallet snapshots requires data coordination fees across relayer nodes. x402 handles the settlement.",
  },
  {
    icon: <ArrowRight className="h-5 w-5 text-emerald-400" />,
    title: "Namespace-level Service Billing",
    detail: "Each namespace tracks its x402 usage independently. Operators can set spending limits, view usage history, and export billing summaries.",
  },
  {
    icon: <Zap className="h-5 w-5 text-yellow-400" />,
    title: "Premium Operator Actions",
    detail: "Certain high-authority actions — release policy overrides, multi-namespace batch operations, compliance audit triggers — are x402-gated.",
  },
  {
    icon: <Cpu className="h-5 w-5 text-gold-400" />,
    title: "TROPTIONS Wallet & Stablecoin Reports",
    detail: "Wallet snapshots across TROPTIONS, XRPL, Stellar, EVM, and Solana rails — plus stablecoin asset reference exports (USDC, USDT, DAI, EURC, USDF) — are metered via TROPTIONS x402.",
  },
];

const statusColors: Record<string, string> = {
  LOCAL_ADAPTER: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
  X402_READY: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
  MOCK_BILLING: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
  TROPTIONS_POWERED: "text-gold-400 border-gold-500/20 bg-gold-500/5",
  LIVE_PAYMENT_DISABLED: "text-red-400 border-red-500/20 bg-red-500/5",
  PRODUCTION_REQUIRES_GATEWAY: "text-blue-400 border-blue-500/20 bg-blue-500/5",
};

export default function X402Page() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">TROPTIONS x402 Integration</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold text-white md:text-5xl leading-tight">
          Machine-payable protocol services<br />
          <span className="text-gold-400">powered by TROPTIONS x402</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          TROPTIONS x402 powers machine-payable Legacy services: executor packets, beneficiary packets,
          audit exports, compliance reports, cross-chain snapshots, namespace manifests, wallet snapshots,
          and premium operator actions — without centralized billing infrastructure.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">LOCAL_ADAPTER in dev</span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">X402_READY for metered API</span>
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">PRODUCTION_REQUIRES_GATEWAY for complex services</span>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-b border-navy-800 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Use Cases</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-white">What x402 powers in Legacy</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((uc) => (
              <div key={uc.title} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="mb-3">{uc.icon}</div>
                <p className="font-bold text-white text-sm mb-2">{uc.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{uc.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service catalog */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-gold-500">Service Catalog</p>
        <h2 className="mb-10 text-center text-2xl font-bold text-white">{X402_SERVICES.length} metered services</h2>
        <div className="overflow-hidden rounded-xl border border-navy-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700 bg-navy-800">
                <th className="py-3 pl-5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Service</th>
                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Price</th>
                <th className="py-3 pr-5 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {X402_SERVICES.map((svc, i) => (
                <tr key={svc.id} className={`border-b border-navy-700/60 ${i % 2 === 0 ? "bg-navy-900/40" : "bg-navy-800/20"}`}>
                  <td className="py-3 pl-5 pr-4">
                    <p className="font-medium text-white text-sm">{svc.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{svc.description}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-gold-400 text-sm">{svc.unitPrice} {svc.currency}</span>
                  </td>
                  <td className="py-3 pr-5 text-center">
                    <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${statusColors[svc.status]}`}>
                      {svc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          All prices in USDF (TROPTIONS service unit). Dev mode uses LOCAL_ADAPTER — no real payment processed. Production requires a TROPTIONS x402 gateway.
        </p>
      </section>

      {/* CTA */}
      <section className="border-t border-navy-800 px-6 py-14 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/downloads" className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Download Artifacts →
          </Link>
          <Link href="/admin/x402" className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Operator x402 Console
          </Link>
          <Link href="/troptions" className="rounded-lg border border-gold-500/40 px-6 py-3 text-sm font-semibold text-gold-400 hover:bg-gold-500/10 transition-colors">
            Powered by TROPTIONS →
          </Link>
        </div>
      </section>
    </div>
  );
}
