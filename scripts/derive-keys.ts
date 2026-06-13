import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { mnemonicToSeedSync } from "@scure/bip39";
import bs58 from "bs58";

async function checkBalance(pubkey: PublicKey, label: string) {
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  try {
    const balance = await connection.getBalance(pubkey);
    console.log(`[${label}] Address: ${pubkey.toBase58()} | Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (err: any) {
    console.error(`[${label}] Failed to get balance:`, err.message);
  }
}

async function main() {
  const mnemonic = "clever weird ribbon only maximum cheap tag pear upper gown swap citizen";
  console.log("Mnemonic:", mnemonic);

  // Derive seed from mnemonic
  const seed = mnemonicToSeedSync(mnemonic);

  // Try standard seed bytes (first 32 bytes of the 64-byte BIP39 seed)
  const keypair2 = Keypair.fromSeed(seed.slice(0, 32));
  await checkBalance(keypair2.publicKey, "Derived raw 32 bytes seed");
}

main().catch(err => {
  console.error(err);
});
