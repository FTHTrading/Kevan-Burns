import urllib.request
import json
import os

token = "cfut_YOUR_CLOUDFLARE_API_TOKEN"
account_id = "07bcc4a189ef176261b818409c95891f"
project = "troptions-unity-legacy-vault"

# Read local .env keys to inject
local_env = {}
env_path = "C:\\Users\\Kevan\\legacy-vault-protocol\\.env"
if os.path.exists(env_path):
    print("Reading env keys from:", env_path)
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            parts = line.split("=", 1)
            k = parts[0].strip()
            v = parts[1].strip().strip("\"'")
            local_env[k] = v
else:
    print("WARNING: Local .env file not found!")

# Keys to sync
keys_to_sync = [
    "GEMINI_API_KEY",
    "XAI_API_KEY",
    "STELLAR_SECRET_KEY",
    "STELLAR_NETWORK",
    "XRPL_WALLET_SEED",
    "XRPL_NETWORK",
    "SOLANA_PRIVATE_KEY",
    "SOLANA_NETWORK",
    "HELIUS_API_KEY",
    "EVM_TREASURY_ADDRESS",
    "EVM_TREASURY_PRIVATE_KEY",
    "POLYGON_RPC_URL",
    "ETHEREUM_RPC_URL",
    "CHAIN_RPC_URL"
]

# Fetch current config
req_get = urllib.request.Request(
    f"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project}",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req_get) as response:
        project_data = json.loads(response.read().decode()).get("result", {})
    
    deployment_configs = project_data.get("deployment_configs", {})
    
    # Update env vars for both production and preview
    for env_name in ["production", "preview"]:
        env_config = deployment_configs.setdefault(env_name, {})
        current_vars = env_config.setdefault("env_vars", {})
        
        # Merge or add required keys
        for k in keys_to_sync:
            if k in local_env:
                current_vars[k] = {"value": local_env[k], "type": "plain_text"}
                print(f"Set variable in {env_name}: {k}")
                
        # Force MOCK_CHAIN = true (we want mock EVM node but live Stellar/XRPL)
        current_vars["MOCK_CHAIN"] = {"value": "true", "type": "plain_text"}
        print(f"Force variable in {env_name}: MOCK_CHAIN = true")

    # Prepare PATCH payload
    payload = {"deployment_configs": deployment_configs}
    
    req_patch = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project}",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        data=json.dumps(payload).encode(),
        method="PATCH"
    )
    
    with urllib.request.urlopen(req_patch) as response:
        patch_res = json.loads(response.read().decode())
        if patch_res.get("success"):
            print("Successfully updated Cloudflare Pages project environment variables!")
            print("Active environment variables on production:", list(deployment_configs["production"]["env_vars"].keys()))
        else:
            print("Failed to update config:", patch_res.get("errors"))
            
except Exception as e:
    print("Error during configuration sync:", e)
