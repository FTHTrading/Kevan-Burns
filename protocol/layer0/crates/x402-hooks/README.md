# Crate: `x402-hooks`

## Purpose

x402 (HTTP 402 Payment Required) service settlement integration. Records service
payment proofs on-chain, tracks usage per namespace, and enforces access control
for premium protocol services.

## Status: Planned (LOCAL_ADAPTER in current dev build)

## Key Types (planned Rust)

```rust
pub struct X402ServiceRecord {
    pub service_id: ServiceId,
    pub namespace_id: NamespaceId,
    pub units_purchased: u32,
    pub amount_charged: u128,   // In USDF base units (7 decimals)
    pub payment_proof: PaymentProof,
    pub timestamp: u64,
    pub tx_hash: Option<[u8; 32]>,   // Settlement tx on Apostle Chain
}

pub enum PaymentProof {
    LocalAdapter,                    // Dev mode — no real payment
    X402PaymentHeader(Vec<u8>),      // Raw x402 payment header bytes
    ApostleChainTxRef([u8; 32]),     // Settled via Apostle Chain bridge
}

pub struct ServiceQuota {
    pub namespace_id: NamespaceId,
    pub service_id: ServiceId,
    pub units_remaining: Option<u32>,   // None = unlimited
    pub monthly_limit: Option<u128>,
    pub current_month_usage: u128,
}
```

## Service IDs

| Service ID | Price (USDF) | Status |
|------------|-------------|--------|
| EXECUTOR_PACKET_EXPORT | 0.50 | LOCAL_ADAPTER |
| BENEFICIARY_PACKET_EXPORT | 0.50 | LOCAL_ADAPTER |
| AUDIT_LOG_EXPORT | 0.25 | LOCAL_ADAPTER |
| COMPLIANCE_REPORT | 1.00 | LOCAL_ADAPTER |
| CROSS_CHAIN_SNAPSHOT | 0.75 | PROD_REQUIRES_GATEWAY |
| NAMESPACE_MANIFEST_EXPORT | 0.25 | LOCAL_ADAPTER |
| NOTARIZATION_REQUEST | 5.00 | PROD_REQUIRES_GATEWAY |
| API_METERED_CALL | 0.01 | X402_READY |

## Events Emitted

- `ServicePaymentRecorded { namespace_id, service_id, amount }`
- `QuotaUpdated { namespace_id, service_id, remaining }`
- `QuotaExhausted { namespace_id, service_id }`

## Integration with Next.js App

The current web app has a `lib/x402/index.ts` adapter that checks service
access in LOCAL_ADAPTER mode. The on-chain module is the production settlement
layer for the same service definitions.

## See Also

- `../../../../lib/x402/index.ts` — web app x402 adapter
- `../../docs/X402_INTEGRATION.md` — full x402 integration documentation
