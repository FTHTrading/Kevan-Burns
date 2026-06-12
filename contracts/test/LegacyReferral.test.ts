import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("LegacyReferral", function () {
  let referral: any;
  let mockToken: any;
  let owner: any;
  let operator: any;
  let affiliate1: any;
  let affiliate2: any;
  let customer: any;
  let other: any;

  beforeEach(async function () {
    [owner, operator, affiliate1, affiliate2, customer, other] = await ethers.getSigners();

    // 1. Deploy LegacyReferral
    const ReferralFactory = await ethers.getContractFactory("LegacyReferral");
    referral = await ReferralFactory.deploy();
    await referral.waitForDeployment();
    await referral.setOperator(operator.address, true);

    // 2. Deploy Mock Token (ERC20)
    const TokenFactory = await ethers.getContractFactory("MockERC20");
    mockToken = await TokenFactory.deploy(ethers.parseUnits("10000", 6));
    await mockToken.waitForDeployment();
  });

  it("deploys with owner set and default splits", async function () {
    expect(await referral.owner()).to.equal(owner.address);
    expect(await referral.level1Bps()).to.equal(1500); // 15%
    expect(await referral.level2Bps()).to.equal(500);  // 5%
  });

  it("allows operator to register referrers", async function () {
    // Register affiliate1 with namespace "kevan" and parent address affiliate2
    await expect(
      referral.connect(operator).registerReferrer(affiliate1.address, "kevan.legacy", affiliate2.address)
    ).to.emit(referral, "ReferrerRegistered");

    const refInfo = await referral.referrers(affiliate1.address);
    expect(refInfo.active).to.be.true;
    expect(refInfo.parentReferrer).to.equal(affiliate2.address);
  });

  it("allows operator to link customers to active referrers", async function () {
    // 1. Register affiliate1
    await referral.connect(operator).registerReferrer(affiliate1.address, "kevan.legacy", affiliate2.address);

    await expect(
      referral.connect(operator).linkCustomer(customer.address, affiliate1.address)
    ).to.emit(referral, "ReferralLinked");

    expect(await referral.customerToReferrer(customer.address)).to.equal(affiliate1.address);
  });

  it("distributes native rewards correctly (Level 1 + Level 2)", async function () {
    // 1. Register affiliate2 (L2) and affiliate1 (L1, parent = L2)
    await referral.connect(operator).registerReferrer(affiliate2.address, "parent.legacy", ethers.ZeroAddress);
    await referral.connect(operator).registerReferrer(affiliate1.address, "kevan.legacy", affiliate2.address);

    // 2. Link customer to affiliate1
    await referral.connect(operator).linkCustomer(customer.address, affiliate1.address);

    // 3. Track initial balances
    const initialL1Bal = await ethers.provider.getBalance(affiliate1.address);
    const initialL2Bal = await ethers.provider.getBalance(affiliate2.address);
    const initialOwnerBal = await ethers.provider.getBalance(owner.address);

    // 4. Pay native reward
    const payment = ethers.parseEther("1.0");
    await expect(
      referral.connect(operator).distributeNativeReward(customer.address, { value: payment })
    ).to.emit(referral, "RewardPaid");

    // Check balances (rewards: L1 gets 15%, L2 gets 5%, owner gets remaining 80%)
    const finalL1Bal = await ethers.provider.getBalance(affiliate1.address);
    const finalL2Bal = await ethers.provider.getBalance(affiliate2.address);
    const finalOwnerBal = await ethers.provider.getBalance(owner.address);

    expect(finalL1Bal - initialL1Bal).to.equal(ethers.parseEther("0.15"));
    expect(finalL2Bal - initialL2Bal).to.equal(ethers.parseEther("0.05"));
    expect(finalOwnerBal - initialOwnerBal).to.equal(ethers.parseEther("0.80"));
  });

  it("distributes ERC20 rewards correctly (Level 1 + Level 2)", async function () {
    // 1. Register referrers and link customer
    await referral.connect(operator).registerReferrer(affiliate2.address, "parent.legacy", ethers.ZeroAddress);
    await referral.connect(operator).registerReferrer(affiliate1.address, "kevan.legacy", affiliate2.address);
    await referral.connect(operator).linkCustomer(customer.address, affiliate1.address);

    // 2. Fund operator and approve LegacyReferral contract
    const totalAmount = ethers.parseUnits("100", 6);
    await mockToken.transfer(operator.address, totalAmount);
    await mockToken.connect(operator).approve(await referral.getAddress(), totalAmount);

    // 3. Payout tokens (100 mUSDC)
    await expect(
      referral.connect(operator).distributeTokenReward(customer.address, await mockToken.getAddress(), totalAmount)
    ).to.emit(referral, "RewardPaid");

    // Check token balances (rewards: L1 = 15 tokens, L2 = 5 tokens, Owner = 80 tokens)
    expect(await mockToken.balanceOf(affiliate1.address)).to.equal(ethers.parseUnits("15", 6));
    expect(await mockToken.balanceOf(affiliate2.address)).to.equal(ethers.parseUnits("5", 6));
    expect(await mockToken.balanceOf(owner.address)).to.equal(ethers.parseUnits("9980", 6)); // 10000 initial - 100 transfer + 80 remaining
  });
});
