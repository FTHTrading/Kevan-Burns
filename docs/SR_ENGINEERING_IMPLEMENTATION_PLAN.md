# Legacy Vault Protocol — Senior Engineering Implementation Plan

## Current State (as of 2026)

### Implemented (Production-Ready)
- Next.js 15 App Router, TypeScript strict, Tailwind CSS
- Prisma 14-model schema (PostgreSQL)
- AES-256-GCM encryption lib (`lib/crypto/aes-256-gcm.ts`)
- Multi-proof release engine (`lib/release/engine.ts`) with 5 conditions
- 33 Vitest unit tests — all passing
- Full CI pipeline (typecheck → test → build → deploy)
- 20+ application pages
- GitHub Pages marketing site

### Mock Adapters (Functional but Not Production)
- Private IPFS (`lib/ipfs/adapter.ts`) — returns deterministic mock CIDs
- Blockchain registry (`lib/chain/adapter.ts`) — mock chain ID / tx hash
- Export / PDF generation — placeholder UI, no real PDF output
- DID / VC identity — not yet integrated

### Planned (Scaffolded)
- Legacy Layer 0 (Rust) — crate structure and READMEs defined
- x402 payment gateway — local adapter in place
- Cross-chain relayer nodes — XRPL/Stellar via Apostle Chain (active), others planned

---

## Phase 1: Production Infrastructure (8–12 weeks)

### 1.1 IPFS Production Integration
**Priority: Critical**
- Deploy private IPFS cluster (minimum 3 nodes for redundancy)
- Use swarm key for private network isolation
- Replace `lib/ipfs/adapter.ts` mock with real `ipfs-http-client` calls
- Implement `ipfs.add(encryptedBytes)` → return real CID
- Implement `ipfs.get(cid)` → return encrypted bytes
- Add CID verification (SHA-256 of content must match CID)
- Store IPFS node URL in `.env.local` → `IPFS_API_URL`

**Test coverage required**: CID integrity, upload/download round-trip, encryption-before-upload

### 1.2 Database Production Setup
**Priority: Critical**
- Deploy PostgreSQL (Railway, Neon, or self-hosted with RDS)
- Run `pnpm db:push` against production database
- Set `DATABASE_URL` in production environment
- Implement connection pooling (PgBouncer or Prisma Accelerate)
- Set up daily automated backups

### 1.3 Authentication
**Priority: Critical**
- Integrate NextAuth.js 5 (or Clerk) for owner authentication
- Vault actions must be gated on authenticated user
- API routes must validate session and vault ownership
- Implement DID-based auth as extension for executor/attorney roles

---

## Phase 2: Identity and Release Engine (6–8 weeks)

### 2.1 W3C DID Integration
**Priority: High**
- Integrate `did:key` or `did:web` resolver
- Implement DID document creation for estate owners
- Store DID in `VerifiedCredential` model
- Verify executor DID against VC 2.0 credential before release

**Libraries**: `@digitalbazaar/did-io`, `@digitalbazaar/vc`

### 2.2 Verifiable Credentials
**Priority: High**
- Issue executor authority VC (signed by operator key)
- Issue attorney attestation VC (signed by attorney DID)
- Verify VC proof chain in release engine
- Store VC JSON in `VerifiedCredential` model

### 2.3 Release Engine API Routes
**Priority: High**
- `POST /api/release/initiate` — create ReleaseRequest, check conditions
- `POST /api/release/submit-proof` — upload death certificate, record hash
- `POST /api/release/guardian-vote` — record guardian approval
- `GET /api/release/[id]/status` — return condition satisfaction state
- All routes must enforce authentication + role checks

---

## Phase 3: Chain Registry (4–6 weeks)

### 3.1 Private Blockchain (Legacy Layer 0 or Apostle Chain)
**Option A** (Faster): Use existing Apostle Chain (port 7332) as registry
- Register vault creation events via `/v1/tx`
- Record manifest hashes via custom tx payload
- Use agent wallet for signing

**Option B** (Sovereign): Deploy Legacy Layer 0 validator node
- Compile `protocol/layer0/` Rust workspace
- Deploy validator node per `VALIDATOR_NODE_RUNBOOK.md`
- Replace `lib/chain/adapter.ts` mock with real Layer 0 JSON-RPC calls

**Recommendation**: Option A for 90-day MVP, Option B for institutional deployment

### 3.2 Audit Log Chain Anchoring
- Replace mock tx hash in `lib/chain/adapter.ts` with real chain submission
- Every audit event writes a hash + tx reference to chain
- Store tx hash in `AuditLog.txHash` field

---

## Phase 4: Export and Downloads (4–6 weeks)

### 4.1 PDF Generation
**Technology**: Playwright (headless Chromium) or `@react-pdf/renderer`
- Executor Packet PDF: vault manifest + asset inventory + release proof
- Beneficiary Packet PDF: scoped allocation + wallet instructions
- Compliance Report PDF: RUFADAA-aligned fiduciary summary
- Estate Summary PDF: full vault overview

### 4.2 CSV/JSON Exports
- Audit log export: direct Prisma query → CSV formatting
- Asset inventory: direct Prisma query → CSV
- x402 billing summary: aggregated usage records → CSV

### 4.3 x402 Metering for Exports
- Connect export API routes to `checkX402Access()`
- Deploy Apostle Chain USDF address for payment receipts
- Validate payment proof before serving PDF

---

## Phase 5: Cross-chain (6–8 weeks)

### 5.1 XRPL / Stellar (Apostle Chain Bridge — Active)
- Use existing Apostle Chain XRPL/Stellar bridge
- Register XRPL and Stellar wallet addresses in vault
- Pull public balance via XRPL/Stellar public APIs
- Include in estate summary reports

### 5.2 Ethereum / Base / Polygon
- Build Ethereum JSON-RPC relayer (public node or Alchemy/Infura)
- Pull ERC-20 + ETH balances for registered addresses
- Pull ENS name for human-readable executor instructions

### 5.3 Solana
- Build Solana RPC adapter (public or Helius)
- Pull SOL + SPL token balances
- Pull NFT inventory via Metaplex

### 5.4 Bitcoin
- Address registry only
- Pull UTXO balance via public block explorer API (mempool.space or Blockstream)

---

## Phase 6: Legacy Layer 0 Sovereign Deployment (12–16 weeks)

For institutional or sovereign deployment only. See:
- `LAYER0_OVERVIEW.md`
- `LAYER0_RUST_ARCHITECTURE.md`
- `VALIDATOR_NODE_RUNBOOK.md`

---

## Testing Requirements

| Phase | Coverage Target |
|-------|----------------|
| Unit tests | 80% of lib/ functions |
| Integration tests | All API routes (with test DB) |
| E2E tests (Playwright) | Full vault creation → release flow |
| Security tests | OWASP Top 10 review, input validation, auth bypass |

## Security Checklist (before production)

- [ ] All API routes validate authentication
- [ ] Vault access checks: user owns vault or has role-scoped grant
- [ ] Input validation on all mutation endpoints
- [ ] Rate limiting on release-critical routes
- [ ] Secrets in environment variables only — no hardcoded keys
- [ ] IPFS uploads: verify CID matches content hash
- [ ] AES-256-GCM keys: derived per-vault, never stored in database
- [ ] Audit log entries: write-only from application, no delete route
- [ ] Chain anchor verification: independent of application database

## See Also

- `SYSTEM_OVERVIEW.md`
- `OPERATOR_RUNBOOK.md`
- `LEGAL_AND_SECURITY_GUARDRAILS.md`
- `LAYER0_OVERVIEW.md`
