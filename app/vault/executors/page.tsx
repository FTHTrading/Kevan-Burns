export const runtime = 'edge';

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { Users } from "lucide-react";
import Link from "next/link";

import { resolveActiveVault } from "@/lib/vault/resolve-vault";

export default async function ExecutorsPage() {
  const activeVault = await resolveActiveVault();
  const vaultId = activeVault?.id ?? "vault-demo-001";

  const executors = await prisma.executor.findMany({
    where: { vaultId },
    include: { user: true },
  }).catch(() => []);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Executors</h1>
      <p className="text-sm text-slate-400">
        Executors are the people authorized to initiate the estate release process.
        They must pass identity verification (KYC) before submitting a claim.
      </p>

      {executors.length === 0 ? (
        <div className="vault-card text-center py-12">
          <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No executors added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {executors.map((ex) => (
            <div key={ex.id} className="vault-card flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">{ex.user.name ?? "—"}</p>
                <p className="text-xs text-slate-500">{ex.user.email}</p>
                {ex.title && <p className="text-xs text-gold-400 mt-0.5">{ex.title}</p>}
              </div>
              <div className="flex flex-col items-end gap-1">
                {ex.isPrimary && <span className="status-active">Primary</span>}
                {ex.did && <span className="font-mono text-xs text-slate-600 truncate max-w-[140px]">{ex.did}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-white/10 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Access scope:</strong> Executors receive access to the asset inventory, legal documents, and claim instructions after all release conditions are verified.
      </div>
    </div>
  );
}
