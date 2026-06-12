import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("LegacyPolicyEngine", function () {
  let pe: any;
  let owner: any;
  let op: any;

  beforeEach(async function () {
    [owner, op] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("LegacyPolicyEngine");
    pe = await Factory.deploy();
    await pe.waitForDeployment();
    await pe.addOperator(op.address);
  });

  it("anchors a policy", async function () {
    await expect(
      pe.connect(op).anchorPolicy(
        "vault-1", "policy-1",
        true, true, true, true, 2, 3, 30
      )
    ).to.emit(pe, "PolicyAnchored");

    const pol = await pe.getPolicy("vault-1");
    expect(pol.guardianQuorumN).to.equal(2);
    expect(pol.waitingPeriodDays).to.equal(30);
    expect(pol.exists).to.equal(true);
  });

  it("opens a claim", async function () {
    await pe.connect(op).anchorPolicy("vault-c1", "pol-c1", true, true, true, true, 2, 3, 30);
    await expect(
      pe.connect(op).openClaim("vault-c1", "claim-001", op.address)
    ).to.emit(pe, "ClaimOpened");

    const state = await pe.getClaimState("claim-001");
    expect(state.exists).to.equal(true);
    expect(state.identityVerified).to.equal(false);
  });

  it("satisfies conditions in sequence", async function () {
    await pe.connect(op).anchorPolicy("vault-s1", "pol-s1", true, true, true, true, 1, 2, 0);
    await pe.connect(op).openClaim("vault-s1", "claim-s1", op.address);

    const zeroHash = ethers.ZeroHash;

    // 1 Identity
    await pe.connect(op).satisfyCondition("claim-s1", 0, zeroHash); // EXECUTOR_IDENTITY_VERIFIED
    // 2 Death cert
    await pe.connect(op).satisfyCondition("claim-s1", 1, zeroHash);
    // 3 Attorney
    await pe.connect(op).satisfyCondition("claim-s1", 2, zeroHash);
    // 4 Guardian quorum (N=1)
    await pe.connect(op).satisfyCondition("claim-s1", 3, zeroHash);

    const state = await pe.getClaimState("claim-s1");
    expect(state.identityVerified).to.equal(true);
    expect(state.deathCertUploaded).to.equal(true);
    expect(state.attorneyAttested).to.equal(true);
    expect(state.guardianQuorumMet).to.equal(true);
  });

  it("enforces waiting period", async function () {
    await pe.connect(op).anchorPolicy("vault-w1", "pol-w1", false, false, false, true, 1, 1, 30);
    await pe.connect(op).openClaim("vault-w1", "claim-w1", op.address);

    // Satisfy guardian quorum
    await pe.connect(op).satisfyCondition("claim-w1", 3, ethers.ZeroHash);

    // Waiting period not elapsed → authorise should revert
    await expect(
      pe.connect(op).authoriseRelease("vault-w1", "claim-w1")
    ).to.be.revertedWith("LPE: waiting period active");
  });

  it("disputes freeze and resolve a claim", async function () {
    await pe.connect(op).anchorPolicy("vault-d1", "pol-d1", false, false, false, false, 0, 0, 0);
    await pe.connect(op).openClaim("vault-d1", "claim-d1", op.address);

    await pe.connect(op).raiseDispute("claim-d1", "contested by beneficiary");
    const s = await pe.getClaimState("claim-d1");
    expect(s.disputed).to.equal(true);

    await pe.connect(op).resolveDispute("claim-d1", true);
    const s2 = await pe.getClaimState("claim-d1");
    expect(s2.disputed).to.equal(false);
  });

  it("authorises release when all conditions met", async function () {
    // Policy with no waiting period for test speed
    await pe.connect(op).anchorPolicy("vault-r1", "pol-r1", true, true, true, true, 1, 1, 0);
    await pe.connect(op).openClaim("vault-r1", "claim-r1", op.address);

    const z = ethers.ZeroHash;
    await pe.connect(op).satisfyCondition("claim-r1", 0, z);
    await pe.connect(op).satisfyCondition("claim-r1", 1, z);
    await pe.connect(op).satisfyCondition("claim-r1", 2, z);
    await pe.connect(op).satisfyCondition("claim-r1", 3, z); // quorum met → waiting starts

    // Manually mark waiting period complete by satisfying condition 4 
    // In production waiting period is time-enforced; here quorumN=1, waitingPeriodDays=0
    // So waitingPeriodEndsAt should already be in the past
    await expect(
      pe.connect(op).authoriseRelease("vault-r1", "claim-r1")
    ).to.emit(pe, "ReleaseAuthorised");
  });
});
