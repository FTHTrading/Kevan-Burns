# Legacy Vault Protocol — Cross-chain Design

## Philosophy

Legacy does not custody assets on external chains. It provides:
1. A verified registry of owner-authorized wallet addresses
2. On-chain proof anchors for asset state snapshots
3. Executor transfer-readiness reports with chain-specific instructions

**No private keys, seed phrases, or mnemonics are ever collected.**

## Cross-chain Architecture

```
Legacy Layer 0 (cross-chain-relayer module)
    │
    ├── XRPL Bridge (via Apostle Chain — ACTIVE)
    ├── Stellar Bridge (via Apostle Chain — ACTIVE)
    ├── Ethereum Relayer (PLANNED)
    ├── Base Relayer (PLANNED)
    ├── Polygon Relayer (PLANNED)
    ├── Solana Relayer (PLANNED)
    └── Bitcoin Registry (registry-only, no bridge needed)
```

## Owner-Authorized Wallet Registration

```
1. Owner authenticates to Legacy (W3C DID)
2. Owner provides public wallet address + chain
3. Owner signs authorization record (consent hash)
4. Legacy records: address, chain, consent hash, registration timestamp
5. Chain anchored by cross-chain-relayer module
```

The consent hash prevents unauthorized registration by third parties.

## Asset Snapshot Generation

After registration, Legacy can:
- Pull public balance data from chain APIs (no authentication required for public addresses)
- Generate a signed inventory of public balances at a point in time
- Anchor the snapshot hash to Legacy Layer 0
- Include the snapshot CID in the vault manifest

**Note**: Snapshot accuracy depends on public chain API availability and latency.
Legacy does not guarantee real-time balance data.

## Executor Instructions

After all release conditions are satisfied, Legacy generates:

### Per-chain Executor Packet
```
For each registered chain:
  - List of registered wallet addresses
  - Public balance snapshot (from last anchored snapshot)
  - Chain-specific transfer instructions:
    * Ethereum: ERC-20 transfer guide, ENS name reference
    * Solana: SPL token transfer guide
    * XRPL: Account settings and payment path guide
    * Bitcoin: UTXO transfer guide
  - Legal note: executor must consult chain-specific law and platform ToS
```

## Chain-Specific Notes

### XRPL
- Apostle Chain XRPL bridge is active (settlement operational via Apostle Chain)
- XRPL accounts can have blackhole addresses — executor must verify account status
- Destination tags must be preserved for exchange accounts

### Stellar
- Apostle Chain Stellar bridge is active
- USDF stablecoin routing via Apostle Chain
- Trustlines must be established before asset transfer

### Ethereum / Base / Polygon
- ERC-20 balance snapshots via public RPC
- ENS name resolution for human-readable executor instructions
- Multi-signature wallets: executor must contact signers separately

### Solana
- SPL token inventory via Solana public RPC
- NFT ownership via Metaplex metadata API
- Associated token accounts: executor must initialize if not present

### Bitcoin
- Address registry only (P2PKH, P2WPKH, P2SH)
- Balance via public block explorer API
- UTXO-based: executor must use wallet software with imported descriptor

## Security Model

| Threat | Mitigation |
|--------|-----------|
| Unauthorized wallet registration | Owner consent hash required for every entry |
| Impersonation of owner | W3C DID + NIST IAL 2/3 authentication required |
| Snapshot tampering | Snapshot hash anchored on Legacy Layer 0 — tamper detectable |
| Relay node manipulation | Multiple relayer nodes for cross-validation |
| Private key exposure | Never requested, never accepted, never stored |

## RUFADAA Alignment

The Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA) grants
fiduciaries access to the catalogue of digital accounts, not necessarily
the contents. Legacy's wallet registry is designed to satisfy RUFADAA fiduciary
disclosure requirements without exposing private access credentials.

## See Also

- `SYSTEM_OVERVIEW.md` — full system overview
- `LAYER0_OVERVIEW.md` — Layer 0 protocol
- `protocol/layer0/crates/cross-chain-relayer/README.md` — Rust crate
- `/app/cross-chain/page.tsx` — web UI
