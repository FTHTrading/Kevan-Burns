# Siam / Thailand Emerald Market — Valuation Narrative (Comps)

**Purpose:** Support engineering and disclosure narrative for the Siam Emerald portion of the Allure package. Figures below are **market reference tiers**, not Legacy Vault NAV or an offering price.

**Valuation status:** **TBD pending independent appraisal.**

---

## Geography and trade hubs

| Hub | Role |
|-----|------|
| **Chanthaburi** | Primary Thai cutting / trading center for emerald rough and polished goods |
| **Bangkok** | Auction houses, export documentation, high-end retail |
| **JTC (Jewelry Trade Center)** | B2B wholesale floors, broker price discovery |

Most "Siam emerald" inventory in global trade flows through Thai cutters even when rough originates in Zambia, Brazil, or other fields — origin must be **cert-backed**, not assumed from "Siam" labeling.

---

## Pricing tiers (wholesale-oriented narrative)

Use as **bands for GMIIE oracle tagging**, not token NAV.

| Tier | Typical profile | Narrative use |
|------|-----------------|---------------|
| **Commercial** | Medium green, included, oiled | Bulk parcels, volume RWA tranches |
| **Fine** | Stronger color, better clarity | Mid-market comps |
| **Gem** | Vivid green, eye-clean-ish, minor oil | Premium lot storytelling |
| **Collector / auction** | Exceptional size + provenance + lab papers | Anchor comps only with cite |

Per-carat spreads vary widely by origin (Zambian vs Colombian trade stock labeled in Thailand), treatment, and certification. Do not publish a single $/ct package NAV from this table.

---

## Reference channels (for oracle indexing)

| Channel | Notes |
|---------|--------|
| **JTC Chanthaburi** | Dealer quotes, parcel lots — capture as comp events, not appraisals |
| **Bangkok gem auctions** | Seasonal spikes; cite auction house + date in GMIIE |
| **Hong Kong / Geneva cross-listings** | Export comparables for large stones |
| **Lab reports** | Gübelin / SSEF / GIA color origin opinions drive tier classification |

---

## Treatment disclosure (market standard)

- **Minor oil** — common; must appear in VC `treatment` claim.
- **Resin / significant enhancement** — discount tier; explicit disclosure required before metadata publish.

---

## Copper SKR (optional)

If the package includes copper SKR collateral, emerald comps **must not** be blended into a single gem NAV. Track under separate `assetClass: COPPER_SKR` in RWA manifest (see [INTAKE_CHECKLIST.md](./INTAKE_CHECKLIST.md)).

---

## GMIIE integration

- Store comp snapshots as oracle events referenced by `gmiiOracleRef`.
- Dashboards may show tier distributions; public Token-2022 metadata stays NAV-free in Brick #1.

---

## Disclaimer

This document is a condensed market map for product and engineering alignment. It is not investment advice, a fairness opinion, or a substitute for independent gemological appraisal.
