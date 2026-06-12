export const runtime = 'edge';
export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { Wallet, Plus } from "lucide-react";
import Link from "next/link";
import WalletItem from "./WalletItem";

import { resolveActiveVault } from "@/lib/vault/resolve-vault";

const CHAIN_LABELS: Record<string, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  base: "Base",
  solana: "Solana",
  xrpl: "XRPL",
  stellar: "Stellar",
  bitcoin: "Bitcoin",
  custom: "Custom",
};

export default async function WalletsPage() {
  const activeVault = await resolveActiveVault();
  const vaultId = activeVault?.id ?? "vault-demo-001";

  const wallets = await prisma.walletRecord.findMany({
    where: { vaultId },
    orderBy: { chain: "asc" },
  }).catch(() => []);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Wallet Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Public addresses only. No private keys or seed phrases are stored here.</p>
        </div>
        <Link href="/vault/wallets/add" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Wallet
        </Link>
      </div>

      {wallets.length === 0 ? (
        <div className="vault-card text-center py-12">
          <Wallet className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No wallets registered yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map((w) => (
            <WalletItem
              key={w.id}
              wallet={w}
              chainLabel={CHAIN_LABELS[w.chain] ?? w.chain}
            />
          ))}
        </div>
      )}

      <div className="rounded-lg border border-white/10 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Security note:</strong> Never enter seed phrases, private keys, or wallet passwords into this system.
        If you need to document access recovery instructions, use an encrypted document upload with attorney-custody or hardware-wallet recovery instructions.
      </div>
    </div>
  );
}
