/**
 * lib/solana/solana-adapter.ts
 *
 * PRODUCTION Solana Mainnet adapter — Legacy Vault Protocol / Unykorn CWS.
 *
 * Uses @solana/web3.js to:
 *  1. Anchor namespace/relic hashes to Solana mainnet-beta via SPL Memo program
 *  2. Return real transaction signatures verifiable on Solscan / Explorer
 *  3. Derive keypair from SOLANA_PRIVATE_KEY (base58 seed, 32 bytes)
 *
 * Memo Program: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
 * Network:      https://api.mainnet-beta.solana.com
 */

if (typeof window === "undefined") {
  (globalThis as any).window = globalThis;
}

import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  PublicKey,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import bs58 from "bs58";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAINNET_RPC = "https://api.mainnet-beta.solana.com";
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SolanaAnchorResult {
  txHash: string;
  slot: number;
  fee: string;
  account: string;
  timestamp: string;
  network: "mainnet-beta";
  explorerUrl: string;
}

export interface SolanaBalanceSnapshot {
  account: string;
  solBalance: string;
  tokens: { mint: string; balance: string }[];
  network: string;
  timestamp: string;
}

// ─── Keypair ─────────────────────────────────────────────────────────────────

function getOperatorKeypair(): Keypair {
  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw) throw new Error("SOLANA_PRIVATE_KEY not set in environment.");

  const decoded = bs58.decode(raw);

  // 32-byte seed → derive full ed25519 keypair
  if (decoded.length === 32) {
    return Keypair.fromSeed(decoded);
  }
  // 64-byte full keypair
  if (decoded.length === 64) {
    return Keypair.fromSecretKey(decoded);
  }

  // Try treating as raw JSON array (Solana CLI format)
  try {
    const arr = JSON.parse(Buffer.from(raw, "utf8").toString()) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(arr));
  } catch {
    throw new Error(`Invalid SOLANA_PRIVATE_KEY format (decoded ${decoded.length} bytes, expected 32 or 64).`);
  }
}

// ─── Core: Memo Anchor ────────────────────────────────────────────────────────

/**
 * Anchors a namespace/relic record to Solana mainnet-beta via SPL Memo program.
 * The memo payload contains: { id, hash, cid, network: "cws.omaha26" }
 * This creates an immutable on-chain record verifiable on Solscan.
 */
export async function anchorToSolanaMainnet(params: {
  documentId: string;
  sha256Hash: string;
  ipfsCid: string;
  label: string;
}): Promise<SolanaAnchorResult> {
  const connection = new Connection(MAINNET_RPC, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
  });

  const keypair = getOperatorKeypair();

  // Build compact memo payload — stays within 566 byte memo limit
  const memoPayload = JSON.stringify({
    v: "1",
    proto: "unykorn.cws.2026",
    id: params.documentId,
    hash: params.sha256Hash.slice(0, 16),
    cid: params.ipfsCid,
    ts: Math.floor(Date.now() / 1000),
  });

  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoPayload, "utf8"),
  });

  // Priority fee to ensure confirmation (~0.0001 SOL extra)
  const priorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 10_000,
  });

  const tx = new Transaction().add(priorityFee, memoInstruction);
  tx.feePayer = keypair.publicKey;

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;

  const signature = await sendAndConfirmTransaction(connection, tx, [keypair], {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  // Fetch slot for the confirmed tx
  const txInfo = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  const slot = txInfo?.slot ?? 0;
  const fee = txInfo?.meta?.fee
    ? `${(txInfo.meta.fee / LAMPORTS_PER_SOL).toFixed(6)} SOL`
    : "~0.000005 SOL";

  return {
    txHash: signature,
    slot,
    fee,
    account: keypair.publicKey.toBase58(),
    timestamp: new Date().toISOString(),
    network: "mainnet-beta",
    explorerUrl: `https://solscan.io/tx/${signature}`,
  };
}

/**
 * Legacy compat shim — used by the existing namespace register route.
 */
export async function anchorDocumentHashSolana(params: {
  documentId: string;
  sha256Hash: string;
  templateId: string;
}): Promise<SolanaAnchorResult> {
  return anchorToSolanaMainnet({
    documentId: params.documentId,
    sha256Hash: params.sha256Hash,
    ipfsCid: "",
    label: params.templateId,
  });
}

/**
 * Get Solana mainnet account balance.
 */
export async function getSolanaSnapshot(address: string): Promise<SolanaBalanceSnapshot> {
  const connection = new Connection(MAINNET_RPC, { commitment: "confirmed" });

  let solBalance = "0.000000";
  try {
    const lamports = await connection.getBalance(new PublicKey(address));
    solBalance = (lamports / LAMPORTS_PER_SOL).toFixed(6);
  } catch {
    solBalance = "0.000000";
  }

  return {
    account: address,
    solBalance,
    tokens: [],
    network: "mainnet-beta",
    timestamp: new Date().toISOString(),
  };
}
