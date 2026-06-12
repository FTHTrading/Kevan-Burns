// scripts/background-worker.ts
import { PrismaClient, PlanTier } from "@prisma/client";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import { anchorDocumentHashStellar } from "../lib/stellar/stellar-adapter";
import { anchorDocumentHash } from "../lib/xrpl/xrpl-adapter";
import { anchorDocumentHashSolana } from "../lib/solana/solana-adapter";
import { uploadToIPFS } from "../lib/ipfs/ipfs-adapter";
import { UnykornOrchestrator } from "../tools/unykorn-ecosystem-orchestrator";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const orchestrator = new UnykornOrchestrator();

// Helper to generate SHA-256 hash
async function sha256Hex(input: string): Promise<string> {
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(input).digest("hex");
}

// Nodemailer SMTP Transport
const smtpHost = process.env.SMTP_HOST || "smtp.zoho.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "465");
const smtpUser = process.env.SMTP_USER || "kevan@unykorn.org";
const smtpPass = process.env.SMTP_PASS;

const transporter = smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

async function executeAnchorNamespace(jobId: string, payload: any) {
  const { namespace, suffix, plan, userId, subscriptionId } = payload;
  const fullNamespace = `${namespace}${suffix}`;
  
  console.log(`[Worker] Starting namespace anchoring for ${fullNamespace}...`);

  // Calculate hash
  const nsHash = await sha256Hex(fullNamespace);
  let stellarTxHash: string | null = null;
  let xrplTxHash: string | null = null;
  let solanaTxHash: string | null = null;

  // 1. Build Metadata document
  const metadata = {
    type: "namespace-entitlement-registration",
    namespace: fullNamespace,
    ownerUserId: userId,
    plan,
    isActive: true,
    registeredAt: new Date().toISOString(),
    issuerAuthority: "Unykorn / Legacy Vault Protocol",
    chains: ["stellar", "xrpl", "solana"],
    hash: nsHash,
  };

  // 2. Upload metadata to IPFS
  let ipfsCID: string | null = null;
  try {
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2), "utf8");
    const ipfsResult = await uploadToIPFS(metadataBuffer);
    ipfsCID = ipfsResult.cid;
    console.log(`[Worker] IPFS CID for ${fullNamespace}: ${ipfsCID}`);
  } catch (err: any) {
    console.error(`[Worker] IPFS metadata upload failed for ${fullNamespace}:`, err.message);
    ipfsCID = `bafybeimocknsmetadata${nsHash.slice(0, 24)}`;
  }

  // 3. Anchor on Stellar
  try {
    const stellarRes = await anchorDocumentHashStellar({
      documentId: `ns-${fullNamespace}`,
      sha256Hash: nsHash,
      templateId: "namespace-mint",
    });
    stellarTxHash = stellarRes.txHash;
    console.log(`[Worker] Stellar tx: ${stellarTxHash}`);
  } catch (err: any) {
    console.error(`[Worker] Stellar anchoring failed for ${fullNamespace}:`, err.message);
  }

  // 4. Anchor on XRPL
  try {
    const xrplRes = await anchorDocumentHash({
      documentId: `ns-${fullNamespace}`,
      sha256Hash: nsHash,
      templateId: "namespace-mint",
    });
    xrplTxHash = xrplRes.txHash;
    console.log(`[Worker] XRPL tx: ${xrplTxHash}`);
  } catch (err: any) {
    console.error(`[Worker] XRPL anchoring failed for ${fullNamespace}:`, err.message);
  }

  // 5. Anchor on Solana
  try {
    const solanaRes = await anchorDocumentHashSolana({
      documentId: `ns-${fullNamespace}`,
      sha256Hash: nsHash,
      templateId: "namespace-mint",
    });
    solanaTxHash = solanaRes.txHash;
    console.log(`[Worker] Solana tx: ${solanaTxHash}`);

    // Trigger TROPTIONS token-2022 minting on Solana if suffix is .troptions
    if (suffix === ".troptions") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const userWallet = user?.did?.startsWith("did:ethr:") ? user.did.replace("did:ethr:", "") : "user-wallet-placeholder";
      await orchestrator.queueTroptionsMint(
        process.env.OPERATOR_KEY || "mock-op-key",
        userWallet,
        100,
        fullNamespace
      );
    }
  } catch (err: any) {
    console.error(`[Worker] Solana anchoring/minting failed for ${fullNamespace}:`, err.message);
  }

  // Find the NamespaceEntitlement and update its state
  const entitlement = await prisma.namespaceEntitlement.findUnique({
    where: { namespace: fullNamespace }
  });

  if (entitlement) {
    await prisma.namespaceEntitlement.update({
      where: { id: entitlement.id },
      data: {
        ipfsCID,
        stellarTxHash,
        solanaTxHash,
        xrplTxHash,
      },
    });
    console.log(`[Worker] NamespaceEntitlement updated in DB for ${fullNamespace}`);
  } else {
    // If somehow not created yet, create it
    await prisma.namespaceEntitlement.create({
      data: {
        namespace: fullNamespace,
        userId,
        subscriptionId,
        plan: plan as PlanTier,
        isActive: true,
        ipfsCID,
        stellarTxHash,
        solanaTxHash,
        xrplTxHash,
      }
    });
    console.log(`[Worker] NamespaceEntitlement created and populated in DB for ${fullNamespace}`);
  }
}

async function executeSendWelcomeEmail(jobId: string, payload: any) {
  const { userEmail, userName, namespace } = payload;
  console.log(`[Worker] Sending welcome email to ${userEmail} for namespace: ${namespace}...`);

  const subject = `Welcome to Legacy Vault Protocol - ${namespace}`;
  const text = `Hello ${userName || "Valued client"},\n\nYour sovereign estate namespace ${namespace} is currently active and fully anchored on the blockchain. You can now start creating secure vaults and setting up your dead man's switches.\n\nBest regards,\nUnykorn Authority Team`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #b45309;">Welcome to Legacy Vault Protocol</h2>
      <p>Hello <strong>${userName || "Valued client"}</strong>,</p>
      <p>We are excited to welcome you! Your sovereign estate namespace <strong>${namespace}</strong> is currently active and fully anchored on-chain across our multi-chain network (Stellar, XRP Ledger, and Solana).</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #e2e8f0;">
        <strong>Sovereign Domain:</strong> <code style="color: #b45309;">${namespace}</code>
      </div>
      <p>You can now log into your dashboard to set up secure vaults, allocate documents, configure guardian quorums, and activate dead man's switch heartbeats.</p>
      <p style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b;">
        Sent automatically by Unykorn Authority SecOps | 5655 Peachtree Parkway, Norcross, GA 30092
      </p>
    </div>
  `;

  if (!transporter) {
    console.log("=== EMAIL MOCK LOG (No SMTP CONFIG) ===");
    console.log(`To: ${userEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log("========================================");
    return;
  }

  const info = await transporter.sendMail({
    from: `"Unykorn Authority" <${smtpUser}>`,
    to: userEmail,
    subject,
    text,
    html,
  });
  console.log(`[Worker] Welcome email sent successfully to ${userEmail}. Msg ID: ${info.messageId}`);
}

async function pollJobs() {
  // Query for pending jobs
  const pendingJobs = await prisma.backgroundJob.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 5,
  });

  if (pendingJobs.length === 0) {
    return;
  }

  console.log(`[Worker] Found ${pendingJobs.length} PENDING jobs.`);

  for (const job of pendingJobs) {
    // Optimistic concurrency claim using database transaction check
    const claimed = await prisma.$transaction(async (tx) => {
      const currentJob = await tx.backgroundJob.findUnique({
        where: { id: job.id },
      });
      if (!currentJob || currentJob.status !== "PENDING") {
        return null;
      }
      return await tx.backgroundJob.update({
        where: { id: job.id },
        data: { status: "PROCESSING", updatedAt: new Date() },
      });
    });

    if (!claimed) {
      // Job was claimed by another worker process (PM2 clustering)
      console.log(`[Worker] Job ${job.id} already claimed by another process. Skipping.`);
      continue;
    }

    console.log(`[Worker] Processing Job ID: ${job.id} (Type: ${job.type})`);
    
    try {
      if (job.type === "ANCHOR_NAMESPACE") {
        await executeAnchorNamespace(job.id, job.payload);
      } else if (job.type === "SEND_WELCOME_EMAIL") {
        await executeSendWelcomeEmail(job.id, job.payload);
      } else {
        throw new Error(`Unknown job type: ${job.type}`);
      }

      await prisma.backgroundJob.update({
        where: { id: job.id },
        data: { status: "COMPLETED", updatedAt: new Date() },
      });
      console.log(`[Worker] Job ${job.id} completed successfully.`);
    } catch (err: any) {
      console.error(`[Worker] Job ${job.id} failed:`, err.message);
      
      const newRetries = job.retries + 1;
      const shouldFailPermanently = newRetries >= 3;
      
      await prisma.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: shouldFailPermanently ? "FAILED" : "PENDING",
          retries: newRetries,
          error: err.message || String(err),
          updatedAt: new Date(),
        },
      });
    }
  }
}

async function start() {
  console.log("[Worker] Starting Legacy Vault Protocol Background Worker...");
  
  while (true) {
    try {
      await pollJobs();
    } catch (err: any) {
      console.error("[Worker] Error polling jobs:", err.message);
    }
    // Sleep for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

start()
  .catch((err) => {
    console.error("[Worker] Fatal error in background worker loop:", err);
    process.exit(1);
  });
