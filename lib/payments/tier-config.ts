/**
 * lib/payments/tier-config.ts
 *
 * Central source of truth for the 4-tier Web3 Vault system.
 * - Supports clean, professional systems (Essential + Premium Estate)
 *   with trustworthy public names, comprehensive features, and secure Heirloom personas.
 * - Advanced protection systems for upper tiers (Elite Trust / Enterprise & Family Office): more vaults,
 *   advanced policies, and secure, multi-jurisdiction triggers.
 * - Normalizes old (FAMILY/ESTATE) + new keys for transition.
 * - Used by activate, checkout, worker, x402, UI cards, vault gates, agents, docs.
 *
 * Public/official names represent premium estate planning standards.
 *
 * Georgia: All tiers include the sovereign 5-Proof + client encryption + Norcross anchor value prop.
 */

export type InternalTier = "FAMILY" | "HIGH_LEVEL" | "FUCK_YOU_LEVEL" | "NUCLEAR" | "LIFETIME_LEGACY_LOCK" | "SELF_HOSTED_SOVEREIGN" | "TRIAL" | "LIFETIME_PRESALE";

export interface TierConfig {
  internal: InternalTier;
  displayName: string;           // public / UI / marketing
  maxVaults: number;
  advancedFeatures: boolean;     // time-locks, tiered heirs, custom ZK etc.
  heirloomPersona: "NORMAL_ADVISOR" | "STRATEGIST" | "WARLORD" | "IMMORTAL";
  priceCents: number;            // monthly (or 0 for trial; lifetime handled separately)
  isTrialEligible: boolean;
  publicShortDesc: string;       // for cards / FAQ
  isHighLevelScaled: boolean;    // true for tiers where advanced Heirloom is scaled
}

const CONFIG: Record<string, TierConfig> = {
  // Essential Vault - Core security systems (accessible, professional, standard sovereign)
  FAMILY: {
    internal: "FAMILY",
    displayName: "Essential Vault",
    maxVaults: 1,
    advancedFeatures: false,
    heirloomPersona: "NORMAL_ADVISOR",
    priceCents: 2995,
    isTrialEligible: true,
    publicShortDesc: "Straightforward legacy protection for families and individuals. Client-encrypted documents, basic 5-Proof + Dead Man's Switch.",
    isHighLevelScaled: false,
  },
  // Premium Estate Vault (for complex families, trusts, and estates)
  HIGH_LEVEL: {
    internal: "HIGH_LEVEL",
    displayName: "Premium Estate Vault",
    maxVaults: 5,
    advancedFeatures: true,
    heirloomPersona: "STRATEGIST",
    priceCents: 4995,
    isTrialEligible: false,
    publicShortDesc: "Scaled for complex families, trusts, and estates. Multiple time-locks, tiered heirs, professional Heirloom Strategist AI, business docs, advanced ZK.",
    isHighLevelScaled: true,
  },
  // Elite Trust Vault (maximum cryptographic security and privacy protection)
  FUCK_YOU_LEVEL: {
    internal: "FUCK_YOU_LEVEL",
    displayName: "Elite Trust Vault",
    maxVaults: 10,
    advancedFeatures: true,
    heirloomPersona: "WARLORD",
    priceCents: 8995,
    isTrialEligible: false,
    publicShortDesc: "Advanced privacy, custom ZK quorums, secure asset protection triggers, and active Heirloom Trust Defense AI.",
    isHighLevelScaled: true,
  },
  // Enterprise & Family Office (generational 100+yr)
  NUCLEAR: {
    internal: "NUCLEAR",
    displayName: "Enterprise & Family Office",
    maxVaults: 999,
    advancedFeatures: true,
    heirloomPersona: "IMMORTAL",
    priceCents: 49900,
    isTrialEligible: false,
    publicShortDesc: "Generational planning for family offices, legal firms, and institutions. Custom quorums, dedicated SLAs, and self-hosted support.",
    isHighLevelScaled: true,
  },

  // Legacy / lifetime compat (map to closest high)
  ESTATE: {
    internal: "HIGH_LEVEL",
    displayName: "Premium Estate Vault",
    maxVaults: 5,
    advancedFeatures: true,
    heirloomPersona: "STRATEGIST",
    priceCents: 4995,
    isTrialEligible: false,
    publicShortDesc: "Premium protection for complex families and estates.",
    isHighLevelScaled: true,
  },
  LIFETIME_LEGACY_LOCK: {
    internal: "NUCLEAR",
    displayName: "Enterprise & Family Office (Lifetime)",
    maxVaults: 999,
    advancedFeatures: true,
    heirloomPersona: "IMMORTAL",
    priceCents: 129900, // one-time
    isTrialEligible: false,
    publicShortDesc: "Lifetime generational protection option.",
    isHighLevelScaled: true,
  },
  SELF_HOSTED_SOVEREIGN: {
    internal: "NUCLEAR",
    displayName: "Enterprise & Family Office (Self-Hosted)",
    maxVaults: 999,
    advancedFeatures: true,
    heirloomPersona: "IMMORTAL",
    priceCents: 499900, // lifetime one-time
    isTrialEligible: false,
    publicShortDesc: "Self-hosted sovereign 100+ year protection option.",
    isHighLevelScaled: true,
  },
  TRIAL: {
    internal: "FAMILY",
    displayName: "Essential Vault (Trial)",
    maxVaults: 1,
    advancedFeatures: false,
    heirloomPersona: "NORMAL_ADVISOR",
    priceCents: 0,
    isTrialEligible: true,
    publicShortDesc: "14-day trial of Essential Vault systems.",
    isHighLevelScaled: false,
  },
  LIFETIME_PRESALE: {
    internal: "LIFETIME_PRESALE",
    displayName: "Sovereign Lifetime Presale",
    maxVaults: 10,
    advancedFeatures: true,
    heirloomPersona: "STRATEGIST",
    priceCents: 49995,
    isTrialEligible: false,
    publicShortDesc: "Sovereign Lifetime Presale. Lifetime Premium Estate Vault access with no recurring subscription fees, plus 1,000 TROPTIONS tokens.",
    isHighLevelScaled: true,
  },
};

export function normalizeTier(input: string | null | undefined): InternalTier {
  if (!input) return "FAMILY";
  const key = input.toString().trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (key === "PRIVATE" || key === "PRIVATE_VAULT" || key === "FAMILY" || key === "STANDARD" || key === "ESSENTIAL" || key === "ESSENTIAL_VAULT") return "FAMILY";
  if (key === "HIGH_LEVEL" || key === "HIGHLEVEL" || key === "PREMIUM" || key === "ESTATE" || key === "PREMIUM_ESTATE" || key === "PREMIUM_ESTATE_VAULT") return "HIGH_LEVEL";
  if (key === "FUCK_YOU" || key === "FUCK_YOU_LEVEL" || key === "ULTIMATE" || key === "SOVEREIGN" || key === "SOVEREIGN_ELITE" || key === "SOVEREIGN_ELITE_VAULT" || key === "ELITE_TRUST" || key === "ELITE_TRUST_VAULT") return "FUCK_YOU_LEVEL";
  if (key === "NUCLEAR" || key === "FUCK_EM_ALL" || key === "DYNASTY" || key === "GENERATIONAL" || key === "SOVEREIGN_DYNASTY" || key === "SOVEREIGN_DYNASTY_VAULT" || key === "ENTERPRISE" || key === "FAMILY_OFFICE") return "NUCLEAR";
  if (key === "LIFETIME_PRESALE" || key === "PRESALE" || key === "LIFETIME_PRESALE_VAULT" || key === "SOVEREIGN_LIFETIME_PRESALE") return "LIFETIME_PRESALE";
  if (key === "LIFETIME" || key === "LIFETIME_LEGACY_LOCK") return "LIFETIME_LEGACY_LOCK";
  if (key === "SELF_HOSTED" || key === "SELF_HOSTED_SOVEREIGN") return "SELF_HOSTED_SOVEREIGN";
  if (key === "TRIAL") return "TRIAL";
  return "FAMILY";
}

export function getTierConfig(tier: string | InternalTier): TierConfig {
  const key = normalizeTier(tier);
  return CONFIG[key] || CONFIG.FAMILY;
}

export function getDisplayName(tier: string | InternalTier): string {
  return getTierConfig(tier).displayName;
}

export function isHighLevelScaled(tier: string | InternalTier): boolean {
  return getTierConfig(tier).isHighLevelScaled;
}

export function getHeirloomPersona(tier: string | InternalTier): TierConfig["heirloomPersona"] {
  return getTierConfig(tier).heirloomPersona;
}

export function getMaxVaults(tier: string | InternalTier): number {
  return getTierConfig(tier).maxVaults;
}

export function getAdvancedFeatures(tier: string | InternalTier): boolean {
  return getTierConfig(tier).advancedFeatures;
}

export function getPriceCents(tier: string | InternalTier): number {
  return getTierConfig(tier).priceCents;
}

export function isTrialEligible(tier: string | InternalTier): boolean {
  return getTierConfig(tier).isTrialEligible;
}

// For checkout / worker price maps (recurring monthly unless lifetime)
export function getStripePriceData(tier: string | InternalTier) {
  const cfg = getTierConfig(tier);
  const isLifetime = tier.toString().toUpperCase().includes("LIFETIME") || tier.toString().toUpperCase().includes("SELF_HOSTED");
  return {
    amount: cfg.priceCents,
    recurring: isLifetime ? undefined : { interval: "month" as const },
    name: `Troptions Unity ${cfg.displayName}`,
  };
}

// Public list for UI / docs (in display order)
export const ALL_PUBLIC_TIERS: InternalTier[] = ["FAMILY", "HIGH_LEVEL", "FUCK_YOU_LEVEL", "NUCLEAR"];

export default {
  normalizeTier,
  getTierConfig,
  getDisplayName,
  isHighLevelScaled,
  getHeirloomPersona,
  getMaxVaults,
  getAdvancedFeatures,
  getPriceCents,
  isTrialEligible,
  getStripePriceData,
  ALL_PUBLIC_TIERS,
};