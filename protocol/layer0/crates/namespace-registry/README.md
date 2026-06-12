# Crate: `namespace-registry`

## Purpose

On-chain `.legacy` namespace model. Handles namespace creation, ownership, role assignment,
member management, status lifecycle, and namespace-scoped filing structure.

## Status: Planned

## Key Types (planned Rust)

```rust
pub struct Namespace {
    pub id: NamespaceId,          // UUID
    pub label: String,            // e.g. "smithfamily.legacy"
    pub owner: AccountId,
    pub members: Vec<Member>,
    pub status: NamespaceStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

pub enum NamespaceStatus {
    Active,
    ProbatePending,
    Frozen,
    Released,
    Disputed,
    Archived,
    Deactivated,
}

pub struct Member {
    pub account: AccountId,
    pub role: NamespaceRole,
    pub added_at: u64,
}

pub enum NamespaceRole {
    Owner,
    Executor,
    Attorney,
    Guardian,
    Beneficiary,
    Auditor,
    Observer,
}
```

## Events Emitted

- `NamespaceCreated { id, label, owner }`
- `NamespaceStatusChanged { id, previous, next, by }`
- `MemberAdded { namespace_id, account, role }`
- `MemberRemoved { namespace_id, account, role }`
- `OwnershipTransferred { id, from, to }`

## Filing Areas

Each namespace has a structured filing area scoped per namespace:
- Identity Vault
- Legal Documents
- Financial Assets
- Real Property
- Digital Assets
- Business Interests
- Personal & Family
- Healthcare Directives
- Beneficiary Instructions

## See Also

- `../../docs/NAMESPACE_MODEL.md` — full namespace model documentation
