"use client";

import { useState } from "react";

export default function ExecutorClaimPage() {
  const [form, setForm] = useState({ vaultId: "vault-demo-001", claimantId: "" });
  const [result, setResult] = useState<{ claimId?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/vault/release/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": form.claimantId },
        body: JSON.stringify({ vaultId: form.vaultId, claimantId: form.claimantId }),
      });
      const data = await res.json() as { claim?: { id: string }; error?: string };
      if (!res.ok) setResult({ error: data.error });
      else setResult({ claimId: data.claim?.id });
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Submit Estate Claim</h1>
      <p className="text-sm text-slate-400">
        Submit a formal estate release claim. You must be a registered executor for the vault.
        All submissions are logged on the private chain.
      </p>

      <div className="vault-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label" htmlFor="vaultId">Vault ID *</label>
            <input id="vaultId" type="text" className="form-input" required
              value={form.vaultId}
              onChange={(e) => setForm({ ...form, vaultId: e.target.value })} />
          </div>
          <div>
            <label className="form-label" htmlFor="claimantId">Your User ID *</label>
            <input id="claimantId" type="text" className="form-input" required placeholder="cuid…"
              value={form.claimantId}
              onChange={(e) => setForm({ ...form, claimantId: e.target.value })} />
            <p className="text-xs text-slate-500 mt-1">Must match your registered executor account.</p>
          </div>

          <div className="rounded-lg border border-gold-500/20 bg-gold-500/5 p-3 text-xs text-slate-400">
            By submitting this claim, you confirm you have legal authority to act as executor of this estate.
            False submissions are subject to legal consequences.
          </div>

          {result?.error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{result.error}</div>
          )}
          {result?.claimId && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              Claim submitted. ID: <span className="font-mono">{result.claimId}</span>
              <br />Next step: Upload certified death certificate or court authority.
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Submitting…" : "Submit Claim"}
          </button>
        </form>
      </div>
    </div>
  );
}
