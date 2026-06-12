export const runtime = 'edge';

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { Lock } from "lucide-react";

// Demo: show granted access for the first beneficiary
async function getGrantedAccess() {
  const grants = await prisma.accessGrant.findMany({
    where: { revokedAt: null },
    include: { grantee: true, vault: true },
    orderBy: { grantedAt: "desc" },
  });
  return grants;
}

export default async function BeneficiaryPage() {
  const grants = await getGrantedAccess().catch(() => []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Beneficiary Portal</h1>
        <p className="text-sm text-slate-400 mt-1">
          You can only view assets and documents that were explicitly assigned to you by the vault owner.
          Access is granted only after all estate release conditions are verified.
        </p>
      </div>

      {grants.length === 0 ? (
        <div className="vault-card text-center py-16">
          <Lock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold mb-2">No Access Granted Yet</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Access to this vault has not been released. The estate release process must be completed
            by the named executor before beneficiaries receive access.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grants.map((grant) => (
            <div key={grant.id} className="vault-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-200">{grant.vault.label}</p>
                <span className="status-released">ACCESS GRANTED</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p>Scope: <span className="text-slate-200">{grant.scope}</span></p>
                <p>Granted: <span className="text-slate-200">{new Date(grant.grantedAt).toLocaleDateString()}</span></p>
                {grant.itemIds.length > 0 && (
                  <p>Items: <span className="text-gold-400">{grant.itemIds.length} assigned</span></p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-white/10 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Viewing this portal does not give you legal ownership of assets.
        Work with the executor and your attorney to complete the formal estate transfer process per applicable law.
      </div>
    </div>
  );
}
