import Link from "next/link";
import Image from "next/image";
import {
  Shield, Lock, Key, FileText, Globe, Users, Clock,
  CheckCircle, ArrowRight, Eye, Zap, Layers,
  Database, Server, Hash, AlertTriangle, BookOpen,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Full vault lifecycle explanation page.
   Written for real clients — clear, human, no jargon walls.
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   Full vault lifecycle explanation page.
   Written for real clients — clear, human, no jargon walls.
───────────────────────────────────────────── */

export default function VaultExplainedPage() {
  return (
    <main className="min-h-screen bg-navy-950">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative border-b border-white/10 overflow-hidden min-h-[420px] flex items-center justify-center text-center">
        {/* Warm background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/legacy/hero-family-warm.png"
            alt="Family protected by Legacy Vault Protocol"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/70 to-navy-950/95" />
        </div>

        <div className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-gold-400 mb-6">
            <BookOpen className="h-3 w-3" /> The Complete Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            How Your Legacy Vault<br />
            <span className="text-gold-400">Actually Works</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Every layer explained in plain English — from the moment you create your namespace
            to the day your family receives exactly what you intended. No jargon. Just clarity.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/onboard" className="btn-primary px-8 py-3 font-bold inline-flex items-center gap-2">
              Set Up My Vault <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/namespaces/demo" className="btn-secondary px-6 py-3 backdrop-blur-sm">
              See a Live Example
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE BIG PICTURE ──────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Start Here</p>
          <h2 className="text-3xl font-black text-white mb-4">Think of it as a digital Fort Knox — that only opens on your terms.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Legacy Vault Protocol has three layers. Understanding them takes 5 minutes and changes how you think about estate planning forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              number: "1",
              color: "border-gold-500/30 bg-gold-500/5",
              iconColor: "text-gold-400",
              icon: Globe,
              title: "Your Namespace",
              subtitle: "Your sovereign address",
              desc: "Think of this as your estate's permanent home address on the protocol — like a PO Box that lives on a blockchain and can never be taken from you. Format: <code class='text-gold-400 bg-navy-800 px-1 rounded text-xs'>yourname.legacy</code>. It's the root identity that everything else is built under.",
            },
            {
              number: "2",
              color: "border-cyan-500/30 bg-cyan-500/5",
              iconColor: "text-cyan-400",
              icon: Database,
              title: "Your Vault",
              subtitle: "Encrypted container",
              desc: "Inside your namespace, you create one or more vaults. A vault is an encrypted container that holds your wallet addresses, documents, and asset inventory. Think of it as the actual safe — everything inside is locked with keys only you control.",
            },
            {
              number: "3",
              color: "border-purple-500/30 bg-purple-500/5",
              iconColor: "text-purple-400",
              icon: Key,
              title: "Your Release Gate",
              subtitle: "5-condition lock",
              desc: "You configure who gets what, and under what conditions. The vault stays sealed until 5 independent verifications are complete. No single person — not even your executor — can open it alone. This is what makes it fundamentally different from every other system.",
            },
          ].map(({ number, color, iconColor, icon: Icon, title, subtitle, desc }) => (
            <div key={number} className={`vault-card border ${color} relative`}>
              <div className={`absolute -top-3 -left-3 h-8 w-8 rounded-full flex items-center justify-center text-sm font-black ${color} border`}>
                <span className={iconColor}>{number}</span>
              </div>
              <Icon className={`h-7 w-7 ${iconColor} mb-4`} />
              <h3 className="text-base font-black text-white mb-0.5">{title}</h3>
              <p className={`text-xs font-semibold ${iconColor} mb-3`}>{subtitle}</p>
              <p className="text-sm text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── LAYER BY LAYER ───────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-16 bg-navy-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">Under the Hood</p>
            <h2 className="text-3xl font-black text-white">5 technology layers — each one matters.</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                layer: "Layer 1",
                icon: Lock,
                color: "text-gold-400",
                border: "border-gold-500/20",
                bg: "bg-gold-500/5",
                title: "AES-256-GCM Encryption with HKDF Keys",
                plain: "Your documents are locked before they ever leave your device.",
                detail: "When you upload a document, your browser encrypts it using AES-256-GCM — the same encryption used by the NSA for top secret data. The encryption key is derived using HKDF (a military-grade key stretching function) from a master secret that only you hold. The server receives only the locked blob — it mathematically cannot read your documents. If our servers were hacked tomorrow, every file they got would be useless gibberish.",
                tech: "AES-256-GCM · HKDF-SHA256 · Per-vault unique keys",
                analogy: "It's like putting your documents in a safe that you lock yourself before handing to a storage company. They store the safe — but you kept the only key.",
              },
              {
                layer: "Layer 2",
                icon: Server,
                color: "text-purple-400",
                border: "border-purple-500/20",
                bg: "bg-purple-500/5",
                title: "Private IPFS — Content-Addressed Storage",
                plain: "Your encrypted files are stored in a system where tampering is mathematically impossible.",
                detail: "After encryption, your files are stored on a private IPFS (InterPlanetary File System) network. IPFS is content-addressed — each file gets a unique fingerprint (CID) based entirely on its contents. If even one byte changes, the CID changes. This means any tampering with your files is instantly detectable. Your family's executor can independently verify every document hasn't been altered since you uploaded it.",
                tech: "Private IPFS · Swarm key isolation · CID content addressing",
                analogy: "Think of it like a document having its own unique DNA fingerprint. If anyone changes anything — even a comma — the DNA no longer matches and the fraud is provable.",
              },
              {
                layer: "Layer 3",
                icon: Hash,
                color: "text-cyan-400",
                border: "border-cyan-500/20",
                bg: "bg-cyan-500/5",
                title: "Private Blockchain + XRPL Anchoring",
                plain: "Every important action is written to an immutable ledger that no one can alter.",
                detail: "Every time you create a vault, upload a document, add an executor, or change a policy — a cryptographic record is written to a private EVM blockchain. Critical document hashes are also anchored to the public XRPL and Stellar blockchains. This creates a tamper-evident, court-ready audit trail. In probate proceedings, your executor can prove exactly what was in your vault, when it was added, and that nothing was changed — with mathematical certainty.",
                tech: "Private EVM chain · XRPL AccountSet Memo · Stellar MEMO_HASH · SHA-256",
                analogy: "Every action gets its own permanent timestamp — like a notary seal on every single event, but cryptographic and permanent rather than just a rubber stamp.",
              },
              {
                layer: "Layer 4",
                icon: Users,
                color: "text-blue-400",
                border: "border-blue-500/20",
                bg: "bg-blue-500/5",
                title: "W3C Verifiable Credentials + Role-Based Access",
                plain: "Everyone who touches your estate is cryptographically verified before they can act.",
                detail: "The people in your estate (executors, guardians, attorneys, beneficiaries) don't just get an email invitation — they receive W3C Verifiable Credentials, a global standard for cryptographic identity. Your executor must complete identity verification (the same standard banks use for high-value accounts) before any release process can begin. Each role gets exactly the access they need — nothing more.",
                tech: "W3C DID · VC 2.0 · NIST SP 800-63-4 IAL 2/3 · 6 scoped roles",
                analogy: "It's like requiring every person who enters the vault room to present a government-issued ID plus a cryptographic signature — and the system checks both automatically.",
              },
              {
                layer: "Layer 5",
                icon: Shield,
                color: "text-emerald-400",
                border: "border-emerald-500/20",
                bg: "bg-emerald-500/5",
                title: "5-Condition Release Protocol",
                plain: "Your vault opens only when five independent verifications are complete — and not a second sooner.",
                detail: "This is the most important layer. Before your beneficiaries can access anything, five conditions must ALL be satisfied: (1) Executor identity verified, (2) Death certificate uploaded and hashed, (3) Attorney or notary attestation, (4) Guardian quorum (e.g., 2 of 3 guardians approved), (5) Waiting period elapsed without dispute. Every condition is cryptographically recorded on-chain. If any condition is missing or forged — the vault stays locked. This is what prevents fraud, coercion, and premature access.",
                tech: "Multi-proof release engine · Guardian N-of-M quorum · On-chain condition tracking",
                analogy: "It's like a bank vault that requires five different keys from five different people, all verified independently, with a mandatory waiting period before it opens. No single person can cheat the system.",
              },
            ].map(({ layer, icon: Icon, color, border, bg, title, plain, detail, tech, analogy }) => (
              <div key={layer} className={`vault-card border ${border} ${bg}`}>
                <div className="flex items-start gap-5">
                  <div className="shrink-0">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${color} mb-2`}>{layer}</div>
                    <div className={`h-12 w-12 rounded-xl border ${border} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-white mb-1">{title}</h3>
                    <p className={`text-sm font-semibold ${color} mb-3`}>{plain}</p>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{detail}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-white/5 bg-navy-950/60 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Technical Stack</p>
                        <p className="text-xs text-slate-400 font-mono">{tech}</p>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-navy-950/60 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Simple Analogy</p>
                        <p className="text-xs text-slate-400 italic leading-relaxed">{analogy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISUAL DIAGRAMS ──────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">Visual Reference</p>
          <h2 className="text-3xl font-black text-white">See the architecture at a glance.</h2>
        </div>

        <div className="space-y-8">
          {/* 5-Layer Stack */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-gold-400" /> The 5 Protection Layers
            </h3>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/images/legacy/vault-layers-diagram.png"
                alt="Legacy Vault Protocol — 5 protection layers diagram"
                width={1200}
                height={675}
                className="w-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5-Proof Release */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" /> The 5-Proof Release Gate
              </h3>
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <Image
                  src="/images/legacy/five-proof-diagram.png"
                  alt="5-Proof Release Gate — all 5 conditions required"
                  width={800}
                  height={450}
                  className="w-full object-cover"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">All five conditions must be satisfied simultaneously. No exceptions.</p>
            </div>

            {/* Dead Man's Switch */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" /> Dead Man's Switch Flow
              </h3>
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <Image
                  src="/images/legacy/dead-mans-switch-flow.png"
                  alt="Dead Man's Switch — how the check-in system flows into the 5-proof release"
                  width={800}
                  height={450}
                  className="w-full object-cover"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">Silence alone never opens the vault — all 5 proofs still required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FULL LIFECYCLE ────────────────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">Complete Lifecycle</p>
          <h2 className="text-3xl font-black text-white">From setup to your family receiving access.</h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gold-500/50 via-cyan-500/30 to-transparent" />

          <div className="space-y-8 pl-16">
            {[
              {
                phase: "While You're Alive",
                phaseColor: "text-emerald-400",
                events: [
                  { icon: Globe, color: "bg-gold-500", title: "Register your namespace", body: "Claim yourname.legacy — your permanent sovereign estate address. Takes 3 minutes. Anchored on the private chain." },
                  { icon: Lock, color: "bg-cyan-500", title: "Create your vault and encrypt everything", body: "Upload documents, register wallet addresses, add assets. Everything is encrypted before it leaves your browser. The server never sees plaintext." },
                  { icon: Users, color: "bg-purple-500", title: "Add your team", body: "Designate your executor (who manages the release), guardians (who must approve), beneficiaries (who receive access), and an attorney (who attests)." },
                  { icon: Shield, color: "bg-blue-500", title: "Configure your release policy", body: "Set the guardian quorum (e.g., 2 of 3 must approve), waiting period (30–365 days), and whether attorney attestation is required." },
                  { icon: Clock, color: "bg-orange-500", title: "Set up dead man's switch", body: "Configure periodic check-ins. If you miss three check-ins in a row (customizable), your guardians are notified. The full release process only starts when all 5 conditions are met — not automatically." },
                  { icon: FileText, color: "bg-rose-500", title: "Seal your legacy messages", body: "Write personal messages to each beneficiary — letters, video notes, final wishes. Encrypted and sealed until the vault releases." },
                ],
              },
              {
                phase: "At the Triggering Event",
                phaseColor: "text-yellow-400",
                events: [
                  { icon: AlertTriangle, color: "bg-yellow-500", title: "Executor submits a release claim", body: "Your designated executor files a claim. This does not open the vault — it begins the verification process." },
                  { icon: Key, color: "bg-gold-500", title: "Identity verification", body: "The executor completes identity verification (IAL 2 — equivalent to bank account opening). A cryptographic Verifiable Credential is issued and recorded on-chain." },
                  { icon: FileText, color: "bg-slate-500", title: "Death certificate uploaded", body: "A certified copy of the death certificate is uploaded, SHA-256 hashed, and anchored to the private chain and XRPL. This is Condition 2." },
                  { icon: Shield, color: "bg-purple-500", title: "Attorney attests", body: "A licensed attorney or notary reviews the legal authority and signs a cryptographic attestation. Recorded on-chain. Condition 3." },
                ],
              },
              {
                phase: "The Release Process",
                phaseColor: "text-cyan-400",
                events: [
                  { icon: Users, color: "bg-blue-500", title: "Guardian quorum approves", body: "Each guardian receives a request. They independently verify the claim and sign their approval on-chain. Once the quorum threshold is reached (e.g., 2 of 3), Condition 4 is satisfied." },
                  { icon: Clock, color: "bg-orange-500", title: "Waiting period begins", body: "A mandatory dispute window opens (default: 30 days). During this period, any beneficiary can contest the release. This mirrors probate court requirements." },
                  { icon: CheckCircle, color: "bg-emerald-500", title: "All 5 conditions met — vault releases", body: "The protocol evaluates all conditions simultaneously. Only when all five are satisfied does the administrator authorize release. Access grants are issued to each beneficiary with their specific scope." },
                ],
              },
              {
                phase: "After Release",
                phaseColor: "text-emerald-400",
                events: [
                  { icon: Eye, color: "bg-emerald-500", title: "Beneficiaries receive scoped access", body: "Each beneficiary receives exactly what you designated — nothing more, nothing less. Cryptographically enforced. Your estate attorney gets legal documents. Your child gets their specific inheritance items. An auditor gets only hashes." },
                  { icon: FileText, color: "bg-rose-500", title: "Legacy messages delivered", body: "Your sealed messages are released to each recipient. Letters, video notes, final wishes — delivered exactly as you intended." },
                  { icon: Hash, color: "bg-slate-500", title: "Full audit trail preserved", body: "The complete chain of events remains publicly verifiable forever. Every action, every condition, every approval — immutably logged. Court-ready. Probate-ready." },
                ],
              },
            ].map(({ phase, phaseColor, events }) => (
              <div key={phase}>
                <div className={`text-xs font-black uppercase tracking-widest ${phaseColor} mb-5 -ml-10 flex items-center gap-3`}>
                  <div className={`h-3 w-3 rounded-full bg-current shrink-0`} />
                  {phase}
                </div>
                <div className="space-y-4">
                  {events.map(({ icon: Icon, color, title, body }) => (
                    <div key={title} className="vault-card flex gap-4 items-start">
                      <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES EXPLAINED ──────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-16 bg-navy-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">The People In Your Estate</p>
            <h2 className="text-2xl font-black text-white">6 roles. Each one has a specific job.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                role: "Owner",
                color: "text-gold-400 border-gold-500/30 bg-gold-500/5",
                icon: Key,
                power: "Full control while alive",
                desc: "You. Creates and manages the vault, adds all content, configures the release policy. Only the owner has master key access. Vault is completely under your control during your lifetime.",
                examples: ["Add/remove any content", "Change the release policy", "Add or remove team members", "Configure dead man's switch"],
              },
              {
                role: "Executor",
                color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
                icon: Users,
                power: "Manages the release process",
                desc: "The person (often an attorney or trusted family member) who initiates and manages the vault release. They must verify their identity before any action. They cannot access vault contents until all 5 conditions are met.",
                examples: ["Submit release claim", "Upload death certificate", "Coordinate guardians", "Receive asset inventory after release"],
              },
              {
                role: "Guardian",
                color: "text-purple-400 border-purple-500/30 bg-purple-500/5",
                icon: Shield,
                power: "Approves the release — cannot act alone",
                desc: "Independent parties (attorneys, trusted friends, institutions) who must co-sign the release. Their job is to prevent coercion and fraud. A quorum is required — no single guardian can approve or block alone.",
                examples: ["Review and approve release claim", "Can raise a dispute", "Never sees vault contents", "Signs cryptographic attestation"],
              },
              {
                role: "Attorney",
                color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
                icon: FileText,
                power: "Attests legal authority",
                desc: "A licensed attorney or notary who confirms the executor has proper legal authority. Their attestation is cryptographically recorded on-chain. This is a required condition in most vault configurations.",
                examples: ["Attest executor authority", "Access legal document package", "Review estate map", "Issue signed attestation"],
              },
              {
                role: "Beneficiary",
                color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
                icon: Eye,
                power: "Receives exactly what you designated",
                desc: "People or entities who inherit specific vault contents after release. Each beneficiary gets a cryptographically scoped access grant — only to the items you allocated to them. No beneficiary can see another's allocation.",
                examples: ["Receive allocated assets after release", "View only their designated items", "Access legacy messages addressed to them", "Can dispute during waiting period"],
              },
              {
                role: "Auditor",
                color: "text-slate-400 border-slate-500/30 bg-slate-500/5",
                icon: Hash,
                power: "Verifies integrity — no private data",
                desc: "Courts, accountants, or designated oversight parties who can verify the vault's audit trail without seeing any private content. They receive only hashes, timestamps, and event records — mathematically sufficient to verify nothing was tampered with.",
                examples: ["Verify audit trail hashes", "Check event timestamps", "Confirm chain anchors", "Never accesses documents or balances"],
              },
            ].map(({ role, color, icon: Icon, power, desc, examples }) => (
              <div key={role} className={`vault-card border ${color} flex flex-col`}>
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={`h-5 w-5 ${color.split(" ")[0]}`} />
                  <div>
                    <h3 className="text-sm font-black text-white">{role}</h3>
                    <p className={`text-xs font-semibold ${color.split(" ")[0]}`}>{power}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">{desc}</p>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Can do:</p>
                  <ul className="space-y-1">
                    {examples.map((e) => (
                      <li key={e} className="flex items-start gap-1.5 text-xs text-slate-500">
                        <CheckCircle className="h-3 w-3 text-emerald-400/60 mt-0.5 shrink-0" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">Common Questions</p>
          <h2 className="text-2xl font-black text-white">What people ask before they register.</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              q: "What happens if Legacy Vault Protocol shuts down?",
              a: "Your encrypted documents are stored on IPFS — a distributed network that continues to function without our servers. The smart contracts on the private chain are open source and can be run by anyone. Your data is not hostage to our business. This is by design.",
            },
            {
              q: "Can I include seed phrases and private keys?",
              a: "No — and that's a feature, not a limitation. Seed phrases should never be stored digitally, period. Instead, you register your public wallet addresses (which prove you own the wallets without exposing keys), and separately document where your seed phrases are stored physically. Your executor gets the location instructions, not the keys themselves.",
            },
            {
              q: "What if my executor dies before me?",
              a: "You can designate a primary and backup executor. The system supports a full succession chain for all roles. You should review and update your vault annually — or when life circumstances change.",
            },
            {
              q: "Does this replace my will?",
              a: "No. Legacy Vault Protocol complements — but does not replace — a properly executed will or trust. Actual legal authority to transfer assets at death depends on applicable estate law and court processes. Our system provides the digital infrastructure; your attorney provides the legal authority. See our Document Intelligence system for AI-drafted templates that your attorney can review.",
            },
            {
              q: "What does my family actually receive at release?",
              a: "Each beneficiary receives a scoped decryption key for only their designated items. They can access exactly what you allocated — the specific documents, wallet references, and asset inventory entries you marked as theirs. The vault owner's full inventory is only accessible to the executor and attorney.",
            },
            {
              q: "How long does the release process take?",
              a: "With a well-configured vault, typically 30–60 days. The biggest variable is the waiting period (which you set — default is 30 days) and how quickly your executor and guardians can complete their steps. In practice, if your team is prepared, the entire process can complete in under 45 days.",
            },
            {
              q: "Is this only for wealthy people?",
              a: "No — it's especially critical if you have crypto assets, digital business interests, or any assets that exist only digitally. The $68 trillion great wealth transfer is happening at every income level. If you have a crypto wallet, a brokerage account, or an online business, you need this.",
            },
            {
              q: "What does RUFADAA mean and why does it matter?",
              a: "RUFADAA (Revised Uniform Fiduciary Access to Digital Assets Act) is the law in most US states that governs whether fiduciaries (executors, trustees) can legally access your digital accounts after death. Legacy Vault Protocol is built around RUFADAA compliance — our executor authority flows are designed to give your executor the legal basis to act. Without this alignment, your executor could be legally blocked from accessing even your email.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="vault-card group cursor-pointer">
              <summary className="flex items-start justify-between gap-3 text-sm font-semibold text-white list-none">
                <span>{q}</span>
                <span className="text-gold-400 group-open:rotate-45 transition-transform shrink-0 mt-0.5">+</span>
              </summary>
              <p className="text-sm text-slate-400 leading-relaxed mt-4 pt-4 border-t border-white/10">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="border-t border-white/10 px-6 py-20 text-center bg-navy-900/40">
          <Image
            src="/images/legacy/logo-dark-square.png"
            alt="Legacy Vault Protocol"
            width={88}
            height={88}
            className="mx-auto mb-6 rounded-2xl drop-shadow-[0_0_24px_rgba(212,160,23,0.4)]"
          />
        <h2 className="text-3xl font-black text-white mb-4">
          Ready to build your sovereign estate?
        </h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Takes 20 minutes to set up. Lasts forever. Your family will thank you.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/onboard" className="btn-primary px-10 py-4 text-base font-black inline-flex items-center gap-2">
            Start Setup Wizard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/namespaces/demo" className="btn-secondary px-8 py-4 text-base">
            Explore Demo First
          </Link>
        </div>
      </section>
    </main>
  );
}
