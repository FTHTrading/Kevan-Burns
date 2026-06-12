# Unykorn Systems Registry & Architectural Justification

## Executive Summary

The Unykorn platform (unykorn.ai), developed by the Unykorn Platform Group, is supported by a multi-layered codebase distributed across several GitHub organizations and profiles: `FTHTrading`, `kevanbtc`, `unykornai`, `y3kmarkets`, and `y3kdigital`. Rather than a monolithic repository, the system is designed as a modular, service-oriented architecture. This spec catalogs the repository classes, justifies their separation, and maps their role in achieving a zero-knowledge, deterministic, and RUFADAA-compliant digital legacy infrastructure.

---

## 1. System Dependency Layering

The Unykorn ecosystem is structured into seven distinct architectural layers. This division ensures strict separation of concerns, isolation of cryptographic gates, and deterministic state processing:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 07: Client Interface (troptions-os, troptions-browser, CEF shell) │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 06: Cognitive Swarms (Finn, Needai, badass-Ai-, 6-Agent Mesh)     │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 05: Estate Application (legacy-vault-protocol, Heirloom OS)      │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 04: RWA Tokenization (ruby/Allure, rwa-realestate, TEV schemas)   │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 03: Settlement Rails (troptions-rails, fth-capital-rails, USDF)  │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 02: Namespace Protocol (sovereign-namespace-protocol, DID/VC)    │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 01: Core L1 Runtime (UnyKorn-L-1, Popeye-Tars-Mars-Tev)           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Repository Classification & Purpose

Below is the verified inventory of the core repositories, grouped by functional layer, detailing their technical stack and operational roles:

### 2.1 Core Layer 1 Runtime (Layer 01)
These repositories implement the consensus state machine and the low-level execution engine:

* **`Popeye-Tars-Mars-Tev` / `UnyKorn-L-1` / `Troptions-L1` / `fth-infrastructure`** (Rust / C++)
  * *Purpose:* The bedrock execution layer. Decouples network gossip (`popeye`) and cryptographic firewalls (`tev`) from state transitions (`mars`) and atomic storage (`tar`).
  * *Justification:* Establishes a pure, deterministic execution runtime with single-slot finality, eliminating re-organization risk and protecting the state machine from gossip DoS vectors.

### 2.2 Sovereign Namespaces & Identity (Layer 02)
These repositories manage root namespaces, cryptographic deeds, and digital identities:

* **`Legacy-Namespace-Registry` / `sovereign-namespace-protocol` / `Vs-Identity-os`** (TypeScript)
  * *Purpose:* Registry management for permanent user roots and suffix containers (e.g. `.1`, `.gold`, `.ai`, `.mcp`).
  * *Justification:* Establishes cryptographic provenance over digital names, enabling post-quantum stateless namespace verification and owner-authorized wallet mappings.

### 2.3 Multi-Chain Settlement Rails (Layer 03)
These repositories secure stablecoins, asset-issued tokens, and transactional rails:

* **`troptions-rails` / `fth-capital-rails` / `USDF` / `fth-stablecoin-rail`** (Rust / Solidity / TypeScript)
  * *Purpose:* Implements 9 multi-chain rails with unified `BridgePayload` and direct integrations for USDT, USDC, RLUSD, and the proprietary fiat-backed USDF stablecoin.
  * *Justification:* Supports automated capital routing and arbitrage swaps across EVM (Arbitrum, Polygon, Base), XRPL, and Stellar networks with integrated transaction compliance.

### 2.4 Real-World Asset (RWA) Tokenization (Layer 04)
These repositories handle metadata schemas, appraisals, and legal contracts:

* **`ruby` (Allure Ruby & Siam Emerald)** (TypeScript / Ruby)
  * *Purpose:* Integrates W3C Verifiable Credentials Data Model (VCDM) 2.0 schemas, token metadata, and selective-disclosure BBS+ proofs.
  * *Justification:* Standardizes appraisers' and trustees' attestations for commodities (e.g. Zurich Vault Gold receipts) and real estate, securing claims without exposing private holder identities.
* **`rwa-realestate` / `rwa-properties` / `TEV` / `truth`** (Solidity / TypeScript)
  * *Purpose:* Smart contracts and compilers converting real-world deeds to verifiable tokens. Layer 01 substrate maps the legal trust structures directly to the chain.

### 2.5 Cognitive AI Swarms (Layer 06)
These repositories host the multi-agent swarms that operate the ecosystem:

* **`Finn` / `badass-Ai-` / `Needai` / `jarvis`** (Python / TypeScript)
  * *Purpose:* The orchestration engine running Vertex AI and local Ollama (`Llama-3.1-8B-v1`) models. Integrates RAG vector search indices, NVIDIA Triton pipelines, and voice call interfaces.
  * *Justification:* Automates background compliance audits, website health status updates, and local database reindexing under a permission-gated MCP (Model Context Protocol) tool spine.

### 2.6 Sovereign Browsers & OS (Layer 07)
These repositories govern client-side desktops and spatial metaverse containers:

* **`troptions-os` / `troptions-browser` / `digital-giant` / `browser`** (React / TypeScript / CEF C++)
  * *Purpose:* Custom Chromium Embedded Framework (CEF) browser shells and 3D spatial user interface (Nano Bana 3D).
  * *Justification:* Enforces client-side sandboxing, preventing external malware from leaking AES-256-GCM vault recovery materials during ZK credential presentation.

---

## 3. Systems Justification Matrix

| Challenge | Public Blockchain Limitations | Unykorn Architectural Justification | Repositories Involved |
|-----------|-------------------------------|-------------------------------------|-----------------------|
| **Data Privacy** | Public ledgers expose balance and probate records by default. | Zero-knowledge client-side encryption (AES-GCM) + selective BBS+ proofs. | `ruby` (Allure), `TEV`, `truth` |
| **Probate Delay** | traditional wills require 12-18 months in Georgia probate. | 5-Proof consensus release triggered on-chain via ZK dead-man switches. | `legacy-vault-protocol`, `sovereign-namespace-protocol` |
| **Execution Safety** | Shared state engines expose transactions to MEV front-running. | Decoupled MARS pure transitions + TEV signature gates. | `Popeye-Tars-Mars-Tev`, `UnyKorn-L-1` |
| **Asset Volatility** | Speculative tokens cannot serve as estate reserves. | Stellar-anchored USDF stablecoin matched against physical Zurich Gold. | `USDF`, `troptions-rails`, `fth-stablecoin-rail` |
| **AI Integration** | Web2 AI nodes lack secure, protocol-gated execution. | Model Context Protocol (MCP) servers calling isolated L1 JSON-RPCs. | `Finn`, `badass-Ai-`, `Needai` |

---

## 4. References & Cryptographic Verifications

* **W3C Decentralized Identifiers (DIDs) v1.0:** Grounded in `did:unykorn` and `did:web:legacy.fthtrading.com` specifications.
* **W3C Verifiable Credentials Data Model (VCDM) 2.0:** Secure selective disclosures using ciphersuite `BLS12-381-SHA-256` for Boneh–Lynn–Shacham signatures.
* **NIST IAL 2/3 and Georgia RUFADAA (O.C.G.A. § 53-13-1):** Compliant authentication and fiduciary access control maps.
