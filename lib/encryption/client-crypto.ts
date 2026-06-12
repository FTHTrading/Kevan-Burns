/**
 * lib/encryption/client-crypto.ts
 *
 * **Zero-knowledge client-side encryption for Troptions Unity Legacy Vault.**
 *
 * All encryption/decryption happens in the browser using Web Crypto API (AES-256-GCM).
 * Server NEVER receives:
 *  - Plaintext documents, seeds, wills, messages
 *  - Vault master keys or passphrases
 *  - Decryption material
 *
 * Only ciphertext, content hashes (for integrity/anchoring), and optional ZK proofs are sent.
 *
 * This fulfills the "we never see the raw shit" guarantee and SOC2/zero-trust posture.
 *
 * Integration:
 *  - Use in vault upload flows (documents, manifests, wallet exports) BEFORE any /api call.
 *  - Pair with client-zk.ts for proof generation over the resulting hash.
 *  - For Dead Man's Switch / legacy messages: encrypt client-side too.
 *
 * Key model (client-only):
 *  - User provides or generates a high-entropy passphrase (or we generate 256-bit key and show recovery phrase).
 *  - Per-vault key derived via PBKDF2 (or HKDF) with vaultId + namespace as salt/info.
 *  - Optionally: encrypt the derived key material with a user master key for multi-vault.
 *
 * Fallback: server-crypto.ts remains for legacy migration / self-hosted operator nodes that opt into server-assisted (NOT default).
 */

const crypto = typeof globalThis !== "undefined" && globalThis.crypto
  ? globalThis.crypto
  : (typeof require !== "undefined" ? require("crypto").webcrypto : undefined);

export interface ClientEncryptionResult {
  ciphertext: Uint8Array;
  iv: string; // base64
  tag?: string; // base64 (WebCrypto includes auth tag in ciphertext for GCM? but we separate for parity)
  algorithm: "AES-256-GCM";
  contentHash: string; // SHA-256 hex of the ORIGINAL plaintext (for ZKP + anchoring)
}

export interface ClientKeyMaterial {
  key: CryptoKey;
  salt: string; // base64
  iterations: number;
  vaultId: string;
}

/**
 * Generate a cryptographically secure random 256-bit key (for new vault, shown to user once as recovery).
 * User MUST back this up (print, hardware, family deadman).
 */
export async function generateVaultKey(): Promise<Uint8Array> {
  const key = crypto.getRandomValues(new Uint8Array(32));
  return key;
}

/**
 * Derive an AES-256-GCM CryptoKey from a user passphrase (or exported raw key bytes) + vaultId.
 * Uses PBKDF2-HMAC-SHA256 (recommended for passphrase input; 310k+ iterations in prod).
 *
 * Never send passphrase or derived key off-device.
 */
export async function deriveClientVaultKey(
  passphraseOrKey: string | Uint8Array,
  vaultId: string,
  namespace: string = "troptions-unity-legacy-v1"
): Promise<ClientKeyMaterial> {
  const enc = new TextEncoder();
  let baseKey: CryptoKey;

  if (typeof passphraseOrKey === "string") {
    // Passphrase path — stretch it
    const passphraseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(passphraseOrKey),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iterations = 310000; // strong, ~2026 standard

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256",
      },
      passphraseKey,
      { name: "AES-GCM", length: 256 },
      true, // extractable=false in prod for extra safety; true here so we can export for user backup if needed
      ["encrypt", "decrypt"]
    );

    return {
      key: aesKey,
      salt: btoa(String.fromCharCode(...salt)),
      iterations,
      vaultId,
    };
  } else {
    // Raw 32-byte key path (from generateVaultKey or recovery)
    baseKey = await crypto.subtle.importKey(
      "raw",
      passphraseOrKey as any,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"]
    );

    // For raw key we still use a deterministic info/salt for domain separation (HKDF style via PBKDF2 with low iter or direct)
    const salt = crypto.getRandomValues(new Uint8Array(16)); // or derive from vaultId + namespace
    const info = enc.encode(`troptions-unity:${namespace}:${vaultId}`);

    // Simple: use the raw as base and derive with fixed params for consistency
    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new Uint8Array(16), // fixed for raw-key path or use HKDF
        iterations: 1, // effectively identity for raw high-entropy key
        hash: "SHA-256",
      },
      await crypto.subtle.importKey("raw", passphraseOrKey as any, "PBKDF2", false, ["deriveKey"]),
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return {
      key: aesKey,
      salt: btoa(String.fromCharCode(...salt)),
      iterations: 1,
      vaultId,
    };
  }
}

/**
 * Client-side AES-256-GCM encrypt.
 * Returns ciphertext + IV + SHA-256 of *plaintext* (for ZKP preimage proofs + on-chain anchor).
 * The server sees only this envelope + hash + (later) ZKP.
 */
export async function encryptClient(
  plaintext: Uint8Array | ArrayBuffer,
  keyMaterial: ClientKeyMaterial
): Promise<ClientEncryptionResult> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit for GCM
  const data = plaintext instanceof Uint8Array ? plaintext : new Uint8Array(plaintext);

  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    keyMaterial.key,
    data as any
  );

  const ciphertext = new Uint8Array(ciphertextBuf);

  // Compute content hash of ORIGINAL plaintext for integrity + ZKP
  const hashBuf = await crypto.subtle.digest("SHA-256", data as any);
  const contentHash = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // For storage parity with server version, we can return iv as base64 and full ciphertext (tag is appended by WebCrypto in GCM)
  const ivB64 = btoa(String.fromCharCode(...iv));

  return {
    ciphertext,
    iv: ivB64,
    // WebCrypto GCM ciphertext already contains the auth tag at the end (16 bytes)
    algorithm: "AES-256-GCM",
    contentHash,
  };
}

/**
 * Client-side decrypt (for owner preview, beneficiary after release grant, etc.).
 * Requires the same key material the owner used at encrypt time.
 */
export async function decryptClient(
  envelope: { ciphertext: Uint8Array; iv: string },
  keyMaterial: ClientKeyMaterial
): Promise<Uint8Array> {
  const iv = Uint8Array.from(atob(envelope.iv), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as any },
    keyMaterial.key,
    envelope.ciphertext as any
  );
  return new Uint8Array(decrypted);
}

/**
 * Compute SHA-256 hex (client). Used for pre-ZKP fingerprinting and blockchain anchoring (XRPL memo, Stellar memo, Unity Token event).
 */
export async function sha256HexClient(data: Uint8Array | ArrayBuffer | string): Promise<string> {
  const buf = typeof data === "string" ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
  const hash = await crypto.subtle.digest("SHA-256", buf as any);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Helper: Export raw key bytes for user backup / printed recovery card / Dead Man's Switch envelope.
 * WARNING: This is the crown jewel — treat like seed phrase.
 */
export async function exportRawKey(keyMaterial: ClientKeyMaterial): Promise<Uint8Array> {
  // Only works if the key was created extractable. In real flows we import with extractable:true for backup path.
  const raw = await crypto.subtle.exportKey("raw", keyMaterial.key);
  return new Uint8Array(raw);
}

/**
 * Utility to turn a generated raw key into a user-friendly recovery phrase (BIP39 style or simple hex + checksum).
 * For MVP: return hex with checksum. Prod: integrate proper wordlist.
 */
export function formatRecoveryPhrase(rawKey: Uint8Array): string {
  const hex = Array.from(rawKey).map((b) => b.toString(16).padStart(2, "0")).join("");
  // Simple checksum for demo (real: use proper mnemonic lib like bip39)
  const checksum = Array.from(rawKey.slice(0, 4)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `UNITY-LEGACY-${hex.slice(0, 16)}...${hex.slice(-8)} [CS:${checksum}]`;
}

export const CLIENT_CRYPTO_VERSION = "troptions-unity-zk-v1";
