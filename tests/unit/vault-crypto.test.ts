import { describe, it, expect } from "vitest";
import { sha256Hex, deriveVaultKey, encryptBlob, decryptBlob } from "@/lib/encryption/vault-crypto";

describe("vault-crypto", () => {
  it("sha256Hex produces a 64-char hex string", async () => {
    const hash = await sha256Hex("hello world");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("sha256Hex is deterministic", async () => {
    const a = await sha256Hex("test-input");
    const b = await sha256Hex("test-input");
    expect(a).toBe(b);
  });

  it("sha256Hex differs for different inputs", async () => {
    expect(await sha256Hex("a")).not.toBe(await sha256Hex("b"));
  });

  it("deriveVaultKey returns 64-char hex key", async () => {
    const key = await deriveVaultKey("0".repeat(64), "vault-abc");
    expect(key.keyHex).toHaveLength(64);
    expect(key.keyId).toHaveLength(16);
  });

  it("deriveVaultKey is deterministic", async () => {
    const k1 = await deriveVaultKey("0".repeat(64), "vault-xyz");
    const k2 = await deriveVaultKey("0".repeat(64), "vault-xyz");
    expect(k1.keyHex).toBe(k2.keyHex);
  });

  it("encryptBlob + decryptBlob round-trips in mock mode", async () => {
    process.env.MOCK_IPFS = "true";
    const original = Buffer.from("Hello, estate vault!");
    const key = await deriveVaultKey("0".repeat(64), "vault-round-trip");
    const encrypted = await encryptBlob(original, key);
    const decrypted = await decryptBlob(encrypted, key);
    expect(decrypted.toString()).toBe("Hello, estate vault!");
  });

  it("encryptBlob + decryptBlob round-trips with real AES", async () => {
    process.env.MOCK_IPFS = "false";
    const original = Buffer.from("Encrypted will content");
    const key = await deriveVaultKey("f".repeat(64), "vault-real-aes");
    const encrypted = await encryptBlob(original, key);
    const decrypted = await decryptBlob(encrypted, key);
    expect(decrypted.toString()).toBe("Encrypted will content");
    process.env.MOCK_IPFS = "true";
  });
});
