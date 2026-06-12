// Client-side only — dynamically imported. Do not import at top level in server components.

// ─── Color palette ────────────────────────────────────────────────────────────
type RGB = [number, number, number];
const NAVY: RGB       = [15, 23, 42];
const NAVY_800: RGB   = [30, 41, 59];
const NAVY_700: RGB   = [51, 65, 85];
const GOLD: RGB       = [217, 119, 6];
const GOLD_300: RGB   = [252, 211, 77];
const WHITE: RGB      = [255, 255, 255];
const SLATE_400: RGB  = [148, 163, 184];
const SLATE_500: RGB  = [100, 116, 139];
const RED: RGB        = [153, 27, 27];
const LIGHT: RGB      = [248, 250, 252];

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ExportSection {
  title: string;
  rows?: [string, string][];
  table?: { headers: string[]; rows: string[][] };
}

export interface ExportData {
  type: string;
  docId: string;
  generatedAt: string;
  ipfsCid?: string;
  chainHash?: string;
  namespace?: string;
  namespaceDetails?: Record<string, string>;
  sections?: ExportSection[];
  rows?: Record<string, unknown>[];
  events?: Record<string, string>[];
  members?: Record<string, string>[];
  [key: string]: unknown;
}

const DOC_TITLES: Record<string, string> = {
  "estate-summary":          "Estate Summary",
  "namespace-manifest":      "Namespace Manifest",
  "asset-inventory":         "Vault Asset Inventory",
  "executor-packet":         "Executor Authority Packet",
  "beneficiary-packet":      "Beneficiary Access Packet",
  "audit-log-csv":           "Audit Log",
  "audit-log-json":          "Audit Log",
  "release-policy-snapshot": "Release Policy Snapshot",
  "cross-chain-summary":     "Cross-Chain Asset Summary",
  "x402-billing":            "x402 Billing Summary",
};

// ─── jsPDF helper (any-typed to avoid SSR import) ────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = any;

function setFill(doc: Doc, c: RGB)   { doc.setFillColor(c[0], c[1], c[2]); }
function setStroke(doc: Doc, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }
function setTxt(doc: Doc, c: RGB)    { doc.setTextColor(c[0], c[1], c[2]); }

// ─── Header ──────────────────────────────────────────────────────────────────
function drawHeader(doc: Doc, data: ExportData) {
  const W: number = doc.internal.pageSize.getWidth();

  // ── Navy bar ──
  setFill(doc, NAVY);
  doc.rect(0, 0, W, 30, "F");

  // ── Gold accent strip ──
  setFill(doc, GOLD);
  doc.rect(0, 30, W, 1.5, "F");

  // ── Logo mark: gold border + LVP monogram ──
  setFill(doc, GOLD);
  doc.roundedRect(12, 7, 16, 18, 2, 2, "F");
  setFill(doc, NAVY);
  doc.roundedRect(13.5, 8.5, 13, 13, 1.5, 1.5, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  setTxt(doc, GOLD_300);
  doc.text("LVP", 20, 17.5, { align: "center" });
  setFill(doc, GOLD);
  doc.circle(20, 22.5, 1.2, "F");

  // ── Main title ──
  doc.setFontSize(15.5);
  doc.setFont("helvetica", "bold");
  setTxt(doc, WHITE);
  doc.text("LEGACY VAULT PROTOCOL", 33, 14);

  // ── Subtitle ──
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setTxt(doc, SLATE_400);
  doc.text("FTH Trading  ·  Estate Document Services  ·  Sovereign Web3 Vault", 33, 22);

  // ── CONFIDENTIAL badge ──
  setFill(doc, RED);
  doc.roundedRect(W - 47, 7, 42, 10, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  setTxt(doc, WHITE);
  doc.text("CONFIDENTIAL", W - 26, 13.5, { align: "center" });

  // ── Document title (below gold strip) ──
  const docTitle = DOC_TITLES[data.type] ?? data.type.replace(/-/g, " ").toUpperCase();
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  setTxt(doc, NAVY);
  doc.text(docTitle, 15, 44);

  // ── Metadata ──
  const genDate = (() => {
    try {
      return new Date(data.generatedAt).toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch { return data.generatedAt; }
  })();

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  setTxt(doc, SLATE_500);
  doc.text(`Document ID: ${data.docId}`, 15, 53);
  doc.text(`Generated: ${genDate}`, 15, 58);

  if (data.ipfsCid) {
    const cid = String(data.ipfsCid);
    doc.text(`IPFS CID: ${cid.length > 42 ? cid.slice(0, 42) + "..." : cid}`, 105, 53);
  }
  if (data.chainHash) {
    const h = String(data.chainHash);
    doc.text(`Chain Hash: ${h.length > 42 ? h.slice(0, 42) + "..." : h}`, 105, 58);
  }

  const nsStr = data.namespace && typeof data.namespace === "string" ? data.namespace : "";
  if (nsStr) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setTxt(doc, NAVY_800);
    doc.text(`Namespace: ${nsStr}`, 15, 64);
  }

  // ── Divider ──
  setStroke(doc, NAVY_700);
  doc.setLineWidth(0.3);
  doc.line(15, 68, W - 15, 68);
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function drawFooter(doc: Doc, page: number, total: number) {
  const W: number = doc.internal.pageSize.getWidth();
  const H: number = doc.internal.pageSize.getHeight();

  setFill(doc, GOLD);
  doc.rect(0, H - 22, W, 0.8, "F");

  setFill(doc, NAVY);
  doc.rect(0, H - 21.2, W, 21.2, "F");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  setTxt(doc, SLATE_500);
  doc.text(
    "ATTORNEY-CLIENT PRIVILEGED  ·  CONFIDENTIAL  ·  FOR AUTHORIZED PARTIES ONLY",
    W / 2, H - 13, { align: "center" }
  );
  setTxt(doc, SLATE_400);
  doc.text("Legacy Vault Protocol v1.0  ·  FTH Trading  ·  legacy-vault.io", 15, H - 7);
  doc.text(`Page ${page} of ${total}`, W - 15, H - 7, { align: "right" });
}

// ─── Section heading ─────────────────────────────────────────────────────────
function drawSectionHeading(doc: Doc, title: string, y: number): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setTxt(doc, NAVY);
  doc.text(title.toUpperCase(), 15, y);
  setFill(doc, GOLD);
  doc.rect(15, y + 1.5, 60, 0.6, "F");
  return y + 9;
}

// ─── Key-value rows ───────────────────────────────────────────────────────────
function drawKV(doc: Doc, rows: [string, string][], startY: number): number {
  const W: number = doc.internal.pageSize.getWidth();
  let y = startY;
  rows.forEach(([k, v], i) => {
    if (i % 2 === 0) {
      setFill(doc, LIGHT);
      doc.rect(15, y - 4.5, W - 30, 7.2, "F");
    }
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setTxt(doc, SLATE_500);
    doc.text(k, 18, y);
    doc.setFont("helvetica", "normal");
    setTxt(doc, NAVY_800);
    // Truncate long values
    const vStr = String(v ?? "—");
    doc.text(vStr.length > 70 ? vStr.slice(0, 68) + "…" : vStr, 80, y);
    y += 7.2;
  });
  return y + 5;
}

// ─── Watermark ───────────────────────────────────────────────────────────────
function drawWatermark(doc: Doc) {
  const W: number = doc.internal.pageSize.getWidth();
  const H: number = doc.internal.pageSize.getHeight();
  doc.setFontSize(52);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(235, 235, 235);
  doc.text("LEGACY VAULT", W / 2, H / 2 + 15, { align: "center", angle: 40 });
}

// ─── Table style constants ────────────────────────────────────────────────────
const HEAD_STYLE = {
  fillColor: NAVY,
  textColor: GOLD,
  fontStyle: "bold" as const,
  fontSize: 8,
};
const CELL_STYLE = {
  fontSize: 7.5,
  cellPadding: 3,
  textColor: NAVY_800,
  lineColor: [226, 232, 240] as RGB,
  lineWidth: 0.2,
};
const ALT_ROW = { fillColor: LIGHT };

// ─── Core PDF builder ─────────────────────────────────────────────────────────
async function buildPdf(data: ExportData): Promise<Doc> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  drawHeader(doc, data);
  drawWatermark(doc);

  let y = 76;

  function runTable(head: string[][], body: string[][], atY: number): number {
    autoTable(doc, {
      head,
      body,
      startY: atY,
      margin: { left: 15, right: 15, top: 25 },
      styles: CELL_STYLE,
      headStyles: HEAD_STYLE,
      alternateRowStyles: ALT_ROW,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((doc as any).lastAutoTable?.finalY ?? atY + body.length * 8) + 10;
  }

  function needsPage(atY: number): number {
    if (atY > 235) { doc.addPage(); return 25; }
    return atY;
  }

  // ── Sections (estate-summary, executor-packet, beneficiary-packet, etc.) ──
  if (data.sections) {
    for (const sec of data.sections as ExportSection[]) {
      y = needsPage(y);
      if (sec.table) {
        y = drawSectionHeading(doc, sec.title, y);
        y = runTable([sec.table.headers], sec.table.rows, y);
      } else if (sec.rows) {
        y = drawSectionHeading(doc, sec.title, y);
        y = drawKV(doc, sec.rows as [string, string][], y);
        y += 3;
      }
    }
  }

  // ── Namespace manifest ──
  if (data.type === "namespace-manifest") {
    if (data.namespaceDetails) {
      y = needsPage(y);
      y = drawSectionHeading(doc, "Namespace Details", y);
      const nd = data.namespaceDetails as Record<string, string>;
      y = drawKV(doc, Object.entries(nd) as [string, string][], y);
      y += 3;
    }
    if (data.members) {
      y = needsPage(y);
      y = drawSectionHeading(doc, "Namespace Members", y);
      y = runTable(
        [["Role", "Name", "Wallet Address"]],
        (data.members as Record<string, string>[]).map(m => [m.role, m.name, m.address]),
        y
      );
    }
  }

  // ── Asset inventory ──
  if (data.rows && data.type === "asset-inventory") {
    y = runTable(
      [["Category", "Type", "Name / Description", "Wallet Ref", "IPFS CID", "Status"]],
      (data.rows as Record<string, string>[]).map(r => [
        r.category, r.type, r.name, r.walletRef || "—",
        String(r.ipfsCid).slice(0, 20) + "...", r.status,
      ]),
      y
    );
  }

  // ── Audit log events ──
  if (data.events) {
    y = needsPage(y);
    y = drawSectionHeading(doc, "Audit Events", y);
    y = runTable(
      [["ID", "Timestamp", "Event Type", "Actor", "Detail"]],
      (data.events as Record<string, string>[]).map(e => [e.id, e.ts, e.type, e.actor, e.detail]),
      y
    );
  }

  // ── x402 billing ──
  if (data.rows && data.type === "x402-billing") {
    y = runTable(
      [["Service ID", "Service", "Units", "USDF", "Timestamp", "Gateway", "Status"]],
      (data.rows as Record<string, string>[]).map(r => [
        r.serviceId, r.service, r.units, r.usdf, r.ts, r.gateway, r.status,
      ]),
      y
    );
  }

  // ── Add footers to every page ──
  const total: number = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawFooter(doc, p, total);
  }

  return doc;
}

// ─── CSV helper ───────────────────────────────────────────────────────────────
function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map(r => keys.map(k => esc(r[k])).join(","))].join("\n");
}

// ─── Public download entry point ──────────────────────────────────────────────
export async function downloadExport(
  data: ExportData,
  name: string,
  format: string
): Promise<void> {
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  if (format === "PDF") {
    const doc = await buildPdf(data);
    doc.save(`${slug}-${data.docId}.pdf`);
    return;
  }

  let content: string;
  let mime: string;
  let ext: string;

  if (format === "JSON") {
    content = JSON.stringify(data, null, 2);
    mime = "application/json";
    ext = "json";
  } else {
    // CSV
    const rows = (data.rows ?? data.events ?? []) as Record<string, unknown>[];
    content = toCSV(rows);
    mime = "text/csv";
    ext = "csv";
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}-${data.docId}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
