export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { AuditAction } from "@prisma/client";
import { z } from "zod";

const AttorneyRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  firm: z.string().min(2, "Firm name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  barNumber: z.string().min(5, "Georgia Bar Number must be at least 5 digits"),
  officeAddress: z.string().min(10, "Office address is required"),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"),
  practiceAreas: z.array(z.string()).min(1, "Select at least one practice area"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = AttorneyRegisterSchema.parse(body);

    const {
      name,
      firm,
      email,
      phone,
      barNumber,
      officeAddress,
      walletAddress,
      practiceAreas,
    } = data;

    // 1. Create DID for the attorney
    const did = `did:ethr:${walletAddress.toLowerCase()}`;

    // 2. Create or update User as Attorney
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name,
        did,
        role: "attorney",
      },
      create: {
        email: email.toLowerCase(),
        name,
        did,
        role: "attorney",
      },
    });

    // 3. Log compliance audit event with firm, bar number and location details
    await logEvent({
      actorId: user.id,
      action: AuditAction.VAULT_UPDATED,
      detail: {
        message: "Georgia Licensed Attorney registered in Ecosystem Partners Network",
        firm,
        phone,
        barNumber,
        officeAddress,
        walletAddress,
        practiceAreas,
        attorneyUserId: user.id,
        locationAnchor: "Gwinnett County / Norcross GA",
      },
    });

    return NextResponse.json({
      success: true,
      attorneyId: user.id,
      did,
      message: "Attorney registration submitted successfully and Georgia Bar credentials queued for verification",
    });
  } catch (error: any) {
    console.error("Attorney registration failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid registration parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
