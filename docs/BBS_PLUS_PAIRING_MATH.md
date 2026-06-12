# BBS+ Pairing Math — Legacy Vault Gem RWA

This document sketches the bilinear pairing foundation behind BBS+ signatures as used for **GemAssetCredential** selective disclosure in Legacy Vault. It is an engineering reference, not a security proof.

## Bilinear groups

BBS+ operates over a pairing-friendly curve **BLS12-381** with groups **G₁**, **G₂**, and a target group **G_T**, and a non-degenerate bilinear map:

\[
e: G_1 \times G_2 \rightarrow G_T
\]

**Bilinearity** (the property that makes selective disclosure possible):

\[
e(g_1^a, g_2^b) = e(g_1, g_2)^{ab}
\]

for generators \(g_1 \in G_1\), \(g_2 \in G_2\) and scalars \(a, b\) in the prime field \(\mathbb{F}_r\).

Legacy's `@digitalbazaar/bbs-signatures` integration uses ciphersuite **`BLS12-381-SHA-256`**: messages are hashed to scalars in \(\mathbb{F}_r\) before signing.

## BBS+ signature (issuance sketch)

Let \(m_1,\ldots,m_n\) be message scalars derived from canonical claim encodings (`path:canonicalJSON`).

The issuer holds secret key \(x\) and publishes public key \(W = g_2^x\).

A simplified multi-message BBS+ signature includes:

- \(A = g_1^{1/(x + m_1 + \cdots + m_n)}\) (in the actual scheme, messages are incorporated via dedicated generators)
- Per-message commitments \(B_i\) tied to each \(m_i\)

The holder receives the full signature over **all** atomic claims in `credentialSubject` (name, caratWeight, valuation fields, manifestCID, etc.).

**Gem RWA issuance:** `BBSService.issueBBSVC` signs flattened GemAsset claims so each verifier-facing disclosure path maps to one BBS message index in `proof.messageMap`.

## Selective disclosure (presentation sketch)

The holder chooses disclosed indexes \(\mathcal{D} \subset \{1,\ldots,n\}\) and derives a **proof** \(\pi\) that:

1. Proves the disclosed messages \(m_i\) for \(i \in \mathcal{D}\) were part of a valid BBS+ signature by the issuer's public key.
2. Reveals **no information** about undisclosed messages \(m_j\) for \(j \notin \mathcal{D}\) beyond what is implied by the proof.
3. Is **unlinkable** across presentations when fresh randomness (presentation header / challenge) is used.

In Legacy:

```typescript
// disclosed: titleStatus + appraisalStatus only (valuation.amount stays hidden)
await bbsService.createSelectiveProof(vc, [
  "titleStatus",
  "valuation.appraisalStatus",
], verifierChallenge);
```

The verifier checks:

\[
\text{VerifyProof}(pk, \pi, \{m_i\}_{i \in \mathcal{D}}, \mathcal{D}, \text{challenge}) \stackrel{?}{=} 1
\]

implemented via `bbs.verifyProof` in `BBSService.verifyPresentation`.

## Why this fits Gem RWA

| Verifier | Typical disclosed claims | Hidden |
|----------|-------------------------|--------|
| Collateral desk | `titleStatus`, `valuation.appraisalStatus` | `manifestCID`, internal vault refs |
| Secondary market | gem attrs, certs, `manifestCID` | `vaultRef`, `oracleRef` |
| Guardian quorum (`guardian_internal`) | full subject + internal refs | nothing (full VC held by quorum) |

**Valuation policy:** public presentations must surface `valuation.appraisalStatus: "TBD"` and `valuation.amount: null` until an independent appraisal is completed. BBS+ does not certify dollar NAV — it only proves the issuer signed those claim values.

## Fiat–Shamir and challenges

Verifiers SHOULD supply a **challenge** (nonce) when requesting a presentation. Legacy passes this as `presentationHeader` bytes to `deriveProof`, binding the proof to a session and reducing replay risk.

## Unlinkability intuition

Two presentations disclosing `{titleStatus}` from the same VC use different proof randomness. Without the issuer's secret tracing key, verifiers cannot link the presentations as originating from the same credential — a requirement for high-value gem workflows where counterparties must not correlate guardian activity.

## Implementation mapping

| Concept | Legacy artifact |
|---------|-----------------|
| Message encoding | `lib/vc/bbs/bbs-messages.ts` |
| Sign / derive / verify | `lib/vc/bbs/BBSService.ts` |
| Issuance API | `POST /api/vc/issue/gem-asset` with `proofType: "bbs"` |
| Presentation API | `POST /api/vc/present/bbs` |
| Verification API | `POST /api/vc/verify/bbs` |
| CI stub | `MOCK_BBS=true` |

## References

- [IETF CFRG BBS Signatures draft](https://www.ietf.org/archive/id/draft-irtf-cfrg-bbs-signatures-06.html)
- [@digitalbazaar/bbs-signatures](https://github.com/digitalbazaar/bbs-signatures)
- [BBS+ Integration](./BBS_PLUS_INTEGRATION.md)
- [GemAssetCredential schema](./ruby-rwa/GEM_ASSET_VC_SCHEMA.md)
