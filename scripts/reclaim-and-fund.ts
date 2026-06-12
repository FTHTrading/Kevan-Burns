import cp from "child_process";
import * as dotenv from "dotenv";

dotenv.config();

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const StellarSDK = await import("@stellar/stellar-sdk");
  const server = new StellarSDK.Horizon.Server("https://horizon.stellar.org");

  // Distributor
  const distributorSecret = process.env.STELLAR_SECRET_KEY;
  if (!distributorSecret) {
    throw new Error("STELLAR_SECRET_KEY is missing in environment");
  }
  const distributorKp = StellarSDK.Keypair.fromSecret(distributorSecret);
  const distributorAddress = distributorKp.publicKey();
  console.log(`Distributor: ${distributorAddress}`);

  // 1. Fetch TROPTIONS_STELLAR_ISSUER_SECRET from Secret Manager
  console.log("\n=========================================");
  console.log("1. Fetching TROPTIONS_STELLAR_ISSUER_SECRET from Secret Manager...");
  console.log("=========================================");
  let issuerSecret: string;
  try {
    issuerSecret = cp
      .execSync("gcloud secrets versions access latest --secret=TROPTIONS_STELLAR_ISSUER_SECRET --project=unykorn-sovereign-core", {
        stdio: ["pipe", "pipe", "ignore"],
      })
      .toString()
      .trim();
  } catch (e: any) {
    throw new Error(`Failed to fetch issuer secret: ${e.message}`);
  }

  const issuerKp = StellarSDK.Keypair.fromSecret(issuerSecret);
  const issuerAddress = issuerKp.publicKey();
  console.log(`Issuer: ${issuerAddress}`);

  // 2. Transfer 3.99 XLM from Issuer to Distributor
  console.log("\n=========================================");
  console.log("2. Transferring 3.99 XLM from Issuer to Distributor...");
  console.log("=========================================");
  try {
    const issuerAccount = await server.loadAccount(issuerAddress);
    const txTransfer = new StellarSDK.TransactionBuilder(issuerAccount, {
      fee: StellarSDK.BASE_FEE,
      networkPassphrase: StellarSDK.Networks.PUBLIC,
    })
      .addOperation(
        StellarSDK.Operation.payment({
          destination: distributorAddress,
          asset: StellarSDK.Asset.native(),
          amount: "3.99",
        })
      )
      .setTimeout(30)
      .build();

    txTransfer.sign(issuerKp);
    const resTransfer = await server.submitTransaction(txTransfer);
    console.log(`XLM Transfer Succeeded! Hash: ${resTransfer.hash}`);
  } catch (e: any) {
    console.error("XLM Transfer Failed:", e.message || e);
    if (e.response?.data) {
      console.error(JSON.stringify(e.response.data, null, 2));
    }
  }

  // 3. Load Distributor Account
  const distributorAccount = await server.loadAccount(distributorAddress);

  // 4. Delete the two empty trustlines and withdraw from Liquidity Pool in one transaction
  console.log("\n=========================================");
  console.log("3. Building transaction to clean trustlines and withdraw LP shares...");
  console.log("=========================================");
  try {
    const txClean = new StellarSDK.TransactionBuilder(distributorAccount, {
      fee: StellarSDK.BASE_FEE,
      networkPassphrase: StellarSDK.Networks.PUBLIC,
    });

    // Operation: Close empty BANK trustline
    console.log("Adding operation: close empty BANK trustline (GCU7FZMW...)");
    txClean.addOperation(
      StellarSDK.Operation.changeTrust({
        asset: new StellarSDK.Asset("BANK", "GCU7FZMWSH37FNBONGL42HXYLBCVKC3Y2HHAXY3YZAZQXMIVA33JC3GK"),
        limit: "0",
      })
    );

    // Operation: Close empty LEGACY trustline
    console.log("Adding operation: close empty LEGACY trustline (GDRDYZ3Y...)");
    txClean.addOperation(
      StellarSDK.Operation.changeTrust({
        asset: new StellarSDK.Asset("LEGACY", "GDRDYZ3YDSIYZ4YY7FHZ5VV7QU3YJR73NA3PNQQOBELQ25GZ555TY2BJ"),
        limit: "0",
      })
    );

    // Operation: Withdraw LP shares
    console.log("Adding operation: withdraw LP shares (pool: 0571cdfe...)");
    txClean.addOperation(
      StellarSDK.Operation.liquidityPoolWithdraw({
        liquidityPoolId: "0571cdfe962491e3789a447fcd0e172bfbe5eef41a654db99196494111bbff77",
        amount: "100.0",
        minAmountA: "0.0",
        minAmountB: "0.0",
      })
    );

    const builtTx = txClean.setTimeout(30).build();
    builtTx.sign(distributorKp);
    const resClean = await server.submitTransaction(builtTx);
    console.log(`Reclamation Transaction Succeeded! Hash: ${resClean.hash}`);
  } catch (e: any) {
    console.error("Reclamation Transaction Failed:", e.message || e);
    if (e.response?.data) {
      console.error(JSON.stringify(e.response.data, null, 2));
    }
  }

  console.log("\n=========================================");
  console.log("Reclamation Complete! Checking final balances...");
  console.log("=========================================");
  await sleep(3000);
  try {
    const finalAccount = await server.loadAccount(distributorAddress);
    const nativeBal = finalAccount.balances.find((b: any) => b.asset_type === "native")?.balance;
    console.log(`Final native XLM balance: ${nativeBal} XLM`);
    console.log(`Subentries count: ${finalAccount.subentry_count}`);
    const available = parseFloat(nativeBal) - (1.0 + finalAccount.subentry_count * 0.5);
    console.log(`Approx available balance: ${available} XLM`);
  } catch (e: any) {
    console.error("Failed to load final account info:", e.message);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
