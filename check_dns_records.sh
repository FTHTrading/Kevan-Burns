#!/bin/bash
TOKEN="cfut_YOUR_CLOUDFLARE_API_TOKEN"
ZONE_ID="40ce3ca38991756ee115a650cfea0d14"

echo "=== DNS Records for unykorn.ai Zone ==="
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=CNAME" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'result' in data:
    for r in data['result']:
        print(f'{r[\"name\"]}: {r[\"type\"]} -> {r[\"content\"]} (proxied={r[\"proxied\"]})')
else:
    print(data)
"
