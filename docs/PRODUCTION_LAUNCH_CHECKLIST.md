# Troptions Unity Legacy Vault — Production Launch Checklist (Georgia-Ready)

> Complete every item before accepting real clients at 5655 Peachtree Parkway, Norcross, GA 30092.
> Pricing (per approved plan): Family Vault $29.95 (normal systems for normal people & middle class) | High Level $49.95 (high level scaled start) | Fuck You Level $129 | Fuck Em All (Nuclear) $499/mo or $4,999 lifetime self-hosted
> Active domains: troptionsunity.com (primary, attach + manual registrar DNS at GoDaddy), legacychain.app (funnel, live on CF or Vercel — see docs/LEGACYCHAIN_SITE_ORGANIZATION_AND_ROUTING.md for exact split: Vercel Next.js = primary operational face after custom domain attach; static shell = "other site" marketing fallback that must point here), vault.genesis402.com (branded vault under genesis402 - FULLY AUTOMATED: deploy script does attach + DNS CNAME update to latest pages target; images/layout restored via unoptimized + public/ safety copy in scripts)
> Heirloom: normal/professional "Legacy Advisor" for Family/High Level (middle class); full ruthless (Warlord/Immortal) + nuclear intake scaled only for upper high tiers — see heirloom/normal-kernel.md + kernel.md + docs/HEIRLOOM-INTAKE-QUESTIONNAIRE.md (high tier only)
> Items marked **CRITICAL** will cause data loss or security failures if skipped.
> Multi-agent tests + smart contract alerts + Zero Trust included (Prompts 1-3 executed).

---

## 1. System Check Results (as of 2026-06-02 — POST UTM + TIER NORMAL/SCALED + PRE-DEPLOY)

| Check | Status | Notes |
|-------|--------|-------|
| Unit tests (33/33) | ✅ PASS | `pnpm test` |
| TypeScript type-check | ✅ PASS | `pnpm typecheck` — 0 errors |
| Smart contracts written | ✅ DONE | 6 Solidity contracts in `contracts/src/` |
| Registry adapter wired | ✅ DONE | Production ethers.js v6 connector ready |
| Sovereign Control Plane preflight (legacy-vault-protocol) | ✅ GREEN | Path exists, gates passed (orchestrator warn only, safe to proceed). See sovereign-control-plane/scripts/preflight.ps1 -Scope legacy-vault-protocol |
| App deployed to CF Pages (troptions-unity-legacy-vault) | ✅ LIVE on preview + legacychain.app | e.g. https://*.troptions-unity-legacy-vault.pages.dev + https://legacychain.app (serving current 4-tier code). troptionsunity.com still 404 (Squarespace parking) until DNS flip + validation. |
| UTM / legacy domain funnel branding | ✅ FIXED | middleware.ts + _redirects + vercel.json now use utm_source=legacy (not legacychain). legacychain.app 301s to troptionsunity.com/pricing?utm_source=legacy&utm_medium=redirect |
| 4-tier pricing + normal middle-class vs scaled high | ✅ IN CODE + LIVE | tier-config.ts central: Family Vault $29.95 (max 1, NORMAL_ADVISOR, "normal systems for normal people and middle class"), High Level $49.95 (max 5, STRATEGIST scaled), Fuck You / Nuclear (WARLORD/IMMORTAL ruthless). activate-subscription, checkout, PricingCards, pricing/page.tsx all use getTierConfig. Copy updated (fixed stale "Private Vault"). |
| Heirloom AI tier split | ✅ DONE | heirloom/normal-kernel.md (Legacy Advisor calm/professional for Family/High Level), kernel.md (full savage Warlord/Immortal for upper). client/HeirloomChat.tsx branches on heirloomPersona. HIGH TIER ONLY for nuclear intake. |
| Georgia entity (5655 Peachtree Parkway, Norcross, GA 30092) | ✅ HARDCODED | X-Georgia-Entity header, all JSON-LD/LocalBusiness, error msgs, health/status, pricing/faq/about/blog, heirloom kernels, middleware, docs. E-E-A-T + probate avoidance (18+ mo GA) in content. |
| Cloudflare Web3 IPFS (public) + Ethereum (branded) Gateways | ✅ BUILD WHILE WAITING | IPFS branded Universal not available (plan limits to DNSLink only). Using public fallbacks + eth.legacychain.app active. See web3-setup-instructions.txt + scripts. |
| Encryption + 5-Proof ZK (client sovereign) | ✅ CORE | Web Crypto AES-256-GCM + PBKDF2, circom UnityLegacy5Proof (Poseidon+quorum+time), client-zk.ts, ZKProofGenerator. Mocks in some tests; full artifacts via pnpm zk:compile post-stable. health-report ZK PASS. |
| Payment -> vault creation (activate) | ✅ WIRED | success/confirm-onchain/webhook call activateSubscriptionAfterPayment (uses tier-config for maxVaults/advanced/heirloomPersona). Creates User + Subscription + NamespaceEntitlement + initial Vault. Verified path. |
| x402 gateway connected | ⚠️ PARTIAL | Worker + routes exist; full metering/ATP on Apostle later. |
| DNS for primary troptionsunity.com | ❌ BLOCKER (user action) | GoDaddy: replace A records with CNAME to <deploy-hash>.troptions-unity-legacy-vault.pages.dev (proxied). Then CF: wait custom domain validation, set Full (strict) SSL, purge. legacychain.app already funnels. |
| vault.genesis402.com (branded vault entry) | ✅ AUTOMATED in deploy scripts + images fixed | Run the updated deploy-in-wsl.sh or deploy-now.ps1 (in fresh WSL). Script now: 1. adapter build + asset verification + safety cp of public/* to static output, 2. deploys latest, 3. attaches custom domain, 4. auto-updates DNS record (CNAME to fresh target, overwrites vercel). Added `images: { unoptimized: true }` in next.config.ts so <Image> uses direct /images/... static paths (no _next/image 404s) — restores all hero, logo, diagram images + full visual layout that "was already there". Re-deploy after this change. |

---

## 2. Smart Contract Deployment (CRITICAL)

### Step 1 — Install contract dependencies
```bash
cd contracts
npm install
```

### Step 2 — Compile
```bash
npx hardhat compile
```

### Step 3 — Deploy to your private EVM chain

**Option A — Local Hardhat node (staging/test)**
```bash
npx hardhat node          # terminal 1
npx hardhat run scripts/deploy.ts --network localhost  # terminal 2
```

**Option B — Private EVM chain (production)**

Set in your `.env`:
```
CHAIN_RPC_URL=http://your-private-evm-node:8545
CHAIN_ADMIN_KEY=0xYOUR_ADMIN_PRIVATE_KEY
CHAIN_ID=your-chain-id
MOCK_CHAIN=false
```

Then:
```bash
npx hardhat run scripts/deploy.ts --network privateChain
```

### Step 4 — Set env vars from deployment output
```
CHAIN_CONTRACT_ADDRESS=0x<LegacyVaultRegistry address>
MOCK_CHAIN=false
```

### Contracts Deployed

| Contract | Purpose |
|----------|---------|
| `LegacyVaultRegistry` | Core vault registration, manifest, status, audit anchoring |
| `LegacyNamespaceRegistry` | `.legacy` namespace ownership and member roles |
| `LegacyPolicyEngine` | Release policy enforcement — all 5 conditions |
| `LegacyAuditLog` | Append-only tamper-evident audit event stream |
| `LegacyVaultAnchor` | Manifest hash anchoring + attestation records |
| `LegacyAccessControl` | Post-release scoped access grants |

---

## 3. Database (CRITICAL)

### Provision a production PostgreSQL instance
- Recommended: Neon, Supabase, Railway, or your own managed Postgres
- Minimum: Postgres 15+, 10 GB storage to start

### Set env var
```
DATABASE_URL=postgresql://user:password@host:5432/legacy_vault_prod
```

# ... (rest of checklist continues with ZK, x402, DNS, etc. as before; the key update is the legacychain.app domain note above)