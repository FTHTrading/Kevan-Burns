"use client";

import { usePathname } from "next/navigation";
import { NARRATION_PRESETS } from "@/lib/voice/narration";
import VoiceNarrator from "./VoiceNarrator";

// Pages where voice guide should NOT appear
const EXCLUDED_PATHS = ["/login", "/api", "/namespaces/cockpit", "/cws"];

// Page context hints for Grok narration generation on pages without static presets
const PAGE_CONTEXT: Record<string, { title: string; context: string }> = {
  "/":                    { title: "Home",                   context: "Landing page introducing Legacy Vault Protocol — the complete digital estate system for families. Features warm family focus, 5-proof release, AI document generation." },
  "/client":              { title: "Client Hub",             context: "Simple client dashboard showing vault status, completion checklist, quick actions, and family protection overview." },
  "/onboard":             { title: "Setup Wizard",           context: "7-step guided onboarding wizard helping families set up their complete Legacy Vault in 20 minutes." },
  "/vault-explained":     { title: "How Your Vault Works",   context: "Complete plain-English guide explaining the 5 protection layers, vault lifecycle, all 6 roles, and FAQ for family clients." },
  "/compare":             { title: "Why Legacy Vault",       context: "Full competitive comparison against 9 competitors: GoodTrust, HeirSafe, Everplans, Cake, and more. Legacy wins on every feature that matters." },
  "/docs-vault":          { title: "Document Intelligence",  context: "AI-powered estate document generation system with 13 templates, 6-agent Grok pipeline, XRPL anchoring, and 8-step proof record." },
  "/docs-vault/generate": { title: "Generate Document",      context: "Generate legally structured estate documents using the 6-agent Grok AI pipeline — will, trust, POA, crypto succession, and more." },
  "/docs-vault/verify":   { title: "Verify Document Hash",   context: "Public document verification — verify any document's SHA-256 hash against on-chain records and XRPL transaction." },
  "/vault":               { title: "My Vault",               context: "Owner vault dashboard showing assets, wallets, documents, executors, beneficiaries, guardians, and release policy." },
  "/vault/create":        { title: "Create Vault",           context: "Create a new encrypted estate vault — the container for all documents, wallet addresses, and asset inventory." },
  "/vault/wallets":       { title: "Wallet Registry",        context: "Register cryptocurrency wallet addresses across all chains. Public addresses only — no private keys ever." },
  "/vault/documents":     { title: "Vault Documents",        context: "Upload and manage encrypted estate documents — will, trust, POA, insurance policies, healthcare directives." },
  "/vault/assets":        { title: "Asset Inventory",        context: "Catalog all estate assets — real estate, business interests, retirement accounts, insurance, and digital assets." },
  "/vault/release-policy":{ title: "Release Policy",         context: "Configure the 5-proof release gate — guardian quorum, waiting period, attorney requirement, death certificate." },
  "/executor":            { title: "Executor Portal",        context: "Executor workflow — identity verification, release claim submission, death certificate upload, and guardian coordination." },
  "/status":              { title: "System Status",          context: "Live system health dashboard showing all services — AI, blockchain, IPFS, XRPL, Stellar, encryption, authentication." },
  "/architecture":        { title: "Architecture",           context: "Technical architecture of Legacy Vault Protocol — encryption layers, IPFS storage, blockchain registry, release engine." },
  "/video":               { title: "Video Hub",              context: "Video assets hub with AI generation prompts for Runway, Kling, and Luma for all video placements across the site." },
};

export default function GlobalVoiceBar() {
  const pathname = usePathname() || "";

  const isLegalRoute =
    pathname === "/legacy-vault" ||
    pathname.startsWith("/vault") ||
    pathname.startsWith("/executor") ||
    pathname === "/pricing" ||
    pathname === "/onboard" ||
    pathname === "/vault-explained" ||
    pathname === "/lifetime";

  if (!isLegalRoute) return null;

  // Find page context — exact or prefix match
  const clean = pathname.replace(/\/$/, "");
  const ctx   = PAGE_CONTEXT[clean] ?? PAGE_CONTEXT[pathname];

  // Static preset takes priority; fallback to Grok-generated for any page
  const preset = NARRATION_PRESETS[clean] ?? NARRATION_PRESETS[pathname];

  const title       = preset?.title ?? ctx?.title ?? "Legacy Vault Protocol";
  const pageContext = ctx?.context ?? "";

  return (
    <VoiceNarrator
      page={pathname}
      title={title}
      pageContext={pageContext}
      variant="floating"
    />
  );
}
