import * as bbs from "@digitalbazaar/bbs-signatures";
import { BBS_CIPHERSUITE, fromBase64 } from "./bbs-messages";

export interface BbsKeyMaterial {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
}

export function isMockBbsEnabled(): boolean {
  return process.env.MOCK_BBS === "true";
}

let cachedKeys: BbsKeyMaterial | null = null;

export async function loadOrGenerateBbsKeys(): Promise<BbsKeyMaterial> {
  const secretHex = process.env.BBS_SECRET_KEY_HEX;
  const publicHex = process.env.BBS_PUBLIC_KEY_HEX;

  if (secretHex && publicHex) {
    return {
      secretKey: fromBase64(secretHex),
      publicKey: fromBase64(publicHex),
    };
  }

  if (!cachedKeys) {
    cachedKeys = await bbs.generateKeyPair({ ciphersuite: BBS_CIPHERSUITE });
  }
  return cachedKeys;
}

export async function exportKeyPairBase64(
  keys: BbsKeyMaterial
): Promise<{ secretKeyB64: string; publicKeyB64: string }> {
  return {
    secretKeyB64: Buffer.from(keys.secretKey).toString("base64"),
    publicKeyB64: Buffer.from(keys.publicKey).toString("base64"),
  };
}
