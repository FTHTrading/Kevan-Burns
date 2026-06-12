# Brick #1 — Gated Intake Checklist

Use this checklist before binding a Legacy Vault manifest to troptionsmint metadata or minting. Track completion in [FTHTrading/ruby](https://github.com/FTHTrading/ruby); store **encrypted** artifacts only in Legacy Vault.

---

## 1. Ruby certificate index

| Item | Status | Notes |
|------|--------|-------|
| Master index of stones / lots (internal ID, carat, shape, origin claim) | ☐ | No PDFs in ruby repo |
| Lab report inventory (Gübelin, SSEF, GIA, AGL, etc.) | ☐ | Label + report number + date |
| Treatment disclosure per lot | ☐ | Heat / fracture filling / other |
| Photos / video hashes (optional) | ☐ | CID after vault upload |
| Legacy Vault upload complete for each cert PDF | ☐ | `POST /api/vault/upload` |

**Gübelin encoding:** Use UTF-8 `Gübelin` in all indexes (not mojibake).

---

## 2. Siam emerald specifications

| Item | Status | Notes |
|------|--------|-------|
| Emerald lot list (Chanthaburi / other origin claims) | ☐ | |
| Color / clarity / size bands per lot | ☐ | |
| Treatment (oiled / resin) documented | ☐ | |
| Chain-of-custody from mine/trader to vault | ☐ | |
| Market narrative source tagged | ☐ | See [SIAM_EMERALD_MARKET.md](./SIAM_EMERALD_MARKET.md) |

---

## 3. Ownership and liens

| Item | Status | Notes |
|------|--------|-------|
| Beneficial ownership chart | ☐ | |
| UCC / lien search (jurisdictions listed) | ☐ | |
| Pledge / SKR encumbrance disclosure | ☐ | |
| `lienStatus` for VC claim | ☐ | `CLEAR` \| `ENCUMBERED` \| `PENDING_REVIEW` |
| Attorney review sign-off (internal) | ☐ | |

---

## 4. Copper SKR clarification (optional track)

| Item | Status | Notes |
|------|--------|-------|
| Confirm whether copper SKR is in scope for this package | ☐ | |
| SKR document type and vaulting location | ☐ | |
| Separate `assetClass: COPPER_SKR` manifest if in scope | ☐ | `POST /api/rwa/manifest` |
| No commingling with gem SPV without legal approval | ☐ | |

---

## 5. Custody and insurance

| Item | Status | Notes |
|------|--------|-------|
| Custodian identity + agreement summary | ☐ | |
| Vault location(s) — city/country only in public metadata | ☐ | |
| Insurance policy reference (encrypted full policy in Legacy) | ☐ | |
| Inspection / audit cadence | ☐ | |
| Beneficiary / release policy on vault if estate-linked | ☐ | Legacy release engine |

---

## 6. Legacy Vault binding

| Item | Status | Notes |
|------|--------|-------|
| Vault created (`/api/vault/create`) | ☐ | |
| All intake PDFs encrypted + CID registered | ☐ | |
| Vault manifest regenerated | ☐ | `POST /api/vault/manifest` |
| RWA manifest stub submitted | ☐ | `POST /api/rwa/manifest` |
| `legacyVaultManifestCid` copied into VC claims | ☐ | After manifest live |

---

## Gate: proceed to SPV + metadata

All sections **1–5** must be `COMPLETE` or explicitly `N/A` (with issue link). Section **6** required before `AssetProvenanceCredential` issuance and troptionsmint metadata publish.

**Appraisal:** Package valuation remains **TBD pending independent appraisal** — do not publish NAV in Token-2022 metadata in Brick #1.
