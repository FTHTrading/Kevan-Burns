import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const DEMO_VAULT_ID = "vault-demo-001";

export async function resolveActiveVault() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    const vault = await prisma.vault.findFirst({
      where: { ownerId: userId },
    });
    if (vault) return vault;
  }

  // Fallback to demo vault
  const demoVault = await prisma.vault.findUnique({
    where: { id: DEMO_VAULT_ID },
  });
  return demoVault;
}
