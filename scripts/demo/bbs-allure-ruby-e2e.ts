#!/usr/bin/env tsx
/**
 * BBS+ E2E demo: Allure Ruby GemAssetCredential
 * issue → selective present → verify
 *
 * Usage:
 *   pnpm demo:bbs-allure-ruby
 *   MOCK_BBS=true pnpm demo:bbs-allure-ruby
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { BBSService } from "../../lib/vc/bbs/BBSService";
import { isMockBbsEnabled } from "../../lib/vc/bbs/bbs-keys";
import { GemAssetIssueRequestSchema } from "../../lib/rwa/gem-asset-vc-schema";
import { GEM_ASSET_CONTEXT } from "../../lib/rwa/gem-asset-vc-schema";

const payloadPath = resolve(
  __dirname,
  "../../docs/ruby-rwa/examples/payloads/allure-ruby-issue.json"
);

async function main() {
  const raw = JSON.parse(readFileSync(payloadPath, "utf8"));
  const parsed = GemAssetIssueRequestSchema.parse(raw);
  const mock = isMockBbsEnabled();

  console.log("=== BBS+ Allure Ruby E2E ===");
  console.log(`MOCK_BBS: ${mock}`);

  const service = new BBSService();
  const vc = await service.issueBBSVC(parsed.credentialSubject, {
    issuerDid: parsed.issuerDid!,
    context: [...GEM_ASSET_CONTEXT],
  });

  console.log("\n1) Issued VC");
  console.log(`   id: ${vc.id}`);
  console.log(`   proof: ${vc.proof?.type} (${vc.proof?.mock ? "mock" : "real"})`);
  console.log(`   messages: ${vc.proof?.messageMap?.length ?? 0}`);

  const disclosed = [
    "name",
    "titleStatus",
    "valuation.appraisalStatus",
    "valuation.appraisalNote",
  ];
  const challenge = `demo-challenge-${Date.now()}`;

  const presentation = await service.createSelectiveProof(
    vc,
    disclosed,
    challenge
  );

  console.log("\n2) Selective presentation");
  console.log(`   disclosed: ${disclosed.join(", ")}`);
  console.log(`   hidden includes manifestCID: ${!("manifestCID" in presentation.verifiableCredential[0].credentialSubject)}`);

  const verified = await service.verifyPresentation(presentation, vc);

  console.log("\n3) Verification");
  console.log(`   verified: ${verified}`);

  if (!verified) {
    process.exit(1);
  }

  console.log("\n✓ E2E complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
