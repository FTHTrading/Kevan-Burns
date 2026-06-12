# Unykorn Layer 1 Blockchain Specification & FINN AI Core Engine

## Abstract

This specification details the architecture of the Unykorn Layer 1 blockchain—a closed-loop execution organism built in Rust—and the FINN AI core engine. The Layer 1 protocol isolates network perception, cryptographic validation, consensus, execution, and persistent storage into five discrete chambers: POPEYE, TEV, CONSENSUS, MARS, and TAR. By separating execution from transport, the system enforces a strict cryptographic boundary that prevents non-validated states from corrupting the core ledger. We justify this design against traditional VM-based public ledgers for high-value estate planning and asset transfer. Additionally, we specify the FINN AI core engine, which provides autonomous agentic orchestration, memory persistence, and oracle integration for Web3 namespaces.

---

## 1. Introduction & Architectural Justification

Decentralized digital legacy systems require strict guarantees regarding data persistence, privacy, and state transitions. Traditional smart contract platforms (e.g., Ethereum Virtual Machine or Solana SVM) execute code within shared, public state spaces, exposing execution to front-running, gas fee volatility, and re-entrancy vectors. 

Unykorn Layer 1 implements a **closed-loop execution model** where execution is deterministic, decoupled from transport, and shielded behind a cryptographic gate. Under this model, the state machine behaves as a pure function:

$$\text{MARS}(S_t, TX) \rightarrow S_{t+1}$$

Where $S_t$ is the canonical state, $TX$ is a cryptographically verified transaction, and $S_{t+1}$ is the new deterministic state. This separation ensures that network packet storms, P2P latency, or disk serialization failures cannot compromise state transitions.

Furthermore, these systems comply with the **Georgia Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA)** (codified in O.C.G.A. § 53-13-1 et seq.) by securing all private data client-side (AES-256-GCM) and anchoring only cryptographic commitments to the Layer 1 chain. This satisfies estate disclosure requirements while preserving zero-knowledge privacy.

---

## 2. Layer 1 Component Breakdown

```
    UNTRUSTED ZONE              CRYPTO GATE           TRUSTED EXECUTION
┌───────────────────────┐    ┌───────────────┐    ┌─────────────────────────┐
│   POPEYE (P2P Gossip) │───▶│ TEV (Firewall)│───▶│ CONSENSUS ──▶ MARS ──▶ TAR
└───────────────────────┘    └───────────────┘    └─────────────────────────┘
```

The runtime is divided into five specialized, decoupled components:

### 2.1 MARS (The Runtime Brain)
* **Definition:** Deterministic State Machine & Execution Engine.
* **Responsibilities:**
  * Validates transaction logic (economic rules, account balances, nonces).
  * Executes state transitions as pure functions.
  * Produces and verifies blocks.
* **Justification:** MARS has **zero knowledge of networking or storage**. By keeping MARS pure, it can be mathematically verified, and state transitions remain identical across all validator nodes regardless of host hardware or network environment.

### 2.2 POPEYE (Network Perception)
* **Definition:** Network Gossip & Transport Layer.
* **Responsibilities:**
  * Manages peer discovery (mDNS for devnets, static seeds for mainnet).
  * Gossip propagation of blocks and transactions using `libp2p-gossipsub`.
  * Normalizes incoming wire payloads and manages duplicate message suppression.
* **Justification:** POPEYE never validates signatures or mutates state. It acts as the node's sensory system, isolating external P2P network threads from execution.

### 2.3 TEV (Cryptographic Truth Gate)
* **Definition:** Cryptographic Verification Firewall.
* **Responsibilities:**
  * Enforces the 96-byte transaction format: `[Transaction Data (32B)][Public Key (32B)][Signature (64B)]`.
  * Verifies Ed25519 signatures before payloads are queued.
  * Discards malformed or unsigned transactions immediately.
* **Justification:** TEV sits between POPEYE and CONSENSUS. It acts as an expensive CPU-shielding firewall; non-verified or corrupt packets are dropped at the gate, protecting the consensus engine from denial-of-service (DoS) signature-flooding attacks.

### 2.4 CONSENSUS (BFT Agreement Layer)
* **Definition:** Deterministic Byzantine Fault Tolerant Agreement.
* **Responsibilities:**
  * Coordinates round-based voting rounds (Propose, Prevote, Commit).
  * Elects leaders using a deterministic round-robin schedule: $\text{leader} = \text{validators}[\text{round} \pmod n]$.
  * Accumulates validator votes and generates finality certificates when $2/3+$ voting weight is reached.
* **Justification:** Consensus agrees on transaction ordering. It prevents double-spend forks and ensures instant finality (single-slot BFT) without the threat of chain re-organizations.

### 2.5 TAR (Memory with Receipts)
* **Definition:** Append-only Storage & Persistence Layer.
* **Responsibilities:**
  * Persists blocks, state updates, and consensus rounds to RocksDB.
  * Executes atomic writes (write-ahead logging, fsync before state commits).
  * Generates state snapshots at periodic heights (every 100 blocks) to facilitate fast bootstrap.
* **Justification:** TAR handles the physical disk I/O, shielding MARS and CONSENSUS from storage latency spikes.

---

## 3. FINN AI Core Engine

The FINN AI system represents the **autonomous cognitive and routing layer** of the Unykorn platform, orchestrating background ledger sweeps, customer onboarding, and metadata synchronization.

```
                  ┌────────────────────────────────────────┐
                  │          FINN AI Core Engine           │
                  ├────────────────────────────────────────┤
                  │  • Oracle Tool Spine                   │
                  │  • Vector Memory Subsystem             │
                  │  • A5 Agent Mesh (Vertex AI/Ollama)    │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │            Verification & RWA Targets            │
             ├──────────────────────────────────────────────────┤
             │  • IPFS Pinned Manifests (Pinata)                │
             │  • Solana Token-2022 (Local Keys)                │
             │  • Stellar Trustlines (Gold Reserves)            │
             └──────────────────────────────────────────────────┘
```

### 3.1 Cognitive Architecture
* **Spike/Oracle Spine:** Enables LLM reasoning models to call permission-gated system tools (e.g., querying namespace records, anchoring hashes).
* **Memory Subsystem:** Integrates local vector storage (ChromaDB/pgvector) to manage long-term agent state and family context.
* **Agent Mesh (A5):** Dispatches specialized roles including:
  * `Intake-Agent`: Handles initial zero-knowledge estate questionnaire collection.
  * `DNS-Agent`: Coordinates Cloudflare Zone configuration and CNAME updates.
  * `Compliance-Agent`: Verifies W3C DID presentations and SEC MIC identifiers.

### 3.2 Model Deployment & Run Environments
* **Vertex AI Integration:** Enterprise runtime for heavy reasoning swarms.
* **Sovereign Ollama Fallback:** A local execution profile running Ollama (`Llama-3.1-8B-v1`) to ensure autonomy and offline availability in private datacenter nodes (Peachtree Parkway, GA).

---

## 4. Truth Mechanisms: IPFS & Dual-Chain Mirroring

All systems publish state proofs to decentralized networks to establish immutable validation:

### 4.1 IPFS Manifest Pinning
Estate directories and token metadata are compiled into canonical JSON-LD manifests. These manifests are pinned to IPFS (via Pinata) yielding unique CIDs. The CID is signed by the owner's private key (DID) and anchored on-chain. This ensures that:
1. Manifest contents are tamper-proof (any edit changes the IPFS CID).
2. Data remains highly available on the decentralized web.

### 4.2 Dual-Chain Settlement Justification
The Unykorn platform mirrors namespaces across Solana and Stellar to combine speed with structural security:

1. **Solana (Token-2022):** Used for high-frequency operations, local agent keys, and developer API gating. Solana's sub-second transaction times allow rapid permission checking.
2. **Stellar (Asset Anchoring):** Used as the legal and wealth preservation anchor. Stellar's native trustline compliance and asset-issuing primitives secure the Zurich vault gold receipts and legally-bound RWA deeds.

---

## 5. Technical References & Citations

1. **BFT Consensus:** Castro, M., & Liskov, B. (2002). *Practical Byzantine Fault Tolerance and Proactive Recovery*. ACM Transactions on Computer Systems (TOCS).
2. **Bilinear Pairings & BBS+:** Boneh, D., Lynn, B., & Shacham, H. (2001). *Short Signatures from the Weil Pairing*. Journal of Cryptology.
3. **Decentralized Identifiers (DIDs):** W3C Working Group. (2022). *Decentralized Identifiers (DIDs) v1.0*. W3C Recommendation.
4. **Estate Law Framework:** Uniform Law Commission. (2015). *Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA)*.
5. **Macroeconomic Simulation:** Unykorn Research Group. (2026). *Moltbook Genesis Protocol Macroeconomic Carrying Capacity Simulation*. SSRN Paper Abstract #6241279.
