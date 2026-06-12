/**
 * lib/partners/referral-connector.ts
 *
 * Referral and Affiliate Connector — Legacy Vault Protocol.
 * Coordinated on-chain + database tracking of referrers, customers, and rewards.
 */

import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { getChainConfig } from "@/lib/blockchain/chain-config";
import { AuditAction } from "@prisma/client";

// Minimal LegacyReferral ABI
const REFERRAL_ABI = [
  "function registerReferrer(address referrerAddr, string namespace, address parentReferrer) external",
  "function linkCustomer(address customer, address referrer) external",
  "function distributeNativeReward(address customer) external payable",
  "function distributeTokenReward(address customer, address tokenAddress, uint256 totalAmount) external",
  "function referrers(address referrer) external view returns (bytes32 namespaceHash, address parentReferrer, uint256 totalReferrals, uint256 totalEarned, bool active)",
  "function customerToReferrer(address customer) external view returns (address)",
  "function level1Bps() external view returns (uint256)",
  "function level2Bps() external view returns (uint256)"
];

let _referralContract: any = null;

async function getReferralContract(): Promise<any> {
  if (_referralContract) return _referralContract;

  const { ethers } = await import("ethers");
  const config = getChainConfig();
  
  const rpcUrl = config.rpcUrl;
  const contractAddr = process.env.REFERRAL_CONTRACT_ADDRESS;
  const adminKey = process.env.CHAIN_ADMIN_KEY;

  if (!rpcUrl) throw new Error("CHAIN_RPC_URL is not set");
  if (!contractAddr) throw new Error("REFERRAL_CONTRACT_ADDRESS is not set");
  if (!adminKey) throw new Error("CHAIN_ADMIN_KEY is not set");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(adminKey, provider);
  _referralContract = new ethers.Contract(contractAddr, REFERRAL_ABI, wallet);

  return _referralContract;
}

const isMock = () => process.env.MOCK_CHAIN !== "false";

/**
 * Register an affiliate/referrer.
 * Saves to local DB and anchors on the EVM chain (if MOCK_CHAIN=false).
 */
export async function registerAffiliate(params: {
  userId: string;
  referrerWallet: string;
  referralCode: string;
  namespace?: string;
  parentReferrer?: string; // Optional L2 parent referrer address
}): Promise<{ affiliateId: string; txHash?: string }> {
  const { userId, referrerWallet, referralCode, namespace, parentReferrer } = params;

  let txHash: string | undefined;

  // On-Chain Registration
  if (!isMock()) {
    try {
      const contract = await getReferralContract();
      const parent = parentReferrer || "0x0000000000000000000000000000000000000000";
      const ns = namespace || `${referralCode}.legacy`;
      const tx = await contract.registerReferrer(referrerWallet, ns, parent);
      const receipt = await tx.wait();
      txHash = receipt?.hash || tx.hash;
    } catch (error: any) {
      console.error("Failed to register referrer on-chain:", error);
      throw new Error(`On-chain registerReferrer failed: ${error.message}`);
    }
  } else {
    // Generate a mock txHash in dev
    txHash = "0xmockreg" + Math.random().toString(16).substring(2, 10).padStart(8, "0");
  }

  // Database Registration
  const affiliate = await prisma.affiliate.create({
    data: {
      userId,
      referralCode,
      namespace: namespace || null,
      status: "ACTIVE",
    },
  });

  // Log Audit Event
  await logEvent({
    actorId: userId,
    action: AuditAction.VAULT_UPDATED,
    detail: {
      message: "Affiliate registered",
      referralCode,
      referrerWallet,
      namespace,
      parentReferrer,
      txHash,
    },
  });

  return { affiliateId: affiliate.id, txHash };
}

/**
 * Link a referred user to an affiliate.
 * Saves to DB and anchors the linking on-chain (if MOCK_CHAIN=false).
 */
export async function linkReferredUser(params: {
  referredUserId: string;
  referralCode: string;
  customerWallet: string;
  referredVaultId?: string;
}): Promise<{ referralId: string; txHash?: string }> {
  const { referredUserId, referralCode, customerWallet, referredVaultId } = params;

  // Find the affiliate by referral code
  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode },
    include: { user: true },
  });

  if (!affiliate) {
    throw new Error(`Affiliate with code ${referralCode} not found`);
  }

  let txHash: string | undefined;

  // On-Chain linking
  if (!isMock()) {
    try {
      const contract = await getReferralContract();
      // We assume user has set up a wallet did or did key we can map.
      // But we need the affiliate's wallet. Let's find it or use a default.
      // In production, we get the affiliate's wallet or lookup namespace.
      const affiliateWallet = affiliate.namespace 
        ? await lookupWalletByNamespace(affiliate.namespace) 
        : await lookupUserWallet(affiliate.userId);

      if (!affiliateWallet) {
        throw new Error(`Could not resolve wallet for affiliate ${affiliate.id}`);
      }

      const tx = await contract.linkCustomer(customerWallet, affiliateWallet);
      const receipt = await tx.wait();
      txHash = receipt?.hash || tx.hash;
    } catch (error: any) {
      console.error("Failed to link customer on-chain:", error);
      throw new Error(`On-chain linkCustomer failed: ${error.message}`);
    }
  } else {
    txHash = "0xmocklink" + Math.random().toString(16).substring(2, 10).padStart(8, "0");
  }

  // Database link
  const referral = await prisma.referral.create({
    data: {
      affiliateId: affiliate.id,
      referredUserId,
      referredVaultId,
      status: "CONVERTED",
    },
  });

  // Log Audit Event
  await logEvent({
    actorId: referredUserId,
    action: AuditAction.VAULT_CREATED,
    detail: {
      message: "Customer linked to affiliate",
      affiliateId: affiliate.id,
      referralCode,
      customerWallet,
      txHash,
    },
  });

  return { referralId: referral.id, txHash };
}

/**
 * Distribute referral rewards and log payout records in DB.
 * Triggered on successful plan subscriptions / payments.
 */
export async function distributeReward(params: {
  customerUserId?: string;
  customerWallet?: string;
  tokenAddress?: string; // undefined for Native ETH/POL, otherwise ERC20 address
  totalPaidAmount: string; // BigNumber string in minimal units
  txHash?: string; // Optional payment transaction hash
  attorneyUserId?: string; // Optional: set for attorney/notary attestation payouts
}): Promise<{ success: boolean; txHash?: string }> {
  const { customerUserId, customerWallet, tokenAddress, totalPaidAmount, txHash: paymentTxHash, attorneyUserId } = params;

  // Handle Attorney / Notary Attestation Payout Flow
  if (attorneyUserId) {
    const attorney = await prisma.user.findFirst({
      where: { id: attorneyUserId, role: "attorney" }
    });

    if (!attorney) {
      console.warn(`Attorney user ${attorneyUserId} not found or role is not attorney`);
      return { success: false };
    }

    const attorneyWallet = attorney.did?.startsWith("did:ethr:")
      ? attorney.did.replace("did:ethr:", "")
      : null;

    if (!attorneyWallet) {
      console.warn(`Attorney user ${attorneyUserId} does not have a valid Ethereum/EVM DID`);
      return { success: false };
    }

    let rewardTxHash: string | undefined;

    if (!isMock()) {
      try {
        const { ethers } = await import("ethers");
        const config = getChainConfig();
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const wallet = new ethers.Wallet(process.env.CHAIN_ADMIN_KEY!, provider);

        if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
          // Distribute Native Reward
          const tx = await wallet.sendTransaction({
            to: attorneyWallet,
            value: totalPaidAmount,
          });
          const receipt = await tx.wait();
          rewardTxHash = receipt?.hash || tx.hash;
        } else {
          // Distribute ERC20 Token Reward (USDC)
          const tokenContract = new ethers.Contract(tokenAddress, [
            "function transfer(address to, uint256 amount) external returns (bool)"
          ], wallet);
          const tx = await tokenContract.transfer(attorneyWallet, totalPaidAmount);
          const receipt = await tx.wait();
          rewardTxHash = receipt?.hash || tx.hash;
        }
      } catch (error: any) {
        console.error("Failed to distribute notary reward on-chain:", error);
        throw new Error(`On-chain notary reward distribution failed: ${error.message}`);
      }
    } else {
      rewardTxHash = "0xmocknotary" + Math.random().toString(16).substring(2, 10).padStart(8, "0");
    }

    // Log audit event for attorney reward distribution
    await logEvent({
      actorId: attorneyUserId,
      action: AuditAction.VAULT_UPDATED,
      detail: {
        message: "Attorney attestation reward distributed via x402 settlement",
        attorneyUserId,
        attorneyWallet,
        amount: totalPaidAmount,
        currency: tokenAddress ? "USDC" : "NATIVE",
        paymentTxHash,
        rewardTxHash,
      },
    });

    return { success: true, txHash: rewardTxHash };
  }

  if (!customerUserId || !customerWallet) {
    console.warn("customerUserId and customerWallet required for standard referral payout");
    return { success: false };
  }

  // Find the referral record to get affiliate details
  const referral = await prisma.referral.findUnique({
    where: { referredUserId: customerUserId },
    include: { affiliate: { include: { user: true } } },
  });

  if (!referral) {
    // Customer was not referred: no reward to distribute
    return { success: false };
  }

  let rewardTxHash: string | undefined;

  // On-Chain distribution
  if (!isMock()) {
    try {
      const contract = await getReferralContract();
      if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
        // Distribute Native Reward
        const tx = await contract.distributeNativeReward(customerWallet, { value: totalPaidAmount });
        const receipt = await tx.wait();
        rewardTxHash = receipt?.hash || tx.hash;
      } else {
        // Distribute ERC20 Token Reward
        const tx = await contract.distributeTokenReward(customerWallet, tokenAddress, totalPaidAmount);
        const receipt = await tx.wait();
        rewardTxHash = receipt?.hash || tx.hash;
      }
    } catch (error: any) {
      console.error("Failed to distribute reward on-chain:", error);
      throw new Error(`On-chain reward distribution failed: ${error.message}`);
    }
  } else {
    rewardTxHash = "0xmockreward" + Math.random().toString(16).substring(2, 10).padStart(8, "0");
  }

  // Calculate Reward Amounts in DB (15% Level 1, 5% Level 2)
  const totalVal = parseFloat(totalPaidAmount);
  const l1Amount = (totalVal * 0.15).toFixed(0);

  // Database log Reward for L1 affiliate
  await prisma.referralReward.create({
    data: {
      affiliateId: referral.affiliateId,
      txHash: rewardTxHash || paymentTxHash || "unknown-tx",
      amount: l1Amount,
      currency: tokenAddress ? "USDC" : "NATIVE",
    },
  });

  // Log audit event for reward distribution
  await logEvent({
    actorId: referral.affiliate.userId,
    action: AuditAction.VAULT_UPDATED,
    detail: {
      message: "Referral reward distributed",
      affiliateId: referral.affiliateId,
      amount: l1Amount,
      currency: tokenAddress ? "USDC" : "NATIVE",
      paymentTxHash,
      rewardTxHash,
    },
  });

  return { success: true, txHash: rewardTxHash };
}

// Helper: look up wallet by namespace
async function lookupWalletByNamespace(namespace: string): Promise<string | null> {
  const record = await prisma.namespaceEntitlement.findFirst({
    where: { namespace, isActive: true },
  });
  if (record && record.userId) {
    return lookupUserWallet(record.userId);
  }
  return null;
}

// Helper: look up user's wallet address
async function lookupUserWallet(userId: string): Promise<string | null> {
  // Let's check if the user has a wallet record
  const wallet = await prisma.walletRecord.findFirst({
    where: { vault: { ownerId: userId } },
  });
  if (wallet) {
    return wallet.publicAddress;
  }
  
  // Fallback to user's DID if it's an EVM address
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && user.did && user.did.startsWith("did:ethr:")) {
    return user.did.replace("did:ethr:", "");
  }
  
  return null;
}
