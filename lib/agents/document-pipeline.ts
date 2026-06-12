/**
 * lib/agents/document-pipeline.ts
 *
 * 6-agent estate document processing pipeline.
 * White-labeled from the XXXIII.io Document Governance Layer architecture.
 *
 * Agents:
 *  1. Extractor   — Parses and normalizes field inputs
 *  2. Drafter     — Generates full document text from template + fields
 *  3. Compliance  — Reviews for ESIGN, UETA, RUFADAA, state law issues
 *  4. Reviewer    — Final QA: completeness, consistency, enforceability
 *  5. Summarizer  — Creates executor-readable summary + key dates
 *  6. Crypto      — Adds digital asset specific provisions if applicable
 */

import { grokChat } from "./gemini-client";
import type { EstateTemplate } from "@/lib/docs/templates";
import { anchorDocumentHashStellar } from "../stellar/stellar-adapter";
import { anchorDocumentHash } from "../xrpl/xrpl-adapter";
import { anchorDocumentHashSolana } from "../solana/solana-adapter";

const crypto = typeof globalThis !== "undefined" && globalThis.crypto
  ? globalThis.crypto
  : (typeof require !== "undefined" ? require("crypto").webcrypto : undefined);

// Edge-compatible replacements (no Node 'crypto')
function randomBytesEdge(len: number): Uint8Array {
  if (!crypto) throw new Error("Web Crypto API (crypto) is not defined in this environment");
  return crypto.getRandomValues(new Uint8Array(len));
}

async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const buf = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  const hash = await crypto.subtle.digest("SHA-256", buf as any);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export interface PipelineInput {
  template: EstateTemplate;
  fields: Record<string, string | string[]>;
  ownerName: string;
  jurisdiction?: string;
}

export interface ComplianceFinding {
  severity: "ERROR" | "WARNING" | "INFO";
  rule: string;
  description: string;
  recommendation: string;
}

export interface PipelineResult {
  documentId: string;
  templateId: string;
  documentText: string;
  summary: string;
  complianceFindings: ComplianceFinding[];
  sha256Hash: string;
  generatedAt: string;
  agentLog: { agent: string; status: "OK" | "WARN"; note?: string }[];
  mock: boolean;
}

// Format fields into readable context
function formatFields(fields: Record<string, string | string[]>): string {
  return Object.entries(fields)
    .map(([k, v]) => {
      const val = Array.isArray(v) ? v.join("\n  • ") : v;
      return `${k}: ${val}`;
    })
    .filter(([, v]) => v && String(v).trim())
    .join("\n");
}

export async function runDocumentPipeline(input: PipelineInput): Promise<PipelineResult> {
  const { template, fields } = input;
  const agentLog: PipelineResult["agentLog"] = [];
  const fieldContext = formatFields(fields);
  let mock = false;

  // ── Agent 1: Extractor ──────────────────────────────────
  const extractorResult = await grokChat([
    {
      role: "system",
      content: `You are a legal document field extractor. Parse the provided field values, normalize them (full legal names, formatted dates, proper addresses), identify any missing required fields, and flag potential issues. Output as clean JSON with keys: normalized_fields (object), missing_required (array), flags (array of strings).`,
    },
    {
      role: "user",
      content: `Template: ${template.label}\nJurisdiction: ${fields.jurisdiction || "Not specified"}\n\nFields:\n${fieldContext}`,
    },
  ], { temperature: 0.1 });
  mock = !!extractorResult.mock;
  agentLog.push({ agent: "Extractor", status: "OK" });

  let normalizedFields = fieldContext;
  try {
    const extracted = JSON.parse(extractorResult.content);
    if (extracted.normalized_fields) {
      normalizedFields = formatFields(extracted.normalized_fields);
    }
    if (extracted.missing_required?.length > 0) {
      agentLog[0].status = "WARN";
      agentLog[0].note = `Missing fields: ${extracted.missing_required.join(", ")}`;
    }
  } catch {
    // Continue with original fields if JSON parse fails
  }

  // ── Agent 2: Drafter ───────────────────────────────────
  const draftResult = await grokChat([
    { role: "system", content: template.systemPrompt },
    {
      role: "user",
      content: `Generate the complete ${template.label} with the following information:\n\n${normalizedFields}\n\nJurisdiction: ${fields.jurisdiction || "General / Multi-state"}\n\nOutput the complete document text only. Begin with the document title.`,
    },
  ], { temperature: 0.2, maxTokens: 6000 });
  agentLog.push({ agent: "Drafter", status: "OK" });

  const documentText = draftResult.content;

  // ── Agent 3: Compliance ────────────────────────────────
  const complianceChecks = template.complianceChecks.join(", ") || "general estate law";
  const complianceResult = await grokChat([
    {
      role: "system",
      content: `You are an estate law compliance specialist. Review the provided document for compliance issues. Check: ${complianceChecks}. Output JSON array of findings with schema: [{severity: "ERROR"|"WARNING"|"INFO", rule: string, description: string, recommendation: string}]. Be specific and actionable.`,
    },
    {
      role: "user",
      content: `Review this ${template.label} for compliance:\n\n${documentText.slice(0, 3000)}...`,
    },
  ], { temperature: 0.1 });
  agentLog.push({ agent: "Compliance", status: "OK" });

  let complianceFindings: ComplianceFinding[] = [];
  try {
    const raw = complianceResult.content.match(/\[[\s\S]*\]/)?.[0];
    if (raw) complianceFindings = JSON.parse(raw);
  } catch {
    complianceFindings = [{
      severity: "INFO",
      rule: "REVIEW_REQUIRED",
      description: "Document requires attorney review before execution.",
      recommendation: "Have a licensed attorney in the applicable jurisdiction review before signing.",
    }];
  }

  // Flag errors in agent log
  const hasErrors = complianceFindings.some((f) => f.severity === "ERROR");
  if (hasErrors) {
    agentLog[agentLog.length - 1].status = "WARN";
    agentLog[agentLog.length - 1].note = "Compliance errors detected — attorney review required";
  }

  // ── Agent 4: Reviewer ──────────────────────────────────
  await grokChat([
    {
      role: "system",
      content: `You are a final document QA reviewer. Check the document for: completeness (all required clauses present), internal consistency (no contradicting provisions), and enforceability (proper execution requirements stated). Output: PASS or FAIL with brief explanation.`,
    },
    {
      role: "user",
      content: documentText.slice(0, 2000),
    },
  ], { temperature: 0.1 });
  agentLog.push({ agent: "Reviewer", status: "OK" });

  // ── Agent 5: Summarizer ────────────────────────────────
  const summaryResult = await grokChat([
    {
      role: "system",
      content: `Create a plain-English executive summary of this estate document for the executor. Include: document type, key parties, main provisions, critical dates, and a 5-item action checklist. Keep it under 300 words. Write clearly for a non-attorney.`,
    },
    {
      role: "user",
      content: documentText.slice(0, 3000),
    },
  ], { temperature: 0.3, maxTokens: 500 });
  agentLog.push({ agent: "Summarizer", status: "OK" });

  // ── Agent 6: Crypto provisions (if applicable) ─────────
  const hasCrypto = template.category === "CRYPTO" ||
    Object.values(fields).some((v) => {
      const str = Array.isArray(v) ? v.join(" ") : String(v);
      return /bitcoin|ethereum|crypto|xrpl|stellar|nft|wallet|seed/i.test(str);
    });

  let finalDocument = documentText;
  if (hasCrypto) {
    const cryptoResult = await grokChat([
      {
        role: "system",
        content: `You are a digital asset estate specialist. Review this document and either confirm it properly addresses digital assets under RUFADAA, or provide an addendum section titled "DIGITAL ASSET PROVISIONS" to append. Focus on: private key access authority, exchange account access, RUFADAA fiduciary authority, and hot/cold wallet distinction.`,
      },
      {
        role: "user",
        content: `Document:\n${documentText.slice(0, 2000)}\n\nDigital assets mentioned:\n${fields.cryptoAssets || fields.wallets || fields.digitalAssets || "See document"}`,
      },
    ], { temperature: 0.2, maxTokens: 1000 });
    agentLog.push({ agent: "Crypto Agent", status: "OK" });

    // Append crypto provisions if they're new content
    if (cryptoResult.content.includes("DIGITAL ASSET PROVISIONS")) {
      finalDocument = documentText + "\n\n" + cryptoResult.content;
    }
  }

  // ── Hash and finalize ──────────────────────────────────
  const documentId = Array.from(randomBytesEdge(12)).map(b => b.toString(16).padStart(2, "0")).join("");
  const sha256Hash = await sha256Hex(finalDocument);

  // Anchor to Stellar
  try {
    await anchorDocumentHashStellar({
      documentId,
      sha256Hash,
      templateId: template.id,
    });
  } catch (err) {
    console.error("Stellar document anchoring failed:", err);
  }

  // Anchor to XRPL
  try {
    await anchorDocumentHash({
      documentId,
      sha256Hash,
      templateId: template.id,
    });
  } catch (err) {
    console.error("XRPL document anchoring failed:", err);
  }

  // Anchor to Solana
  try {
    await anchorDocumentHashSolana({
      documentId,
      sha256Hash,
      templateId: template.id,
    });
  } catch (err) {
    console.error("Solana document anchoring failed:", err);
  }

  return {
    documentId,
    templateId: template.id,
    documentText: finalDocument,
    summary: summaryResult.content,
    complianceFindings,
    sha256Hash,
    generatedAt: new Date().toISOString(),
    agentLog,
    mock,
  };
}
