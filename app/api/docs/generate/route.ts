export const runtime = 'edge';

/**
 * POST /api/docs/generate
 *
 * Run the 6-agent document pipeline to generate an estate document.
 * Optionally anchors the SHA-256 hash to XRPL/Stellar + IPFS.
 *
 * Body: { templateId, fields, anchorXrpl?, anchorStellar?, vaultId? }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTemplate } from "@/lib/docs/templates";
import { runDocumentPipeline } from "@/lib/agents/document-pipeline";
import { anchorDocumentHash } from "@/lib/xrpl/xrpl-adapter";
import { anchorDocumentHashStellar } from "@/lib/stellar/stellar-adapter";
import { uploadToIPFS } from "@/lib/ipfs/ipfs-adapter";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/audit/audit-log";
import { z } from "zod";

const GenerateSchema = z.object({
  templateId:    z.string(),
  fields:        z.record(z.union([z.string(), z.array(z.string())])),
  anchorXrpl:    z.boolean().optional().default(true),
  anchorStellar: z.boolean().optional().default(false),
  vaultId:       z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const actorId = session?.user?.id ?? req.headers.get("x-user-id");
  if (!actorId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { templateId, fields, anchorXrpl, anchorStellar, vaultId } = parsed.data;

  const template = getTemplate(templateId);
  if (!template) {
    return NextResponse.json({ error: "Unknown template: " + templateId }, { status: 404 });
  }

  try {
    // ── Run the 6-agent pipeline ──────────────────────────
    const result = await runDocumentPipeline({
      template,
      fields,
      ownerName: String(fields.testatorName ?? fields.ownerName ?? fields.authorName ?? "Unknown"),
      jurisdiction: String(fields.jurisdiction ?? ""),
    });

    // ── Optional: upload to IPFS ──────────────────────────
    let ipfsCID: string | null = null;
    try {
      const ipfsResult = await uploadToIPFS(Buffer.from(result.documentText, "utf8"));
      ipfsCID = ipfsResult.cid;
    } catch { /* IPFS not required */ }

    // ── Optional: XRPL anchor ─────────────────────────────
    let xrplTxHash: string | null = null;
    if (anchorXrpl && template.xrplAnchor) {
      try {
        const xrpl = await anchorDocumentHash({
          documentId: result.documentId,
          sha256Hash: result.sha256Hash,
          templateId,
        });
        xrplTxHash = xrpl.txHash;
      } catch { /* XRPL anchor optional */ }
    }

    // ── Optional: Stellar anchor ──────────────────────────
    let stellarTxHash: string | null = null;
    if (anchorStellar && template.xrplAnchor) {
      try {
        const stellar = await anchorDocumentHashStellar({
          documentId: result.documentId,
          sha256Hash: result.sha256Hash,
          templateId,
        });
        stellarTxHash = stellar.txHash;
      } catch { /* Stellar anchor optional */ }
    }

    // ── Store proof record in DB ──────────────────────────
    let dbRecord = null;
    try {
      if (vaultId) {
        dbRecord = await prisma.documentRecord.create({
          data: {
            vaultId,
            type: templateId.includes("will") ? "WILL"
              : templateId.includes("trust") ? "TRUST"
              : templateId.includes("poa") ? "POWER_OF_ATTORNEY"
              : templateId.includes("health") ? "OTHER"
              : "INSTRUCTIONS",
            label: template.label,
            description: result.summary.slice(0, 255),
            cid:          ipfsCID ?? "mock:" + result.documentId,
            plaintextHash: result.sha256Hash,
            mimeType: "text/plain",
            fileSizeBytes: result.documentText.length,
            uploadedBy: actorId,
          },
        });

        await logEvent({
          vaultId,
          actorId,
          action: "DOCUMENT_UPLOADED",
          detail: {
            templateId,
            documentId: result.documentId,
            sha256: result.sha256Hash,
            ipfsCID,
            xrplTxHash,
          },
          anchorOnChain: true,
        });
      }
    } catch { /* DB optional in demo mode */ }

    return NextResponse.json({
      documentId:         result.documentId,
      templateId:         result.templateId,
      templateLabel:      template.label,
      documentText:       result.documentText,
      summary:            result.summary,
      complianceFindings: result.complianceFindings,
      sha256Hash:         result.sha256Hash,
      ipfsCID,
      xrplTxHash,
      stellarTxHash,
      generatedAt:        result.generatedAt,
      agentLog:           result.agentLog,
      dbRecordId:         dbRecord?.id ?? null,
      mock:               result.mock,
    });

  } catch (err) {
    console.error("[api/docs/generate]", err);
    return NextResponse.json(
      { error: "Document generation failed", details: String(err) },
      { status: 500 }
    );
  }
}
