# Legal and Security Guardrails

## Purpose

This document describes the legal constraints, security boundaries, and ethical guardrails built into Legacy Vault Protocol. Every operator, developer, and integrator must read this before deploying to production.

---

## Legal disclaimer (embedded in every release)

> Legacy Vault Protocol is infrastructure software, not legal advice. Transfer of assets at death depends on applicable estate law, court authority, platform terms of service, and attorney review. Nothing in this system replaces a properly executed will, trust, or probate proceeding. Consult qualified legal counsel for estate planning.

This disclaimer is displayed on:
- The home page footer
- The vault create page
- The release policy page
- The executor portal home page

---

## What this system does NOT do

| What it does NOT do                                 | Why                                                                                         |
|-----------------------------------------------------|---------------------------------------------------------------------------------------------|
| Secretly discover unknown wallets or accounts       | Consent-based only — owner must explicitly add every address                               |
| Store raw seed phrases or private keys              | Never accepted by any API route; enforced at schema and validation level                    |
| Automatically release assets on any single signal   | Five-condition multi-proof system; no single event triggers release                         |
| Provide legal advice                                | Operator is infrastructure, not counsel                                                     |
| Replace a will, trust, or probate proceeding        | Estate law governs actual asset transfer; this system organizes proof                       |
| Guarantee platform access on behalf of the estate  | Each platform (exchange, bank, etc.) has its own bereavement process and terms of service   |

---

## Data security rules

### What is stored in plaintext (database)
- User emails and names (needed for notifications)
- Vault labels and descriptions (non-sensitive)
- Asset labels and categories (non-sensitive)
- Document labels and types (non-sensitive)
- Wallet chain names and public addresses (publicly available on-chain)
- IPFS CIDs and content hashes (references only)
- Audit event actions, timestamps, actor IDs

### What is NEVER stored in plaintext
- Document contents (encrypted before IPFS upload)
- Vault manifest details (encrypted before IPFS upload)
- Seed phrases, private keys, wallet passwords
- Account login credentials for exchanges or banks
- Beneficiary allocation amounts (stored in encrypted manifest)

### What is NEVER stored anywhere
- Seed phrases
- Private keys
- Wallet passwords
- Exchange/bank login credentials

---

## Private IPFS security

- All blobs are encrypted with AES-256-GCM before upload
- The IPFS network must use a private swarm key (restrict to authorized nodes only)
- Access to the IPFS API must require an auth token
- CIDs are content-addressed — the same plaintext always produces the same hash, so **do not upload non-encrypted content**
- Reference: [IPFS Private Networks](https://docs.ipfs.tech/how-to/configuring-node/#private-networks)

---

## Private blockchain security

- Only CIDs, hashes, DIDs, policy IDs, and event hashes are written on-chain
- Never write account numbers, document contents, or identifying financial data on-chain
- The registry contract must restrict write access to authorized callers (owner key or multisig)
- Block explorers for the private chain should be access-controlled

---

## Identity and authentication

### Current (development placeholder)
- `x-user-id` HTTP header used for user identity in API routes
- **This is NOT secure for production**

### Required for production
- Replace with `next-auth` sessions backed by a secure identity provider
- Executor login must meet NIST SP 800-63-4 IAL 2 (in-person or supervised remote proofing)
- High-value vaults should require IAL 3
- All executor and attorney identity proofing must be logged in `VerificationCredential`

### Reference
- [NIST SP 800-63-4 Digital Identity Guidelines](https://pages.nist.gov/800-63-4/)

---

## Release process legal requirements

The five technical conditions in the release engine do not, by themselves, authorize asset transfer. Operators must ensure:

1. **Death certificate is a certified official document** — not a self-signed file
2. **Executor authority is validated by a licensed attorney** — not self-attested
3. **Guardian quorum participants are real verified people** — not sybil accounts
4. **Waiting period gives real disputants time to respond** — do not shorten to <14 days
5. **Dispute resolution must involve human review** — not automated

### Fiduciary access law
In the United States, fiduciary access to digital assets is governed by:
- The Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA) — adopted in most states
- State-specific estate and probate law
- Platform-specific terms of service (each exchange/bank has its own process)

Reference: [Uniform Law Commission — RUFADAA](https://www.uniformlaws.org/committees/community-home?CommunityKey=f7237fc4-74c2-4728-81c6-b39a91ecdf22)

---

## Verifiable Credentials (W3C VC 2.0)

The `VerificationCredential` model stores records of:
- Executor identity credentials (issued by a KYC provider)
- Attorney authority credentials (issued by a licensed attorney or their firm)
- Guardian approval records

In production:
- Implement a W3C VC 2.0 verifier using a DID resolver
- Accept only credentials issued by trusted issuers
- Verify credential signatures before writing to `VerificationCredential`
- Check credential expiry and revocation status

Reference: [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)

---

## Access control rules

- Only the vault owner may add wallets, assets, documents, executors, beneficiaries, and guardians
- Only registered executors may submit release claims
- Only guardians, executors, and beneficiaries may file disputes
- Only admins may approve or deny release claims
- Auditors receive only hashes, timestamps, and non-private event data
- Beneficiaries receive only items explicitly assigned to them

---

## Prohibited uses

Operators of this system must NOT:
- Use it to access another person's assets without legal authority
- Use it to conceal assets from a court, creditor, or tax authority
- Store information that would violate applicable privacy laws (GDPR, CCPA, etc.)
- Deploy it as a substitute for legal estate planning without attorney involvement
- Use the chain or IPFS components to store content that violates applicable law

---

## Incident response

If a vault is suspected to be accessed without authorization:
1. Immediately lock the vault via `setVaultStatus(vaultId, "LOCKED")`
2. Preserve all audit events
3. Export chain events for evidence
4. Notify the vault owner's emergency contacts (if configured)
5. Consult legal counsel

---

## Data retention and deletion

- Audit events are append-only and must not be deleted
- Vault data may be deleted by the owner while ACTIVE
- After a vault transitions to RELEASED, data should be retained for at least the applicable statute of limitations
- IPFS pins should be maintained for the same period
- On-chain records are permanent by design
