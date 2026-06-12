export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const namespace = searchParams.get("namespace");

    if (!namespace) {
      return NextResponse.json({ error: "Namespace is required" }, { status: 400 });
    }

    const entitlement = await prisma.namespaceEntitlement.findUnique({
      where: { namespace },
    });

    if (!entitlement) {
      return NextResponse.json({ success: true, found: false });
    }

    return NextResponse.json({
      success: true,
      found: true,
      namespace: entitlement.namespace,
      ipfsCID: entitlement.ipfsCID,
      stellarTxHash: entitlement.stellarTxHash,
      xrplTxHash: entitlement.xrplTxHash,
      solanaTxHash: entitlement.solanaTxHash,
      plan: entitlement.plan,
      isActive: entitlement.isActive,
    });
  } catch (error: any) {
    console.error("Namespace status check failed:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
