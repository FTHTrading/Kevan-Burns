# Crate: `cross-chain-relayer`

## Purpose

Cross-chain proof routing between Legacy Layer 0 and external chains.
Handles wallet address registry, asset proof anchoring, and executor
transfer-readiness routing.

## Status: Planned (XRPL/Stellar via Apostle Chain bridge active)

## Key Types (planned Rust)

```rust
pub struct ExternalWallet {
    pub namespace_id: NamespaceId,
    pub vault_id: VaultId,
    pub chain: ExternalChain,
    pub address: String,           // Public address only — no private keys
    pub label: Option<String>,
    pub registered_at: u64,
    pub registered_by: AccountId,
    pub consent_hash: [u8; 32],    // Hash of owner consent record
}

pub enum ExternalChain {
    Ethereum,
    Base,
    Polygon,
    Solana,
    XRPL,
    Stellar,
    Bitcoin,
    EVMCompatible { chain_id: u64 },
}

pub struct ChainProofAnchor {
    pub namespace_id: NamespaceId,
    pub chain: ExternalChain,
    pub proof_type: ProofType,
    pub proof_hash: [u8; 32],      // Hash of external chain state snapshot
    pub block_ref: String,         // External chain block reference
    pub anchored_at: u64,
    pub relayer: AccountId,
}

pub enum ProofType {
    WalletStateSnapshot,
    TokenBalanceSnapshot,
    NFTInventorySnapshot,
    TransactionProof,
    ExecutorInstructionSet,
}

pub struct RelayerRoute {
    pub chain: ExternalChain,
    pub endpoint: String,          // Relayer node endpoint
    pub bridge_contract: Option<String>,  // Bridge contract address if applicable
    pub active: bool,
}
```

## Supported Chains & Status

| Chain | Status | Bridge |
|-------|--------|--------|
| XRPL | Active | Apostle Chain XRPL bridge |
| Stellar | Active | Apostle Chain Stellar bridge |
| Ethereum | Planned | Direct relayer node |
| Base | Planned | Direct relayer node |
| Polygon | Planned | Direct relayer node |
| Solana | Planned | Direct relayer node |
| Bitcoin | Registry Only | No bridge needed — address registry only |

## Security Model

- Owner must authorize wallet registration — no discovery without consent
- Public addresses only — no private keys, seed phrases, or mnemonics ever collected
- All registrations include a consent hash (owner-signed authorization)
- Relayer nodes verify chain inclusion proofs before anchoring

## Events Emitted

- `WalletRegistered { namespace_id, chain, address_hash }`
- `ProofAnchored { namespace_id, chain, proof_type, hash }`
- `RelayerRouteUpdated { chain, endpoint, active }`

## See Also

- `../../docs/CROSS_CHAIN_DESIGN.md` — full cross-chain design documentation
- `/app/cross-chain/page.tsx` — web UI for cross-chain features
