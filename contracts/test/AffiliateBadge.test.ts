const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AffiliateBadge", function () {
  let badge: any;
  let owner: any;
  let recipient: any;
  let other: any;

  beforeEach(async function () {
    [owner, recipient, other] = await ethers.getSigners();

    const BadgeFactory = await ethers.getContractFactory("AffiliateBadge");
    badge = await BadgeFactory.deploy();
    await badge.waitForDeployment();
  });

  it("deploys with correct name and symbol", async function () {
    expect(await badge.name()).to.equal("FlashRouter Affiliate Badge");
    expect(await badge.symbol()).to.equal("FRAB");
    expect(await badge.owner()).to.equal(owner.address);
  });

  it("allows owner to mint a badge", async function () {
    await expect(badge.mint(recipient.address))
      .to.emit(badge, "BadgeMinted");

    expect(await badge.balanceOf(recipient.address)).to.equal(1);
    expect(await badge.hasBadge(recipient.address)).to.be.true;
  });

  it("prevents double-minting to the same address", async function () {
    await badge.mint(recipient.address);
    await expect(badge.mint(recipient.address)).to.be.revertedWith("AB: already has badge");
  });

  it("prevents non-owners from minting", async function () {
    await expect(
      badge.connect(recipient).mint(other.address)
    ).to.be.revertedWithCustomError(badge, "OwnableUnauthorizedAccount");
  });

  it("blocks token transfers (soulbound enforcement)", async function () {
    await badge.mint(recipient.address);
    const tokenId = 0;

    await expect(
      badge.connect(recipient).transferFrom(recipient.address, other.address, tokenId)
    ).to.be.revertedWith("AB: Soulbound token is non-transferable");
  });
});
