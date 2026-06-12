export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { UnykornOrchestrator } from "@/tools/unykorn-ecosystem-orchestrator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientWallet, claimAmount, details = "Sovereign Reward Claim" } = body;

    const orchestrator = new UnykornOrchestrator();

    if (recipientWallet && claimAmount) {
      const result = await orchestrator.executeRewardClaim(
        recipientWallet,
        Number(claimAmount),
        details
      );
      return NextResponse.json({
        success: true,
        signature: result.signature,
        amount: result.amount,
        timestamp: result.timestamp,
        message: "Reward tokens successfully claimed on Mainnet!",
      });
    }

    const result = await orchestrator.queueTroptionsMint(
      process.env.OPERATOR_KEY || "mock-operator-key",
      "user-wallet-placeholder",
      100,
      "usa.26wc"
    );

    return NextResponse.json({
      success: true,
      status: result.status,
      signature: result.signature,
      amount: result.amount,
      message: "TROPTIONS mint successfully queued via supervisor",
    });
  } catch (error: any) {
    console.error("Failed to process reward claim / mint:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
