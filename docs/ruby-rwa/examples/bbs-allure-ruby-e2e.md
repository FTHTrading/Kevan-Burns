# BBS+ E2E — Allure Ruby GemAssetCredential

End-to-end walkthrough: issue a BBS+ GemAssetCredential for the Allure Ruby, create a selective disclosure presentation, and verify it.

**Valuation:** `amount` is `null`, `appraisalStatus` is `TBD` — no package NAV is asserted.

## Prerequisites

```bash
pnpm install
# Real crypto (default):
MOCK_BBS=false pnpm demo:bbs-allure-ruby

# CI / stub path:
MOCK_BBS=true pnpm demo:bbs-allure-ruby
```

## 1. Issue credential (`proofType: "bbs"`)

```bash
curl -s -X POST http://localhost:3000/api/vc/issue/gem-asset \
  -H "Content-Type: application/json" \
  -d @docs/ruby-rwa/examples/payloads/allure-ruby-issue.json | jq .
```

Or run the demo script (no server required):

```bash
pnpm demo:bbs-allure-ruby
```

## 2. Selective presentation

Disclose only `name`, `titleStatus`, and `valuation.appraisalStatus` to a collateral verifier:

```bash
curl -s -X POST http://localhost:3000/api/vc/present/bbs \
  -H "Content-Type: application/json" \
  -d '{
    "credential": <issued-credential-json>,
    "disclosedClaims": ["name", "titleStatus", "valuation.appraisalStatus"],
    "challenge": "collateral-desk-nonce-2026-06-04"
  }' | jq .
```

Hidden from the verifier: `manifestCID`, `legalOwner`, `valuation.amount`, internal oracle refs.

## 3. Verify presentation

```bash
curl -s -X POST http://localhost:3000/api/vc/verify/bbs \
  -H "Content-Type: application/json" \
  -d '{
    "presentation": <presentation-json>,
    "credential": <full-issued-credential-json>
  }' | jq .
```

Expected: `{ "verified": true }` when using real BBS+ crypto and the full credential for message reconstruction.

## Disclosure group mapping

| Group | Securing | Example disclosed paths |
|-------|----------|-------------------------|
| `collateral_lending` | SD-JWT | `titleStatus`, `valuation.appraisalStatus` |
| `guardian_internal` | BBS+ | all claims + `vaultRef`, `oracleRef` |

See [`GEM_ASSET_VC_SCHEMA.md`](../GEM_ASSET_VC_SCHEMA.md) for full group definitions.

## Runnable demo

`scripts/demo/bbs-allure-ruby-e2e.ts` performs issue → present → verify in-process and prints a summary. Use it in CI with `MOCK_BBS=true`.

## Related

- [BBS+ pairing math](../../BBS_PLUS_PAIRING_MATH.md)
- [BBS+ integration](../../BBS_PLUS_INTEGRATION.md)
