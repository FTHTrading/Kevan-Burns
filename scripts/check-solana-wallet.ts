import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

async function main() {
  const address = "Bg2bkQoEcezhvzYrJQMafwmB3CT3KsPWfWGnYKFUkQ9b";
  console.log("Solana Wallet Public Key:", address);
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  const balance = await connection.getBalance(new PublicKey(address));
  console.log("Solana Wallet Balance:", balance / LAMPORTS_PER_SOL, "SOL");
}

main().catch(err => {
  console.error(err);
});
