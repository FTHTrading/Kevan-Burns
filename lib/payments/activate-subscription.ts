import { prisma } from "@/lib/db";
import { PlanTier, SubscriptionStatus } from "@prisma/client";
import {
  normalizeTier,
  getTierConfig,
  getMaxVaults,
  getAdvancedFeatures,
  getHeirloomPersona,
} from "./tier-config";

/**
 * Activate subscription and create NamespaceEntitlement after successful payment.
 * Called from payment success callbacks (Stripe, onchain, etc.).
 * This is the missing piece: payment -> actual vault/namespace provisioning.
 */
export async function activateSubscriptionAfterPayment(params: {
  tier: string; // normalized via tier-config (supports FAMILY/ESTATE old + PRIVATE/HIGH_LEVEL/FUCK_YOU/NUCLEAR new)
  namespace: string; // e.g. "kevansfamily.legacy"
  userEmail?: string;
  userId?: string;
  provider: "STRIPE" | "UNITY_TOKEN" | "USDC" | "X402_METERED" | "TRIAL";
  paymentRef?: string; // session id or tx hash
  isLifetime?: boolean;
}) {
  const { tier, namespace, userEmail, userId, provider, paymentRef, isLifetime } = params;

  if (!namespace) {
    throw new Error("namespace required for entitlement");
  }

  // Find or create user
  let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user && userEmail) {
    user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: namespace.split(".")[0],
          role: "owner",
        },
      });
    }
  }
  if (!user) {
    // Fallback demo user for now
    user = await prisma.user.findFirst({ where: { email: "demo@troptionsunity.com" } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: "demo@troptionsunity.com", name: "Demo User", role: "owner" },
      });
    }
  }

  const rawTier = tier;
  let planTier = rawTier as any as PlanTier;
  if (rawTier === "LIFETIME_PRESALE") {
    planTier = "LIFETIME_LEGACY_LOCK" as PlanTier;
  }
  const status = (isLifetime || rawTier === "LIFETIME_PRESALE") ? "LIFETIME" : "ACTIVE";

  // Create or update Subscription in Prisma (main DB)
  // Note: namespace lives on NamespaceEntitlement; sub is per user (tier carries the plan)
  let sub = await prisma.subscription.findFirst({
    where: { userId: user.id },
  });

  if (!sub) {
    sub = await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: planTier,
        status: status as SubscriptionStatus,
        stripeSubscriptionId: provider === "STRIPE" ? paymentRef : undefined,
        onChainPaymentId: provider !== "STRIPE" ? paymentRef : undefined,
        maxVaults: getMaxVaults(rawTier),
        advancedFeatures: getAdvancedFeatures(rawTier),
        currentPeriodEnd: (isLifetime || rawTier === "LIFETIME_PRESALE") ? null : new Date(Date.now() + 30 * 86400_000),
      },
    });
  } else {
    sub = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: status as SubscriptionStatus,
        tier: planTier,
        maxVaults: getMaxVaults(rawTier),
        advancedFeatures: getAdvancedFeatures(rawTier),
      },
    });
  }

  // Create NamespaceEntitlement (the key link to "create their vault")
  let entitlement = await prisma.namespaceEntitlement.findUnique({
    where: { namespace },
  });

  if (!entitlement) {
    entitlement = await prisma.namespaceEntitlement.create({
      data: {
        userId: user.id,
        namespace,
        subscriptionId: sub.id,
        plan: planTier,
        isActive: true,
      },
    });
  } else {
    await prisma.namespaceEntitlement.update({
      where: { id: entitlement.id },
      data: { subscriptionId: sub.id, plan: planTier, isActive: true },
    });
  }

  // Optionally auto-create first vault for the namespace if not exists
  const existingVault = await prisma.vault.findFirst({ where: { ownerId: user.id } });
  let vault = null;
  if (!existingVault) {
    vault = await prisma.vault.create({
      data: {
        ownerId: user.id,
        label: `${namespace} Vault`,
        description: `Primary vault for ${namespace}`,
        status: "ACTIVE",
      },
    });
  }

  // Heirloom Sovereign Vault AI (high level protection in upper tiers).
  // Low tiers (FAMILY / HIGH_LEVEL): standard systems + professional "NORMAL_ADVISOR" or "STRATEGIST" persona.
  // Upper (FUCK_YOU_LEVEL / NUCLEAR): advanced Heirloom (Sovereign Defense / Immortal Executor) + secure protocols.
  // The actual kernels + intake live in heirloom/ (client-side / sovereign-per-namespace ONLY — server never sees plaintext).
  const cfg = getTierConfig(rawTier);
  const heirloomEnabled = cfg.heirloomPersona !== "NORMAL_ADVISOR" || cfg.internal !== "FAMILY"; // enabled for High+ (normal advisor still useful)
  const heirloomPersona = getHeirloomPersona(rawTier);

  return {
    userId: user.id,
    subscriptionId: sub.id,
    entitlementId: entitlement.id,
    namespace,
    vaultId: vault?.id,
    tier: planTier,
    status: "active",
    heirloom: {
      enabled: heirloomEnabled,
      persona: heirloomPersona,
      isHighLevelScaled: cfg.isHighLevelScaled,
    },
  };
}
