import { Wallet as XrplWallet } from "xrpl";
import crypto from "crypto";

async function main() {
  const entropy = crypto.createHash("sha256").update("test-namespace").digest();
  console.log("Entropy length:", entropy.length);
  try {
    const wallet = XrplWallet.fromEntropy(entropy);
    console.log("Wallet address:", wallet.address);
    console.log("Wallet privateKey:", wallet.privateKey);
  } catch (e: any) {
    console.error("Error fromEntropy:", e.message);
  }
}

main();
