"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Shield, CheckCircle, ArrowRight, Loader2, Info, Lock, Users, Vault, Wallet, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "personal",
    label: "Personal / Free",
    price: "Free*",
    description: "One vault, personal estate",
    features: ["1 vault", "5 documents", "2 wallets", "1 executor", "*Subject to monthly protocol fees after setup"],
    highlight: false,
  },
  {
    id: "family",
    label: "Family",
    price: "$29/mo",
    description: "Multi-vault family namespace",
    features: ["5 vaults", "Unlimited documents", "20 wallets", "5 executors", "Priority support", "Cross-chain registry"],
    highlight: false,
  },
  {
    id: "lifetime_presale",
    label: "Sovereign Lifetime Presale",
    price: "$499.95",
    description: "Generational vault & namespace, no monthly fees",
    features: ["Up to 10 vaults", "Unlimited documents & wallets", "1,000 TROPTIONS tokens included", "EVM, Stellar, Solana, XRPL", "ZK 5-Proof waiting gates", "No monthly or renewal fees ever"],
    highlight: true,
  },
];

const RESERVED = ["admin", "system", "vault", "legacy", "root", "null", "undefined", "test"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

type Step = "form" | "confirm" | "done";

export default function RegisterNamespacePage() {
  const [step, setStep] = useState<Step>("form");
  const [label, setLabel] = useState("");
  const [suffix, setSuffix] = useState(".legacy");
  const [plan, setPlan] = useState("family");
  const [description, setDescription] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // AI guided registry states
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Hello! I can guide you through claiming your sovereign namespace. What family name or label would you like to secure? (e.g. \"Smith Family\")",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  function parseRegistryInputs(content: string) {
    const msg = content.toLowerCase().trim();

    // 1. Suffix
    if (msg.includes(".legacy")) {
      setSuffix(".legacy");
    } else if (msg.includes(".troptions")) {
      setSuffix(".troptions");
    }

    // 2. Plan
    if (msg.includes("personal") || msg.includes("free plan")) {
      setPlan("personal");
    } else if (msg.includes("family") || msg.includes("$29") || msg.includes("standard plan")) {
      setPlan("family");
    } else if (msg.includes("lifetime") || msg.includes("presale") || msg.includes("499")) {
      setPlan("lifetime_presale");
    } else if (msg.includes("enterprise") || msg.includes("custom plan") || msg.includes("business")) {
      setPlan("enterprise");
    }

    // 3. Label/Name
    const labelMatch = content.match(/(?:claim|register|use|name is|label|namespace|namespace is)\s+([A-Za-z0-9\s]+)/i);
    if (labelMatch) {
      setLabel(labelMatch[1].trim());
    } else {
      if (!label && content.length >= 3 && content.length <= 30 && !content.includes(" ") && !content.includes(".")) {
        setLabel(content);
      }
    }

    // 4. Description
    if (msg.includes("purpose is") || msg.includes("description is") || msg.includes("describe it as") || msg.includes("used for")) {
      const descMatch = content.match(/(?:purpose is|description is|describe it as|used for)\s+([^.]+)/i);
      if (descMatch) {
        setDescription(descMatch[1].trim());
      }
    }
  }

  async function sendAiMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userText = aiInput;
    setAiInput("");
    setAiLoading(true);

    const nextMessages = [...aiMessages, { role: "user" as const, content: userText }];
    setAiMessages(nextMessages);

    parseRegistryInputs(userText);

    try {
      const res = await fetch("/api/ops/estate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are an AI assistant for the Legacy Vault Protocol namespace registry.
Your job is to guide the user in setting up their sovereign .legacy or .troptions namespace registry.

CURRENT LIVE PROFILE STATE:
- Label/Name: "${label || "Not set yet"}"
- Suffix: "${suffix}"
- Plan: "${plan}"
- Description: "${description || "Not set yet"}"

Help the user fill in the remaining fields. If they provide a field, acknowledge it and guide them to the next ones. Once they have a valid name, suggest they click the "Continue to Confirm" button on the screen.`,
            },
            ...nextMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok) throw new Error("AI request failed");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamed = "";

      const assistantMsgIndex = nextMessages.length;
      setAiMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          if (cleanLine.startsWith("data: ")) {
            const dataStr = cleanLine.slice(6);
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr) as { token?: string };
              if (parsed.token) {
                streamed += parsed.token;
                setAiMessages(prev => {
                  const updated = [...prev];
                  if (updated[assistantMsgIndex]) {
                    updated[assistantMsgIndex] = {
                      role: "assistant",
                      content: streamed,
                    };
                  }
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

    } catch (err) {
      console.error(err);
      setAiMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I've noted that! You can see the updated profile in the live card on the right. What else would you like to update, or are you ready to confirm?",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  const slug = slugify(label);
  const namespaceName = slug ? `${slug}${suffix}` : "";
  const reserved = RESERVED.includes(slug);
  const tooShort = slug.length > 0 && slug.length < 3;
  const valid = slug.length >= 3 && !reserved;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError("Please enter a namespace name.");
      return;
    }
    if (slug.length < 3) {
      setError("Namespace name must be at least 3 characters.");
      return;
    }
    if (reserved) {
      setError(`"${slug}" is a reserved name. Please choose another.`);
      return;
    }
    if (!agree) {
      setError("You must agree to the terms to continue.");
      return;
    }
    setError("");
    setStep("confirm");
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/namespaces/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespace: label,
          suffix: suffix,
          plan: plan,
          description: description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register namespace");
      }
      
      if (plan === "lifetime_presale") {
        const checkRes = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: "LIFETIME_PRESALE",
            method: "stripe",
            namespace: `${slugify(label)}${suffix}`,
          })
        });
        const checkData = await checkRes.json();
        if (checkData.checkoutUrl) {
          window.location.href = checkData.checkoutUrl;
          return;
        }
      }

      setSubmitting(false);
      setStep("done");
    } catch (e: any) {
      console.error("Namespace registration failed:", e);
      setError(e.message || "An error occurred during registration");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Premium Lifetime Presale Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-gold-500/10 to-amber-500/20 border-b border-amber-500/30 px-6 py-3 text-center">
        <p className="text-xs sm:text-sm font-semibold text-slate-200">
          🔥 <strong className="text-gold-400 font-black">Limited Launch Offer:</strong> Avoid monthly registry fees. 
          Get the <Link href="/lifetime" className="underline text-gold-300 hover:text-gold-200 font-extrabold ml-1">Sovereign Lifetime Membership for $499.95</Link> with zero recurring fees forever! 
          <span className="text-slate-400 block sm:inline sm:ml-2">(Free namespaces are subject to standard monthly protocol maintenance fees).</span>
        </p>
      </div>

      {/* Header */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-16 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Namespace Registry</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold text-white md:text-5xl leading-tight mb-4">
          Claim Your <span className="text-gold-400">{suffix}</span> Namespace
        </h1>
        <p className="mx-auto max-w-xl text-slate-400 text-lg">
          A namespace is your sovereign estate address on the Legacy Vault Protocol. One name. Every vault, document, and wallet beneath it.
        </p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3" /> No custody of assets</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400"><Lock className="h-3 w-3" /> End-to-end encrypted</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs text-gold-400"><Globe className="h-3 w-3" /> Sovereign on-chain anchor</span>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {(["form", "confirm", "done"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border ${
                step === s ? "border-gold-500 bg-gold-500 text-navy-950" :
                (["form","confirm","done"].indexOf(step) > i) ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" :
                "border-navy-700 bg-navy-800 text-slate-500"
              }`}>{["form","confirm","done"].indexOf(step) > i ? <CheckCircle className="h-4 w-4" /> : i + 1}</div>
              <span className={`text-xs ${step === s ? "text-gold-400" : "text-slate-500"}`}>
                {["Choose name", "Confirm", "Done"][i]}
              </span>
              {i < 2 && <ArrowRight className="h-3 w-3 text-slate-600" />}
            </div>
          ))}
        </div>

        {/* Toggle Mode */}
        {step === "form" && (
          <div className="mb-8 flex justify-center">
            <div className="flex bg-navy-900 p-1 rounded-xl border border-navy-805">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === "manual"
                    ? "bg-gold-500 text-navy-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Manual Registry Form
              </button>
              <button
                type="button"
                onClick={() => setMode("ai")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  mode === "ai"
                    ? "bg-gold-500 text-navy-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="h-4 w-4" /> AI Guided Registry
              </button>
            </div>
          </div>
        )}

        {step === "form" && mode === "manual" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Namespace name */}
                <div className="vault-card">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gold-400" /> Namespace Name
                  </h2>
                  <label className="form-label">Display label (we'll generate the slug)</label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        className="form-input pr-4 w-full"
                        placeholder="Smith Family"
                        value={label}
                        onChange={(e) => { setLabel(e.target.value); setError(""); }}
                        maxLength={40}
                      />
                    </div>
                    <select
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                      className="bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500"
                    >
                      <option value=".legacy">.legacy</option>
                      <option value=".troptions">.troptions</option>
                    </select>
                  </div>
                  {namespaceName && (
                    <div className={`mt-2 flex items-center gap-2 text-xs ${reserved || tooShort ? "text-red-400" : "text-emerald-400"}`}>
                      {reserved || tooShort ? (
                        <><Info className="h-3 w-3" /> {reserved ? `"${slug}" is reserved` : "Must be at least 3 characters"}</>
                      ) : (
                        <><CheckCircle className="h-3 w-3" /> <span className="font-mono font-bold">{namespaceName}</span> is available</>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="vault-card">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" /> Description
                  </h2>
                  <label className="form-label">Brief purpose of this namespace</label>
                  <textarea
                    className="form-input min-h-[80px] resize-none"
                    placeholder="Multi-generational family estate with digital assets and real property…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-600 mt-1 text-right">{description.length}/200</p>
                </div>

                {/* Plan */}
                <div className="vault-card">
                  <h2 className="text-base font-semibold text-white mb-4">Select Plan</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PLANS.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { setPlan(p.id); setError(""); }}
                        className={`cursor-pointer rounded-xl border p-4 text-left transition-all flex flex-col justify-between ${
                          plan === p.id
                            ? "border-gold-500 bg-gold-500/10 shadow-lg shadow-gold-500/5 scale-[1.02]"
                            : "border-navy-700 bg-navy-800/50 hover:border-navy-600 hover:scale-[1.01]"
                        } ${p.highlight ? "ring-1 ring-gold-500/30" : ""}`}
                      >
                        <div>
                          {p.highlight && <p className="text-xs text-gold-400 font-bold mb-1">Most Popular</p>}
                          <p className="text-sm font-bold text-white">{p.label}</p>
                          <p className="text-lg font-bold text-gold-400 mt-0.5">{p.price}</p>
                          <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                          <ul className="mt-3 space-y-1 mb-4">
                            {p.features.map((f) => (
                              <li key={f} className="flex items-center gap-1.5 text-xs text-slate-300">
                                <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />{f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={`mt-2 w-full text-center py-2 rounded-lg text-xs font-bold transition-all ${
                          plan === p.id
                            ? "bg-gold-500 text-navy-950"
                            : "bg-navy-700 text-slate-300 hover:bg-navy-600"
                        }`}>
                          {plan === p.id ? "Selected Plan" : "Select Plan"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => { setAgree(e.target.checked); setError(""); }}
                    className="mt-0.5 rounded border-navy-600 bg-navy-800 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-xs text-slate-400">
                    I understand that a .legacy namespace is sovereign infrastructure, not a legal entity. Asset release requires valid executor verification and applicable estate law compliance.{" "}
                    <Link href="/glossary" className="text-gold-400 hover:underline">Terms & Definitions</Link>
                  </span>
                </label>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-1.5"
                >
                  Continue to Confirm <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="vault-card text-sm">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Info className="h-4 w-4 text-cyan-400" /> What is a namespace?</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">
                  A <strong className="text-slate-300">.legacy namespace</strong> is your root estate identity on the protocol. It anchors to Layer 0 and is the parent of all your vaults, documents, and wallet registrations.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Think of it like a domain name — except it routes estate actions, not web traffic.
                </p>
              </div>
              <div className="vault-card text-sm space-y-3">
                <h3 className="font-semibold text-white mb-1">What's included</h3>
                {[
                  { icon: <Vault className="h-4 w-4 text-gold-400" />, label: "Vault hierarchy", note: "child vaults under your namespace" },
                  { icon: <Wallet className="h-4 w-4 text-cyan-400" />, label: "Wallet registry", note: "cross-chain addresses anchored" },
                  { icon: <Users className="h-4 w-4 text-purple-400" />, label: "Member access", note: "executors + beneficiaries" },
                  { icon: <Lock className="h-4 w-4 text-emerald-400" />, label: "Release policy", note: "multi-proof unlock logic" },
                ].map(({ icon, label, note }) => (
                  <div key={label} className="flex items-start gap-2">
                    {icon}
                    <div>
                      <p className="text-xs font-medium text-slate-200">{label}</p>
                      <p className="text-xs text-slate-500">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-navy-700 bg-navy-800/50 p-4 text-xs text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">Want to see it first?</p>
                <p className="mb-3">Try the demo namespace — no account needed.</p>
                <Link href="/namespaces/demo" className="btn-secondary text-xs w-full text-center block py-2">
                  Open Demo Mode
                </Link>
              </div>
            </div>
          </div>
        )}

        {step === "form" && mode === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Chat Box */}
            <div className="lg:col-span-2 flex flex-col h-[550px] bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {aiMessages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gold-500 text-navy-950 font-semibold shadow-md"
                        : "bg-navy-850 border border-navy-800 text-slate-200"
                    }`}>
                      {m.content.split("\n").map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-navy-850 border border-navy-800 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin text-gold-500" /> Conversing with Registry AI...
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={sendAiMessage} className="border-t border-navy-800 p-4 bg-navy-950 flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Tell the AI: claim smithfamily.legacy in the family plan..."
                  className="flex-1 bg-navy-900 border border-navy-805 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500 text-white placeholder:text-slate-500"
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-5 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Live Profile Sidebar */}
            <div className="space-y-4">
              <div className="vault-card text-sm">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-gold-400">
                  <Sparkles className="h-4 w-4 animate-pulse" /> Live Registry Profile
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Namespace Label</label>
                    <div className="font-mono text-sm font-bold text-white mt-0.5">
                      {label ? (
                        <span className="text-emerald-400">{label}</span>
                      ) : (
                        <span className="text-slate-600 italic">Not set (say e.g. "use Smith Family")</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Suffix</label>
                    <div className="font-mono text-sm font-bold text-white mt-0.5">
                      <span className="text-cyan-400">{suffix}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Full Name Address</label>
                    <div className="font-mono text-sm font-bold text-white mt-0.5">
                      {namespaceName ? (
                        <span className="text-gold-400">{namespaceName}</span>
                      ) : (
                        <span className="text-slate-600 italic">Pending label</span>
                      )}
                    </div>
                    {namespaceName && (
                      <div className={`mt-1 flex items-center gap-1.5 text-xs ${reserved || tooShort ? "text-red-400" : "text-emerald-400"}`}>
                        {reserved || tooShort ? (
                          <><Info className="h-3 w-3" /> {reserved ? "Reserved name" : "Too short (min 3 chars)"}</>
                        ) : (
                          <><CheckCircle className="h-3.5 w-3.5" /> Available</>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Plan</label>
                    <div className="text-sm font-semibold text-white mt-0.5 capitalize">
                      {plan} Plan ({PLANS.find(p => p.id === plan)?.price})
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Description</label>
                    <div className="text-xs text-slate-300 mt-0.5 italic">
                      {description || "Not described yet (say e.g. 'purpose is Family inheritance')"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement and Verification Block */}
              <div className="vault-card text-sm space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => { setAgree(e.target.checked); setError(""); }}
                    className="mt-0.5 rounded border-navy-600 bg-navy-800 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-xs text-slate-400">
                    I understand that a {suffix} namespace is sovereign infrastructure. Asset release requires valid executor verification.
                  </span>
                </label>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="button"
                  onClick={() => {
                    if (!label.trim()) {
                      setError("Please enter a namespace name.");
                      return;
                    }
                    if (slug.length < 3) {
                      setError("Namespace name must be at least 3 characters.");
                      return;
                    }
                    if (reserved) {
                      setError(`"${slug}" is a reserved name.`);
                      return;
                    }
                    if (!agree) {
                      setError("You must agree to the terms to continue.");
                      return;
                    }
                    setError("");
                    setStep("confirm");
                  }}
                  className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-1.5"
                >
                  Continue to Confirm <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="max-w-lg mx-auto vault-card space-y-6">
            <h2 className="text-lg font-bold text-white">Confirm Registration</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-navy-700 pb-2">
                <span className="text-slate-400">Namespace</span>
                <span className="font-mono font-bold text-gold-400">{namespaceName}</span>
              </div>
              <div className="flex justify-between border-b border-navy-700 pb-2">
                <span className="text-slate-400">Plan</span>
                <span className="text-slate-200">{PLANS.find((p) => p.id === plan)?.label}</span>
              </div>
              <div className="flex justify-between border-b border-navy-700 pb-2">
                <span className="text-slate-400">Price</span>
                <span className="text-slate-200">{PLANS.find((p) => p.id === plan)?.price}</span>
              </div>
              {description && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Description</span>
                  <span className="text-slate-300 text-right max-w-xs">{description}</span>
                </div>
              )}
            </div>
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep("form")} className="btn-secondary flex-1 py-2.5">Back</button>
              <button onClick={handleConfirm} disabled={submitting} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering…</> : "Confirm & Register"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/20">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Namespace Registered!</h2>
            <p className="text-slate-400">
              <span className="font-mono font-bold text-gold-400">{namespaceName}</span> is now anchored on the Legacy Vault Protocol.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/vault/create" className="btn-primary px-6 py-2.5">Create First Vault</Link>
              <Link href="/namespaces" className="btn-secondary px-6 py-2.5">View Namespaces</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
