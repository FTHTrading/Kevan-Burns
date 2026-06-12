# BBS+ Proof Generation — Gem RWA (Legacy Vault)

Engineering spec mapping holder-side **BBS+ selective disclosure** steps to `BBSService` in `lib/vc/bbs/`. Issuance uses `@digitalbazaar/bbs-signatures` (`BLS12-381-SHA-256`); set `MOCK_BBS=true` for deterministic CI stubs.

## High-level phases

| Phase | Actor | Legacy API |
|-------|-------|------------|
| 1. Issuance | Legacy Vault / SPV | `BBSService.issueBBSVC()` → `POST /api/vc/issue/gem-asset` (`proofType: "bbs"`) |
| 2. Proof generation | Holder | `BBSService.createSelectiveProof()` → `POST /api/vc/present/bbs` |
| 3. Verification | Verifier | `BBSService.verifyPresentation()` → `POST /api/vc/verify/bbs` |

---

## Step 1: Parse the original credential

**Goal:** Split signed atomic messages into disclosed vs hidden sets.

| Concept | Implementation |
|---------|----------------|
| Extract BBS+ signature | `vc.proof.proofValue` (base64) |
| Extract signed messages | `claimsToBbsMessages(credentialSubject)` → `messages` + `messageMap` |
| Disclosed vs hidden | `resolveDisclosedIndexes(messageMap, disclosedClaimPaths)` |
| Filter subject for VP | `filterDisclosedSubject(credentialSubject, disclosedClaimPaths)` |

**Allure Ruby example (lender desk):**

- Disclosed: `titleStatus`, `valuation.amount`, `valuation.appraisalStatus`, `legalOwner`
- Hidden: `certifications`, `manifestCID`, `vaultRef`, `originCountry`, etc.

---

## Step 2: Generate fresh blinding factors

**Goal:** Fresh randomness per presentation for unlinkability.

| Concept | Implementation |
|---------|----------------|
| Production crypto | Handled inside `@digitalbazaar/bbs-signatures` `deriveProof()` |
| Mock / CI | `MOCK_BBS=true` — no real blinding; `proofValue: "MOCK_BBS_DERIVED_PROOF"` |

Legacy does not expose scalar blinding factors directly; the library performs blinding during `deriveProof`.

---

## Step 3: Blind the signature

**Goal:** Transform the issuer signature so presentations are unlinkable.

| Concept | Implementation |
|---------|----------------|
| Real crypto | `bbs.deriveProof({ signature, publicKey, header, messages, presentationHeader, disclosedMessageIndexes, ciphersuite })` |
| Mock | Skipped; mock derived proof string returned |

---

## Step 4: Create commitments

**Goal:** Prove knowledge of hidden values without revealing them.

| Concept | Implementation |
|---------|----------------|
| Real crypto | Commitments embedded in derived proof bytes from `bbs.deriveProof()` |
| Mock | Not computed |

For pairing math background, see [BBS_PLUS_PAIRING_MATH.md](./BBS_PLUS_PAIRING_MATH.md).

---

## Step 5: Fiat–Shamir challenge (non-interactive)

**Goal:** Deterministic verifier challenge from commitments + disclosed data + domain separation.

| Concept | Implementation |
|---------|----------------|
| External verifier nonce | `verifierChallenge` argument → encoded in `presentationHeader` |
| Library binding | `presentationHeader = TextEncoder.encode(verifierChallenge ?? ...)` passed to `deriveProof` / `verifyProof` |

Domain string `BBS_PLUS_FIAT_SHAMIR_V1` is consumed by the cryptosuite inside `@digitalbazaar/bbs-signatures`; callers supply the verifier nonce via `presentationHeader`.

---

## Step 6: Compute responses

**Goal:** Produce proof values verifiable against disclosed messages only.

| Concept | Implementation |
|---------|----------------|
| Real crypto | Output of `bbs.deriveProof()` → `proof.proofValue` (base64) on presentation |
| Mock | Constant `MOCK_BBS_DERIVED_PROOF` |

---

## Step 7: Assemble the presentation

**Goal:** VP with disclosed claims + `BbsBlsSignatureProof2020` only.

| Field | Source |
|-------|--------|
| `@context` | Same as issued VC |
| `type` | `["VerifiablePresentation", "BBSSelectiveDisclosurePresentation"]` |
| `verifiableCredential[0].credentialSubject` | `filterDisclosedSubject(...)` |
| `proof.type` | `BbsBlsSignatureProof2020` |
| `proof.challenge` | Verifier nonce (echoed) |
| `proof.disclosedMessageIndexes` | From Step 1 |

**Not included:** original issuer signature, hidden claim values.

Serve HTTP responses as **`application/vp`** when exchanging presentations (VCDM 2.0).

---

## End-to-end demo

```bash
pnpm demo:bbs-allure-ruby
```

See [ruby-rwa/examples/bbs-allure-ruby-e2e.md](./ruby-rwa/examples/bbs-allure-ruby-e2e.md) and synthetic payloads under `docs/ruby-rwa/examples/`.

## Related

- [BBS_PLUS_INTEGRATION.md](./BBS_PLUS_INTEGRATION.md)
- [DATA_INTEGRITY_VS_SD_JWT.md](./DATA_INTEGRITY_VS_SD_JWT.md)
- [VCDM2_RWA_PROOF_STRATEGY.md](./VCDM2_RWA_PROOF_STRATEGY.md)
- [`lib/vc/bbs/BBSService.ts`](../lib/vc/bbs/BBSService.ts)
