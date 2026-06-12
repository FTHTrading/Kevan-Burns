export const runtime = 'edge';

/**
 * POST /api/vault/switch — Configure or update dead man's switch
 * DELETE /api/vault/switch — Disable switch
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { addDays } from "date-fns";
import { z } from "zod";

const SwitchSchema = z.object({
  vaultId:          z.string(),
  intervalDays:     z.number().int().min(1).max(365).default(90),
  missedThreshold:  z.number().int().min(1).max(10).default(3),
  enabled:          z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const actorId = session?.user?.id ?? req.headers.get("x-user-id");
  if (!actorId) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = SwitchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

  const { vaultId, intervalDays, missedThreshold, enabled } = parsed.data;

  // Verify vault ownership
  const vault = await prisma.vault.findFirst({ where: { id: vaultId, ownerId: actorId } });
  if (!vault) return NextResponse.json({ error: "Vault not found or not authorized" }, { status: 404 });

  const now = new Date();
  const dms = await prisma.deadManSwitch.upsert({
    where: { vaultId },
    create: {
      vaultId,
      ownerId: actorId,
      intervalDays,
      missedThreshold,
      enabled,
      lastCheckIn:    now,
      nextCheckInDue: addDays(now, intervalDays),
    },
    update: {
      intervalDays,
      missedThreshold,
      enabled,
      nextCheckInDue: addDays(now, intervalDays),
      updatedAt: now,
    },
  });

  return NextResponse.json({ switch: dms }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const actorId = session?.user?.id ?? req.headers.get("x-user-id");
  if (!actorId) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const vaultId = new URL(req.url).searchParams.get("vaultId");
  if (!vaultId) return NextResponse.json({ error: "vaultId required" }, { status: 400 });

  const dms = await prisma.deadManSwitch.findUnique({ where: { vaultId } });
  if (!dms || dms.ownerId !== actorId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.deadManSwitch.update({ where: { id: dms.id }, data: { enabled: false } });
  return NextResponse.json({ disabled: true });
}
