# LEGACYCHAIN.APP — Site Organization & Routing Map

**Status:** Current as of latest React + static updates (4-step explicit, late-account /onboard, 6 exact Stripe plans, functional rail, contracts adapter ready).

**Core Rule (user directive):** Organize what goes where and to what site. The **other site** (static shell / CF preview / old deploys) funnels to or serves as legacychain.app. The **primary operational face** is the Vercel Next.js app (this repo) — attach the custom domain `legacychain.app` to the Vercel project so it becomes the live legacychain.app with full flows.

**Never overclaim:** Demo + marketing surfaces prove the journey today. Full 9-rail sovereign contracts, hardened back-office, and production x402/ATP are the next production layer (see PRODUCTION_LAUNCH_CHECKLIST.md).

---

## Two-Surface Split (Explicit)

| Surface | Type / Color | Purpose | Key Content & Features | Routing / Targets | Target Domain / Host | Status & Notes |
|---------|--------------|---------|------------------------|-------------------|----------------------|---------------|
| `app/page.tsx` + layout + Nav | 🟢 **Operational (Green)** | Full marketing + conversion entry point. Real customer journey. | Hero ("Setup takes 20 min..."), explicit **4-step grid** (Try demo → Questions → Save progress late → Plan & activate), functional rail (clickable pills to #sections + CTAs), 6-plan grid with **exact user Stripe links** (Starter/Founding/Standard/High Level/Pro/Business), narratives (What Goes In Vault, Why Different, 5-Proof, 9 Rails, x402, back-office note), CTAs to Protect My Family (/onboard) + Explore Demo. | Internal: `#ai`, `#rails`, `#five-proof`, `#x402`, `#plans`, `#troptions` (smooth scroll).<br/>App: `/onboard`, `/namespaces/demo`, `/login`, `/vault`.<br/>External: 6 direct `buy.stripe.com` links, Stripe hosted checkout. | **Vercel project "legacy-vault-protocol"** → attach custom domain `legacychain.app` in Vercel dashboard (DNS validation required). This makes Vercel serve legacychain.app. | Primary production surface. Real `/api/auth/register`, `/api/vault/create`, `/api/vault/release/approve` (5-Proof + on-chain anchor), payments fulfill, Prisma 14 models. |
| `app/onboard/page.tsx` | 🟢 **Operational (Green)** | Late-account "save progress" flow (email-first, no account to start). | Initial 5-step message + QUICK_PROMPTS (verbatim), chat finalize triggers `showAccountStep` (form → `/api/auth/register`), then `showPlanStep` (exact 6 Stripe cards), then `showChecklist` (populated from setupData + namespace: ✓ Vault created, ✓ Plan selected, etc.). | Same as above + POST register + external Stripe. Local state for checklist. | Same Vercel / legacychain.app | Implements user-specified "position sign-up, pricing... as the next production layer", "email first", "3 plans ladder" extended to 6, "save progress later". |
| `public/legacychain-home-restructured.html` | 🔵 **Marketing Shell (Blue)** | Self-contained static HTML for fast marketing, CF Pages, fallback, or "the other site". | Matching functional rail (scrollToSection JS), 4-step explainer, plans (founding presale + monthly tiers narrative + JS stubs), org comment at top, links to /onboard etc. | Internal `#` + `/onboard`, `/login`, `/namespaces/demo` (resolve to ops when domain attached or co-served). JS `startRealCheckout` deep-links to `/?tier=...#plans` or ops. | CF Pages / static host / public/ folder. **"The other site"** currently or for legacychain.app shell. | Update in parallel with React changes. Prominent banner + comment explain: attach Vercel domain for full ops (real register/pay/contracts). Can 301 or link to Vercel target. |
| `/namespaces/demo` (app/namespaces/demo/page.tsx) | 🟡 **Demo Surface (Yellow)** | Public, no-account proof of end-to-end. | Live vault simulation, release flow (beneficiaries "take the money" on valid 5-Proof). | Internal from home/onboard. | Same Vercel. | "Explore the Demo First (no account)". Proves the full journey (register → pay → vault → 5-Proof release) without paywall. |
| Stripe Checkout (external) | 🔴 **Payment (Red)** | Direct activation of entitlements + vault rights. | 6 plans (exact links provided by user):<br/>- Starter Plus (trial)<br/>- Founding Family<br/>- Family Standard<br/>- High Level<br/>- Pro Legacy<br/>- Business | Hosted checkout (no custom marketing /api/checkout wrapper for simplicity). | External (buy.stripe.com) | Fulfillment via webhooks or success pages → `/api/payments/fulfill` (provisions namespace + Subscription + NamespaceEntitlement + initial Vault). |
| Contracts + `lib/blockchain/registry-adapter.ts` + API routes (`/api/vault/*`, release/approve) | 🟣 **On-Chain / Protocol (Purple)** | Real automation (when MOCK_CHAIN=false). | 9 contracts total (5 core deployed: LegacyVaultRegistry, LegacyNamespaceRegistry, LegacyPolicyEngine, LegacyAuditLog, LegacyVaultAnchor + supporting). Adapter: `registerVault`, `setVaultStatus`, `anchorAuditEvent` (SHA256 only). Release: evaluateClaim (5 conditions off-chain) + anchor + payout/AccessGrant. | API calls from create/approve/onboard flows. | Besu (primary for estate anchors + PolicyEngine + compliance).<br/>XRPL + Stellar (fast beneficiary payouts — "they actually take the money").<br/>Solana/Avalanche + others (RWA, mints).<br/>Apostle 7332 + Base etc. (x402/ATP metering). Full Troptions 9-rail fabric. | `contracts/scripts/deploy.ts` (in order, wires, writes deployed-addresses.json + abi/). `.env` MOCK_CHAIN + CHAIN_*. Hardhat for localhost/private/apostle. Real flows in demo + approve route today (mock or live). |
| `docs/` (this file + PRODUCTION_LAUNCH_CHECKLIST.md, SYSTEM_OVERVIEW.md, CROSS_CHAIN_DESIGN.md, LEGACY_VAULT_ARCHITECTURE.md, etc.) | ⚪ **Docs / Evidence** | Single source of truth for operators, auditors, DD. | Color-coded tables, Mermaid flows, checklists, architecture, rail patches, heirloom kernels, ZK, legal guardrails. | N/A (source in repo; render via mkdocs or GitHub). | Same repo / GitHub. | Update this map on every routing or surface change. Cross-reference from README, checklist, rail comments. |

**"The other site" directive:** Any current legacychain.app on CF Pages / static / old preview must either:
- Serve this restructured.html (with banners pointing to ops), or
- 301/redirect to the Vercel target once domain is attached to Vercel project, or
- Be updated via CF dashboard to new target.

---

## Deployment Evidence (from latest Vercel build)

Recent production build log (user-provided):
- Compiled successfully, linting passed.
- Generating static pages (62/62) ✓
- Routes include operational surfaces: / (root with 4-step/plans), /onboard, /namespaces/demo, /vault/* (downloads, executors, release-policy, wallets), admin/audit, many /api/* (auth/register, vault, payments, etc.).
- "Deployment Summary", "Deployment Checks", "Assigning Custom Domains".

This confirms the **Vercel Next.js operational layer** (with late-account flow, exact 6 Stripe plans, contracts adapter, 5-Proof) is built and deploying. The next step is completing custom domain assignment for `legacychain.app` in the Vercel project so this becomes the live site. The static shell remains the "other site" marketing fallback with the banner directing traffic here.

See full build traces in user logs and the two-surface table above.

---

## User Journey Flow (Mermaid)

```mermaid
flowchart TD
    Start[User lands on legacychain.app] --> Layer{Which layer?}
    Layer -->|Vercel attached domain<br/>or direct| Ops[🟢 Next.js Operational Surface<br/>page.tsx + onboard]
    Layer -->|CF / static host<br/>'other site'| Shell[🔵 Static Marketing Shell<br/>legacychain-home-restructured.html]
    Shell -->|rail CTAs + 'Talk to AI'<br/>+ org banner note| Ops

    Ops --> Hero[Hero + Explicit 4-Step Grid<br/>1. Try demo first<br/>2. Answer questions (AI)<br/>3. Save progress late (email)<br/>4. Choose plan + activate]
    Hero -->|Protect My Family| Onboard[/onboard — AI Concierge Chat]
    Hero -->|Explore Demo| Demo[/namespaces/demo — prove release + money movement]

    Onboard --> Chat[QUICK_PROMPTS + guided intake<br/>family / assets / guardians / rules]
    Chat --> Finalize[Finalize → showAccountStep]
    Finalize --> Account[Create Account & Save Progress<br/>POST /api/auth/register → namespace + User]
    Account --> Plans[showPlanStep — 6 exact Stripe cards<br/>direct buy.stripe.com links]
    Plans --> Stripe[External Stripe Checkout<br/>activates Subscription + Entitlement]
    Stripe --> Checklist[showChecklist<br/>✓ Vault created for {name}<br/>✓ Plan: {selected}<br/>✓ 5-Proof ready<br/>Real registration • real pay • real contracts]

    Demo --> ReleaseSim[Simulate 5-Proof evaluateClaim<br/>→ approve → RELEASED + on-chain anchor<br/>→ payout/AccessGrant (XRPL/Stellar)]
    Checklist --> VaultPage[/vault or demo — real flows]

    Ops --> Rail[Functional Rail<br/>Start with AI → #ai or /onboard<br/>9 SETTLEMENT NETWORKS → #rails (chain map)<br/>5-Proof → #five-proof<br/>x402 → #x402<br/>Troptions → #troptions]
    Rail --> Sections[Sections map concepts to surfaces + contracts]

    style Ops fill:#052e16,stroke:#4ade80,color:#fff
    style Shell fill:#1e3a8a,stroke:#60a5fa,color:#fff
    style Plans fill:#3b0764,stroke:#c084fc,color:#fff
```

**5-Step Onboard (verbatim spirit in initial assistant message + checklist):**
1. Who this vault protects (family).
2. Executor / guardians / trusted contacts.
3. Documents, wallets, final wishes.
4. Create account to save (late).
5. Choose plan and activate.

---

## Rail Bar — What Goes Where (Interactive in Ops, Scroll in Shell)

**React (app/page.tsx lines ~73-82):** Real `<a href="#..." onClick={scrollIntoView}>` + span "Click any — real sections + live app CTAs".

**Static (restructured.html):** `<button onclick="scrollToSection('...')">` + JS helper + tiny explainer.

Mapping:
- **Start with AI / AI CONCIERGE ONBOARDING** → `#ai` (section) or direct `/onboard` (full flow).
- **9 SETTLEMENT NETWORKS** → `#rails` (describes the 9 Troptions rails + which for what: Besu primary estate, XRPL/Stellar payouts, Solana/Avalanche RWA, Apostle 7332 x402/ATP, etc.).
- **5-Proof RELEASE POLICY** → `#five-proof` (the 5 conditions + evaluateClaim + on-chain).
- **x402 PAY-PER-ACTION** → `#x402` (metered AI/actions, ATP settlement).
- **Troptions Mint / DEX / Legacy Vault / Troptions** → `#troptions` (fabric under everything).

All rails surface the split: concepts explained in shell/ops, execution in ops + contracts.

---

## Contract & Chain Assignment (of the 9 Troptions Rails)

From `contracts/scripts/deploy.ts`, `lib/blockchain/registry-adapter.ts`, `app/api/vault/release/approve/route.ts`, page.tsx rails section, CROSS_CHAIN_DESIGN.md, and Troptions system:

1. **Hyperledger Besu (PRIMARY for Legacy)** — EVM estate anchors, `LegacyVaultRegistry.registerVault`, `LegacyPolicyEngine` (5-Proof), `LegacyVaultAnchor`, compliance, setVaultStatus, audit events. Deploy order in script. Adapter default when MOCK=false.
2. **XRPL + Stellar** — Fast beneficiary payouts. On valid release: payout + AccessGrant so "beneficiaries actually take the money". Used in release engine.
3. **Solana / Avalanche** — RWA tokenization, mints, VRF oracles.
4-9. **Base / Stacks / Sui / Cosmos / Chainlink oracles / Apostle Chain (7332)** — x402 metering/ATP, cross-chain proof routing, additional bridges/settlement (Troptions 33+ contracts: BridgePayload, CrossChainRouter, RWATokenFactory, AtomicSettlement, x402 hooks, etc.). Apostle for sovereign ATP/x402.

**Adapter behavior:** `MOCK_CHAIN=true` (default for demo) uses in-memory. Real: ethers v6 to Besu (or configured) + XRPL/Stellar SDKs. Hashes only (no plaintext on-chain). Deploy script outputs `deployed-addresses.json` consumed by adapter.

See `contracts/src/` (9 .sol), `deploy.ts` (wires + JSON), `.env.example` (CHAIN_RPC_URL, MOCK_CHAIN, TROPTIONS_*), and `docs/CROSS_CHAIN_DESIGN.md`.

---

## Recommended DNS / Domain Attachment (to make "the other site" → legacychain.app operational)

1. In Vercel dashboard for the `legacy-vault-protocol` project: Add Domain → `legacychain.app` (follow validation: CNAME or A records per Vercel).
2. Update registrar (GoDaddy etc.) or current CF DNS for legacychain.app: point to the Vercel target (usually CNAME to cname.vercel-dns.com or the assigned .vercel.app).
3. CF (if proxying): Full (strict) SSL, purge cache.
4. For pure static "other site" on CF Pages: Either keep as marketing subdomain (e.g. shell.legacychain.app) or replace the Pages project target / add _redirects to https://legacychain.app.
5. Old previews/CF deploys: update or 301 in CF Workers/Pages redirects.
6. Verify: `legacychain.app` serves the React hero + 4-step + 6 exact plans + /onboard full flow.

**Recent Deployment Evidence (from latest Vercel build log):** Successful Next.js production build and deploy (see user-provided log showing /onboard, /namespaces/demo, /vault/* surfaces, /login, many static prerendered routes, "Build Completed", "Deployment Summary", "Assigning Custom Domains"). This confirms the operational layer (with the 4-step explainer, late-account flow, exact 6 Stripe plans, contracts adapter) is live on Vercel. The next step is completing the custom domain assignment in the Vercel project UI for legacychain.app so this becomes the live site. The static shell remains the "other site" marketing fallback with the banner directing traffic here.

See also: scripts/cf-deploy-notes.ps1, vercel.json, netlify.toml (if used), PRODUCTION_LAUNCH_CHECKLIST.md (DNS blockers section).

---

## Open Questions / Next (per AGENTS format)

- Exact 6 Stripe links are live (user-provided); confirm fulfillment webhooks create real entitlements/vaults on success.
- Full 9-rail contracts: core 5 deployable now via `pnpm contracts:deploy:private` (or local); remaining Troptions-side (33+) are in the broader Troptions fabric (separate or integrated via adapter).
- Domain attach is user action (human approval per sovereign for production DNS).
- Back-office modules (operator console, multi-client) are noted in UI but surface as production layer.
- ZK circuits (UnityLegacy5Proof etc.) compiled but full on-chain verifiers production next.

**Evidence Board References:** This doc + page.tsx:104 (4-step), page.tsx:256 (6 plans), onboard:69 (showAccountStep etc.), static org comment:68, contracts/deploy:1, registry-adapter, release-engine.ts (5 conditions), systems.yaml (legacy-vault-protocol entry), sovereign preflight (green), latest Vercel build log (62/62 static pages, domain assignment).

---

## Color-Coded Quick TOC (for operators)

- 🟢 Operational surfaces (Vercel → legacychain.app): page.tsx, onboard/page.tsx, API routes, demo, vault/.
- 🔵 Shell / "other site": public/legacychain-home-restructured.html + CF static deploys.
- 🟡 Public proof: /namespaces/demo.
- 🔴 External payments: Stripe 6 plans.
- 🟣 Protocol: contracts/, lib/blockchain/, release/.
- ⚪ Evidence/docs: docs/* (start here for DD/forensics).

Update this file + push on any change to routing, plans, rail, or surfaces. Cross-link from README.md, PRODUCTION_LAUNCH_CHECKLIST.md, and code comments.

**Final organization principle:** Everything funnels to real flows (demo first → late account → pay → contracts) on the legacychain.app operational layer. The shell explains and directs. No dead labels. Sovereign preflight before deploys.