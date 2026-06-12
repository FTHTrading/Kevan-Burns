import Link from "next/link";
import Image from "next/image";
import {
  Shield, FileText, Heart, Users, Clock, CheckCircle,
  ArrowRight, Star, Lock, Wallet, Globe, ChevronRight,
} from "lucide-react";
import { VaultCard3DDynamic as VaultCard3D } from "../components/DynamicComponents";
import PricingCards from "../components/PricingCards";

export default function LegacyVaultPage() {
  const plans = [
    {
      plan:     "Essential Vault",
      price:    "$29.95",
      period:   "/month",
      desc:     "Straightforward legacy protection for families and individuals",
      features: [
        "1 Sovereign Namespace (.legacy or .troptions)",
        "Unlimited client-side AES-256 encrypted documents",
        "Full 5-Proof Release Protocol + Dead Man's Switch",
        "Crypto wallet registry (8+ chains including Unity Token)",
        "Grok AI document generation — 13 Georgia-compliant templates",
        "Legacy messages to beneficiaries",
        "XRPL + Stellar + Unity Token hash anchoring",
        "Basic guardian quorum",
      ],
      cta:      "Start 14-Day Free Trial",
      href:     "/onboard",
      highlight: false,
    },
    {
      plan:     "Premium Estate Vault",
      price:    "$49.95",
      period:   "/month",
      desc:     "Scaled for complex families, trusts, and estates (most popular)",
      features: [
        "Everything in Essential Vault",
        "Up to 5 vaults under one namespace",
        "Business succession documents & real estate tokenization",
        "Multi-family namespace support",
        "Priority attorney coordination (Georgia licensed referrals)",
        "White-glove setup call from our Norcross Technology Park office",
        "SOC 2 audit reports on request",
        "Custom guardian quorum + advanced PLONK ZK configurations",
        "Troptions Pay + Unity Token priority perks",
        "Multiple time-locked releases + tiered heir access",
        "Heirloom Sovereign Vault AI — Strategist mode (private executor, death scenario sims, heir tutor)",
      ],
      cta:      "Start Premium Plan",
      href:     "/onboard",
      highlight: true,
    },
    {
      plan:     "Elite Trust Vault",
      price:    "$89.95",
      period:   "/month",
      desc:     "Advanced privacy controls, custom ZK trust quorums, and active Heirloom Trust Defense AI",
      features: [
        "Everything in Premium Estate Vault",
        "Multi-jurisdiction data privacy layers (US + Swiss/offshore)",
        "Multiple ZK trust quorums with customizable thresholds",
        "Asset protection triggers (secure redirection on unauthorized access)",
        "Biometric + geographic + time-based release triggers",
        "Plausible deniability trust architecture",
        "Up to 10 vaults, full custom ZK + SOC 2 audits",
        "Heirloom Trust AI — Trust Defense mode (advanced kill-switch simulations, active scenario analysis)",
      ],
      cta:      "Start Elite Trust Plan",
      href:     "/onboard",
      highlight: false,
    },
  ];

  return (
    <main className="min-h-screen bg-warm-50 text-estate-900 overflow-x-hidden">
      {/* Trust bar */}
      <div className="border-b px-4 py-1.5 text-center bg-amber-50 border-amber-200/60 text-amber-800 font-bold relative z-30">
        <span className="text-xs font-medium uppercase tracking-wider">
          Unykorn Platforms • Moltbook Genesis Protocol • Live on Solana & Stellar • Deterministic Systems
        </span>
      </div>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Background — warm home photography */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/legacy/hero-family-warm.png"
            alt="Multi-generational family protected by Legacy Vault"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Gradient — strong coverage left so text reads, photo shows right */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-warm-50/92 to-warm-50/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-warm-50/95" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center w-full">

          {/* Left — copy */}
          <div>
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border-2 border-amber-300 px-4 py-2 text-xs font-black text-amber-900 mb-8">
              <Heart className="h-3.5 w-3.5 text-amber-600" fill="currentColor" />
              Built for families who love each other
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-estate-955 leading-[1.05] mb-6" style={{ color: '#1a0f00' }}>
              Your family's<br />
              future,{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-amber-700">protected.</span>
                <span
                  className="absolute bottom-1 left-0 right-0 h-3 bg-amber-200/80 -skew-x-3 -z-10"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <p className="text-xl leading-relaxed mb-4 max-w-xl font-medium" style={{ color: '#2d1a00' }}>
              Everything your family will ever need — your will, your wallets, your final wishes —
              <strong style={{ color: '#1a0f00' }}> organized, encrypted, and ready</strong> for when they need it most.
            </p>
            <p className="text-base mb-10 max-w-lg font-medium" style={{ color: '#4a3520' }}>
              Setup takes 20 minutes. The peace of mind lasts forever.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/onboard"
                className="group inline-flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 transition-all px-8 py-4 text-base font-black text-white shadow-lg shadow-amber-600/30 hover:shadow-amber-700/40 hover:scale-[1.02]"
              >
                Protect My Family
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/namespaces/demo"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-estate-300 bg-white hover:bg-warm-100 transition-all px-7 py-4 text-base font-bold text-estate-700 hover:border-amber-300"
              >
                See How It Works
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center gap-5 text-sm flex-wrap font-semibold" style={{ color: '#4a3520' }}>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
                <span className="ml-1 font-semibold text-estate-700">Trusted by families</span>
              </div>
              <span className="text-estate-300">·</span>
              <span>🔐 AES-256 encrypted</span>
              <span className="text-estate-300">·</span>
              <span>⛓️ Blockchain anchored</span>
            </div>
          </div>

          {/* Right — 3D vault card */}
          <div className="flex justify-center lg:justify-end items-center">
            <div className="relative">
              {/* Ambient glow */}
              <div className="absolute -inset-8 bg-amber-400/10 rounded-full blur-3xl" />
              <VaultCard3D />
              {/* Floating trust badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-warm-200 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-black text-estate-800">5-Proof Protected</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-warm-200 flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-black text-estate-800">Zero-Knowledge</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-warm-50 to-transparent z-10" />
      </section>

      {/* ── THE QUESTION ──────────────────────────────── */}
      <section className="relative bg-warm-50 px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-4">Ask yourself</p>
          <h2 className="text-4xl sm:text-5xl font-black text-estate-900 leading-tight mb-8">
            If something happened to you tomorrow, would your family know what to do?
          </h2>
          <p className="text-xl text-estate-600 leading-relaxed mb-6">
            Where are your passwords? Your crypto wallets? Your will? Your insurance policies?
            Would they know who to call? What accounts you have? Where to even start?
          </p>
          <p className="text-lg text-estate-500 mb-10">
            <strong className="text-estate-800">Most families don't.</strong> That's not love —
            that's a crisis waiting to happen.
          </p>

          {/* 3 hard truths */}
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { stat: "$140B+",    label: "in crypto lost permanently", desc: "Inaccessible wallets, no recovery plan" },
              { stat: "18 months", label: "average probate time",       desc: "Your family waits while courts decide" },
              { stat: "2 in 3",    label: "adults have no will",        desc: "Leaving everything to chance" },
            ].map(({ stat, label, desc }) => (
              <div
                key={stat}
                className="rounded-3xl bg-estate-900 p-6 text-left"
                style={{ transform: "translateZ(0)" }}
              >
                <div className="text-3xl font-black text-amber-400 mb-1">{stat}</div>
                <div className="text-sm font-bold text-white mb-1">{label}</div>
                <div className="text-xs text-estate-400 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO SHOWCASE ────────────────────────────── */}
      <section className="bg-estate-900 px-6 py-20 border-t border-b border-estate-850 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">Watch the Explainer</p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
            Your Legacy, Always Within Reach
          </h2>
          <p className="text-estate-200 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
            See how the 5-Proof Release Protocol works, how we secure your zero-knowledge vaults, and how we keep your family safe.
          </p>

          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10 max-w-3xl mx-auto bg-black/40 backdrop-blur-md">
            <video 
              src="/your-legacy.mp4" 
              controls 
              className="w-full h-auto aspect-video rounded-3xl"
              poster="/images/legacy/hero-vault.png"
            />
          </div>
        </div>
      </section>

      {/* ── THE SOLUTION ──────────────────────────────── */}
      <section className="bg-white px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-4">The answer</p>
            <h2 className="text-4xl sm:text-5xl font-black text-estate-900 mb-5 leading-tight">
              One vault. Everything organized.<br />
              <span className="text-amber-600">Your family protected.</span>
            </h2>
            <p className="text-xl text-estate-500 max-w-2xl mx-auto leading-relaxed">
              Legacy Vault Protocol is the complete digital estate system — simple enough to set up
              in an afternoon, strong enough to protect your family for generations.
            </p>
          </div>

          {/* 3-step process */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-12 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: FileText,
                  title: "Organize Everything",
                  body: "Upload your will, your wallet addresses, insurance policies, and any documents your family will need. All encrypted before it ever leaves your device.",
                  color: "bg-amber-50 border-amber-200",
                  iconBg: "bg-amber-500",
                },
                {
                  step: "02",
                  icon: Users,
                  title: "Choose Your Team",
                  body: "Designate your executor, guardians, and who gets what. Our AI helps generate the legal documents. Attorney review included in the workflow.",
                  color: "bg-blue-50 border-blue-200",
                  iconBg: "bg-blue-500",
                },
                {
                  step: "03",
                  icon: Heart,
                  title: "Rest Easy",
                  body: "The vault seals. When the time comes, your 5-proof release protocol guides your family through every step — no confusion, no court delays.",
                  color: "bg-emerald-50 border-emerald-200",
                  iconBg: "bg-emerald-500",
                },
              ].map(({ step, icon: Icon, title, body, color, iconBg }) => (
                <div
                  key={step}
                  className={`rounded-3xl border-2 ${color} p-8 relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`h-14 w-14 rounded-2xl ${iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-xs font-black text-estate-400 mb-2 tracking-widest">STEP {step}</div>
                  <h3 className="text-xl font-black text-estate-900 mb-3">{title}</h3>
                  <p className="text-estate-600 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT GOES IN YOUR VAULT ───────────────────── */}
      <section className="bg-warm-50 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-4">Inside your vault</p>
              <h2 className="text-4xl font-black text-estate-900 mb-5 leading-tight">
                Everything your family needs.<br />
                <span className="text-amber-600">Nothing they don't.</span>
              </h2>
              <p className="text-lg text-estate-600 leading-relaxed mb-8">
                You control exactly who sees what and when. Your children get their inheritance.
                Your executor gets your asset inventory. Your attorney gets the legal documents.
                Each person gets only what you chose for them.
              </p>
              <Link href="/onboard" className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 transition-all px-7 py-3.5 font-bold text-white">
                Start Organizing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FileText, label: "Will & Trust",         desc: "AI-drafted, attorney-ready",    color: "text-amber-600 bg-amber-50 border-amber-200" },
                { icon: Wallet,   label: "Crypto Wallets",        desc: "All chains, public addresses",  color: "text-blue-600 bg-blue-50 border-blue-200" },
                { icon: Heart,    label: "Personal Messages",     desc: "Sealed letters to loved ones",  color: "text-rose-600 bg-rose-50 border-rose-200" },
                { icon: Shield,   label: "Insurance Policies",    desc: "Encrypted, organized",          color: "text-purple-600 bg-purple-50 border-purple-200" },
                { icon: Globe,    label: "Digital Accounts",      desc: "Passwords secured",             color: "text-green-600 bg-green-50 border-green-200" },
                { icon: Users,    label: "Business Interests",    desc: "Succession instructions",       color: "text-orange-600 bg-orange-50 border-orange-200" },
                { icon: Clock,    label: "Healthcare Directives", desc: "Your final wishes honored",     color: "text-teal-600 bg-teal-50 border-teal-200" },
                { icon: Lock,     label: "Release Policy",        desc: "5-proof security gate",         color: "text-red-600 bg-red-50 border-red-200" },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div
                  key={label}
                  className={`rounded-2xl border-2 ${color} p-4 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-default`}
                >
                  <Icon className={`h-5 w-5 ${color.split(" ")[0]} mb-2`} />
                  <p className="text-sm font-bold text-estate-900">{label}</p>
                  <p className="text-xs text-estate-500 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EMOTIONAL MOMENT ──────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/legacy/hero-family-warm.png"
            alt="Multi-generational family reviewing legacy documents together"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-estate-900/75" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-28 text-center">
          <p className="text-amber-300 font-bold text-sm uppercase tracking-widest mb-6">What this is really about</p>
          <blockquote className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.2] mb-10">
            "The greatest gift you can give your family is not just money —
            it's <span className="text-amber-400">clarity</span>."
          </blockquote>
          <p className="text-xl text-estate-300 leading-relaxed max-w-2xl mx-auto mb-10">
            Every year, families are torn apart by confusion, disputes, and inaccessible assets
            after a loved one passes. A 20-minute setup today prevents months of pain for the
            people you love most.
          </p>
          <Link
            href="/onboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 transition-all px-10 py-4 text-base font-black text-estate-900 shadow-xl shadow-amber-500/30"
          >
            Give My Family Clarity Today
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── HOW WE'RE DIFFERENT ───────────────────────── */}
      <section className="bg-white px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-4">Why us</p>
            <h2 className="text-4xl font-black text-estate-900 mb-4">
              Not a digital filing cabinet.<br />
              <span className="text-amber-600">A sovereign estate protocol.</span>
            </h2>
            <p className="text-estate-600 max-w-2xl mx-auto text-lg">
              GoodTrust stores files. Everplans organizes folders. We built the infrastructure
              that actually ensures your wishes are carried out — cryptographically.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border-2 border-warm-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200">
                  <th className="py-4 pl-6 pr-3 text-left text-xs font-bold text-estate-400 uppercase tracking-wider w-1/3">Feature</th>
                  <th className="px-4 py-4 text-center text-sm font-black text-amber-700 bg-amber-50/60 w-1/3">
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="h-4 w-4" />
                      Legacy Vault
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-estate-400 w-1/3">Everyone Else</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Client-side encryption (we never see your data)",      true,  false],
                  ["Blockchain-anchored audit trail",                       true,  false],
                  ["5-proof release gate — legally & cryptographically",    true,  false],
                  ["Guardian quorum (no single person can steal access)",   true,  false],
                  ["AI-generated legal documents (Grok 6-agent pipeline)",  true,  false],
                  ["XRPL + Stellar chain anchoring",                        true,  false],
                  ["Dead man's switch → 5-proof protocol (not email spam)", true,  false],
                  ["Personal legacy messages sealed until release",         true,  "Partial"],
                  ["Crypto wallet registry (all 8 chains)",                 true,  false],
                  ["Self-hostable — no vendor lock-in",                     true,  false],
                ].map(([feat, lvp, them]) => (
                  <tr key={String(feat)} className="border-b border-warm-100 hover:bg-warm-50 transition-colors">
                    <td className="py-3.5 pl-6 pr-3 text-sm text-estate-700 font-medium">{feat as string}</td>
                    <td className="px-4 py-3.5 text-center bg-amber-50/30">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {them === "Partial"
                        ? <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Partial</span>
                        : <span className="text-estate-300 text-lg">–</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-6">
            <Link href="/compare" className="text-sm font-semibold text-amber-700 hover:text-amber-600 inline-flex items-center gap-1">
              Full comparison of all 9 competitors <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DOCUMENT AI ───────────────────────────────── */}
      <section className="bg-warm-50 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-estate-900 via-estate-800 to-amber-900 p-10 sm:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-amber-300 mb-6">
                  ✦ Powered by Grok AI
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                  Your will, generated<br />
                  <span className="text-amber-400">in minutes.</span>
                </h2>
                <p className="text-estate-300 leading-relaxed mb-6">
                  Our 6-agent Grok AI pipeline drafts legally structured wills, trusts, powers of attorney,
                  and 10 more estate documents. ESIGN · UETA · RUFADAA compliance built in.
                  Every document SHA-256 fingerprinted and XRPL-anchored.
                </p>
                <Link href="/docs-vault/generate" className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 transition-all px-7 py-3.5 font-bold text-estate-900">
                  Generate My Documents <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Last Will & Testament",
                  "Revocable Living Trust",
                  "Durable Power of Attorney",
                  "Healthcare Directive",
                  "Digital Asset Will",
                  "Executor Package",
                  "Beneficiary Letters",
                  "Estate Asset Inventory",
                  "Business Succession",
                  "Guardian Nomination",
                  "Trust Amendment",
                  "NDA (Estate)",
                ].map((doc) => (
                  <div key={doc} className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-3 py-2.5">
                    <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-white leading-tight">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────── */}
      <section className="bg-white px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-4">Peace of mind</p>
            <h2 className="text-4xl font-black text-estate-900">Families who planned ahead.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name:  "Sarah M.",
                role:  "Wife & Mother of 3",
                quote: "After my husband set up our vault, I actually slept. I know exactly what to do, who to call, where everything is. That peace of mind is priceless.",
                stars: 5,
              },
              {
                name:  "Marcus T.",
                role:  "Business Owner, Crypto Investor",
                quote: "I had over $400k in crypto with no succession plan. My executor would have lost everything. Legacy Vault was the most important financial decision I made this year.",
                stars: 5,
              },
              {
                name:  "The Chen Family",
                role:  "Estate Planning for 3 Generations",
                quote: "When Dad passed, we had access to everything within weeks — not the years-long nightmare we'd heard horror stories about. He had planned ahead with Legacy Vault.",
                stars: 5,
              },
            ].map(({ name, role, quote, stars }) => (
              <div
                key={name}
                className="rounded-3xl bg-warm-50 border-2 border-warm-200 p-7 relative group hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-estate-700 leading-relaxed mb-5 italic">"{quote}"</p>
                <div>
                  <p className="font-black text-estate-900 text-sm">{name}</p>
                  <p className="text-estate-500 text-xs">{role}</p>
                </div>
                {/* Quote mark decoration */}
                <div className="absolute top-5 right-6 text-6xl font-serif text-amber-100 leading-none select-none" aria-hidden>"</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING / CTA ─────────────────────────────── */}
      <section className="bg-warm-50 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-4">Simple, honest pricing</p>
            <h2 className="text-4xl font-black text-estate-900 mb-4">What's your family's peace of mind worth?</h2>
            <p className="text-estate-600 text-lg">Less than a dinner out. For a lifetime of protection.</p>
          </div>

          <PricingCards plans={plans} />

          {/* Sovereign Lifetime Presale Promo Banner */}
          <div className="mt-16 bg-gradient-to-r from-[#03060f] via-[#0b1733] to-[#03060f] rounded-3xl border-2 border-amber-500 overflow-hidden shadow-2xl text-left">
            <div className="grid md:grid-cols-12 gap-8 p-8 md:p-12 items-center">
              <div className="md:col-span-8 space-y-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black tracking-widest text-amber-400 uppercase">
                  💥 Limited Launch Presale
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Get Lifetime Sovereign Protection & Save 91.7%
                </h2>
                <p className="text-slate-300 text-base leading-relaxed font-semibold">
                  Skip recurring monthly fees forever. Register your sovereign Web3 space with the <strong className="text-amber-400">Sovereign Lifetime Presale</strong>. Pay once, own your namespace, vaults, and encrypted IPFS data backups forever.
                </p>
                <p className="text-xs text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2 inline-block">
                  ⚠️ Note: Free .legacy namespace registries are subject to standard monthly protocol maintenance fees after setup. Secure this lifetime offer to eliminate monthly fees completely.
                </p>
                
                <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-5">
                  <div>
                    <p className="text-xs text-slate-400">10-Year Subscription Value</p>
                    <p className="text-2xl font-black text-slate-300 line-through">$5,994.00</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 font-bold">Lifetime Presale Price</p>
                    <p className="text-3xl font-black text-amber-400">$499.95</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">What you receive immediately:</p>
                  <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">✓ Permanent Premium Estate Vaults (Up to 10)</li>
                    <li className="flex items-center gap-2">✓ 1,000 TROPTIONS utility tokens included</li>
                    <li className="flex items-center gap-2">✓ Permanent Sovereign Namespace (.legacy or .troptions)</li>
                    <li className="flex items-center gap-2">✓ Multi-Chain Wallets (EVM, Solana, XRPL, Stellar)</li>
                    <li className="flex items-center gap-2">✓ 5-Proof ZK release gates + DMS</li>
                    <li className="flex items-center gap-2">✓ White-glove heirloom strategist setup call</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    href="/lifetime"
                    className="inline-flex justify-center items-center rounded-2xl bg-amber-500 hover:bg-amber-400 text-estate-900 font-black px-8 py-4 text-base transition-all text-center shadow-lg shadow-amber-500/20"
                  >
                    Claim Lifetime Presale Now
                  </Link>
                  <Link
                    href="/lifetime?crypto=1"
                    className="inline-flex justify-center items-center rounded-2xl border border-white/20 hover:bg-white/5 text-white font-bold px-6 py-4 text-sm transition-all text-center"
                  >
                    Pay with USDC / TROPTIONS
                  </Link>
                </div>
              </div>

              <div className="md:col-span-4 flex justify-center">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                  <img
                    src="/images/presale.png"
                    alt="Legacy Presale Lifetime Offer"
                    className="w-full max-w-sm md:max-w-md h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm mt-8">
            No credit card required for trial · Cancel anytime · Data remains yours forever
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-estate-900 px-6 py-28 text-center">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image src="/images/legacy/hero-family-warm.png" alt="" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-estate-900/70 z-0" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <Image
            src="/images/legacy/logo-dark-square.png"
            alt="Legacy Vault Protocol"
            width={100}
            height={100}
            className="mx-auto mb-8 drop-shadow-[0_0_40px_rgba(212,160,23,0.5)] rounded-2xl"
          />
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Start today.<br />
            <span className="text-amber-400">Your family will thank you.</span>
          </h2>
          <p className="text-estate-300 text-xl mb-10 max-w-xl mx-auto">
            20 minutes to set up. A lifetime of protection.
            The most loving thing you can do for the people you'll leave behind.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/onboard"
              className="group inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 transition-all px-10 py-4 text-base font-black text-estate-900 shadow-xl shadow-amber-500/30"
            >
              Protect My Family Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/namespaces/demo"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-estate-600 hover:border-amber-500 transition-all px-8 py-4 text-base font-bold text-estate-300 hover:text-amber-300"
            >
              Explore the Demo First
            </Link>
          </div>

          <p className="text-estate-500 text-xs mt-8">
            Legacy Vault Protocol is infrastructure software, not legal advice. Documents require attorney review.
            Consult qualified legal counsel for estate planning.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="bg-estate-900 border-t border-estate-800 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <Image
              src="/images/legacy/logo-horizontal.png"
              alt="Legacy Vault Protocol"
              width={200}
              height={48}
              className="h-9 w-auto"
            />
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-estate-500">
              {[
                { href: "/vault-explained", label: "How It Works" },
                { href: "/docs-vault",      label: "Documents" },
                { href: "/compare",         label: "Why Us" },
                { href: "/client",          label: "Client Hub" },
                { href: "/onboard",         label: "Get Started" },
                { href: "/status",          label: "System Status" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-amber-400 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-estate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-estate-600">
            <p>© 2026 Unykorn Platform · Sovereign Web3 Infrastructure · All rights reserved</p>
            <p>Powered by Unykorn • Solana & Stellar • Sovereign Web3 Namespaces</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
