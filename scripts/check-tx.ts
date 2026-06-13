import { Connection } from "@solana/web3.js";

async function main() {
  const txHash = "21XWVgrw8ocVcS8Wpi4uBe1xvhehgz2rQvjn5KbKi3Xx71ocJjcXjaENu6Lg83NEBwXmEPbsiPMeVJwxrn4VxoMH";
  console.log("Checking signature on Solana Mainnet:", txHash);

  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  try {
    const tx = await connection.getTransaction(txHash, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (tx) {
      console.log("Transaction found on mainnet!");
      console.log("Slot:", tx.slot);
      console.log("Block time:", tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : "N/A");
    } else {
      console.log("Transaction NOT found on mainnet (returned null).");
    }
  } catch (err: any) {
    console.error("Error fetching transaction:", err.message);
  }
}

main().catch(err => console.error(err));
