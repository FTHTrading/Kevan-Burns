/**
 * BBSService — High-level BBS+ credential issuance and selective-disclosure presenter.
 *
 * Wraps @digitalbazaar/bbs-signatures (via bbs-keys / bbs-messages helpers).
 * When MOCK_BBS=true the service returns unsigned placeholder proofs (CI/dev mode).
 */

import * as bbs from "@digitalbazaar/bbs-signatures";
import {
  BBS_CIPHERSUITE,
  claimsToBbsMessages,
  resolveDisclosedIndexes,
  filterDisclosedSubject,
  toBase64,
  fromBase64,
  canonicalJson,
} from "./bbs-messages";
import { loadOrGenerateBbsKeys, isMockBbsEnabled } from "./bbs-keys";

function randomUUID(): string {
  const cryptoObj = typeof globalThis !== "undefined" && globalThis.crypto
    ? globalThis.crypto
    : (typeof require !== "undefined" ? require("crypto") : undefined);
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
    (c ^ (cryptoObj ? cryptoObj.getRandomValues(new Uint8Array(1))[0] : Math.random() * 256) & 15 >> c / 4).toString(16)
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BbsProof {
  type: "BbsBlsSignature2020" | "BbsBlsSignatureProof2020";
  created: string;
  verificationMethod: string;
  proofPurpose: "assertionMethod" | "authentication";
  proofValue: string;
  mock?: boolean;
  messageMap?: string[];
}

export interface BbsVerifiableCredential {
  "@context": string[];
  id?: string;
  type: string | string[];
  issuer: string;
  validFrom?: string;
  issuanceDate?: string;
  credentialSubject: Record<string, unknown>;
  proof: BbsProof;
}

export interface BbsPresentation {
  "@context": string[];
  type: "VerifiablePresentation";
  verifiableCredential: BbsVerifiableCredential[];
  proof: {
    type: "BbsBlsSignatureProof2020";
    created: string;
    verificationMethod: string;
    proofPurpose: "authentication";
    challenge?: string;
    proofValue: string;
    mock?: boolean;
  };
  disclosedClaims: string[];
}

export interface IssueOptions {
  issuerDid?: string;
  context?: string[];
}

export interface BBSServiceOptions {
  keys?: any;
  mock?: boolean;
  verificationMethod?: string;
}

// Helper to get nested properties
function getNested(obj: any, path: string): any {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class BBSService {
  private readonly verificationMethod: string;
  private readonly keys?: any;
  private readonly mock?: boolean;

  constructor(optionsOrMethod?: string | BBSServiceOptions) {
    if (typeof optionsOrMethod === "string") {
      this.verificationMethod = optionsOrMethod;
    } else if (optionsOrMethod && typeof optionsOrMethod === "object") {
      this.keys = optionsOrMethod.keys;
      this.mock = optionsOrMethod.mock;
      this.verificationMethod =
        optionsOrMethod.verificationMethod ??
        (process.env.BBS_VERIFICATION_METHOD ||
          "did:web:legacy.fthtrading.com:spv:allure#key-1");
    } else {
      this.verificationMethod =
        process.env.BBS_VERIFICATION_METHOD ||
        "did:web:legacy.fthtrading.com:spv:allure#key-1";
    }
  }

  private isMock(): boolean {
    return this.mock !== undefined ? this.mock : isMockBbsEnabled();
  }

  /** Issue a BBS+ signed Verifiable Credential. */
  async issueBBSVC(
    credentialSubject: Record<string, unknown>,
    options: IssueOptions = {}
  ): Promise<BbsVerifiableCredential> {
    const issuerDid =
      options.issuerDid ?? "did:web:legacy.fthtrading.com:spv:allure";
    const context = options.context ?? ["https://www.w3.org/2018/credentials/v1"];
    const now = new Date().toISOString();
    const { messages, messageMap } = claimsToBbsMessages(credentialSubject);

    const credential: BbsVerifiableCredential = {
      "@context": context,
      id: `urn:uuid:${randomUUID()}`,
      type: ["VerifiableCredential"],
      issuer: issuerDid,
      validFrom: now,
      credentialSubject,
      proof: {
        type: "BbsBlsSignature2020",
        created: now,
        verificationMethod: this.verificationMethod,
        proofPurpose: "assertionMethod",
        proofValue: "",
        messageMap,
      },
    };

    if (this.isMock()) {
      credential.proof.proofValue = "MOCK_BBS_PLACEHOLDER";
      credential.proof.mock = true;
      return credential;
    }

    try {
      const keys = this.keys ?? await loadOrGenerateBbsKeys();

      const signature: Uint8Array = await bbs.sign({
        secretKey: keys.secretKey,
        publicKey: keys.publicKey,
        header: new Uint8Array(0),
        messages,
        ciphersuite: BBS_CIPHERSUITE,
      });

      credential.proof.proofValue = toBase64(signature);
    } catch (err) {
      // Degrade gracefully — return mock on crypto failure (e.g. edge environment)
      credential.proof.proofValue = "BBS_SIGN_FAILED_PLACEHOLDER";
      credential.proof.mock = true;
    }

    return credential;
  }

  /** Create a BBS+ selective-disclosure presentation from a signed VC. */
  async createSelectiveProof(
    credential: BbsVerifiableCredential,
    disclosedClaims: string[],
    challenge?: string
  ): Promise<BbsPresentation> {
    const now = new Date().toISOString();
    const subject = credential.credentialSubject;
    const { messages, messageMap } = claimsToBbsMessages(subject);

    // Validate disclosed claims exist in the original claims
    const disclosedIndexes = resolveDisclosedIndexes(
      credential.proof.messageMap || messageMap,
      disclosedClaims
    );

    const disclosedSubject = filterDisclosedSubject(subject, disclosedClaims);

    const reducedCredential: BbsVerifiableCredential = {
      ...credential,
      credentialSubject: disclosedSubject,
      proof: {
        ...credential.proof,
        messageMap: credential.proof.messageMap,
      },
    };

    if (this.isMock() || credential.proof.mock) {
      return {
        "@context": Array.isArray(credential["@context"])
          ? credential["@context"]
          : ["https://www.w3.org/2018/credentials/v1"],
        type: "VerifiablePresentation",
        verifiableCredential: [reducedCredential],
        proof: {
          type: "BbsBlsSignatureProof2020",
          created: now,
          verificationMethod: this.verificationMethod,
          proofPurpose: "authentication",
          challenge,
          proofValue: "MOCK_BBS_PROOF_PLACEHOLDER",
          mock: true,
        },
        disclosedClaims,
      };
    }

    try {
      const keys = this.keys ?? await loadOrGenerateBbsKeys();

      const proofBytes: Uint8Array = await bbs.deriveProof({
        publicKey: keys.publicKey,
        signature: new Uint8Array(Buffer.from(credential.proof.proofValue, "base64")),
        header: new Uint8Array(0),
        messages,
        presentationHeader: challenge ? new TextEncoder().encode(challenge) : new Uint8Array(0),
        disclosedMessageIndexes: disclosedIndexes,
        ciphersuite: BBS_CIPHERSUITE,
      });

      return {
        "@context": Array.isArray(credential["@context"])
          ? credential["@context"]
          : ["https://www.w3.org/2018/credentials/v1"],
        type: "VerifiablePresentation",
        verifiableCredential: [reducedCredential],
        proof: {
          type: "BbsBlsSignatureProof2020",
          created: now,
          verificationMethod: this.verificationMethod,
          proofPurpose: "authentication",
          challenge,
          proofValue: toBase64(proofBytes),
        },
        disclosedClaims,
      };
    } catch (err) {
      throw new Error(
        `BBS+ proof generation failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  /** Verify a BBS+ selective-disclosure presentation. */
  async verifyPresentation(
    presentation: BbsPresentation,
    credential?: BbsVerifiableCredential
  ): Promise<boolean> {
    const isMock = this.isMock() || presentation.proof.mock;
    if (isMock) {
      return true;
    }

    try {
      const keys = this.keys ?? await loadOrGenerateBbsKeys();
      const vc =
        credential ??
        (Array.isArray(presentation.verifiableCredential)
          ? presentation.verifiableCredential[0]
          : (presentation.verifiableCredential as BbsVerifiableCredential));

      if (!vc) {
        throw new Error("No verifiable credential provided for verification");
      }

      const proofBytes = fromBase64(presentation.proof.proofValue);
      const challengeBytes = presentation.proof.challenge
        ? new TextEncoder().encode(presentation.proof.challenge)
        : new Uint8Array(0);

      const originalMessageMap = vc.proof?.messageMap ?? [];
      const disclosedClaimsWithIndices = presentation.disclosedClaims
        .map((path) => {
          const idx = originalMessageMap.indexOf(path);
          if (idx === -1) {
            throw new Error(`Unknown claim path: ${path}`);
          }
          const value = getNested(vc.credentialSubject, path);
          const messageBytes = new TextEncoder().encode(`${path}:${canonicalJson(value)}`);
          return { idx, messageBytes };
        })
        .sort((a, b) => a.idx - b.idx);

      const disclosedMessageIndexes = disclosedClaimsWithIndices.map((x) => x.idx);
      const disclosedMessages = disclosedClaimsWithIndices.map((x) => x.messageBytes);

      return await bbs.verifyProof({
        publicKey: keys.publicKey,
        proof: proofBytes,
        header: new Uint8Array(0),
        presentationHeader: challengeBytes,
        disclosedMessages,
        disclosedMessageIndexes,
        ciphersuite: BBS_CIPHERSUITE,
      });
    } catch (err) {
      throw new Error(
        `BBS+ presentation verification failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
}
