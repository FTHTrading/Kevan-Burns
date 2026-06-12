/**
 * lib/stellar/stellar-adapter.ts
 *
 * Stellar connector for Legacy Vault Protocol.
 * Handles: document hash anchoring via Stellar transaction memo,
 * account balance snapshots, and asset/trustline queries.
 *
 * Mainnet: https://horizon.stellar.org
 * Testnet: https://horizon-testnet.stellar.org
 *
 * Set STELLAR_SECRET_KEY and STELLAR_NETWORK in .env.
 */

export interface StellarAnchorResult {
  txHash: string;
  ledger: number;
  fee: string;
  account: string;
  timestamp: string;
  network: string;
}

export interface StellarBalanceSnapshot {
  account: string;
  xlmBalance: string;
  assets: { code: string; issuer: string; balance: string; limit: string }[];
  network: string;
  timestamp: string;
}

function getHorizonUrl(): string {
  const net = process.env.STELLAR_NETWORK || "testnet";
  return net === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}

/**
 * Anchor a document hash to Stellar via transaction memo.
 * Uses MEMO_HASH (32 bytes) for the SHA-256 document hash.
 */
export async function anchorDocumentHashStellar(params: {
  documentId: string;
  sha256Hash: string;
  templateId: string;
}): Promise<StellarAnchorResult> {
  const secretKey = process.env.STELLAR_SECRET_KEY;
  const network   = process.env.STELLAR_NETWORK || "testnet";
  const horizonUrl = getHorizonUrl();

  if (!secretKey) {
    return {
      txHash: "STELLAR_MOCK_" + params.sha256Hash.slice(0, 28).toUpperCase(),
      ledger: 0,
      fee: "0",
      account: "GMOCK_STELLAR_ADDRESS_NOT_FUNDED",
      timestamp: new Date().toISOString(),
      network: "mock",
    };
  }

  const StellarSDK = await import("@stellar/stellar-sdk");
  const server = new StellarSDK.Horizon.Server(horizonUrl);
  const keypair = StellarSDK.Keypair.fromSecret(secretKey);

  const account = await server.loadAccount(keypair.publicKey());

  // MEMO_HASH takes a 32-byte Buffer (the raw SHA-256 hash)
  const hashBuffer = Buffer.from(params.sha256Hash, "hex");
  const memo = StellarSDK.Memo.hash(hashBuffer);

  // Minimal payment to self (required for a valid tx) + memo
  const tx = new StellarSDK.TransactionBuilder(account, {
    fee: StellarSDK.BASE_FEE,
    networkPassphrase: network === "mainnet"
      ? StellarSDK.Networks.PUBLIC
      : StellarSDK.Networks.TESTNET,
  })
    .addOperation(StellarSDK.Operation.payment({
      destination: keypair.publicKey(),
      asset: StellarSDK.Asset.native(),
      amount: "0.0000001",
    }))
    .addMemo(memo)
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  const response = await server.submitTransaction(tx);

  return {
    txHash: response.hash,
    ledger: response.ledger,
    fee: String(tx.fee),
    account: keypair.publicKey(),
    timestamp: new Date().toISOString(),
    network,
  };
}

/**
 * Get Stellar account balance and asset list.
 */
export async function getStellarSnapshot(address: string): Promise<StellarBalanceSnapshot> {
  const horizonUrl = getHorizonUrl();
  const network = process.env.STELLAR_NETWORK || "testnet";

  if (!process.env.STELLAR_SECRET_KEY && !process.env.STELLAR_LIVE) {
    return {
      account: address,
      xlmBalance: "0",
      assets: [],
      network: "mock",
      timestamp: new Date().toISOString(),
    };
  }

  const StellarSDK = await import("@stellar/stellar-sdk");
  const server = new StellarSDK.Horizon.Server(horizonUrl);

  const account = await server.loadAccount(address);

  let xlmBalance = "0";
  const assets: StellarBalanceSnapshot["assets"] = [];

  for (const b of account.balances) {
    if (b.asset_type === "native") {
      xlmBalance = b.balance;
    } else if (b.asset_type === "credit_alphanum4" || b.asset_type === "credit_alphanum12") {
      assets.push({
        code:    b.asset_code ?? "",
        issuer:  b.asset_issuer ?? "",
        balance: b.balance,
        limit:   b.limit ?? "0",
      });
    }
  }

  return { account: address, xlmBalance, assets, network, timestamp: new Date().toISOString() };
}
