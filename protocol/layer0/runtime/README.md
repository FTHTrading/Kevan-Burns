# Legacy Layer 0 — Block Execution Runtime

## Purpose

The runtime is the core state machine for Legacy Layer 0. It defines:
- Block structure and validation rules
- Transaction types and dispatch
- State transition logic
- Event emission for all protocol modules

## Status: Planned

## Architecture

```
runtime/
├── src/
│   ├── lib.rs            ← Runtime entry point
│   ├── block.rs          ← Block + header types
│   ├── tx.rs             ← Transaction envelope + dispatch
│   ├── state.rs          ← State root management
│   └── modules/
│       ├── namespace.rs  ← Namespace registry dispatch
│       ├── vault.rs      ← Vault manifest anchoring dispatch
│       ├── policy.rs     ← Release policy enforcement dispatch
│       ├── audit.rs      ← Audit event stream dispatch
│       ├── x402.rs       ← x402 payment hook dispatch
│       └── relay.rs      ← Cross-chain relay dispatch
└── README.md             ← this file
```

## Transaction Types

| Type | Module | Description |
|------|--------|-------------|
| `namespace::Create` | namespace-registry | Register a new `.legacy` namespace |
| `namespace::Transfer` | namespace-registry | Transfer namespace ownership |
| `namespace::Freeze` | namespace-registry | Freeze namespace pending probate |
| `vault::AnchorManifest` | vault-anchor | Anchor vault manifest hash |
| `vault::RecordAttestation` | vault-anchor | Record executor/guardian attestation |
| `policy::SetPolicy` | policy-engine | Set or update release policy |
| `policy::RecordCondition` | policy-engine | Record a satisfied release condition |
| `audit::LogEvent` | audit-events | Append audit event to stream |
| `x402::RecordPayment` | x402-hooks | Record x402 service payment |
| `relay::AnchorProof` | cross-chain-relayer | Anchor external chain proof |

## Block Structure (planned)

```rust
pub struct BlockHeader {
    pub parent_hash: [u8; 32],
    pub state_root: [u8; 32],
    pub extrinsics_root: [u8; 32],
    pub height: u64,
    pub timestamp: u64,
    pub author: ValidatorId,
    pub signature: [u8; 64],
}

pub struct Block {
    pub header: BlockHeader,
    pub extrinsics: Vec<SignedTx>,
}
```

## State Root

The state root is a Merkle root over all module state trees:
- `namespace-registry` state
- `vault-anchor` state
- `policy-engine` state
- `audit-events` state (append-only Merkle log)
- `x402-hooks` state
- `cross-chain-relayer` state

Each module maintains its own sub-tree. The runtime computes the combined root.
