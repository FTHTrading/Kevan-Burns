import Link from "next/link";
import { BookOpen, Search } from "lucide-react";

export const metadata = { title: "Terms & Definitions — Legacy Vault Protocol" };

const GLOSSARY: { term: string; category: string; definition: string; related?: string[] }[] = [
  // Core concepts
  { term: "Namespace", category: "Core", definition: "A sovereign estate address on the protocol, formatted as `name.legacy`. The root identity that parents all vaults, documents, and wallet registrations for an individual or entity.", related: ["Vault", "Layer 0", "Namespace Registry"] },
  { term: "Vault", category: "Core", definition: "A logical container within a namespace that holds encrypted documents, wallet references, and associated release policies. One namespace may contain many vaults (e.g. Primary Estate, Digital Assets, Business Interests).", related: ["Namespace", "Release Policy", "Document CID"] },
  { term: "Release Policy", category: "Core", definition: "A programmable multi-condition gate that must be fully satisfied before beneficiaries receive access to vault contents. Conditions can include death certificates, executor confirmation, attorney attestation, guardian quorum, and time-delay periods.", related: ["Multi-Proof", "Executor", "Beneficiary"] },
  { term: "Multi-Proof Release", category: "Core", definition: "A release mechanism requiring multiple independent verifications — typically 5 conditions — before access is granted. Prevents any single party from unilaterally releasing vault contents.", related: ["Release Policy", "Guardian Quorum"] },
  { term: "Executor", category: "Roles", definition: "A designated individual (often an attorney, trustee, or trusted family member) authorised to trigger the vault release process. Executors must verify their identity via verifiable credentials before any release begins.", related: ["Beneficiary", "Guardian", "Release Policy"] },
  { term: "Beneficiary", category: "Roles", definition: "A person or entity designated to receive access to specific vault contents after the release policy conditions are satisfied. Beneficiaries receive scoped decryption keys — only for their designated allocation.", related: ["Executor", "Release Policy"] },
  { term: "Guardian", category: "Roles", definition: "An independent party (often legal counsel or a trusted institution) whose attestation signature is required as part of the release policy. Guardians form a quorum to prevent coercion of any single party.", related: ["Guardian Quorum", "Release Policy"] },
  { term: "Guardian Quorum", category: "Roles", definition: "A threshold-signature scheme among multiple guardians (e.g. 2-of-3) required before a release can proceed. Protects against executor coercion, fraud, or incapacitation of any single guardian.", related: ["Guardian", "Multi-Proof Release"] },
  // Technical
  { term: "Layer 0", category: "Technical", definition: "The infrastructure layer of the Legacy Vault Protocol responsible for namespace anchoring, validator consensus, cross-chain relaying, and policy enforcement. Implemented as a Rust/Axum node network with modular crates.", related: ["Namespace Registry", "Validator Node", "Cross-Chain Relayer"] },
  { term: "Namespace Registry", category: "Technical", definition: "The on-chain registry crate on Layer 0 that maps `.legacy` namespace identifiers to their owner public key, vault tree root, and policy hash. All namespace registrations are anchored here.", related: ["Layer 0", "Namespace"] },
  { term: "Vault Anchor", category: "Technical", definition: "A cryptographic commitment stored on Layer 0 that binds a vault's contents (document CIDs, policy hash, wallet registry root) to a specific block. Any tampering with vault contents invalidates the anchor.", related: ["Layer 0", "Document CID"] },
  { term: "Document CID", category: "Technical", definition: "A content-addressed identifier (IPFS CID) that uniquely identifies an encrypted document stored on IPFS. The CID is deterministic — if the document changes, the CID changes, making tampering detectable.", related: ["IPFS", "Vault Anchor"] },
  { term: "IPFS", category: "Technical", definition: "InterPlanetary File System — a distributed content-addressed storage network used by the protocol to store encrypted vault documents. Only CIDs are stored on-chain; document contents never appear in the blockchain.", related: ["Document CID", "Vault"] },
  { term: "AES-256-GCM", category: "Technical", definition: "The symmetric encryption algorithm used to encrypt vault documents client-side before upload. AES-256-GCM provides both confidentiality and authenticity — the server and IPFS nodes never see plaintext.", related: ["Vault", "Master Key"] },
  { term: "Master Key", category: "Technical", definition: "The root encryption key from which per-vault and per-document keys are derived. The master key is held only by the vault owner and (optionally) a designated key recovery trustee. Never stored on the server.", related: ["AES-256-GCM"] },
  { term: "Validator Node", category: "Technical", definition: "A Layer 0 network participant that validates namespace registrations, policy state transitions, and cross-chain relayer proofs. Validators must stake and can be slashed for double-signing or equivocation.", related: ["Layer 0", "Cross-Chain Relayer"] },
  { term: "Cross-Chain Relayer", category: "Technical", definition: "A Layer 0 crate that bridges wallet ownership proofs across multiple blockchains (Ethereum, Bitcoin, Solana, XRPL, Stellar, Cosmos, Polkadot, Polygon). Allows the protocol to verify wallet ownership without holding private keys.", related: ["Wallet Registry", "Layer 0"] },
  { term: "Wallet Registry", category: "Technical", definition: "A per-namespace, per-vault directory of cross-chain wallet addresses whose ownership has been cryptographically verified. The registry is anchored on Layer 0 and cannot be modified without the namespace owner's key.", related: ["Cross-Chain Relayer", "Vault"] },
  // Legal / Process
  { term: "Death Certificate", category: "Process", definition: "A government-issued document confirming the death of the vault owner. In the protocol, a certified copy is uploaded by the executor; its document hash is anchored on Layer 0 as proof of the triggering event.", related: ["Executor", "Release Policy"] },
  { term: "Attestation", category: "Process", definition: "A cryptographically signed statement by a designated party (attorney, guardian, or executor) confirming that a specific condition has been met. Attestations are stored as signed messages anchored on Layer 0.", related: ["Guardian", "Executor"] },
  { term: "Waiting Period", category: "Process", definition: "A mandatory time delay (typically 30 days) that begins after all other release conditions are met. During this period, any beneficiary may contest the release. Designed to mirror probate court notice requirements.", related: ["Release Policy", "Beneficiary"] },
  { term: "Probate", category: "Legal", definition: "The legal process through which a court validates a will and oversees asset distribution. The Legacy Vault Protocol is designed to complement — not replace — probate proceedings. Vault access granted by the protocol must still comply with applicable estate law.", related: ["Executor", "Beneficiary"] },
  { term: "Verifiable Credential", category: "Technical", definition: "A W3C-standard cryptographically signed credential that proves a claim about an identity (e.g. that a person is the designated executor) without revealing unnecessary personal information. Used for executor and guardian identity verification.", related: ["Executor", "Guardian"] },
  { term: "x402", category: "Protocol", definition: "The HTTP 402 Payment Required micro-payment protocol used by Legacy Vault Protocol for metered API services such as verification, document notarisation, and cross-chain relay. Payments are settled via the Apostle Chain.", related: ["Apostle Chain", "API Gateway"] },
  { term: "Apostle Chain", category: "Protocol", definition: "The private blockchain (chain ID 7332, Rust/Axum) used as the settlement layer for x402 micro-payments within the Legacy Vault Protocol ecosystem. Supports ATP, UNY, USDF, XRP, and XLM assets.", related: ["x402", "ATP"] },
  { term: "ATP", category: "Protocol", definition: "Apostle Protocol Token — the native asset of the Apostle Chain used for gas and x402 service payments within the Legacy Vault Protocol. 18 decimal places.", related: ["Apostle Chain", "x402"] },
  { term: "Policy Engine", category: "Technical", definition: "The Layer 0 crate responsible for evaluating whether all release conditions are met and emitting a release authorisation event. The policy engine is the sole source of truth for release state transitions.", related: ["Release Policy", "Layer 0"] },
  { term: "Audit Trail", category: "Process", definition: "An immutable, tamper-evident log of all vault actions anchored on Layer 0. Every document upload, member change, executor action, and policy state transition is recorded with a timestamp and block reference.", related: ["Vault Anchor", "Layer 0"] },
];

const CATEGORIES = Array.from(new Set(GLOSSARY.map((g) => g.category)));

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Header */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">Documentation</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold text-white md:text-5xl leading-tight mb-4">
          Terms &amp; <span className="text-gold-400">Definitions</span>
        </h1>
        <p className="mx-auto max-w-xl text-slate-400 text-lg">
          Every concept used in the Legacy Vault Protocol, defined clearly for owners, executors, beneficiaries, and engineers.
        </p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap text-xs text-slate-500">
          <span>{GLOSSARY.length} terms</span>
          <span>·</span>
          <span>{CATEGORIES.length} categories</span>
          <span>·</span>
          <Link href="/flow" className="text-gold-400 hover:underline">See Interactive Flow Map →</Link>
        </div>
      </section>

      {/* Category jump links */}
      <div className="border-b border-navy-800 bg-navy-950/80 sticky top-0 z-10 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-6 flex gap-1 py-2">
          {CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`#cat-${cat}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 whitespace-nowrap transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {CATEGORIES.map((cat) => (
          <section key={cat} id={`cat-${cat}`}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />{cat}
            </h2>
            <div className="space-y-4">
              {GLOSSARY.filter((g) => g.category === cat).map((entry) => (
                <div key={entry.term} className="vault-card" id={`term-${entry.term.replace(/\s+/g, "-").toLowerCase()}`}>
                  <h3 className="text-base font-bold text-white mb-2">{entry.term}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{entry.definition}</p>
                  {entry.related && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-xs text-slate-600">See also:</span>
                      {entry.related.map((r) => (
                        <a
                          key={r}
                          href={`#term-${r.replace(/\s+/g, "-").toLowerCase()}`}
                          className="text-xs text-gold-400 hover:underline hover:text-gold-300"
                        >
                          {r}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="pt-4 border-t border-navy-800 flex gap-4 flex-wrap">
          <Link href="/flow" className="btn-primary text-sm px-4 py-2">Interactive Flow Map</Link>
          <Link href="/namespaces/demo" className="btn-secondary text-sm px-4 py-2">Try Demo Mode</Link>
          <Link href="/namespaces/register" className="btn-secondary text-sm px-4 py-2">Register Namespace</Link>
        </div>
      </div>
    </div>
  );
}
