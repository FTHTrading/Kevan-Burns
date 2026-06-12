import { Keypair as StellarKeypair } from "@stellar/stellar-sdk";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import { Wallet as XrplWallet } from "xrpl";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

async function getBalances() {
  console.log("=== CHECKING CONFIGURATION WALLET BALANCES ===");

  // 1. Stellar
  const stellarSecret = process.env.STELLAR_SECRET_KEY;
  if (stellarSecret) {
    try {
      const kp = StellarKeypair.fromSecret(stellarSecret);
      const address = kp.publicKey();
      console.log(`Stellar Public Address: ${address}`);
      const res = await fetch(`https://horizon.stellar.org/accounts/${address}`);
      if (res.ok) {
        const data = await res.json();
        const nativeBalance = data.balances.find((b: any) => b.asset_type === "native")?.balance;
        console.log(`Stellar XLM Balance: ${nativeBalance} XLM`);
        console.log("Other assets:", data.balances.filter((b: any) => b.asset_type !== "native").map((b: any) => `${b.asset_code}: ${b.balance}`));
      } else {
        console.log(`Stellar Horizon response not OK: ${res.status}`);
      }
    } catch (err: any) {
      console.log(`Stellar error: ${err.message}`);
    }
  } else {
    console.log("Stellar Secret Key not configured in .env");
  }

  // 2. Solana
  const solanaPrivateKey = process.env.SOLANA_PRIVATE_KEY;
  if (solanaPrivateKey) {
    try {
      let payer;
      if (solanaPrivateKey.includes(",")) {
        const secretKey = Uint8Array.from(JSON.parse(solanaPrivateKey));
        payer = secretKey.length === 32 ? SolanaKeypair.fromSeed(secretKey) : SolanaKeypair.fromSecretKey(secretKey);
      } else {
        const decoded = bs58.decode(solanaPrivateKey);
        payer = decoded.length === 32 ? SolanaKeypair.fromSeed(decoded) : SolanaKeypair.fromSecretKey(decoded);
      }
      const address = payer.publicKey.toBase58();
      console.log(`Solana Public Address: ${address}`);
      
      const res = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [address]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const balance = (data.result?.value ?? 0) / 1e9;
        console.log(`Solana SOL Balance: ${balance} SOL`);
      } else {
        console.log(`Solana RPC response not OK: ${res.status}`);
      }
    } catch (err: any) {
      console.log(`Solana error: ${err.message}`);
    }
  } else {
    console.log("Solana Private Key not configured in .env");
  }

  // 3. XRPL
  const xrplSeed = process.env.XRPL_WALLET_SEED;
  if (xrplSeed) {
    try {
      const wallet = XrplWallet.fromSeed(xrplSeed);
      console.log(`XRPL Public Address: ${wallet.address}`);
      const res = await fetch("https://xrplcluster.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "account_info",
          params: [{ account: wallet.address, ledger_index: "validated" }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const balanceDrops = data.result?.account_data?.Balance ?? 0;
        const balanceXrp = balanceDrops / 1e6;
        console.log(`XRPL XRP Balance: ${balanceXrp} XRP`);
      } else {
        console.log(`XRPL RPC response not OK: ${res.status}`);
      }
    } catch (err: any) {
      console.log(`XRPL error: ${err.message}`);
    }
  } else {
    console.log("XRPL Wallet Seed not configured in .env");
  }
}

getBalances();
