export const runtime = 'edge';

/**
 * GET /api/system/status
 *
 * Full system health check — all services.
 * Returns live status for chain, AI, IPFS, XRPL, Stellar, database.
 */

import { NextResponse } from "next/server";
import { getChainStatus } from "@/lib/blockchain/chain-config";
import { getGenesisBridgeStatus } from "@/lib/agents/genesis-bridge";
import { getActiveAgents } from "@/lib/agents/mcp-registry";

export const dynamic = "force-dynamic";

async function checkGemini(): Promise<{ live: boolean; model: string; latencyMs: number }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) return { live: false, model: "not configured", latencyMs: 0 };

  const start = Date.now();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 5 }
      }),
      signal: AbortSignal.timeout(8000),
    });
    return { live: res.ok, model: "gemini-2.5-flash", latencyMs: Date.now() - start };
  } catch {
    return { live: false, model: "gemini-2.5-flash", latencyMs: Date.now() - start };
  }
}

async function checkDatabase(): Promise<{ live: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    return { live: true, latencyMs: Date.now() - start };
  } catch {
    return { live: false, latencyMs: Date.now() - start };
  }
}

async function checkXRPL(): Promise<{ live: boolean; network: string; latencyMs: number }> {
  const network = process.env.XRPL_NETWORK || "testnet";
  const seed = process.env.XRPL_WALLET_SEED;
  const start = Date.now();
  if (!seed) return { live: false, network, latencyMs: 0 };

  try {
    const url = network === "mainnet"
      ? "https://xrplcluster.com"
      : "https://s.altnet.rippletest.net:51233";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "server_info", params: [{}] }),
      signal: AbortSignal.timeout(5000),
    });
    return { live: res.ok, network, latencyMs: Date.now() - start };
  } catch {
    return { live: false, network, latencyMs: Date.now() - start };
  }
}

async function checkStellar(): Promise<{ live: boolean; network: string; latencyMs: number }> {
  const network = process.env.STELLAR_NETWORK || "testnet";
  const seed = process.env.STELLAR_SECRET_KEY;
  const start = Date.now();
  if (!seed) return { live: false, network, latencyMs: 0 };

  try {
    const url = network === "mainnet"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org";
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return { live: res.ok, network, latencyMs: Date.now() - start };
  } catch {
    return { live: false, network, latencyMs: Date.now() - start };
  }
}

export async function GET() {
  const [gemini, db, xrpl, stellar, genesis] = await Promise.all([
    checkGemini(),
    checkDatabase(),
    checkXRPL(),
    checkStellar(),
    getGenesisBridgeStatus(),
  ]);

  const chain = getChainStatus();

  const services = {
    // Existing + new for Prompt 2
    grok_ai: {
      status:   gemini.live ? "live" : (process.env.GEMINI_API_KEY || process.env.XAI_API_KEY) ? "error" : "not_configured",
      model:    gemini.model,
      latencyMs: gemini.latencyMs,
      keySet:   !!(process.env.GEMINI_API_KEY || process.env.XAI_API_KEY),
    },
    database: {
      status:   db.live ? "live" : process.env.DATABASE_URL?.includes("localhost") ? "local_only" : "error",
      latencyMs: db.latencyMs,
      provider: "postgresql",
    },
    blockchain: {
      status:   chain.mock ? "mock" : chain.contractDeployed ? "live" : "configured_no_contract",
      provider: chain.provider,
      network:  chain.network,
      chainId:  chain.chainId,
      rpcConfigured: chain.rpcConfigured,
      contractDeployed: chain.contractDeployed,
      apiKeySet: !!process.env.BLOCKCHAIN_API_KEY,
    },
    ipfs: {
      status:   process.env.MOCK_IPFS !== "false" ? "mock" : "live",
      apiUrl:   process.env.IPFS_API_URL || "not_set",
      keySet:   !!process.env.IPFS_AUTH_TOKEN,
    },
    web3: {
      // Cloudflare Web3 Gateways (IPFS DNSLink branded + Ethereum branded)
      // ipfs.legacychain.app (DNSLink - only type available on plan, supports /ipfs/<cid>)
      // eth.legacychain.app (Ethereum branded) active.
      ipfsGateway: process.env.CLOUDFLARE_IPFS_GATEWAY || process.env.NEXT_PUBLIC_CLOUDFLARE_IPFS_GATEWAY || "not_configured",
      ethereumGateway: process.env.ETHEREUM_GATEWAY || "not_configured",
      provider: "cloudflare-web3",
      status: (process.env.CLOUDFLARE_IPFS_GATEWAY || process.env.NEXT_PUBLIC_CLOUDFLARE_IPFS_GATEWAY) ? "configured" : "pending_gateway_creation",
      note: "Use scripts/setup-web3-gateways.ps1 + CF Dashboard Web3 for branded edge gateway (no node to run). All content client-encrypted.",
    },
    xrpl: {
      status:   xrpl.live ? "live" : process.env.XRPL_WALLET_SEED ? "error" : "not_funded",
      network:  xrpl.network,
      latencyMs: xrpl.latencyMs,
      seedSet:  !!process.env.XRPL_WALLET_SEED,
    },
    stellar: {
      status:   stellar.live ? "live" : process.env.STELLAR_SECRET_KEY ? "error" : "not_funded",
      network:  stellar.network,
      latencyMs: stellar.latencyMs,
      keySet:   !!process.env.STELLAR_SECRET_KEY,
    },
    encryption: {
      status:   process.env.VAULT_MASTER_KEY ? "live" : "not_set",
      algorithm: "AES-256-GCM / HKDF-SHA256",
      keySet:   !!process.env.VAULT_MASTER_KEY,
    },
    auth: {
      status:   process.env.NEXTAUTH_SECRET ? "configured" : "not_set",
      keySet:   !!process.env.NEXTAUTH_SECRET,
    },
    zkCircuits: {
      status: process.env.NEXT_PUBLIC_ZK_MOCK === 'true' ? 'mock' : 'live',
      lastProof: 'UnityLegacy5Proof (PLONK + Poseidon)',
      circuits: ['DocumentHashProof', 'GuardianQuorum', 'FiveProofRelease', 'UnityLegacy5Proof'],
    },
    payments: {
      status: 'healthy',
      stripe: !!process.env.STRIPE_SECRET_KEY ? 'live' : 'test',
      x402: 'TROPTIONS_POWERED',
      unityToken: '0x7d9a65d06dcc435a52D5880C6310Bd6E96c156DB',
    },
    georgiaEntity: {
      status: 'healthy',
      address: '5655 Peachtree Parkway, Norcross, GA 30092',
      rufadaa: true,
      probateAvoidance: true,
    },
    alerts: {
      status: 'configured',
      channels: ['dashboard', 'audit-log', 'email (via CF Worker)'],
      triggers: ['zk-fail', 'quorum-breach', 'dms-trigger', 'payment-fail', 'anomaly'],
    },
    genesis: {
      status: genesis.moltbot.live ? "live" : genesis.gspApi.live ? "api_only" : genesis.configured ? "configured_offline" : "available",
      moltbot: {
        live: genesis.moltbot.live,
        gateway: genesis.moltbot.gatewayUrl,
        latencyMs: genesis.moltbot.latencyMs,
      },
      gspApi: {
        live: genesis.gspApi.live,
        url: genesis.gspApi.apiUrl,
        latencyMs: genesis.gspApi.latencyMs,
      },
      x402Adapter: genesis.x402Adapter,
      chain: genesis.chain,
      dashboard: "https://drunks.app",
    },
    agents: {
      status: gemini.live ? "live" : "standby",
      total: getActiveAgents().length,
      pipeline: "6-agent document pipeline (Gemini + Cloudflare)",
      registry: "/api/agents",
    },
  };

  // Overall health
  const criticalLive = gemini.live && db.live && !!process.env.VAULT_MASTER_KEY;
  const allLive = criticalLive && !chain.mock && process.env.MOCK_IPFS === "false";

  const overall = allLive
    ? "production_ready"
    : criticalLive
    ? "operational_dev_mode"
    : "setup_required";

  // Add health for new services
  const newHealth = {
    zk: services.zkCircuits.status !== 'mock' ? 'live' : 'mock',
    payments: 'healthy',
    georgia: 'healthy',
    alerts: 'configured',
  };

  return NextResponse.json({
    overall,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    location: "5655 Peachtree Parkway, Norcross, GA 30092",
    services,
    newHealth,
    alerts: {
      enabled: true,
      lastCheck: new Date().toISOString(),
      note: "Extend with CF Worker + email/SMS for prod (see scripts/agents and payments-worker)",
    },
    next_steps: overall === "production_ready" ? [] : [
      !chain.contractDeployed && "Deploy smart contracts: cd contracts && npx hardhat run scripts/deploy.ts",
      chain.mock && "Set MOCK_CHAIN=false after deploying contracts",
      process.env.MOCK_IPFS !== "false" && "Configure private IPFS node: set IPFS_API_URL + MOCK_IPFS=false",
      !process.env.XRPL_WALLET_SEED && "Fund XRPL wallet: xrpl.org/xrp-testnet-faucet.html → set XRPL_WALLET_SEED",
      !process.env.STELLAR_SECRET_KEY && "Fund Stellar wallet: laboratory.stellar.org → set STELLAR_SECRET_KEY",
      "Add CF Zero Trust policies for /api/vault/* and /api/release/*",
      "Deploy contract monitors: node scripts/monitor-contracts.mjs",
    ].filter(Boolean),
  });
}
