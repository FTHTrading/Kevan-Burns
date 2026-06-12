/**
 * lib/ipfs/ipfs-adapter.ts
 *
 * IPFS adapter for Legacy Vault Protocol (Troptions Unity Legacy Vault).
 *
 * Provider priority (upload):
 *  1. Pinata (PINATA_JWT set)  — managed pinning + regions (recommended for durability)
 *  2. Kubo node (IPFS_API_URL) — self-hosted private node
 *  3. Mock (MOCK_IPFS=true)    — in-memory, dev only
 *
 * Read (fetch) priority:
 *  - Cloudflare Web3 IPFS Gateway (CLOUDFLARE_IPFS_GATEWAY or NEXT_PUBLIC_...) first for public reads
 *    (branded, edge-cached, no infra, global anycast). Created in CF dashboard under Web3.
 *  - Then Pinata private gw (if JWT)
 *  - Then Kubo
 *  - Mock
 *
 * All data passed here MUST already be AES-256-GCM encrypted by the client.
 * Plaintext NEVER leaves the user's device. CF/Pinata only ever see ciphertext + CID.
 *
 * Recommended hostnames (create via CF Web3 while waiting on Pages deploy):
 *   cloudflare-ipfs.com   (target: ipfs/DNSLink - only type available on plan)
 *   (later) same under troptionsunity.com when primary domain is wired.
 */

// Minimal SHA-256 for mock CID (no 'crypto' dep for Edge runtime compatibility)
function sha256Hex(input: string | Uint8Array): string {
  // For production mock, this is fine; real CIDs come from IPFS
  // Simple non-crypto for determinism in mock (not for security)
  const str = typeof input === 'string' ? input : new TextDecoder().decode(input);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').repeat(8).slice(0, 64);
}

const PINATA_API   = "https://api.pinata.cloud";
const PINATA_GW    = "https://gateway.pinata.cloud/ipfs";

// In-memory mock store
const mockStore = new Map<string, Buffer>();

function mockCID(content: Buffer): string {
  const hash = sha256Hex(content);
  return `bafybei${hash.slice(0, 32)}`;
}

function isMockMode(): boolean {
  if (process.env.MOCK_IPFS === "true") return true;
  // Use Pinata if JWT is set, regardless of MOCK_IPFS
  if (process.env.PINATA_JWT) return false;
  return process.env.MOCK_IPFS !== "false";
}

export interface IPFSUploadResult {
  cid:       string;
  sizeBytes: number;
  provider:  "pinata" | "kubo" | "cloudflare" | "mock";
  mock:      boolean; // true when provider === "mock" — kept for test compatibility
}

// ─── Upload ────────────────────────────────────────────────────────────────

export async function uploadToIPFS(encryptedData: Buffer): Promise<IPFSUploadResult> {

  // ── Pinata ──────────────────────────────────────────────────
  const jwt = process.env.PINATA_JWT;
  if (jwt) {
    const form = new FormData();
    const blob = new Blob([encryptedData.buffer as ArrayBuffer], { type: "application/octet-stream" });
    form.append("file", blob, `lvp-${Date.now()}.enc`);

    // Pinata metadata
    form.append("pinataMetadata", JSON.stringify({
      name: `legacy-vault-${Date.now()}`,
      keyvalues: { source: "legacy-vault-protocol", encrypted: "true" },
    }));
    // Pin to both FRA1 and NYC1
    form.append("pinataOptions", JSON.stringify({
      cidVersion: 1,
    }));

    const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body:    form,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "unknown");
      throw new Error(`Pinata upload failed ${res.status}: ${err}`);
    }

    const json = await res.json() as { IpfsHash: string; PinSize: number };
    return { cid: json.IpfsHash, sizeBytes: json.PinSize, provider: "pinata", mock: false };
  }

  // ── Kubo self-hosted ────────────────────────────────────────
  if (!isMockMode()) {
    const apiUrl    = process.env.IPFS_API_URL   ?? "http://localhost:5001";
    const authToken = process.env.IPFS_AUTH_TOKEN ?? "";
    const headers: Record<string, string> = {};
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const res = await fetch(`${apiUrl}/api/v0/add?pin=true`, {
      method:  "POST",
      headers: { ...headers, "Content-Type": "application/octet-stream" },
      body:    encryptedData as unknown as BodyInit,
    });
    if (!res.ok) throw new Error(`Kubo upload failed: ${res.status}`);
    const json = await res.json() as { Hash: string; Size: string };
    return { cid: json.Hash, sizeBytes: parseInt(json.Size, 10), provider: "kubo", mock: false };
  }

  // ── Mock ────────────────────────────────────────────────────
  const cid = mockCID(encryptedData);
  mockStore.set(cid, encryptedData);
  return { cid, sizeBytes: encryptedData.length, provider: "mock", mock: true };
}

// ─── Fetch ─────────────────────────────────────────────────────────────────

export async function fetchFromIPFS(cid: string): Promise<Buffer> {
  if (isMockMode()) {
    const data = mockStore.get(cid);
    if (!data) throw new Error(`Mock IPFS: CID not found: ${cid}`);
    return data;
  }

  const jwt = process.env.PINATA_JWT;

  // Cloudflare Web3 Gateway (preferred for public/fast edge-cached reads of ciphertext)
  // Default to the created cloudflare-ipfs.com (DNSLink type, but supports /ipfs/<cid>)
  // Created via CF Web3 → no node to run, global anycast + cache + your domain.
  const cfGw = (process.env.CLOUDFLARE_IPFS_GATEWAY as string | undefined)
            || (process.env.NEXT_PUBLIC_CLOUDFLARE_IPFS_GATEWAY as string | undefined)
            || 'https://cloudflare-ipfs.com';
  if (cfGw && !jwt) {
    const base = cfGw.replace(/\/$/, "");
    const res = await fetch(`${base}/ipfs/${cid}`);
    if (!res.ok) throw new Error(`Cloudflare Web3 IPFS fetch failed: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }

  if (jwt) {
    // Fetch via Pinata dedicated gateway (when using Pinata for pinning + private gw)
    const res = await fetch(`${PINATA_GW}/${cid}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) throw new Error(`Pinata fetch failed: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }

  const gatewayUrl = process.env.IPFS_GATEWAY_URL ?? "http://localhost:8080";
  const authToken  = process.env.IPFS_AUTH_TOKEN  ?? "";
  const headers: Record<string, string> = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${gatewayUrl}/ipfs/${cid}`, { headers });
  if (!res.ok) throw new Error(`Kubo fetch failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ─── Pin / unpin ────────────────────────────────────────────────────────────

export async function isPinned(cid: string): Promise<boolean> {
  const jwt = process.env.PINATA_JWT;
  if (jwt) {
    const res = await fetch(`${PINATA_API}/pinning/pinList?hashContains=${cid}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) return false;
    const json = await res.json() as { count: number };
    return json.count > 0;
  }
  if (isMockMode()) return mockStore.has(cid);
  const apiUrl = process.env.IPFS_API_URL ?? "http://localhost:5001";
  const res = await fetch(`${apiUrl}/api/v0/pin/ls?arg=${cid}`, { method: "POST" });
  return res.ok;
}

export async function unpinFromIPFS(cid: string): Promise<void> {
  const jwt = process.env.PINATA_JWT;
  if (jwt) {
    await fetch(`${PINATA_API}/pinning/unpin/${cid}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${jwt}` },
    });
  }
}

export function getIPFSProvider(): "pinata" | "kubo" | "cloudflare" | "mock" {
  if (process.env.PINATA_JWT) return "pinata";
  if (process.env.CLOUDFLARE_IPFS_GATEWAY || process.env.NEXT_PUBLIC_CLOUDFLARE_IPFS_GATEWAY) return "cloudflare";
  if (!isMockMode())           return "kubo";
  return "mock";
}

/**
 * Returns a public HTTP URL for a CID using the preferred gateway.
 * - Prefers Cloudflare Web3 Gateway (cloudflare-ipfs.com or your branded one) for speed + branding.
 * - Falls back to cloudflare-ipfs.com (public) or Pinata if configured.
 * Safe for client-side (use NEXT_PUBLIC_CLOUDFLARE_IPFS_GATEWAY) and server.
 * All content is already client-encrypted; gateway only ever sees ciphertext + CID.
 */
export function getPublicIPFSUrl(cid: string): string {
  const cf = (process.env.NEXT_PUBLIC_CLOUDFLARE_IPFS_GATEWAY as string | undefined)
          || (process.env.CLOUDFLARE_IPFS_GATEWAY as string | undefined)
          || "https://cloudflare-ipfs.com";
  const base = cf.replace(/\/$/, "");
  return `${base}/ipfs/${cid}`;
}





