# scripts/cf-deploy-notes.ps1
# Troptions Unity Legacy Vault — Cloudflare Deploy Helper (safe, no secrets in file)
#
# 1. Get your tokens from the secure "cloudflare new api.txt" (OneDrive or vault). Never commit them.
# 2. wrangler login (or use the tokens in dashboard for Pages + Workers).
# 3. For the payments worker (Stripe + on-chain):
#    cd workers/payments-worker
#    wrangler d1 create troptions-unity-subs   # copy the id
#    # edit wrangler.toml database_id
#    wrangler secret put STRIPE_SECRET_KEY     # paste from your Stripe dashboard (use live for prod)
#    wrangler secret put STRIPE_WEBHOOK_SECRET
#    # wrangler secret put UNITY_TREASURY (if overriding)
#    wrangler deploy

# 4. Main app env for Stripe on home/pricing (CRITICAL for this task):
#    In CF Pages dashboard (or wrangler pages), set:
#      STRIPE_SECRET_KEY=sk_live_...
#      PAYMENTS_WORKER_URL=https://your-worker.your-account.workers.dev
#      UNITY_TREASURY=0x...
#    The home page pricing cards and /pricing now trigger real Stripe Checkout via /api/payments/checkout.
#    Crypto option also supported.

# 5. For main site (troptionsunity.com) + full SEO/GEO:
#    - We have created the Pages project "troptions-unity-legacy-vault"
#    - Added custom domains via API: legacychain.app, www.legacychain.app (active). DNS verified: proxied CNAMEs to troptions-unity-legacy-vault.pages.dev + SPF/DMARC/MX set. troptionsunity.com zone not visible to current tokens — handle its DNS at registrar/CF separately.
#    - Current deployment on project is bootstrap placeholder (deploy-static/_redirects funnels legacychain -> troptionsunity.com/pricing). This is why site "not the vault yet".
#    - To get the FULL system up (real app + the critical "pay -> verify -> activate sub/entitlement/maxVaults + create initial vault" flow):
#      Run in terminal (user machine, WSL recommended):
#        cd C:\Users\Kevan\legacy-vault-protocol
#        Remove-Item -Recurse -Force .vercel/output -ErrorAction SilentlyContinue
#        npx @cloudflare/next-on-pages
#        npx wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main --commit-dirty=true
#      After success: legacychain.app serves the real vault (Pricing live, /api/payments/success does the vault provisioning, ZK, all GA content).
#    - For troptionsunity.com as primary: set its DNS CNAME @/www -> troptions-unity-legacy-vault.pages.dev (proxied), then Pages dashboard > Custom domains > add troptionsunity.com. Optionally add CF Redirect Rule in legacychain zone to send to troptionsunity.com.
#    - Set env vars in Pages project (Settings > Environment variables): STRIPE_SECRET_KEY, PAYMENTS_WORKER_URL, UNITY_TREASURY=0x7d9a65d06dcc435a52D5880C6310Bd6E96c156DB
#    - After deploy: Submit sitemap, claim GBP at 5655 Peachtree Parkway, Norcross, GA 30092, run pnpm test:agents, set zone SSL Full(strict) + purge, test pay->vault flow.
#
# 6. Artifacts for ZK:
#    - After circom + snarkjs setup, upload wasm/zkey to R2 or include in Pages public/zk
#    - Serve from edge for fast browser load.
#
# 6. Post-deploy domination checklist:
#    - Claim Google Business Profile at exact address 5655 Peachtree Parkway, Norcross, GA 30092
#    - Add services: Crypto Estate Planning, Digital Legacy Vault, Blockchain Will
#    - Post weekly (ZK proof demos, Georgia probate tips)
#    - Run scripts/seo-geo-monitor.ps1
#    - Test LLM queries: "best crypto estate planning Georgia", "Norcross GA digital will"
#    - Submit sitemap to GSC + request indexing for /norcross-ga, /pricing, /blog
#    - Monitor AI citations weekly
#
# All changes in this repo went through sovereign preflight for legacy-vault-protocol.
# Data stays zero-knowledge. Pricing locked at $29.95 / $49.95.

# 7. SECURITY HARDENING CHECKLIST (Military Grade - match blockchainfraud.org)
# - Run pnpm test:agents (security + GA agents must not FAIL)
# - Deploy with wrangler secret put for ALL secrets (STRIPE_SECRET_KEY, WEBHOOK_SECRET, etc.)
# - Verify no Math.random in src/ (use crypto.randomUUID/getRandomValues)
# - Test constantTimeEqual on sigs/tokens (replay should fail)
# - Errors return {error, errorId} only — no stacks/PII
# - Body limits + Zod validation on all protected routes
# - Middleware Zero Trust + security headers active
# - /api/health/secure requires auth
# - Cloudflare Access + WAF + Full Strict SSL + HSTS Preload (dashboard)
# - Georgia address 5655 Peachtree Parkway, Norcross, GA 30092 hardcoded in schemas/headers/comments
# - Client AES-256 enforced before upload; server ZK verify only
# - Post deploy: scripts/monitor-contracts.ts , curl /api/health/secure (with header)

Write-Host "Troptions Unity Legacy Vault — Full industry domination deploy notes. Use secure tokens only." -ForegroundColor Green

Write-Host "Troptions Unity Legacy Vault — CF deploy notes. Use secrets only via wrangler/dashboard. See docs/grok-builder-prompts-troptions-unity.md" -ForegroundColor Green

# Web3 Gateways (IPFS + Ethereum) — do this while waiting on the full @cloudflare/next-on-pages adapter
Write-Host "`n=== Web3 (build this NOW while waiting) ===" -ForegroundColor Cyan
Write-Host "Run: pwsh -File scripts/setup-web3-gateways.ps1"
Write-Host "Creates (via dashboard or API):"
Write-Host "  eth.legacychain.app   (Ethereum)           — JSON-RPC without nodes (branded active)"
Write-Host "  IPFS: branded DNSLink https://ipfs.legacychain.app (Universal Path not available on plan)"
Write-Host "  IPFS Gateway Premium purchased: 100GB included + $0.10/GB"
Write-Host "Then set in Pages env: CLOUDFLARE_IPFS_GATEWAY=https://ipfs.legacychain.app ; ETHEREUM_GATEWAY=https://eth.legacychain.app"
Write-Host "Adapter code in lib/ipfs/ipfs-adapter.ts already wired to prefer it for reads."
Write-Host "All content remains client AES-256 only. CF sees only CID + ciphertext."
Write-Host "DNS records auto-created by CF on gateway creation." -ForegroundColor Green



# Latest: Deployed .next (after cache clean) successfully to project. Site live on legacychain.app with built app. Custom domains active. For optimal API support, run adapter build on WSL or powerful machine and redeploy the .vercel output.





