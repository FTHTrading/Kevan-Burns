/**
 * lib/voice/knowledge-map.ts
 * Legacy Voice Guide — public knowledge base for AI voice concierge
 *
 * All entries are public-facing, safe summaries.
 * No private vault data. No user-specific information.
 * No API keys or credentials.
 * Stablecoin/bridge/chain claims reflect current truth labels.
 */

export interface KnowledgeEntry {
  topic: string;
  summary: string;
  detail: string;
  keywords: string[];
  relatedTopics?: string[];
}

export const KNOWLEDGE_MAP: Record<string, KnowledgeEntry> = {

  legacy: {
    topic: "Legacy Vault Protocol",
    summary:
      "Legacy Vault Protocol is a private estate operating system for digital assets, legal records, wallet references, executor workflows, beneficiary access, and succession planning.",
    detail:
      "Legacy gives individuals and families a governed, encrypted system to document digital assets, register wallet references across multiple blockchain networks, assign executors and beneficiaries, define release policies, generate court-facing executor packets, and ensure the right access reaches the right people at the right time. The application is live and validated on Vercel. It is built on the TROPTIONS protocol fabric.",
    keywords: ["estate", "vault", "succession", "inheritance", "digital assets", "will", "executor", "beneficiary"],
    relatedTopics: ["troptions", "executor", "beneficiary", "release-policy", "namespaces"],
  },

  troptions: {
    topic: "TROPTIONS Protocol",
    summary:
      "TROPTIONS is the protocol fabric powering Legacy: namespaces, wallets, x402 metering, cross-chain asset references, Control Hub approvals, and Rust-based settlement scaffolding.",
    detail:
      "TROPTIONS is a multi-decade barter and trade exchange ecosystem that has evolved into a full protocol infrastructure. According to public TROPTIONS materials, the concept originated in 2003 as a trade-and-option instrument. TROPTIONS appeared on Bitcoin via Counterparty in 2016. Today the ecosystem includes TROPTIONS.GOLD for high-value barter, TROPTIONS PAY for retail, XTROPTIONS.GOLD for commodities, and multiple utility token variants. Legacy uses TROPTIONS as the powering protocol layer for namespaces, wallet maps, x402 metering, and the Rust TSN settlement scaffold.",
    keywords: ["troptions", "protocol", "barter", "trade", "token", "fabric"],
    relatedTopics: ["troptions-history", "layer0", "troptions-l1", "x402"],
  },

  "troptions-history": {
    topic: "TROPTIONS History & Origin",
    summary:
      "According to public TROPTIONS materials, the concept originated in 2003 as a trade-and-option instrument, appeared on Bitcoin via Counterparty in 2016, and has grown into a multi-token utility ecosystem.",
    detail:
      "Public TROPTIONS materials describe: 2003 — original TROPTION concept as a Trade + Option idea for barter liquidity. 2004 — Global Trading Partners Corp. filed a private placement memorandum under Rule 504 Regulation D. 2008 — renamed Global Troption Partners Corp. 2016 — TROPTIONS appeared on Bitcoin via Counterparty at block 428,459. Present — multiple token variants including TROPTIONS.GOLD, TROPTIONS PAY, XTROPTIONS, XTROPTIONS.GOLD, TROPTIONS.UNITY, with use cases in real estate, business acquisitions, tokenization, and merchant acceptance. Attribution note: Legacy cites public TROPTIONS materials and does not independently verify every historical business claim.",
    keywords: ["history", "origin", "2003", "2004", "2016", "counterparty", "bitcoin", "gary ragnow", "barter"],
    relatedTopics: ["troptions", "layer0", "troptions-l1"],
  },

  x402: {
    topic: "TROPTIONS x402 — Machine-Payable Services",
    summary:
      "x402 is the HTTP-native payment protocol that meters Legacy premium services. TROPTIONS x402 powers executor packets, compliance reports, audit exports, and cross-chain snapshots.",
    detail:
      "x402 uses the HTTP 402 Payment Required status code to attach payment proofs to service requests. No centralized billing. No subscription database. Services respond only when valid payment proof is presented. In Legacy, x402 meters: executor packet exports, beneficiary packet exports, audit log exports, compliance reports, cross-chain snapshots, namespace manifest exports, wallet snapshots, stablecoin asset reports, XRPL and Stellar proof packets, and API metered calls. Current status: LOCAL_ADAPTER in development. Production requires a TROPTIONS x402 gateway.",
    keywords: ["x402", "payment", "metering", "machine-payable", "402", "http", "service"],
    relatedTopics: ["settlement", "executor", "audit"],
  },

  wallets: {
    topic: "TROPTIONS Wallet Infrastructure",
    summary:
      "Legacy maps wallet references — not private keys — across TROPTIONS native, XRPL, Stellar, EVM, and Solana networks through the TROPTIONS wallet identity model.",
    detail:
      "Legacy stores wallet references: owner-authorized records that tell an executor or beneficiary which address exists on which network. No private keys are stored. No custody. The owner retains full control of underlying assets. Wallet types: TROPTIONS native, XRPL r-address and X-address with destination tag, Stellar G-address and federation address, EVM address (Ethereum, Polygon), Solana public key, executor operational wallet, beneficiary access wallet. All wallet references integrate with TROPTIONS Layer 0 namespace anchoring and x402 wallet snapshot metering.",
    keywords: ["wallet", "address", "custody", "xrpl", "stellar", "evm", "solana", "reference"],
    relatedTopics: ["xrpl", "stellar", "namespaces", "executor", "beneficiary"],
  },

  stablecoins: {
    topic: "Stablecoin Asset References",
    summary:
      "Legacy tracks stablecoin positions as reference records across XRPL, Stellar, EVM, and Solana networks. Watched externals: USDC, USDT, DAI, EURC, RLUSD. TROPTIONS-associated: USDF (adapter), FTHX and FTHG (governance-gated).",
    detail:
      "Stablecoin asset views are reference records, not custodial positions. Legacy documents balances and positions as part of the estate inventory. Actual assets remain under owner private key control on their respective blockchains. External stablecoins (USDC, USDT, DAI, EURC, RLUSD) are WATCHED — model implemented, references included in vault records and executor packets. USDF is in ADAPTER status. FTHX and FTHG are GOVERNANCE_GATED — modeled but live issuance requires legal, reserve, and governance approvals. Stablecoin issuance is blocked in the Troptions-L1 stablecoin crate until GENIUS Act and issuer conditions are satisfied.",
    keywords: ["stablecoin", "usdc", "usdt", "dai", "eurc", "rlusd", "usdf", "fthx", "fthg", "stablecoin"],
    relatedTopics: ["xrpl", "stellar", "control-hub", "settlement"],
  },

  xrpl: {
    topic: "XRPL Integration",
    summary:
      "Legacy integrates XRPL through the TROPTIONS bridge-xrpl module: wallet references, trustline asset views, x402 proof packets. Bridge in simulation adapter mode pending operator configuration.",
    detail:
      "XRPL capabilities: r-address and X-address wallet registration with destination tag support. Trustline assets: USDC, USDT, EURC, RLUSD watched; XRP native; USDF adapter; FTHX governance-gated. x402 XRPL proof packets via TROPTIONS metering. bridge-xrpl Rust crate (tsn-bridge-xrpl) in simulation adapter mode — wallet reference model and trustline logic implemented, live network calls require operator key configuration and Control Hub approval. XRPL's low fees, fast finality, and institutional stablecoin support make it a primary estate asset rail.",
    keywords: ["xrpl", "ripple", "xrp", "trustline", "r-address", "x-address", "bridge"],
    relatedTopics: ["wallets", "stablecoins", "settlement", "control-hub"],
  },

  stellar: {
    topic: "Stellar Integration",
    summary:
      "Legacy integrates Stellar through the TROPTIONS bridge-stellar module: G-address wallet references, trustline views, x402 proof packets. Bridge in simulation adapter mode pending operator configuration.",
    detail:
      "Stellar capabilities: G-address (56-char base32) and federation address wallet registration. Trustline assets: USDC, USDT, DAI, EURC watched; XLM native; USDF adapter; FTHG governance-gated. x402 Stellar proof packets via TROPTIONS metering. bridge-stellar Rust crate in simulation adapter mode — live calls require Horizon RPC configuration and Control Hub approval. Stellar's Agorá and mBridge compatibility positions it for future central bank and wholesale settlement integration via Troptions-L1.",
    keywords: ["stellar", "xlm", "g-address", "horizon", "federation", "bridge", "agora"],
    relatedTopics: ["wallets", "stablecoins", "settlement", "control-hub"],
  },

  settlement: {
    topic: "TROPTIONS Settlement Architecture",
    summary:
      "Five-layer settlement architecture: Legacy App (live) → TROPTIONS x402 (local adapter) → Layer 0 (implemented) → Troptions-L1 Rust scaffold (simulation-gated) → External rails (XRPL/Stellar adapters).",
    detail:
      "Layer 1 — Legacy application: estate workflows, vault management, UI, exports. LIVE. Layer 2 — TROPTIONS x402: machine-payable service metering. LOCAL_ADAPTER in dev, production gateway path defined. Layer 3 — TROPTIONS Layer 0: namespace routing, wallet identity, x402 routing, cross-chain proof anchoring. IMPLEMENTED. Layer 4 — Troptions-L1 TSN Rust network: 24 crates, 22 tests passing, compliance/stablecoin/bridges/consensus/governance. SIMULATION_GATED until production validators, operator keys, and legal approvals are in place. Layer 5 — External rails: XRPL, Stellar, EVM, Solana via bridge adapters.",
    keywords: ["settlement", "layer", "architecture", "rust", "tsn", "validators"],
    relatedTopics: ["layer0", "troptions-l1", "xrpl", "stellar", "control-hub"],
  },

  "control-hub": {
    topic: "Control Hub",
    summary:
      "The Control Hub is the governance approval surface for high-authority TROPTIONS-powered actions: stablecoin issuance, live bridge enable, validator onboarding, executor overrides, production chain activation.",
    detail:
      "Every high-authority action has an explicit approval queue. Stablecoin issuance: requires legal counsel, reserve proof, permitted issuer registry, governance vote — currently BLOCKED. Live XRPL bridge: requires operator keys, live RPC, trustline setup, 2-of-3 Control Hub approval — currently BLOCKED. Live Stellar bridge: same pattern — currently BLOCKED. Executor release override: identity verification, attorney attestation, guardian quorum, waiting period — POLICY_GATED. Validator onboarding, production chain activation: FUTURE phase. Namespace lock/unlock: ADAPTER status. Cross-chain settlement: PRODUCTION_REQUIRED. Simulation gates are code-enforced in relevant Troptions-L1 Rust crates.",
    keywords: ["control hub", "governance", "approval", "multi-sig", "gated", "simulation", "stablecoin"],
    relatedTopics: ["settlement", "troptions-l1", "stablecoins", "xrpl", "stellar"],
  },

  layer0: {
    topic: "TROPTIONS Layer 0 Fabric",
    summary:
      "TROPTIONS Layer 0 is the coordination fabric between Legacy and Troptions-L1: namespace coordination, wallet identity, x402 routing, cross-chain proof routing, and audit anchoring.",
    detail:
      "Layer 0 is not a blockchain — it is an active coordination layer. Responsibilities: namespace state coordination and proof anchoring; wallet identity mapping across XRPL, Stellar, EVM, Solana; x402 service routing and payment proof verification; cross-chain proof request routing to bridge adapters; immutable audit event anchoring for all significant vault actions. The Layer 0 coordination model is implemented and wired into Legacy.",
    keywords: ["layer 0", "coordination", "fabric", "namespace", "identity", "routing", "proof"],
    relatedTopics: ["namespaces", "wallets", "x402", "troptions-l1"],
  },

  "troptions-l1": {
    topic: "Troptions-L1 Rust Settlement Network",
    summary:
      "Troptions-L1 is a 24-crate Rust workspace implementing the Troptions Settlement Network (TSN). 22 tests passing, 0 compile errors. Simulation-gated — no live chain or live settlement.",
    detail:
      "Crates: tsn-node, tsn-consensus, tsn-runtime, tsn-state, tsn-crypto, tsn-pq-crypto (NIST FIPS 203/204/205), tsn-assets, tsn-trustlines, tsn-stablecoin (GENIUS Act gated), tsn-rwa, tsn-nft, tsn-amm, tsn-compliance (KYC/sanctions/travel rule), tsn-governance, tsn-control-hub, tsn-bridge-xrpl, tsn-bridge-stellar, tsn-rln, tsn-agora (wholesale settlement), tsn-mbridge (FX routing), tsn-rpc, tsn-telemetry, tsn-sdk, tsn-cli. BFT consensus: MIN_VALIDATORS=4, MAX_VALIDATORS=21, FINALITY_THRESHOLD=67%. Post-quantum: NIST FIPS 203/204/205 key profile types. All simulation-gated pending production validators, legal approvals, and operator configuration.",
    keywords: ["rust", "l1", "tsn", "scaffold", "crates", "consensus", "compliance", "bridge"],
    relatedTopics: ["control-hub", "settlement", "xrpl", "stellar", "stablecoins"],
  },

  namespaces: {
    topic: "Legacy Namespaces",
    summary:
      "Dot-legacy namespaces are governed protocol identities anchored in TROPTIONS Layer 0. They connect estate records to wallet references, executor assignments, beneficiary policies, and proof anchors.",
    detail:
      "A dot-legacy namespace is a persistent, resolvable protocol identity — not just a domain name. It anchors: wallet references, executor assignments, beneficiary access policies, x402 metered service proofs, and audit event records. Registration is owner-authorized — no namespace claimed without identity verification. Transfer requires governance approval. Namespace lock/unlock operations require Control Hub acknowledgment and owner proof. Namespaces integrate with Troptions-L1 governance crates for administrative operations and dispute resolution.",
    keywords: ["namespace", ".legacy", "domain", "identity", "anchor", "registration"],
    relatedTopics: ["layer0", "wallets", "executor", "beneficiary"],
  },

  executor: {
    topic: "Executor Workflows",
    summary:
      "An executor in Legacy is the person or institution authorized to administer the estate according to the release policy. Legacy generates court-facing executor packets via TROPTIONS x402 metering.",
    detail:
      "Executor assignment is owner-authorized and governance-governed. An executor receives a scoped executor packet: a structured document containing asset references, wallet maps, release instructions, access credentials (scoped per policy), and proof anchors. Executor packets are generated via TROPTIONS x402 metering. High-authority executor actions — release overrides, multi-namespace batch operations — require Control Hub approval. Executor identity is verified before packet delivery according to the release policy conditions.",
    keywords: ["executor", "estate administrator", "packet", "release", "instructions"],
    relatedTopics: ["namespaces", "wallets", "x402", "control-hub", "release-policy"],
  },

  beneficiary: {
    topic: "Beneficiary Access",
    summary:
      "Beneficiaries receive scoped access packets — containing only the assets and instructions relevant to their portion of the estate — generated via TROPTIONS x402 metering.",
    detail:
      "Beneficiary access is strictly scoped. Each beneficiary receives only what the owner's release policy allows: specific wallet references, asset types, documents, or instructions. Nothing more. Beneficiary packets are generated via TROPTIONS x402 metering. Beneficiary identity is verified according to the release policy conditions before packet delivery. Beneficiary assignments can be updated by the owner at any time prior to a trigger event.",
    keywords: ["beneficiary", "heir", "access", "packet", "scoped", "inheritance"],
    relatedTopics: ["executor", "release-policy", "x402", "wallets"],
  },

  "release-policy": {
    topic: "Release Policies",
    summary:
      "A release policy is a machine-readable set of conditions that must be satisfied before access is granted: time delays, multi-party verification, life event confirmation, legal attestation, or a combination.",
    detail:
      "Release policies are the governance layer for estate access. They can include: specific date or time delay triggers, verified life event confirmation (death certificate, court order, medical attestation), multi-party guardian confirmation quorum, legal counsel attestation, and waiting periods. Release policies are anchored as TROPTIONS Layer 0 proof records. High-authority override of a release policy requires Control Hub approval. Policies are defined by the owner and can be updated with appropriate governance verification.",
    keywords: ["release policy", "conditions", "trigger", "access", "governance", "time-lock"],
    relatedTopics: ["executor", "beneficiary", "control-hub", "namespaces"],
  },

  security: {
    topic: "Security Posture",
    summary:
      "Legacy is consent-based. It does not secretly discover assets. Sensitive records flow through encrypted channels. Access is released only through scoped policies and verified workflows. The Deepgram API key never reaches the browser.",
    detail:
      "Security principles: no private key storage; owner-authorized wallet references only; encrypted record flows; release only through verified governance conditions; no auto-play of private vault data; TROPTIONS x402 proof required for premium service calls; Control Hub multi-sig for high-authority actions; simulation gates in Troptions-L1 prevent unauthorized production execution; Deepgram TTS API key is server-side only — never in client code, never in NEXT_PUBLIC variables, never in browser requests; voice narration uses only public page content, never private vault data.",
    keywords: ["security", "encryption", "consent", "privacy", "api key", "safe", "protected"],
    relatedTopics: ["control-hub", "release-policy", "namespaces"],
  },

  downloads: {
    topic: "Document Generation & Downloads",
    summary:
      "Legacy generates executor packets, beneficiary packets, asset inventories, compliance reports, and audit log exports via TROPTIONS x402 metering. Client-side PDF generation for sensitive documents.",
    detail:
      "Document types: executor instruction packet (court-facing, attorney-readable), beneficiary scoped access packet, asset inventory summary, release policy record, compliance attestation, and audit log export. Sensitive documents generated client-side using jsPDF 4.2.1 — vault data never passes through an intermediate server during generation. Premium document types metered via TROPTIONS x402. Documents designed to stand up in legal proceedings: clear, organized, verifiable.",
    keywords: ["download", "pdf", "export", "executor packet", "beneficiary packet", "audit", "compliance"],
    relatedTopics: ["executor", "beneficiary", "x402", "audit"],
  },

  voice: {
    topic: "Legacy Voice Guide",
    summary:
      "The Legacy Voice Guide provides professional, empathetic narration for every major page, powered by TROPTIONS infrastructure and Deepgram Aura TTS. Future phase: interactive AI voice concierge.",
    detail:
      "Every major Legacy page has a narration preset: a human-feeling, spoken-word explanation in the tone of a trusted fiduciary advisor. The voice is Deepgram Aura (aura-2-luna-en) — calm, professional, warm. The API key is server-side only — never exposed to the browser. Future capability: AI voice concierge using the knowledge map for interactive Q&A with spoken responses. The voice guide does not narrate private vault data. It explains public page content and protocol architecture.",
    keywords: ["voice", "narration", "deepgram", "audio", "listen", "tts", "concierge"],
    relatedTopics: ["legacy", "troptions", "security"],
  },

};

export function findKnowledgeEntry(query: string): KnowledgeEntry | null {
  const q = query.toLowerCase().trim();

  // Direct key match
  for (const [key, entry] of Object.entries(KNOWLEDGE_MAP)) {
    if (q.includes(key.replace(/-/g, " "))) return entry;
  }

  // Keyword match
  for (const entry of Object.values(KNOWLEDGE_MAP)) {
    if (entry.keywords.some((kw) => q.includes(kw))) return entry;
  }

  return null;
}

export function getKnowledgeSummary(topic: string): string | null {
  const entry = KNOWLEDGE_MAP[topic];
  return entry ? `${entry.summary} ${entry.detail}` : null;
}
