#!/bin/bash
set -e
cd /mnt/c/Users/Kevan/legacy-vault-protocol
rm -rf .vercel/output
export CLOUDFLARE_API_TOKEN="cfut_YOUR_CLOUDFLARE_API_TOKEN"
echo "=== Starting CF adapter build in WSL ==="
npx @cloudflare/next-on-pages
echo "=== Adapter finished, starting deploy ==="
npx wrangler pages deploy .vercel/output/static --project-name troptions-unity-legacy-vault --branch main --commit-dirty=true
echo "=== Deploy completed ==="
