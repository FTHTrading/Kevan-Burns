/**
 * lib/wallet/deterministic.ts
 *
 * Deterministic multi-chain wallet derivation from a sovereign namespace.
 * Generates EVM, Solana, Stellar, and XRPL keypairs so users don't need
 * to connect external wallets during onboarding.
 *
 * Designed for Troptions Unity Legacy Vault.
 */

import { ethers } from "ethers";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import StellarSdk from "stellar-sdk";
import { Wallet as XrplWallet } from "xrpl";

export interface DeterministicWallet {
  address: string;
  privateKey: string;
  publicKey?: string;
}

export interface MultiChainWallets {
  evm: DeterministicWallet;
  solana: DeterministicWallet;
  stellar: DeterministicWallet;
  xrpl: DeterministicWallet;
}

/**
 * Derives a 32-byte seed from a sovereign namespace.
 */
export async function deriveSeedFromNamespace(namespace: string): Promise<Buffer> {
  const salt = process.env.WALLET_SALT || "legacy-sovereign-salt-norcross-ga-2026";
  const cleanNamespace = namespace.trim().toLowerCase();
  
  const enc = new TextEncoder();
  const keyData = enc.encode(salt);
  const messageData = enc.encode(cleanNamespace);

  const subtle = typeof globalThis !== "undefined" && globalThis.crypto?.subtle
    ? globalThis.crypto.subtle
    : (await import("crypto")).webcrypto?.subtle;

  if (!subtle) {
    throw new Error("Web Crypto subtle API not available");
  }

  const key = await subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await subtle.sign(
    "HMAC",
    key,
    messageData
  );

  return Buffer.from(signature);
}

/**
 * Derives EVM, Solana, Stellar, and XRPL wallets from a sovereign namespace.
 */
export async function deriveWallets(namespace: string): Promise<MultiChainWallets> {
  const seed = await deriveSeedFromNamespace(namespace);

  // 1. EVM
  const evmWallet = new ethers.Wallet(seed.toString("hex"));

  // 2. Solana
  const solanaKeypair = SolanaKeypair.fromSeed(new Uint8Array(seed));

  // 3. Stellar
  const stellarKeypair = StellarSdk.Keypair.fromRawEd25519Seed(seed);

  // 4. XRPL
  const xrplWallet = XrplWallet.fromEntropy(seed);

  return {
    evm: {
      address: evmWallet.address,
      privateKey: evmWallet.privateKey,
    },
    solana: {
      address: solanaKeypair.publicKey.toBase58(),
      privateKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
    },
    stellar: {
      address: stellarKeypair.publicKey(),
      privateKey: stellarKeypair.secret(),
    },
    xrpl: {
      address: xrplWallet.address,
      privateKey: xrplWallet.privateKey,
    },
  };
}
