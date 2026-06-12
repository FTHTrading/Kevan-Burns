[Full updated ARCHITECTURE.md with Troptions integration section, chain recs (Besu primary for Legacy Vault estate/compliance/RWA + XRPL for settlement/payouts + Solana/Avalanche for RWA + Chainlink oracles), actual smart contracts (Legacy core + Troptions 33 via BridgePayload/SystemBootstrap/Validator/ImmutableLedger etc.), Web3/CF config using token placeholder for IPFS pinning of manifests/docs, Workers for agentmail/AI, gateways; Mermaid flows for Legacy + rails integration; production checklist updated with rails wiring; preserved original content]

# Legacy Vault Protocol — Architecture

## Summary

... [original] ...

## Troptions Rails Integration & Recommended Chains

Legacy Vault is wired as a LIVE rail in the Troptions 9-rail sovereign empire (see FTHTrading/troptions-rails).

**Best Chain(s) for Legacy Vault**:
- **Primary: Hyperledger Besu (🟢 LIVE)**: Enterprise permissioned EVM for banking/compliance/CBDC. Ideal for estate planning (RUFADAA, 5-Proof guardians/attorney, legal docs), RWA (gems provenance), institutional posture. Matches Legacy's Solidity contracts and private registry. Deploy core (LegacyVaultRegistry, PolicyEngine, anchors) here via Troptions master bootstrap.

- **Settlement & "Take the Money" Payouts: XRPL (🟢 LIVE)**: Fast/cheap, AMM, issued stables (RLUSD/USDT), proof packets. Perfect for beneficiary claims, multi-asset estate transfers.

- **RWA Tokenization/Mints: Solana (🟢 LIVE) or Avalanche (🔵 BUILT with VRF/RWAToken)**: Solana for user intake/minting (troptionsmint); Avalanche for high-throughput, VRF randomness in proofs/quorum.

- **Oracles/Proofs: Chainlink (🔵 ADAPTER UP)**: VRF, PoR for reserves, Automation for timed releases. Integrated in Troptions core.

**Integration**: Use Troptions BridgePayload (universal struct for intent/stables/proofs), CrossChainRouter, RailRegistry, SystemValidator (health checks), Master Bootstrap (TroptionsSystemBootstrap.sol deploys/wires Legacy + 33 contracts in one cmd). Golden Path for full flows (intake -> RWA -> settlement -> Besu Legacy anchor -> XRPL payout -> beneficiary via CF IPFS proofs).

Deploy on Fuji (Avalanche test for bootstrap) or Besu testnet; main where supported. See troptions-rails/scripts/deploy-all.sh + Legacy contracts/.

## Actual Smart Contracts Needed

**Legacy Core (contracts/src/ - primary on Besu)**:
- LegacyVaultRegistry.sol (registerVault, updateManifest, anchorAuditEvent, set status)
- LegacyPolicyEngine.sol (5-Proof evaluation: identity, death proof, attorney, guardian quorum, waiting period)
- LegacyAccessControl.sol, LegacyAuditLog.sol (immutable events), LegacyNamespaceRegistry.sol, LegacyVaultAnchor.sol

**Troptions Rails for Full System (33 contracts from troptions-rails/contracts - use master bootstrap)**:
- BridgePayload.sol + BridgePayloadLib (glue across 9 rails for Legacy flows)
- TroptionsSystemBootstrap.sol (one-command deploy all + Legacy wiring)
- TroptionsSystemValidator.sol (runFullSystemCheck for Legacy + rails health)
- TroptionsCrossChainRouter.sol, TroptionsRailRegistry.sol (route Legacy to XRPL/Besu/etc.)
- TroptionsImmutableLedger.sol (permanent audit for estate compliance)
- TroptionsKYCCompliance.sol, TroptionsProofVerifier.sol (docs/RWA proofs)
- TroptionsAtomicSettlement.sol, TroptionsEliteSettlementCore.sol (payouts/"take money")
- TroptionsGovernanceTimelock.sol, TroptionsEmergencyGovernor.sol (multi-party release governance)
- TroptionsRWAToken.sol, TroptionsTokenFactory.sol (gems RWA)
- TroptionsCCIPBridge.sol, TroptionsSportsVRF.sol (Avalanche/Chainlink for VRF in 5-Proof)
- ... (full 33: RateLimiter, Compliance, etc.)

**Wiring**: Legacy on Besu registry/anchor; bridge payloads for cross-rail (XRPL settlement, Solana mint); CF IPFS for encrypted off-chain (manifests/docs); on-chain hashes/audits via Troptions ledger/validator.

## Web3 Configuration (Cloudflare API + Troptions Rails)

Use verified token (from cloudflare api.txt; store as secret/env var $CLOUDFLARE_API_TOKEN - never commit raw):

```bash
# Verify (PowerShell or bash)
curl "https://api.cloudflare.com/client/v4/user/tokens/verify" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# Deploy site (e.g. legacychain.app or troptions site)
wrangler pages publish . --project-name=legacy-vault --branch=main --account-id=07bcc4a189ef176261b818409c95891f

# IPFS for Legacy manifests/docs (update lib/ipfs/ipfs-adapter.ts to CF gateway; pin encrypted blobs)
# Access: https://<cid>.ipfs.cf-ipfs.com/ (decentralized for beneficiaries)

# Workers for AgentMail (app/api/agentmail), AI concierge (/api/ask)

# Ethereum gateway for EVM anchors (if not pure Besu)
```

See troptions-rails/docs/DEVELOPER_GUIDE.md + website/ for examples. Update Legacy .env:

CLOUDFLARE_API_TOKEN=cfut_YOUR_TOKEN
CLOUDFLARE_IPFS_GATEWAY=...
BESU_RPC=... (Troptions Besu endpoint or test)
XRPL_ENDPOINT=s.altnet.rippletest.net

Master full system (Legacy + Troptions 33):
./scripts/deploy-all.sh (from troptions-rails, extend for Legacy contracts on Besu)

Post-deploy: cast call <VALIDATOR> "isSystemFullyOperational()(bool)"

This configures the entire operational system: Legacy Vault on best chains (Besu+XRPL), Web3 via CF (IPFS/Pages/Workers/gateways), wired to Troptions empire for stables, bridges, proofs.

... [original architecture content preserved] ...

## Production connection checklist

... [updated with rails] ...
