# Legacy Vault Protocol — Operator Information Architecture

## Overview

This document defines the information architecture for operators deploying
Legacy Vault Protocol — whether as a personal sovereign estate system,
a family office deployment, or an institutional multi-namespace operator.

## Operator Tiers

| Tier | Use Case | Namespaces | Validator Nodes |
|------|----------|-----------|-----------------|
| Personal | Individual sovereign estate | 1–3 | Optional (off-chain mode) |
| Family Office | Multi-member family estate management | 3–20 | Recommended (1 node) |
| Institutional | Law firm, trust company, RWA operator | Unlimited | Required (3+ nodes) |
| Network Operator | Run Legacy Layer 0 network infrastructure | N/A | Required (5+ validators) |

## Information Hierarchy

```
Operator
└── Organization (optional: maps to institutional entity)
    └── Namespaces (1..N)
        └── Vaults (1..N per namespace)
            ├── Documents (encrypted, IPFS-stored)
            ├── Assets (registered, categorized)
            ├── Wallets (external chain registry)
            ├── Release Policy (5-condition configuration)
            ├── Guardians (quorum members)
            ├── Executor Assignment
            ├── Beneficiary Assignments
            └── Audit Log (append-only)
```

## Administrative Zones

### Zone 1: Vault Owner (Private)
- Create and manage vaults
- Upload and encrypt documents
- Register wallet addresses
- Configure release policy
- Assign guardians and executor
- Download estate summaries

### Zone 2: Executor (Authority)
- View vault manifest (post-trigger)
- Submit identity verification
- Upload death certificate
- Initiate release claim
- Download executor packet
- View release status

### Zone 3: Guardian (Quorum)
- View pending release requests
- Approve or reject release
- View quorum status
- Submit guardian attestation

### Zone 4: Attorney / Notary (Legal)
- Submit attorney attestation
- View legal document inventory
- Download legal document packets
- Log notarization records

### Zone 5: Beneficiary (Post-Release)
- View allocated assets
- Download beneficiary packet
- Access scoped document inventory
- View transfer instructions

### Zone 6: Auditor / Compliance
- View full audit log
- Export audit log (CSV/JSON)
- View chain anchor verification
- Generate compliance reports

### Zone 7: Operator (Administrative)
- Manage namespace roster
- View x402 billing and usage
- Export namespace manifests
- Configure x402 spending limits
- Access Layer 0 node health

## Navigation Structure

```
/ (homepage)
├── /vault           — Owner zone: vault management
│   ├── /vault/create
│   ├── /vault/documents
│   ├── /vault/assets
│   ├── /vault/wallets
│   ├── /vault/policy
│   └── /vault/downloads
├── /executor        — Executor zone
│   └── /executor/review
├── /beneficiary     — Beneficiary zone
├── /guardian        — Guardian zone (implicit)
├── /admin           — Operator zone
│   ├── /admin/audit
│   └── /admin/x402
├── /architecture    — Protocol architecture overview
├── /features        — Feature capabilities
├── /namespaces      — .legacy namespace model
├── /layer0          — Legacy Layer 0 protocol
├── /cross-chain     — Cross-chain design
├── /x402            — x402 integration
├── /downloads       — All export/download types
├── /compare         — Competitive positioning
└── /status          — Build and system status
```

## Filing Action Items

Each namespace has a structured set of action items that should be completed
for a fully configured estate. These are the minimum requirements for a
legally useful vault.

### Critical (Complete Before Any Other Steps)
- [ ] Create namespace and first vault
- [ ] Assign executor with verified identity
- [ ] Assign at least 2 guardians (N-of-M quorum)
- [ ] Upload and sign will or trust document
- [ ] Configure 5-condition release policy

### High Priority
- [ ] Register all crypto wallet addresses (public addresses only)
- [ ] Upload advance healthcare directive / medical POA
- [ ] Upload real property deeds
- [ ] Document all financial accounts
- [ ] Assign and brief beneficiaries

### Standard Completion
- [ ] Register attorney contact and DID
- [ ] Document business interests
- [ ] Upload power of attorney documents
- [ ] Document digital platform accounts (with access instructions, not passwords)
- [ ] Upload life insurance policy references

### Maintenance (Annual Review)
- [ ] Update wallet registry for new/closed wallets
- [ ] Review and confirm release policy is current
- [ ] Confirm guardian contact details and willingness
- [ ] Download and review estate summary PDF
- [ ] Verify IPFS CID integrity for critical documents

## Downloadable Artifacts

| Artifact | Zone | Frequency |
|----------|------|-----------|
| Estate Summary PDF | Owner | Annual review |
| Namespace Manifest JSON | Operator | Per change |
| Asset Inventory CSV | Owner | Per change |
| Executor Packet PDF | Executor | At release |
| Beneficiary Packet PDF | Beneficiary | At release |
| Audit Log CSV/JSON | Auditor | On request |
| Release Policy Snapshot PDF | Owner / Attorney | Per policy change |
| Cross-chain Asset Summary PDF | Owner | Per snapshot |
| x402 Billing Summary CSV | Operator | Monthly |

## See Also

- `SYSTEM_OVERVIEW.md` — full system overview
- `NAMESPACE_MODEL.md` — namespace model
- `LEGAL_AND_SECURITY_GUARDRAILS.md` — legal constraints
- `OPERATOR_RUNBOOK.md` — production deployment
