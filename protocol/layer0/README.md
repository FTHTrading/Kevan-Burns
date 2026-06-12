# Legacy Layer 0 — Sovereign Estate Coordination Protocol

## Purpose

Legacy Layer 0 is the protocol substrate beneath the vault application.

It handles:
- Namespace registry (`.legacy` namespace lifecycle)
- Vault manifest anchoring (immutable SHA-256 hashes per vault state change)
- Release policy on-chain enforcement
- Guardian/executor attestation recording
- Audit event stream (all 22 action types)
- Cross-chain proof routing (ETH, SOL, XRPL, Stellar, Bitcoin, Base, Polygon)
- x402 service settlement hooks

## Status

**Planned** — Rust scaffold defined. Production deployment requires validator node setup and a chosen consensus mechanism (authority-based PoS recommended for initial institutional deployments).

## Repository Structure

```
protocol/layer0/
├── README.md              ← this file
├── node/                  ← Node binary (CLI, P2P, RPC)
│   └── README.md
├── runtime/               ← Block execution runtime
│   └── README.md
└── crates/
    ├── namespace-registry/    ← .legacy namespace on-chain model
    ├── vault-anchor/          ← Manifest + attestation anchoring
    ├── policy-engine/         ← Release policy on-chain enforcement
    ├── audit-events/          ← Event stream + append-only log
    ├── x402-hooks/            ← Payment settlement integration
    └── cross-chain-relayer/   ← Proof routing + chain adapters
```

## Node Types

| Node Type | Role | Required |
|-----------|------|----------|
| Validator | Consensus participant, block proposer | Yes (minimum 1) |
| Observer | Read-only audit subscriber | No |
| Archive | Historical state retention | Recommended for legal use |
| Relayer | Cross-chain event routing | Required for cross-chain features |
| Gateway | External API integration | Required for institutional integrations |

## Build Requirements (when implemented)

```bash
# Minimum Rust toolchain
rustup override set stable

# Build the node binary
cargo build --release --bin legacy-layer0-node

# Run with config
./target/release/legacy-layer0-node --config node/config.toml
```

## References

- See `node/README.md` for node binary design
- See `runtime/README.md` for block execution runtime design
- See `crates/*/README.md` for individual crate specifications
- See `../../docs/LAYER0_OVERVIEW.md` for full protocol overview
- See `../../docs/LAYER0_RUST_ARCHITECTURE.md` for architecture details
