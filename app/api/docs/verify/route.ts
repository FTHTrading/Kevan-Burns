export const runtime = 'edge';

/**
 * GET /api/docs/verify?hash=<sha256>&xrplTx=<txHash>
 *
 * Public document hash verification — no auth required.
 * Verifies a document against its on-chain hash record.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hash   = searchParams.get("hash");
  const xrplTx = searchParams.get("xrplTx");

  if (!hash && !xrplTx) {
    return NextResponse.json({ error: "Provide hash or xrplTx query param" }, { status: 400 });
  }

  // Look up by plaintextHash in document records
  const records = hash
    ? await prisma.documentRecord.findMany({
        where: { plaintextHash: hash },
        select: {
          id: true, label: true, type: true, cid: true,
          plaintextHash: true, uploadedAt: true,
          vault: { select: { id: true, label: true } },
        },
      })
    : [];

  if (records.length === 0 && !xrplTx) {
    return NextResponse.json({
      verified: false,
      hash,
      message: "No document found matching this hash in the registry.",
    });
  }

  // Check XRPL transaction if provided
  let xrplVerified = false;
  let xrplData: Record<string, unknown> | null = null;

  if (xrplTx && !xrplTx.startsWith("MOCK_") && !xrplTx.startsWith("STELLAR_MOCK_")) {
    try {
      const { Client } = await import("xrpl");
      const networkUrl = process.env.XRPL_NETWORK === "mainnet"
        ? "wss://xrplcluster.com"
        : "wss://s.altnet.rippletest.net:51233";

      const client = new Client(networkUrl);
      await client.connect();

      const txInfo = await client.request({
        command: "tx",
        transaction: xrplTx,
      });

      const memos = (txInfo.result as { Memos?: { Memo: { MemoData?: string } }[] }).Memos ?? [];
      for (const memo of memos) {
        if (memo.Memo?.MemoData) {
          const decoded = Buffer.from(memo.Memo.MemoData, "hex").toString("utf8");
          try {
            const parsed = JSON.parse(decoded);
            if (parsed.protocol === "legacy-vault-protocol") {
              xrplVerified = true;
              xrplData = parsed;
              // Cross-verify the hash
              if (hash && parsed.sha256 && parsed.sha256 !== hash) {
                xrplVerified = false;
                xrplData = { error: "Hash mismatch — document may have been altered" };
              }
            }
          } catch { /* not a LVP memo */ }
        }
      }

      await client.disconnect();
    } catch { /* XRPL check optional */ }
  } else if (xrplTx?.startsWith("MOCK_")) {
    xrplVerified = true;
    xrplData = { note: "Mock anchor — not on live XRPL" };
  }

  return NextResponse.json({
    verified: records.length > 0 || xrplVerified,
    hash,
    xrplTxHash: xrplTx,
    xrplVerified,
    xrplData,
    registryMatches: records.length,
    documents: records.map((r) => ({
      id: r.id,
      label: r.label,
      type: r.type,
      ipfsCID: r.cid,
      uploadedAt: r.uploadedAt,
      vaultId: r.vault?.id,
    })),
    checkedAt: new Date().toISOString(),
  });
}
