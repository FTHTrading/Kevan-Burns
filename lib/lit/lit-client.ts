/**
 * lib/lit/lit-client.ts
 * Stub — Lit Protocol SDK removed from production bundle (too large for Vercel lambdas).
 * The verify-affiliate route uses direct RPC NFT balance checks instead.
 */

export async function getLitClient(): Promise<null> {
  console.warn("[LitClient] Lit Protocol SDK is not bundled in production. Using fallback RPC verification.");
  return null;
}
