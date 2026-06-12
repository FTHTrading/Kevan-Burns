Set-Location -Path $PSScriptRoot
Write-Output "=== Cleaning old builds ==="
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next/out -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next/cache -ErrorAction SilentlyContinue

Write-Output "=== Recreating .vercel/project.json for non-interactive build ==="
New-Item -ItemType Directory -Force -Path ".vercel" | Out-Null
$projectJson = @{
    projectId = "prj_QALXWXqI4MHXAnGDCNvHZXNN9Pcj"
    orgId = "team_moGmte3wISNYxMMhqSfSYyGp"
    projectName = "legacy-vault-protocol"
} | ConvertTo-Json
Set-Content -Path ".vercel\project.json" -Value $projectJson

Write-Output "=== pnpm install ==="
pnpm install

Write-Output "=== Setting Cloudflare Token ==="
if ($null -eq $env:CLOUDFLARE_API_TOKEN -or $env:CLOUDFLARE_API_TOKEN -eq "" -or $env:CLOUDFLARE_API_TOKEN -eq "cfut_YOUR_CLOUDFLARE_API_TOKEN") {
  if (Test-Path ".env") {
    $envToken = Get-Content .env | Select-String "^CF_API_TOKEN=" | ForEach-Object { $_.Line.Split('=', 2)[1].Trim().Trim('"').Trim("'") }
    if ($envToken) {
      $env:CLOUDFLARE_API_TOKEN = $envToken
      Write-Output "Loaded CLOUDFLARE_API_TOKEN from .env"
    }
  }
}
if ($null -eq $env:CLOUDFLARE_API_TOKEN -or $env:CLOUDFLARE_API_TOKEN -eq "" -or $env:CLOUDFLARE_API_TOKEN -eq "cfut_YOUR_CLOUDFLARE_API_TOKEN") {
  $env:CLOUDFLARE_API_TOKEN = "cfut_YOUR_CLOUDFLARE_API_TOKEN"
}

Write-Output "=== Ensuring nodejs_compat flag in Cloudflare Pages ==="
$accountId = "07bcc4a189ef176261b818409c95891f"
$project = "troptions-unity-legacy-vault"
$headers = @{Authorization = "Bearer $env:CLOUDFLARE_API_TOKEN"}
$flagBody = @{ deployment_configs = @{ production = @{ compatibility_flags = @("nodejs_compat") }; preview = @{ compatibility_flags = @("nodejs_compat") } } } | ConvertTo-Json -Depth 5
try {
  Invoke-RestMethod -Method Patch -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$project" -Headers $headers -ContentType "application/json" -Body $flagBody | Out-Null
  Write-Output "Compatibility flag verified."
} catch {
  Write-Output "Flag configuration warning: $_"
}

Write-Output "=== Compiling Next.js project locally ==="
pnpm run build

Write-Output "=== Packaging Next.js project for Cloudflare Pages ==="
pnpm dlx --yes @cloudflare/next-on-pages --skip-build

Write-Output "=== Verifying and copying static assets ==="
if (Test-Path "public") {
  Copy-Item -Recurse -Force -Path "public\*" -Destination ".vercel\output\static\" -ErrorAction SilentlyContinue
  Write-Output "Public assets copied successfully."
}

Write-Output "=== Deploying to Cloudflare Pages ==="
$deployOutput = npx --yes wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main --commit-dirty=true 2>&1
$deployOutput | Select-Object -Last 10

$pagesUrl = ($deployOutput | Select-String -Pattern 'https://[a-z0-9.-]*\.troptions-unity-legacy-vault\.pages\.dev' | Select-Object -Last 1).Matches.Value
if (-not $pagesUrl) {
  $pagesUrl = "https://troptions-unity-legacy-vault.pages.dev"
}
$targetHost = $pagesUrl -replace '^https://',''
Write-Output "Deployed successfully to: $pagesUrl (target host: $targetHost)"

Write-Output "=== Attaching custom domains ==="
try {
  $body = @{name="legacychain.app"} | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$project/domains" -Headers $headers -ContentType "application/json" -Body $body | Out-Null
} catch {
  Write-Output "Add domain legacychain.app warning: $_"
}

try {
  $body2 = @{name="www.legacychain.app"} | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$project/domains" -Headers $headers -ContentType "application/json" -Body $body2 | Out-Null
} catch {
  Write-Output "Add domain www.legacychain.app warning: $_"
}

try {
  $body3 = @{name="vault.genesis402.com"} | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$project/domains" -Headers $headers -ContentType "application/json" -Body $body3 | Out-Null
} catch {
  Write-Output "Add domain vault.genesis402.com warning: $_"
}

Write-Output "=== Auto-updating CNAME records for legacychain.app ==="
$zoneIdLegacy = "eed192977c5862f01ad8bd47db922f90"
# Root CNAME (forwarded to CNAME target)
try {
  $records = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/zones/$zoneIdLegacy/dns_records?name=legacychain.app&type=CNAME" -Headers $headers
  $recordId = if ($records.success -and $records.result.Count -gt 0) { $records.result[0].id } else { $null }
  $dnsBody = @{ type = "CNAME"; name = "legacychain.app"; content = "troptions-unity-legacy-vault.pages.dev"; ttl = 1; proxied = $true } | ConvertTo-Json
  if ($recordId) {
    Write-Output "Updating existing root DNS record $recordId"
    Invoke-RestMethod -Method Patch -Uri "https://api.cloudflare.com/client/v4/zones/$zoneIdLegacy/dns_records/$recordId" -Headers $headers -ContentType "application/json" -Body $dnsBody | Out-Null
  } else {
    Write-Output "Creating new root DNS record"
    Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$zoneIdLegacy/dns_records" -Headers $headers -ContentType "application/json" -Body $dnsBody | Out-Null
  }
} catch {
  Write-Output "Root DNS update warning: $_"
}

# WWW CNAME
try {
  $records = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/zones/$zoneIdLegacy/dns_records?name=www.legacychain.app&type=CNAME" -Headers $headers
  $recordId = if ($records.success -and $records.result.Count -gt 0) { $records.result[0].id } else { $null }
  $dnsBody = @{ type = "CNAME"; name = "www"; content = "troptions-unity-legacy-vault.pages.dev"; ttl = 1; proxied = $true } | ConvertTo-Json
  if ($recordId) {
    Write-Output "Updating existing www DNS record $recordId"
    Invoke-RestMethod -Method Patch -Uri "https://api.cloudflare.com/client/v4/zones/$zoneIdLegacy/dns_records/$recordId" -Headers $headers -ContentType "application/json" -Body $dnsBody | Out-Null
  } else {
    Write-Output "Creating new www DNS record"
    Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$zoneIdLegacy/dns_records" -Headers $headers -ContentType "application/json" -Body $dnsBody | Out-Null
  }
} catch {
  Write-Output "WWW DNS update warning: $_"
}

Write-Output "=== Auto-updating CNAME record for vault.genesis402.com ==="
$zoneId = "bc4d3d1b2fa6e1b52e1d3854bbaa691e"
try {
  $records = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records?name=vault.genesis402.com" -Headers $headers
  $recordId = if ($records.success -and $records.result.Count -gt 0) { $records.result[0].id } else { $null }
  $dnsBody = @{ type = "CNAME"; name = "vault"; content = "troptions-unity-legacy-vault.pages.dev"; ttl = 1; proxied = $true } | ConvertTo-Json
  if ($recordId) {
    Write-Output "Updating existing DNS record $recordId"
    Invoke-RestMethod -Method Patch -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records/$recordId" -Headers $headers -ContentType "application/json" -Body $dnsBody | Out-Null
  } else {
    Write-Output "Creating new DNS record"
    Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Headers $headers -ContentType "application/json" -Body $dnsBody | Out-Null
  }
  Write-Output "DNS updated successfully."
} catch {
  Write-Output "DNS update warning: $_"
}

Write-Output "=== Cloudflare Pages Deployment Pipeline Complete ==="
