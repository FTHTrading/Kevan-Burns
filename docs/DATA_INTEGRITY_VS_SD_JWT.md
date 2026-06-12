# Data Integrity (BBS+) vs SD-JWT — Gem RWA

Decision reference for securing **GemAssetCredential** in Legacy Vault + Troptions stack. VCDM 2.0 is agnostic; the choice is at the **proof / securing layer**.

## Side-by-side comparison

| Aspect | **Data Integrity + BBS+** | **SD-JWT (IETF)** | Winner for Ruby RWA |
|--------|---------------------------|-------------------|---------------------|
| **Format** | JSON-LD native + Data Integrity proof | JWT (JOSE) based | Data Integrity for linked-data stack |
| **Selective disclosure** | Excellent (ZK via BBS+) | Good (salted hashes) | **BBS+** |
| **Unlinkability** | Strong (presentations unlinkable) | Limited (can correlate) | **BBS+** |
| **Privacy strength** | Highest | Good | **BBS+** |
| **Implementation complexity** | Higher (cryptosuite + keys) | Lower (JWT libraries) | SD-JWT |
| **Ecosystem maturity (2026)** | Growing in SSI / advanced RWA | Very mature | SD-JWT (today) |
| **Standards body** | W3C Data Integrity + VCDM 2.0 | IETF SD-JWT + SD-JWT VC | Tie |
| **Interoperability** | DID + linked data systems | JWT / OAuth infrastructure | Depends on verifier |
| **Performance** | Heavier (pairing ops) | Lighter | SD-JWT |
| **Regulatory / audit** | Strong cryptographic audit trail | Good | BBS+ |
| **Best for** | High-value assets, unlinkable lender/buyer flows | Fast rollout, desk compatibility | Hybrid |

## Detailed paths

### Data Integrity + BBS+ (W3C)

- Credential stays JSON-LD; `proof.type`: `BbsBlsSignature2020`
- Presentations use `BbsBlsSignatureProof2020` derived proof
- Implemented in `lib/vc/bbs/BBSService.ts` with `@digitalbazaar/bbs-signatures`
- Example: [`docs/ruby-rwa/examples/gem-vc-data-integrity-bbs.json`](./ruby-rwa/examples/gem-vc-data-integrity-bbs.json)

### SD-JWT (IETF)

- Claims packaged as JWT; undisclosed claims as salted hashes
- Default `proofType` on `POST /api/vc/issue/gem-asset`
- Production signing stub (`501`) until Brick **#11**
- Example: [`docs/ruby-rwa/examples/gem-vc-sd-jwt.json`](./ruby-rwa/examples/gem-vc-sd-jwt.json)

## Hybrid recommendation (Legacy + Ruby)

| Use case | Standard | Reason |
|----------|----------|--------|
| Initial gem VC issuance | **SD-JWT** | Speed + ecosystem reach |
| High-privacy / unlinkable presentations | **BBS+ Data Integrity** | Sensitive gem claims |
| Collateral / lending desk | **SD-JWT** at launch; **BBS+** when unlinkability required | Desk JWT tooling first |
| Secondary market buyers | **BBS+** | Prevent cross-buyer correlation |
| Guardian / internal quorum | **BBS+** | `guardian_internal` disclosure group |

Issuance accepts both:

```json
{ "proofType": "sd-jwt" }
{ "proofType": "bbs" }
```

## Troptions / Legacy integration notes

| Integration point | SD-JWT | BBS+ |
|-------------------|--------|------|
| **troptionsmint Token-2022 metadata** | Easier first attach (`credentials` URI → JWT) | VP URI + `application/vp` |
| **Legacy Vault manifest** | Hash VC JWT digest in manifest | Hash VC JSON + proof digest |
| **Legacy Chain anchor** | Anchor SD-JWT `iss` + `jti` | Anchor VC `id` + proof `proofValue` prefix |
| **Release engine condition** | Planned: `sd_jwt_vc_verified` | Planned: `vc_presentation_verified` (Brick #12) |
| **GMIIE oracleRef** | Include in SD-JWT disclosed set when needed | Keep in hidden messages; disclose only to guardians via BBS+ |

## VCDM 2.0 alignment checklist

- [x] `@context`: `https://www.w3.org/ns/credentials/v2`
- [x] `validFrom` / `validUntil` (not `issuanceDate` / `expirationDate`)
- [x] Media types documented: `application/vc`, `application/vp`
- [x] Dual examples in schema docs + `docs/ruby-rwa/examples/`

## Related

- [VCDM2_RWA_PROOF_STRATEGY.md](./VCDM2_RWA_PROOF_STRATEGY.md)
- [BBS_PLUS_PROOF_GENERATION.md](./BBS_PLUS_PROOF_GENERATION.md)
- [ruby-rwa/GEM_ASSET_VC_SCHEMA.md](./ruby-rwa/GEM_ASSET_VC_SCHEMA.md)
