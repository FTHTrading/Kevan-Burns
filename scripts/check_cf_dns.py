import os
import requests
import json
import sys

token1 = "cfut_YOUR_CLOUDFLARE_API_TOKEN"
token2 = "cfut_YOUR_CLOUDFLARE_API_TOKEN"

for i, token in enumerate([token1, token2], 1):
    print(f"--- Testing Token {i} ---")
    sys.stdout.flush()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Verify token
        print("Verifying token...")
        sys.stdout.flush()
        r = requests.get("https://api.cloudflare.com/client/v4/user/tokens/verify", headers=headers, timeout=10)
        print("Token verification response:", r.json())
        sys.stdout.flush()
        if not r.json().get("success"):
            continue
            
        # List zones
        print("Fetching zones...")
        sys.stdout.flush()
        r = requests.get("https://api.cloudflare.com/client/v4/zones", headers=headers, timeout=10)
        zones = r.json().get("result", [])
        print("Zones found:", len(zones))
        sys.stdout.flush()
        for z in zones:
            print(f"  Name: {z['name']}, ID: {z['id']}")
            sys.stdout.flush()
            
            # Get DNS records for this zone
            r_dns = requests.get(f"https://api.cloudflare.com/client/v4/zones/{z['id']}/dns_records", headers=headers, timeout=10)
            dns_recs = r_dns.json().get("result", [])
            print(f"  DNS Records ({len(dns_recs)}):")
            sys.stdout.flush()
            for rec in dns_recs:
                print(f"    {rec['type']} {rec['name']} -> {rec['content']} (proxied: {rec['proxied']})")
                sys.stdout.flush()
                
        # Get pages projects
        print("Fetching accounts...")
        sys.stdout.flush()
        r_pages = requests.get(f"https://api.cloudflare.com/client/v4/accounts", headers=headers, timeout=10)
        accounts = r_pages.json().get("result", [])
        print("Accounts found:", len(accounts))
        sys.stdout.flush()
        for acc in accounts:
            print(f"  Account: {acc['name']}, ID: {acc['id']}")
            sys.stdout.flush()
            r_proj = requests.get(f"https://api.cloudflare.com/client/v4/accounts/{acc['id']}/pages/projects", headers=headers, timeout=10)
            projects = r_proj.json().get("result", [])
            print(f"    Pages Projects ({len(projects)}):")
            sys.stdout.flush()
            for p in projects:
                print(f"      {p['name']} -> {p.get('subdomain')}")
                sys.stdout.flush()
                # Get custom domains
                r_dom = requests.get(f"https://api.cloudflare.com/client/v4/accounts/{acc['id']}/pages/projects/{p['name']}/domains", headers=headers, timeout=10)
                domains = r_dom.json().get("result", [])
                print(f"      Custom Domains ({len(domains)}):")
                sys.stdout.flush()
                for d in domains:
                    print(f"        {d['name']} ({d.get('status')})")
                    sys.stdout.flush()
    except Exception as ex:
        print("Error checking Cloudflare:", str(ex))
        sys.stdout.flush()
print("Cloudflare check complete.")
sys.stdout.flush()
