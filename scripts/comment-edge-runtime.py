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
    rel_path = route.lstrip("/")
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
commented_count = 0

for route in routes:
    filepath = find_file_for_route(route)
    if not filepath:
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Pattern to match active export const runtime = 'edge'; or "edge"
    active_pattern = r"^export\s+const\s+runtime\s*=\s*['\"]edge['\"]\s*;?"
    
    if re.search(active_pattern, content, re.MULTILINE):
        # Comment it out
        new_content = re.sub(active_pattern, "// export const runtime = 'edge';", content, flags=re.MULTILINE)
        with open(filepath, "w", encoding="utf-8", newline="\n") as f:
            f.write(new_content)
        print(f"Commented out edge runtime in: {filepath}")
        commented_count += 1
        modified_count += 1

print(f"Done! Commented out edge runtime in {commented_count} files.")
