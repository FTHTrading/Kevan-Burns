# BBS+ Integration for Verifiable Credentials in Legacy Vault

## Overview

BBS+ (Boneh–Lynn–Shacham over BLS12-381) enables **unlinkable selective disclosure** for GemAssetCredential and guardian-internal presentations. Legacy uses [`@digitalbazaar/bbs-signatures`](https://github.com/digitalbazaar/bbs-signatures) v3 with ciphersuite `BLS12-381-SHA-256`.

Set `MOCK_BBS=true` for CI placeholder proofs; production uses `BBS_SECRET_KEY_HEX` / `BBS_PUBLIC_KEY_HEX`.

## Architecture

| Module | Role |
|--------|------|
| `lib/vc/bbs/bbs-messages.ts` | Canonical claim → BBS message encoding |
| `lib/vc/bbs/bbs-keys.ts` | Key load / `MOCK_BBS` flag |
| `lib/vc/bbs/BBSService.ts` | Issue, present, verify |

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/vc/issue/gem-asset` | Issue VC; `proofType: "bbs"` uses BBSService |
| `POST` | `/api/vc/present/bbs` | Selective disclosure presentation |
| `POST` | `/api/vc/verify/bbs` | Verify presentation (pass full credential for real crypto) |

## Environment

```env
MOCK_BBS=false
BBS_SECRET_KEY_HEX=   # base64 secret key
BBS_PUBLIC_KEY_HEX=   # base64 public key
```

Generate keys with `@digitalbazaar/bbs-signatures` `generateKeyPair` and base64-encode the `Uint8Array` values.

## Usage

```typescript
import { BBSService } from "@/lib/vc/bbs/BBSService";

const bbs = new BBSService();
const vc = await bbs.issueBBSVC(gemClaims, {
  issuerDid: "did:web:legacy.fthtrading.com:spv:allure",
});
const presentation = await bbs.createSelectiveProof(
  vc,
  ["titleStatus", "valuation.appraisalStatus"],
  verifierChallenge
);
const ok = await bbs.verifyPresentation(presentation, vc);
```

## Gem RWA

- Schema: `public/schemas/gem-asset-v1.jsonld`
- Disclosure group `guardian_internal` → BBS+
- Valuation claims default to **TBD** / `amount: null` — BBS+ proves signed claims, not NAV

## Docs & demos

- [BBS+ pairing math](./BBS_PLUS_PAIRING_MATH.md)
- [Allure Ruby E2E](./ruby-rwa/examples/bbs-allure-ruby-e2e.md)
- `pnpm demo:bbs-allure-ruby`

## Tests

`tests/unit/bbs-service.test.ts` — real crypto roundtrip + `MOCK_BBS` path.

## References

- W3C VCDM 2.0
- [IETF BBS Signatures draft](https://www.ietf.org/archive/id/draft-irtf-cfrg-bbs-signatures-06.html)
- Legacy multi-proof release engine
