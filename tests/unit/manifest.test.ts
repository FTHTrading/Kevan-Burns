import { describe, it, expect } from "vitest";
import { buildManifest, verifyManifestHash } from "@/lib/vault/manifest";

const baseData = {
  vaultId: "vault-test-001",
  ownerDID: "did:key:z6MkTest",
  generatedAt: "2026-05-07T00:00:00.000Z",
  version: 1,
  walletCount: 2,
  assetCount: 3,
  documentCount: 1,
  executorDIDs: ["did:key:exec1"],
  beneficiaryDIDs: ["did:key:ben1"],
  guardianDIDs: ["did:key:g1", "did:key:g2"],
  releasePolicyId: "policy-default",
  assetSummaries: [
    { id: "a1", category: "CRYPTO_EXCHANGE", label: "Coinbase" },
  ],
  documentSummaries: [
    { id: "d1", type: "WILL", label: "Last Will", cid: "bafybei-test" },
  ],
  walletSummaries: [
    { id: "w1", chain: "ethereum", publicAddress: "0xABC", label: "Main" },
  ],
};

describe("vault manifest", () => {
  it("buildManifest returns non-empty JSON and 64-char hash", async () => {
    const { json, hash } = await buildManifest(baseData);
    expect(json).toBeTruthy();
    expect(hash).toHaveLength(64);
  });

  it("manifest JSON contains vaultId", async () => {
    const { json } = await buildManifest(baseData);
    expect(json).toContain("vault-test-001");
  });

  it("verifyManifestHash passes for correct hash", async () => {
    const { json, hash } = await buildManifest(baseData);
    expect(await verifyManifestHash(json, hash)).toBe(true);
  });

  it("verifyManifestHash fails for wrong hash", async () => {
    const { json } = await buildManifest(baseData);
    expect(await verifyManifestHash(json, "0".repeat(64))).toBe(false);
  });

  it("manifest hash changes when version changes", async () => {
    const { hash: h1 } = await buildManifest({ ...baseData, version: 1 });
    const { hash: h2 } = await buildManifest({ ...baseData, version: 2 });
    expect(h1).not.toBe(h2);
  });

  it("manifest does not include raw private keys or seed phrases", async () => {
    const { json } = await buildManifest(baseData);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const flatJson = json.toLowerCase();
    expect(flatJson).not.toContain("privatekey");
    expect(flatJson).not.toContain("seedphrase");
    expect(flatJson).not.toContain("mnemonic");
  });
});
