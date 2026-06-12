const { spawn } = require("child_process");
const http = require("http");

function sendRequest(options, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 3002,
        path: "/api/gated/insight",
        method: "GET",
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: JSON.parse(data),
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              body: data,
            });
          }
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

function runServerAndTest() {
  return new Promise((resolve, reject) => {
    console.log("\nStarting Next.js dev server on port 3002...");
    const serverProcess = spawn("npx.cmd", ["next", "dev", "-p", "3002"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5433/legacy_vault",
      },
      shell: true,
    });

    let requestSent = false;
    const triggerRequest = async () => {
      if (requestSent) return;
      requestSent = true;
      console.log("Next.js dev server ready signal received. Executing gating compliance tests...");

      try {
        // Test 1: Hitting route without token (Should block with 403)
        console.log("\n[Test 1] Hitting route without token (Expecting 403 block)...");
        const res1 = await sendRequest();
        console.log(`Response Status: ${res1.statusCode}`);
        console.log(`Response Body:`, JSON.stringify(res1.body));
        if (res1.statusCode !== 403) {
          throw new Error(`Expected status code 403, got ${res1.statusCode}`);
        }
        console.log("✓ Test 1 Passed: Unauthorized request blocked correctly!");

        // Test 2: Hitting route with invalid token (Should block with 403)
        console.log("\n[Test 2] Hitting route with invalid token (Expecting 403 block)...");
        const res2 = await sendRequest({}, { "x-lit-jwt": "invalid-token-payload" });
        console.log(`Response Status: ${res2.statusCode}`);
        console.log(`Response Body:`, JSON.stringify(res2.body));
        if (res2.statusCode !== 403) {
          throw new Error(`Expected status code 403, got ${res2.statusCode}`);
        }
        console.log("✓ Test 2 Passed: Invalid signature blocked correctly!");

        // Test 3: Hitting route with valid mock token (Should return 200 and gated payload)
        console.log("\n[Test 3] Hitting route with valid mock Lit JWT (Expecting 200 success)...");
        const res3 = await sendRequest({}, { "x-lit-jwt": "mock-lit-jwt-token-active-affiliate" });
        console.log(`Response Status: ${res3.statusCode}`);
        console.log(`Response Body:`, JSON.stringify(res3.body, null, 2));
        if (res3.statusCode !== 200) {
          throw new Error(`Expected status code 200, got ${res3.statusCode}`);
        }
        if (!res3.body.success || !res3.body.alerts || res3.body.alerts.length === 0) {
          throw new Error("Gated insight response format was invalid or missing alerts");
        }
        console.log("✓ Test 3 Passed: Valid Lit JWT session authorized and content returned!");

        resolve(serverProcess);
      } catch (err) {
        reject(err);
      }
    };

    serverProcess.stdout.on("data", (data) => {
      const output = data.toString();
      if (output.includes("Ready in") || output.includes("Local:")) {
        triggerRequest();
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("[Next.js Stderr]:", data.toString());
    });

    serverProcess.on("error", (err) => {
      reject(err);
    });

    // Timeout fallback
    setTimeout(() => {
      if (!requestSent) {
        console.log("Timeout waiting for server stdout. Launching test sequence...");
        triggerRequest();
      }
    }, 10000);
  });
}

async function run() {
  let serverProcess = null;
  try {
    serverProcess = await runServerAndTest();
    console.log("\nStopping Next.js dev server...");
    serverProcess.kill("SIGTERM");
    console.log("ALL GATING ROUTE TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("\nGATING COMPLIANCE TEST RUN FAILED:", err.message);
    if (serverProcess) {
      console.log("Killing Next.js dev server...");
      serverProcess.kill("SIGTERM");
    }
    process.exit(1);
  }
}

run();
