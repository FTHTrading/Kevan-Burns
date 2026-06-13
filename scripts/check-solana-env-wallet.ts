import dotenv from "dotenv";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";

dotenv.config();

async function main() {
  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw) {
    console.error("SOLANA_PRIVATE_KEY not set in env");
    return;
  }

  let decoded: Uint8Array;
  try {
    decoded = bs58.decode(raw);
  } catch (err: any) {
    console.error("Failed to decode base58 key:", err.message);
    return;
  }

  let keypair: Keypair;
  if (decoded.length === 32) {
    keypair = Keypair.fromSeed(decoded);
  } else if (decoded.length === 64) {
    keypair = Keypair.fromSecretKey(decoded);
  } else {
    console.error(`Invalid key length: ${decoded.length}`);
    return;
  }

  const address = keypair.publicKey.toBase58();
  console.log("Derived Solana Public Key:", address);

  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  const balance = await connection.getBalance(keypair.publicKey);
  console.log("Solana Wallet Balance:", balance / LAMPORTS_PER_SOL, "SOL");
}

main().catch(err => console.error(err));
