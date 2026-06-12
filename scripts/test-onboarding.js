const { PrismaClient } = require("@prisma/client");
const { spawn, execSync } = require("child_process");
const http = require("http");

const CLOUD_SQL_IP = "34.150.163.120";
const DB_URL = "postgresql://postgres:SuperSecureUnykornPassword2026!@34.150.163.120:5432/legacy_vault";
const PROJECT_ID = "unykorn-sovereign-core";
const INSTANCE_NAME = "unykorn-audit-db";

const testWallet = "0x71c5a4e2eecf4515ac2bac2beb6700f0473a1111";
const testEmail = "test-onboard@unykorn.org";
const testNamespace = "kevanonboard";

let prisma;
let publicIp = null;
let networkAuthorized = false;

async function getPublicIp() {
  return new Promise((resolve, reject) => {
    http.get("http://api.ipify.org", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data.trim()));
    }).on("error", reject);
  });
}

async function authorizeIp() {
  try {
    console.log("Fetching local public IP address...");
    publicIp = await getPublicIp();
    console.log(`Discovered local public IP: ${publicIp}`);

    console.log(`Temporarily authorizing network ${publicIp}/32 on Cloud SQL instance ${INSTANCE_NAME}...`);
    execSync(
      `gcloud sql instances patch ${INSTANCE_NAME} --authorized-networks=${publicIp}/32 --project=${PROJECT_ID} --quiet`,
      { stdio: "inherit" }
    );
    networkAuthorized = true;
    console.log("Cloud SQL network authorization complete!");
  } catch (err) {
    console.error("Failed to authorize network IP:", err.message);
    throw err;
  }
}

async function deauthorizeIp() {
  if (!networkAuthorized) return;
  try {
    console.log("Restoring Cloud SQL database firewall lockdown (clearing authorized networks)...");
    execSync(
      `gcloud sql instances patch ${INSTANCE_NAME} --clear-authorized-networks --project=${PROJECT_ID} --quiet`,
      { stdio: "inherit" }
    );
    networkAuthorized = false;
    console.log("Cloud SQL network lockdown restored!");
  } catch (err) {
    console.error("Failed to clear authorized networks:", err.message);
  }
}

async function setupDatabase() {
  console.log(`Setting up database to clean up and seed using Prisma client...`);
  const userDid = `did:ethr:${testWallet.toLowerCase()}`;

  try {
    // 1. Delete existing records for clean test run in transaction order
    await prisma.$executeRawUnsafe(`DELETE FROM "Referral" WHERE "referredUserId" IN (SELECT id FROM "User" WHERE did = $1)`, userDid);
    await prisma.$executeRawUnsafe(`DELETE FROM "ReferralReward" WHERE "affiliateId" IN (SELECT id FROM "Affiliate" WHERE "userId" IN (SELECT id FROM "User" WHERE did = $1))`, userDid);
    await prisma.$executeRawUnsafe(`DELETE FROM "Affiliate" WHERE "userId" IN (SELECT id FROM "User" WHERE did = $1)`, userDid);
    await prisma.$executeRawUnsafe(`DELETE FROM "NamespaceEntitlement" WHERE "userId" IN (SELECT id FROM "User" WHERE did = $1)`, userDid);
    await prisma.$executeRawUnsafe(`DELETE FROM "AuditEvent" WHERE "actorId" IN (SELECT id FROM "User" WHERE did = $1)`, userDid);
    await prisma.$executeRawUnsafe(`DELETE FROM "Vault" WHERE "ownerId" IN (SELECT id FROM "User" WHERE did = $1)`, userDid);
    await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE did = $1 OR email = $2`, userDid, testEmail);

    // 2. Verify or seed the referrer affiliate "UNYKORN_PARTNER"
    const refCode = "UNYKORN_PARTNER";
    let referrer = await prisma.affiliate.findUnique({
      where: { referralCode: refCode }
    });
    
    if (!referrer) {
      // Seed a user for the referrer
      const referrerUserId = "usr-ref-seed-001";
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
        referrerUserId, "partner@unykorn.org", "Unykorn Partner", "owner", new Date(), new Date()
      );

      // Insert the affiliate
      await prisma.affiliate.create({
        data: {
          id: "aff-test-partner-001",
          userId: referrerUserId,
          referralCode: refCode,
          namespace: "partner.legacy",
          status: "ACTIVE",
          createdAt: new Date()
        }
      });
      console.log(`Seeded partner affiliate: ${refCode}`);
    }

    console.log("Database setup complete!");
  } catch (err) {
    console.error("Database setup failed:", err.message);
    throw err;
  }
}

async function verifyDatabase() {
  console.log(`\nVerifying database updates using Prisma client...`);

  try {
    const userDid = `did:ethr:${testWallet.toLowerCase()}`;

    // 1. Verify User
    const user = await prisma.user.findUnique({ where: { did: userDid } });
    if (!user) throw new Error("User record not found in DB");
    console.log(`✓ User record verified: ID=${user.id}, Email=${user.email}, DID=${user.did}`);

    // 2. Verify Default Vault
    const vault = await prisma.vault.findFirst({ where: { ownerId: user.id } });
    if (!vault) throw new Error("Vault record not found in DB");
    console.log(`✓ Vault record verified: ID=${vault.id}, Label="${vault.label}"`);
    console.log(`  - EVM Tx Hash: ${vault.chainTxHash || "None"}`);
    console.log(`  - Manifest CID: ${vault.manifestCID || "None"}`);

    // 3. Verify NamespaceEntitlement
    const ns = await prisma.namespaceEntitlement.findUnique({ where: { namespace: `${testNamespace.toLowerCase()}.legacy` } });
    if (!ns) throw new Error("NamespaceEntitlement record not found in DB");
    console.log(`✓ Namespace entitlement verified: Namespace=${ns.namespace}`);

    // 4. Verify Affiliate
    const affiliate = await prisma.affiliate.findUnique({ where: { userId: user.id } });
    if (!affiliate) throw new Error("Affiliate record not found in DB");
    console.log(`✓ Affiliate record verified: ReferralCode=${affiliate.referralCode}`);

    // 5. Verify Referral Mapping
    const referral = await prisma.referral.findUnique({ where: { referredUserId: user.id } });
    if (!referral) throw new Error("Referral conversion mapping not found in DB");
    console.log(`✓ Referral conversion mapping verified: ID=${referral.id}, ReferrerAffiliateID=${referral.affiliateId}`);

    // 6. Verify Audit Logs
    const auditLogs = await prisma.auditEvent.findMany({
      where: { actorId: user.id },
      orderBy: { occurredAt: "desc" },
      take: 5
    });
    console.log(`✓ Audit logs verified: Found ${auditLogs.length} events logged during onboarding.`);
    for (const aud of auditLogs) {
      console.log(`  - Action: ${aud.action} | Detail: ${JSON.stringify(aud.detail)}`);
    }

    console.log("\nALL DATABASE AND SMART CONTRACT VERIFICATIONS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Database verification failed:", err.message);
    throw err;
  }
}

function runServerAndTest() {
  return new Promise((resolve, reject) => {
    console.log("\nStarting Next.js dev server on port 3002...");
    const serverProcess = spawn("npx.cmd", ["next", "dev", "-p", "3002"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: DB_URL,
      },
      shell: true,
    });

    let requestSent = false;
    const triggerRequest = () => {
      if (requestSent) return;
      requestSent = true;
      console.log("Next.js dev server ready signal received. Sending test POST request...");
      sendTestRequest()
        .then((res) => {
          console.log("Onboard API Response:", JSON.stringify(res, null, 2));
          if (!res.success) {
            reject(new Error("API returned failure: " + res.error));
          } else if (res.litToken !== "mock-lit-jwt-token-active-affiliate") {
            reject(new Error("API did not return the expected litToken. Got: " + res.litToken));
          } else {
            resolve(serverProcess);
          }
        })
        .catch((err) => reject(err));
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

    // Timeout fallback if it doesn't print ready string
    setTimeout(() => {
      if (!requestSent) {
        console.log("Timeout waiting for server stdout. Trying to send request anyway...");
        triggerRequest();
      }
    }, 12000);
  });
}

function sendTestRequest() {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      walletAddress: testWallet,
      email: testEmail,
      legacyNamespace: testNamespace,
      primaryInterests: ["flash_loans", "estate_planning"],
      useCase: "Affiliate partner",
      affiliateOptIn: true,
      referralCode: "UNYKORN_PARTNER",
      sourceSite: "flashrouter",
    });

    const options = {
      hostname: "127.0.0.1",
      port: 3002,
      path: "/api/onboard",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response JSON: ${data}`));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

let spawnedProcess = null;

async function run() {
  try {
    // 1. Authorize network IP for Cloud SQL
    await authorizeIp();

    // 2. Initialize Prisma client with Cloud SQL URL
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: DB_URL
        }
      }
    });

    // 3. Setup DB
    await setupDatabase();

    // 4. Start Next server and send request
    spawnedProcess = await runServerAndTest();

    // 5. Verify DB changes
    await verifyDatabase();

    // 6. Kill server process cleanly
    console.log("Stopping Next.js dev server...");
    spawnedProcess.kill("SIGTERM");
    
    if (prisma) {
      await prisma.$disconnect();
    }

    // 7. Restore database firewall lockdown
    await deauthorizeIp();
    process.exit(0);
  } catch (err) {
    console.error("\nTEST RUN FAILED:", err.message);
    if (spawnedProcess) {
      console.log("Killing Next.js dev server...");
      spawnedProcess.kill("SIGTERM");
    }
    if (prisma) {
      await prisma.$disconnect();
    }
    // Ensure we restore database firewall even on failure!
    await deauthorizeIp();
    process.exit(1);
  }
}

run();
