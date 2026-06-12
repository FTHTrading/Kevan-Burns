import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  
  try {
    const entitlements = await prisma.namespaceEntitlement.findMany({
      orderBy: { createdAt: "desc" }
    });
    
    console.log(`\nFound ${entitlements.length} namespace entitlement records in database:`);
    entitlements.forEach((ent, index) => {
      console.log(`${index + 1}. Namespace: ${ent.namespace} | Active: ${ent.isActive}`);
      console.log(`   IPFS CID:   ${ent.ipfsCID}`);
      console.log(`   Stellar TX: ${ent.stellarTxHash}`);
      console.log(`   XRPL TX:    ${ent.xrplTxHash}`);
      console.log(`   Solana TX:  ${ent.solanaTxHash}`);
    });
    
    const backgroundJobs = await prisma.backgroundJob.findMany({
      where: { type: "ANCHOR_NAMESPACE" },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    
    console.log(`\nLast ${backgroundJobs.length} ANCHOR_NAMESPACE background jobs:`);
    backgroundJobs.forEach((job, index) => {
      console.log(`${index + 1}. Job ID: ${job.id} | Status: ${job.status} | Retries: ${job.retries}`);
      console.log(`   Payload: ${JSON.stringify(job.payload)}`);
      console.log(`   Error:   ${job.error}`);
    });
    
  } catch (err: any) {
    console.error("Database query failed:", err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
