async function main() {
  console.log("Triggering single namespace mint...");
  const res = await fetch("http://localhost:3001/api/cws/mint-namespace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ athleteId: "ns_wvu_ag" })
  });

  const status = res.status;
  console.log("Status:", status);
  const data = await res.json();
  console.log("Response data:", JSON.stringify(data, null, 2));
}

main().catch(err => console.error(err));
