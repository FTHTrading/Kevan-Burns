# scripts/seo-geo-monitor.ps1
# Basic monitoring for Troptions Unity Legacy Vault SEO/GEO health
# Run weekly or via scheduled task

$domain = "https://troptionsunity.com"
$pages = @("/", "/pricing", "/how-it-works", "/blog", "/norcross-ga", "/gwinnett-county", "/atlanta-crypto-estate")

Write-Host "=== Troptions Unity Legacy Vault SEO/GEO Monitor ===" -ForegroundColor Cyan
Write-Host "Domain: $domain"
Write-Host "Date: $(Get-Date)"

foreach ($page in $pages) {
    $url = "$domain$page"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        $status = $response.StatusCode
        $title = ($response.Content | Select-String -Pattern '<title>(.*?)</title>' -AllMatches).Matches[0].Groups[1].Value
        Write-Host "[$status] $url - $title" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] $url - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nNext: Check GSC for impressions, LLM test queries ('crypto estate planning Georgia'), GBP reviews."
Write-Host "Run this from terminal or schedule it."
