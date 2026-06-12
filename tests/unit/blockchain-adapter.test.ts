import { describe, it, expect } from "vitest";
import {
  registerVault,
  updateManifest,
  setVaultStatus,
  getChainVault,
  getChainEvents,
  anchorAuditEvent,
} from "@/lib/blockchain/registry-adapter";

describe("blockchain registry-adapter (mock mode)", () => {
  const vaultId = `vault-chain-test-${Date.now()}`;

  it("registerVault returns a txHash", async () => {
    const result = await registerVault({
      vaultId,
      ownerDID: "did:key:owner",
      manifestCID: "bafybei-mock-manifest",
      manifestHash: "a".repeat(64),
      releasePolicyId: "policy-1",
    });
    expect(result.txHash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("getChainVault returns the registered vault", async () => {
    const record = await getChainVault(vaultId);
    expect(record).not.toBeNull();
    expect(record?.vaultId).toBe(vaultId);
    expect(record?.status).toBe("ACTIVE");
  });

  it("updateManifest changes the CID", async () => {
    const newCID = "bafybei-updated-cid";
    await updateManifest({ vaultId, newCID, newHash: "b".repeat(64) });
    const record = await getChainVault(vaultId);
    expect(record?.encryptedManifestCID).toBe(newCID);
  });

  it("setVaultStatus transitions to REVIEW_PENDING", async () => {
    await setVaultStatus(vaultId, "REVIEW_PENDING");
    const record = await getChainVault(vaultId);
    expect(record?.status).toBe("REVIEW_PENDING");
  });

  it("getChainEvents returns events for the vault", async () => {
    const events = await getChainEvents(vaultId);
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.vaultId === vaultId)).toBe(true);
  });

  it("anchorAuditEvent returns a txHash", async () => {
    const result = await anchorAuditEvent({
      vaultId,
      eventId: "ev-001",
      eventHash: "c".repeat(64),
    });
    expect(result.txHash).toMatch(/^0x[0-9a-f]{64}$/);
  });
});
