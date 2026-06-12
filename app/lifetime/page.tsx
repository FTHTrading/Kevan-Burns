"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Globe, Shield, CheckCircle, ArrowRight, Loader2, Info, Lock, 
  Users, Vault, Wallet, Sparkles, MapPin, AlertTriangle
} from "lucide-react";
import Nav from "../components/Nav";
import { JsonLd } from "../components/JsonLd";

export default function LifetimePromoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [desiredNamespace, setDesiredNamespace] = useState("");
  const [suffix, setSuffix] = useState(".legacy");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<"stripe" | "crypto">("stripe");

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  const slug = slugify(desiredNamespace);
  const fullNamespace = slug ? `${slug}${suffix}` : "";

  async function handlePreRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!desiredNamespace.trim()) {
      setError("Please specify your desired namespace name.");
      return;
    }
    if (slug.length < 3) {
      setError("Namespace name must be at least 3 characters.");
      return;
    }
    if (!agree) {
      setError("You must agree to the zero-knowledge custody and registry terms to continue.");
      return;
    }

    setLoading(true);

    try {
      // Create namespace entitlement first
      const registerRes = await fetch("/api/namespaces/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespace: desiredNamespace,
          suffix: suffix,
          plan: "lifetime_presale",
          description: `Sovereign Lifetime Presale registered by ${name}`,
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.error || "Failed to register namespace entitlement.");
      }

      // Proceed to checkout dispatcher
      const checkoutRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: "LIFETIME_PRESALE",
          method: method,
          namespace: fullNamespace,
          userEmail: email.toLowerCase().trim(),
        }),
      });

      const checkoutData = await checkoutRes.json();

      if (checkoutData.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl;
      } else if (checkoutData.redirect) {
        window.location.href = checkoutData.redirect;
      } else if (checkoutData.mode === "crypto") {
        const txHash = prompt(
          `SOVEREIGN CRYPTO CHECKOUT:\n\nSend exactly $${checkoutData.amount} USDC to our Polygon Treasury:\n${checkoutData.payTo}\n\nMemo: ${checkoutData.memo}\n\nPaste your Polygon transaction hash once completed:`
        );
        if (!txHash) {
          setLoading(false);
          return;
        }

        const verifyRes = await fetch("/api/payments/confirm-onchain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: "LIFETIME_PRESALE",
            paymentTx: txHash.trim(),
            namespace: fullNamespace,
            email: email.toLowerCase().trim(),
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success || verifyData.redirect) {
          alert("Payment verified on-chain! Your Sovereign Lifetime Membership is active.");
          window.location.href = "/vault";
        } else {
          alert(verifyData.error || "On-chain verification failed. Our background worker will continue verification.");
        }
      } else {
        alert("Failed to initiate payment gateway.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during pre-registration.");
    } finally {
      setLoading(false);
    }
  }

  const promoSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Troptions Unity Legacy Vault Sovereign Lifetime Presale",
    description: "Generational zero-knowledge Web3 estate planning with permanent namespace registry and no monthly subscription fees.",
    brand: { "@type": "Brand", name: "Troptions Unity Legacy Vault" },
    offers: {
      "@type": "Offer",
      price: "499.95",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://vault.genesis402.com/lifetime",
    },
    areaServed: { "@type": "City", name: "Norcross" },
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-200 overflow-x-hidden font-sans">
      <Nav />

      {/* Subtle Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <section className="relative border-b border-white/5 bg-gradient-to-b from-[#090e1a] to-[#070b13] px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 text-xs font-black tracking-widest text-amber-400 uppercase">
            💥 Exclusive Limited Launch Offer
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
            Sovereign Lifetime Membership
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            Permanently lock in your family's estate registry. Pay once, own your namespace, vaults, and IPFS data backups forever.
          </p>
          <div className="flex justify-center gap-3 flex-wrap pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 font-semibold">
              ✓ Zero Monthly Subscription Fees
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 font-semibold">
              ✓ 1,000 TROPTIONS Included
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 font-semibold">
              ✓ 10 Sovereign Vaults
            </span>
          </div>
        </div>
      </section>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Left Side: Copy, Value, Comparison & Explanation */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Fee Warning Comparison Box */}
          <div className="bg-gradient-to-r from-red-500/10 to-amber-500/5 rounded-3xl border-2 border-red-500/20 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Free Suffix vs Lifetime Membership
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-semibold">
              While the standard `.legacy` free registration allows you to claim a name instantly, it is subject to monthly protocol maintenance fees of <strong className="text-white">$15.00/month</strong> to keep the on-chain registry state active and route IPFS gateway backups.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed font-semibold">
              The <span className="text-amber-400 font-bold">Sovereign Lifetime Membership</span> is a one-time presale offer that eliminates all monthly, annual, and maintenance fees forever. Own your estate registry permanently on L0.
            </p>
          </div>

          {/* Pricing Math */}
          <div className="vault-card space-y-6">
            <h3 className="text-lg font-bold text-white">The Lifetime "No-Brainer" Value</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-white/5 rounded-2xl p-4 bg-black/20 text-center">
                <p className="text-xs text-slate-400 font-bold">1-Year Subscription</p>
                <p className="text-xl font-bold text-slate-300 mt-1">$599.40</p>
              </div>
              <div className="border border-white/5 rounded-2xl p-4 bg-black/20 text-center">
                <p className="text-xs text-slate-400 font-bold">10-Year Subscription</p>
                <p className="text-xl font-bold text-slate-300 mt-1">$5,994.00</p>
              </div>
              <div className="border border-amber-500/30 rounded-2xl p-4 bg-amber-500/10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-navy-950 text-[9px] font-black px-2 py-0.5 rounded-bl">SAVE 91%</div>
                <p className="text-xs text-amber-400 font-black">Lifetime Presale</p>
                <p className="text-2xl font-black text-amber-400 mt-1">$499.95</p>
              </div>
            </div>
          </div>

          {/* What is Included */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-white">What is included in your Lifetime Membership:</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Vault, title: "10 Generational Vaults", desc: "Up to 10 separate vaults for business succession, trusts, family, and assets." },
                { icon: Globe, title: "Sovereign Domain", desc: "1 Permanent .legacy or .troptions namespace registry anchored on Layer 0." },
                { icon: Wallet, title: "1,000 TROPTIONS Tokens", desc: "Tokens issued automatically to pay for state updates and validation anchors." },
                { icon: Shield, title: "Zero-Knowledge Encryption", desc: "Local AES-256 client-side encryption. We never see your master key or data." },
                { icon: Lock, title: "5-Proof Release Protocol", desc: "Advanced waiting gates, time locks, and biometric/guardian quorum releases." },
                { icon: Users, title: "Priority Setup Call", desc: "White-glove coordination from our Peachtree Parkway technology office." }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How It Works - The Minting Process */}
          <div className="vault-card space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" /> How It Works — The Minting & Escrow Process
            </h3>
            
            <div className="space-y-4 text-xs text-slate-400">
              <div className="border-l-2 border-amber-500 pl-4 space-y-1">
                <p className="font-bold text-slate-200">1. Claim your Namespace Domain</p>
                <p>Registering `smithfamily.legacy` creates a digital root identity anchored directly to the Hyperledger Besu EVM gateway and public ledgers.</p>
              </div>
              <div className="border-l-2 border-amber-500 pl-4 space-y-1">
                <p className="font-bold text-slate-200">2. Generate client-side ZK Proofs</p>
                <p>Your local client compiles a SHA-256 manifest of your vaults, deeds, and wallets. We push this fingerprint to IPFS without exposing your raw files.</p>
              </div>
              <div className="border-l-2 border-amber-500 pl-4 space-y-1">
                <p className="font-bold text-slate-200">3. Cross-Chain Anchoring</p>
                <p>Our background worker mints the namespace registry state across Solana, XRPL, and Stellar public networks utilizing the 1,000 TROPTIONS tokens.</p>
              </div>
              <div className="border-l-2 border-amber-500 pl-4 space-y-1">
                <p className="font-bold text-slate-200">4. Autonomous Release Execution</p>
                <p>If you fail to ping your Dead Man's Switch, the 5-Proof validator triggers a quorum request to your executors, unlocking files directly to heirs.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Pre-Registration Form */}
        <div className="lg:col-span-5">
          <div className="vault-card border-2 border-amber-500 bg-gradient-to-b from-[#0e1627] to-[#0a0f1d] shadow-2xl p-6 sm:p-8 space-y-6 sticky top-24">
            
            {/* Header */}
            <div className="space-y-1 text-center lg:text-left">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-black bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full inline-block">
                ⚡ Presale Live
              </span>
              <h3 className="text-xl font-black text-white">Pre-Register Now</h3>
              <p className="text-xs text-slate-400 font-semibold">Only 9 slots remaining in Gwinnett County cohort</p>
            </div>

            {/* Form */}
            <form onSubmit={handlePreRegister} className="space-y-4">
              
              <div>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="John Smith" 
                  className="form-input" 
                  required 
                />
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="john@example.com" 
                  className="form-input" 
                  required 
                />
              </div>

              <div>
                <label className="form-label">Desired Namespace Domain</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={desiredNamespace} 
                    onChange={e => setDesiredNamespace(e.target.value)} 
                    placeholder="smithfamily" 
                    className="form-input flex-1 font-mono" 
                    required 
                  />
                  <select
                    value={suffix}
                    onChange={e => setSuffix(e.target.value)}
                    className="bg-navy-800 border border-white/20 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-bold"
                  >
                    <option value=".legacy">.legacy</option>
                    <option value=".troptions">.troptions</option>
                  </select>
                </div>
                {fullNamespace && (
                  <p className="text-[10px] text-amber-400 font-mono mt-1">
                    Preview: <span className="font-bold">{fullNamespace}</span>
                  </p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="form-label">Payment Method</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setMethod("stripe")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                      method === "stripe" 
                        ? "bg-amber-500 text-navy-950 border-amber-500" 
                        : "border-white/10 text-slate-300 bg-black/20 hover:bg-black/35"
                    }`}
                  >
                    Stripe Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("crypto")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                      method === "crypto" 
                        ? "bg-amber-500 text-navy-950 border-amber-500" 
                        : "border-white/10 text-slate-300 bg-black/20 hover:bg-black/35"
                    }`}
                  >
                    USDC / Polygon
                  </button>
                </div>
              </div>

              {/* Disclosures & Checklist */}
              <div className="space-y-2.5 bg-black/40 p-3 rounded-xl border border-white/5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={agree} 
                    onChange={e => setAgree(e.target.checked)}
                    className="mt-0.5 rounded border-white/15 bg-black text-amber-500 focus:ring-0 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 leading-normal font-semibold">
                    I acknowledge that I am registering a permanent cryptographic namespace. I understand that I am responsible for securing my private keys, and that all estate configurations are RUFADAA compliant.
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-xs text-red-400 font-bold bg-red-400/10 border border-red-400/20 p-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 text-xs transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <>Claim Sovereign Lifetime Access <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <p className="text-[10px] text-center text-slate-500 font-bold">
              Secure client-side encryption. Auditable on-chain metadata hash records.
            </p>
          </div>
        </div>

      </div>

      {/* Norcross GA / Trust Badge Location Section */}
      <section className="bg-gradient-to-b from-[#070b13] to-[#03060f] border-t border-white/5 py-16 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center text-amber-500">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Anchored in Peachtree Corners / Norcross GA</h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Our technology stack is developed and anchored out of our office at <strong>5655 Peachtree Parkway, Norcross, GA 30092</strong>. We leverage decentralized infrastructure to provide Georgia estates with immediate, secure backup channels that bypass months of standard Gwinnett County probate court proceedings.
          </p>
          <p className="text-xs text-slate-500">
            © 2026 FTH Trading · Legacy Vault Protocol. Not legal advice. Zero-knowledge cryptographic protocol.
          </p>
        </div>
      </section>

      <JsonLd data={promoSchema} />
    </div>
  );
}
