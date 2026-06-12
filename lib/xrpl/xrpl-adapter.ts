/**
 * lib/xrpl/xrpl-adapter.ts
 *
 * XRPL connector for Legacy Vault Protocol.
 * Handles: document hash anchoring via AccountSet/Memo,
 * wallet balance snapshots, and trustline queries.
 *
 * Mainnet endpoint: wss://xrplcluster.com
 * Testnet endpoint: wss://s.altnet.rippletest.net:51233
 *
 * Set XRPL_WALLET_SEED and XRPL_NETWORK in .env.
 */

export interface XrplAnchorResult {
  txHash: string;
  ledgerIndex: number;
  fee: string;
  account: string;
  timestamp: string;
  network: string;
}

export interface XrplBalanceSnapshot {
  account: string;
  xrpBalance: string;
  trustlines: { currency: string; issuer: string; balance: string; limit: string }[];
  network: string;
  timestamp: string;
}

const NETWORKS = {
  mainnet: "wss://xrplcluster.com",
  testnet: "wss://s.altnet.rippletest.net:51233",
  devnet:  "wss://s.devnet.rippletest.net:51233",
};

function getNetwork(): string {
  const net = (process.env.XRPL_NETWORK || "testnet") as keyof typeof NETWORKS;
  return NETWORKS[net] ?? NETWORKS.testnet;
}

/**
 * Anchor a document hash to XRPL via AccountSet Memo.
 * The hash is stored as hex in the Memo field — permanently on-ledger.
 */
export async function anchorDocumentHash(params: {
  documentId: string;
  sha256Hash: string;
  templateId: string;
}): Promise<XrplAnchorResult> {
  const seed = process.env.XRPL_WALLET_SEED;
  const networkUrl = getNetwork();
  const network = process.env.XRPL_NETWORK || "testnet";

  if (!seed) {
    // Return mock result for dev
    return {
      txHash: "MOCK_" + params.sha256Hash.slice(0, 32).toUpperCase(),
      ledgerIndex: 0,
      fee: "0",
      account: "rMOCK_XRPL_ADDRESS_NOT_FUNDED",
      timestamp: new Date().toISOString(),
      network: "mock",
    };
  }

  // Dynamic import — xrpl is server-side only
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(networkUrl);

  try {
    await client.connect();
    const wallet = Wallet.fromSeed(seed);

    const memoData = Buffer.from(JSON.stringify({
      protocol: "legacy-vault-protocol",
      documentId: params.documentId,
      templateId: params.templateId,
      sha256: params.sha256Hash,
      ts: new Date().toISOString(),
    })).toString("hex").toUpperCase();

    const tx = await client.submitAndWait({
      TransactionType: "AccountSet",
      Account: wallet.address,
      Memos: [{
        Memo: {
          MemoType: Buffer.from("legacy-vault/document-hash").toString("hex").toUpperCase(),
          MemoData: memoData.slice(0, 2048), // XRPL memo limit
        },
      }],
    }, { wallet });

    const meta = tx.result.meta as { TransactionResult?: string };
    if (meta?.TransactionResult !== "tesSUCCESS") {
      throw new Error(`XRPL tx failed: ${meta?.TransactionResult}`);
    }

    return {
      txHash: String(tx.result.hash),
      ledgerIndex: Number((tx.result as { ledger_index?: number }).ledger_index ?? 0),
      fee: String((tx.result as { Fee?: string }).Fee ?? "0"),
      account: wallet.address,
      timestamp: new Date().toISOString(),
      network,
    };
  } finally {
    await client.disconnect();
  }
}

/**
 * Get XRPL account balance and trustlines.
 */
export async function getXrplSnapshot(address: string): Promise<XrplBalanceSnapshot> {
  const networkUrl = getNetwork();
  const network = process.env.XRPL_NETWORK || "testnet";

  // Mock if no live network indicated
  if (!process.env.XRPL_WALLET_SEED && !process.env.XRPL_LIVE) {
    return {
      account: address,
      xrpBalance: "0",
      trustlines: [],
      network: "mock",
      timestamp: new Date().toISOString(),
    };
  }

  const { Client } = await import("xrpl");
  const client = new Client(networkUrl);

  try {
    await client.connect();

    const accountInfo = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "current",
    });

    const xrpDrops = BigInt(accountInfo.result.account_data.Balance);
    const xrpBalance = (Number(xrpDrops) / 1_000_000).toFixed(6);

    const lines = await client.request({
      command: "account_lines",
      account: address,
    });

    const trustlines = (lines.result.lines || []).map((l: {
      currency: string; account: string; balance: string; limit: string;
    }) => ({
      currency: l.currency,
      issuer: l.account,
      balance: l.balance,
      limit: l.limit,
    }));

    return { account: address, xrpBalance, trustlines, network, timestamp: new Date().toISOString() };
  } finally {
    await client.disconnect();
  }
}
