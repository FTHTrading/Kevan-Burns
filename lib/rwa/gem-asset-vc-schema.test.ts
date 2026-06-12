import { describe, it, expect } from "vitest";
import {
  APPRAISAL_TBD_NOTE,
  DISCLOSURE_GROUPS,
  GemAssetSubjectSchema,
  validateGemAssetSubject,
} from "./gem-asset-vc-schema";

const sampleSubject = {
  id: "did:web:legacy.fthtrading.com:asset:allure-ruby-54ct",
  type: "GemAsset" as const,
  name: "Allure Ruby",
  gemType: "ruby" as const,
  caratWeight: 54.0,
  color: "Purple Red / vivid hue",
  treatment: "heated",
  certifications: [
    {
      type: "GemCertification" as const,
      lab: "GIA" as const,
      reportNumber: "GIA-REDACTED",
      reportCID: "bafybei-SAMPLE-GIA-REPORT-CID-001",
    },
  ],
  legalOwner: "did:web:legacy.fthtrading.com:spv:allure-holdings",
  titleStatus: "in_custody" as const,
  valuation: {
    type: "GemValuation" as const,
    amount: null,
    currency: "USD",
    asOf: null,
    appraisalStatus: "TBD" as const,
    appraisalNote: APPRAISAL_TBD_NOTE,
  },
  manifestCID: "bafybei-SAMPLE-ALLURE-MANIFEST-CID-001",
  oracleRef: {
    type: "OracleRef" as const,
    oracleProvider: "GMIIE",
    oracleFeedId: "gmii:allure-ruby-nav-feed-SAMPLE",
  },
};

describe("gem-asset-vc-schema", () => {
  it("parses sample Allure Ruby credentialSubject", () => {
    const parsed = GemAssetSubjectSchema.parse(sampleSubject);
    expect(parsed.name).toBe("Allure Ruby");
    expect(parsed.caratWeight).toBe(54.0);
    expect(parsed.valuation.amount).toBeNull();
    expect(parsed.valuation.appraisalNote).toContain("package NAV not asserted");
  });

  it("validateGemAssetSubject returns success for valid subject", () => {
    const result = validateGemAssetSubject(sampleSubject);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gemType).toBe("ruby");
    }
  });

  it("rejects subject missing required manifestCID", () => {
    const { manifestCID: _, ...incomplete } = sampleSubject;
    const result = validateGemAssetSubject(incomplete);
    expect(result.success).toBe(false);
  });

  it("defines four disclosure groups with expected securing", () => {
    expect(Object.keys(DISCLOSURE_GROUPS)).toHaveLength(4);
    expect(DISCLOSURE_GROUPS.collateral_lending.securing).toBe("SD-JWT");
    expect(DISCLOSURE_GROUPS.guardian_internal.securing).toBe("BBS+");
    expect(DISCLOSURE_GROUPS.collateral_lending.claims).toContain("legalOwner");
  });
});
