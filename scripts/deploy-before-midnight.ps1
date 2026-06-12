# Deploy Troptions Unity Legacy Vault + BlockchainFraud.org before midnight
# Anchor: 5655 Peachtree Parkway, Norcross, GA 30092
# Full SEO/GEO/AI + X402 + Stripe + Top5 + Recovery + ZK

Write-Host "=== Troptions Unity Legacy Vault + BlockchainFraud.org Deploy (SEO/GEO/Payments/Top5) ===" -ForegroundColor Green
Write-Host "Both anchored at 5655 Peachtree Parkway, Norcross, GA 30092. FTH Trading / Troptions."
Write-Host "Vault: $29.95 Family / $49.95 Estate + ZK 5-Proof + X402/Stripe"
Write-Host "Fraud: X402 + Stripe, top5 GitHub, recovery detector, batch engine"

# Vault deploy (legacy-vault-protocol)
Write-Host "`n1. Troptions Unity Legacy Vault deploy..."
cd legacy-vault-protocol
pnpm install --frozen-lockfile
pnpm build
# wrangler pages deploy .vercel/output/static --project-name troptions-unity-vault # or CF Pages
Write-Host "Vault built. Deploy to CF Pages / Vercel / Netlify. Update troptionsunity.com DNS."

# Fraud deploy
Write-Host "`n2. BlockchainFraud.org deploy..."
cd ../blockchainfraud-platform
# Ensure toml INVESTIGATIONS_FREE=false, secrets set
pwsh -File scripts/deploy.ps1
Write-Host "Fraud deployed with payments, top5, recovery."

Write-Host "`n3. Post-deploy SECURITY (Military Hardening):"
Write-Host "- Run pnpm test:agents (all agents PASS/WARN, review health-report.json)"
Write-Host "- Test: /api/health/secure (with x-user-id header), replay attacks (should fail idempotency/timing)"
Write-Host "- Verify no Math.random in core (crypto.randomUUID), constantTimeEqual on sigs"
Write-Host "- Errors: {error, errorId} only — no stacks"
Write-Host "- CF: Access policies, Super Bot Fight, Full Strict SSL + HSTS Preload"
Write-Host "- Schema + address 5655 Peachtree Parkway, Norcross, GA 30092 in all GA pages"
Write-Host "- Test fraud side too per its SECURITY.md"

Write-Host "`nReady before midnight. Both #1 in Georgia for legacy + fraud in Great Reset. FTH owns it."
Write-Host "Cross-link: Vault <-> Fraud everywhere. Sovereign Zero Trust."