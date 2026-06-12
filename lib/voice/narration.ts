/**
 * lib/voice/narration.ts
 * Legacy Voice Guide — page narration presets
 *
 * Tone: calm executive fiduciary advisor
 * Style: professional · serious · empathetic · reassuring · never dramatic
 *
 * Scripts are spoken-word prose, not UI copy.
 * Punctuation and ellipses create natural pacing for Deepgram Aura TTS.
 */

export interface NarrationPreset {
  /** Displayed in the voice panel */
  title: string;
  /** Full spoken narration script */
  script: string;
}

const INTRO =
  "Welcome to Legacy Vault Protocol... powered by TROPTIONS.";

const CLOSER =
  "If you have questions, the voice guide is here to help. " +
  "Legacy is built to protect what matters most — " +
  "and to release it only when the time is right, and only to those who are authorized.";

export const NARRATION_PRESETS: Record<string, NarrationPreset> = {

  "/": {
    title: "Legacy Vault Protocol — Home",
    script: `${INTRO}

This is the home of Legacy Vault Protocol — a private estate operating system for the records people cannot afford to lose.

Think about what you carry with you that no one else knows the full picture of: digital accounts, cryptocurrency wallets, legal documents, financial instruments, executor instructions, beneficiary lists, family messages, and access credentials.

When life changes unexpectedly, that information is either organized and protected... or it isn't.

Legacy is built for the moment when it matters most.

It gives individuals and families a governed, encrypted system to inventory digital assets, map wallet references across XRPL, Stellar, and other networks, assign executors and beneficiaries, define release policies, and ensure that the right people receive the right access — at the right time — through verified workflows.

The protocol underneath Legacy is TROPTIONS. TROPTIONS provides the namespace fabric, wallet coordination layer, x402 metered services, and the Rust-based settlement scaffolding that gives Legacy its infrastructure depth.

This is not a speculative project. The application is live, validated, and operational. Some protocol modules — bridges, live chain execution, and stablecoin issuance — are future-phase components, built to a scaffold and clearly labeled.

Legacy does not guess. It does not expose. It does not act without consent.

${CLOSER}`,
  },

  "/troptions": {
    title: "Powered by TROPTIONS",
    script: `${INTRO}

This page explains the role TROPTIONS plays underneath Legacy Vault Protocol.

TROPTIONS is not just a token. It is a protocol ecosystem — built over more than two decades — around the idea that value can be exchanged without friction, without traditional financial intermediaries, and without requiring cash at every step.

The TROPTIONS concept began in 2003 as a trade-and-option mechanism. According to public TROPTIONS materials, it appeared on the Bitcoin blockchain via Counterparty in 2016, and has since grown into a broader ecosystem of utility tokens, barter instruments, and digital commerce rails.

Today, TROPTIONS serves as the protocol fabric underneath Legacy. This means:

Namespaces — every dot-legacy name is coordinated through TROPTIONS Layer zero. 

Wallets — the wallet identity model used by Legacy is built on the TROPTIONS wallet infrastructure standard.

x402 metering — machine-payable service calls, executor packet generation, compliance exports, and premium actions are metered through the TROPTIONS x402 service layer.

Cross-chain references — XRPL and Stellar asset references in Legacy vaults flow through the TROPTIONS cross-chain adapter architecture.

Control Hub governance — high-authority protocol decisions require approval through the TROPTIONS Control Hub.

And at the settlement layer, Troptions-L1 is the Rust-based network scaffold providing compliance, stablecoin, bridges, consensus, and governance modules — built to production specification, currently simulation-gated until live operator configuration and legal approvals are in place.

Legacy extends the TROPTIONS vision into estate-grade infrastructure: protecting records, mapping assets, coordinating access, and giving families a governed system when continuity matters most.

${CLOSER}`,
  },

  "/troptions/history": {
    title: "TROPTIONS History & Origin",
    script: `${INTRO}

This page covers the history and origin of TROPTIONS — and why Legacy is built on this foundation.

According to public TROPTIONS materials, the TROPTIONS concept originated in 2003. The core idea was straightforward: create a trade-and-option instrument that could unlock value in barter and trade-exchange systems where traditional liquidity constraints created friction.

In 2004, according to TROPTIONS materials, Global Trading Partners Corp. filed a private placement memorandum under Rule 504 Regulation D — an early formal step in the TROPTIONS financial instrument concept.

In 2008, public records indicate Global Trading Partners Corp. was renamed Global Troption Partners Corp, reflecting the deepening commitment to the TROPTIONS concept.

In 2016, TROPTIONS appeared on the Bitcoin blockchain via the Counterparty protocol — specifically at Bitcoin block 428,459 — marking TROPTIONS' entry into the blockchain era as a tradeable digital asset.

Over the following years, the TROPTIONS ecosystem expanded into multiple token variants: TROPTIONS.GOLD for high-value barter and balance sheet transactions, XTROPTIONS.GOLD for commodities trading, TROPTIONS PAY for retail and merchant acceptance, XTROPTIONS for exchange trading, and TROPTIONS.UNITY for humanitarian initiatives.

Today, public TROPTIONS materials position the ecosystem around utility, real-world barter, asset exchange, tokenization of physical assets, and blockchain-based commerce — with acceptance in real estate transactions, business acquisitions, and a growing merchant network.

Legacy draws on this foundation and extends it into estate infrastructure. The idea that value can be coordinated, protected, and transferred without unnecessary intermediaries — that is exactly the philosophy behind Legacy Vault Protocol.

TROPTIONS provides the namespace layer, wallet model, x402 metering, cross-chain references, and settlement scaffolding. Legacy provides the estate-grade application: encrypted records, executor workflows, beneficiary access, release policies, and family continuity.

This combination is not accidental. It reflects a shared belief: that the most important records in a person's life deserve the same level of protocol infrastructure that financial systems apply to value.

Legacy is how that belief becomes a working system.

Please note: Legacy's use of TROPTIONS represents protocol integration and infrastructure positioning. Live chain execution, live bridge operations, and stablecoin issuance require additional production configuration, regulatory approvals, and operator setup — all of which are clearly labeled throughout the platform.

${CLOSER}`,
  },

  "/x402": {
    title: "TROPTIONS x402 — Machine-Payable Services",
    script: `${INTRO}

This page explains x402 — the machine-payable service layer that meters Legacy's premium operations.

x402 is not a payment processor in the traditional sense. It is an HTTP-native protocol built around the 402 Payment Required status code. When a service requires value to proceed, the request carries a payment proof — and the service responds only when that proof is valid.

In Legacy, TROPTIONS x402 powers the services that require metered access: executor packet generation, beneficiary packet exports, compliance reports, audit log exports, cross-chain snapshots, wallet reference snapshots, namespace manifest exports, notarization requests, and premium operator actions.

This architecture has several important properties.

First, it removes the need for centralized billing infrastructure. A payment is attached to a request. The service validates it. No subscription database, no account management system, no recurring billing engine.

Second, it enables machine-to-machine service calls. Autonomous executor workflows, compliance agents, and integration systems can call Legacy services without human intervention at the payment layer.

Third, it creates a transparent, auditable record of every service interaction. Every metered call is anchored as a TROPTIONS Layer zero proof event.

In the current implementation, Legacy x402 operates in local adapter mode for development. For production deployment, a TROPTIONS x402 gateway is required to process real service payments.

The service catalog is live and accessible. Every service is labeled with its current operational status — whether it is live, adapter mode, or requiring a production gateway configuration.

Legacy does not hide these distinctions. The platform shows you exactly what is working today and what requires additional setup.

${CLOSER}`,
  },

  "/wallets": {
    title: "TROPTIONS Wallet Infrastructure",
    script: `${INTRO}

This page explains how Legacy maps wallet references through the TROPTIONS wallet infrastructure model.

One of the most critical challenges in estate planning for digital assets is the wallet problem. Most estate planning systems have no concept of a cryptocurrency wallet. Most blockchain systems have no concept of an estate.

Legacy bridges that gap.

The TROPTIONS wallet model provides a structured way to register wallet references across multiple networks: TROPTIONS native wallets, XRPL r-addresses and X-addresses, Stellar G-addresses, EVM wallets across Ethereum and Polygon, Solana public keys, executor operational wallets, and beneficiary access wallets.

These are not custodial accounts. Legacy does not hold private keys. It holds references — structured records that tell an executor, attorney, or beneficiary: this address exists, on this network, and here is what you need to know about it.

This distinction is critical. Legacy is a coordination and reference system, not a custodial vault. The security of the underlying wallets remains the owner's responsibility. Legacy's role is to ensure that the reference information survives, is organized, is governed, and reaches the right people under the right conditions.

Every wallet reference in Legacy is owner-authorized. No wallet is added without explicit consent. No wallet reference is shared without meeting the release policy conditions defined by the owner.

The wallet model integrates with the TROPTIONS Layer zero namespace system, so wallet references can be anchored to dot-legacy namespaces and included in executor packets, beneficiary packets, and cross-chain snapshots.

${CLOSER}`,
  },

  "/stablecoins": {
    title: "Stablecoin Asset Views",
    script: `${INTRO}

This page covers stablecoin asset references in Legacy Vault Protocol.

As digital estates grow more complex, stablecoins have become a significant component of many people's financial holdings. USDC, USDT, DAI, EURC, and RLUSD are now held by individuals and institutions in meaningful quantities — and those holdings need to be included in estate records.

Legacy provides stablecoin asset views: structured reference records for stablecoin positions held across XRPL, Stellar, EVM, and Solana networks.

These are reference records, not custodial positions. Legacy observes and documents stablecoin balances and positions as part of the estate inventory. It does not control, move, or manage those assets. The actual assets remain on their respective blockchains under the owner's private key control.

Within the TROPTIONS ecosystem, Legacy references two additional assets: USDF and FTHG. These are TROPTIONS-associated stablecoin instruments currently in adapter and governance-gated status — meaning they are modeled in the system but live issuance requires separate legal, reserve, and governance approvals.

For external stablecoins — USDC, USDT, DAI, EURC, and RLUSD — Legacy shows watched status, meaning the asset model is implemented and the reference can be included in vault records and executor packets.

The stablecoin view integrates with XRPL and Stellar trustline records, and with the EVM and Solana wallet maps, to give a complete picture of stablecoin positions across the estate.

Every stablecoin reference is clearly labeled with its network, operational status, and role within the estate record.

${CLOSER}`,
  },

  "/xrpl": {
    title: "XRPL Integration via TROPTIONS",
    script: `${INTRO}

This page explains Legacy's XRPL integration through the TROPTIONS cross-chain architecture.

The XRP Ledger is one of the most important networks for cross-border value transfer, stablecoin trustlines, and institutional asset rails. It supports native escrow, multi-signature accounts, trustline-based token issuance, and fast finality — all of which are directly relevant to estate planning and asset transfer workflows.

Legacy integrates XRPL through the TROPTIONS bridge-xrpl module, which provides several capabilities.

Wallet references: XRPL r-addresses and X-addresses can be registered in Legacy vaults, with destination tag support for exchange accounts.

Trustline assets: USDC, USDT, EURC, and RLUSD trustline positions on XRPL are tracked as estate references. XRP itself is treated as native. USDF and FTHX are modeled as TROPTIONS-associated assets in adapter and governance-gated status.

Proof packets: XRPL proof packets can be generated via TROPTIONS x402 metering — providing executor-readable snapshots of XRPL wallet states for inclusion in estate records.

Bridge module: the bridge-xrpl Rust crate in Troptions-L1 provides the settlement-level integration. Currently operating in simulation adapter mode — meaning the wallet reference model and trustline logic are implemented, but live network calls require operator key configuration and Control Hub approval.

The TROPTIONS architecture treats XRPL as a primary asset rail. XRPL's finality, low transaction fees, and institutional stablecoin support make it a natural fit for the estate coordination use case.

When the XRPL bridge reaches production status, Legacy vaults will be able to anchor estate events, trigger escrow releases, and execute trustline transfers directly through the TROPTIONS Layer zero coordination fabric.

${CLOSER}`,
  },

  "/stellar": {
    title: "Stellar Integration via TROPTIONS",
    script: `${INTRO}

This page explains Legacy's Stellar integration through the TROPTIONS protocol architecture.

Stellar is a global payment network optimized for remittance, stablecoin issuance, and cross-border asset transfer. It is used by banks, payment processors, and central bank digital currency pilots worldwide — including through the Agorá initiative for wholesale cross-border settlement.

Legacy integrates Stellar through the TROPTIONS bridge-stellar module.

Stellar G-addresses — the 56-character base32 public keys of the Stellar network — can be registered in Legacy vaults as wallet references. Federation addresses, which map human-readable names to Stellar accounts, are also supported.

Trustline assets tracked on Stellar include USDC, USDT, DAI, EURC, and native XLM. USDF is modeled as a TROPTIONS-associated adapter asset. FTHG is in governance-gated status.

The bridge-stellar Rust crate in Troptions-L1 provides the settlement-layer integration, currently operating in simulation adapter mode. Live Stellar network calls require Horizon RPC configuration and Control Hub operator approval.

Stellar's alignment with central bank and institutional payment rails makes it a strategic component of the TROPTIONS settlement architecture. The Troptions-L1 codebase includes Agorá-compatible wholesale settlement stubs and mBridge foreign exchange routing references — positioning the system for future compatibility with regulated cross-border payment infrastructure.

For estate purposes, Stellar holdings are increasingly significant, particularly for individuals and families with international financial interests. Legacy treats Stellar wallet references and trustline positions as first-class estate record components.

${CLOSER}`,
  },

  "/settlement": {
    title: "TROPTIONS Settlement Architecture",
    script: `${INTRO}

This page explains the settlement architecture underneath Legacy Vault Protocol.

Settlement, in the context of Legacy, means the coordinated transfer of rights, access, and asset control from an estate to authorized recipients — through a governed, auditable, multi-step process.

The TROPTIONS settlement architecture is organized in five layers.

The first layer is the Legacy application itself: estate workflows, vault management, executor packets, beneficiary access, and the user interface. This layer is live and operational.

The second layer is TROPTIONS x402: the machine-payable service fabric that meters every premium operation. Currently operating as a local adapter in development, with a production gateway path defined.

The third layer is TROPTIONS Layer zero: the coordination fabric. This layer handles namespace routing, wallet identity, x402 service coordination, and cross-chain proof anchoring. The coordination model is implemented.

The fourth layer is Troptions-L1 — the TSN Rust network. This is the settlement scaffold: 24 Rust crates covering consensus, compliance, stablecoin, real-world assets, AMM, governance, Control Hub, XRPL bridge, Stellar bridge, and validator infrastructure. Twenty-two tests passing. Zero compile errors. Currently simulation-gated until production validators, operator keys, and legal approvals are in place.

The fifth layer is external rails: XRPL, Stellar, EVM networks, and Solana — connected through the Troptions-L1 bridge adapters.

This architecture is not presented as fully live. It is presented honestly. Some layers are operational today. Some are built to production specification but require additional configuration. Some require legal, governance, and regulatory milestones before they can execute live operations.

Legacy's commitment is to build the right architecture — transparently, layer by layer — and to label every component accurately.

${CLOSER}`,
  },

  "/control-hub": {
    title: "Control Hub — Governance & Approvals",
    script: `${INTRO}

This page explains the Control Hub — the governance approval surface for high-authority TROPTIONS-powered actions.

The Control Hub exists because some actions should never happen unilaterally.

Stablecoin issuance. Live bridge activation. Validator onboarding. Production chain activation. Executor release overrides. These are decisions with real consequences — financial, legal, and operational. They require multiple approvals, documented rationale, and explicit authorization.

The Control Hub enforces this discipline.

Every high-authority action in the TROPTIONS and Legacy ecosystem has a defined approval queue: a list of required sign-offs, waiting periods, and conditions that must be satisfied before the action can proceed.

Stablecoin issuance requires legal counsel sign-off, reserve proof, inclusion on a permitted issuer registry, and a governance vote. Until those conditions are met, issuance is blocked — hard-gated in the Troptions-L1 Rust codebase.

XRPL and Stellar bridge activation requires operator key configuration, live RPC endpoints, trustline setup, and a two-of-three Control Hub approval. Until those conditions are met, the bridges operate in simulation adapter mode only.

Production chain activation requires a validator quorum, full legal review, a three-of-five multi-signature governance decision, and an independent audit.

Executor release overrides — situations where the standard release policy cannot be followed — require the highest level of human review: identity verification, attorney attestation, guardian quorum, and explicit Control Hub acknowledgment.

This is how Legacy and TROPTIONS approach governance. Not with optimistic defaults. Not with single points of authority. But with explicit, documented, multi-party approval at every point where the consequences of error are significant.

Your estate records deserve this level of protection. The Control Hub is how we deliver it.

${CLOSER}`,
  },

  "/protocol/troptions-layer0": {
    title: "TROPTIONS Layer 0 Coordination Fabric",
    script: `${INTRO}

This page explains TROPTIONS Layer zero — the coordination fabric that connects Legacy to the broader protocol ecosystem.

Layer zero is not a blockchain. It is not a settlement network. It is a coordination layer — the connective tissue between the Legacy application and the deeper Troptions-L1 infrastructure.

Its responsibilities are specific and important.

Namespace coordination: every dot-legacy name is registered, resolved, and governed through TROPTIONS Layer zero. The namespace registry, proof anchoring, and state coordination all flow through this layer.

Wallet identity: wallet references registered in Legacy vaults are mapped and coordinated through Layer zero's wallet identity model — across XRPL, Stellar, EVM, and Solana networks.

x402 routing: every metered service call in Legacy passes through Layer zero for routing, validation, and audit anchoring. The x402 payment proof is verified here before the service executes.

Cross-chain proof routing: when an executor packet or beneficiary snapshot requires a cross-chain proof — an XRPL trustline state, a Stellar wallet balance, a smart contract position — Layer zero coordinates the request to the appropriate bridge adapter.

Audit anchoring: every significant vault event is written as a Layer zero proof record, creating an immutable audit trail that supports legal proceedings, estate administration, and compliance verification.

Layer zero is the reason Legacy can make a credible claim about protocol depth. It is not just an application sitting on a blockchain. It is an application integrated into a multi-layer protocol architecture — with namespace governance, wallet coordination, metered services, cross-chain awareness, and audit integrity built in at the foundation.

${CLOSER}`,
  },

  "/protocol/troptions-l1": {
    title: "Troptions-L1 — Rust Settlement Network Scaffold",
    script: `${INTRO}

This page covers Troptions-L1 — the Rust-based settlement network scaffold that forms the deepest layer of the TROPTIONS infrastructure.

Troptions-L1 is a 24-crate Rust workspace implementing the Troptions Settlement Network — TSN. It is a production-specification Rust codebase: twenty-two tests passing, zero compile errors, built to the standards of a compliance-native settlement network.

It is simulation-gated. No live chain. No live settlement. No live stablecoin issuance. These gates are not aspirational — they are code-enforced guards in the relevant crates, preventing production execution until explicit requirements are met.

The crates cover every layer of a modern settlement network.

Core infrastructure: node binary, consensus engine, runtime orchestration, state types, and cryptographic modules including post-quantum key profile types aligned with NIST FIPS 203, 204, and 205.

Asset and compliance layer: asset creation, trustline simulation, stablecoin issuance with GENIUS Act compliance gating, real-world asset registration with evidence hashing, and a compliance runtime covering KYC, sanctions screening, and travel rule enforcement.

Settlement and finance layer: automated market maker with constant-product pool simulation, non-fungible token credential issuance, and real-world asset tokenization.

Governance and coordination: on-chain governance proposals, Control Hub bridge, validator model with Byzantine fault tolerance constants, and agora-style wholesale settlement stubs compatible with central bank rail architecture.

Bridge adapters: bridge-xrpl and bridge-stellar Rust crates providing simulation-mode cross-chain adapters, plus mBridge foreign exchange routing stubs and a Regulated Liability Network adapter.

Interface layer: RPC placeholder, telemetry, SDK, and CLI with six simulation commands.

Troptions-L1 represents the technical depth behind the TROPTIONS commitment. It is not a whitepaper. It is not a roadmap slide. It is a working Rust codebase, built to production specification, waiting for the final configuration, governance, and legal milestones that will bring it to live operation.

${CLOSER}`,
  },

  "/namespaces": {
    title: "Legacy Namespace Registry",
    script: `${INTRO}

This page explains Legacy namespaces — the human-readable identity layer built on the TROPTIONS coordination fabric.

A Legacy namespace is more than a name. It is a governed identity anchor for an estate, an individual, a family trust, or an organization.

Dot-legacy namespaces provide a persistent, resolvable reference point that connects an estate record to the full TROPTIONS protocol stack: wallet references, executor assignments, beneficiary access policies, x402 metered services, and proof anchors.

Think of it as an estate's permanent address on the protocol. It does not change when assets move. It does not expire when accounts close. It persists as the coordination point for everything the estate record references.

Namespace registration is owner-authorized. No namespace can be claimed without identity verification. No namespace can be transferred without explicit governance approval.

Namespaces also serve as the proof anchoring mechanism. When a significant event occurs — a vault is created, an executor is assigned, a release policy is activated — that event is anchored to the namespace as a verifiable proof record. This creates the audit trail that supports legal proceedings and estate administration.

The namespace registry integrates with TROPTIONS Layer zero for state coordination, and with the Troptions-L1 governance crates for dispute resolution and administrative lock and unlock operations.

A dot-legacy namespace is, in the simplest terms, a commitment to continuity. It says: this estate record has a permanent home, and it will be here when you need it.

${CLOSER}`,
  },

  "/layer0": {
    title: "Layer 0 Architecture",
    script: `${INTRO}

This page explains the Layer zero architecture of the TROPTIONS and Legacy protocol stack.

Layer zero is the foundation. Not in the sense of being the simplest component — it is actually quite sophisticated. But in the sense of being the layer everything else depends on.

Legacy sits on top of Layer zero. The Troptions-L1 settlement network connects through Layer zero. External rails — XRPL, Stellar, EVM — are accessed through Layer zero adapters.

Layer zero provides three essential services.

Coordination: it orchestrates multi-party workflows. When an executor packet requires signatures from multiple guardians, attestations from a compliance engine, and a cross-chain proof from XRPL, Layer zero coordinates those steps in the correct sequence.

Identity: it resolves namespace identities to wallet references, executor assignments, and beneficiary records. A dot-legacy namespace is, at the Layer zero level, a persistent key into a governed identity record.

Proof: it anchors events. Every significant action in the Legacy system — namespace registration, vault creation, executor assignment, policy activation, release execution — is written as a Layer zero proof record. These records are immutable, sequenced, and verifiable.

The Layer zero architecture is what distinguishes Legacy from a simple database application. A database stores records. Layer zero provides an active coordination fabric that enforces governance, anchors proof, and routes operations to the appropriate protocol module.

For the people who will one day rely on this system — executors, attorneys, beneficiaries — this architecture means the records they need will not just exist. They will be organized, governed, and verifiable.

${CLOSER}`,
  },

  "/compare": {
    title: "Why Legacy — Comparison",
    script: `${INTRO}

This page answers the question many people ask when they first encounter Legacy: why not just use an existing solution?

Traditional estate planning is built around physical documents, attorney offices, safety deposit boxes, and paper records. It was designed for a world where assets were primarily physical or held by regulated institutions. Banks knew about bank accounts. Brokers knew about brokerage accounts. The attorney held the will.

That world still exists. But alongside it has grown a second world: private keys, seed phrases, digital wallets, cryptocurrency exchanges, NFT collections, domain names, private repositories, encrypted drives, and online account credentials. None of these appear in a standard estate plan. Most attorneys are not equipped to handle them. Most families do not know they exist until it is too late.

Legacy is built for this second world — while remaining compatible with the first.

It gives the owner a single, governed system to document everything. Digital assets and traditional references, in one organized protocol. Executor instructions that cover both the attorney-administered estate and the blockchain-held assets. Beneficiary access that can be scoped by asset type, network, and identity verification level.

Beyond individual users, Legacy is relevant for family offices, estate attorneys, digital asset custodians, and institutional clients who manage estates containing significant digital holdings.

The TROPTIONS protocol layer is what makes Legacy institutional-grade. Namespace governance, x402 metered services, cross-chain asset references, and a Rust-based settlement scaffold are not features you build with a weekend project. They represent years of protocol development applied to a real problem.

Legacy is how that infrastructure becomes useful to the families who need it.

${CLOSER}`,
  },

  "/downloads": {
    title: "Downloads & Document Generation",
    script: `${INTRO}

This page explains Legacy's document generation and download capabilities.

One of the most practical outputs of an estate plan is documentation: the executor instruction packet, the beneficiary access guide, the asset inventory summary, the release policy record, the compliance attestation, and the audit log export.

These documents need to be usable by attorneys, courts, financial institutions, and family members — not just readable inside a software application.

Legacy generates these documents using a combination of the vault record, the TROPTIONS Layer zero proof anchors, and the x402 metered document generation services.

The executor packet is the primary document: a court-facing, attorney-readable instruction set that tells the executor exactly what assets exist, where they are held, how to access them, and in what order the release policy should be followed.

The beneficiary packet is a scoped version of the estate record, prepared for each beneficiary according to their access policy — showing them the assets and instructions relevant to their portion of the estate, and nothing more.

The audit log export provides a verifiable record of every significant action taken in the vault: who created what, when it was created, what was changed, and what release events have been triggered.

These documents are generated client-side using a validated PDF generation library, ensuring that sensitive vault data never passes through an intermediate server during document creation. For premium document types, the generation is metered through TROPTIONS x402.

Every document generated by Legacy is designed to stand up in a legal proceeding. Clear. Organized. Auditable. Built for the humans who will rely on it when the stakes are highest.

${CLOSER}`,
  },

  "/status": {
    title: "System Status",
    script: `${INTRO}

This page provides Legacy Vault Protocol system status information.

Operational transparency is not optional for a system that protects critical estate records. If a component of the Legacy system is degraded, unavailable, or operating in a limited mode, the people who rely on it deserve to know.

The status page shows the operational state of every major Legacy component: the application layer, the namespace registry, the TROPTIONS x402 service endpoints, the wallet reference systems, the document generation services, the XRPL and Stellar adapters, and the Troptions-L1 infrastructure modules.

Components operating in simulation or adapter mode are labeled clearly — not as errors, but as accurate descriptions of their current operational phase. The XRPL bridge is in simulation adapter mode by design, pending operator configuration. The stablecoin issuance module is governance-gated by design, pending legal approval. These are not system failures. They are intentional states that the status page accurately reflects.

The status page also shows the validation state of the Troptions-L1 Rust scaffold: crate build status, test results, and simulation gate states. This gives technical operators and institutional clients a clear picture of where the protocol stands in its development lifecycle.

Legacy's commitment to operational transparency extends to incident reporting. When something goes wrong, the status page will say so — clearly, honestly, and with whatever information is available about the impact and resolution timeline.

Trust is built through transparency. The status page is how Legacy demonstrates that commitment.

${CLOSER}`,
  },

  "/flow": {
    title: "Interactive Flow Map",
    script: `${INTRO}

This page shows the Legacy system flow — how information, authorization, and access move through the protocol.

Understanding a complex system requires seeing it in motion. The flow map visualizes how an estate record moves from creation to resolution: from the moment an owner first registers a vault, through the ongoing maintenance of the estate record, to the eventual transfer of access when the release policy is triggered.

The flow begins with the owner. They create a namespace, register their vault, add wallet references and asset records, assign executors and guardians, define beneficiaries, and write release policies. Every step is governed, encrypted, and anchored in TROPTIONS Layer zero.

The ongoing maintenance phase includes updates — new assets added, policies revised, beneficiaries changed — all governed through the same consent-based workflow. Every change is versioned and anchored as a proof record.

When a release event occurs — whether triggered by a verified life event, a time-based policy, or an executor petition — the system executes the release workflow: verifying the trigger conditions, generating executor packets and beneficiary packets, routing through the TROPTIONS x402 service layer, and anchoring the release event as a permanent record.

The cross-chain asset references flow through the TROPTIONS Layer zero coordination fabric to the appropriate bridge adapters — XRPL and Stellar — where asset states are verified and proof packets are generated.

Every step in this flow is visible, auditable, and governed. There are no hidden operations. There are no automatic transfers. Access is released only when the policy conditions are met, the governance requirements are satisfied, and the authorized recipients are verified.

${CLOSER}`,
  },

  "/glossary": {
    title: "Glossary",
    script: `${INTRO}

This page provides definitions for the key terms used throughout Legacy Vault Protocol.

Understanding Legacy requires understanding the vocabulary. Many of the concepts here come from the intersection of estate law, digital asset management, and blockchain protocol architecture — three fields that rarely speak the same language.

Legacy is built to make that intersection clear. The glossary explains what we mean by every term we use: namespace, executor, beneficiary, release policy, guardian, proof anchor, trustline, stablecoin asset reference, x402, Layer zero, Control Hub, and more.

These are not marketing terms. They are precise operational concepts that define how the system works and what each component is responsible for.

A namespace is a persistent protocol identity — not just a name.

An executor is the person or institution authorized to administer the estate according to the release policy — not necessarily the same as a legal executor in the traditional sense, though the concepts are designed to be compatible.

A release policy is a machine-readable set of conditions that must be satisfied before access is granted — not a simple password, but a governed set of rules that can include time delays, multi-party verification, life event confirmation, and legal attestation.

Understanding these terms is the first step to using Legacy effectively. The glossary is designed to be a reference, not a legal document — written in plain language, with enough precision to be useful to technical operators and estate attorneys alike.

${CLOSER}`,
  },

  "/voice": {
    title: "Legacy Voice Guide",
    script: `${INTRO}

Welcome to the Legacy Voice Guide — powered by TROPTIONS and Deepgram.

This is the voice interface for Legacy Vault Protocol. It gives you a way to hear this system explained — not in dense technical prose, but in a calm, clear, professional voice that speaks to what Legacy actually does and why it matters.

Every major page in Legacy has a narration available. The executor portal. The TROPTIONS architecture. The XRPL and Stellar integrations. The settlement layer. The Control Hub. The history of TROPTIONS itself. You can listen to any of them — just press Listen on the page you want to hear explained.

The voice is Deepgram Aura — a high-quality AI voice system designed for professional applications. The narration is written in the tone of a trusted advisor: serious, empathetic, clear, and unhurried.

The Legacy Voice Guide does not read raw UI text. It provides a human-feeling narrative explanation of each page — written to help someone understand what they are looking at, why it matters, and how it connects to the broader estate protection mission.

In the future, the Legacy Voice Guide will expand into an interactive AI concierge. You will be able to ask questions — about Legacy architecture, TROPTIONS history, executor workflows, stablecoin asset references, cross-chain integration, or anything else in the knowledge base — and receive a spoken answer in the same professional voice.

That capability is scaffolded and ready. It is being built responsibly — with clear boundaries between public knowledge and private vault data, with no connection to your personal estate records unless you explicitly authorize it.

The Voice Guide is designed for people who are making important decisions. It is not a sales tool. It is not entertainment. It is a clarity instrument — built to help people understand a complex system when understanding matters most.

${CLOSER}`,
  },
};

export function getPageNarration(pathname: string): NarrationPreset | null {
  // Exact match first
  if (NARRATION_PRESETS[pathname]) return NARRATION_PRESETS[pathname];

  // Strip trailing slash
  const clean = pathname.replace(/\/$/, "");
  if (NARRATION_PRESETS[clean]) return NARRATION_PRESETS[clean];

  return null;
}

export function normalizeNarrationText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 4800); // Deepgram TTS practical limit per request
}
