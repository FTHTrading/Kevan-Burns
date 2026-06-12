import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("LegacyVaultRegistry", function () {
  let registry: any;
  let owner: any;
  let operator: any;
  let other: any;

  beforeEach(async function () {
    [owner, operator, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("LegacyVaultRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();
    await registry.addOperator(operator.address);
  });

  it("deploys with owner set", async function () {
    expect(await registry.owner()).to.equal(owner.address);
  });

  it("registers a vault and emits VaultCreated", async function () {
    const manifestHash = ethers.keccak256(ethers.toUtf8Bytes("manifest-v1"));
    await expect(
      registry.connect(operator).registerVault(
        "vault-001",
        "did:key:z6Mk123",
        "ipfs://QmABC",
        manifestHash,
        "policy-001"
      )
    ).to.emit(registry, "VaultCreated");
  });

  it("prevents duplicate vault registration", async function () {
    const manifestHash = ethers.keccak256(ethers.toUtf8Bytes("manifest-v1"));
    await registry.connect(operator).registerVault("vault-dup", "did:key:z6Mk1", "ipfs://Qm1", manifestHash, "p1");
    await expect(
      registry.connect(operator).registerVault("vault-dup", "did:key:z6Mk2", "ipfs://Qm2", manifestHash, "p2")
    ).to.be.revertedWith("LVR: vault already registered");
  });

  it("updates manifest and emits ManifestUpdated", async function () {
    const h1 = ethers.keccak256(ethers.toUtf8Bytes("v1"));
    const h2 = ethers.keccak256(ethers.toUtf8Bytes("v2"));
    await registry.connect(operator).registerVault("vault-u1", "did:key:abc", "ipfs://Qm1", h1, "p1");

    await expect(
      registry.connect(operator).updateManifest("vault-u1", "ipfs://Qm2", h2)
    ).to.emit(registry, "ManifestUpdated");

    const v = await registry.getVault("vault-u1");
    expect(v.encryptedManifestCID).to.equal("ipfs://Qm2");
    expect(v.manifestHash).to.equal(h2);
  });

  it("sets vault status and emits VaultStatusChanged", async function () {
    const h = ethers.keccak256(ethers.toUtf8Bytes("m"));
    await registry.connect(operator).registerVault("vault-s1", "did:key:x", "ipfs://Qmx", h, "p");

    await expect(
      registry.connect(operator).setVaultStatus("vault-s1", 1) // REVIEW_PENDING
    ).to.emit(registry, "VaultStatusChanged");

    expect(await registry.getVaultStatus("vault-s1")).to.equal(1);
  });

  it("anchors audit events", async function () {
    const h = ethers.keccak256(ethers.toUtf8Bytes("m"));
    await registry.connect(operator).registerVault("vault-a1", "did:key:y", "ipfs://Qmy", h, "p");

    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("audit-payload"));
    await expect(
      registry.connect(operator).anchorAuditEvent("vault-a1", "evt-001", eventHash)
    ).to.emit(registry, "AuditEventAnchored");
  });

  it("rejects non-operator calls", async function () {
    const h = ethers.keccak256(ethers.toUtf8Bytes("m"));
    await expect(
      registry.connect(other).registerVault("vault-x", "did:key:z", "ipfs://Qmz", h, "p")
    ).to.be.revertedWith("LVR: not operator");
  });
});
