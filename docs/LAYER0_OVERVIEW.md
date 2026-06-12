# Legacy Layer 0 — Protocol Overview

## What It Is

Legacy Layer 0 is the sovereign coordination protocol beneath the vault application.
It is an application-specific blockchain built in Rust, purpose-designed for estate
event settlement, namespace registry, and cross-chain proof coordination.

## Why a Dedicated Layer 0?

| Requirement | Why Existing Chains Don't Fit |
|------------|-------------------------------|
| Estate event privacy | Public chains expose estate data by default |
| `.legacy` namespace registry | No existing chain has estate-purpose namespace primitives |
| Institutional operator control | Public validator sets can't be controlled by the estate operator |
| Sub-second estate event finality | High-throughput public chains have confirmation delays |
| x402 service metering | Protocol-native billing requires custom hooks |
| RUFADAA-aligned release enforcement | General-purpose VMs can't enforce estate law semantics natively |

## Architecture

```
Legacy Layer 0
│
├── Node Layer (legacy-layer0-node binary)
│   ├── P2P networking (libp2p)
│   ├── JSON-RPC + gRPC API
│   ├── Block production (validator only)
│   └── Chain storage (RocksDB)
│
├── Runtime Layer
│   ├── Block execution + state transitions
│   ├── Transaction dispatch
│   └── State root computation (Merkle over all modules)
│
└── Module Layer (6 crates)
    ├── namespace-registry   .legacy namespace lifecycle
    ├── vault-anchor         Manifest hash + attestation anchoring
    ├── policy-engine        Release policy enforcement
    ├── audit-events         Append-only event stream (22 types)
    ├── x402-hooks           Service payment settlement
    └── cross-chain-relayer  Proof routing + chain adapters
```

## Consensus Model

**Phase 1: Authority PoS (Planned)**
- Operator-controlled validator set
- Suitable for institutional deployments under a single operator
- Fast finality (1-2 blocks)

**Phase 2: Permissionless PoS (Future)**
- Open validator set with staked identity
- Namespace holder voting on validator admission
- Slashing for equivocation

## Block Production

- 1 second block time target
- Skip empty blocks (estate operations are low-volume)
- Validator rotation: configurable round-robin or slot-based
- Minimum validator set: 1 for operator deployment, 3+ recommended for production

## Chain Anchoring Strategy

The application layer (Next.js) writes to Legacy Layer 0 via the gateway node's
JSON-RPC API. The chain provides:
- Immutable event ordering
- State root per block
- Historical state access via archive nodes

The application never writes to public chains directly. Cross-chain proof routing
(for external asset registries) is handled by relayer nodes.

## Network Topology

```
Internet
    │
    ▼
Gateway Node (JSON-RPC, port 9944)
    │
    ▼
Validator Nodes (consensus, block production)
    │
    ├── Observer Nodes (audit subscribers)
    ├── Archive Nodes (full history)
    └── Relayer Nodes (ETH, SOL, XRPL, Stellar bridges)
```

## Security Properties

- No private keys on-chain — only hashes, CIDs, and proof references
- All estate data encrypted before vault creation — Layer 0 sees only hashes
- Validator identity tied to W3C DIDs — slashable if misbehave
- Archive node provides legal evidence — immutable, timestamped, Merkle-provable

## Status

Planned. Rust scaffold at `protocol/layer0/`. Production deployment requires:
1. Select validator set and consensus parameters
2. Configure genesis block with initial namespace registry
3. Deploy gateway nodes with TLS
4. Connect web application gateway node endpoint in `.env.local`

## See Also

- `LAYER0_RUST_ARCHITECTURE.md` — Rust architecture details
- `VALIDATOR_NODE_RUNBOOK.md` — validator deployment guide
- `CROSS_CHAIN_DESIGN.md` — cross-chain proof routing
- `protocol/layer0/README.md` — codebase structure
