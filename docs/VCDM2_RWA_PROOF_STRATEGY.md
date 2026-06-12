# VCDM 2.0 RWA Proof Strategy — GemAssetCredential

Hybrid securing plan for **Allure Ruby + emerald bundle** credentials in Legacy Vault. Constants live in `lib/rwa/gem-asset-vc-schema.ts` → `DISCLOSURE_GROUPS`.

## VCDM 2.0 baseline

| Property | Value |
|----------|-------|
| `@context` | `https://www.w3.org/ns/credentials/v2` + `https://schema.fthtrading.com/gem/v1` |
| Validity | `validFrom` (required at issuance), `validUntil` (optional) |
| HTTP media types | `application/vc` (credentials), `application/vp` (presentations) |
| Data vs securing | Claims in `credentialSubject`; proofs in `proof` object |

## Issuance default

| Setting | Choice | Rationale |
|---------|--------|-----------|
| Default `proofType` | **`sd-jwt`** | Fastest path to production; mature JWT ecosystem |
| Alternate `proofType` | **`bbs`** | Data Integrity + BBS+ when guardian-grade privacy needed at issuance |
| Production SD-JWT | `501` until HSM / SD-JWT npm wired | Use `GEM_VC_ISSUANCE_MOCK=true` in dev |
| Production BBS+ | Real crypto when `MOCK_BBS` unset and `BBS_*_KEY_HEX` configured | See `.env.example` |

```
POST /api/vc/issue/gem-asset
{ "proofType": "sd-jwt", "credentialSubject": { ... } }   // default
{ "proofType": "bbs", "credentialSubject": { ... } }      // high-privacy issuance
```

## Presentation strategy by disclosure group

| Group | Audience | Securing (schema) | Recommended at launch | Notes |
|-------|----------|-------------------|----------------------|-------|
| `collateral_lending` | Lenders / collateral desks | SD-JWT | **SD-JWT** presentation | Minimal claim set; JWT-friendly desk integrations |
| `secondary_market` | Marketplace buyers | SD-JWT | **BBS+** when unlinkability required | Upgrade to BBS+ before secondary liquidity to prevent presentation correlation |
| `regulatory_full` | Regulators / accredited | SD-JWT | **SD-JWT** | Full claim disclosure; correlation less critical |
| `guardian_internal` | Legacy guardian quorum | BBS+ | **BBS+** | Includes `vaultRef`, `chainAnchorRef`, `troptionsmintMetadata`, `oracleRef` |

TypeScript source of truth:

```typescript
// lib/rwa/gem-asset-vc-schema.ts — DISCLOSURE_GROUPS
collateral_lending  → securing: "SD-JWT"
secondary_market    → securing: "SD-JWT"  // presentations: prefer BBS+ when live
regulatory_full     → securing: "SD-JWT"
guardian_internal   → securing: "BBS+"
```

## API routing

| Flow | Endpoint | Mechanism |
|------|----------|-----------|
| Issue gem VC | `POST /api/vc/issue/gem-asset` | `proofType: sd-jwt \| bbs` |
| BBS+ present | `POST /api/vc/present/bbs` | `disclosedClaims[]` + optional `challenge` |
| BBS+ verify | `POST /api/vc/verify/bbs` | Full VC + presentation |
| SD-JWT present (Brick #1 provenance) | `POST /api/vc/present/selective` | Stub — see `docs/ruby-rwa/API_SD_JWT.md` |
| Asset provenance issue | `POST /api/vc/issue/asset-provenance` | Stub |

## Valuation policy

Never assert package NAV in machine-readable claims. Use `valuation.amount: null`, `appraisalStatus: "TBD"`, and `APPRAISAL_TBD_NOTE` until independent appraisal is on file.

## Roadmap bricks

| Brick | Work |
|-------|------|
| **#11** | Real SD-JWT npm / HSM signing on `proofType: sd-jwt` |
| **#12** | BBS+ production keys + release-engine `vc_presentation_verified` condition |
| **#13** | Wire `collateral_lending` presentations into troptionsmint Token-2022 metadata |

## Related

- [DATA_INTEGRITY_VS_SD_JWT.md](./DATA_INTEGRITY_VS_SD_JWT.md)
- [ruby-rwa/GEM_ASSET_VC_SCHEMA.md](./ruby-rwa/GEM_ASSET_VC_SCHEMA.md)
- [did-vc-selective-disclosure.md](./did-vc-selective-disclosure.md)
