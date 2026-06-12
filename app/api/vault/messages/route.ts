export const runtime = 'edge';

/**
 * POST /api/vault/messages — Create a legacy message
 * GET  /api/vault/messages?vaultId=xxx — List messages for vault
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateMessageSchema = z.object({
  vaultId:        z.string(),
  recipientId:    z.string().optional(),
  recipientName:  z.string().optional(),
  subject:        z.string().min(1).max(200),
  messageType:    z.enum(["TEXT", "VIDEO_URL", "AUDIO_URL", "DOCUMENT_CID"]).default("TEXT"),
  contentCID:     z.string().optional(),
  contentHash:    z.string().optional(),
  excerpt:        z.string().max(500).optional(),
  scheduledFor:   z.string().datetime().optional(),
  releaseOnDeath: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const actorId = session?.user?.id ?? req.headers.get("x-user-id");
  if (!actorId) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateMessageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;

  // Verify vault ownership
  const vault = await prisma.vault.findFirst({ where: { id: data.vaultId, ownerId: actorId } });
  if (!vault) return NextResponse.json({ error: "Vault not found" }, { status: 404 });

  const message = await prisma.legacyMessage.create({
    data: {
      vaultId:       data.vaultId,
      authorId:      actorId,
      recipientId:   data.recipientId,
      recipientName: data.recipientName,
      subject:       data.subject,
      messageType:   data.messageType,
      contentCID:    data.contentCID,
      contentHash:   data.contentHash,
      excerpt:       data.excerpt,
      scheduledFor:  data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      releaseOnDeath: data.releaseOnDeath,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const actorId = session?.user?.id ?? req.headers.get("x-user-id");
  if (!actorId) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const vaultId = new URL(req.url).searchParams.get("vaultId");
  if (!vaultId) return NextResponse.json({ error: "vaultId required" }, { status: 400 });

  const vault = await prisma.vault.findFirst({ where: { id: vaultId, ownerId: actorId } });
  if (!vault) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const messages = await prisma.legacyMessage.findMany({
    where: { vaultId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, subject: true, messageType: true, recipientName: true,
      excerpt: true, releaseOnDeath: true, scheduledFor: true,
      delivered: true, deliveredAt: true, createdAt: true,
    },
  });

  return NextResponse.json({ messages });
}
