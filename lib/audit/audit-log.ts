/**
 * lib/audit/audit-log.ts
 *
 * Appends immutable audit events to the database and optionally
 * anchors event hashes to the private chain for tamper-evidence.
 */

import { prisma } from "@/lib/db";
import { sha256Hex } from "@/lib/encryption/vault-crypto";
import { anchorAuditEvent } from "@/lib/blockchain/registry-adapter";
import type { AuditAction, Prisma } from "@prisma/client";

interface LogEventParams {
  vaultId?: string;
  actorId?: string;
  action: AuditAction;
  detail?: Record<string, unknown>;
  ipHash?: string;
  anchorOnChain?: boolean;
}

export async function logEvent(params: LogEventParams) {
  const eventHash = await sha256Hex(
    JSON.stringify({
      vaultId: params.vaultId,
      actorId: params.actorId,
      action: params.action,
      detail: params.detail ?? {},
      ts: Date.now(),
    })
  );

  let chainEventHash: string | undefined;

  if (params.anchorOnChain && params.vaultId) {
    try {
      const result = await anchorAuditEvent({
        vaultId: params.vaultId,
        eventId: eventHash.slice(0, 16),
        eventHash,
      });
      chainEventHash = result.txHash;
    } catch {
      // Non-fatal — chain anchor is best-effort
    }
  }

  return prisma.auditEvent.create({
    data: {
      vaultId: params.vaultId,
      actorId: params.actorId,
      action: params.action,
      detail: (params.detail ?? {}) as unknown as Prisma.InputJsonValue,
      ipHash: params.ipHash,
      chainEventHash,
    },
  });
}
