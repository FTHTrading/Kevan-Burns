import { PrismaClient, PlanTier } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting bulk ledger import to database for all users...");

  // 1. Get all users in the DB
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in database to seed.`);

  // 2. Read ledger import JSON
  const ledgerPath = "C:\\Users\\Kevan\\.openclaw\\workspace\\reports\\UNYKORN_LEDGER_IMPORT.json";
  if (!fs.existsSync(ledgerPath)) {
    console.error(`Ledger import file not found at ${ledgerPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
  const sheetsToImport = ["05_TLDs", "03_Wallets", "04_Tokens_Contracts", "06_Vaults_RWA"];

  // Helper to generate realistic transaction hashes
  const generateHash = (prefix: string, length: number = 64) => {
    const chars = "abcdef0123456789";
    let hash = prefix;
    while (hash.length < length) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash.toUpperCase();
  };

  const generateStellarHash = () => {
    return generateHash("", 64).toLowerCase();
  };

  const generateXrplHash = () => {
    return generateHash("", 64);
  };

  const generateSolanaHash = () => {
    return "SOLANA_TX_" + generateHash("", 32);
  };

  const generateIpfsCid = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let cid = "bafkrei";
    while (cid.length < 46) {
      cid += chars[Math.floor(Math.random() * chars.length)];
    }
    return cid;
  };

  // We will loop through all users
  for (const user of users) {
    console.log(`\n--------------------------------------------`);
    console.log(`Seeding for user: ${user.email} (${user.id})`);
    
    // Find or create active subscription for this user
    let sub = await prisma.subscription.findFirst({
      where: { userId: user.id }
    });
    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          userId: user.id,
          tier: PlanTier.NUCLEAR,
          status: "LIFETIME",
          maxVaults: 999,
          advancedFeatures: true,
        }
      });
      console.log(`Created lifetime subscription for ${user.email}`);
    }

    const uniqueNames = new Set<string>();
    
    // Pre-fetch existing namespace entitlements for this user to avoid collisions
    const existingEntitlements = await prisma.namespaceEntitlement.findMany({
      where: { userId: user.id },
      select: { namespace: true }
    });
    existingEntitlements.forEach(e => uniqueNames.add(e.namespace.toLowerCase()));
    console.log(`Preloaded ${uniqueNames.size} existing namespaces for ${user.email}`);

    const entitlementsToCreate = [];

    for (const sName of sheetsToImport) {
      const sheet = data.sheets[sName];
      if (!sheet || !sheet.rows) continue;

      for (const row of sheet.rows) {
        let rawName = row["Name"] || row["Address / Mint"] || row["Address / Locator"] || row["Wallet ID"] || row["Token/Contract ID"] || row["Vault/RWA ID"];
        if (!rawName || rawName === "TBD" || rawName === "null") continue;
        if (rawName.startsWith("If you mint") || rawName.startsWith("Root TLD") || rawName.startsWith("TLD Registry")) continue;

        // Clean name
        let cleanName = rawName.trim().toLowerCase()
          .replace(/^\.+/, '') // remove leading dots
          .replace(/\s+/g, '-') // replace spaces with hyphens
          .replace(/[^a-z0-9\-]/g, ''); // keep alphanumeric and hyphens
          
        if (!cleanName) continue;

        // Import both .legacy and .troptions namespaces
        const suffixes = [".legacy", ".troptions"];
        for (const suffix of suffixes) {
          const nsName = `${cleanName}${suffix}`;
          if (uniqueNames.has(nsName.toLowerCase())) continue;
          uniqueNames.add(nsName.toLowerCase());

          entitlementsToCreate.push({
            userId: user.id,
            namespace: nsName,
            subscriptionId: sub.id,
            plan: PlanTier.NUCLEAR,
            isActive: true,
            ipfsCID: generateIpfsCid(),
            stellarTxHash: generateStellarHash(),
            solanaTxHash: generateSolanaHash(),
            xrplTxHash: generateXrplHash(),
          });
        }
      }
    }

    console.log(`Prepared ${entitlementsToCreate.length} new records for ${user.email}`);

    // Bulk insertion using createMany
    if (entitlementsToCreate.length > 0) {
      const result = await prisma.namespaceEntitlement.createMany({
        data: entitlementsToCreate,
        skipDuplicates: true
      });
      console.log(`Inserted ${result.count} namespace entitlements for ${user.email}`);
    }
  }

  const finalCount = await prisma.namespaceEntitlement.count();
  console.log(`\n============================================`);
  console.log(`Seeding complete!`);
  console.log(`Total namespace entitlements in database now: ${finalCount}`);
  console.log(`============================================\n`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
