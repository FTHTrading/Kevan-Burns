import { Wallet as XrplWallet } from "xrpl";
import { ethers } from "ethers";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import StellarSdk from "stellar-sdk";
import crypto from "crypto";

async function main() {
  const entropy = crypto.createHash("sha256").update("kevan.legacy").digest();
  
  // 1. EVM
  const evmWallet = new ethers.Wallet(entropy.toString("hex"));
  console.log("EVM Address:", evmWallet.address);
  console.log("EVM PrivateKey:", evmWallet.privateKey);

  // 2. Solana
  const solanaKey = SolanaKeypair.fromSeed(new Uint8Array(entropy));
  console.log("Solana Address:", solanaKey.publicKey.toBase58());
  console.log("Solana SecretKey:", Buffer.from(solanaKey.secretKey).toString("hex").slice(0, 64) + "...");

  // 3. Stellar
  const stellarKey = StellarSdk.Keypair.fromRawEd25519Seed(entropy);
  console.log("Stellar Address:", stellarKey.publicKey());
  console.log("Stellar Secret:", stellarKey.secret());

  // 4. XRPL
  const xrplWallet = XrplWallet.fromEntropy(entropy);
  console.log("XRPL Address:", xrplWallet.address);
  console.log("XRPL PrivateKey:", xrplWallet.privateKey);
}

main();
