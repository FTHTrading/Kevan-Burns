# Legacy Vault Protocol — System Overview

## What It Is

Legacy Vault Protocol is a **sovereign estate operating system** — not a document filing app.

It provides the full infrastructure stack for creating, managing, verifying, and releasing
a private digital estate across any asset class: legal documents, crypto wallets, real estate,
business interests, digital accounts, and more.

## Core Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Application Layer (Next.js 15, TypeScript, Tailwind)        │
│  16+ pages, 8 API routes, Prisma 14-model schema             │
├─────────────────────────────────────────────────────────────┤
│  Protocol Layer (Release Engine, AES-256-GCM, DID/VC)        │
│  Multi-proof release conditions, identity verification        │
├─────────────────────────────────────────────────────────────┤
│  Deals Layer (deals/contracts/DealSPV.sol with ALL ZK proofs) │
│  SPV token offerings for 5046 McKinzey, Weild etc. using     │
│  DocumentHashProof, GuardianQuorum, FiveProofRelease,        │
│  UnityLegacy5Proof for doc, quorum, release in deals.        │
│  Integrated with FlashRouter for best liquidity rates.       │
│  Best deals: Zoniqx, RealT, Lofty, Lake Lanier/Atlanta.      │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer (Private IPFS, SHA-256 manifest hashing)       │
│  Content-addressed, encrypted before upload                  │
├─────────────────────────────────────────────────────────────┤
│  Registry Layer (Private Blockchain, Audit Event Stream)      │
│  Immutable chain anchoring, 22 audit action types            │
├─────────────────────────────────────────────────────────────┤
│  Identity Layer (W3C DID, VC 2.0, NIST IAL 2/3)              │
│  Executor/attorney/guardian cryptographic authority          │
├─────────────────────────────────────────────────────────────┤
│  Coordination Layer (Legacy Layer 0 — Rust, Planned)          │
│  Namespace registry, cross-chain proof routing, x402         │
└─────────────────────────────────────────────────────────────┘
```

## Primary Concepts

### Vault
A vault is a private encrypted container for one estate. It holds:
- Encrypted document references (IPFS CIDs)
- Asset inventory entries
- Wallet address registrations
- Release policy configuration
- Guardian and executor assignments

### Namespace
A `.legacy` namespace is an on-chain identity scope for a family, trust, or institution.
Example: `smithfamily.legacy`, `doe-trust.legacy`, `apexholdings.legacy`.
Multiple vaults can exist within one namespace. Members have role-scoped access.

### Release Policy
The multi-proof release engine requires 5 simultaneous conditions before access is granted:
1. Executor identity verified (W3C DID + VC 2.0, NIST IAL 2/3)
2. Death certificate uploaded and hashed
3. Attorney / notary attestation recorded
4. Guardian N-of-M quorum reached
5. Configurable waiting / dispute period elapsed

No single party can force a release unilaterally.

### Audit Trail
Every vault action (22 types) is logged with:
- Actor address
- Timestamp
- Hash of affected object
- Chain anchor reference

The audit trail is append-only and tamper-detectable.

## Data Model Summary

14 Prisma models:
- `User` — 6 roles (owner, executor, attorney, beneficiary, guardian, auditor)
- `Vault` — 5 status states
- `Document` — 13 document types
- `Asset` — 10 asset categories
- `Wallet` — multi-chain wallet registry
- `ReleasePolicy` — 5-condition policy configuration
- `ReleaseRequest` — 9 claim states
- `Guardian` — quorum member records
- `ExecutorAssignment` — executor authority records
- `BeneficiaryAssignment` — allocation records
- `AuditLog` — 22 action types
- `VaultManifest` — SHA-256 manifest versioning
- `AccessGrant` — scoped access control
- `VerifiedCredential` — W3C VC storage

## Technology Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Web framework | Next.js 15 (App Router) | Implemented |
| Language | TypeScript 5 strict | Implemented |
| Database | PostgreSQL + Prisma 5 | Implemented |
| Encryption | AES-256-GCM (Web Crypto API) | Implemented |
| Testing | Vitest 2.1 (33 tests) | Implemented |
| Storage | Private IPFS (mock adapter) | Mock adapter |
| Chain registry | Private blockchain (mock adapter) | Mock adapter |
| Identity | W3C DID + VC 2.0 (planned) | Planned |
| Layer 0 protocol | Rust (scaffold) | Scaffold |
| x402 billing | HTTP 402 (local adapter) | Local adapter |
| Cross-chain | Multi-chain relayer (planned) | Planned |

## See Also

- `NAMESPACE_MODEL.md` — `.legacy` namespace design
- `LAYER0_OVERVIEW.md` — Layer 0 protocol
- `CROSS_CHAIN_DESIGN.md` — cross-chain architecture
- `X402_INTEGRATION.md` — x402 billing integration
- `OPERATOR_RUNBOOK.md` — production deployment
- `LEGAL_AND_SECURITY_GUARDRAILS.md` — legal and security constraints
