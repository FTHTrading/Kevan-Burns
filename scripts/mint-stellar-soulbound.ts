import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mintAsset(assetCode: string) {
  const secretKey = process.env.STELLAR_SECRET_KEY;
  const network = process.env.STELLAR_NETWORK || "mainnet";
  const horizonUrl = network === "mainnet" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org";

  if (!secretKey) {
    throw new Error("STELLAR_SECRET_KEY is missing in environment");
  }

  console.log(`\n=========================================`);
  console.log(`Starting mint for Soulbound ${assetCode} on Stellar ${network.toUpperCase()}`);
  console.log(`=========================================`);

  const StellarSDK = await import("@stellar/stellar-sdk");
  const server = new StellarSDK.Horizon.Server(horizonUrl);
  const distributorKeypair = StellarSDK.Keypair.fromSecret(secretKey);
  const distributorAddress = distributorKeypair.publicKey();
  
  console.log(`Distributor Address: ${distributorAddress}`);

  // 1. Generate ephemeral issuer keypair
  const issuerKeypair = StellarSDK.Keypair.random();
  const issuerAddress = issuerKeypair.publicKey();
  console.log(`Generated Ephemeral Issuer: ${issuerAddress}`);

  const asset = new StellarSDK.Asset(assetCode, issuerAddress);

  // 2. Load distributor account to get sequence number
  const distributorAccount = await server.loadAccount(distributorAddress);

  // 3. Build Tx1: Fund issuer account and establish trustline on distributor
  console.log(`Submitting Tx1: Funding issuer and establishing trustline...`);
  const tx1 = new StellarSDK.TransactionBuilder(distributorAccount, {
    fee: StellarSDK.BASE_FEE,
    networkPassphrase: network === "mainnet" ? StellarSDK.Networks.PUBLIC : StellarSDK.Networks.TESTNET,
  })
    .addOperation(StellarSDK.Operation.createAccount({
      destination: issuerAddress,
      startingBalance: "3.5", // 3.5 XLM to cover reserves comfortably
    }))
    .addOperation(StellarSDK.Operation.changeTrust({
      asset,
      limit: "1.0",
    }))
    .setTimeout(30)
    .build();

  tx1.sign(distributorKeypair);
  const res1 = await server.submitTransaction(tx1);
  console.log(`Tx1 Succeeded! Hash: ${res1.hash}`);

  // 4. Load issuer account with retries to avoid Horizon indexing latency
  console.log(`Waiting 6 seconds for Horizon to index the new issuer account...`);
  await sleep(6000);

  let issuerAccount: any = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      issuerAccount = await server.loadAccount(issuerAddress);
      console.log(`Successfully loaded issuer account on attempt ${attempt}.`);
      break;
    } catch (err: any) {
      console.log(`Attempt ${attempt} to load issuer account failed. Retrying in 4 seconds...`);
      await sleep(4000);
    }
  }

  if (!issuerAccount) {
    throw new Error(`Failed to load issuer account ${issuerAddress} after 5 attempts.`);
  }

  // 5. Build Tx2: Issuer pays 1.0 of the asset to distributor and locks itself
  console.log(`Submitting Tx2: Paying 1.0 ${assetCode} and locking issuer...`);
  const tx2 = new StellarSDK.TransactionBuilder(issuerAccount, {
    fee: StellarSDK.BASE_FEE,
    networkPassphrase: network === "mainnet" ? StellarSDK.Networks.PUBLIC : StellarSDK.Networks.TESTNET,
  })
    .addOperation(StellarSDK.Operation.payment({
      destination: distributorAddress,
      asset,
      amount: "1.0",
    }))
    .addOperation(StellarSDK.Operation.setOptions({
      masterWeight: 0, // Permanently locks the issuer
      lowThreshold: 0,
      medThreshold: 0,
      highThreshold: 0,
    }))
    .setTimeout(30)
    .build();

  tx2.sign(issuerKeypair);
  const res2 = await server.submitTransaction(tx2);
  console.log(`Tx2 Succeeded! Hash: ${res2.hash}`);
  console.log(`Successfully minted and locked 1.0 ${assetCode} soulbound root asset!`);

  return {
    assetCode,
    issuer: issuerAddress,
    tx1Hash: res1.hash,
    tx2Hash: res2.hash,
  };
}

async function main() {
  const results = [];
  try {
    const legacyRes = await mintAsset("LEGACY");
    results.push(legacyRes);
  } catch (err: any) {
    console.error("Failed to mint LEGACY:", err.message || err);
  }

  try {
    const troptionsRes = await mintAsset("TROPTIONS");
    results.push(troptionsRes);
  } catch (err: any) {
    console.error("Failed to mint TROPTIONS:", err.message || err);
  }

  console.log("\n=========================================");
  console.log("FINAL SOULBOUND MINTING SUMMARY:");
  console.log("=========================================");
  console.log(JSON.stringify(results, null, 2));
  console.log("=========================================\n");
}

main().catch((err) => {
  console.error("Fatal error in main:", err);
  process.exit(1);
});
