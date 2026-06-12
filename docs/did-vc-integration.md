# W3C DID Core 1.1 + VCDM 2.0 for RWA (Gem Provenance)

Brick #1 alignment for **AssetProvenanceCredential** — types, example VC, and troptionsmint / release linkage.

Standards: [DID Core 1.1](https://www.w3.org/TR/did-1.1/), [Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/).

---

## Recommended DID methods

| Role | Method | Example |
|------|--------|---------|
| **SPV** (issuer of package-level claims) | `did:web` | `did:web:spv.example.com` |
| **Guardians / custodians** | `did:key` | `did:key:z6Mk...` |
| **Legacy operator attestation** | `did:web` or `did:key` | Per deployment |

`did:web` resolves to `https://<domain>/.well-known/did.json`. Use HTTPS with TLS and key rotation documented in the SPV runbook.

---

## Credential type: `AssetProvenanceCredential`

### TypeScript claims shape

```typescript
/** @context must include AssetProvenanceCredential + W3C credentials v2 */
export interface AssetProvenanceCredentialClaims {
  /** Internal or ruby-repo asset slug */
  assetId: string;
  /** IPFS CIDs of encrypted certs — verify via vault manifest */
  certCids: string[];
  /** e.g. heat, minor oil, resin */
  treatment: string | null;
  /** Geographic / geological origin as asserted on certs */
  origin: string | null;
  /** URI to independent appraisal when available */
  appraisalRef: string | null;
  lienStatus: "UNKNOWN" | "CLEAR" | "ENCUMBERED" | "PENDING_REVIEW";
  /** SPV did:web */
  spvDid: string;
  /** Legacy vault manifest CID (encrypted package summary) */
  legacyVaultManifestCid: string;
  /** GMIIE oracle comp reference — not NAV */
  gmiiOracleRef: string | null;
}
```

### JSON Schema (claims only)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://legacy.fthtrading.example/schemas/AssetProvenanceCredential-claims.json",
  "title": "AssetProvenanceCredentialClaims",
  "type": "object",
  "required": [
    "assetId",
    "certCids",
    "lienStatus",
    "spvDid",
    "legacyVaultManifestCid"
  ],
  "properties": {
    "assetId": { "type": "string", "minLength": 1 },
    "certCids": {
      "type": "array",
      "items": { "type": "string", "pattern": "^bafy|^Qm" }
    },
    "treatment": { "type": ["string", "null"] },
    "origin": { "type": ["string", "null"] },
    "appraisalRef": { "type": ["string", "null"], "format": "uri" },
    "lienStatus": {
      "type": "string",
      "enum": ["UNKNOWN", "CLEAR", "ENCUMBERED", "PENDING_REVIEW"]
    },
    "spvDid": { "type": "string", "pattern": "^did:" },
    "legacyVaultManifestCid": { "type": "string", "minLength": 10 },
    "gmiiOracleRef": { "type": ["string", "null"], "format": "uri" }
  },
  "additionalProperties": false
}
```

---

## Example unsigned VC (sample only)

**No real CIDs.** Appraisal explicitly withheld.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://legacy.fthtrading.example/contexts/gem-rwa-v1.jsonld"
  ],
  "id": "urn:uuid:00000000-0000-4000-8000-000000000001",
  "type": ["VerifiableCredential", "AssetProvenanceCredential"],
  "issuer": {
    "id": "did:web:spv.example.com",
    "name": "Example Gem SPV Ltd."
  },
  "validFrom": "2026-06-04T00:00:00Z",
  "credentialSubject": {
    "id": "did:web:spv.example.com#asset-fth-allure-lot-a",
    "assetId": "fth-allure-lot-a",
    "certCids": [
      "bafybeigDYsampleCertCid1",
      "bafybeigDYsampleCertCid2"
    ],
    "treatment": "minor oil",
    "origin": "Zambia (per lab report — verify on cert)",
    "appraisalRef": null,
    "lienStatus": "PENDING_REVIEW",
    "spvDid": "did:web:spv.example.com",
    "legacyVaultManifestCid": "bafybeigDYsampleManifestCid",
    "gmiiOracleRef": "https://gmii.example/oracle/v1/comps/siam-emerald/2026-Q2"
  },
  "evidence": [
    {
      "id": "https://github.com/FTHTrading/ruby/issues/1",
      "type": ["IntakeEvidence"],
      "description": "Brick #1 intake gate reference"
    }
  ]
}
```

Signing (Brick #2): SPV `did:web` key in secure enclave; optional guardian `did:key` co-signature for high-value tranches.

---

## Link to troptionsmint metadata

1. Issue VC → upload proof bundle to IPFS → obtain `vcProofUri`.
2. Publish Token-2022 `properties.credentials.assetProvenanceVcUri` (see [ruby-rwa/TOKEN_METADATA.md](./ruby-rwa/TOKEN_METADATA.md)).
3. Wallet verifies VC before honoring transfer restrictions (troptionsmint policy).

`GET /api/rwa/provenance/[tokenId]` returns the same claim shape as a convenience stub until persistence exists (`lib/rwa/provenance-stub.ts`).

---

## Link to release engine

Legacy's multi-proof release engine governs **estate document release**, not SPL transfers. For RWA:

| VC / manifest signal | Suggested policy hook |
|----------------------|------------------------|
| `lienStatus !== CLEAR` | Block metadata refresh / mint |
| `credentialStatus !== ISSUED` | Block troptionsmint policy upgrade |
| `appraisalRef == null` | Allow mint without NAV attribute only |
| Vault dispute open | Halt VC re-issuance |

Implement in Brick #2 — see [ruby-rwa/INTEGRATION_MAP.md](./ruby-rwa/INTEGRATION_MAP.md).

---

## Gübelin and lab names in VCs

Store lab names as UTF-8 strings in `evidence` or `origin` notes, e.g. `Gübelin`, `SSEF`, `GIA`. Never embed unredacted PDF content in the VC JSON.

---

## Related

| Topic | Document |
|-------|----------|
| Architecture baseline (DID, VC 2.0, release engine) | [LEGACY_VAULT_ARCHITECTURE.md](./LEGACY_VAULT_ARCHITECTURE.md) |
| Legal / security guardrails for VCs | [LEGAL_AND_SECURITY_GUARDRAILS.md](./LEGAL_AND_SECURITY_GUARDRAILS.md) |
| **Selective disclosure (VCDM 2.0, SD-JWT, RWA)** | [did-vc-selective-disclosure.md](./did-vc-selective-disclosure.md) |
| **GemAssetCredential v1** (primary RWA VC) | [ruby-rwa/GEM_ASSET_VC_SCHEMA.md](./ruby-rwa/GEM_ASSET_VC_SCHEMA.md) |
| AssetProvenanceCredential (Brick #1) | [ruby-rwa/VC_SCHEMA_ASSET_PROVENANCE.md](./ruby-rwa/VC_SCHEMA_ASSET_PROVENANCE.md) |
| SD-JWT API routes (stubs) | [ruby-rwa/API_SD_JWT.md](./ruby-rwa/API_SD_JWT.md) |
| BBS+ proof generation | [BBS_PLUS_PROOF_GENERATION.md](./BBS_PLUS_PROOF_GENERATION.md) |
| Proof format decision | [DATA_INTEGRITY_VS_SD_JWT.md](./DATA_INTEGRITY_VS_SD_JWT.md) |
| RWA planning (external) | [FTHTrading/ruby](https://github.com/FTHTrading/ruby) |

- [ruby-rwa/README.md](./ruby-rwa/README.md)
- `lib/rwa/types.ts` — runtime types shared with API stubs
