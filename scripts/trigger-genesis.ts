async function main() {
  console.log("Triggering CWS On-Chain Genesis Batch Mint (this might take a minute as it loops all 26 athletes and 9 relics)...");
  
  const startTime = Date.now();
  const res = await fetch("http://localhost:3001/api/cws/genesis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-genesis-key": "d2e62fe1d7ed8dc0467ea56fe0bda0bbd1685c21d356bb85ec382326a89f807e"
    }
  });

  const duration = (Date.now() - startTime) / 1000;
  console.log(`Finished in ${duration.toFixed(2)}s`);
  console.log("Status:", res.status);
  
  const data = await res.json();
  console.log("Response summary:");
  if (data.summary) {
    console.log(`Total Minted: ${data.summary.totalMinted}`);
    console.log(`Total Failed: ${data.summary.totalFailed}`);
    console.log(`Duration: ${data.summary.durationMs}ms`);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
  
  // Write the full result to a log file for review
  const fs = await import("fs");
  const path = await import("path");
  const logPath = path.resolve(process.cwd(), "cws-genesis-mint-log.json");
  fs.writeFileSync(logPath, JSON.stringify(data, null, 2));
  console.log(`Full log written to ${logPath}`);
}

main().catch(err => console.error(err));
