# Operator Runbook

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+ (local or remote)
- (Optional) Private IPFS node (Kubo 0.27+)
- (Optional) Private EVM-compatible node

---

## 1. Install dependencies

```bash
cd legacy-vault-protocol
pnpm install
```

---

## 2. Configure environment

Copy the example file and fill in required values:

```bash
cp .env.example .env.local
```

Required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/legacy_vault"

# Encryption — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
VAULT_MASTER_KEY="<64-char hex>"

# Mock mode — set to "false" to connect real IPFS and chain
MOCK_IPFS="true"
MOCK_CHAIN="true"

# IPFS (production only — leave unset in mock mode)
# IPFS_API_URL="http://localhost:5001"
# IPFS_GATEWAY_URL="http://localhost:8080"
# IPFS_AUTH_TOKEN=""

# Chain (production only — leave unset in mock mode)
# CHAIN_RPC_URL="http://localhost:8545"
# REGISTRY_CONTRACT_ADDRESS="0x..."
# OPERATOR_PRIVATE_KEY="0x..."
```

---

## 3. Generate Prisma client

```bash
pnpm db:generate
```

---

## 4. Run database migrations

**Development (push schema directly):**
```bash
pnpm db:push
```

**Production (migration files):**
```bash
pnpm db:migrate
```

---

## 5. Seed demo data

```bash
pnpm db:seed
```

This creates:
- 6 demo users (owner, executor, beneficiary, guardian × 3)
- 1 vault: `vault-demo-001`
- 3 wallets (ETH, SOL, XRPL)
- 2 assets, 3 documents, 3 guardians, 1 executor, 1 beneficiary
- 5 audit events
- 2 release policies (default 2-of-3/30d, strict 3-of-5/60d)

---

## 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 7. Run tests

**Unit tests:**
```bash
pnpm test
```

**Type check:**
```bash
pnpm typecheck
```

**Lint:**
```bash
pnpm lint
```

**E2E tests (requires running server):**
```bash
pnpm dev &
pnpm test:e2e
```

---

## 8. Production build

```bash
pnpm build
pnpm start
```

---

## 9. Connect a real IPFS node (production)

### Install Kubo
See [https://docs.ipfs.tech/install/command-line/](https://docs.ipfs.tech/install/command-line/).

### Initialize with private swarm key
```bash
ipfs init
# Generate swarm.key:
echo -e "/key/swarm/psk/1.0.0/\n/base16/\n$(openssl rand -hex 32)" > ~/.ipfs/swarm.key
ipfs daemon
```

### Update .env
```bash
MOCK_IPFS="false"
IPFS_API_URL="http://localhost:5001"
IPFS_GATEWAY_URL="http://localhost:8080"
```

---

## 10. Connect a real private chain (production)

### Option A: Hardhat private network (development-grade)
```bash
npx hardhat node
```
Deploy registry contract, then:
```bash
MOCK_CHAIN="false"
CHAIN_RPC_URL="http://localhost:8545"
REGISTRY_CONTRACT_ADDRESS="0x..."
OPERATOR_PRIVATE_KEY="0x..."
```

### Option B: Besu / Geth private network (production-grade)
Follow the Hyperledger Besu private network guide.

---

## 11. Production identity / auth

Replace the `x-user-id` header demo pattern with `next-auth`:

```bash
pnpm add next-auth@beta
```

Implement a session-based auth provider. Ensure executor logins are gated by IAL 2/3 identity proofing before any release claim can be submitted.

---

## 12. Connect chain scanners (production)

Edit `lib/wallet/wallet-scanner.ts` and replace the mock stubs:

| Chain    | Recommended provider                          |
|----------|-----------------------------------------------|
| EVM      | Alchemy `eth_getBalance` RPC                  |
| Solana   | Helius `getBalance` RPC                       |
| XRPL     | xrpl.js + `account_info`                      |
| Stellar  | Horizon `/accounts/{address}`                 |

---

## 13. Monitoring

Recommended alerts:
- `VaultStatus = DISPUTED` → page on-call operator
- Audit event count drop (possible tamper) → alert
- IPFS node offline → alert
- Chain node offline → alert

---

## 14. Backup

| Component     | What to back up                     | How often     |
|---------------|-------------------------------------|---------------|
| PostgreSQL    | Full database dump                  | Daily         |
| IPFS node     | IPFS repository (`~/.ipfs`)         | Daily         |
| Chain data    | Chain node data directory           | Daily         |
| Encryption key| VAULT_MASTER_KEY (secure vault)     | On creation   |

> **Critical:** Losing `VAULT_MASTER_KEY` means all encrypted vault data is permanently unrecoverable.

---

## 15. Database studio (inspect / debug)

```bash
pnpm db:studio
```

Opens Prisma Studio at [http://localhost:5555](http://localhost:5555).

---

## 16. Environment variable reference

| Variable                    | Required | Default  | Description                          |
|-----------------------------|----------|----------|--------------------------------------|
| `DATABASE_URL`              | Yes      | —        | PostgreSQL connection string         |
| `VAULT_MASTER_KEY`          | Yes      | —        | 32-byte hex master encryption key    |
| `MOCK_IPFS`                 | No       | `true`   | Use in-memory IPFS mock              |
| `MOCK_CHAIN`                | No       | `true`   | Use in-memory chain mock             |
| `IPFS_API_URL`              | No       | —        | Kubo API URL (if MOCK_IPFS=false)    |
| `IPFS_GATEWAY_URL`          | No       | —        | IPFS gateway URL                     |
| `IPFS_AUTH_TOKEN`           | No       | —        | IPFS auth header token               |
| `CHAIN_RPC_URL`             | No       | —        | EVM RPC URL (if MOCK_CHAIN=false)    |
| `REGISTRY_CONTRACT_ADDRESS` | No       | —        | Deployed registry contract address   |
| `OPERATOR_PRIVATE_KEY`      | No       | —        | Operator signing key for chain txs   |
