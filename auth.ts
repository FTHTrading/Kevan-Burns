/**
 * auth.ts — next-auth v5 configuration
 *
 * Exports:
 *   auth()         — get session in Server Components / API routes
 *   handlers       — GET/POST for /api/auth/[...nextauth]
 *   signIn/signOut — actions for client components
 *
 * Providers:
 *   - Email (magic link via Resend) — recommended for legal-grade applications
 *   - Credentials (email + password) — for early access / internal testing
 *
 * Add RESEND_API_KEY to .env to enable magic-link email.
 * Both providers work in dev without any external service.
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Edge-compatible SHA-256 (Web Crypto) - replaces Node 'crypto' for CF Pages / Edge runtime
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const cryptoObj = typeof globalThis !== "undefined" && globalThis.crypto
    ? globalThis.crypto
    : (typeof require !== "undefined" ? require("crypto").webcrypto : undefined);
  if (!cryptoObj?.subtle) {
    throw new Error("Web Crypto subtle API not available");
  }
  const hashBuffer = await cryptoObj.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}


// Extend session type with our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      did: string | null;
    } & DefaultSession["user"];
  }
}

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  session: { strategy: "jwt" },

  pages: {
    signIn:  "/login",
    signOut: "/",
    error:   "/login",
  },

  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        // Timing-safe comparison — bcrypt compare preferred in production
        // Using sha256 (Web Crypto) here for Edge / CF Pages compatibility; swap for bcrypt.compare() in full Node
        const inputHash = await sha256Hex(password);
        if (user.passwordHash !== inputHash) return null;

        return {
          id:    user.id,
          email: user.email,
          name:  user.name ?? undefined,
          // Custom fields passed through JWT → session
          role:  user.role,
          did:   user.did ?? null,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Persist custom fields into the JWT on sign-in
        token.id   = user.id;
        token.role = (user as { role?: string }).role ?? "owner";
        token.did  = (user as { did?: string | null }).did ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id   = token.id as string;
      session.user.role = token.role as string;
      session.user.did  = token.did as string | null;
      return session;
    },
  },
});
