import dotenv from "dotenv";
import { Client as XrplClient, Wallet as XrplWallet } from "xrpl";
import * as StellarSdk from "stellar-sdk";
import { Connection, Keypair } from "@solana/web3.js";

dotenv.config();

async function checkSolana(keyStr: string) {
  try {
    const conn = new Connection("https://api.mainnet-beta.solana.com");
    // Parse keyStr: it could be a base58 string or a JSON array of numbers
    let keypair: Keypair;
    if (keyStr.startsWith("[")) {
      const arr = JSON.parse(keyStr);
      keypair = Keypair.fromSecretKey(Uint8Array.from(arr));
    } else {
      // assume it is a private key or seed
      console.log("Solana Key format not recognized as JSON array");
      return;
    }
    const bal = await conn.getBalance(keypair.publicKey);
    console.log(`Solana Account: ${keypair.publicKey.toBase58()} | Balance: ${bal / 1e9} SOL`);
  } catch (e: any) {
    console.error("Solana balance check error:", e.message);
  }
}

async function checkStellar(secret: string) {
  try {
    const kp = StellarSdk.Keypair.fromSecret(secret);
    const horizon = new StellarSdk.Horizon.Server("https://horizon.stellar.org");
    const account = await horizon.loadAccount(kp.publicKey());
    const nativeBalance = account.balances.find(b => b.asset_type === "native");
    console.log(`Stellar Account: ${kp.publicKey()} | Balance: ${nativeBalance ? nativeBalance.balance : "0"} XLM`);
  } catch (e: any) {
    console.error("Stellar balance check error:", e.message);
  }
}

async function checkXRPL(seed: string) {
  try {
    const client = new XrplClient("wss://xrplcluster.com");
    await client.connect();
    const wallet = XrplWallet.fromSeed(seed);
    const response = await client.request({
      command: "account_info",
      account: wallet.address,
      ledger_index: "validated"
    });
    console.log(`XRPL Account: ${wallet.address} | Balance: ${Number(response.result.account_data.Balance) / 1e6} XRP`);
    await client.disconnect();
  } catch (e: any) {
    console.error("XRPL balance check error:", e.message);
  }
}

async function main() {
  console.log("Checking balances for mainnet configs in .env...");
  
  if (process.env.SOLANA_PRIVATE_KEY) {
    await checkSolana(process.env.SOLANA_PRIVATE_KEY);
  } else {
    console.log("Solana: no key set");
  }

  if (process.env.STELLAR_SECRET_KEY) {
    await checkStellar(process.env.STELLAR_SECRET_KEY);
  } else {
    console.log("Stellar: no key set");
  }

  if (process.env.XRPL_WALLET_SEED) {
    await checkXRPL(process.env.XRPL_WALLET_SEED);
  } else {
    console.log("XRPL: no seed set");
  }
}

main();
