# Ready-to-Paste Grok Builder Prompts — Troptions Unity Legacy Vault (Updated Pricing + PLONK/Poseidon)

**NEW: The Three SEO/GEO/AI + X402+Stripe + Deployment Prompts (executed for both Troptions Unity + BlockchainFraud.org at 5655 Peachtree Parkway, Norcross, GA 30092)**

See blockchainfraud-platform/docs/the-three-grok-builder-prompts.md for the exact prompts + full generated outputs (20 clusters, pages, schemas with address, technical arch, full deployment checklist, X402/Stripe updates, top5, recovery, batch mock run producing 90+ table, deploy scripts).

Cross: Vault now references BlockchainFraud.org for pre-vault scam detection (top5 GitHub + Grok batch). Fraud references Vault for post-detection legacy protection ($29.95/$49.95 at same GA address).

All anchored, SEO/GEO/AI ready, payments live (free=false for fraud), ZK in vault. Deploy before midnight.

Use these when you want to extend or regenerate parts. We have already implemented the core in the codebase (circuits/UnityLegacy5Proof.circom, zk/, payments-worker, ZKProofGenerator.tsx, pricing synced to $29.95/$49.95, etc.). Preflight always green.

---

## Prompt 1: Full PLONK Circuit Suite + Integration (Primary)

```
You are an expert zero-knowledge engineer. Build a complete PLONK-based circuit suite in Circom for Troptions Unity Legacy Vault with pricing tiers $29.95 Family and $49.95 Estate.

Include:
- Document Integrity Proof using Poseidon hash (8+ chunks + salt) — primary UnityLegacy5Proof
- Guardian Quorum Threshold (configurable M-of-N, default 3-of-5)
- Full 5-Proof Release Logic (time + quorum + hash + legal flag + on-chain anchor)
- Dead Man's Switch conditions

Output:
- All .circom files with templates (focus on UnityLegacy5Proof.circom)
- Compilation commands for PLONK (`--plonk`)
- snarkjs browser integration code (Next.js component + hooks)
- Cloudflare Worker verification function (fast verify for edge)

Make it production-ready, low constraints, fully zero-knowledge. Use Poseidon everywhere possible. Support mock mode for dev (NEXT_PUBLIC_ZK_MOCK).
```

---

## Prompt 2: Halo2 / Advanced PLONK Version (Rust + WASM)

```
Build a Halo2 (PLONKish) circuit in Rust for the Troptions Unity Legacy Vault supporting $29.95 and $49.95 monthly plans + lifetime $1,299.

Requirements:
- Prove guardian quorum threshold (3-of-5)
- Document Poseidon hash integrity (or equivalent)
- Time-lock / dead man's switch
- Wallet registry ownership proof (optional)
- Subscription tier proof (Family vs Estate limits via public signals)

Provide:
- Full Rust circuit code using halo2_proofs or halo2_proofs + poseidon
- Instructions for WASM compilation (wasm-pack or trunk)
- JavaScript/TS wrapper for Next.js frontend (load wasm, generate proof)
- Verification logic for Cloudflare Workers (or use snarkjs verify if compatible)

Optimize for browser performance on family legacy vault use case. Include notes on no-trusted-setup or universal setup.
```

---

## Prompt 3: Full Frontend + Worker Integration + Deploy (troptionsunity.com)

```
Integrate (or extend) the PLONK/Poseidon circuits for Troptions Unity Legacy Vault into a full Next.js 15 + Cloudflare Pages/Workers setup.

Pricing must be exactly:
- Family: $29.95/month (or $299/year)
- Estate: $49.95/month (or $499/year) — MOST POPULAR
- Lifetime Legacy Lock: $1,299 one-time
- Self-hosted: $4,999 one-time

Features to implement / ensure:
- Client-side proof generation (AES-256 via Web Crypto + PLONK Poseidon 5-proof) on vault creation / document upload / release request
- Stripe Checkout + Unity Token / USDC / Troptions Pay / x402 hybrid payment system (see existing payments-worker)
- Zero-knowledge document upload (ciphertext + proof only to server)
- Dashboard showing anchored proofs + subscription status only (no raw data)
- Full 5-Proof Release UI with guardian management + ZK proof attachment
- 14-day trial (no card)
- Namespace support (.legacy / .troptions)

Domain: Primary troptionsunity.com on Cloudflare (redirect legacychain.app); vault.genesis402.com serves full branded vault app (Genesis402 ecosystem entry); genesis402.com/vault path funnels. Attach all as custom domains on troptions-unity-legacy-vault CF Pages project.

Output:
- Complete current folder structure diffs or key files (especially updates to app/components, app/api, workers/)
- wrangler.toml updates, D1 schema for subs
- Deployment steps (wrangler deploy for worker, CF Pages for frontend, secret injection for CF tokens from api.txt)
- How to compile circuits and serve artifacts (R2 recommended)

Use best 2026 practices for security, zero-knowledge, and recurring revenue.
```

---

**Usage**: Paste into Grok (or any builder) when you want fresh variants or expansions. Then drop the output back here for integration/refinement against the existing sovereign codebase (legacy-vault-protocol).

Current primary circuit to extend: circuits/UnityLegacy5Proof.circom (already matches the spec above).

For CF deploy: Use the tokens in your secure "cloudflare new api.txt" — set via dashboard or `wrangler secret put`, never in git.
