const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function activate(email, namespace, tier) {
  console.log(`Activating subscription for ${email} with namespace ${namespace}...`);
  // 1. Create/find User
  let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: email.split("@")[0],
        role: "owner",
      }
    });
    console.log(`Created new User: ${email}`);
  }

  // 2. Create/update Subscription
  let sub = await prisma.subscription.findFirst({ where: { userId: user.id } });
  if (!sub) {
    sub = await prisma.subscription.create({
      data: {
        userId: user.id,
        tier,
        status: "LIFETIME",
        maxVaults: 999,
        advancedFeatures: true,
      }
    });
    console.log(`Created new Lifetime Subscription for ${email}`);
  } else {
    sub = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        tier,
        status: "LIFETIME",
        maxVaults: 999,
        advancedFeatures: true,
      }
    });
    console.log(`Updated Subscription to Lifetime for ${email}`);
  }

  // 3. Create/update NamespaceEntitlement
  let entitlement = await prisma.namespaceEntitlement.findUnique({
    where: { namespace }
  });
  if (!entitlement) {
    entitlement = await prisma.namespaceEntitlement.create({
      data: {
        userId: user.id,
        namespace,
        subscriptionId: sub.id,
        plan: tier,
        isActive: true,
      }
    });
    console.log(`Created new NamespaceEntitlement: ${namespace}`);
  } else {
    entitlement = await prisma.namespaceEntitlement.update({
      where: { id: entitlement.id },
      data: {
        userId: user.id,
        subscriptionId: sub.id,
        plan: tier,
        isActive: true,
      }
    });
    console.log(`Updated NamespaceEntitlement: ${namespace}`);
  }

  // 4. Create first Vault if not exists
  let vault = await prisma.vault.findFirst({ where: { ownerId: user.id } });
  if (!vault) {
    vault = await prisma.vault.create({
      data: {
        ownerId: user.id,
        label: `${namespace.split(".")[0]}'s Sovereign Vault`,
        description: `Primary secure vault for ${namespace}`,
        status: "ACTIVE",
      }
    });
    console.log(`Created first Vault for ${email}`);
  }
}

async function main() {
  await activate("admin@legacychain.app", "admin.legacy", "NUCLEAR");
  await activate("kevan@unykorn.org", "kevan.legacy", "NUCLEAR");
  await activate("kevan.burns@fthtrading.com", "kevanburns.legacy", "NUCLEAR");
  console.log("Seeding completed successfully!");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
