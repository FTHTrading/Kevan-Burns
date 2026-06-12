# Legacy Layer 0 — Rust Architecture

## Crate Dependency Graph

```
legacy-layer0-node (binary)
    ├── legacy-runtime
    │   ├── legacy-namespace-registry
    │   ├── legacy-vault-anchor
    │   ├── legacy-policy-engine
    │   ├── legacy-audit-events
    │   ├── legacy-x402-hooks
    │   └── legacy-cross-chain-relayer
    └── legacy-p2p (internal — wraps libp2p)
```

## Workspace `Cargo.toml` (planned)

```toml
[workspace]
members = [
    "node",
    "runtime",
    "crates/namespace-registry",
    "crates/vault-anchor",
    "crates/policy-engine",
    "crates/audit-events",
    "crates/x402-hooks",
    "crates/cross-chain-relayer",
]

resolver = "2"

[workspace.dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4", "serde"] }
sha2 = "0.10"
ed25519-dalek = "2"
rocksdb = "0.22"
libp2p = "0.53"
tonic = "0.11"
prost = "0.12"
anyhow = "1"
thiserror = "1"
tracing = "0.1"
```

## Module Interface Pattern

Each crate exposes a `Module` trait:

```rust
pub trait Module {
    type State: Serialize + DeserializeOwned;
    type Event: Serialize + Clone;
    type Error: std::error::Error;

    fn apply(&mut self, tx: &SignedTx) -> Result<Vec<Self::Event>, Self::Error>;
    fn state_root(&self) -> [u8; 32];
    fn get_state(&self) -> &Self::State;
}
```

The runtime dispatches transactions to modules by type prefix, collects events,
and computes the combined state root.

## Storage Architecture

All modules use RocksDB column families:

```
CF: namespace_registry    Key: NamespaceId    Value: Namespace (bincode)
CF: namespace_labels      Key: String         Value: NamespaceId
CF: vault_manifests       Key: (VaultId, version) Value: ManifestAnchor
CF: attestations          Key: AttestationId  Value: Attestation
CF: policies              Key: (VaultId, version) Value: ReleasePolicy
CF: conditions            Key: (VaultId, ReleaseCondition) Value: ConditionSatisfied
CF: release_events        Key: VaultId        Value: ReleaseEvent
CF: audit_events          Key: u64 (sequence) Value: AuditEvent
CF: x402_records          Key: ServiceRecordId Value: X402ServiceRecord
CF: external_wallets      Key: WalletId       Value: ExternalWallet
CF: chain_proofs          Key: ProofId        Value: ChainProofAnchor
```

## Cryptographic Choices

| Purpose | Algorithm |
|---------|----------|
| Address/identity | Ed25519 |
| Hashing | SHA-256 (SHA-3 for state roots) |
| Signing | Ed25519 (same key as identity) |
| Merkle tree | Binary Merkle with SHA-256 leaves |
| P2P authentication | Noise protocol (via libp2p) |

## Build and Test

```bash
# Build all crates
cargo build --workspace

# Run all tests
cargo test --workspace

# Build release binary
cargo build --release --bin legacy-layer0-node

# Check without building
cargo check --workspace

# Run clippy
cargo clippy --workspace -- -D warnings
```

## Performance Targets

| Operation | Target |
|-----------|--------|
| Transaction throughput | 1,000 TPS (estate ops are low-volume) |
| Block time | 1 second |
| State root computation | < 10ms |
| P2P gossip latency | < 100ms |
| Archive node query (1M events) | < 500ms |

## See Also

- `LAYER0_OVERVIEW.md` — protocol overview
- `VALIDATOR_NODE_RUNBOOK.md` — deployment guide
- `protocol/layer0/README.md` — repository structure
