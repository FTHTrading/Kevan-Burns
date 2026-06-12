export const runtime = 'edge';

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function ExecutorReviewPage() {
  const claims = await prisma.releaseClaim.findMany({
    include: { vault: true, claimant: true },
    orderBy: { submittedAt: "desc" },
    take: 20,
  }).catch(() => []);

  const statusClass: Record<string, string> = {
    SUBMITTED: "status-pending",
    IDENTITY_VERIFIED: "status-pending",
    PROOF_UPLOADED: "status-pending",
    ATTORNEY_REVIEWED: "status-pending",
    GUARDIAN_QUORUM_MET: "status-pending",
    WAITING_PERIOD: "status-pending",
    APPROVED: "status-released",
    DENIED: "status-locked",
    DISPUTED: "status-disputed",
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Active Claims</h1>

      {claims.length === 0 ? (
        <div className="vault-card text-center py-12">
          <p className="text-slate-400 text-sm">No claims on record.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="vault-card space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{claim.vault.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Claimant: {claim.claimant.name ?? claim.claimant.email}</p>
                  <p className="text-xs text-slate-600 mt-0.5 font-mono">Claim ID: {claim.id}</p>
                </div>
                <span className={statusClass[claim.status] ?? "status-locked"}>{claim.status}</span>
              </div>
              <div className="border-t border-white/10 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-500">Submitted</p>
                  <p className="text-slate-300">{formatDate(claim.submittedAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Death Proof</p>
                  <p className={claim.deathProofCID ? "text-green-400" : "text-slate-500"}>{claim.deathProofCID ? "Uploaded" : "Pending"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Attorney</p>
                  <p className={claim.attestedAt ? "text-green-400" : "text-slate-500"}>{claim.attestedAt ? "Attested" : "Pending"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Guardian Approvals</p>
                  <p className="text-slate-300">{claim.guardianApprovals}</p>
                </div>
              </div>
              {claim.disputeReason && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
                  Dispute: {claim.disputeReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
