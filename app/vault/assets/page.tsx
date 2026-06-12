export const runtime = 'edge';

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { BookOpen } from "lucide-react";

import { resolveActiveVault } from "@/lib/vault/resolve-vault";

const CATEGORY_LABELS: Record<string, string> = {
  WEB3_WALLET: "Web3 Wallet",
  CRYPTO_EXCHANGE: "Crypto Exchange",
  BANK_BROKERAGE: "Bank / Brokerage",
  REAL_ESTATE: "Real Estate",
  BUSINESS_INTEREST: "Business Interest",
  DOMAIN_DIGITAL: "Domain / Digital",
  INSURANCE_POLICY: "Insurance Policy",
  RETIREMENT_ACCOUNT: "Retirement Account",
  INTELLECTUAL_PROPERTY: "Intellectual Property",
  OTHER: "Other",
};

export default async function AssetsPage() {
  const activeVault = await resolveActiveVault();
  const vaultId = activeVault?.id ?? "vault-demo-001";

  const assets = await prisma.assetRecord.findMany({
    where: { vaultId },
    include: { beneficiary: { include: { user: true } } },
    orderBy: { category: "asc" },
  }).catch(() => []);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Asset Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Account details are encrypted. Only labels and categories are shown here.</p>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="vault-card text-center py-12">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No assets registered yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.id} className="vault-card flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">{asset.label}</p>
                <p className="text-xs text-slate-500">{CATEGORY_LABELS[asset.category] ?? asset.category}</p>
                {asset.description && <p className="text-xs text-slate-500 mt-0.5">{asset.description}</p>}
              </div>
              {asset.beneficiary && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">Assigned to</p>
                  <p className="text-xs font-medium text-gold-400">{asset.beneficiary.user.name ?? asset.beneficiary.user.email}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
