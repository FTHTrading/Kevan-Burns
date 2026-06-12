import urllib.request
import json
import ssl

context = ssl._create_unverified_context()

req = urllib.request.Request(
    'https://api.cloudflare.com/client/v4/accounts/07bcc4a189ef176261b818409c95891f/pages/projects',
    headers={'Authorization': 'Bearer cfut_YOUR_CLOUDFLARE_API_TOKEN'}
)

try:
    with urllib.request.urlopen(req, context=context) as response:
        data = json.loads(response.read().decode())
        projects = data.get('result', [])
        print(f"Total projects returned: {len(projects)}")
        for idx, p in enumerate(projects):
            domains = p.get('domains', [])
            print(f"{idx+1}. {p['name']}: {domains}")
            if any('legacychain.app' in d for d in domains):
                print(f"  --> MATCH FOUND IN PROJECT: {p['name']}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
