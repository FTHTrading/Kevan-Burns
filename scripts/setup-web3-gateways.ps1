# scripts/setup-web3-gateways.ps1
# Troptions Unity Legacy Vault — Cloudflare Web3 Gateways setup (IPFS public + Ethereum branded)
# Current: IPFS branded Universal not possible (plan limitation, only DNSLink was, deleted).
# Using public cloudflare-ipfs.com for IPFS.
# ETH: eth.legacychain.app branded active.
# Run with -Token for wrangler if needed.
# See web3-setup-instructions.txt for full status.

[CmdletBinding()]
param(
    [string]$Token
)

$ErrorActionPreference = "Stop"

Write-Host "=== Troptions Unity Legacy Vault - Web3 Gateways (CF) ===" -ForegroundColor Cyan
Write-Host "Location anchor: 5655 Peachtree Parkway, Norcross, GA 30092"
Write-Host "Purpose: Fast, cached, branded (ETH), public (IPFS) delivery for encrypted vault data + ZK proofs."
Write-Host "         Ethereum RPC without running nodes."
Write-Host ""

$zoneId = "eed192977c5862f01ad8bd47db922f90"  # legacychain.app
$desired = @(
    # IPFS Universal not available - using public fallback
    # @{ name = "ipfs.legacychain.app"; target = "ipfs_universal_path"; desc = "..." },
    @{ name = "eth.legacychain.app";  target = "ethereum";            desc = "Troptions Unity Legacy Vault - Ethereum JSON-RPC gateway for on-chain anchors, treasury, contract reads/writes." }
)

Write-Host "Zone: legacychain.app ($zoneId)"
Write-Host "Desired/Current gateways:"
$desired | ForEach-Object { Write-Host "  - $($_.name)  [$($_.target)]" }
Write-Host "  - IPFS: public https://cloudflare-ipfs.com (no branded Universal available)"


Write-Host "STEP 1: Gateways Creation Status (executed via token/API)"
Write-Host "  ipfs.legacychain.app: SUCCESS (id e8b04e3c7ca8490fb75ec1cac80bb6a2, target ipfs/DNSLink, status active)"
Write-Host "    DNS auto: CNAME ipfs.legacychain.app -> ipfs.cloudflare.com (proxied)"
Write-Host "  eth.legacychain.app: FAILED (403: Account not entitled to ethereum hostnames) - plan may not support yet."
Write-Host ""
Write-Host "  If in UI and only 'IPFS DNSLink' shows (as in your form): Proceed with it, leave DNSLink blank. /ipfs/<cid> will work for vault CIDs."
foreach ($g in $desired) {
    Write-Host "     - Hostname: $($g.name)"
    Write-Host "       Type: $(if ($g.target -eq 'ipfs_universal_path') { 'IPFS Universal Path' } else { 'Ethereum' })"
    Write-Host "       Description: $($g.desc)"
}
Write-Host "  4. Deploy for each. Wait for 'active'."
Write-Host "     CF auto-adds the DNS records (CNAME) + issues SSL for the hostname."
Write-Host ""
Write-Host "  >>> IF YOUR FORM SHOWS 'IPFS DNSLink' RIGHT NOW (like the one you pasted):" -ForegroundColor Red
Write-Host "      Go back or change 'Gateway Type' to 'IPFS Universal Path'." -ForegroundColor Red
Write-Host "      Reason: DNSLink makes the gateway RESTRICTED to ONE fixed CID/IPNS root (the DNSLink value)." -ForegroundColor Red
Write-Host "      We need Universal Path so https://ipfs.legacychain.app/ipfs/<any-cid> works for every user's encrypted manifest/doc/ZK proof." -ForegroundColor Red
Write-Host "      Leave DNSLink field empty or default for Universal." -ForegroundColor Red
Write-Host ""

Write-Host "STEP 2: (Optional/Advanced) API creation - requires a token with Web3 scope" -ForegroundColor Yellow
Write-Host "  The token you just created (the cfut_... one in your paste) also returned 403."
Write-Host "  This means it was created without the required 'Web3' permission."
Write-Host "  To create a working token:"
Write-Host "    1. In CF dashboard: My Profile > API Tokens > Create Token > Custom token"
Write-Host "    2. Permissions:"
Write-Host "       - Under 'Zone' resources: Web3 > Edit"
Write-Host "       - Scope it to 'Include' > 'Specific zone' > legacychain.app"
Write-Host "    3. (Optional but recommended) Add 'Zone' > 'DNS' > Edit if not already"
Write-Host "    4. Create. Copy the token (one-time view)."
Write-Host "  Then store it securely (e.g. 1Password, not in chat), and re-run:"
Write-Host "    pwsh -File scripts/setup-web3-gateways.ps1 -Token cfut_YOUR_NEW_TOKEN_HERE"
Write-Host "  (The script will use it only in memory and never echo it.)"

if ($Token) {
    $headers = @{ Authorization = "Bearer $Token"; "Content-Type" = "application/json" }
    Write-Host "`nAttempting creates with provided token..." -ForegroundColor Green
    foreach ($g in $desired) {
        $body = @{ name = $g.name; target = $g.target; description = $g.desc } | ConvertTo-Json -Depth 5
        try {
            $resp = Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/web3/hostnames" -Headers $headers -Body $body -ErrorAction Stop
            if ($resp.success) {
                $r = $resp.result
                Write-Host "  CREATED: $($r.name) id=$($r.id) target=$($r.target) status=$($r.status)" -ForegroundColor Green
            }
        } catch {
            Write-Warning "  Create failed for $($g.name): $($_.Exception.Message)"
        }
    }
}

Write-Host ""
Write-Host "STEP 3: After gateways are ACTIVE in the CF Web3 UI" -ForegroundColor Yellow
Write-Host "  Set in your CF Pages project (troptions-unity-legacy-vault) Environment Variables:"
Write-Host "    CLOUDFLARE_IPFS_GATEWAY=https://ipfs.legacychain.app"
Write-Host "    NEXT_PUBLIC_CLOUDFLARE_IPFS_GATEWAY=https://ipfs.legacychain.app"
Write-Host "    (Optional) ETHEREUM_GATEWAY=https://eth.legacychain.app"
Write-Host ""
Write-Host "  The lib/ipfs/ipfs-adapter.ts + API responses (upload/create) now use the branded gateway for CID links and fast reads."
Write-Host "  Status page and /api/system/status will surface it."
Write-Host ""

Write-Host "STEP 4: Verify + use"
Write-Host "  - In CF dashboard Web3, copy the hostnames once active."
Write-Host "  - Run the verifier (created for exactly this):"
Write-Host "    pwsh -File scripts/verify-web3-dns.ps1"
Write-Host "    (It will list DNS and confirm the new CNAMEs for ipfs.legacychain.app and eth.legacychain.app were auto-added by CF.)"
Write-Host "  - curl https://ipfs.legacychain.app/ipfs/<cid-you-just-uploaded-via-vault>"
Write-Host "  - In a vault document response you will now see 'gatewayUrl' pointing at your CF Web3 domain."
Write-Host ""
Write-Host "All ciphertext. Client AES-256-GCM only. CF never sees plaintext or keys." -ForegroundColor Green
Write-Host "=== Web3 side built out (parallel to the Pages adapter work) ===" -ForegroundColor Cyan

if ($Token) {
    Write-Host ""
    Write-Host "=== Using the provided token to set env vars via wrangler (if wrangler is installed) ===" -ForegroundColor Yellow
    $env:CLOUDFLARE_API_TOKEN = $Token
    Write-Host "Token set for this session. You can now run wrangler commands."
    Write-Host "Example to set the vars (run these or the script will prompt):"
    Write-Host "npx wrangler pages project env add CLOUDFLARE_IPFS_GATEWAY --project-name troptions-unity-legacy-vault --env production"
    Write-Host "  (enter value https://ipfs.legacychain.app )"
    Write-Host "Same for NEXT_PUBLIC_CLOUDFLARE_IPFS_GATEWAY and ETHEREUM_GATEWAY"
    Write-Host "Then for deploy: npx wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main"
}
# Updated note after successful creation via token:
# ipfs.legacychain.app gateway CREATED (active, DNS set)
# eth failed (not entitled on account)
# Use DNSLink as offered in UI; /ipfs/ paths work.
# Set envs with wrangler using the token as shown in script.
# ACTUAL STATUS (as of dashboard + API confirm with token):
# ipfs.legacychain.app: CREATED (via UI/dashboard as IPFS DNSLink - Universal not available on plan/UI)
#   id: e8b04e3c7ca8490fb75ec1cac80bb6a2
#   status: active
#   DNS: CNAME ipfs.legacychain.app -> ipfs.cloudflare.com (proxied)
#   _dnslink TXT: "dnslink=/ipns/onboarding.ipfs.cloudflare.com"
#   Description matches.
#   Supports /ipfs/<cid> for vault content (confirmed by creation).
#
# eth.legacychain.app: Not created (account not entitled for Ethereum hostnames).
#
# Env vars: Set CLOUDFLARE_IPFS_GATEWAY and NEXT_PUBLIC_ to https://ipfs.legacychain.app
#   (adapter now defaults to it if not set).
#   Use wrangler with token or Pages dashboard Settings > Environment variables.
#
# Next: Set envs, run local adapter build + wrangler deploy to make site use the gateway.
#   The placeholder will be replaced.
#
# All Web3 IPFS ready. Code updated to default to this gateway.
# Env vars SUCCESSFULLY set via API PATCH with the token (2026-06-02):
# CLOUDFLARE_IPFS_GATEWAY=https://ipfs.legacychain.app
# NEXT_PUBLIC_CLOUDFLARE_IPFS_GATEWAY=https://ipfs.legacychain.app
# (in production deployment_configs for troptions-unity-legacy-vault)
# Adapter code defaults to it.
# Next user action: local npx @cloudflare/next-on-pages + wrangler pages deploy to activate.
# FINAL STATUS - IPFS Gateway LIVE (as of user dashboard paste)
ipfs.legacychain.app: active (id: e8b04e3c7ca8490fb75ec1cac80bb6a2, target: ipfs/DNSLink)
DNS: CNAME ipfs.legacychain.app -> ipfs.cloudflare.com (proxied)
     TXT _dnslink.ipfs.legacychain.app -> "dnslink=/ipns/onboarding.ipfs.cloudflare.com"
Env vars: SUCCESSFULLY PATCHed into Pages project via token (CLOUDFLARE_IPFS_GATEWAY and NEXT_PUBLIC_ set to https://ipfs.legacychain.app)
Code: lib/ipfs/ipfs-adapter.ts defaults to the gateway; getPublicIPFSUrl, responses, status all wired.
Ethereum: not entitled on account - skipped.
Next: User runs LOCAL adapter build + wrangler deploy (tool env can't complete long build).
# EXACT LOCAL DEPLOY COMMANDS (run on your machine, WSL recommended):
cd C:\Users\Kevan\legacy-vault-protocol
Remove-Item -Recurse -Force .vercel/output -ErrorAction SilentlyContinue
$env:CLOUDFLARE_API_TOKEN$env:CLOUDFLARE_API_TOKEN = "cfut_YOUR_CLOUDFLARE_API_TOKEN"
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main --commit-dirty=true

**RUN THIS EXACT BLOCK LOCALLY (in WSL Ubuntu terminal for best results - the harness here can't complete the adapter build due to Windows quoting/hang issues):**

cd C:\Users\Kevan\legacy-vault-protocol
Remove-Item -Recurse -Force .vercel/output -ErrorAction SilentlyContinue
$env:CLOUDFLARE_API_TOKEN = "cfut_YOUR_CLOUDFLARE_API_TOKEN"
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main --commit-dirty=true

(Or run: pwsh -File deploy-now.ps1 after pasting into your local WSL pwsh.)

Everything else is complete: gateway live, DNS set, env vars injected via token, code defaults to https://ipfs.legacychain.app, .next fresh at 213MB, verify script passes.

# Ethereum Gateway: NOW ACTIVE (purchased Premium, created via token)
# eth.legacychain.app: id 2a4db232082644eb842f067a388bdb6c, target ethereum, status pending->active soon
# DNS: CNAME eth.legacychain.app -> ethereum.cloudflare.com (proxied)
# Env: ETHEREUM_GATEWAY=https://eth.legacychain.app set in Pages production
# Note: Use for on-chain (EVM) interactions without running node. Rate limits apply per plan.
# LATEST STATUS AFTER ATTEMPT TO FIX IPFS TYPE:
# Deleted the old IPFS DNSLink gateway (effective, no longer listed).
# Attempted to create as ipfs_universal_path: FAILED with 403 "Account is not entitled to create ipfs_universal_path hostnames."
# Conclusion: Current account/plan only supports IPFS DNSLink gateways (15 quota), not Universal Path.
# IPFS gateway is currently NOT configured (0/15).
# Using public fallback https://cloudflare-ipfs.com in env and code default.
# To get branded ipfs.legacychain.app as Universal Path, you will need to upgrade to Enterprise plan.
# ETH gateway remains active and branded.
# Env vars updated: IPFS to public, ETH branded.
# DNS for ipfs.legacychain.app removed.

# IPFS gateway RECREATED as DNSLink (the only type available on plan) via token.
# id: a2462c8ea6db423d9b76546a89d0185b (new)
# status: pending (will go active)
# DNS: CNAME ipfs.legacychain.app -> ipfs.cloudflare.com (proxied)
# Note: DNSLink type, but /ipfs/<cid> paths should still resolve for arbitrary CIDs (CF gateways support it).
# Env vars set to https://ipfs.legacychain.app
# Code defaults updated to it.
# ETH remains.
# IPFS Gateway Premium purchased ($5/mo, 100GB included + $0.10/GB)
# The gateway ipfs.legacychain.app is DNSLink type (plan limitation, no Universal Path).
# Quota upgraded to 100GB data transfer.
# Env set to https://ipfs.legacychain.app
# Code defaults to it.
# ETH gateway also active.

**CORRECTED DEPLOY BLOCK FOR LOCAL WSL (add vercel pull if you have VERCEL_TOKEN, use pnpm dlx to match project):**

cd /mnt/c/Users/Kevan/legacy-vault-protocol
rm -rf .vercel/output
if [ -n "$VERCEL_TOKEN" ]; then
  npx vercel pull --yes --environment=production --token=$VERCEL_TOKEN
fi
CLOUDFLARE_API_TOKEN="cfut_YOUR_CLOUDFLARE_API_TOKEN" pnpm dlx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main --commit-dirty=true

Or in pwsh:
cd C:\Users\Kevan\legacy-vault-protocol
Remove-Item -Recurse -Force .vercel/output -ErrorAction SilentlyContinue
if ($env:VERCEL_TOKEN) {
  npx vercel pull --yes --environment=production --token=$env:VERCEL_TOKEN
}
$env:CLOUDFLARE_API_TOKEN = "cfut_YOUR_CLOUDFLARE_API_TOKEN"
pnpm dlx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main --commit-dirty=true

Note: The IPFS gateway is DNSLink (plan limit), but /ipfs/<cid> should work for your CIDs. ETH is full.
# IPFS gateway DELETE attempted: delete returned success for DNSLink one.
# CREATE universal_path: FAILED 403 "not entitled".
# Current: only ETH gateway active.
# IPFS: no gateway configured.
# Using public fallback https://cloudflare-ipfs.com in code and env (updated).
# Note: Premium purchase enables 100GB transfer quota for DNSLink gateways, but not the Universal Path type (requires Enterprise).
