/**
 * Canonical BBS+ message encoding for GemAssetCredential claims.
 * Each atomic claim path becomes one signed message: `path:canonicalJSON`.
 */

const textEncoder = new TextEncoder();

export const BBS_CIPHERSUITE = "BLS12-381-SHA-256" as const;

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalJson(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

/** Flatten credentialSubject into ordered claim paths for BBS signing. */
export function flattenClaims(
  subject: Record<string, unknown>,
  prefix = ""
): Array<{ path: string; value: unknown }> {
  const out: Array<{ path: string; value: unknown }> = [];

  for (const [key, value] of Object.entries(subject)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      out.push(...flattenClaims(value as Record<string, unknown>, path));
    } else {
      out.push({ path, value });
    }
  }

  return out.sort((a, b) => a.path.localeCompare(b.path));
}

export function claimsToBbsMessages(
  subject: Record<string, unknown>
): { messages: Uint8Array[]; messageMap: string[] } {
  const flat = flattenClaims(subject);
  const messageMap = flat.map((c) => c.path);
  const messages = flat.map((c) =>
    textEncoder.encode(`${c.path}:${canonicalJson(c.value)}`)
  );
  return { messages, messageMap };
}

export function resolveDisclosedIndexes(
  messageMap: string[],
  disclosedPaths: string[]
): number[] {
  const indexes: number[] = [];
  for (const path of disclosedPaths) {
    const idx = messageMap.indexOf(path);
    if (idx === -1) {
      throw new Error(`Unknown claim path for disclosure: ${path}`);
    }
    indexes.push(idx);
  }
  return indexes.sort((a, b) => a - b);
}

export function filterDisclosedSubject(
  subject: Record<string, unknown>,
  disclosedPaths: string[]
): Record<string, unknown> {
  const flat = flattenClaims(subject);
  const allowed = new Set(disclosedPaths);
  const out: Record<string, unknown> = {};

  for (const { path, value } of flat) {
    if (!allowed.has(path)) continue;
    setNested(out, path, value);
  }

  return out;
}

function setNested(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur) || typeof cur[p] !== "object" || cur[p] === null) {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function fromBase64(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"));
}
