/**
 * lib/blockchain/chain-config.ts
 *
 * Smart chain configuration for Legacy Vault Protocol.
 *
 * Detects the RPC provider from BLOCKCHAIN_API_KEY + CHAIN_RPC_URL,
 * builds the correct endpoint, and exposes a single `getChainConfig()`
 * function used by the registry adapter and all chain connectors.
 *
 * Supported providers (auto-detected):
 *  - Alchemy      → https://[network].g.alchemy.com/v2/{key}
 *  - QuickNode    → set CHAIN_RPC_URL manually (QuickNode URLs include the key)
 *  - Chainstack   → https://nd-xxx.p2pify.com/{key}
 *  - GetBlock     → https://go.getblock.io/{key}
 *  - Infura       → https://[network].infura.io/v3/{key}
 *  - Private node → CHAIN_RPC_URL used directly (default)
 *
 * Provider hint via CHAIN_PROVIDER env var:
 *   alchemy | chainstack | getblock | infura | quicknode | private
 */

export type ChainProvider =
  | "alchemy"
  | "chainstack"
  | "getblock"
  | "infura"
  | "quicknode"
  | "private"
  | "mock";

export type ChainNetwork =
  | "mainnet"
  | "sepolia"
  | "polygon"
  | "polygon-mumbai"
  | "base"
  | "base-sepolia"
  | "arbitrum"
  | "optimism"
  | "private";

export interface ChainConfig {
  rpcUrl:       string;
  chainId:      number;
  network:      ChainNetwork;
  provider:     ChainProvider;
  contractAddress: string;
  isMock:       boolean;
  wsUrl?:       string;
}

// Network chain IDs
const CHAIN_IDS: Record<ChainNetwork, number> = {
  mainnet:        1,
  sepolia:        11155111,
  polygon:        137,
  "polygon-mumbai": 80001,
  base:           8453,
  "base-sepolia": 84532,
  arbitrum:       42161,
  optimism:       10,
  private:        1337,
};

/**
 * Build the RPC URL for a given provider + API key + network.
 */
function buildRpcUrl(
  provider: ChainProvider,
  apiKey: string,
  network: ChainNetwork
): string {
  const net = network === "private" ? "mainnet" : network;

  switch (provider) {
    case "alchemy":
      return `https://eth-${net}.g.alchemy.com/v2/${apiKey}`;
    case "chainstack":
      // Chainstack: user must set CHAIN_RPC_URL directly (includes node ID)
      return process.env.CHAIN_RPC_URL || `https://nd-xxx.p2pify.com/${apiKey}`;
    case "getblock":
      return `https://go.getblock.io/${apiKey}`;
    case "infura":
      return `https://${net}.infura.io/v3/${apiKey}`;
    case "quicknode":
      // QuickNode embeds the key in the endpoint — must be set in CHAIN_RPC_URL
      return process.env.CHAIN_RPC_URL || "";
    default:
      return process.env.CHAIN_RPC_URL || "http://localhost:8545";
  }
}

/**
 * Detect the provider from the API key format or CHAIN_PROVIDER hint.
 */
function detectProvider(apiKey: string): ChainProvider {
  const hint = (process.env.CHAIN_PROVIDER || "").toLowerCase();

  if (hint === "alchemy")    return "alchemy";
  if (hint === "chainstack") return "chainstack";
  if (hint === "getblock")   return "getblock";
  if (hint === "infura")     return "infura";
  if (hint === "quicknode")  return "quicknode";
  if (hint === "private")    return "private";

  // Auto-detect from key format
  if (!apiKey || apiKey === "") return "mock";

  // UUID format (32 hex + 4 dashes) → likely Chainstack, GetBlock, or custom
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiKey);
  if (isUUID) return "chainstack"; // Most UUID-format keys are Chainstack

  // Alchemy keys are typically 32 alphanumeric chars
  if (/^[A-Za-z0-9_-]{20,40}$/.test(apiKey) && !isUUID) return "alchemy";

  return "private";
}

let _cachedConfig: ChainConfig | null = null;

/**
 * Get the chain configuration. Cached after first call.
 */
export function getChainConfig(): ChainConfig {
  if (_cachedConfig) return _cachedConfig;

  const isMock = process.env.MOCK_CHAIN !== "false";

  if (isMock) {
    _cachedConfig = {
      rpcUrl:          "mock://localhost",
      chainId:         31337,
      network:         "private",
      provider:        "mock",
      contractAddress: "0x0000000000000000000000000000000000000000",
      isMock:          true,
    };
    return _cachedConfig;
  }

  const apiKey   = process.env.BLOCKCHAIN_API_KEY || "";
  const network  = (process.env.CHAIN_NETWORK || "private") as ChainNetwork;
  const provider = detectProvider(apiKey);
  const chainId  = parseInt(process.env.CHAIN_ID || String(CHAIN_IDS[network] || 1337));

  let rpcUrl = buildRpcUrl(provider, apiKey, network);

  // If CHAIN_RPC_URL is explicitly set (and not the localhost default), use it
  const explicitRpc = process.env.CHAIN_RPC_URL;
  if (explicitRpc && explicitRpc !== "http://localhost:8545") {
    rpcUrl = explicitRpc;
  }

  // Prefer Cloudflare Ethereum Web3 Gateway (now subscribed) for eth mainnet/sepolia
  // This bypasses API keys, uses the branded eth.legacychain.app
  const ethGateway = process.env.ETHEREUM_GATEWAY;
  if (ethGateway && (network === "mainnet" || network === "sepolia")) {
    rpcUrl = ethGateway;
  }

  _cachedConfig = {
    rpcUrl,
    chainId,
    network,
    provider,
    contractAddress: process.env.CHAIN_CONTRACT_ADDRESS || "",
    isMock:          false,
  };

  return _cachedConfig;
}

/**
 * Build a WebSocket URL from the HTTP RPC URL (for event subscription).
 */
export function getWsUrl(config: ChainConfig): string {
  return config.rpcUrl
    .replace("https://", "wss://")
    .replace("http://", "ws://");
}

/**
 * Get a human-readable chain status string.
 */
export function getChainStatus(): {
  connected: boolean;
  provider: ChainProvider;
  network: ChainNetwork;
  chainId: number;
  rpcConfigured: boolean;
  contractDeployed: boolean;
  mock: boolean;
} {
  const config = getChainConfig();
  return {
    connected:        !config.isMock,
    provider:         config.provider,
    network:          config.network,
    chainId:          config.chainId,
    rpcConfigured:    config.rpcUrl !== "mock://localhost" && config.rpcUrl !== "http://localhost:8545",
    contractDeployed: config.contractAddress !== "" && config.contractAddress !== "0x0000000000000000000000000000000000000000",
    mock:             config.isMock,
  };
}
