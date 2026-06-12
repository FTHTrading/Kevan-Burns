export const runtime = 'edge';

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { Settings } from "lucide-react";

import { resolveActiveVault } from "@/lib/vault/resolve-vault";

export default async function ReleasePolicyPage() {
  const activeVault = await resolveActiveVault();
  const vaultId = activeVault?.id ?? "vault-demo-001";

  const vault = await prisma.vault.findUnique({
    where: { id: vaultId },
    include: { releasePolicy: true },
  }).catch(() => null);

  const policy = vault?.releasePolicy;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Release Policy</h1>
      <p className="text-sm text-slate-400">
        The release policy defines all conditions that must be met before the vault can be opened to executors and beneficiaries.
        Every condition is required — no single signal can trigger release.
      </p>

      {!policy ? (
        <div className="vault-card text-center py-12">
          <Settings className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No release policy assigned to this vault.</p>
        </div>
      ) : (
        <div className="vault-card space-y-6">
          <div>
            <p className="form-label">Policy Name</p>
            <p className="text-sm font-semibold text-slate-200">{policy.label}</p>
          </div>

          <div className="divider" />

          <div className="grid grid-cols-2 gap-6">
            <PolicyItem
              label="Guardian Quorum"
              value={`${policy.guardianQuorumRequired} of ${policy.guardianQuorumOf} guardians must approve`}
              active
            />
            <PolicyItem
              label="Waiting Period"
              value={`${policy.waitingPeriodDays} days after quorum before release`}
              active
            />
            <PolicyItem
              label="Attorney Attestation"
              value="Required"
              active={policy.requireAttorneyAttestation}
            />
            <PolicyItem
              label="Death Certificate / Court Order"
              value="Required"
              active={policy.requireDeathProof}
            />
            <PolicyItem
              label="Executor Identity Assurance"
              value={`IAL ${policy.executorIAL} (NIST SP 800-63-4)`}
              active
            />
          </div>

          <div className="divider" />

          <div>
            <p className="text-xs font-semibold text-slate-400 mb-3">Release Flow</p>
            <ol className="space-y-2 text-xs text-slate-400 list-decimal list-inside">
              <li>Executor submits claim and completes identity verification</li>
              <li>Certified death certificate or court order uploaded and hashed</li>
              <li>Attorney or notary reviews and attests legal authority</li>
              <li>{policy.guardianQuorumRequired} of {policy.guardianQuorumOf} guardians approve</li>
              <li>{policy.waitingPeriodDays}-day waiting period opens for disputes</li>
              <li>Administrator confirms all conditions and approves release on-chain</li>
              <li>Scoped access is granted to executor and assigned beneficiaries</li>
            </ol>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-white/10 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Legal note:</strong> This policy governs access to vault data only. Actual legal transfer of assets requires estate law authority, probate proceedings if applicable, and compliance with each platform's terms. Consult your estate attorney.
      </div>
    </div>
  );
}

function PolicyItem({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div>
      <p className="form-label">{label}</p>
      <p className={`text-sm font-semibold ${active ? "text-cyan-400" : "text-slate-500"}`}>{value}</p>
    </div>
  );
}
