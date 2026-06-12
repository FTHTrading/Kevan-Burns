#!/bin/bash
TOKEN="cfut_YOUR_CLOUDFLARE_API_TOKEN"
ACCOUNT_ID="07bcc4a189ef176261b818409c95891f"
PROJECT="troptions-unity-legacy-vault"

curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'result' in data:
    prod_branch = data['result'].get('production_branch')
    print(f'Production Branch: {prod_branch}')
    print(f'Project Config: {data[\"result\"]}')
else:
    print(data)
"
