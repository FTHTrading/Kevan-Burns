# After you create the gateways in CF dashboard and they are ACTIVE, run this to verify DNS auto-provisioning.
$tokenPath = 'C:\Users\Kevan\OneDrive - FTH Trading\11-Downloads\cloudflare new api.txt'
$content = Get-Content $tokenPath -Raw
$cfuts = [regex]::Matches($content,'cfut_[A-Za-z0-9]+') | ForEach-Object { $_.Value }
$tok = $cfuts[0]
$headers = @{Authorization = "Bearer $tok"}
$zoneId = 'eed192977c5862f01ad8bd47db922f90'
Write-Host "=== Verifying Web3 gateway DNS records ===" -ForegroundColor Cyan
$recs = (Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Headers $headers).result | Where-Object { $_.name -like 'ipfs.legacychain.app' -or $_.name -like 'eth.legacychain.app' }
if ($recs) {
  $recs | Select name, type, content, proxied | Format-Table -AutoSize
  Write-Host "SUCCESS: New gateway records auto-added by CF." -ForegroundColor Green
} else {
  Write-Host "Not yet visible (wait 1-2 min after Active, or refresh). Current all legacychain records:" -ForegroundColor Yellow
  (Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Headers $headers).result | Where-Object { $_.name -like '*legacychain*' } | Select name, type, content, proxied | Format-Table -AutoSize
}
