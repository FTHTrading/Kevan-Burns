# Unykorn — Sovereign Web3 Infrastructure & Deterministic Ecosystem

**A comprehensive, cryptographically-secured namespace registry, digital legacy estate operating system, and closed-loop macroeconomic simulation suite founded and engineered by Kevan Burns.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescript.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Rust](https://img.shields.io/badge/Rust-1.75+-orange?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Solana](https://img.shields.io/badge/Solana-Live-14F195?style=for-the-badge&logo=solana&logoColor=black)](https://solana.com/)
[![Stellar](https://img.shields.io/badge/Stellar-Live-black?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.org/)

---

## 🦄 Core Brand Positioning & Sovereign Vision
Unykorn is a pre-funded, high-utility autonomous Web3 operating system delivering permanent digital identity, secure estate succession, and deterministic macroeconomic simulation. Headquartered at **5655 Peachtree Parkway, Suite 100, Norcross, GA 30092** and led by founder **Kevan Burns** (Chairman & Principal Operator), the ecosystem represents the convergence of over two decades of digital asset routing, barter-dollar networks, and zero-knowledge cryptography.

To combine high transaction throughput with legally-binding, audit-compliant settlement, Unykorn operates a **dual-chain architecture**:
* **Solana (Token-2022)**: Handles high-frequency, non-transferable SFT identity namespaces, local agent keys, and instant developer API authentications.
* **Stellar (Asset Anchors)**: Anchors legally-bound real-world asset deeds, commodity reserves (such as Zurich Vault Gold physical receipts), and KYC-compliant financial gates.

---

## ⚖️ Unykorn Layer 1 Blockchain Architecture
The bedrock of the platform is the Unykorn Layer 1 Blockchain—a closed-loop execution runtime built in Rust that decouples network transport and physical storage from the core validation engine.

```
       UNTRUSTED ZONE              CRYPTO GATE           TRUSTED EXECUTION
   ┌───────────────────────┐    ┌───────────────┐    ┌─────────────────────────┐
   │   POPEYE (P2P Gossip) │───▶│ TEV (Firewall)│───▶│ CONSENSUS ──▶ MARS ──▶ TAR
   └───────────────────────┘    └───────────────┘    └─────────────────────────┘
```

The runtime is divided into five specialized, decoupled chambers:
1. **POPEYE (Network Gossip & Transport Layer)**: Manages peer discovery (mDNS / static seed nodes) and gossip propagation of blocks and transactions using `libp2p-gossipsub`. POPEYE behaves purely as the node's sensory system and has no write-access to execution state.
2. **TEV (Cryptographic Verification Firewall)**: Inspects incoming wire payloads to enforce the strict 96-byte transaction format: `[Transaction Data (32B)][Public Key (32B)][Signature (64B)]`. Discards malformed, unsigned, or non-verified packets immediately, acting as a CPU-shielding gate.
3. **CONSENSUS (Byzantine Fault Tolerant Agreement Layer)**: Coordinates round-based BFT voting rounds (Propose, Prevote, Commit) using a deterministic round-robin leader schedule. Enforces single-slot finality to prevent chain re-organizations or double-spend forks.
4. **MARS (Deterministic Runtime Brain)**: Executes state transitions as a pure function: $\text{MARS}(S_t, TX) \rightarrow S_{t+1}$. MARS has zero knowledge of networking or disk storage, making its execution mathematical, isolated, and perfectly consistent across all validator nodes.
5. **TAR (Memory with Receipts & RocksDB Storage)**: Manages atomic disk persistence (write-ahead logging, fsync before commits) and generates periodic state snapshots (every 100 blocks) to shield the execution loop from storage latency spikes.

---

## 🏗️ The 7-Layer Architectural Stack
The Unykorn ecosystem operates on seven highly decoupled layers to enforce zero-knowledge privacy, compliance with the **Georgia Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA)** (O.C.G.A. § 53-13-1 et seq.), and absolute sovereignty:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 07: Client Interface (troptions-os, Nano Bana 3D, browser shell)  │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 06: Cognitive Swarms (FINN AI, NeedAI, 22-Agent Mesh, TROY)       │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 05: Estate Application (legacy-vault-protocol, Heirloom OS)       │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 04: RWA Tokenization (ruby/Allure, rwa-realestate, TEV schemas)   │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 03: Settlement Rails (troptions-rails, fth-capital-rails, USDF)   │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 02: Namespace Protocol (sovereign-namespace-protocol, DID/VC)     │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 01: Core L1 Runtime (UnyKorn-L-1, Popeye-Tars-Mars-Tev)           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Complete Ecosystem Projects Catalog
The entire Unykorn universe consists of several tightly integrated sub-projects deployed across the sovereign cluster:

### 1. [legacy-vault-protocol](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/adk_build/legacy-vault-protocol) — ZK Estate Succession OS
*   **Purpose**: A private, client-side encrypted digital legacy platform aligning with RUFADAA rules. Deploys zero-knowledge (ZK-PLONK) notary checks and Dead Man's Switch timers.
*   **Stack**: Next.js 15, TailwindCSS, Rust, Prisma, Solana SPL, Stellar anchors.

### 2. [unykorn-doc-intelligence](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/adk_build/unykorn-doc-intelligence) (BADASS AI) — Sovereign Troptions OS
*   **Purpose**: The autonomous voice-driven cognitive cockpit for the Troptions ecosystem. Orchestrates a 6-agent mesh (SCA, Vetting, SDC, Minting, DEX, Notary) using Gemini 2.0 and local Ollama cascades. Deploys ElevenLabs voice synthesis.
*   **Scale**: Monorepo containing 17 production apps, 44 packages, and 4 Cloudflare workers.

### 3. [flashrouter](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/adk_build/flashrouter) — Multi-Provider Flash Loan Router
*   **Purpose**: Unified, audited, non-custodial flash-loan router abstracting major lending protocols (Aave V3, Balancer V2, Uniswap V3, MakerDAO DSS-Flash) behind a single API.
*   **Stack**: Solidity, TypeScript SDK, Fastify REST API, Next.js 14 dashboard.

### 4. [flash-bot](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/adk_build/flash-bot) — Base Flash Loan & Liquidation Bot
*   **Purpose**: Isolated per-client smart contracts deployed on Base (Aave V3, Aerodrome swap router) with custom `executeOperation()` strategy logic. Includes an automated closer script for rapid client onboarding.
*   **Stack**: Hardhat, Ethers, Aerodrome router contracts.

### 5. [adk_orchestrator](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/adk_build/adk_orchestrator) — Multi-Agent Workflow Engine
*   **Purpose**: Python-based orchestration engine coordinating liquidation agents, supervisor monitoring, and automated transaction tools.
*   **Stack**: Python, Asyncio, Web3.py.

### 6. [genesis402-playbook](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/adk_build/genesis402-playbook) — Interactive Money Playbook Console
*   **Purpose**: Self-contained monetization modeling dashboard representing the 16 apex domains, product ladders (0.01 ATP to $75K), and interactive Moltbook flywheels.
*   **Stack**: Vanilla HTML/CSS/JS.

### 7. [kraken_ledgers](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/adk_build/kraken_ledgers) — Financial statement parser
*   **Purpose**: Ingestion and parsing pipeline for audited Kraken stocks & ETF brokerage statements to verify on-chain backing and vault reserves.

---

## 🔒 Protected Measures, Security & Licensing Matrix
The Unykorn platform incorporates strict safety and licensing constraints to secure intellectual property and maintain compliance:

### 1. Intellectual Property & Licensing Matrix

| Project | Component | Primary License | Terms |
| --- | --- | --- | --- |
| **`legacy-vault-protocol`** | Core Portal & API | **PROPRIETARY** | All rights reserved. Intellectual property of Kevan Burns. |
| **`unykorn-doc-intelligence`** | BADASS AI Monorepo | **PROPRIETARY** | All rights reserved. Intellectual property of Kevan Burns. |
| **`flashrouter`** | Solidity Smart Contracts | **AGPL-3.0** | GNU Affero General Public License v3. |
| **`flashrouter`** | SDK, API, Dashboard, Docs | **MIT** | Permissive open-source. |
| **`flash-bot`** | Bot & Solidity Templates | **MIT** | Permissive open-source. |
| **`adk_orchestrator`** | Python Swarm Modules | **MIT** | Permissive open-source. |
| **`genesis402-playbook`** | Interactive HTML Engine | **MIT** | Permissive open-source. |
| **`kraken_ledgers`** | Statement Parser & Data | **PROPRIETARY** | Confidential transaction data. |

### 2. Deployed Security & Protected Measures
*   **Client-Side AES-256-GCM Encryption**: Succession vaults are encrypted locally in the browser. Unykorn servers never receive or store unencrypted recovery phrases, legal deeds, or trust keys.
*   **ZK-PLONK 5-Proof Notary**: Coordinates multi-sig heir quorums and Dead Man's Switch triggers without centralized intermediaries.
*   **W3C VC 2.0 Selective Disclosure**: Uses BLS12-381 signatures to allow users to verify property appraisals or ID claims without exposing their physical identity.
*   **Apostle Chain Firewall (TEV)**: An Ed25519-signature-verifying firewall that filters out gossip storms, unconfirmed transactions, and duplicate packet anomalies before block proposals.
*   **KMS HSM Keyring (`unykorn-hsm-ring`)**: Hardware security modules gate all admin-level DNS and project-routing changes.

---

## 🛠️ The Unykorn Multi-Org Repository Matrix
Decoupled codebases are maintained across five primary GitHub organizations:

### 1. [FTHTrading](https://github.com/FTHTrading) — Core & Simulation
* **`fth-treasury-stack`**: Sovereign financial infrastructure monorepo with 56 Rust crates managing stablecoins, liquidity, and observer nodes.
* **`troptions-rails`**: Multi-chain deployment rails with unified `BridgePayload` and golden path flows for stablecoins (USDT, USDC, RLUSD, PAXO).
* **`popeye-tars-mars-tev`**: Rust implementation of the Unykorn L1 closed-loop execution chambers.
* **`genesis-world`**: Genesis Sentience Protocol—an AI-native capital coordination infrastructure L0 engine.

### 2. [kevanbtc](https://github.com/kevanbtc) — Cryptographic & Sovereign Utilities
* **`forensic-wallet-recovery`**: Deterministic key derivation, seed phrase recovery, and multi-sig wallet reconstruction templates.
* **`btc-multisig-vault`**: Descriptor-based Bitcoin cold storage workflows and RUFADAA-aligned offline wallet tracking.

### 3. [unykornai](https://github.com/unykornai) — AI & Identity Layer
* **`legacy-vault-protocol`**: Zero-knowledge private estate OS, AES-256-GCM client-side encryption, and 5-Proof release engine.
* **`donk-ai`**: AI-powered conversational voice engines, XMTP messaging templates, and Telnyx telephony routing.

### 4. [y3kmarkets](https://github.com/y3kmarkets) — Barter & Clearing Systems
* **`barter-core`**: High-performance barter exchange order matching engine and clearinghouse accounting rules.
* **`optkas-wallets-infrastructure`**: Custodian-grade wallets and multi-signature corporate governance gateways.

### 5. [y3kdigital](https://github.com/y3kdigital) — RWA & Industrial Simulation
* **`rwa-realestate`**: Solidity smart contracts anchoring property deeds, mineral rights, and transaction titles to Ethereum/Besu.
* **`digital-twin-gas`**: Deterministic simulation pipelines modeling physical commodity pipelines and energy asset registries.

---

## 🔗 Deployed Gateways & System Entry Points
The entire Unykorn universe is mapped inside the **Unykorn Master Build Registry** (containing 343 distinct builds spanning components, staging setups, and mainnet routers). The core properties are hosted live on Cloudflare Pages and Google Cloud Platform:

* **Sovereign Developer Portal**: [kevan.unykorn.ai](https://kevan.unykorn.ai) — Deploys Kevan Burns' portfolio portal, live appointment console, and interactive AI Twin.
* **Sovereign OS Cockpit**: [registry.unykorn.ai](https://registry.unykorn.ai) — Interface for mapping top-level suffix owners and monitoring deployed systems.
* **Investor Relations Hub**: [investors.unykorn.ai](https://investors.unykorn.ai) — Capital scaling and transaction verification engine.
* **Legacy Vault Portal**: [vault.genesis402.com](https://vault.genesis402.com) — Gated access for client-side encrypted RUFADAA succession files.
* **Swarm Media & Operations Console**: [unykorn.ai/media](https://unykorn.ai/media) — Live dashboard for monitoring GCP pre-funded asset allocations ($15.4M - $28.5M), AI Sentiment Index streams, and Media Swarms.
* **Troptions Mint-AI Cockpit**: [ai-troptionsmint.pages.dev](https://ai-troptionsmint.pages.dev) — World's first fully autonomous voice-driven financial cockpit.

---

## 📜 Key Published Scientific Works & Academic Citations
* **“Deterministic Literary Publishing: A Multi-Layer Provenance Model for Verifiable Manuscripts”** — Kevan Burns, February 2026.
  * [SSRN Abstract #6241279](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6241279)
  * [ResearchGate Publication](https://www.researchgate.net/publication/403558328_Deterministic_Literary_Publishing_A_Multi-Layer_Provenance_Model_for_Verifiable_Manuscripts)
  * ORCID Registry Profile: [0009-0008-8425-939X](https://orcid.org/0009-0008-8425-939X)
* **“Apostle-7332: Symmetric Cryptographic Entitlements over Decentralized Barter Membranes”** — Kevan Burns, March 2026.
  * [IPFS Specifications CID QmTroyUnYkOrn9Rail](https://ipfs.legacychain.app/ipfs/QmTroyUnYkOrn9Rail)
* **“Moltbook Genesis Protocol Macroeconomic Carrying Capacity Simulation”** — Unykorn Research Group & Kevan Burns, June 2026.
  * [Zenodo DOI 10.5281/zenodo.18729652](https://doi.org/10.5281/zenodo.18729652)

---

## 🚀 Getting Started & Verification
1. **Prerequisites**: Node.js 22+, pnpm 11+, and WSL (Windows Subsystem for Linux).
2. **Installation**:
   ```bash
   git clone https://github.com/FTHTrading/Kevan-Burns.git
   cd Kevan-Burns
   pnpm install
   ```
3. **Environment Setup**:
   Copy `.env.example` to `.env` and configure credentials (`GEMINI_API_KEY`, `CLOUDFLARE_API_TOKEN`, `SMTP_PASS`, `SOLANA_RPC`, `STELLAR_SECRET`).
4. **Compile & Deploy**:
   To compile and deploy the Next.js app to Cloudflare Pages (bypassing native Windows compiler hangs):
   ```bash
   bash deploy-in-wsl.sh
   ```
5. **Local Validation**:
   ```bash
   pnpm typecheck  # Checks TypeScript compilation safety
   pnpm test       # Executes unit and simulation tests
   ```

---

## 📄 License
All rights reserved. Proprietary software of Unykorn Platforms.