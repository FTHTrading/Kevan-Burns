export const runtime = 'edge';

/**
 * POST /api/vault/checkin
 *
 * Owner check-in endpoint for the Dead Man's Switch.
 * Call this on any user action — login, vault access, or explicit check-in.
 * Resets the missed count and advances nextCheckInDue.
 *
 * Also: GET /api/vault/checkin?vaultId=xxx — get switch status.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { addDays } from "date-fns";
import { z } from "zod";

const CheckInSchema = z.object({
  vaultId: z.string(),
  method:  z.enum(["web", "email", "api"]).optional().default("web"),
  note:    z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const actorId = session?.user?.id ?? req.headers.get("x-user-id");
  if (!actorId) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CheckInSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  const { vaultId, method, note } = parsed.data;

  const dms = await prisma.deadManSwitch.findUnique({ where: { vaultId } });
  if (!dms) return NextResponse.json({ error: "No dead man's switch configured for this vault" }, { status: 404 });
  if (dms.ownerId !== actorId) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  if (!dms.enabled) return NextResponse.json({ error: "Switch is disabled" }, { status: 400 });

  const now = new Date();
  const nextDue = addDays(now, dms.intervalDays);

  const [updated] = await prisma.$transaction([
    prisma.deadManSwitch.update({
      where: { id: dms.id },
      data: {
        lastCheckIn:   now,
        nextCheckInDue: nextDue,
        missedCount:   0,
        triggeredAt:   null,
      },
    }),
    prisma.checkInEvent.create({
      data: {
        switchId: dms.id,
        method,
        note,
        ipHash: req.headers.get("x-forwarded-for") ?? undefined,
      },
    }),
  ]);

  return NextResponse.json({
    checked_in: true,
    nextDue: nextDue.toISOString(),
    intervalDays: dms.intervalDays,
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const actorId = session?.user?.id ?? req.headers.get("x-user-id");
  if (!actorId) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const vaultId = new URL(req.url).searchParams.get("vaultId");
  if (!vaultId) return NextResponse.json({ error: "vaultId required" }, { status: 400 });

  const dms = await prisma.deadManSwitch.findUnique({
    where: { vaultId },
    include: { checkIns: { orderBy: { occurredAt: "desc" }, take: 5 } },
  });

  if (!dms || dms.ownerId !== actorId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const daysUntilDue = Math.ceil((dms.nextCheckInDue.getTime() - now.getTime()) / 86400000);
  const overdue = now > dms.nextCheckInDue;

  return NextResponse.json({
    enabled:        dms.enabled,
    intervalDays:   dms.intervalDays,
    missedThreshold: dms.missedThreshold,
    missedCount:    dms.missedCount,
    lastCheckIn:    dms.lastCheckIn,
    nextCheckInDue: dms.nextCheckInDue,
    daysUntilDue,
    overdue,
    triggered:      !!dms.triggeredAt,
    claimInitiated: dms.claimInitiated,
    recentCheckIns: dms.checkIns,
  });
}
