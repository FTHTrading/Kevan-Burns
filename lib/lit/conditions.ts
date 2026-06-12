/**
 * lib/lit/conditions.ts
 * Access conditions for Affiliate Badge NFT verification.
 * Lit Protocol SDK removed from production bundle — conditions returned as plain objects
 * for use with direct on-chain RPC balance checks.
 */

export const AFFILIATE_BADGE_CONTRACT = process.env.NEXT_PUBLIC_AFFILIATE_BADGE_CONTRACT || "0x0000000000000000000000000000000000000000";
export const LIT_CHAIN = process.env.LIT_CHAIN || "base";

// Lit Protocol network constant stubs (SDK removed from bundle)
export const LIT_NETWORK = {
  NagaDev: "naga-dev",
  DatilDev: "datil-dev",
  Datil: "datil",
  Custom: "custom",
} as const;

export const getAffiliateBadgeCondition = () => [
  {
    contractAddress: AFFILIATE_BADGE_CONTRACT,
    standardContractType: "ERC721",
    chain: LIT_CHAIN,
    method: "balanceOf",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: ">=",
      value: "1",
    },
  },
];
