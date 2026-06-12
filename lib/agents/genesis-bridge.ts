/**
 * lib/agents/genesis-bridge.ts
 *
 * Bridge to Genesis Sentience Protocol (GSP) infrastructure:
 *   - Moltbot x402 payment gateway (DOC_GENERATE, VAULT_MANAGE, AI_CALL)
 *   - GSP API worker (investment stats, civilization metrics)
 *   - Polygon mainnet settlement adapter
 *
 * Repo: genesis-sentience-protocol
 * Live: drunks.app | Moltbot port 3402
 */

export interface MoltbotHealth {
  live: boolean;
  status: string;
  daemon?: string;
  version?: string;
  uptime?: number;
  network?: string;
  latencyMs: number;
  gatewayUrl: string;
}

export interface MoltbotPricing {
  payTo: string;
  disallowedPayTo: string;
  network: string;
  usdc: string;
  pricing: Record<string, { usdcAtomic: number; usdDisplay: string }>;
}

export interface GSPStats {
  live: boolean;
  latencyMs: number;
  apiUrl: string;
  data?: Record<string, unknown>;
}

export interface GenesisBridgeStatus {
  configured: boolean;
  moltbot: MoltbotHealth;
  gspApi: GSPStats;
  x402Adapter: string;
  chain: string;
}

const DEFAULT_MOLTBOT_URL = "http://localhost:3402";
const DEFAULT_GSP_API_URL = "https://gsp-api.kevanbtc.workers.dev";

export function getGenesisConfig() {
  return {
    moltbotUrl: process.env.MOLTBOT_GATEWAY_URL || DEFAULT_MOLTBOT_URL,
    gspApiUrl: process.env.GSP_API_URL || DEFAULT_GSP_API_URL,
    x402Adapter:
      process.env.GSP_X402_ADAPTER ||
      "0x1AAf4b0B0F2898e15E6f427011cA968Ec9E4D8D8",
    gspDashboard: process.env.GSP_DASHBOARD_URL || "https://drunks.app",
    gspRepoPath:
      process.env.GSP_REPO_PATH ||
      "C:\\Users\\Kevan\\OneDrive - FTH Trading\\07-Genesis-SGE\\genesis-sentience-protocol",
  };
}

/** Ping Moltbot gateway health endpoint */
export async function checkMoltbotHealth(): Promise<MoltbotHealth> {
  const { moltbotUrl } = getGenesisConfig();
  const start = Date.now();

  if (!process.env.MOLTBOT_GATEWAY_URL && process.env.NODE_ENV === "production") {
    return {
      live: false,
      status: "not_configured",
      latencyMs: 0,
      gatewayUrl: moltbotUrl,
    };
  }

  try {
    const res = await fetch(`${moltbotUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = res.ok ? await res.json() : null;
    return {
      live: res.ok,
      status: data?.status || (res.ok ? "operational" : "error"),
      daemon: data?.daemon,
      version: data?.version,
      uptime: data?.uptime,
      network: data?.network,
      latencyMs: Date.now() - start,
      gatewayUrl: moltbotUrl,
    };
  } catch {
    return {
      live: false,
      status: process.env.MOLTBOT_GATEWAY_URL ? "unreachable" : "local_dev",
      latencyMs: Date.now() - start,
      gatewayUrl: moltbotUrl,
    };
  }
}

/** Fetch Moltbot x402 pricing table */
export async function getMoltbotPricing(): Promise<MoltbotPricing | null> {
  const { moltbotUrl } = getGenesisConfig();
  try {
    const res = await fetch(`${moltbotUrl}/api/pricing`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Ping GSP API worker stats endpoint */
export async function checkGSPApi(): Promise<GSPStats> {
  const { gspApiUrl } = getGenesisConfig();
  const start = Date.now();

  try {
    const res = await fetch(`${gspApiUrl}/api/stats`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = res.ok ? await res.json() : undefined;
    return {
      live: res.ok,
      latencyMs: Date.now() - start,
      apiUrl: gspApiUrl,
      data,
    };
  } catch {
    return {
      live: false,
      latencyMs: Date.now() - start,
      apiUrl: gspApiUrl,
    };
  }
}

/** Full bridge status for system dashboard */
export async function getGenesisBridgeStatus(): Promise<GenesisBridgeStatus> {
  const config = getGenesisConfig();
  const [moltbot, gspApi] = await Promise.all([
    checkMoltbotHealth(),
    checkGSPApi(),
  ]);

  return {
    configured: !!(process.env.MOLTBOT_GATEWAY_URL || process.env.GSP_API_URL),
    moltbot,
    gspApi,
    x402Adapter: config.x402Adapter,
    chain: "Polygon Mainnet (137)",
  };
}

/** Map Legacy Vault service IDs to Moltbot action types */
export const LEGACY_TO_MOLTBOT_ACTION: Record<string, string> = {
  DOC_GENERATE: "DOC_GENERATE",
  COMPLIANCE_REPORT: "AI_CALL",
  NOTARIZATION_REQUEST: "PERMIT_FILE",
  VAULT_MANAGE: "VAULT_MANAGE",
  API_METERED_CALL: "AI_CALL",
  CROSS_CHAIN_SNAPSHOT: "DATA_PULL",
  XRPL_PROOF_PACKET: "DATA_PULL",
  STELLAR_PROOF_PACKET: "DATA_PULL",
};

export interface MoltbotServiceRequest {
  action: string;
  paymentTx: string;
  params?: Record<string, unknown>;
}

export interface MoltbotServiceResponse {
  success: boolean;
  result?: unknown;
  error?: string;
  settlementTx?: string;
}

/**
 * Call Moltbot gateway for a metered x402 service.
 * Requires a verified USDC payment tx hash on Polygon.
 */
export async function callMoltbotService(
  req: MoltbotServiceRequest
): Promise<MoltbotServiceResponse> {
  const { moltbotUrl } = getGenesisConfig();

  try {
    const res = await fetch(`${moltbotUrl}/api/service`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(30000),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || `HTTP ${res.status}` };
    }
    return { success: true, result: data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Moltbot request failed",
    };
  }
}
