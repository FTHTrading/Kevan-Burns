export const runtime = 'edge';

/**
 * GET /api/audit/events?vaultId=...&limit=50&offset=0
 * Returns audit events for a vault (hashes and timestamps only — no private data).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validationError, serverError } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const vaultId = req.nextUrl.searchParams.get("vaultId") ?? undefined;
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "50", 10), 200);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0", 10);

  // Public auditor view: only hashes and non-sensitive metadata
  const auditorOnly = req.nextUrl.searchParams.get("auditor") === "true";

  try {
    const events = await prisma.auditEvent.findMany({
      where: vaultId ? { vaultId } : undefined,
      orderBy: { occurredAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        vaultId: true,
        action: true,
        detail: auditorOnly ? false : true,
        chainEventHash: true,
        occurredAt: true,
        actor: auditorOnly
          ? false
          : { select: { id: true, name: true, role: true } },
      },
    });

    const total = await prisma.auditEvent.count({
      where: vaultId ? { vaultId } : undefined,
    });

    return NextResponse.json({ events, total, limit, offset });
  } catch (err) {
    console.error("[api/audit/events]", err);
    return serverError();
  }
}
