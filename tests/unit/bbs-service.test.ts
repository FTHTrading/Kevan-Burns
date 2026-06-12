import { describe, it, expect } from "vitest";
import * as bbs from "@digitalbazaar/bbs-signatures";
import { BBSService } from "@/lib/vc/bbs/BBSService";
import { BBS_CIPHERSUITE } from "@/lib/vc/bbs/bbs-messages";
import { APPRAISAL_TBD_NOTE } from "@/lib/rwa/gem-asset-vc-schema";

const sampleClaims = {
  name: "Allure Ruby",
  gemType: "ruby",
  caratWeight: 54.0,
  titleStatus: "in_custody",
  legalOwner: "did:web:legacy.fthtrading.com:spv:allure-holdings",
  valuation: {
    amount: null,
    currency: "USD",
    appraisalStatus: "TBD",
    appraisalNote: APPRAISAL_TBD_NOTE,
  },
  manifestCID: "bafybei-SAMPLE-ALLURE-MANIFEST-CID-001",
};

describe("BBSService", () => {
  it("issues, presents, and verifies with real BBS+ roundtrip", async () => {
    const keys = await bbs.generateKeyPair({ ciphersuite: BBS_CIPHERSUITE });
    const service = new BBSService({ keys, mock: false });

    const vc = await service.issueBBSVC(sampleClaims, {
      issuerDid: "did:web:legacy.fthtrading.com:spv:allure",
    });

    expect(vc.proof?.type).toBe("BbsBlsSignature2020");
    expect(vc.proof?.proofValue).not.toBe("MOCK_BBS_SIGNATURE");
    expect(vc.proof?.messageMap).toContain("name");
    expect(vc.proof?.messageMap).toContain("valuation.amount");

    const presentation = await service.createSelectiveProof(
      vc,
      ["name", "titleStatus", "valuation.appraisalStatus"],
      "verifier-nonce-001"
    );

    expect(presentation.proof.type).toBe("BbsBlsSignatureProof2020");
    expect(presentation.proof.mock).toBeUndefined();
    expect(
      presentation.verifiableCredential[0].credentialSubject
    ).toMatchObject({
      name: "Allure Ruby",
      titleStatus: "in_custody",
    });
    expect(
      presentation.verifiableCredential[0].credentialSubject
    ).not.toHaveProperty("manifestCID");

    const verified = await service.verifyPresentation(presentation, vc);
    expect(verified).toBe(true);
  });

  it("supports MOCK_BBS fast path for CI", async () => {
    const service = new BBSService({ mock: true });
    const vc = await service.issueBBSVC(sampleClaims, {
      issuerDid: "did:web:legacy.fthtrading.com:spv:allure",
    });

    const presentation = await service.createSelectiveProof(
      vc,
      ["name", "gemType"],
      "ci-challenge"
    );

    expect(presentation.proof.mock).toBe(true);
    expect(await service.verifyPresentation(presentation)).toBe(true);
  });

  it("rejects unknown disclosure paths", async () => {
    const keys = await bbs.generateKeyPair({ ciphersuite: BBS_CIPHERSUITE });
    const service = new BBSService({ keys, mock: false });
    const vc = await service.issueBBSVC(sampleClaims, {
      issuerDid: "did:web:legacy.fthtrading.com:spv:allure",
    });

    await expect(
      service.createSelectiveProof(vc, ["nonexistent.claim"], "x")
    ).rejects.toThrow(/Unknown claim path/);
  });
});
