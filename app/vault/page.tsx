export const runtime = 'edge';

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { Shield, Wallet, FileText, Users, BookOpen, ArrowRight, Activity, Cpu } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

import { resolveActiveVault } from "@/lib/vault/resolve-vault";

export default async function VaultOverviewPage() {
  const activeVault = await resolveActiveVault();
  const vaultId = activeVault?.id ?? "vault-demo-001";

  const vault = await prisma.vault.findUnique({
    where: { id: vaultId },
    include: {
      wallets: true,
      assets: true,
      documents: true,
      executors: { include: { user: true } },
      beneficiaries: { include: { user: true } },
      guardians: { include: { user: true } },
      releasePolicy: true,
    },
  }).catch(() => null);

  if (!vault) {
    return (
      <div className="vault-card text-center py-16">
        <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No vault found. <a href="/vault/create" className="text-gold-400 underline">Create your vault</a> to get started.</p>
      </div>
    );
  }

  const statusClass: Record<string, string> = {
    ACTIVE: "status-active",
    REVIEW_PENDING: "status-pending",
    RELEASE_PENDING: "status-pending",
    RELEASED: "status-released",
    DISPUTED: "status-disputed",
    LOCKED: "status-locked",
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{vault.label}</h1>
          {vault.description && <p className="text-sm text-slate-400 mt-1">{vault.description}</p>}
          <p className="text-xs text-slate-500 mt-2">Created {formatDate(vault.createdAt)}</p>
        </div>
        <span className={statusClass[vault.status] ?? "status-locked"}>{vault.status}</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Wallets", value: vault.wallets.length, icon: Wallet },
          { label: "Assets", value: vault.assets.length, icon: BookOpen },
          { label: "Documents", value: vault.documents.length, icon: FileText },
          { label: "Guardians", value: vault.guardians.length, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="vault-card flex items-center gap-4">
            <Icon className="h-8 w-8 text-cyan-400 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-slate-100">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chain anchor */}
      <div className="vault-card">
        <h2 className="section-header">Chain Registry</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="form-label">Owner DID</p>
            <p className="font-mono text-xs text-cyan-400 break-all">{vault.ownerDID ?? "—"}</p>
          </div>
          <div>
            <p className="form-label">Chain Tx Hash</p>
            <p className="font-mono text-xs text-cyan-400 break-all">{vault.chainTxHash ?? "—"}</p>
          </div>
          <div>
            <p className="form-label">Manifest CID</p>
            <p className="font-mono text-xs text-gold-400 break-all">{vault.manifestCID ?? "—"}</p>
          </div>
          <div>
            <p className="form-label">Manifest Hash</p>
            <p className="font-mono text-xs text-slate-400 break-all truncate">{vault.manifestHash ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Release Policy */}
      {vault.releasePolicy && (
        <div className="vault-card">
          <h2 className="section-header">Release Policy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <Stat label="Guardian Quorum" value={`${vault.releasePolicy.guardianQuorumRequired} of ${vault.releasePolicy.guardianQuorumOf}`} />
            <Stat label="Waiting Period" value={`${vault.releasePolicy.waitingPeriodDays} days`} />
            <Stat label="Attorney Required" value={vault.releasePolicy.requireAttorneyAttestation ? "Yes" : "No"} />
            <Stat label="Death Proof Required" value={vault.releasePolicy.requireDeathProof ? "Yes" : "No"} />
          </div>
        </div>
      )}

      {/* AI Copilots Swarm */}
      <div className="vault-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-header mb-0">Active AI Copilots Swarm</h2>
          <Link href="/vault/agents" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-semibold">
            Manage Copilots <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Your estate plan is continuously protected by 21 active autonomous agents (including VaultGuardian and RiskWarden).
          These agents monitor policy compliance, assess cross-chain security, and prepare heir tutoring protocols.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-white/5 bg-navy-950/40 p-3 flex items-start gap-2.5">
            <Shield className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-200">VaultGuardian</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Continuous RUFADAA & signature verification</p>
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-navy-950/40 p-3 flex items-start gap-2.5">
            <Activity className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-200">RiskWarden</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Cross-chain bridge & liquidity exposure audit</p>
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-navy-950/40 p-3 flex items-start gap-2.5">
            <Cpu className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-200">Heirloom Strategist</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Active death trigger & quorum simulation</p>
            </div>
          </div>
        </div>
      </div>

      {/* People */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <PeopleCard title="Executors" people={vault.executors.map((e) => e.user)} />
        <PeopleCard title="Beneficiaries" people={vault.beneficiaries.map((b) => b.user)} />
        <PeopleCard title="Guardians" people={vault.guardians.map((g) => g.user)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="form-label">{label}</p>
      <p className="text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}

function PeopleCard({ title, people }: { title: string; people: Array<{ name: string | null; email: string }> }) {
  return (
    <div className="vault-card">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">{title}</h3>
      {people.length === 0 ? (
        <p className="text-xs text-slate-500">None added yet.</p>
      ) : (
        <ul className="space-y-2">
          {people.map((p) => (
            <li key={p.email} className="text-xs">
              <p className="text-slate-200 font-medium">{p.name ?? "—"}</p>
              <p className="text-slate-500">{p.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
