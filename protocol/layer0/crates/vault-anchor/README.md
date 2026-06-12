# Crate: `vault-anchor`

## Purpose

Immutable anchoring of vault manifest hashes and cryptographic attestation records.
Every vault state change produces a SHA-256 manifest hash that is written to the chain
by this module.

## Status: Planned

## Key Types (planned Rust)

```rust
pub struct ManifestAnchor {
    pub vault_id: VaultId,
    pub namespace_id: NamespaceId,
    pub manifest_hash: [u8; 32],   // SHA-256 of full vault manifest JSON
    pub ipfs_cid: Option<String>,  // Optional IPFS CID reference
    pub version: u32,
    pub anchored_at: u64,
    pub anchored_by: AccountId,
}

pub struct Attestation {
    pub vault_id: VaultId,
    pub attester: AccountId,
    pub attester_role: AttestationRole,
    pub kind: AttestationKind,
    pub credential_id: Option<String>,  // W3C VC ID
    pub timestamp: u64,
    pub signature: [u8; 64],
}

pub enum AttestationRole {
    Executor,
    Attorney,
    Guardian,
    Notary,
    Auditor,
}

pub enum AttestationKind {
    AuthorityEstablished,
    GuardianApproval,
    DeathProofVerified,
    AttorneyVerified,
    WaitingPeriodConfirmed,
    DisputeRaised,
    DisputeResolved,
}
```

## Events Emitted

- `ManifestAnchored { vault_id, hash, version, by }`
- `AttestationRecorded { vault_id, attester, kind }`

## Invariants

- Manifest anchors are append-only — no update, no delete
- Once anchored, a manifest hash cannot be changed
- Each anchor has a monotonically increasing version number per vault
- The chain enforces ordering — no out-of-order anchoring

## See Also

- `../../docs/LAYER0_OVERVIEW.md` — protocol overview
