# x402 — Legacy Vault Integration (Ruby RWA)

**Summary for implementers** | June 4, 2026

---

## Canonical specification

The authoritative x402 integration specification for the Allure Ruby & Siam Emerald RWA program lives in the **ruby** repository:

**[FTHTrading/ruby — `docs/x402/X402_INTEGRATION_SPECIFICATION.md`](https://github.com/FTHTrading/ruby/blob/main/docs/x402/X402_INTEGRATION_SPECIFICATION.md)** (v1.0)

Supporting artifacts in ruby:

| Artifact | Path |
|----------|------|
| Event JSON Schema | [`docs/x402/schemas/x402-event-v1.json`](https://github.com/FTHTrading/ruby/blob/main/docs/x402/schemas/x402-event-v1.json) |
| Payment hook interfaces | [`docs/x402/PAYMENT_HOOK_INTERFACE.md`](https://github.com/FTHTrading/ruby/blob/main/docs/x402/PAYMENT_HOOK_INTERFACE.md) |
| Sequence flows | [`docs/x402/SEQUENCE_FLOWS.md`](https://github.com/FTHTrading/ruby/blob/main/docs/x402/SEQUENCE_FLOWS.md) |
| Index | [`docs/x402/README.md`](https://github.com/FTHTrading/ruby/blob/main/docs/x402/README.md) |

x402 is a **Troptions-internal protocol** — not ISO, ERC, or W3C standard status.

---

## Legacy responsibilities

| Surface | Location | Notes |
|---------|----------|-------|
| x402 service catalog | [`lib/x402/index.ts`](../../../lib/x402/index.ts) | Metered Legacy Vault exports + API |
| Vault x402 overview | [`docs/X402_INTEGRATION.md`](../../X402_INTEGRATION.md) | HTTP 402 / USDF metering (estate scope) |
| Layer 0 hooks (planned) | [`protocol/layer0/crates/x402-hooks/README.md`](../../../protocol/layer0/crates/x402-hooks/README.md) | On-chain settlement records |
| Public UI | `/app/x402` | Service catalog page |

Ruby RWA lifecycle events (`rwa.revenue_share.distribution`, `rwa.collateral.*`, etc.) extend the generic Legacy x402 adapter using the **x402-event-v1** schema from ruby.

---

## BBS+ consumption before sensitive payments

For collateral, revenue-share, and other sensitive x402 flows, clients **must** obtain a selective disclosure presentation **before** initiating settlement:

```http
POST /api/vc/present/bbs
Content-Type: application/json

{
  "credential": { "...": "GemAssetCredential with BbsBlsSignature2020 proof" },
  "disclosedClaims": ["titleStatus", "valuation.appraisalStatus"],
  "challenge": "optional-verifier-nonce"
}
```

**Policy:**

- Disclose `valuation.appraisalStatus` — typically `"TBD"` until independent appraisal completes.
- Do **not** disclose `valuation.amount` or marketing-scale NAV in payment-gating presentations unless counsel explicitly approves.
- Payment hooks in ruby spec (`X402SelectiveDisclosureHook`) digest the presentation and attach `selectiveDisclosure` to `x402-event-v1`.

See also: [`docs/BBS_PLUS_INTEGRATION.md`](../../BBS_PLUS_INTEGRATION.md), [`docs/ruby-rwa/examples/bbs-allure-ruby-e2e.md`](../examples/bbs-allure-ruby-e2e.md).

---

## Valuation language

**Target package subject to independent appraisal (TBD).** Legacy credentials keep `valuation.amount` null per [`GEM_ASSET_VC_SCHEMA.md`](../GEM_ASSET_VC_SCHEMA.md). x402 settlement must not compute LTV or revenue-share denominators from asserted NAV.

---

## Integration map

Ruby RWA brick roadmap and API touchpoints: [`INTEGRATION_MAP.md`](../INTEGRATION_MAP.md). x402 sits alongside troptionsmint and GMIIE — add gateway wiring at Brick #3+.

---

## Related ecosystem

| System | Link |
|--------|------|
| troptionsmint | Solana Token-2022 mint |
| Agent Mailor | Client-operations orchestration |
| GMIIE | Oracle references — not appraisal |

*Last updated: June 4, 2026*
