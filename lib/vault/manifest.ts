/**
 * lib/vault/manifest.ts
 *
 * Vault manifest generator.
 * The manifest is a JSON document summarizing the vault contents.
 * It is encrypted before IPFS upload — the raw manifest never leaves
 * the owner's environment unencrypted.
 */

import { sha256Hex } from "@/lib/encryption/vault-crypto";

export interface VaultManifestContent {
  vaultId: string;
  ownerDID: string | null;
  generatedAt: string;
  version: number;
  walletCount: number;
  assetCount: number;
  documentCount: number;
  executorDIDs: (string | null)[];
  beneficiaryDIDs: (string | null)[];
  guardianDIDs: (string | null)[];
  releasePolicyId: string | null;
  /// Asset summaries — no account numbers or secrets
  assetSummaries: Array<{
    id: string;
    category: string;
    label: string;
  }>;
  /// Document type list — no file content
  documentSummaries: Array<{
    id: string;
    type: string;
    label: string;
    cid: string;
  }>;
  /// Wallet chain + address only — no private keys
  walletSummaries: Array<{
    id: string;
    chain: string;
    publicAddress: string;
    label: string | null;
  }>;
}

/**
 * Build a manifest JSON string from vault data.
 * Returns the manifest and its SHA-256 hash.
 */
export async function buildManifest(data: VaultManifestContent): Promise<{
  json: string;
  hash: string;
}> {
  const json = JSON.stringify(data, null, 2);
  const hash = await sha256Hex(json);
  return { json, hash };
}

/**
 * Verify a manifest hash matches the provided JSON.
 */
export async function verifyManifestHash(json: string, expectedHash: string): Promise<boolean> {
  const h = await sha256Hex(json);
  return h === expectedHash;
}
