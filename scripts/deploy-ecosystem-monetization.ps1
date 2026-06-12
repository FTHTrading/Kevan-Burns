# Deploy FTH ecosystem monetization + x402 funnel across Cloudflare Pages
# Run from PowerShell: .\scripts\deploy-ecosystem-monetization.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== FTH Ecosystem Monetization Deploy ===" -ForegroundColor Cyan

# 1. genesis402.com (36K traffic) — x402 hub + ecosystem bar
Write-Host "`n[1/5] Deploying genesis402..." -ForegroundColor Yellow
Push-Location "C:\Users\Kevan\UnyKorn-X402-aws\packages\fth-x402-site"
npx wrangler pages deploy public --project-name genesis402 --commit-dirty=true
Pop-Location

# 2. atlas-unykorn / unykorn.org (46K traffic)
Write-Host "`n[2/5] Deploying atlas-unykorn..." -ForegroundColor Yellow
Push-Location "C:\Users\Kevan\atlas-unykorn"
npx wrangler pages deploy . --project-name atlas-unykorn --commit-dirty=true
Pop-Location

# 3. legacychain.app redirect funnel
Write-Host "`n[3/5] Deploying legacychain redirect..." -ForegroundColor Yellow
Push-Location "C:\Users\Kevan\legacy-vault-protocol\deploy-static"
npx wrangler pages deploy . --project-name legacychain-redirect --commit-dirty=true
Pop-Location

# 4. blockchainfraud.org worker + frontend
Write-Host "`n[4/5] Deploying blockchainfraud-worker..." -ForegroundColor Yellow
Push-Location "C:\Users\Kevan\blockchainfraud-platform"
npm run build 2>$null
npx wrangler deploy
Pop-Location

# 5. xxxiii.io (if project exists)
Write-Host "`n[5/5] Deploying fuckit-xxxiii / xxxiii.io..." -ForegroundColor Yellow
$xxxiii = "C:\Users\Kevan\OneDrive - FTH Trading\FTH-Dev\projects\xxxiii-io\public"
if (Test-Path $xxxiii) {
  Push-Location $xxxiii
  npx wrangler pages deploy . --project-name fuckit-xxxiii --commit-dirty=true
  Pop-Location
} else {
  Write-Host "  Skipped — xxxiii public folder not found" -ForegroundColor DarkYellow
}

Write-Host "`n=== Done ===" -ForegroundColor Green
Write-Host "Verify:"
Write-Host "  https://genesis402.com/ecosystem-bar.js"
Write-Host "  https://genesis402.com/vault  -> troptionsunity.com/pricing (or vault.genesis402.com for full branded vault app)"
Write-Host "  https://vault.genesis402.com (serves full Legacy Vault app - attach to troptions-unity-legacy-vault CF project + update DNS from vercel)"
Write-Host "  https://troptionsunity.com/pricing (Stripe + x402 USDC)"
Write-Host "  https://blockchainfraud.org (Stripe `$9 + x402 ATP)"
Write-Host "`nSet live secrets if not done:"
Write-Host "  wrangler secret put STRIPE_SECRET_KEY  (troptions-unity-payments + blockchainfraud)"
Write-Host "  MOLTBOT_GATEWAY_URL=http://localhost:3402  (Legacy Vault .env / Vercel)"
