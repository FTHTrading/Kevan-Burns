const StellarSDK = require('@stellar/stellar-sdk');
require('dotenv').config(); // Load if available

const secretKey = "SDTSEPCVBFU2EDBSLYTMC7FLFR52Z6J6E5INHB35MDN3WIHUX5W67OQG";
const server = new StellarSDK.Horizon.Server("https://horizon.stellar.org");
const keypair = StellarSDK.Keypair.fromSecret(secretKey);

async function run() {
  try {
    const account = await server.loadAccount(keypair.publicKey());
    const tx = new StellarSDK.TransactionBuilder(account, {
      fee: "10000", // 0.001 XLM fee to be safe
      networkPassphrase: StellarSDK.Networks.PUBLIC,
    })
      .addOperation(StellarSDK.Operation.payment({
        destination: keypair.publicKey(),
        asset: StellarSDK.Asset.native(),
        amount: "0.00001", // higher amount
      }))
      .addMemo(StellarSDK.Memo.hash(Buffer.alloc(32)))
      .setTimeout(30)
      .build();

    tx.sign(keypair);
    const response = await server.submitTransaction(tx);
    console.log("Success:", response.hash);
  } catch (err) {
    if (err.response && err.response.data) {
      console.error("Error data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error:", err);
    }
  }
}

run();
