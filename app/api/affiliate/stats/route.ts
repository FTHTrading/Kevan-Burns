export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "demo-user-id";

    // 1. Look up Affiliate record
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      include: {
        referrals: true,
        rewards: true,
      },
    });

    if (!affiliate) {
      // Fallback/demo statistics for preview
      return NextResponse.json({
        referralCode: "KB-LEGACY",
        referralUrl: `${req.nextUrl.origin}/onboard?ref=KB-LEGACY`,
        activeReferrals: 4,
        volumeGenerated: "24,500 USDC",
        totalEarned: "4,900 USDC",
        pendingEarned: "0 USDC",
        referrals: [
          { referredUser: "smith-estate.legacy", status: "CONVERTED", date: "2026-05-28" },
          { referredUser: "jones-vault.legacy", status: "CONVERTED", date: "2026-05-24" },
          { referredUser: "vaughan-estate.legacy", status: "CONVERTED", date: "2026-05-20" },
          { referredUser: "bryan-stone.legacy", status: "CONVERTED", date: "2026-05-15" },
        ],
        rewards: [
          { txHash: "0x3f5c8a7b9d8e2c3d4f5a6b7c8d9e0f1a2b3c4d5e", amount: "15", currency: "USDC", date: "2026-05-28" },
          { txHash: "0x7a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", amount: "5", currency: "USDC", date: "2026-05-24" },
          { txHash: "0x9d8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d", amount: "15", currency: "USDC", date: "2026-05-20" },
        ],
      });
    }

    // 2. Compute actual stats from database
    const referrals = affiliate.referrals.map((r) => ({
      referredUser: r.referredUserId,
      status: r.status,
      date: r.createdAt.toISOString().split("T")[0],
    }));

    const rewards = affiliate.rewards.map((rw) => ({
      txHash: rw.txHash,
      amount: rw.amount,
      currency: rw.currency,
      date: rw.settledAt.toISOString().split("T")[0],
    }));

    const convertedCount = affiliate.referrals.filter((r) => r.status === "CONVERTED").length;
    const rewardCount = affiliate.rewards.length;
    
    // We assume each converted referral pays out 15 USDC (15% of $100 setup fee)
    const rewardPerConversion = 15; 
    const totalVolumeVal = convertedCount * 100;
    const totalEarnedVal = rewardCount * rewardPerConversion;
    const pendingCount = Math.max(0, convertedCount - rewardCount);
    const pendingEarnedVal = pendingCount * rewardPerConversion;

    return NextResponse.json({
      referralCode: affiliate.referralCode,
      referralUrl: `${req.nextUrl.origin}/onboard?ref=${affiliate.referralCode}`,
      activeReferrals: convertedCount,
      volumeGenerated: `${totalVolumeVal} USDC`,
      totalEarned: `${totalEarnedVal} USDC`,
      pendingEarned: `${pendingEarnedVal} USDC`,
      referrals,
      rewards,
    });
  } catch (error: any) {
    console.error("Failed to fetch affiliate stats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
