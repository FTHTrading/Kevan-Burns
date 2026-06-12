/**
 * lib/encryption/vault-crypto.ts
 *
 * AES-256-GCM encryption for vault documents and manifests.
 * **Legacy / server-assisted path.**
 *
 * For Troptions Unity Legacy Vault sovereign zero-knowledge mode:
 *   → Use lib/encryption/client-crypto.ts (browser Web Crypto API) exclusively.
 *   → Server receives ONLY ciphertext + contentHash + (ZK proof).
 *   → This file remains for:
 *       - Self-hosted operator nodes that opt into server-side assist
 *       - Migration of old vaults
 *       - Certain admin/auditor export flows (with explicit owner re-encryption consent)
 *
 * New uploads should prefer client-crypto + zk/client-zk.ts.
 *
 * Key derivation uses HKDF-SHA-256 (RFC 5869).
 */

const crypto = typeof globalThis !== "undefined" && globalThis.crypto
  ? globalThis.crypto
  : (typeof require !== "undefined" ? require("crypto").webcrypto : undefined);

function randomBytesEdge(len: number): Uint8Array {
  if (!crypto) throw new Error("Web Crypto API (crypto) is not defined in this environment");
  return crypto.getRandomValues(new Uint8Array(len));
}

async function sha256HexEdge(data: Uint8Array | string): Promise<string> {
  const buf = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", buf as any);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function hkdfSha256Edge(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm as any, { name: "HKDF" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: salt as any, info: info as any },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

async function aesGcmEncryptEdge(plaintext: Uint8Array, key: Uint8Array, nonce: Uint8Array): Promise<{ ciphertext: Uint8Array; tag: Uint8Array }> {
  const cryptoKey = await crypto.subtle.importKey("raw", key as any, { name: "AES-GCM" }, false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce as any },
    cryptoKey,
    plaintext as any
  );
  const ct = new Uint8Array(encrypted);
  // In WebCrypto GCM, the tag is appended to ciphertext (16 bytes)
  const tag = ct.slice(ct.length - 16);
  const ciphertext = ct.slice(0, ct.length - 16);
  return { ciphertext, tag };
}

async function aesGcmDecryptEdge(ciphertext: Uint8Array, key: Uint8Array, nonce: Uint8Array, tag: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", key as any, { name: "AES-GCM" }, false, ["decrypt"]);
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce as any },
    cryptoKey,
    combined as any
  );
  return new Uint8Array(decrypted);
}

export interface EncryptionResult {
  ciphertext: Buffer;
  nonce: string; // hex
  algorithm: "AES-256-GCM";
}

export interface EncryptionKey {
  keyId: string;
  keyHex: string; // 32-byte hex
}

/**
 * Derive a per-vault AES-256 key from the master secret using HKDF-SHA-256 (Web Crypto).
 */
export async function deriveVaultKey(masterKeyHex: string, vaultId: string): Promise<EncryptionKey> {
  const ikm = new Uint8Array(Buffer.from(masterKeyHex, "hex")); // Buffer ok in edge with polyfill
  const salt = new TextEncoder().encode("legacy-vault-protocol-v1");
  const info = new TextEncoder().encode(`vault-key:${vaultId}`);

  const keyBuf = await hkdfSha256Edge(ikm, salt, info, 32);

  const keyId = (await sha256HexEdge(vaultId)).slice(0, 16);

  return {
    keyId,
    keyHex: Array.from(keyBuf).map(b => b.toString(16).padStart(2, "0")).join(""),
  };
}

/**
 * Encrypt plaintext bytes using AES-256-GCM.
 * PLACEHOLDER — returns a mock envelope in dev mode.
 */
export async function encryptBlob(
  data: Buffer | Uint8Array,
  key: EncryptionKey
): Promise<EncryptionResult> {
  const dataU8 = data instanceof Uint8Array ? data : new Uint8Array(data);

  if (process.env.MOCK_IPFS === "true") {
    // Mock mode: just base64-wrap the data (NOT secure — dev only)
    return {
      ciphertext: Buffer.from("[MOCK_ENCRYPTED]" + Buffer.from(dataU8).toString("base64")),
      nonce: "00".repeat(12),
      algorithm: "AES-256-GCM",
    };
  }

  const nonce = randomBytesEdge(12);
  const keyBuf = new Uint8Array(Buffer.from(key.keyHex, "hex"));
  const { ciphertext: ct, tag } = await aesGcmEncryptEdge(dataU8, keyBuf, nonce);
  const ciphertext = Buffer.concat([Buffer.from(tag), Buffer.from(ct)]);

  return {
    ciphertext,
    nonce: Array.from(nonce).map(b => b.toString(16).padStart(2, "0")).join(""),
    algorithm: "AES-256-GCM",
  };
}

/**
 * Decrypt an AES-256-GCM envelope.
 */
export async function decryptBlob(
  envelope: EncryptionResult,
  key: EncryptionKey
): Promise<Buffer> {
  if (process.env.MOCK_IPFS === "true") {
    const b64 = envelope.ciphertext.toString().replace("[MOCK_ENCRYPTED]", "");
    return Buffer.from(b64, "base64");
  }

  const keyBuf = new Uint8Array(Buffer.from(key.keyHex, "hex"));
  const nonceBuf = new Uint8Array(Buffer.from(envelope.nonce, "hex"));
  const tag = new Uint8Array(envelope.ciphertext.subarray(0, 16));
  const ciphertext = new Uint8Array(envelope.ciphertext.subarray(16));
  const plain = await aesGcmDecryptEdge(ciphertext, keyBuf, nonceBuf, tag);
  return Buffer.from(plain);
}

/**
 * Compute SHA-256 hex of any buffer (Web Crypto, async for Edge).
 */
export async function sha256Hex(data: Buffer | Uint8Array | string): Promise<string> {
  const u8 = typeof data === "string" ? new TextEncoder().encode(data) : (data instanceof Buffer ? new Uint8Array(data) : data);
  return sha256HexEdge(u8);
}
