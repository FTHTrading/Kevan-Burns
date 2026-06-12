#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "=== Cleaning ==="
rm -rf .next .vercel .next/out .vercel/output .next/cache 2>/dev/null || true
echo "=== pnpm install (with ignore-scripts bypass) ==="
pnpm install --ignore-scripts
echo "=== Pre-create .next/export/500.html to workaround WSL/Next.js rename ENOENT on shared FS ==="
mkdir -p .next/export .next/server/pages
echo "<!DOCTYPE html><html><body><h1>500 - Internal Server Error</h1></body></html>" > .next/export/500.html
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ "$CLOUDFLARE_API_TOKEN" = "cfut_YOUR_CLOUDFLARE_API_TOKEN" ]; then
  if [ -f .env ]; then
    ENV_TOKEN=$(grep -E "^CF_API_TOKEN=" .env | cut -d'=' -f2- | tr -d '"' | tr -d '\r')
    if [ -n "$ENV_TOKEN" ]; then
      export CLOUDFLARE_API_TOKEN="$ENV_TOKEN"
      echo "Loaded CLOUDFLARE_API_TOKEN from .env"
    fi
  fi
fi
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ "$CLOUDFLARE_API_TOKEN" = "cfut_YOUR_CLOUDFLARE_API_TOKEN" ]; then
  export CLOUDFLARE_API_TOKEN="cfut_YOUR_CLOUDFLARE_API_TOKEN"
fi
echo "=== Ensuring nodejs_compat compatibility flag (required for next-on-pages worker) ==="
ACCOUNT_ID="07bcc4a189ef176261b818409c95891f"
PROJECT="troptions-unity-legacy-vault"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"deployment_configs":{"production":{"compatibility_flags":["nodejs_compat"]},"preview":{"compatibility_flags":["nodejs_compat"]}}}' | cat
echo "=== Running @cloudflare/next-on-pages (full, it will handle build using scripts/build.mjs) ==="
pnpm dlx @cloudflare/next-on-pages
echo "=== Verifying static assets (images/layout) in output ==="
if [ -d ".vercel/output/static/images/legacy" ]; then
  echo "Found images dir with $(ls .vercel/output/static/images/legacy/ | wc -l) files (e.g. $(ls .vercel/output/static/images/legacy/ | head -3))"
else
  echo "WARNING: .vercel/output/static/images/legacy missing — public/ assets may not have copied. Rebuild or check next.config."
fi
# Safety: ensure all public/ assets (images, any other static layout assets) are at root of static output for CF Pages
if [ -d "public" ]; then
  echo "Ensuring public/ assets are copied to static output root..."
  cp -r public/* .vercel/output/static/ 2>/dev/null || true
fi
echo "=== Deploying to CF Pages and capturing URL ==="
ACCOUNT_ID="07bcc4a189ef176261b818409c95891f"
PROJECT="troptions-unity-legacy-vault"
TOKEN="$CLOUDFLARE_API_TOKEN"
DEPLOY_OUTPUT=$(npx wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main --commit-dirty=true 2>&1)
echo "$DEPLOY_OUTPUT" | tail -10
PAGES_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[a-z0-9.-]*\.troptions-unity-legacy-vault\.pages\.dev' | tail -1)
if [ -z "$PAGES_URL" ]; then
  PAGES_URL="https://troptions-unity-legacy-vault.pages.dev"
fi
TARGET_HOST=${PAGES_URL#https://}
echo "Deployed to: $PAGES_URL"

echo "=== Removing legacy troptionsunity.com domains (cleanup) ==="
curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains/troptionsunity.com" \
  -H "Authorization: Bearer $TOKEN" | cat
curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains/www.troptionsunity.com" \
  -H "Authorization: Bearer $TOKEN" | cat
curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains/registry.troptionsunity.com" \
  -H "Authorization: Bearer $TOKEN" | cat

echo "=== Deploy done. Now attaching custom domains via API ==="
echo "=== Attaching vault.genesis402.com (branded vault entry under Genesis402 ecosystem) ==="
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"vault.genesis402.com"}' | cat

echo "=== Attaching legacychain.app and www.legacychain.app ==="
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"legacychain.app"}' | cat
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"www.legacychain.app"}' | cat

echo "=== Attaching unykorn.ai custom domains ==="
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"unykorn.ai"}' | cat
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"www.unykorn.ai"}' | cat
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"registry.unykorn.ai"}' | cat
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"investors.unykorn.ai"}' | cat
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"kevan.unykorn.ai"}' | cat


update_dns_record() {
  local zone_id="$1"
  local sub_name="$2"  # e.g. "vault"
  local full_name="$3" # e.g. "vault.genesis402.com"
  local target="$4"    # e.g. "$TARGET_HOST"

  echo "=== Auto-updating DNS record for $full_name to $target (proxied) ==="
  local record_resp=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records?name=${full_name}" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
  local record_id=$(echo "$record_resp" | grep -o '"id":"[a-f0-9]\{32\}"' | head -1 | cut -d: -f2 | tr -d '"')

  if [ -n "$record_id" ]; then
    echo "Updating existing record $record_id..."
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${record_id}" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"CNAME\",\"name\":\"${sub_name}\",\"content\":\"${target}\",\"ttl\":1,\"proxied\":true}" | cat
  else
    echo "Creating new record..."
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"CNAME\",\"name\":\"${sub_name}\",\"content\":\"${target}\",\"ttl\":1,\"proxied\":true}" | cat
  fi
}

update_dns_record "bc4d3d1b2fa6e1b52e1d3854bbaa691e" "vault" "vault.genesis402.com" "troptions-unity-legacy-vault.pages.dev"
update_dns_record "40ce3ca38991756ee115a650cfea0d14" "registry" "registry.unykorn.ai" "troptions-unity-legacy-vault.pages.dev"
update_dns_record "40ce3ca38991756ee115a650cfea0d14" "investors" "investors.unykorn.ai" "troptions-unity-legacy-vault.pages.dev"
update_dns_record "40ce3ca38991756ee115a650cfea0d14" "kevan" "kevan.unykorn.ai" "troptions-unity-legacy-vault.pages.dev"

echo "=== DNS Records updated (may take minutes to propagate + CF validation). ==="
echo "=== FULL AUTOMATED DEPLOY + DNS COMPLETE ==="
