# Crate: `audit-events`

## Purpose

Append-only audit event stream for all vault and namespace actions.
All 22 audit action types are written to this module. The stream is Merkle-logged
and tamper-detectable.

## Status: Planned

## Audit Action Types (22 total)

```rust
pub enum AuditAction {
    // Vault lifecycle
    VaultCreated,
    VaultUpdated,
    VaultLocked,
    VaultUnlocked,
    VaultFrozen,

    // Document operations
    DocumentUploaded,
    DocumentDeleted,
    DocumentAccessed,
    DocumentVerified,

    // Asset operations
    AssetRegistered,
    AssetUpdated,
    WalletRegistered,

    // Policy & release
    PolicyUpdated,
    ConditionSatisfied,
    ReleaseInitiated,
    ReleaseCompleted,
    DisputeFiled,
    DisputeResolved,

    // Access & identity
    IdentityVerified,
    AccessGranted,
    AccessRevoked,

    // Administrative
    AdminAction,
}

pub struct AuditEvent {
    pub id: AuditEventId,
    pub vault_id: Option<VaultId>,
    pub namespace_id: Option<NamespaceId>,
    pub action: AuditAction,
    pub actor: AccountId,
    pub target_hash: Option<[u8; 32]>,   // Hash of affected object
    pub metadata_hash: Option<[u8; 32]>, // Hash of action metadata
    pub previous_event_hash: [u8; 32],   // Linked-list chain for tamper detection
    pub timestamp: u64,
    pub block_height: u64,
}
```

## Tamper Detection

Each event includes a `previous_event_hash` linking it to the prior event in the stream.
Any modification to a prior event breaks the chain — verifiable by any observer node.

The stream Merkle root is included in each block's state root, providing
block-level tamper evidence for the entire audit history.

## Events Emitted (chain events for observer nodes)

- `AuditEventRecorded { id, action, vault_id, timestamp }`

## Querying the Audit Stream

Observer and archive nodes subscribe to audit events and maintain local
indexes by vault_id, namespace_id, actor, action type, and time range.
The chain itself stores only the Merkle-logged stream — full content is
retrieved via the archive node API.

## See Also

- `../../docs/LAYER0_OVERVIEW.md` — protocol overview
