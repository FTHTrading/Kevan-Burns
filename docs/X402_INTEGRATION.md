# Legacy Vault Protocol — x402 Integration

## What is x402?

x402 is the HTTP 402 Payment Required protocol for machine-payable services.
When a client requests a service, the server responds with `402 Payment Required`
and a payment specification. The client fulfills the payment and retries with
a proof-of-payment header.

This enables:
- Per-use service billing without subscription infrastructure
- Machine-to-machine API access (AI agents, automated workflows)
- Operator-controlled rate limiting by payment rather than API keys
- On-chain settlement via Apostle Chain USDF

## Current Status in Legacy

| Mode | Description |
|------|-------------|
| `LOCAL_ADAPTER` | Development mode. No real payment. All services accessible. |
| `X402_READY` | Service accepts x402 payment headers (metered API calls). |
| `MOCK_BILLING` | Billing recorded but not enforced. |
| `PRODUCTION_REQUIRES_GATEWAY` | Requires configured x402 gateway for production use. |

## Metered Services

| Service | Price | Currency | Status |
|---------|-------|----------|--------|
| Executor Packet Export | 0.50 | USDF | LOCAL_ADAPTER |
| Beneficiary Packet Export | 0.50 | USDF | LOCAL_ADAPTER |
| Audit Log Export | 0.25 | USDF | LOCAL_ADAPTER |
| Compliance Report | 1.00 | USDF | LOCAL_ADAPTER |
| Cross-chain Snapshot | 0.75 | USDF | PRODUCTION_REQUIRES_GATEWAY |
| Namespace Manifest Export | 0.25 | USDF | LOCAL_ADAPTER |
| Notarization Request | 5.00 | USDF | PRODUCTION_REQUIRES_GATEWAY |
| Metered API Call | 0.01 | USDF | X402_READY |

## x402 Payment Flow (production)

```
1. Client requests service: POST /api/export/executor-packet
   Response: 402 Payment Required
   Body: { amount: "0.50", currency: "USDF", payTo: "<apostle-chain-address>" }

2. Client submits payment to Apostle Chain:
   POST http://apostle-chain:7332/v1/tx
   Body: { from: <client-address>, to: <payTo>, amount: "500000" (7 decimals) }
   Response: { hash: "<tx-hash>" }

3. Client retries with payment proof:
   POST /api/export/executor-packet
   Header: X-Payment: <tx-hash>

4. Server validates payment on Apostle Chain:
   GET http://apostle-chain:7332/v1/receipts?tx=<tx-hash>
   Validates: amount >= 0.50 USDF, recipient = service address, not already used

5. Server processes request and returns result.

6. Payment recorded on Legacy Layer 0:
   cross-chain-relayer broadcasts payment event
   x402-hooks module records on-chain
```

## Web App Integration

The `lib/x402/index.ts` adapter provides:
- `X402_SERVICES` catalog of all metered services
- `checkX402Access(serviceId, namespaceId)` — validates access in current mode
- Type definitions for service IDs, status types, and usage records

## Namespace-level Billing

Each namespace tracks x402 usage independently:
- Monthly usage totals per service
- Optional spending limits (operator-configurable)
- Usage history export as CSV (metered service itself)
- Operator console at `/admin/x402`

## Production Gateway Requirements

For services with status `PRODUCTION_REQUIRES_GATEWAY`:

1. Deploy an x402 gateway service (or use an existing provider)
2. Configure the gateway to proxy USDF payments to Apostle Chain
3. Set `X402_GATEWAY_URL` in production `.env`
4. Set `X402_PAYMENT_ADDRESS` to the service payment address on Apostle Chain
5. Update service status from `PRODUCTION_REQUIRES_GATEWAY` to `X402_READY`

## USDF Currency

USDF is the Legacy stablecoin issued on Apostle Chain (chain_id 7332).
- 7 decimal places
- Issued by `genesis-treasury` operator wallet
- Settlement bridge: XRPL and Stellar via Apostle Chain bridge
- API: `POST http://apostle-chain:7332/v1/tx`

## Developer Protocols

To enable automated agentic commerce and decentralized RWA registries, the Legacy Vault system relies on a set of core protocols built on top of x402.

```
┌────────────────────────────────────────────────────────┐
│             UnyKorn Compliance Portal (UCP)            │
│  - KYC/AML Verification  - Stripe Webhook Routing      │
└───────────────────────────┬────────────────────────────┘
                            │ (verifies compliance status)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Agentic Commerce Protocol (ACP)            │
│  - RWA Lease Negotiation  - Carrying Capacity Bounds   │
└───────────────────────────┬────────────────────────────┘
                            │ (sets payment terms)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Agentic Payments 2 Protocol (AP2)           │
│  - HTTP 402 Gateways      - Multi-chain Fee Routing    │
└───────────────────────────┬────────────────────────────┘
                            │ (settles payment tokens)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Troptions Asset Protocol (TAP)             │
│  - RWA Metadata Wrap      - IPFS Trust Anchors         │
└────────────────────────────────────────────────────────┘
```

### 1. Agentic Commerce Protocol (ACP)
The ACP governs autonomous, machine-to-machine negotiations for leasing and using real-world assets (RWAs). 

*   **Lease Negotiations:** Agents query a namespace's metadata for lease terms. The protocol supports standard negotiation parameters:
    *   `min_lease_period`: Minimum lease duration (in blocks or seconds).
    *   `rate_per_second`: Lease rate in micro-USDF or target payment tokens.
    *   `collateral_requirement`: Deposit amount held in escrow.
*   **Carrying Capacity:** Enforces resource bounds dynamically based on systemic carrying capacity formulas (e.g. system usage density, network congestion, and contract executor bounds).
*   **Verification:** Lease signatures are anchored as ECDSA/Ed25519 attestations on-chain, proving the leasing agent is authorized to interact with the target namespace.

### 2. Agentic Payments 2 (AP2)
AP2 is the standard layout and transaction router for AI-native payments. It resolves the classic "gas problem" and payment-gating mechanics.

*   **Gas & Fee Routing:** AP2 abstracts gas and native network fees by wrapping payloads in meta-transactions. Payments are routed through designated paymasters on Base, Solana, or Polygon.
*   **HTTP 402 Handshake Schema:**
    *   Headers sent by server:
        ```http
        HTTP/1.1 402 Payment Required
        X-AP2-Specification: { "amount": "0.10", "token": "USDF", "pay_to": "0xBaseAddress", "nonce": "abc123xyz" }
        ```
    *   Headers returned by agent:
        ```http
        X-AP2-Payment-Proof: { "tx_hash": "0xTxHash", "signature": "0xSig", "nonce": "abc123xyz" }
        ```
*   **Execution Budgets:** Enforces maximum spend limits per agent session, halting execution or requesting a signature update if budgets are exceeded.

### 3. Troptions Asset Protocol (TAP)
TAP defines the on-chain metadata format for tokenizing real-world assets under registry namespaces.

*   **Metadata Schema:**
    ```json
    {
      "$schema": "https://schemas.unykorn.org/v1/tap-asset.json",
      "namespace": "gold.1",
      "asset_class": "RWA.Bullion",
      "valuation_usd": 15000000.00,
      "multiplier": 15.0,
      "appraisal": {
        "inspector": "Brinks Zurich",
        "timestamp": "2026-05-28T08:30:00Z",
        "hash": "0xAppraisalPdfSha256"
      },
      "trust_agreement_ipfs": "QmZtH2uN1m2d18471e98"
    }
    ```
*   **Multi-chain Mapping:** Standardizes token attributes across Solana Token-2022 extensions, Stellar assets, and Polygon ERC-1155 tokens.

### 4. UnyKorn Compliance Portal (UCP)
UCP provides the gateway for user KYC/AML verification and links off-chain fiat payment systems to the on-chain registry.

*   **Compliance Verification:** Gated APIs query the UCP state database before releasing resources or processing high-value transfers.
*   **Stripe Webhook Routing:** Evaluates Stripe checkout events and dynamically updates database entitlements (`NamespaceEntitlement`), setting the compliance state to `ACTIVE` once the checkout session completes.
*   **AI-Gated Endpoints:** Exposes Vertex AI-assisted compliance pipelines that parse corporate formation papers, trust deeds, and appraisal documents to automatically output TAP-compliant schemas.

### 5. Google TimesFM Forecasting Integration
Google's **TimesFM** (Time Series Foundation Model) is a pre-trained time-series forecasting model deployed across UnyKorn analytics pipelines. It provides AI agents with predictive insights on asset reserve health and transaction volumes.

*   **Interactive Simulation Dashboard:** Developers can experiment with live TimesFM inference targets (RWA Valuation, LP Capacity limits, and AP2 Dynamic Metered pricing) via the interactive forecasting console hosted on the [UnyKorn.ai Portal](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/adk_build/legacy-vault-protocol/app/namespaces/unykorn-ai/page.tsx).
*   **RWA Appraisal & Valuation Forecasting:**
    *   Agents run inference on `timesfm-200m` checkpoints to project appraisal valuation curves for physical assets (e.g., Zurich vault gold certificates under `gold.1`).
    *   Parameters include historical commodities index updates, local oracle rate logs, and inflation metrics to forecast future RWA value.
*   **LP Carrying Capacity & Yield Projection:**
    *   Analyzes historical liquidity balances across Stellar LP pools, Solana Token-2022 deposit accounts, and Balancer V2 pools.
    *   Forecasts carrying capacity caps and triggers warning alerts (e.g., automated multisig signer policy scale-ups) before pool limits are reached.
*   **AP2 Metered Pricing Adjustment:**
    *   Predicts network gas congestion and operator server CPU loads over 24-hour periods.
    *   AI agents use these forecasts to dynamically scale metered API call rates (e.g., from `0.01` to `0.05` USDF) to align with infrastructure costs.

---

## See Also

- `lib/x402/index.ts` — web app adapter
- `protocol/layer0/crates/x402-hooks/README.md` — on-chain module
- `/app/x402/page.tsx` — public x402 overview
- `/app/admin/x402/page.tsx` — operator console
- `apostle-chain` repo at `C:\Users\Kevan\apostle-chain\`
