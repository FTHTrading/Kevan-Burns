export const runtime = 'edge';

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { BookOpen } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  VAULT_CREATED: "text-cyan-400",
  MANIFEST_UPDATED: "text-cyan-400",
  WALLET_ADDED: "text-cyan-400",
  DOCUMENT_UPLOADED: "text-cyan-400",
  EXECUTOR_ADDED: "text-gold-400",
  BENEFICIARY_ADDED: "text-gold-400",
  GUARDIAN_ADDED: "text-gold-400",
  RELEASE_REQUESTED: "text-yellow-400",
  DEATH_PROOF_SUBMITTED: "text-yellow-400",
  ATTORNEY_ATTESTED: "text-yellow-400",
  GUARDIAN_APPROVED: "text-yellow-400",
  RELEASE_APPROVED: "text-green-400",
  ACCESS_GRANTED: "text-green-400",
  DISPUTE_OPENED: "text-red-400",
  VAULT_LOCKED: "text-red-400",
  FAILED_ACCESS: "text-red-400",
};

export default async function AuditDashboardPage() {
  const events = await prisma.auditEvent.findMany({
    orderBy: { occurredAt: "desc" },
    take: 100,
    select: {
      id: true,
      vaultId: true,
      action: true,
      chainEventHash: true,
      occurredAt: true,
      actor: { select: { name: true, email: true, role: true } },
    },
  }).catch(() => []);

  const totals = await prisma.auditEvent.groupBy({
    by: ["action"],
    _count: { _all: true },
    orderBy: { _count: { action: "desc" } },
  }).catch(() => []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Audit Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Immutable audit trail for all vault events. On-chain hashes provide tamper-evident proof.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="vault-card">
          <p className="text-2xl font-bold text-slate-100">{events.length}</p>
          <p className="text-xs text-slate-400">Recent Events</p>
        </div>
        <div className="vault-card">
          <p className="text-2xl font-bold text-cyan-400">
            {events.filter((e) => e.chainEventHash).length}
          </p>
          <p className="text-xs text-slate-400">Chain Anchored</p>
        </div>
        <div className="vault-card">
          <p className="text-2xl font-bold text-red-400">
            {events.filter((e) => ["DISPUTE_OPENED", "VAULT_LOCKED", "FAILED_ACCESS"].includes(e.action)).length}
          </p>
          <p className="text-xs text-slate-400">Security Events</p>
        </div>
        <div className="vault-card">
          <p className="text-2xl font-bold text-green-400">
            {events.filter((e) => ["RELEASE_APPROVED", "ACCESS_GRANTED"].includes(e.action)).length}
          </p>
          <p className="text-xs text-slate-400">Releases</p>
        </div>
      </div>

      {/* Event log */}
      <div className="vault-card">
        <h2 className="section-header flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          Event Log
        </h2>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2 pr-4 text-slate-500 font-medium">Time</th>
                <th className="pb-2 pr-4 text-slate-500 font-medium">Action</th>
                <th className="pb-2 pr-4 text-slate-500 font-medium">Actor</th>
                <th className="pb-2 pr-4 text-slate-500 font-medium">Vault</th>
                <th className="pb-2 text-slate-500 font-medium">Chain Hash</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 pr-4 text-slate-500 whitespace-nowrap">{formatDate(ev.occurredAt)}</td>
                  <td className={`py-2 pr-4 font-mono font-semibold whitespace-nowrap ${ACTION_COLORS[ev.action] ?? "text-slate-400"}`}>
                    {ev.action}
                  </td>
                  <td className="py-2 pr-4 text-slate-400 whitespace-nowrap">
                    {ev.actor?.name ?? ev.actor?.email ?? "System"}
                  </td>
                  <td className="py-2 pr-4 font-mono text-slate-600 truncate max-w-[120px]">
                    {ev.vaultId ? ev.vaultId.slice(0, 16) + "…" : "—"}
                  </td>
                  <td className="py-2 font-mono text-slate-600 truncate max-w-[120px]">
                    {ev.chainEventHash ? ev.chainEventHash.slice(0, 18) + "…" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <p className="text-center text-slate-500 py-8 text-sm">No events recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
