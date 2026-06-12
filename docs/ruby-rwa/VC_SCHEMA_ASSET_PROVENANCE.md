# AssetProvenanceCredential — Allure Ruby + Siam Emerald

**VC type:** `AssetProvenanceCredential`  
**Track:** Allure Ruby + Siam Emerald gem RWA bundle (valuation TBD — not asserted in repo)  
**Code:** `lib/rwa/vc-schema.ts`  
**Selective disclosure overview:** [../did-vc-selective-disclosure.md](../did-vc-selective-disclosure.md)

All examples use **synthetic placeholders** only. No production CIDs, dollar valuations, or PII.

---

## 1. Full claim set (all disclosable fields)

| Claim | Type | Description |
|-------|------|-------------|
| `assetId` | string | Stable bundle identifier (`allure-siam-bundle-synth-001`) |
| `assetType` | `ruby` \| `emerald` \| `bundle` | Structural type |
| `caratWeight` | number | Total carat weight (bundle aggregate) |
| `certIssuerCids` | string[] | IPFS CIDs for lab reports (Gübelin, SSEF, etc.) — ciphertext in vault |
| `origin` | string | Geographic / mine provenance summary |
| `treatmentDisclosure` | string | Heat / oil / fracture disclosure narrative |
| `heatedFlag` | boolean | Whether heat treatment applies |
| `spvDid` | string | SPV controller DID |
| `legacyVaultManifestCid` | string | Legacy manifest CID anchoring encrypted doc set |
| `independentAppraisalRef` | string? | Pointer to appraisal artifact (`ref:appraisal-synth-tbd`) |
| `gmiiOracleRef` | string? | GMII oracle snapshot ref |
| `lienStatus` | enum | `none` \| `pending` \| `satisfied` \| `disputed` |
| `clearTitle` | boolean | No competing title claims on record |
| `custodySkrRef` | string | Safe-keeping receipt / custody ref |
| `certTierSummary` | enum | `premium` \| `standard` \| `supplemental` \| `ungraded` |
| `valuationAboveThreshold` | boolean \| string | Threshold boolean or `ref:band-*` without USD amount |
| `issuedAt` | ISO 8601 | Credential issuance timestamp |
| `issuerDid` | string | Issuer DID (operator / SPV) |
| `guardianRole` | string? | Guardian presentation only |
| `authorizationLevel` | enum? | `read` \| `approve` \| `release` |
| `certIssuerCount` | number? | Derived count when CIDs withheld |

---

## 2. SD-JWT disclosure groups

Defined in `DISCLOSURE_GROUP_CLAIMS` (`lib/rwa/vc-schema.ts`).

### `lender-minimal`

For credit, lien, and collateral verification.

| Claim | Notes |
|-------|-------|
| `clearTitle` | Required |
| `lienStatus` | Required |
| `certTierSummary` | Gübelin-tier rollup — **not** full `certIssuerCids[]` |
| `valuationAboveThreshold` | Boolean or band ref — **not** appraisal USD |

### `investor-placement`

For Reg D/S placement rooms.

| Claim | Notes |
|-------|-------|
| `origin` | |
| `treatmentDisclosure` | Summary text |
| `certIssuerCount` | Instead of full CID list |
| `spvDid` | |
| `assetType` | |

### `full-diligence`

All claims in §1 (accredited + NDA). Vault still holds encrypted PDFs; verifier resolves CIDs out-of-band.

### `guardian-auth`

| Claim | Notes |
|-------|-------|
| `guardianRole` | e.g. `quorum-member` |
| `authorizationLevel` | No names, emails, or wallet addresses |

---

## 3. Example — full credential JSON (synthetic)

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/security/data-integrity/v2"
  ],
  "id": "urn:uuid:vc_synth_allure_siam_001",
  "type": ["VerifiableCredential", "AssetProvenanceCredential"],
  "issuer": "did:web:issuer.synth.example",
  "validFrom": "2026-06-01T12:00:00Z",
  "credentialSubject": {
    "id": "did:web:spv.synth.example",
    "type": "AssetProvenanceCredential",
    "assetId": "allure-siam-bundle-synth-001",
    "assetType": "bundle",
    "caratWeight": 42.5,
    "certIssuerCids": [
      "bafySyntheticGubelinReportCid0001",
      "bafySyntheticSsefReportCid0002"
    ],
    "origin": "Mozambique / Myanmar (synthetic summary)",
    "treatmentDisclosure": "Minor heat; routine clarity enhancement (synthetic)",
    "heatedFlag": true,
    "spvDid": "did:web:spv.synth.example",
    "legacyVaultManifestCid": "bafySyntheticManifestCid0003",
    "independentAppraisalRef": "ref:appraisal-synth-tbd",
    "gmiiOracleRef": "ref:gmii-synth-snapshot-001",
    "lienStatus": "none",
    "clearTitle": true,
    "custodySkrRef": "ref:skr-synth-custody-001",
    "certTierSummary": "premium",
    "valuationAboveThreshold": true,
    "issuedAt": "2026-06-01T12:00:00Z",
    "issuerDid": "did:web:issuer.synth.example"
  }
}
```

---

## 4. Example — SD-JWT presentation (`lender-minimal`, synthetic)

Structure follows [SD-JWT](https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/) (simplified; signature is **not** valid in dev stub).

```
<header>.<payload>.SYNTHETIC_STUB_SIGNATURE
```

Decoded payload (illustrative):

```json
{
  "iss": "did:web:issuer.synth.example",
  "sub": "did:web:spv.synth.example",
  "_sd_alg": "sha-256",
  "_disclosed": ["clearTitle", "lienStatus", "certTierSummary", "valuationAboveThreshold"],
  "vc": {
    "credentialSubject": {
      "clearTitle": true,
      "lienStatus": "none",
      "certTierSummary": "premium",
      "valuationAboveThreshold": true
    }
  },
  "_note": "SYNTHETIC_STUB_NOT_FOR_PRODUCTION"
}
```

---

## 5. TypeScript types

Implemented in `lib/rwa/vc-schema.ts`:

- `AssetProvenanceClaims`
- `AssetProvenanceCredential`
- `DisclosureGroup`
- `DISCLOSURE_GROUP_CLAIMS`
- Zod: `AssetProvenanceClaimsSchema`, `IssueAssetProvenanceSchema`, `PresentSelectiveSchema`

---

## 6. Issuer checklist (operator)

1. Finalize Legacy vault manifest with encrypted Gübelin / lab PDFs.
2. Compute manifest CID → set `legacyVaultManifestCid`.
3. Map lab set to `certTierSummary` (premium when Gübelin + supporting lab present).
4. Issue full credential via `POST /api/vc/issue/asset-provenance`.
5. For each counterparty, present only the matching disclosure group.

---

## 7. Next implementation steps

1. Replace synthetic SD-JWT with `@sd-jwt/core` (see GitHub issue).
2. Persist `credentialHash` in `VerificationCredential`.
3. Wire `disclosureGroup` to troptionsmint Token-2022 metadata extension.
4. Add release-engine condition on verified `lender-minimal` presentation for collateral release events.
