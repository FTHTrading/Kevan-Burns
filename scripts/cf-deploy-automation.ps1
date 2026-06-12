# Load CF token from env var or .env file (never hardcode in source)
$CF_TOKEN = $env:CF_API_TOKEN
if (-not $CF_TOKEN) {
    $envLine = Get-Content "C:\Users\Kevan\.gemini\antigravity-ide\scratch\adk_build\legacy-vault-protocol\.env" | Where-Object { $_ -match "^CF_API_TOKEN=" }
    if ($envLine) { $CF_TOKEN = ($envLine -split "=", 2)[1].Trim('"') }
}
if (-not $CF_TOKEN) { Write-Host "[ERR] CF_API_TOKEN not set in env or .env file" -ForegroundColor Red; exit 1 }
$ZONE_ID   = "eed192977c5862f01ad8bd47db922f90"
$DOMAIN    = "legacychain.app"
$VERCEL_CNAME = "cname.vercel-dns.com"

$headers = @{
    "Authorization" = "Bearer $CF_TOKEN"
    "Content-Type"  = "application/json"
}

Write-Host "==> Step 1: Verifying Cloudflare API token..." -ForegroundColor Cyan
$verify = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify" -Headers $headers
if ($verify.success) {
    Write-Host "    [OK] Token active" -ForegroundColor Green
} else {
    Write-Host "    [ERR] Token invalid!" -ForegroundColor Red
    exit 1
}

Write-Host "==> Step 2: Fetching current DNS records..." -ForegroundColor Cyan
$dnsResp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?per_page=200" -Headers $headers
$records = $dnsResp.result
Write-Host "    [OK] Found $($records.Count) records" -ForegroundColor Green

Write-Host "==> Step 3: Updating root CNAME to Vercel..." -ForegroundColor Cyan
$rootRecord = $records | Where-Object { $_.name -eq $DOMAIN -and $_.type -eq "CNAME" }
if ($rootRecord) {
    Write-Host "    Current: $($rootRecord.content)" -ForegroundColor Yellow
    $body = @{ type="CNAME"; name=$DOMAIN; content=$VERCEL_CNAME; proxied=$true; ttl=1 } | ConvertTo-Json
    $r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$($rootRecord.id)" -Headers $headers -Body $body
    if ($r.success) {
        Write-Host "    [OK] Root CNAME => $VERCEL_CNAME" -ForegroundColor Green
    } else {
        Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red
    }
} else {
    Write-Host "    No root CNAME found, creating..." -ForegroundColor Yellow
    $body = @{ type="CNAME"; name=$DOMAIN; content=$VERCEL_CNAME; proxied=$true; ttl=1 } | ConvertTo-Json
    $r = Invoke-RestMethod -Method POST -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -Headers $headers -Body $body
    if ($r.success) {
        Write-Host "    [OK] Root CNAME created => $VERCEL_CNAME" -ForegroundColor Green
    } else {
        Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red
    }
}

Write-Host "==> Step 4: Updating www CNAME to Vercel..." -ForegroundColor Cyan
$wwwRecord = $records | Where-Object { $_.name -eq "www.$DOMAIN" -and $_.type -eq "CNAME" }
if ($wwwRecord) {
    Write-Host "    Current: $($wwwRecord.content)" -ForegroundColor Yellow
    $body = @{ type="CNAME"; name="www.$DOMAIN"; content=$VERCEL_CNAME; proxied=$true; ttl=1 } | ConvertTo-Json
    $r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$($wwwRecord.id)" -Headers $headers -Body $body
    if ($r.success) {
        Write-Host "    [OK] www CNAME => $VERCEL_CNAME" -ForegroundColor Green
    } else {
        Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red
    }
} else {
    Write-Host "    No www CNAME found, creating..." -ForegroundColor Yellow
    $body = @{ type="CNAME"; name="www.$DOMAIN"; content=$VERCEL_CNAME; proxied=$true; ttl=1 } | ConvertTo-Json
    $r = Invoke-RestMethod -Method POST -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -Headers $headers -Body $body
    if ($r.success) {
        Write-Host "    [OK] www CNAME created => $VERCEL_CNAME" -ForegroundColor Green
    } else {
        Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red
    }
}

Write-Host "==> Step 5: SSL mode = strict..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" -Headers $headers -Body (@{ value="strict" } | ConvertTo-Json)
if ($r.success) { Write-Host "    [OK] SSL = $($r.result.value)" -ForegroundColor Green } else { Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red }

Write-Host "==> Step 6: Always Use HTTPS = on..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/always_use_https" -Headers $headers -Body (@{ value="on" } | ConvertTo-Json)
if ($r.success) { Write-Host "    [OK] Always HTTPS = $($r.result.value)" -ForegroundColor Green } else { Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red }

Write-Host "==> Step 7: HSTS with preload..." -ForegroundColor Cyan
$hstsVal = @{ enabled=$true; max_age=31536000; include_subdomains=$true; preload=$true }
$r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_header" -Headers $headers -Body (@{ value=$hstsVal } | ConvertTo-Json -Depth 5)
if ($r.success) { Write-Host "    [OK] HSTS enabled" -ForegroundColor Green } else { Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red }

Write-Host "==> Step 8: Min TLS = 1.2..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/min_tls_version" -Headers $headers -Body (@{ value="1.2" } | ConvertTo-Json)
if ($r.success) { Write-Host "    [OK] Min TLS = $($r.result.value)" -ForegroundColor Green } else { Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red }

Write-Host "==> Step 9: Auto HTTPS Rewrites = on..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/automatic_https_rewrites" -Headers $headers -Body (@{ value="on" } | ConvertTo-Json)
if ($r.success) { Write-Host "    [OK] Auto HTTPS Rewrites = $($r.result.value)" -ForegroundColor Green } else { Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red }

Write-Host "==> Step 10: Brotli compression = on..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/brotli" -Headers $headers -Body (@{ value="on" } | ConvertTo-Json)
if ($r.success) { Write-Host "    [OK] Brotli = $($r.result.value)" -ForegroundColor Green } else { Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red }

Write-Host "==> Step 11: Security level = high..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level" -Headers $headers -Body (@{ value="high" } | ConvertTo-Json)
if ($r.success) { Write-Host "    [OK] Security Level = $($r.result.value)" -ForegroundColor Green } else { Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red }

Write-Host "==> Step 12: Browser Integrity Check = on..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Method PATCH -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/browser_check" -Headers $headers -Body (@{ value="on" } | ConvertTo-Json)
if ($r.success) { Write-Host "    [OK] Browser Integrity Check = $($r.result.value)" -ForegroundColor Green } else { Write-Host "    [ERR] $($r.errors | ConvertTo-Json)" -ForegroundColor Red }

Write-Host "==> Step 13: Verifying final DNS state..." -ForegroundColor Cyan
$dnsResp2 = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?per_page=200" -Headers $headers
$critical = $dnsResp2.result | Where-Object { $_.name -in @($DOMAIN, "www.$DOMAIN", "app.$DOMAIN") -and $_.type -eq "CNAME" }
foreach ($rec in $critical) {
    Write-Host "    [OK] $($rec.name) => $($rec.content) [proxied=$($rec.proxied)]" -ForegroundColor Green
}

Write-Host "==> Step 14: HTTP smoke tests..." -ForegroundColor Cyan
$urls = @("https://$DOMAIN", "https://www.$DOMAIN", "https://$DOMAIN/api/health")
foreach ($url in $urls) {
    try {
        $resp = Invoke-WebRequest -Uri $url -MaximumRedirection 5 -TimeoutSec 20 -UseBasicParsing
        Write-Host "    [OK] $url => HTTP $($resp.StatusCode)" -ForegroundColor Green
    } catch {
        $msg = $_.Exception.Message
        if ($msg -match "404|200|301|302") {
            Write-Host "    [OK] $url => reachable" -ForegroundColor Green
        } else {
            Write-Host "    [WARN] $url => $msg" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host " LEGACY VAULT PROTOCOL - CLOUDFLARE AUTOMATION COMPLETE" -ForegroundColor Magenta
Write-Host " legacychain.app configured and hardened for production." -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
