import os
import re

routes = [
    "/admin/audit",
    "/api/affiliate/claim",
    "/api/affiliate/stats",
    "/api/agents",
    "/api/ai/cf-test",
    "/api/ai/test",
    "/api/alerts",
    "/api/audit/events",
    "/api/auth/[...nextauth]",
    "/api/auth/register",
    "/api/docs/generate",
    "/api/docs/verify",
    "/api/export/[type]",
    "/api/gated/insight",
    "/api/gated/verify-affiliate",
    "/api/genesis/health",
    "/api/health/secure",
    "/api/health",
    "/api/mint-troptions",
    "/api/namespaces/register",
    "/api/onboard",
    "/api/ops/email",
    "/api/ops/estate-ai",
    "/api/partners/attorney",
    "/api/payments/checkout",
    "/api/payments/confirm-onchain",
    "/api/payments/success",
    "/api/payments/webhook",
    "/api/payments/x402",
    "/api/rwa/manifest",
    "/api/rwa/provenance/[tokenId]",
    "/api/system/status",
    "/api/tts",
    "/api/vault/checkin",
    "/api/vault/create",
    "/api/vault/manifest",
    "/api/vault/messages",
    "/api/vault/release/approve",
    "/api/vault/release/attest",
    "/api/vault/release/dispute",
    "/api/vault/release/request",
    "/api/vault/switch",
    "/api/vault/upload",
    "/api/vault/wallets/mint",
    "/api/vault/wallets",
    "/api/vc/issue/asset-provenance",
    "/api/vc/issue/gem-asset",
    "/api/vc/present/bbs",
    "/api/vc/present/selective",
    "/api/vc/verify/bbs",
    "/api/vc/verify/presentation",
    "/api/voice/ask",
    "/api/voice/page-narration",
    "/beneficiary",
    "/executor/review",
    "/go/[partner]",
    "/namespaces",
    "/vault/assets",
    "/vault/beneficiaries",
    "/vault/create",
    "/vault/documents",
    "/vault/executors",
    "/vault/release-policy",
    "/vault/wallets",
    "/vault"
]

base_dir = r"C:\Users\Kevan\legacy-vault-protocol\app"

def find_file_for_route(route):
    # route could be a page or api route
    # e.g., /admin/audit -> app/admin/audit/page.tsx or page.ts
    # /api/affiliate/claim -> app/api/affiliate/claim/route.ts or route.tsx
    rel_path = route.lstrip("/")
    
    # Try api route first if /api/
    if rel_path.startswith("api/"):
        candidates = [
            os.path.join(base_dir, rel_path, "route.ts"),
            os.path.join(base_dir, rel_path, "route.tsx")
        ]
    else:
        candidates = [
            os.path.join(base_dir, rel_path, "page.tsx"),
            os.path.join(base_dir, rel_path, "page.ts"),
            os.path.join(base_dir, rel_path, "route.ts"),
            os.path.join(base_dir, rel_path, "route.tsx")
        ]
        
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

modified_count = 0
uncommented_count = 0
added_count = 0

for route in routes:
    filepath = find_file_for_route(route)
    if not filepath:
        print(f"Could not find file for route: {route}")
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Check if edge runtime is already uncommented
    if re.search(r"^\s*export\s+const\s+runtime\s*=\s*['\"]edge['\"]\s*;?", content, re.MULTILINE):
        # Already active
        continue
        
    # Check if commented out
    commented_pattern = r"//\s*export\s+const\s+runtime\s*=\s*['\"]edge['\"]\s*;?"
    if re.search(commented_pattern, content):
        # Uncomment it
        new_content = re.sub(commented_pattern, "export const runtime = 'edge';", content)
        with open(filepath, "w", encoding="utf-8", newline="\n") as f:
            f.write(new_content)
        print(f"Uncommented edge runtime in: {filepath}")
        uncommented_count += 1
        modified_count += 1
    else:
        # Prepend to the file
        new_content = "export const runtime = 'edge';\n" + content
        with open(filepath, "w", encoding="utf-8", newline="\n") as f:
            f.write(new_content)
        print(f"Added edge runtime to: {filepath}")
        added_count += 1
        modified_count += 1

print(f"Done! Modified {modified_count} files (Uncommented: {uncommented_count}, Added: {added_count}).")
