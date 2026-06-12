export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { PlanTier, SubscriptionStatus } from "@prisma/client";
import { normalizeTier, getMaxVaults, getAdvancedFeatures } from "@/lib/payments/tier-config";
import { anchorDocumentHashStellar } from "@/lib/stellar/stellar-adapter";
import { anchorDocumentHash } from "@/lib/xrpl/xrpl-adapter";
import { anchorDocumentHashSolana } from "@/lib/solana/solana-adapter";
import { UnykornOrchestrator } from "@/tools/unykorn-ecosystem-orchestrator";
import { uploadToIPFS } from "@/lib/ipfs/ipfs-adapter";

// Helper function to generate SHA-256 hex
async function sha256Hex(input: string): Promise<string> {
  const subtle = typeof globalThis !== "undefined" ? globalThis.crypto?.subtle : undefined;

  if (!subtle) {
    throw new Error("Web Crypto subtle API not available");
  }

  const buf = new TextEncoder().encode(input);
  const hash = await subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    let userId = session?.user?.id ?? req.headers.get("x-user-id");
    
    if (!userId) {
      // Fallback/ensure demo-user-id user exists so register doesn't block demo flow
      let demoUser = await prisma.user.findUnique({ where: { id: "demo-user-id" } });
      if (!demoUser) {
        demoUser = await prisma.user.create({
          data: {
            id: "demo-user-id",
            email: "demo@legacychain.app",
            name: "Demo User",
            did: "did:key:zdemo",
            role: "owner",
          },
        });
      }
      userId = "demo-user-id";
    }

    const body = await req.json();
    const { namespace, suffix, plan, description } = body;

    if (!namespace) {
      return NextResponse.json({ error: "Namespace label is required" }, { status: 400 });
    }

    const cleanLabel = namespace.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (cleanLabel.length < 3) {
      return NextResponse.json({ error: "Namespace label must be at least 3 characters" }, { status: 400 });
    }

    // Resolve plan details
    const rawTier = plan ? normalizeTier(plan) : "TRIAL";
    let planTier = rawTier as any as PlanTier;
    if (rawTier === "LIFETIME_PRESALE") {
      planTier = "LIFETIME_LEGACY_LOCK" as PlanTier;
    }
    const isTrial = planTier === PlanTier.TRIAL || planTier === PlanTier.FAMILY;
    const subStatus = isTrial ? SubscriptionStatus.TRIAL : SubscriptionStatus.PAST_DUE;
    const maxVaults = getMaxVaults(rawTier);
    const advancedFeatures = getAdvancedFeatures(rawTier);

    // Get or create subscription
    let sub = await prisma.subscription.findFirst({
      where: { userId },
    });

    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          userId,
          tier: planTier,
          status: subStatus,
          maxVaults,
          advancedFeatures,
          trialEndsAt: isTrial ? new Date(Date.now() + 14 * 86400_000) : null,
          currentPeriodEnd: isTrial ? new Date(Date.now() + 14 * 86400_000) : new Date(Date.now() + 30 * 86400_000),
        },
      });
    } else {
      sub = await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          tier: planTier,
          status: sub.status === SubscriptionStatus.TRIAL ? subStatus : sub.status,
          maxVaults,
          advancedFeatures,
        },
      });
    }

    // Crucial: Mint BOTH .troptions and .legacy namespaces on all chains as requested by the user:
    // "we proably need the .troptions and .legacy minted on all the chains we have funded to give them a option if they want"
    const suffixes = [".legacy", ".troptions"];
    const results = [];

    // Get user email & name for welcome email job
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userEmail = user?.email || "kevan@unykorn.org";
    const userName = user?.name || "Client";

    for (const s of suffixes) {
      const fullNamespace = `${cleanLabel}${s}`;

      // Insert/upsert NamespaceEntitlement in the database (initially with null tx hashes/cids)
      const entitlement = await prisma.namespaceEntitlement.upsert({
        where: { namespace: fullNamespace },
        update: {
          userId,
          subscriptionId: sub.id,
          plan: planTier,
          isActive: true,
        },
        create: {
          namespace: fullNamespace,
          userId,
          subscriptionId: sub.id,
          plan: planTier,
          isActive: true,
        },
      });

      // 1. Create a background job to handle the heavy on-chain anchoring & IPFS uploads
      await prisma.backgroundJob.create({
        data: {
          type: "ANCHOR_NAMESPACE",
          status: "PENDING",
          payload: {
            namespace: cleanLabel,
            suffix: s,
            plan: planTier,
            userId,
            subscriptionId: sub.id
          }
        }
      });

      // 2. Create a background job to send the personalized welcome email
      await prisma.backgroundJob.create({
        data: {
          type: "SEND_WELCOME_EMAIL",
          status: "PENDING",
          payload: {
            userEmail,
            userName,
            namespace: fullNamespace
          }
        }
      });

      results.push({
        namespace: fullNamespace,
        entitlementId: entitlement.id,
        ipfsCID: null,
        stellarTxHash: null,
        xrplTxHash: null,
        solanaTxHash: null,
      });
    }

    return NextResponse.json({
      success: true,
      subscriptionId: sub.id,
      mintedNamespaces: results,
    });
  } catch (error: any) {
    console.error("Namespace registration API failed:", error);
    return NextResponse.json({ error: error.message || "Failed to register namespace" }, { status: 500 });
  }
}
