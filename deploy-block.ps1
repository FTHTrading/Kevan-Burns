cd C:\Users\Kevan\legacy-vault-protocol
Remove-Item -Recurse -Force .vercel/output -ErrorAction SilentlyContinue
$env:CLOUDFLARE_API_TOKEN = "cfut_YOUR_CLOUDFLARE_API_TOKEN"
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main --commit-dirty=true
