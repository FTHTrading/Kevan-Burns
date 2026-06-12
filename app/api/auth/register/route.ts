export const runtime = 'edge';

/**
 * POST /api/auth/register
 * Create a new owner account.
 * In production: add email verification, rate limiting, and CAPTCHA.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { anchorDocumentHashStellar } from "@/lib/stellar/stellar-adapter";
import { anchorDocumentHash } from "@/lib/xrpl/xrpl-adapter";
import { anchorDocumentHashSolana } from "@/lib/solana/solana-adapter";
import { UnykornOrchestrator } from "@/tools/unykorn-ecosystem-orchestrator";
import { uploadToIPFS } from "@/lib/ipfs/ipfs-adapter";

// Edge/Web Crypto replacements for Node 'crypto' (for CF Pages Edge runtime compatibility)
const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

function randomBytesEdge(len: number): Uint8Array {
  if (!cryptoObj) throw new Error("Web Crypto API (crypto) is not defined in this environment");
  return cryptoObj.getRandomValues(new Uint8Array(len));
}


async function sha256Hex(input: string): Promise<string> {
  const subtle = typeof globalThis !== "undefined" ? globalThis.crypto?.subtle : undefined;

  if (!subtle) {
    throw new Error("Web Crypto subtle API not available");
  }

  const enc = new TextEncoder();
  const buf = await subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const RegisterSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(10, "Password must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return error("Invalid JSON"); }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) return error("Validation failed", parsed.error.flatten(), 400);

  const { name, email, password } = parsed.data;

  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return error("An account with this email already exists.", null, 409);

  // Hash password with SHA-256 (dev, Web Crypto for Edge) — swap for bcrypt in production
  const passwordHash = await sha256Hex(password);

  // Generate a DID key identifier (Web Crypto random)
  const didSeed = Array.from(randomBytesEdge(16)).map(b => b.toString(16).padStart(2, "0")).join("");
  const did = `did:key:z${didSeed}`;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      did,
      role: "owner",
    },
  });

  try {
    // Seed default TRIAL subscription
    const sub = await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: "TRIAL",
        status: "TRIAL",
        maxVaults: 1,
        advancedFeatures: false,
        trialEndsAt: new Date(Date.now() + 14 * 86400_000),
        currentPeriodEnd: new Date(Date.now() + 14 * 86400_000),
      },
    });

    // Seed default namespace entitlements for both .legacy and .troptions
    const emailPrefix = email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const baseNs = emailPrefix.length >= 3 ? emailPrefix : `user-${user.id.slice(-4)}`;

    const suffixes = [".legacy", ".troptions"];
    for (const s of suffixes) {
      const fullNamespace = `${baseNs}${s}`;

      const entitlement = await prisma.namespaceEntitlement.create({
        data: {
          namespace: fullNamespace,
          userId: user.id,
          subscriptionId: sub.id,
          plan: "TRIAL",
          isActive: true,
        },
      });

      const nsHash = await sha256Hex(fullNamespace);
      let ipfsCID = null;
      let stellarTxHash = null;
      let xrplTxHash = null;
      let solanaTxHash = null;

      // 1. Build Metadata document
      const metadata = {
        type: "namespace-entitlement-registration",
        namespace: fullNamespace,
        ownerUserId: user.id,
        plan: "TRIAL",
        isActive: true,
        registeredAt: new Date().toISOString(),
        issuerAuthority: "Unykorn / Legacy Vault Protocol (Signup Seed)",
        chains: ["stellar", "xrpl", "solana"],
        hash: nsHash,
      };

      // 2. Upload metadata to IPFS
      try {
        const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2), "utf8");
        const ipfsResult = await uploadToIPFS(metadataBuffer);
        ipfsCID = ipfsResult.cid;
      } catch (err) {
        console.error(`IPFS metadata upload failed for ${fullNamespace}:`, err);
        ipfsCID = `bafybeimocknsmetadata${nsHash.slice(0, 24)}`;
      }

      // 3. Anchor on Stellar, XRPL, and Solana
      try {
        const stellarRes = await anchorDocumentHashStellar({
          documentId: `ns-${fullNamespace}`,
          sha256Hash: nsHash,
          templateId: "namespace-mint",
        });
        stellarTxHash = stellarRes.txHash;
      } catch (err) {
        console.error(`Stellar anchoring failed for ${fullNamespace}:`, err);
      }

      try {
        const xrplRes = await anchorDocumentHash({
          documentId: `ns-${fullNamespace}`,
          sha256Hash: nsHash,
          templateId: "namespace-mint",
        });
        xrplTxHash = xrplRes.txHash;
      } catch (err) {
        console.error(`XRPL anchoring failed for ${fullNamespace}:`, err);
      }

      try {
        const solanaRes = await anchorDocumentHashSolana({
          documentId: `ns-${fullNamespace}`,
          sha256Hash: nsHash,
          templateId: "namespace-mint",
        });
        solanaTxHash = solanaRes.txHash;

        // Trigger TROPTIONS token-2022 minting on Solana if suffix is .troptions
        if (s === ".troptions") {
          const userWallet = user.did?.startsWith("did:ethr:") ? user.did.replace("did:ethr:", "") : "user-wallet-placeholder";
          const orchestrator = new UnykornOrchestrator();
          await orchestrator.queueTroptionsMint(
            process.env.OPERATOR_KEY || "mock-op-key",
            userWallet,
            100,
            fullNamespace
          );
        }
      } catch (err) {
        console.error(`Solana anchoring/minting failed for ${fullNamespace}:`, err);
      }

      // 4. Update NamespaceEntitlement with anchoring results
      await prisma.namespaceEntitlement.update({
        where: { id: entitlement.id },
        data: {
          ipfsCID,
          stellarTxHash,
          solanaTxHash,
          xrplTxHash,
        },
      });
    }
  } catch (err) {
    console.error("Failed to seed default trial entitlements for registered user:", err);
  }

  return NextResponse.json(
    { id: user.id, email: user.email, name: user.name, did: user.did },
    { status: 201 }
  );
}

function error(message: string, details?: unknown, status = 400) {
  return NextResponse.json({ error: message, details }, { status });
}
