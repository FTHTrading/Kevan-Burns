export const runtime = 'edge';

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

import { resolveActiveVault } from "@/lib/vault/resolve-vault";

const DOC_TYPE_LABELS: Record<string, string> = {
  WILL: "Last Will & Testament",
  TRUST: "Trust Document",
  POWER_OF_ATTORNEY: "Power of Attorney",
  DEED: "Deed",
  TITLE: "Title",
  INSURANCE_POLICY: "Insurance Policy",
  TAX_DOCUMENT: "Tax Document",
  BUSINESS_DOCUMENT: "Business Document",
  INSTRUCTIONS: "Instructions",
  LEGAL_AUTHORITY: "Legal Authority",
  DEATH_CERTIFICATE: "Death Certificate",
  COURT_ORDER: "Court Order",
  OTHER: "Other",
};

export default async function DocumentsPage() {
  const activeVault = await resolveActiveVault();
  const vaultId = activeVault?.id ?? "vault-demo-001";

  const documents = await prisma.documentRecord.findMany({
    where: { vaultId },
    orderBy: { uploadedAt: "desc" },
  }).catch(() => []);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Document Vault</h1>
          <p className="text-xs text-slate-500 mt-1">All documents are encrypted before storage. Only CIDs and hashes are recorded here.</p>
        </div>
        <Link href="/vault/documents/upload" className="btn-primary flex items-center gap-2">
          <FileText className="h-4 w-4" /> Upload Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="vault-card text-center py-12">
          <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="vault-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{doc.label}</p>
                    <p className="text-xs text-slate-500">{DOC_TYPE_LABELS[doc.type] ?? doc.type}</p>
                    {doc.description && <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{formatDate(doc.uploadedAt)}</p>
                  <div className="flex gap-1 justify-end mt-1 flex-wrap">
                    {doc.releaseToRoles.map((r) => (
                      <span key={r} className="inline-block rounded px-1.5 py-0.5 text-xs bg-white/5 text-slate-400 border border-white/10">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  <span className="text-slate-600">CID: </span>
                  <span className="font-mono text-cyan-700">{doc.cid.slice(0, 30)}…</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
