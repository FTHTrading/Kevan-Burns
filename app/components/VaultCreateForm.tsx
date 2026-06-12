"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle } from "lucide-react";

export default function VaultCreateForm({ initialLabel = "", paymentConfirmed = false }: { initialLabel?: string; paymentConfirmed?: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({ label: initialLabel, description: "", ownerDID: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vault/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user-id",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create vault");
      router.push("/vault");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vault-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label" htmlFor="label">Vault Name *</label>
          <input
            id="label"
            type="text"
            className="form-input"
            placeholder="My Estate Vault"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-input min-h-[80px]"
            placeholder="Brief description of this vault's purpose"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={500}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="ownerDID">Owner DID <span className="text-slate-600">(optional)</span></label>
          <input
            id="ownerDID"
            type="text"
            className="form-input"
            placeholder="did:key:z6Mk…"
            value={form.ownerDID}
            onChange={(e) => setForm({ ...form, ownerDID: e.target.value })}
          />
          <p className="text-xs text-slate-500 mt-1">Decentralized identifier for on-chain ownership proof.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-gold-500/20 bg-gold-500/5 p-3 text-xs text-slate-400">
          <strong className="text-gold-400">Legal Reminder:</strong> This vault stores references to your assets. It does not replace a will, trust, or estate attorney. Always work with qualified legal counsel.
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating…" : "Create Vault"}
        </button>
      </form>
    </div>
  );
}
