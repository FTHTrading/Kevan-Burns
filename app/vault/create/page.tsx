export const runtime = 'edge';

import { Suspense } from "react";
import VaultCreateForm from "@/app/components/VaultCreateForm";
import { Shield } from "lucide-react";

// Server page wrapper. Payment success flow: after /api/payments/success (verifies + activates entitlement) redirects here with ?paid=1&namespace=...
export default async function VaultCreatePage({ searchParams }: { searchParams: Promise<{ paid?: string; namespace?: string }> }) {
  const params = await searchParams;
  const paid = params.paid === "1";
  const ns = params.namespace;
  const initialLabel = ns ? ns.replace(/\.(legacy|troptions)$/, "") + " Estate Vault" : "";

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-6 w-6 text-gold-400" />
        <h1 className="text-xl font-bold text-slate-100">Create Your Vault</h1>
        {paid && (
          <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 border border-emerald-500/30">
            Payment confirmed — vault creation unlocked
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-4">After successful payment (Stripe or on-chain), your namespace entitlement is activated and vault creation is unlocked.</p>

      <Suspense fallback={<div className="vault-card p-8">Loading form…</div>}>
        <VaultCreateForm initialLabel={initialLabel} paymentConfirmed={paid} />
      </Suspense>
    </div>
  );
}
