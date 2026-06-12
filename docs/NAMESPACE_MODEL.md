# Legacy Namespace Model — `.legacy` Namespace Design

## Purpose

The `.legacy` namespace is the on-chain identity scope for an estate, family, trust,
or institution using Legacy Vault Protocol. It provides a human-readable, persistent
identifier that anchors all vault metadata, member roles, and filing structure.

## Namespace Format

```
<identifier>.legacy

Examples:
  smithfamily.legacy        — Family estate namespace
  doe-trust.legacy          — Trust entity namespace
  apexholdings.legacy       — Business/institutional namespace
  founder-kevan.legacy      — Individual namespace
```

## Namespace Lifecycle States

| State | Description |
|-------|-------------|
| `ACTIVE` | Namespace is operational. Owner has full access. |
| `PROBATE_PENDING` | Death proof submitted. Awaiting condition satisfaction. |
| `FROZEN` | All writes blocked. Dispute or legal hold in progress. |
| `RELEASED` | All release conditions satisfied. Executor access granted. |
| `DISPUTED` | Release challenged. Resolution required before proceeding. |
| `ARCHIVED` | Estate fully settled. Read-only historical access. |
| `DEACTIVATED` | Owner-initiated deactivation. No estate proceedings active. |

## Member Roles

| Role | Access Level | Authority |
|------|-------------|-----------|
| Owner | Full read/write | Creates, updates, and manages the namespace |
| Executor | Release authority | Can initiate release after conditions met |
| Attorney | Legal attestation | Provides attorney attestation for release |
| Guardian | Quorum member | Participates in N-of-M release quorum |
| Beneficiary | Scoped read (post-release) | Access to allocated assets after release |
| Auditor | Read-only audit log | Compliance review without write access |
| Observer | Event stream only | Watch-only subscription |

## Filing Areas

Each namespace has a structured filing area. Documents are filed by category:

```
smithfamily.legacy/
├── Identity Vault
│   └── DID, credentials, passport scans, identity proofs
├── Legal Documents
│   └── Will, trust documents, deeds, power of attorney
├── Financial Assets
│   └── Bank account records, investment accounts, retirement accounts
├── Real Property
│   └── Property deeds, mortgage records, appraisals
├── Digital Assets
│   └── Crypto wallet registry, NFT inventory, digital platform accounts
├── Business Interests
│   └── Equity records, partnership agreements, corporate documents
├── Personal & Family
│   └── Family records, personal memorabilia instructions, heirlooms
├── Healthcare Directives
│   └── Advance directive, medical POA, living will, healthcare wishes
└── Beneficiary Instructions
    └── Per-beneficiary allocation letters, transfer instructions
```

## Namespace Registration

Registration requires:
1. Owner authentication (W3C DID, NIST IAL 2 minimum)
2. Namespace label uniqueness verification (on-chain)
3. Initial filing structure creation
4. First manifest anchor (genesis manifest)

## Multiple Namespaces

An operator or family may hold multiple namespaces:
- One per family member for individual estates
- One per trust or legal entity
- One for institutional use (e.g. law firm managing multiple estates)

## On-chain Representation

Each namespace is stored in the `namespace-registry` module of Legacy Layer 0:
- Unique on-chain ID (UUID)
- Label → ID mapping (enforces uniqueness)
- Member roster with roles
- Filing area metadata
- Status with audit trail

## See Also

- `SYSTEM_OVERVIEW.md` — full system overview
- `LAYER0_OVERVIEW.md` — Layer 0 protocol
- `protocol/layer0/crates/namespace-registry/README.md` — Rust crate spec
- `/app/namespaces/page.tsx` — web UI
