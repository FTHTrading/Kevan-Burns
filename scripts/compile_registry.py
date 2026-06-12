import json
import os
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    src_path = r"C:\Users\Kevan\unykorn-ops\data\platform-hub\registry.json"
    dest_path = r"C:\Users\Kevan\.gemini\antigravity-ide\scratch\adk_build\legacy-vault-protocol\lib\registryArchive.ts"
    
    if not os.path.exists(src_path):
        print(f"Source registry.json not found at {src_path}")
        return
        
    try:
        with open(src_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        sites = data.get("sites", [])
        domains = data.get("domains", [])
        
        # We will clean the fields to avoid massive sizes and format errors
        cleaned_sites = []
        for s in sites:
            status = s.get("probe_status") or s.get("deploy_status") or s.get("status") or "unknown"
            cleaned_sites.append({
                "id": s.get("id", ""),
                "name": s.get("name") or s.get("id", "Unnamed Site"),
                "system": s.get("system", "Misc / Legacy"),
                "category": s.get("category", "Production"),
                "url": s.get("url", ""),
                "status": status.lower(),
                "web3": s.get("web3", {}).get("status") if isinstance(s.get("web3"), dict) else "unknown"
            })
            
        cleaned_domains = []
        for d in domains:
            if isinstance(d, dict):
                cleaned_domains.append({
                    "domain": d.get("domain", ""),
                    "visitors": d.get("visitors", 0),
                    "label": d.get("label", "General Routing"),
                    "alerts": d.get("alerts", 0),
                    "color": d.get("color", "#6c5ce7")
                })
            else:
                cleaned_domains.append({
                    "domain": str(d),
                    "visitors": 0,
                    "label": "General Domain",
                    "alerts": 0,
                    "color": "#6c5ce7"
                })
                
        # Generate the TS content
        ts_content = f"""// AUTO-GENERATED UNYKORN MASTER REGISTRY ARCHIVE
// Compiled from C:\\Users\\Kevan\\unykorn-ops\\data\\platform-hub\\registry.json

export interface RegistrySite {{
  id: string;
  name: string;
  system: string;
  category: string;
  url: string;
  status: string;
  web3?: string;
}}

export interface RegistryDomain {{
  domain: string;
  visitors: number;
  label: string;
  alerts: number;
  color: string;
}}

export const REGISTRY_DOMAINS: RegistryDomain[] = {json.dumps(cleaned_domains, indent=2)};

export const REGISTRY_SITES: RegistrySite[] = {json.dumps(cleaned_sites, indent=2)};
"""
        
        # Ensure lib directory exists
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(ts_content)
            
        print(f"Successfully compiled {len(cleaned_sites)} sites and {len(cleaned_domains)} domains to lib/registryArchive.ts")
        
    except Exception as e:
        print("Compile Error:", e)

if __name__ == '__main__':
    main()
