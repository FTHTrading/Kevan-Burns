# Crate: `policy-engine`

## Purpose

On-chain release policy snapshots, guardian quorum configuration, waiting period
enforcement, and condition satisfaction tracking.

## Status: Planned

## Key Types (planned Rust)

```rust
pub struct ReleasePolicy {
    pub vault_id: VaultId,
    pub version: u32,
    pub require_executor_identity: bool,
    pub require_death_certificate: bool,
    pub require_attorney_attestation: bool,
    pub require_guardian_quorum: bool,
    pub guardian_quorum_n: u32,
    pub guardian_quorum_m: u32,
    pub waiting_period_days: u32,
    pub created_at: u64,
    pub hash: [u8; 32],   // SHA-256 of serialized policy
}

pub enum ReleaseCondition {
    ExecutorIdentityVerified,
    DeathCertificateUploaded,
    AttorneyAttested,
    GuardianQuorumReached,
    WaitingPeriodElapsed,
}

pub struct ConditionSatisfied {
    pub vault_id: VaultId,
    pub condition: ReleaseCondition,
    pub satisfied_by: AccountId,
    pub evidence_hash: Option<[u8; 32]>,  // Hash of supporting document
    pub timestamp: u64,
}

pub struct ReleaseEvent {
    pub vault_id: VaultId,
    pub policy_hash: [u8; 32],
    pub conditions_hash: [u8; 32],    // Hash of all satisfied conditions
    pub executor: AccountId,
    pub released_at: u64,
    pub signature: [u8; 64],
}
```

## Events Emitted

- `PolicyAnchored { vault_id, version, hash }`
- `ConditionSatisfied { vault_id, condition, by }`
- `ReleaseExecuted { vault_id, executor, policy_hash }`
- `WaitingPeriodStarted { vault_id, days_remaining }`
- `DisputePeriodStarted { vault_id, raised_by }`

## Policy Enforcement Rules

- No release without all 5 conditions satisfied (configurable)
- Guardian quorum N-of-M strictly enforced — partial quorum does not unlock
- Waiting period is wall-clock enforced, not block-count — chain timestamp used
- A disputed vault is frozen until resolution recorded

## See Also

- `../../docs/LAYER0_OVERVIEW.md` — protocol overview
