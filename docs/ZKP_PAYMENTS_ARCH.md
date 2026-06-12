# Troptions Unity Legacy Vault — ZKP + Hybrid Payments Architecture

**Status (June 2026):** Core implemented + updated. Client-crypto (zero-knowledge) + Poseidon PLONK circuits (UnityLegacy5Proof primary) + payments-worker (Stripe + Unity on-chain) + Prisma + API + ZKProofGenerator component live. Pricing: Family Vault $29.95 (normal middle-class) / High Level Vault $49.95 (scaled) + upper ruthless tiers. Full artifacts + Unity anchoring next. Preflight green. DNS automation for vault.genesis402.com added.

## Zero-Knowledge Layer (Crown Jewel)

### Client-Side Encryption (lib/encryption/client-crypto.ts)
- Web Crypto API (AES-256-GCM)
- Passphrase or raw 256-bit key derivation (PBKDF2)
- Never sends passphrase, derived key, or plaintext to any server
- Returns: ciphertext + IV + SHA-256(contentHash) + (optional) ZK proof over the hash

### Circuits (circuits/)
- `UnityLegacy5Proof.circom` (PRIMARY — use this): Poseidon doc hash (8 chunks + salt) + guardian quorum (5 guardians, configurable minApprovals) + dead man's time check. PLONK-ready. Compile with `--plonk`.
- `DocumentHashProof.circom`, `GuardianQuorum.circom`, `FiveProofRelease.circom`: Supporting / legacy templates.
- Build: `pnpm zk:compile` (requires circom + circomlib). Then `snarkjs` setup (or Perpetual Powers of Tau). Artifacts → zk/artifacts or R2.
- Frontend: Use `app/components/ZKProofGenerator.tsx` + `zk/client-zk.ts:proveUnityLegacy5Proof()` after client-crypto encrypt.

### Browser Proof Generation (zk/client-zk.ts)
- `proveDocumentHash`, `proveGuardianQuorum`, `proveFiveProofRelease`
- Mocks via `NEXT_PUBLIC_ZK_MOCK=true` for immediate UI/dev (insecure — disable in prod)
- Real: dynamic import snarkjs, load .wasm + .zkey from /zk/artifacts or R2, `groth16.fullProve`
- Verify: server-side (fast, snarkjs) or light on-chain verifier (Unity Token contract or EVM).

Integration points:
- Upload: POST /api/vault/upload accepts `zkProof` + `contentHashForZkp`
- Release: attach FiveProofRelease to ReleaseClaim for on-chain verifiability
- Payments: future ZK proof-of-subscription (prove active tier without leaking user id to public chain)

## Hybrid Payments (Prompt 2)

### Pricing (exact per spec)
- Family: $29.95/mo or $299/yr
- Estate (MOST POPULAR): $49.95/mo or $499/yr
- Lifetime Legacy Lock: $1,299 one-time
- Self-Hosted Sovereign: $4,999 one-time + support
- 14-day trial: no card required

### Implementation
- **Cloudflare Worker** (workers/payments-worker/):
  - wrangler.toml + D1 (SUBS_DB) for edge sub state
  - `/checkout`: Stripe Checkout Session (fiat) or returns crypto intent
  - `/webhook`: Stripe sig verify → activate sub in D1 + callback to main app
  - `/crypto-intent`: returns payTo (Unity treasury), amount, memo (namespace:tier)
  - `/confirm-onchain`: user submits txHash → verify (stub) → activate
  - Cron: on-chain reconciliation sweep
- **Main App Fallback** (`/api/payments/checkout`): direct Stripe for local dev, proxies to worker in prod.
- **On-chain rails**: Leverages existing x402 (USDF/USDC on Apostle 7332) + new Unity Token path. Troptions Xchange for auto-swap if user pays in BTC/ other.
- **Namespace gating**: Sub tier controls maxVaults (1 vs 5), advancedFeatures flag. Enforced at vault create / Estate AI / white-glove flows.

### Treasury Settlement
- Fiat: Stripe → your Stripe balance → manual or automated to Troptions treasury (or direct to on-chain via ramp).
- Crypto: Direct to UNITY_TREASURY_ADDRESS. Instant, low fee, auditable on-chain.

### 14-day Trial + Cancel
- Trial creates D1 row with trial_ends_at. After expiry, features limited until paid sub.
- Cancel anytime: data remains yours (encrypted blobs + your keys). We never had the plaintext.

## Deployment (Prompt 1 + 8)

Primary: troptionsunity.com on Cloudflare Pages + Workers.
- Redirects: legacychain.app → troptionsunity.com, genesis402.com/vault → troptionsunity.com
- Wrangler for payments-worker + future proof-verifier worker.
- D1 for subs, R2 for encrypted blobs (optional, alongside or instead of private IPFS for pure CF stack).
- KV for sessions / rate limits.
- Zero Trust + SOC2 placeholders already in docs.

See also: docs/PRODUCTION_LAUNCH_CHECKLIST.md, docs/X402_INTEGRATION.md

## Next (high confidence)
1. Real circom compile + ptau setup + wire zk verify into upload + release flows.
2. Unity Token specific adapter (extend lib/blockchain or use apostle-chain 7332).
3. Full client-crypto adoption in vault/documents upload UI (currently supports CID path — now prefer browser encrypt + proof).
4. Onboard wizard: insert plan selection + hybrid pay step before namespace claim.
5. Self-hosted bundle docs for the $4999 tier (includes the Rust Layer0 + this Next app + local Kubo + optional local Worker).
6. Re-run sovereign preflight + inventory-sync after changes.

This is the empire that survives the reset. 20 minutes to set up. Lifetime of cryptographic family armor.
