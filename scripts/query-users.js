const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: "onboard",
        mode: "insensitive"
      }
    }
  });
  console.log("Matching users:", JSON.stringify(users, null, 2));
  
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      did: true
    },
    take: 10
  });
  console.log("First 10 users:", JSON.stringify(allUsers, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
