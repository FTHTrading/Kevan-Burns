import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Legacy Vault Utilities Test Suite", function () {
  let owner: any;
  let operator: any;
  let user1: any;
  let user2: any;
  let beneficiary1: any;
  let beneficiary2: any;
  let referrer: any;
  let parentReferrer: any;

  // Contracts
  let soulboundRoute: any;
  let vaultRegistry: any;
  let policyEngine: any;
  let executionUtility: any;
  let referralContract: any;
  let affiliateBadge: any;
  let feeDistribution: any;
  let mockToken: any;
  let mockTba: any;

  beforeEach(async function () {
    [owner, operator, user1, user2, beneficiary1, beneficiary2, referrer, parentReferrer] = await ethers.getSigners();

    // 1. Deploy LegacySoulboundRoute
    const LSR = await ethers.getContractFactory("LegacySoulboundRoute");
    soulboundRoute = await LSR.deploy();
    await soulboundRoute.waitForDeployment();

    // 2. Deploy Registries for Execution Utility
    const LVR = await ethers.getContractFactory("LegacyVaultRegistry");
    vaultRegistry = await LVR.deploy();
    await vaultRegistry.waitForDeployment();

    const LPE = await ethers.getContractFactory("LegacyPolicyEngine");
    policyEngine = await LPE.deploy();
    await policyEngine.waitForDeployment();

    // 3. Deploy LegacyVaultExecutionUtility
    const LVEU = await ethers.getContractFactory("LegacyVaultExecutionUtility");
    executionUtility = await LVEU.deploy(await vaultRegistry.getAddress(), await policyEngine.getAddress());
    await executionUtility.waitForDeployment();

    // Set execution utility as operator on VaultRegistry and PolicyEngine
    await vaultRegistry.addOperator(await executionUtility.getAddress());
    await policyEngine.addOperator(await executionUtility.getAddress());

    // Also register our main operator account as operator for direct setup steps
    await vaultRegistry.addOperator(operator.address);
    await policyEngine.addOperator(operator.address);
    await executionUtility.setOperators(operator.address, true);

    // 4. Deploy Mock Token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy(ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    // 5. Deploy Mock TBA (simple call forwarder simulating ERC-6551 Account)
    const MockTBAContract = await ethers.getContractFactory("MockTBAHelper");
    mockTba = await MockTBAContract.deploy();
    await mockTba.waitForDeployment();

    // 6. Deploy Referral & Badge for Fee Distribution
    const LR = await ethers.getContractFactory("LegacyReferral");
    referralContract = await LR.deploy();
    await referralContract.waitForDeployment();

    const AB = await ethers.getContractFactory("AffiliateBadge");
    affiliateBadge = await AB.deploy();
    await affiliateBadge.waitForDeployment();

    // 7. Deploy LegacyFeeDistributionUtility
    const LFDU = await ethers.getContractFactory("LegacyFeeDistributionUtility");
    feeDistribution = await LFDU.deploy(
      await referralContract.getAddress(),
      await affiliateBadge.getAddress(),
      await owner.getAddress() // Treasury
    );
    await feeDistribution.waitForDeployment();

    // Register feeDistribution as operator in Referral
    await referralContract.setOperator(await feeDistribution.getAddress(), true);
    await referralContract.setOperator(operator.address, true);
  });

  // ==========================================
  //  LegacySoulboundRoute tests
  // ==========================================
  describe("LegacySoulboundRoute (ERC-5192)", function () {
    it("mints and locks a soulbound route", async function () {
      const label = "legacy";
      const tokenURI = "ipfs://QmMetadata1";
      const ipfsCID = "QmMetadata1";
      const stellarTarget = "SAOHXUGZ2YVEQM4ZY7J3SBFTCKLKVWZAIJYZUPPVSPFGVLJTMOFGPWZY";
      const solanaTarget = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

      await expect(
        soulboundRoute.mintRoute(
          user1.address,
          label,
          tokenURI,
          ipfsCID,
          stellarTarget,
          solanaTarget
        )
      ).to.emit(soulboundRoute, "Locked").withArgs(1);

      expect(await soulboundRoute.locked(1)).to.be.true;
      expect(await soulboundRoute.ownerOf(1)).to.equal(user1.address);
      expect(await soulboundRoute.tokenURI(1)).to.equal(tokenURI);

      const [tokenId, details] = await soulboundRoute.getRouteByLabel(label);
      expect(tokenId).to.equal(1);
      expect(details.label).to.equal(label);
      expect(details.stellarTarget).to.equal(stellarTarget);
      expect(details.solanaTarget).to.equal(solanaTarget);
    });

    it("prevents duplicate route registration", async function () {
      await soulboundRoute.mintRoute(user1.address, "legacy", "uri1", "cid1", "stellar1", "solana1");
      await expect(
        soulboundRoute.mintRoute(user2.address, "legacy", "uri2", "cid2", "stellar2", "solana2")
      ).to.be.revertedWith("LSR: Route already registered");
    });

    it("prevents transfer of soulbound route (non-transferable)", async function () {
      await soulboundRoute.mintRoute(user1.address, "legacy", "uri1", "cid1", "stellar1", "solana1");
      await expect(
        soulboundRoute.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith("LSR: token is soulbound and non-transferable");
    });
  });

  // ==========================================
  //  LegacyVaultExecutionUtility tests
  // ==========================================
  describe("LegacyVaultExecutionUtility", function () {
    const vaultId = "vault-456";
    const claimId = "claim-789";

    beforeEach(async function () {
      // Setup: register vault
      const manifestHash = ethers.keccak256(ethers.toUtf8Bytes("manifest-contents"));
      await vaultRegistry.connect(operator).registerVault(
        vaultId,
        "did:key:user1",
        "ipfs://QmManifest",
        manifestHash,
        "policy-1"
      );

      // Setup: anchor policy (require attorney attestation and guardian quorum)
      await policyEngine.connect(operator).anchorPolicy(
        vaultId,
        "policy-1",
        false, // executor identity not required
        false, // death cert not required
        true,  // require attorney attestation
        true,  // require guardian quorum
        1, 1, 0 // guardianQuorumN = 1, guardianQuorumM = 1, waitingPeriodDays = 0
      );

      // Setup: open claim
      await policyEngine.connect(operator).openClaim(vaultId, claimId, user2.address);

      // Setup: satisfy guardian quorum (triggers rs.guardianQuorumMet and sets rs.waitingPeriodEndsAt = block.timestamp)
      const evidence = ethers.keccak256(ethers.toUtf8Bytes("evidence"));
      await policyEngine.connect(operator).satisfyCondition(claimId, 3, evidence); // 3 = GUARDIAN_QUORUM_REACHED

      // Setup: satisfy waiting period elapsed
      await policyEngine.connect(operator).satisfyCondition(claimId, 4, evidence); // 4 = WAITING_PERIOD_ELAPSED

      // Setup: satisfy attorney condition
      await policyEngine.connect(operator).satisfyCondition(claimId, 2, evidence); // 2 = ATTORNEY_ATTESTED

      // Setup: configure shares (60% to beneficiary1, 40% to beneficiary2)
      await executionUtility.connect(operator).setBeneficiaryShares(
        vaultId,
        [beneficiary1.address, beneficiary2.address],
        [6000, 4000] // 60% and 40%
      );

      // Mint 1000 tokens to mockTba
      await mockToken.transfer(await mockTba.getAddress(), ethers.parseEther("1000"));
    });

    it("verifies conditions, sets vault status to RELEASED, and distributes assets out of TBA", async function () {
      const initialBal1 = await mockToken.balanceOf(beneficiary1.address);
      const initialBal2 = await mockToken.balanceOf(beneficiary2.address);

      // Verify policy conditions are fully satisfied
      const allMet = await policyEngine.allConditionsMet(claimId);
      console.log("Are policy conditions met?", allMet);

      // Execute release & distribution
      await expect(
        executionUtility.connect(operator).executeVaultRelease(
          vaultId,
          claimId,
          await mockTba.getAddress(),
          await mockToken.getAddress()
        )
      ).to.emit(executionUtility, "VaultEstateDistributed")
       .withArgs(vaultId, await mockToken.getAddress(), ethers.parseEther("1000"), 2);

      // Verify vault status is now RELEASED (3)
      expect(await vaultRegistry.getVaultStatus(vaultId)).to.equal(3); // 3 = RELEASED

      // Verify beneficiary balances (60% and 40%)
      const finalBal1 = await mockToken.balanceOf(beneficiary1.address);
      const finalBal2 = await mockToken.balanceOf(beneficiary2.address);

      expect(finalBal1 - initialBal1).to.equal(ethers.parseEther("600"));
      expect(finalBal2 - initialBal2).to.equal(ethers.parseEther("400"));
      expect(await mockToken.balanceOf(await mockTba.getAddress())).to.equal(0);
    });

    it("fails to execute release if policy conditions are not fully met", async function () {
      // Deploy a separate vault and claim with unmet conditions
      const badVault = "vault-bad";
      const badClaim = "claim-bad";
      await vaultRegistry.connect(operator).registerVault(badVault, "did:key:user1", "ipfs://Qm1", ethers.ZeroHash, "policy-bad");
      await policyEngine.connect(operator).anchorPolicy(badVault, "policy-bad", true, false, false, false, 0, 0, 0); // requires executor identity
      await policyEngine.connect(operator).openClaim(badVault, badClaim, user2.address);

      await expect(
        executionUtility.connect(operator).executeVaultRelease(
          badVault,
          badClaim,
          await mockTba.getAddress(),
          await mockToken.getAddress()
        )
      ).to.be.revertedWith("LVEU: Policy conditions not satisfied");
    });
  });

  // ==========================================
  //  LegacyFeeDistributionUtility tests
  // ==========================================
  describe("LegacyFeeDistributionUtility", function () {
    const tier = 1; // Family plan
    const tierPriceNative = ethers.parseEther("0.02");
    const tierPriceToken = ethers.parseEther("50"); // 50 MUSD

    beforeEach(async function () {
      // Set prices for tier 1
      await feeDistribution.setTierPrices(tier, tierPriceNative, await mockToken.getAddress(), tierPriceToken);

      // Register referrer and link customer in ReferralContract
      await referralContract.connect(operator).registerReferrer(parentReferrer.address, "parent.legacy", addressZero());
      await referralContract.connect(operator).registerReferrer(referrer.address, "ref.legacy", parentReferrer.address);
      await referralContract.connect(operator).linkCustomer(user1.address, referrer.address);
    });

    it("purchases native subscription and distributes rewards to referrers", async function () {
      console.log("--- Native Subscription Debugging ---");
      console.log("Customer to Referrer L1:", await referralContract.customerToReferrer(user1.address));
      console.log("Referrer Config Active:", (await referralContract.referrers(referrer.address)).active);
      console.log("FeeDistribution is Operator on Referral:", await referralContract.operators(await feeDistribution.getAddress()));

      const referrerInitial = await ethers.provider.getBalance(referrer.address);
      const parentInitial = await ethers.provider.getBalance(parentReferrer.address);

      // Execute native purchase
      await feeDistribution.connect(user1).purchaseSubscriptionWithNative(tier, { value: tierPriceNative });

      const referrerFinal = await ethers.provider.getBalance(referrer.address);
      const parentFinal = await ethers.provider.getBalance(parentReferrer.address);

      console.log("Referrer native earned:", referrerFinal - referrerInitial);
      console.log("Parent native earned:", parentFinal - parentInitial);

      // Level 1: 15%, Level 2: 5%
      const expectedL1 = (tierPriceNative * 1500n) / 10000n;
      const expectedL2 = (tierPriceNative * 500n) / 10000n;

      expect(referrerFinal - referrerInitial).to.equal(expectedL1);
      expect(parentFinal - parentInitial).to.equal(expectedL2);
    });

    it("purchases token subscription and routes token rewards to referrers", async function () {
      // Setup user1 MUSD balance and approval
      await mockToken.transfer(user1.address, ethers.parseEther("500"));
      await mockToken.connect(user1).approve(await feeDistribution.getAddress(), tierPriceToken);

      const referrerInitial = await mockToken.balanceOf(referrer.address);
      const parentInitial = await mockToken.balanceOf(parentReferrer.address);

      // Execute token purchase
      await feeDistribution.connect(user1).purchaseSubscriptionWithToken(await mockToken.getAddress(), tier);

      const referrerFinal = await mockToken.balanceOf(referrer.address);
      const parentFinal = await mockToken.balanceOf(parentReferrer.address);

      const expectedL1 = (tierPriceToken * 1500n) / 10000n;
      const expectedL2 = (tierPriceToken * 500n) / 10000n;

      expect(referrerFinal - referrerInitial).to.equal(expectedL1);
      expect(parentFinal - parentInitial).to.equal(expectedL2);
    });

    it("applies 10% affiliate badge discount to plan prices", async function () {
      // Mint AffiliateBadge to user2
      await affiliateBadge.mint(user2.address);

      const standardPrice = await feeDistribution.getSubscriptionPrice(user1.address, addressZero(), tier); // user1 has no badge
      const discountedPrice = await feeDistribution.getSubscriptionPrice(user2.address, addressZero(), tier); // user2 has badge

      expect(standardPrice).to.equal(tierPriceNative);
      expect(discountedPrice).to.equal((tierPriceNative * 9000n) / 10000n); // 90% of standard price
    });
  });
});

// Helper for Zero Address
function addressZero() {
  return ethers.ZeroAddress || "0x0000000000000000000000000000000000000000";
}
