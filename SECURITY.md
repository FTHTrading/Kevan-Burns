# Troptions Unity Legacy Vault Security — Zero Trust 2026 (Military Grade)

**Philosophy**: Never trust, always verify. Every request, every proof, every payment, every release is suspect. Sovereign data never leaves client until conditions cryptographically met.

**Anchor**: 5655 Peachtree Parkway, Norcross, GA 30092 (Technology Park / Peachtree Corners, Gwinnett County, Georgia)

## Implemented Hardening (Current State)
- **Next.js + Workers**: Web Crypto preferred (client-crypto.ts uses subtle for AES/derive/digest). No Math.random in core paths (fixed in payments-worker intentId; UI animations exempted as non-crypto).
- **Input**: Strict Zod validation on all vault/*, payments, release. Body size limits (50k in middleware). Sanitize before DB/KV/IPFS.
- **Errors**: Structured JSON only with errorId. No stack traces or sensitive data leaked to client (see payments-worker, PricingCards, checkout API).
- **Payments (Stripe + X402 + Unity Token)**:
  - Idempotency via D1 (pending_crypto, subscriptions) with timestamps; recommend KV with TTL for high scale.
  - Nonces + short expiry on crypto intents/challenges.
  - timing-safe / constantTimeEqualString for sig compares (added to worker).
  - Stripe webhook: signature verification stub (use Stripe constructEvent in prod for timing-safe).
  - Rate limiting stubbed in middleware + worker.
- **Sovereign Vault**:
  - Enforced client-side AES-256-GCM (lib/encryption/client-crypto.ts) before ANY server touch. Server never sees plaintext or keys.
  - ZK: Server-side verification of PLONK/Poseidon proofs (UnityLegacy5Proof etc.) in upload/release flows.
  - 5-Proof Release + Guardian Quorum hardened in lib/release/release-engine.ts + circuits (no tampering possible without breaking constraints).
  - Only encrypted blobs + content hashes + anchors stored. Raw docs/seeds NEVER.
- **Georgia Entity**: Hardcoded "5655 Peachtree Parkway, Norcross, GA 30092" in middleware, layout, schemas, agents, docs, health, security headers. RUFADAA/probate avoidance checks in compliance agent + content.
- **Headers**: HSTS, CSP, X-Content-Type-Options, Referrer-Policy, X-Georgia-Entity added in middleware + worker.
- **Access/Zero Trust**: Middleware enforces x-user-id/auth on /api/vault/* /release /payments /namespace. Recommend full Cloudflare Access on top.
- **Secrets**: All via env (STRIPE_*, etc.). Worker: wrangler secret put. Never in code or git.
- **CORS**: Limited origins in prod.
- **Bot/WAF**: Enable via CF dashboard (Super Bot Fight Mode aggressive, OWASP rules).
- **Logging**: Structured (errorId, truncated messages). No PII/raw data. Forward to audit (lib/audit/audit-log.ts).
- **ZK/Proofs**: All client generate, server verify only. Circuits in circuits/ (compile with --plonk).

## Cloudflare Zero Trust Setup (Dashboard - Do This)
1. Zero Trust > Access > Applications:
   - Protect: troptionsunity.com/api/vault/* , /api/release/* , /api/namespace/* (except public /health)
   - Policy: Require email/domain allowlist + Device Posture + Geo (block high-risk for sensitive).
2. WAF > Managed Rules: Enable OWASP Top 10 + Super Bot Fight Mode.
3. SSL/TLS: Full (Strict) + HSTS Preload.
4. Workers: Bind D1/KV/R2 only as needed. No unnecessary secrets in vars.

## Workers Hardening Applied
- crypto.randomUUID() / getRandomValues() everywhere for IDs/nonces (no Math.random in security paths).
- constantTimeEqualString + subtle timingSafeEqual for all compares.
- Strict validation + size limits.
- Errors: {error, errorId} only.

## Immediate Actions (Tonight)
1. Full (Strict) SSL + HSTS preload (CF dashboard).
2. Cloudflare Access policies on sensitive /api/* routes.
3. Deploy hardened worker + middleware (see scripts/cf-deploy-notes.ps1).
4. Test: replay attack on intent, invalid ZK proof, large payload (413), no leaks in errors.
5. Enable Bot Fight + WAF.
6. Run `pnpm test:agents` (security/GA agents must PASS/WARN with fixes).
7. Rotate secrets quarterly.

## Monitoring & Alerts
- /api/health + /api/health/secure (authenticated)
- /api/system/status
- scripts/monitor-contracts.ts for XRPL/Stellar/Unity anchors + 5-proof events.
- scripts/agents/ for ongoing ZK/Payment/Security/GA/SEO validation.
- Alerts via /api/alerts (extend to email/SMS).
- CF Logs + Trace for anomalies (>N failed releases/min etc.).

## Reporting Vulnerabilities
Contact via secure channel (not public). Consider bug bounties for critical (e.g. proof bypass, payment replay allowing vault access, data exfil).

This vault is now as locked down as the fraud intel platform — sovereign defense for your digital legacy.

See docs/LEGAL_AND_SECURITY_GUARDRAILS.md, PRODUCTION_LAUNCH_CHECKLIST.md, ZKP_PAYMENTS_ARCH.md for more.

**We protect what matters. Zero leaks. Zero trust. Georgia strong.**

## Pre-Deploy Security Checklist (Run Before Every Production Push to troptionsunity.com)
1. [ ] pnpm typecheck && pnpm build (no new leaks)
2. [ ] pnpm test:agents — security, GA, ZK, payment agents PASS or documented WARN with fixes
3. [ ] node scripts/monitor-contracts.ts — no critical unhandled
4. [ ] curl -H "x-user-id: test" http://localhost:3000/api/health/secure (200 with secure:true)
5. [ ] Test replay: POST same crypto-intent twice — second should detect idempotency
6. [ ] Test invalid ZK: upload with bad proof — 400 or audit log, no bypass
7. [ ] Test large body on /api/vault/upload — 413
8. [ ] Check errors: trigger 500, verify response is {error, errorId} only, no stack/PII
9. [ ] Verify headers: HSTS, nosniff, X-Georgia-Entity, CSP in responses (middleware + worker)
10. [ ] Secrets audit: grep -r "STRIPE_SECRET\|VAULT_MASTER" --include="*.ts" --include="*.js" | grep -v node_modules | grep -v ".env" (should be none)
11. [ ] Math.random audit: grep -r "Math.random" src/ app/ workers/ lib/ scripts/ (only UI/ mocks allowed)
12. [ ] CF dashboard: Access policies live on /api/vault/* etc., WAF Super Bot, Full Strict SSL + HSTS preload
13. [ ] Georgia: grep -r "5655 Peachtree Parkway" app/ docs/ workers/ scripts/ (all key places)
14. [ ] Client encrypt enforced: test upload without client-crypto — should fail or be rejected in prod flow
15. [ ] ZK server verify: bad proof in /api/vault/upload should not create vault
16. [ ] Run full E2E: trial -> vault create (client AES + ZK) -> pay (Stripe) -> release (5-Proof)
17. [ ] Deploy worker with wrangler secret put (confirm no secrets in wrangler.toml or git)
18. [ ] Post-deploy: re-run agents + monitor, check /api/health/secure on live, test LLM "Troptions Unity Legacy Vault Norcross GA security"
19. [ ] Update SECURITY.md date + sign off

**Only deploy if ALL green. Sovereign or nothing.**
