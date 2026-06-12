/**
 * lib/partners/registry.ts
 *
 * Legacy Vault Protocol — Partner and Affiliate Registry
 *
 * Partners are displayed on /partners and tracked via /go/[slug] redirects.
 * Every click through /go/[slug] is logged to the audit system for attribution.
 *
 * Revenue model options (configure per partner):
 *   "affiliate"   — earn commission on referred sales (negotiate with partner)
 *   "reciprocal"  — mutual link exchange, no cash
 *   "sponsor"     — partner pays for featured placement
 *   "integration" — deep technical integration, revenue share
 */

export type PartnerType = "affiliate" | "reciprocal" | "sponsor" | "integration";

export type PartnerCategory =
  | "death-care"
  | "estate-planning"
  | "crypto-custody"
  | "legal"
  | "insurance"
  | "blockchain"
  | "document-services";

export interface Partner {
  slug:        string;
  name:        string;
  tagline:     string;
  description: string;
  url:         string;
  logo?:       string;         // /images/partners/[slug].png
  category:    PartnerCategory;
  type:        PartnerType;
  featured:    boolean;
  active:      boolean;

  // Affiliate config
  affiliateUrl?:     string;   // URL with ref param: https://partner.com?ref=legacyvault
  commissionRate?:   string;   // e.g. "10% per sale"
  cookieDays?:       number;   // Attribution window

  // How we connect
  integration?:      string;   // Short description of the integration
  ourBenefit:        string;   // What LVP users get
  theirBenefit?:     string;   // What their users get from us
}

export const PARTNERS: Partner[] = [
  {
    slug:         "eternalchain",
    name:         "EternalChain",
    tagline:      "Death Care on Web3",
    description:  "The first platform to tokenize cemetery property on XRPL, Stellar, and EVM. AI-powered fraud protection, smart escrow, and the first regulated secondary market for memorial real estate. Patent-pending protocol built to protect families from the fraud and confusion that devastates estates.",
    url:          "https://eternalchain.pages.dev",
    category:     "death-care",
    type:         "integration",
    featured:     true,
    active:       true,
    affiliateUrl: "https://eternalchain.pages.dev?utm_source=legacyvault&utm_medium=ecosystem&utm_campaign=referral",
    ourBenefit:   "Protect your physical memorial property with blockchain-verified ownership and smart escrow — the natural complement to your Legacy Vault digital estate plan.",
    theirBenefit: "Protect the digital estate behind every property transfer — wallets, legal documents, crypto assets, and succession instructions.",
    integration:  "Both platforms run on XRPL + Stellar rails with shared beneficiary routing, on-chain audit trails, and a LegacyVault smart contract on the EVM sidechain. Cemetery property tokens register directly in the Legacy Vault wallet registry.",
    cookieDays:   90,
  },

  // Placeholder slots — ready to fill when you sign partners
  {
    slug:         "troptions",
    name:         "TROPTIONS",
    tagline:      "Protocol Fabric · Settlement Rails",
    description:  "TROPTIONS is the protocol ecosystem powering Legacy Vault Protocol — namespace fabric, x402 metered services, XRPL/Stellar asset rails, and Rust-based settlement infrastructure.",
    url:          "https://troptions.com",
    category:     "blockchain",
    type:         "integration",
    featured:     true,
    active:       true,
    ourBenefit:   "The entire Legacy Vault Protocol runs on TROPTIONS infrastructure.",
    integration:  "TROPTIONS provides namespace registry, x402 service metering, wallet coordination layer, and TSN Rust settlement scaffold.",
  },

  {
    slug:         "genesis",
    name:         "Genesis Sentience Protocol",
    tagline:      "AI-Native Layer-0 · x402 Settlement",
    description:  "Sovereign AI-native civilization engine with 15 agent identities, epoch-based governance, and Moltbot x402 payment gateway on Polygon. Provides metered DOC_GENERATE, VAULT_MANAGE, and AI_CALL services with on-chain audit receipts.",
    url:          "https://drunks.app",
    category:     "blockchain",
    type:         "integration",
    featured:     true,
    active:       true,
    affiliateUrl: "https://drunks.app?utm_source=legacyvault&utm_medium=ecosystem&utm_campaign=genesis",
    ourBenefit:   "Metered x402 agent services, Polygon settlement adapter, and civilization-grade audit trails for every vault operation.",
    theirBenefit: "Estate vault clients get sovereign document generation, compliance review, and cross-chain proof packets through the Legacy Vault agent pipeline.",
    integration:  "Moltbot gateway (port 3402) handles USDC x402 payments. GSP MCP orchestrator routes policy proposals. Shared Polygon contracts: x402 adapter 0x1AAf...D8D8, PatronVault, AgentIdentity NFTs.",
    cookieDays:   90,
  },
];

export function getPartner(slug: string): Partner | undefined {
  return PARTNERS.find((p) => p.slug === slug && p.active);
}

export function getFeaturedPartners(): Partner[] {
  return PARTNERS.filter((p) => p.featured && p.active);
}

export function getPartnersByCategory(cat: PartnerCategory): Partner[] {
  return PARTNERS.filter((p) => p.category === cat && p.active);
}
