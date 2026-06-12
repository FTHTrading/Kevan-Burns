import Link from "next/link";
import { Users, FileText, CheckCircle } from "lucide-react";

export default function ExecutorHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Executor Portal</h1>
        <p className="text-sm text-slate-400 mt-1">
          If you are a named executor for a Legacy Vault Protocol estate, use this portal
          to submit a release claim and track the verification process.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/executor/claim" className="vault-card hover:border-gold-500/30 transition-colors group">
          <FileText className="h-6 w-6 text-gold-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-gold-400 transition-colors mb-1">Submit Estate Claim</h3>
          <p className="text-xs text-slate-400">Begin the formal estate release process for a vault you are named as executor.</p>
        </Link>
        <Link href="/executor/review" className="vault-card hover:border-cyan-500/30 transition-colors group">
          <CheckCircle className="h-6 w-6 text-cyan-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors mb-1">Review Active Claims</h3>
          <p className="text-xs text-slate-400">Track the status of submitted claims and pending verification steps.</p>
        </Link>
      </div>

      <div className="vault-card space-y-4">
        <h2 className="section-header">Release Process Overview</h2>
        <div className="space-y-3">
          {[
            ["1. Submit Claim", "Identify yourself and the vault. Complete identity verification."],
            ["2. Upload Death Certificate", "Provide a certified death certificate or court authority document."],
            ["3. Attorney Review", "An attorney or notary must attest your legal authority."],
            ["4. Guardian Approvals", "Named guardians must meet the quorum threshold."],
            ["5. Waiting Period", "A dispute window opens. No action required unless a dispute is filed."],
            ["6. Access Granted", "After administrator approval, you receive scoped access to the estate inventory."],
          ].map(([step, desc]) => (
            <div key={step} className="flex gap-4">
              <p className="text-xs font-semibold text-gold-400 shrink-0 w-40">{step}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Important:</strong> This portal supports the technical workflow only.
        Legal transfer of assets requires applicable estate law authority, probate proceedings where required,
        and compliance with each financial platform's own bereavement/estate processes. Always involve a qualified attorney.
      </div>
    </div>
  );
}
