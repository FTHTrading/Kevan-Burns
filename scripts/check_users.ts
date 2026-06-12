import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:');
  users.forEach(u => console.log(`- ID: ${u.id} | Email: ${u.email} | Role: ${u.role}`));
  
  const entitlements = await prisma.namespaceEntitlement.findMany();
  console.log('\nTotal entitlements in DB:', entitlements.length);
  const userEnts: Record<string, number> = {};
  for (const ent of entitlements) {
    userEnts[ent.userId] = (userEnts[ent.userId] || 0) + 1;
  }
  console.log('Entitlements count per user:', userEnts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
