import { describe, it, expect, beforeEach } from "vitest";
import { uploadToIPFS, fetchFromIPFS, isPinned } from "@/lib/ipfs/ipfs-adapter";

describe("ipfs-adapter (mock mode)", () => {
  beforeEach(() => {
    process.env.MOCK_IPFS = "true";
  });

  it("uploadToIPFS returns a CID and marks as mock", async () => {
    const data = Buffer.from("encrypted manifest bytes");
    const result = await uploadToIPFS(data);
    expect(result.cid).toMatch(/^bafybei/);
    expect(result.sizeBytes).toBe(data.length);
    expect(result.mock).toBe(true);
  });

  it("uploadToIPFS is deterministic for same content", async () => {
    const data = Buffer.from("consistent content");
    const r1 = await uploadToIPFS(data);
    const r2 = await uploadToIPFS(data);
    expect(r1.cid).toBe(r2.cid);
  });

  it("fetchFromIPFS retrieves uploaded content", async () => {
    const original = Buffer.from("retrieve-me");
    const { cid } = await uploadToIPFS(original);
    const retrieved = await fetchFromIPFS(cid);
    expect(retrieved.toString()).toBe("retrieve-me");
  });

  it("fetchFromIPFS throws for unknown CID", async () => {
    await expect(fetchFromIPFS("bafybei-nonexistent-cid")).rejects.toThrow();
  });

  it("isPinned returns true after upload", async () => {
    const { cid } = await uploadToIPFS(Buffer.from("pinned"));
    expect(await isPinned(cid)).toBe(true);
  });

  it("isPinned returns false for unknown CID", async () => {
    expect(await isPinned("bafybei-not-pinned")).toBe(false);
  });
});
