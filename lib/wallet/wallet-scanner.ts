/**
 * lib/wallet/wallet-scanner.ts
 *
 * Public wallet scanner — reads only publicly available on-chain data
 * for wallet addresses the owner has explicitly registered.
 *
 * This module NEVER discovers unknown wallets.
 * It only fetches balance / token snapshots for addresses the owner provided.
 *
 * In mock mode it returns stubbed data. In production, connect to
 * node RPCs or indexer APIs (Alchemy, Helius, XRPL Websocket, etc.)
 */

export interface WalletSnapshot {
  chain: string;
  publicAddress: string;
  nativeBalance: string;
  tokenCount: number;
  nftCount: number;
  lastUpdated: string;
  mock: boolean;
}

/** Fetch a public balance snapshot for a registered wallet address */
export async function scanWallet(
  chain: string,
  publicAddress: string
): Promise<WalletSnapshot> {
  const isMock = process.env.MOCK_IPFS !== "false"; // reuse same flag

  if (isMock) {
    return {
      chain,
      publicAddress,
      nativeBalance: mockBalance(chain),
      tokenCount: Math.floor(Math.random() * 10),
      nftCount: Math.floor(Math.random() * 5),
      lastUpdated: new Date().toISOString(),
      mock: true,
    };
  }

  // Production: dispatch to chain-specific scanner
  switch (chain.toLowerCase()) {
    case "ethereum":
    case "base":
    case "polygon":
      return scanEVM(chain, publicAddress);
    case "solana":
      return scanSolana(publicAddress);
    case "xrpl":
      return scanXRPL(publicAddress);
    case "stellar":
      return scanStellar(publicAddress);
    default:
      throw new Error(`No scanner implemented for chain: ${chain}`);
  }
}

function mockBalance(chain: string): string {
  const balances: Record<string, string> = {
    ethereum: "2.4 ETH",
    base: "0.5 ETH",
    polygon: "150 MATIC",
    solana: "12.5 SOL",
    xrpl: "5000 XRP",
    stellar: "1200 XLM",
    bitcoin: "0.025 BTC",
  };
  return balances[chain.toLowerCase()] ?? "unknown";
}

async function scanEVM(chain: string, address: string): Promise<WalletSnapshot> {
  // TODO: integrate with Alchemy/Infura/Etherscan API
  throw new Error(`EVM scanner not yet wired for ${chain}.`);
}

async function scanSolana(address: string): Promise<WalletSnapshot> {
  const apiKey = process.env.HELIUS_API_KEY || "4e1f7d63-dd43-4e52-87eb-711bd6f083a2";
  const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  try {
    // 1. Fetch SOL Balance
    const balanceRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "getBalance",
        method: "getBalance",
        params: [address]
      })
    });
    if (!balanceRes.ok) throw new Error(`Helius balance request failed: ${balanceRes.status}`);
    const balanceData = await balanceRes.json() as { result?: { value: number } };
    const lamports = balanceData.result?.value ?? 0;
    const solBalance = (lamports / 1e9).toFixed(4) + " SOL";

    // 2. Fetch Assets (Tokens/NFTs) via Helius DAS API
    const assetsRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "getAssets",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: address,
          page: 1,
          limit: 100,
          displayOptions: { showFungible: true, showNativeBalance: false }
        }
      })
    });

    let tokenCount = 0;
    let nftCount = 0;

    if (assetsRes.ok) {
      const assetsData = await assetsRes.json() as {
        result?: { items: { interface: string }[] }
      };
      const items = assetsData.result?.items ?? [];
      for (const item of items) {
        if (item.interface === "FungibleToken" || item.interface === "FungibleAsset") {
          tokenCount++;
        } else {
          nftCount++;
        }
      }
    }

    return {
      chain: "solana",
      publicAddress: address,
      nativeBalance: solBalance,
      tokenCount,
      nftCount,
      lastUpdated: new Date().toISOString(),
      mock: false,
    };
  } catch (error: any) {
    throw new Error(`Solana scan failed: ${error?.message || error}`);
  }
}

async function scanXRPL(address: string): Promise<WalletSnapshot> {
  // TODO: integrate with XRPL websocket API
  throw new Error("XRPL scanner not yet wired.");
}

async function scanStellar(address: string): Promise<WalletSnapshot> {
  // TODO: integrate with Horizon API
  throw new Error("Stellar scanner not yet wired.");
}
