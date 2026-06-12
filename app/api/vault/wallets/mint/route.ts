export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { UnykornOrchestrator } from "@/tools/unykorn-ecosystem-orchestrator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, amount = 100 } = body;

    if (!address) {
      return NextResponse.json({ success: false, error: "Wallet address is required" }, { status: 400 });
    }

    const orchestrator = new UnykornOrchestrator();
    const result = await orchestrator.queueTroptionsMint(
      process.env.OPERATOR_KEY || "mock-operator-key",
      address,
      amount,
      "usa.26wc"
    );

    return NextResponse.json({
      success: true,
      status: result.status,
      signature: result.signature,
      amount: result.amount,
      message: `TROPTIONS mint queued for wallet ${address}`,
    });
  } catch (error: any) {
    console.error("Failed to queue wallet TROPTIONS mint:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to queue mint" },
      { status: 500 }
    );
  }
}
