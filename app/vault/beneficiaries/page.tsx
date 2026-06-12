export const runtime = 'edge';

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { Users } from "lucide-react";

import { resolveActiveVault } from "@/lib/vault/resolve-vault";

const SCOPE_LABELS: Record<string, string> = {
  FULL: "Full Access",
  ASSET_INVENTORY: "Asset Inventory",
  LEGAL_DOCS: "Legal Documents",
  ASSIGNED_ITEMS_ONLY: "Assigned Items Only",
  HASHES_ONLY: "Audit Hashes Only",
};

export default async function BeneficiariesPage() {
  const activeVault = await resolveActiveVault();
  const vaultId = activeVault?.id ?? "vault-demo-001";

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { vaultId },
    include: {
      user: true,
      assignedAssets: true,
    },
  }).catch(() => []);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Beneficiaries</h1>
      <p className="text-sm text-slate-400">
        Beneficiaries receive only the items specifically assigned to them after a verified release.
        They cannot see the full vault unless explicitly scoped.
      </p>

      {beneficiaries.length === 0 ? (
        <div className="vault-card text-center py-12">
          <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No beneficiaries added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {beneficiaries.map((ben) => (
            <div key={ben.id} className="vault-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{ben.user.name ?? "—"}</p>
                  <p className="text-xs text-slate-500">{ben.user.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded border border-white/10 text-slate-400">
                  {SCOPE_LABELS[ben.scope] ?? ben.scope}
                </span>
              </div>
              {ben.allocation && (
                <p className="text-xs text-slate-400 border-t border-white/10 pt-2">{ben.allocation}</p>
              )}
              {ben.assignedAssets.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Assigned assets:</p>
                  <div className="flex flex-wrap gap-1">
                    {ben.assignedAssets.map((a) => (
                      <span key={a.id} className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gold-400">
                        {a.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
