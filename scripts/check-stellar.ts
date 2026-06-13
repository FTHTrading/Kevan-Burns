import * as StellarSdk from "stellar-sdk";

async function checkStellar(secret: string, label: string) {
  try {
    const kp = StellarSdk.Keypair.fromSecret(secret);
    const horizon = new StellarSdk.Horizon.Server("https://horizon.stellar.org");
    const account = await horizon.loadAccount(kp.publicKey());
    const nativeBalance = account.balances.find(b => b.asset_type === "native");
    console.log(`[${label}] Address: ${kp.publicKey()} | Balance: ${nativeBalance ? nativeBalance.balance : "0"} XLM`);
  } catch (e: any) {
    console.error(`[${label}] error:`, e.message);
  }
}

async function main() {
  const secret = "SANAS625QLKZNDVODUDHNAMDJKH7D2EUAMD7ETSZPBQGESV63YAU2HQN";
  await checkStellar(secret, "OPTKAS Distribution Wallet");
}

main().catch(console.error);
