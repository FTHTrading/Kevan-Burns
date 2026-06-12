/**
 * lib/agents/mcp-registry.ts
 *
 * MCP-style agent registry for Legacy Vault Protocol.
 * Each agent is a specialized Grok/CF AI worker with defined tools and scope.
 * Orchestrated via the document pipeline and genesis-bridge x402 gateway.
 *
 * Inspired by GSP ai-mesh MCP orchestrator (genesis-sentience-protocol/ai-mesh).
 */

export type AgentCategory =
  | "vault"
  | "document"
  | "compliance"
  | "blockchain"
  | "voice"
  | "settlement"
  | "trading"
  | "macro"
  | "affiliate"
  | "gating"
  | "messaging";

export type AgentProvider = "grok" | "cloudflare" | "moltbot" | "local";

export interface AgentTool {
  name: string;
  description: string;
  x402ServiceId?: string;
  moltbotAction?: string;
}

export interface VaultAgent {
  id: string;
  name: string;
  category: AgentCategory;
  provider: AgentProvider;
  model: string;
  description: string;
  tools: AgentTool[];
  status: "active" | "standby" | "offline";
}

export const VAULT_AGENTS: VaultAgent[] = [
  {
    id: "vault-orchestrator",
    name: "Vault Orchestrator",
    category: "vault",
    provider: "grok",
    model: "grok-3-fast",
    description:
      "Routes client requests to the correct specialist agent. Manages vault lifecycle, check-ins, and release policy queries.",
    tools: [
      { name: "vault_status", description: "Get vault health and manifest summary" },
      { name: "checkin_reminder", description: "Dead man's switch check-in status" },
      { name: "release_policy_query", description: "Explain 5-proof release conditions" },
    ],
    status: "active",
  },
  {
    id: "document-extractor",
    name: "Document Extractor",
    category: "document",
    provider: "grok",
    model: "grok-3-fast",
    description:
      "Parses and normalizes estate document field inputs. Flags missing required fields before drafting.",
    tools: [
      { name: "extract_fields", description: "Normalize names, dates, addresses from form input" },
      { name: "validate_required", description: "Check template required field completeness" },
    ],
    status: "active",
  },
  {
    id: "document-drafter",
    name: "Document Drafter",
    category: "document",
    provider: "grok",
    model: "grok-3",
    description:
      "Generates full estate documents from templates: wills, trusts, POA, healthcare directives, crypto asset schedules.",
    tools: [
      {
        name: "generate_document",
        description: "Draft complete legal document from template + fields",
        x402ServiceId: "DOC_GENERATE",
        moltbotAction: "DOC_GENERATE",
      },
    ],
    status: "active",
  },
  {
    id: "compliance-reviewer",
    name: "Compliance Reviewer",
    category: "compliance",
    provider: "cloudflare",
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    description:
      "Reviews documents for ESIGN, UETA, RUFADAA, and state law compliance. Falls back to Grok for complex cases.",
    tools: [
      {
        name: "compliance_check",
        description: "Run RUFADAA and fiduciary compliance review",
        x402ServiceId: "COMPLIANCE_REPORT",
        moltbotAction: "AI_CALL",
      },
      { name: "flag_issues", description: "Return structured compliance findings" },
    ],
    status: "active",
  },
  {
    id: "document-reviewer",
    name: "Document QA Reviewer",
    category: "document",
    provider: "grok",
    model: "grok-3-fast",
    description:
      "Final QA pass: completeness, internal consistency, enforceability, execution requirements.",
    tools: [
      { name: "qa_review", description: "PASS/FAIL with explanation" },
    ],
    status: "active",
  },
  {
    id: "executor-summarizer",
    name: "Executor Summarizer",
    category: "document",
    provider: "grok",
    model: "grok-3-fast",
    description:
      "Creates plain-English executive summaries and action checklists for executors and beneficiaries.",
    tools: [
      { name: "summarize", description: "Generate executor-readable summary under 300 words" },
      { name: "action_checklist", description: "5-item post-death action list" },
    ],
    status: "active",
  },
  {
    id: "crypto-estate-agent",
    name: "Crypto Estate Agent",
    category: "blockchain",
    provider: "grok",
    model: "grok-3-fast",
    description:
      "Adds RUFADAA digital asset provisions. Handles XRPL, Stellar, EVM wallet succession language.",
    tools: [
      { name: "crypto_addendum", description: "Generate DIGITAL ASSET PROVISIONS section" },
      {
        name: "wallet_snapshot",
        description: "Cross-chain wallet inventory report",
        x402ServiceId: "WALLET_SNAPSHOT",
        moltbotAction: "DATA_PULL",
      },
    ],
    status: "active",
  },
  {
    id: "xrpl-rail-agent",
    name: "XRPL Rail Agent",
    category: "blockchain",
    provider: "local",
    model: "xrpl-adapter",
    description:
      "Anchors vault manifests and wallet references on XRPL. Generates trustline proof packets.",
    tools: [
      {
        name: "xrpl_anchor",
        description: "AccountSet + Memo anchor on XRPL",
        x402ServiceId: "XRPL_PROOF_PACKET",
        moltbotAction: "DATA_PULL",
      },
      { name: "trustline_proof", description: "Signed trustline proof packet for executors" },
    ],
    status: "active",
  },
  {
    id: "stellar-rail-agent",
    name: "Stellar Rail Agent",
    category: "blockchain",
    provider: "local",
    model: "stellar-adapter",
    description:
      "Anchors asset snapshots on Stellar. Generates memo-hash proof packets for beneficiaries.",
    tools: [
      {
        name: "stellar_anchor",
        description: "Memo.hash asset snapshot on Stellar",
        x402ServiceId: "STELLAR_PROOF_PACKET",
        moltbotAction: "DATA_PULL",
      },
    ],
    status: "active",
  },
  {
    id: "voice-guide",
    name: "Legacy Voice Guide",
    category: "voice",
    provider: "grok",
    model: "grok-3-fast",
    description:
      "Empathetic page narration for accessibility. Generates warm, family-focused scripts via Grok, rendered via Deepgram TTS.",
    tools: [
      { name: "page_narration", description: "Dynamic Grok narration for any page" },
      { name: "vault_qa", description: "Answer vault questions in plain English" },
    ],
    status: "active",
  },
  {
    id: "x402-settlement",
    name: "x402 Settlement Agent",
    category: "settlement",
    provider: "moltbot",
    model: "moltbot-gateway",
    description:
      "GSP Moltbot gateway for metered USDC payments on Polygon. Records settlements to x402 adapter for audit trail.",
    tools: [
      {
        name: "record_settlement",
        description: "Record x402 payment on Polygon adapter",
        moltbotAction: "VAULT_MANAGE",
      },
      { name: "verify_payment", description: "Verify USDC tx to treasury wallet" },
      { name: "get_pricing", description: "Fetch current x402 price table" },
    ],
    status: "standby",
  },
  {
    id: "flash-executor",
    name: "FlashExecutor",
    category: "trading",
    provider: "grok",
    model: "grok-3-fast",
    description: "Autonomous flash loan and cross-chain trade executor using FlashRouter. Risk-aware execution.",
    tools: [
      { name: "execute_flash_loan", description: "Execute flash loan trade" },
      { name: "route_cross_chain_swap", description: "Route swaps across chains" },
      { name: "check_liquidity", description: "Check pool liquidity depth" },
      { name: "validate_slippage", description: "Validate slippage limits" },
      { name: "cancel_pending_tx", description: "Cancel a pending transaction" }
    ],
    status: "active"
  },
  {
    id: "gmiie-oracle",
    name: "GMIIEOracle",
    category: "macro",
    provider: "grok",
    model: "grok-3",
    description: "Real-time macro intelligence and market regime analyst utilizing the Rings framework.",
    tools: [
      { name: "analyze_rings", description: "Analyze Ring models" },
      { name: "fetch_regime_signal", description: "Fetch regime shift signal" },
      { name: "get_market_context", description: "Retrieve market context metrics" },
      { name: "predict_volatility", description: "Predict volatility spikes" },
      { name: "generate_narrative", description: "Generate macro signal narrative report" }
    ],
    status: "active"
  },
  {
    id: "vault-guardian",
    name: "VaultGuardian",
    category: "compliance",
    provider: "grok",
    model: "grok-3-fast",
    description: "Legacy Vault security and compliance overseer. Protects user assets and enforces entitlement rules.",
    tools: [
      { name: "check_compliance", description: "Verify transaction compliance" },
      { name: "validate_transfer", description: "Validate asset transfer authorization" },
      { name: "freeze_vault", description: "Freeze vault access due to anomaly" },
      { name: "generate_audit_proof", description: "Generate cryptographic audit proof" },
      { name: "verify_entitlement", description: "Verify user vault entitlement" }
    ],
    status: "active"
  },
  {
    id: "referral-hustler",
    name: "ReferralHustler",
    category: "affiliate",
    provider: "moltbot",
    model: "moltbot-gateway",
    description: "Autonomous affiliate program manager and reward optimizer.",
    tools: [
      { name: "generate_referral_link", description: "Generate custom referral link" },
      { name: "track_conversion", description: "Track referral conversions" },
      { name: "calculate_rewards", description: "Calculate affiliate splits L1 + L2" },
      { name: "send_reward_alert", description: "Send payout alert notification" },
      { name: "rank_affiliates", description: "Rank affiliates by volume generated" }
    ],
    status: "active"
  },
  {
    id: "lit-gatekeeper",
    name: "LitGatekeeper",
    category: "gating",
    provider: "local",
    model: "lit-client",
    description: "Controls premium content access using Lit Protocol. Verifies AffiliateBadge ownership.",
    tools: [
      { name: "issue_jwt", description: "Issue Lit auth JWT" },
      { name: "check_badge_ownership", description: "Verify AffiliateBadge NFT ownership" },
      { name: "encrypt_content", description: "Encrypt premium content payload" },
      { name: "decrypt_content", description: "Decrypt premium content payload" },
      { name: "revoke_access", description: "Revoke access session" }
    ],
    status: "active"
  },
  {
    id: "chain-sentinel",
    name: "ChainSentinel",
    category: "blockchain",
    provider: "grok",
    model: "grok-3-fast",
    description: "Real-time on-chain monitoring and anomaly detection. 24/7 wallet audit.",
    tools: [
      { name: "monitor_wallet", description: "Monitor wallet activity" },
      { name: "detect_large_tx", description: "Detect large asset transfers" },
      { name: "track_liquidations", description: "Track liquidation events" },
      { name: "alert_on_anomaly", description: "Alert on on-chain anomalies" },
      { name: "scan_mev_activity", description: "Scan MEV execution blocks" }
    ],
    status: "active"
  },
  {
    id: "xmtp-messenger",
    name: "XMTPMessenger",
    category: "messaging",
    provider: "grok",
    model: "grok-3-fast",
    description: "Handles all secure wallet-to-wallet messaging.",
    tools: [
      { name: "send_secure_message", description: "Send E2EE message over XMTP" },
      { name: "broadcast_to_affiliates", description: "Broadcast message to all affiliates" },
      { name: "read_inbox", description: "Read user inbox stream" },
      { name: "schedule_message", description: "Schedule a future message" }
    ],
    status: "active"
  },
  {
    id: "treasury-pilot",
    name: "TreasuryPilot",
    category: "trading",
    provider: "moltbot",
    model: "moltbot-gateway",
    description: "Manages treasury operations and stablecoin flows.",
    tools: [
      { name: "manage_treasury", description: "Allocate stablecoin reserves" },
      { name: "route_stablecoins", description: "Route treasury stablecoin assets" },
      { name: "track_reserves", description: "Track stablecoin reserve backing" }
    ],
    status: "active"
  },
  {
    id: "risk-warden",
    name: "RiskWarden",
    category: "trading",
    provider: "grok",
    model: "grok-3-fast",
    description: "Performs real-time risk assessment on flash loan routes and cross-chain transactions.",
    tools: [
      { name: "assess_risk", description: "Calculate risk factor on execution route" },
      { name: "check_exposure", description: "Get protocol/token concentration limits" }
    ],
    status: "active"
  },
  {
    id: "badge-enforcer",
    name: "BadgeEnforcer",
    category: "gating",
    provider: "local",
    model: "lit-client",
    description: "Validates and enforces AffiliateBadge NFT properties and limits.",
    tools: [
      { name: "verify_badge_metadata", description: "Fetch and verify NFT metadata attributes" },
      { name: "check_badge_validity", description: "Verify soulbound lock on badge token" }
    ],
    status: "active"
  },
  {
    id: "deal-scout",
    name: "DealScout",
    category: "trading",
    provider: "grok",
    model: "grok-3-fast",
    description: "Scouts arbitrage opportunities across DEX pools for FlashExecutor.",
    tools: [
      { name: "scan_arbitrage", description: "Scan dex pools for price differences" },
      { name: "calculate_profit", description: "Estimate net profit after gas and fees" }
    ],
    status: "active"
  },
  {
    id: "compliance-oversight",
    name: "ComplianceOversight",
    category: "compliance",
    provider: "cloudflare",
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    description: "Monitors overall corporate compliance with estate regulations (Georgia probate, RUFADAA).",
    tools: [
      { name: "check_fiduciary_duties", description: "Verify fiduciary guidelines check" },
      { name: "generate_audit_log", description: "Export signed compliance audit data" }
    ],
    status: "active"
  },
  {
    id: "reward-distributor",
    name: "RewardDistributor",
    category: "affiliate",
    provider: "moltbot",
    model: "moltbot-gateway",
    description: "Automates multi-level affiliate commission distributions.",
    tools: [
      { name: "distribute_rewards", description: "Trigger on-chain distribution of affiliate rewards" },
      { name: "check_payout_history", description: "Get historic payout distribution log" }
    ],
    status: "active"
  },
  {
    id: "macro-pulse",
    name: "MacroPulse",
    category: "macro",
    provider: "grok",
    model: "grok-3",
    description: "Aggregates macro signals and triggers warnings for GMIIEOracle.",
    tools: [
      { name: "get_market_pulse", description: "Fetch overall market indicators" },
      { name: "alert_regime_change", description: "Trigger alert on market state transitions" }
    ],
    status: "active"
  },
  {
    id: "ops-coordinator",
    name: "OpsCoordinator",
    category: "vault",
    provider: "grok",
    model: "grok-3-fast",
    description: "Coordinates system maintenance and node health audits.",
    tools: [
      { name: "check_system_health", description: "Check overall ecosystem RPCs and nodes" },
      { name: "run_node_diagnostics", description: "Run diagnostics on self-hosted instances" }
    ],
    status: "active"
  }
];

export function getAgent(id: string): VaultAgent | undefined {
  return VAULT_AGENTS.find((a) => a.id === id);
}

export function getAgentsByCategory(cat: AgentCategory): VaultAgent[] {
  return VAULT_AGENTS.filter((a) => a.category === cat);
}

export function getActiveAgents(): VaultAgent[] {
  return VAULT_AGENTS.filter((a) => a.status === "active");
}

export function getAgentToolMap(): Record<string, VaultAgent> {
  const map: Record<string, VaultAgent> = {};
  for (const agent of VAULT_AGENTS) {
    for (const tool of agent.tools) {
      map[`${agent.id}.${tool.name}`] = agent;
    }
  }
  return map;
}
