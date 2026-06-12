# GemAssetCredential v1 — Allure Ruby RWA

VCDM 2.0 verifiable credential schema for the **Allure Ruby + emerald bundle** institutional RWA program.

> Canonical JSON-LD is mirrored in [FTHTrading/ruby `docs/vc-schemas`](https://github.com/FTHTrading/ruby/tree/main/docs/vc-schemas) and served from this repo at [`/schemas/gem-asset-v1.jsonld`](../../public/schemas/gem-asset-v1.jsonld). **Issuance happens only here** (Legacy Vault Protocol).

## Credential type

| Field | Value |
|-------|-------|
| Type | `GemAssetCredential` |
| Subject `@type` | `GemAsset` |
| Context | `https://www.w3.org/ns/credentials/v2` + `https://schema.fthtrading.com/gem/v1` |
| Schema ID | `https://schema.fthtrading.com/gem/v1/gem-asset-v1.jsonld` |

## credentialSubject claims

| Claim | Required | Notes |
|-------|----------|-------|
| `name` | ✅ | e.g. Allure Ruby |
| `gemType` | ✅ | `ruby`, `emerald`, … |
| `caratWeight` | ✅ | xsd:decimal carats |
| `certifications[]` | | Lab, redacted report # (`GIA-REDACTED`), SAMPLE CIDs |
| `legalOwner` | ✅ | SPV / custodian DID |
| `titleStatus` | ✅ | `clear`, `in_custody`, … |
| `valuation` | ✅ | **`amount` null / TBD** — see below |
| `manifestCID` | ✅ | Legacy Vault manifest (SAMPLE in repo) |
| `linkedRWATokens` | | Solana Token-2022 cross-ref |
| `vaultRef` | | Legacy Vault custody |
| `chainAnchorRef` | | Legacy Chain anchor |
| `troptionsmintMetadata` | | troptionsmint.com mint job |
| `oracleRef` | | GMIIE (xxxiii.io) feed |

### Valuation policy

```text
TBD — independent appraisal required; package NAV not asserted in repo
```

Do **not** populate `valuation.amount` from marketing estimates (e.g. package NAV figures). Set `appraisalStatus: "TBD"` until a third-party appraisal is on file.

## Selective disclosure

| Group | Audience | Securing | Key claims |
|-------|----------|----------|------------|
| `collateral_lending` | Lenders / collateral | **SD-JWT** | gemType, caratWeight, titleStatus, valuation status, cert labs, legalOwner |
| `secondary_market` | Marketplace | **SD-JWT** | + name, color, origin, treatment, certs, manifestCID, tokens |
| `regulatory_full` | Regulators / accredited | **SD-JWT** | All claims (`*`) |
| `guardian_internal` | Guardian quorum | **BBS+** | All + vaultRef, chainAnchorRef, troptionsmint, oracleRef |

TypeScript constants: [`lib/rwa/gem-asset-vc-schema.ts`](../../lib/rwa/gem-asset-vc-schema.ts) → `DISCLOSURE_GROUPS`.

## Stack integration

| System | VC integration | Repo / service |
|--------|----------------|----------------|
| Legacy Vault | `vaultRef`, `manifestCID`, encrypted cert storage | This repo |
| Legacy Chain | `chainAnchorRef` — manifest / VC digest anchor | `lib/blockchain/` |
| troptionsmint | `troptionsmintMetadata`, `linkedRWATokens` | troptionsmint.com |
| GMIIE | `oracleRef` | xxxiii.io |
| Ruby program | Schema docs + unsigned samples | [FTHTrading/ruby](https://github.com/FTHTrading/ruby) |

## Issuance API

```
POST /api/vc/issue/gem-asset
Content-Type: application/json

{
  "credentialSubject": { ... },
  "proofType": "sd-jwt",
  "disclosureGroup": "collateral_lending"
}
```

| Environment | Behavior |
|-------------|----------|
| Production | `501 Not Implemented` (validation passes) |
| `GEM_VC_ISSUANCE_MOCK=true` | `201` with unsigned mock VC |

## Securing mechanisms

1. **SD-JWT VC** (primary at issuance) — selective disclosure for lending, secondary, regulatory flows.
2. **BBS+ Data Integrity** (high privacy) — `BbsBlsSignature2020` / `BbsBlsSignatureProof2020`; see [`docs/BBS_PLUS_INTEGRATION.md`](../BBS_PLUS_INTEGRATION.md).

### VCDM 2.0 media types

| Artifact | Media type |
|----------|------------|
| Issued credential | `application/vc` |
| Selective presentation | `application/vp` |

### Dual proof examples (side-by-side)

| Mechanism | Sample file | `proof.type` | Default disclosure group |
|-----------|-------------|--------------|--------------------------|
| **SD-JWT** | [`examples/gem-vc-sd-jwt.json`](./examples/gem-vc-sd-jwt.json) | `SdJwtVcProof2024` | `collateral_lending` |
| **Data Integrity BBS+** | [`examples/gem-vc-data-integrity-bbs.json`](./examples/gem-vc-data-integrity-bbs.json) | `BbsBlsSignature2020` | `guardian_internal` (issuance) |

Both samples use `validFrom` / optional `validUntil` (not `issuanceDate` / `expirationDate`) and `@context` including `https://www.w3.org/ns/credentials/v2`.

**SD-JWT (collateral_lending)** — disclosed claim paths only in presentation layer; full VC issued with salted hashes (production).

**BBS+ (Data Integrity)** — atomic messages in `proof.messageMap`; holder derives `BbsBlsSignatureProof2020` via `POST /api/vc/present/bbs`.

Decision matrix: [`docs/DATA_INTEGRITY_VS_SD_JWT.md`](../DATA_INTEGRITY_VS_SD_JWT.md). Proof steps: [`docs/BBS_PLUS_PROOF_GENERATION.md`](../BBS_PLUS_PROOF_GENERATION.md).

## Related files

- Schema: [`public/schemas/gem-asset-v1.jsonld`](../../public/schemas/gem-asset-v1.jsonld)
- Context: [`public/schemas/gem-v1-context.jsonld`](../../public/schemas/gem-v1-context.jsonld)
- Types + validation: [`lib/rwa/gem-asset-vc-schema.ts`](../../lib/rwa/gem-asset-vc-schema.ts)
- Examples: [`examples/gem-vc-sd-jwt.json`](./examples/gem-vc-sd-jwt.json), [`examples/gem-vc-data-integrity-bbs.json`](./examples/gem-vc-data-integrity-bbs.json)
- Ruby samples: [github.com/FTHTrading/ruby/docs/vc-schemas](https://github.com/FTHTrading/ruby/tree/main/docs/vc-schemas)
