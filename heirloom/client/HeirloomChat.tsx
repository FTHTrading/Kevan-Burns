"use client";

import React, { useState } from "react";

/**
 * HEIRLOOM CHAT STUB — Sovereign Vault AI (client-side only)
 *
 * This is a placeholder. Real usage:
 * - Load kernel + tier delta from heirloom/ (or pre-bundled in the app for high tiers).
 * - Decrypt the scoped heirloom_context blob from the current vault manifest (client only).
 * - Feed to a local LLM (Ollama, browser WebLLM, or sovereign per-namespace gateway the client controls).
 * - Never send the full context to the central Legacy Vault API.
 *
 * Tier gating must be enforced by the parent (see vault entitlement + activate-subscription).
 */

interface HeirloomChatProps {
  tier: "PRIVATE" | "HIGH_LEVEL" | "FAMILY" | "FUCK_YOU" | "NUCLEAR";
  namespace: string;
  vaultId?: string;
}

const TIER_LABELS: Record<string, string> = {
  PRIVATE: "Legacy Advisor (standard)",
  FAMILY: "Legacy Advisor (Essential Vault)",
  HIGH_LEVEL: "Legacy Advisor Strategist (Premium Estate Vault)",
  FUCK_YOU: "Elite Trust Executor (Elite Trust Vault)",
  NUCLEAR: "Enterprise Trust Executor (Enterprise & Family Office)",
};

export default function HeirloomChat({ tier, namespace, vaultId }: HeirloomChatProps) {
  const isHighTier = tier === "FUCK_YOU" || tier === "NUCLEAR";
  const isNormal = tier === "PRIVATE" || tier === "HIGH_LEVEL" || tier === "FAMILY";

  const [messages, setMessages] = useState<Array<{ role: "user" | "heirloom"; content: string }>>([
    {
      role: "heirloom",
      content: `${isHighTier ? "Heirloom" : "Legacy Advisor"} online. ${isHighTier ? "What do you need to lock down, release, or burn today?" : "How can I help you protect or plan your family's future today?"}\n\n(You are in ${TIER_LABELS[tier]} mode for ${namespace}. This is a local simulation stub. In production this runs against your encrypted vault context + the appropriate kernel (normal for low tiers, full for high) on your machine or sovereign node only. Georgia: 5655 Peachtree Parkway, Norcross, GA 30092.)`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // In real impl: fetch the appropriate kernel (normal-kernel.md for low tiers, kernel.md for high) + tier delta + decrypt context client-side only.
  const getSystemContext = () => {
    const persona = isNormal ? "Legacy Advisor (normal/professional mode for middle class)" : "Heirloom (full ruthless scaled for high tiers)";
    return `${persona} loaded for ${tier} tier. Namespace: ${namespace}. Vault: ${vaultId || "primary"}.\nGeorgia anchor: 5655 Peachtree Parkway, Norcross, GA 30092. RUFADAA / probate avoidance mode active. Client-side only.`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    // STUB: In production, call local LLM with full (decrypted) context + kernel + tier delta.
    // Here we just echo a savage placeholder response based on tier.
    await new Promise((r) => setTimeout(r, 400));

    let reply = "";
    if (isNormal) {
      if (tier === "PRIVATE" || tier === "FAMILY") {
        reply = `Legacy Advisor (standard mode): I can explain the documents and 5-Proof process in your ${namespace} vault. The release uses time + guardians + legal proof + on-chain anchor. Georgia families at 5655 Peachtree Parkway, Norcross typically avoid 18+ months of probate with client-side encryption. For full scenario simulation and advanced policy design, the Premium Estate tier scales these capabilities.`;
      } else {
        reply = `Legacy Advisor Strategist (Premium Estate Vault): Understood. Simulating transition protocols for ${namespace}: the time-lock releases after the configured period, guardians approve via 5-Proof, attorney attests. Heirs receive exactly the scoped access you defined. I can help design tiered releases or business succession. What would you like to plan or clarify?`;
      }
    } else if (tier === "FUCK_YOU") {
      reply = `Elite Trust Executor (Elite Trust Vault): Secure access protocol configured. If unauthorized access is detected, the redirection path can securely shift assets to the designated trust or legal beneficiary. Defense protocol pre-staged for media, law enforcement, and trusted counsel. Shall I construct the client-side cryptographically signed intents?`;
    } else {
      reply = `Enterprise Trust Executor (Enterprise & Family Office): Generational trust plan active. Multiple independent DMS across chains are active. Slow-leak will begin feeding non-sensitive inventory in the configured window if you stay missing. The generational tutor is writing the letter your descendants will read. What do you need to secure, release, or transfer for the next century?`;
    }

    setMessages((prev) => [...prev, { role: "heirloom", content: reply + `\n\n[System context: ${getSystemContext()}]` }]);
    setLoading(false);
  };

  return (
    <div className="border border-amber-500/30 bg-estate-950 text-estate-100 rounded-2xl p-6 font-mono text-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-amber-400 font-black tracking-widest text-xs">HEIRLOOM — SOVEREIGN VAULT AI</div>
          <div className="text-[10px] opacity-60">{TIER_LABELS[tier]} · {namespace}</div>
        </div>
        <div className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">CLIENT-SIDE ONLY • NEVER SENT TO SERVER</div>
      </div>

      <div className="h-64 overflow-y-auto space-y-3 mb-4 pr-2 text-xs leading-relaxed border border-white/10 p-3 rounded bg-black/40">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span className={m.role === "heirloom" ? "text-amber-400" : "opacity-70"}>{m.role === "heirloom" ? "HEIRLOOM" : "YOU"}:</span>{" "}
            <span className="whitespace-pre-wrap">{m.content}</span>
          </div>
        ))}
        {loading && <div className="opacity-50">Heirloom is thinking in the dark...</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleSend(); }}
          placeholder={isHighTier ? "Ask about death scenarios, kill switches, or heir behavior..." : "Ask what the basic 5-Proof does..."}
          className="flex-1 bg-black/60 border border-white/20 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-amber-500 text-estate-950 font-black text-xs rounded disabled:opacity-50"
        >
          SEND
        </button>
      </div>

      <div className="mt-3 text-[10px] opacity-50">
        This is a local simulation stub for {tier}. In production the full kernel + your decrypted intake + vault policies run on your machine or sovereign node. The central service only ever sees ZK proofs and CIDs.
        <br />
        Physical anchor: <span className="text-amber-400">5655 Peachtree Parkway, Norcross, GA 30092</span>
      </div>
    </div>
  );
}
