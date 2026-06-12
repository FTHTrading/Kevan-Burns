# SD-JWT Verifiable Credential API (Implementation Notes)

**Status:** Route stubs ship in `app/api/vc/*`; cryptography returns **501** unless `VC_STUB_MODE=mock` (default in development).

**Schema:** [VC_SCHEMA_ASSET_PROVENANCE.md](./VC_SCHEMA_ASSET_PROVENANCE.md)  
**Architecture:** [../did-vc-selective-disclosure.md](../did-vc-selective-disclosure.md)

---

## 1. Authentication

| Header | Required | Purpose |
|--------|----------|---------|
| `x-user-id` | Yes | Actor cuid (issuer operator, holder agent, verifier service account) |
| `x-vault-id` | Present route optional | Enables audit anchoring to a vault namespace |

Future: W3C DID auth + executor IAL per [LEGAL_AND_SECURITY_GUARDRAILS.md](../LEGAL_AND_SECURITY_GUARDRAILS.md).

---

## 2. Endpoints

### `POST /api/vc/issue/asset-provenance`

Issue a full `AssetProvenanceCredential` and return an SD-JWT-shaped secured credential (stub in dev).

**Request body:**

```json
{
  "vaultId": "clxxxxxxxx",
  "subjectDid": "did:web:spv.synth.example",
  "anchorAudit": true,
  "claims": { }
}
```

`claims` must satisfy `AssetProvenanceClaimsSchema` (see `lib/rwa/vc-schema.ts`).

**Responses:**

| Status | When |
|--------|------|
| `201` | Dev mock — full `IssueAssetProvenanceResponse` |
| `501` | Production default — `status: "not_implemented"` + `meta.plannedPackages` |
| `400` | Zod validation failure |

**Audit:** When `vaultId` + `anchorAudit`, logs `VAULT_UPDATED` with `detail.subtype: VC_ASSET_PROVENANCE_ISSUED_STUB` and chain anchor (best-effort).

---

### `POST /api/vc/present/selective`

Build a selective disclosure presentation.

**Request body:**

```json
{
  "credentialId": "vc_abc123",
  "disclosureGroup": "lender-minimal",
  "audienceDid": "did:web:lender.synth.example",
  "nonce": "random-nonce-min-8-chars"
}
```

Alternatively supply `claimPaths: ["clearTitle", "lienStatus"]` instead of `disclosureGroup`.

**Responses:**

| Status | When |
|--------|------|
| `200` | Mock presentation JWT string |
| `404` | Unknown `credentialId` (dev store miss) |
| `501` | Crypto not enabled |

**Audit:** If `x-vault-id` set → `ACCESS_GRANTED` with `subtype: VC_SELECTIVE_PRESENTATION_STUB`.

---

### `GET /api/vc/verify/presentation`

Verify disclosed claims in a presentation.

**Query parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `presentation` | Yes | SD-JWT string from holder |
| `expectedDisclosureGroup` | No | Policy check against allowed claim set |
| `issuerDid` | No | Expected issuer |

**Responses:**

| Status | When |
|--------|------|
| `200` | Structural stub parse (`verified` boolean + `warnings`) |
| `501` | Crypto not enabled |

---

## 3. Typed stub response shape

All stub responses include:

```typescript
meta: {
  implementation: "stub";
  cryptoReady: false;
  plannedPackages: [
    "@sd-jwt/core",
    "@sd-jwt/decode",
    "@sd-jwt/present",
    "@sd-jwt/verify"
  ];
}
```

---

## 4. Environment

| Variable | Default | Effect |
|----------|---------|--------|
| `NODE_ENV=development` | — | Mock responses enabled |
| `VC_STUB_MODE=mock` | — | Force mock |
| `VC_STUB_MODE=501` | — | Force 501 even in development |

---

## 5. Planned dependencies (not installed yet)

```bash
pnpm add @sd-jwt/core @sd-jwt/decode @sd-jwt/present @sd-jwt/verify
```

Integration tasks:

1. Load issuer ES256 key from `VAULT_VC_ISSUER_JWK` (or HSM ref).
2. On issue: encode SD-JWT with all claims in `_sd` array; persist hash to `VerificationCredential`.
3. On present: use holder key + `present()` with disclosure group claim list.
4. On verify: `verify()` + policy engine for Reg D profile.

Optional later: `@mattrglobal/bbs-signatures` for BBS+ track.

---

## 6. File map

| Path | Role |
|------|------|
| `lib/rwa/vc-schema.ts` | Types, Zod, disclosure groups |
| `lib/rwa/sd-jwt-stub.ts` | Mock issue/present/verify |
| `app/api/vc/issue/asset-provenance/route.ts` | Issue route |
| `app/api/vc/present/selective/route.ts` | Present route |
| `app/api/vc/verify/presentation/route.ts` | Verify route |

---

## 7. Example dev flow

```bash
# 1. Issue (requires x-user-id)
curl -X POST http://localhost:3000/api/vc/issue/asset-provenance \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user-id" \
  -d @docs/ruby-rwa/fixtures/synth-issue-payload.json

# 2. Present lender-minimal
curl -X POST http://localhost:3000/api/vc/present/selective \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user-id" \
  -H "x-vault-id: demo-vault-id" \
  -d '{"credentialId":"<from issue>","disclosureGroup":"lender-minimal"}'

# 3. Verify
curl "http://localhost:3000/api/vc/verify/presentation?presentation=<url-encoded-jwt>"
```

(Add `docs/ruby-rwa/fixtures/` when sample payload file is checked in — optional.)

---

## 8. Release engine hook (planned)

```typescript
// Future ReleaseCondition (pseudo)
{
  type: "vc_presentation_verified",
  disclosureGroup: "lender-minimal",
  requiredClaims: ["clearTitle", "lienStatus"],
}
```

Evaluated before collateral or beneficiary access grants tied to RWA namespace. See GitHub issue: wire presentations to release engine.
