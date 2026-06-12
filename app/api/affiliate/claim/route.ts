export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { distributeReward } from "@/lib/partners/referral-connector";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    const targetUserId = userId || "demo-user-id";

    // 1. Fetch affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: targetUserId },
      include: {
        referrals: true,
        rewards: true,
      },
    });

    if (!affiliate) {
      // Demo mock payout success
      return NextResponse.json({
        success: true,
        txHash: "0xmockclaim" + Math.random().toString(16).substring(2, 10).padStart(8, "0"),
        claimedCount: 1,
        message: "Demo reward claimed successfully (Mock mode)"
      });
    }

    const convertedReferrals = affiliate.referrals.filter((r) => r.status === "CONVERTED");
    const convertedCount = convertedReferrals.length;
    const rewardCount = affiliate.rewards.length;
    const pendingCount = Math.max(0, convertedCount - rewardCount);

    if (pendingCount === 0) {
      return NextResponse.json({ error: "No pending rewards available to claim" }, { status: 400 });
    }

    // 2. Identify the unpaid referrals
    // We payout the first 'pendingCount' conversions that don't have matching rewards by offset
    const unpaidReferrals = convertedReferrals.slice(rewardCount);

    let claimedCount = 0;
    let lastTxHash = "";

    for (const referral of unpaidReferrals) {
      // Find customer's wallet or DID
      const customerUser = await prisma.user.findUnique({
        where: { id: referral.referredUserId },
        include: { ownedVaults: { include: { wallets: true } } },
      });

      const customerWallet = customerUser?.ownedVaults[0]?.wallets[0]?.publicAddress 
        || "0x0000000000000000000000000000000000000000";

      // Call the referral connector to trigger the reward distribution
      const result = await distributeReward({
        customerUserId: referral.referredUserId,
        customerWallet,
        totalPaidAmount: "100", // $100 platform fee conversion
        tokenAddress: undefined // Payout in native currency for simple testing
      });

      if (result.success && result.txHash) {
        claimedCount++;
        lastTxHash = result.txHash;
      }
    }

    return NextResponse.json({
      success: true,
      claimedCount,
      txHash: lastTxHash,
      message: `Successfully claimed ${claimedCount} referral reward(s).`
    });
  } catch (error: any) {
    console.error("Failed to process reward claim:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
