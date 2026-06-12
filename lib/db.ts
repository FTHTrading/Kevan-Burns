/**
 * lib/db.ts — shared Prisma client singleton
 */

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prismaClient: PrismaClient;

// Detect if we are running in Cloudflare Workers / Edge Runtime
const isEdge = process.env.NEXT_RUNTIME === "edge" || typeof (globalThis as any).EdgeRuntime !== "undefined";

if (isEdge) {
  // Use Neon serverless adapter over WebSockets
  neonConfig.webSocketConstructor = WebSocket;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  prismaClient = new PrismaClient({ adapter });
} else {
  // Use standard PrismaClient with native TCP connection (useful for local Node.js seeds/migrations)
  prismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;

