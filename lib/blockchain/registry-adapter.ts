/**
 * lib/blockchain/registry-adapter.ts
 *
 * Private blockchain registry adapter — Legacy Vault Protocol.
 *
 * Modes:
 *  • MOCK_CHAIN=true  (default in dev)  → in-memory mock ledger, no real chain.
 *  • MOCK_CHAIN=false                   → connects to a real EVM node using ethers.js v6
 *                                         and the deployed LegacyVaultRegistry contract.
 *
 * Required env vars for production:
 *   CHAIN_RPC_URL              — WebSocket or HTTP RPC endpoint
 *   CHAIN_CONTRACT_ADDRESS     — LegacyVaultRegistry deployed address
 *   CHAIN_ADMIN_KEY            — Private key for the operator wallet
 *
 * The contract stores ONLY:
 *   - Vault IDs, owner DIDs, manifest CIDs/hashes
 *   - Status transitions and release policy IDs
 *   - Audit event hashes for tamper-evidence
 *
 * Raw documents, account numbers, and private keys are NEVER stored on-chain.
 */

const crypto = typeof globalThis !== "undefined" && globalThis.crypto
  ? globalThis.crypto
  : (typeof require !== "undefined" ? require("crypto").webcrypto : undefined);

// Edge replacements
function randomBytesEdge(len: number): Uint8Array {
  if (!crypto) throw new Error("Web Crypto API (crypto) is not defined in this environment");
  return crypto.getRandomValues(new Uint8Array(len));
}
async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const buf = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  const hash = await crypto.subtle.digest("SHA-256", buf as any);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─────────────────────────────────────────────
//  Shared types (used by both mock and production)
// ─────────────────────────────────────────────

export type ChainVaultStatus =
  | "ACTIVE"
  | "REVIEW_PENDING"
  | "RELEASE_PENDING"
  | "RELEASED"
  | "DISPUTED"
  | "LOCKED";

export interface ChainVaultRecord {
  vaultId: string;
  ownerDID: string;
  encryptedManifestCID: string;
  manifestHash: string;
  executorDIDs: string[];
  beneficiaryDIDs: string[];
  guardianDIDs: string[];
  releasePolicyId: string;
  status: ChainVaultStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChainEvent {
  eventName: string;
  vaultId: string;
  data: Record<string, string>;
  txHash: string;
  blockHeight: number;
  timestamp: string;
}

// ─────────────────────────────────────────────
//  Mock in-memory ledger (MOCK_CHAIN=true)
// ─────────────────────────────────────────────

const mockVaults = new Map<string, ChainVaultRecord>();
const mockEvents: ChainEvent[] = [];
let mockBlockHeight = 1000;

function mockTxHash(): string {
  return "0x" + Array.from(randomBytesEdge(32)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function emitMockEvent(
  name: string,
  vaultId: string,
  data: Record<string, string>
): ChainEvent {
  mockBlockHeight++;
  const ev: ChainEvent = {
    eventName: name,
    vaultId,
    data,
    txHash: mockTxHash(),
    blockHeight: mockBlockHeight,
    timestamp: new Date().toISOString(),
  };
  mockEvents.push(ev);
  return ev;
}

// ─────────────────────────────────────────────
//  Production EVM connector (MOCK_CHAIN=false)
// ─────────────────────────────────────────────

const STATUS_MAP: Record<number, ChainVaultStatus> = {
  0: "ACTIVE",
  1: "REVIEW_PENDING",
  2: "RELEASE_PENDING",
  3: "RELEASED",
  4: "DISPUTED",
  5: "LOCKED",
};

const STATUS_ENUM: Record<ChainVaultStatus, number> = {
  ACTIVE:          0,
  REVIEW_PENDING:  1,
  RELEASE_PENDING: 2,
  RELEASED:        3,
  DISPUTED:        4,
  LOCKED:          5,
};

// Minimal ABI — only the functions called by this adapter
const VAULT_REGISTRY_ABI = [
  "function registerVault(string vaultId, string ownerDID, string manifestCID, bytes32 manifestHash, string releasePolicyId) external",
  "function updateManifest(string vaultId, string newCID, bytes32 newHash) external",
  "function setVaultStatus(string vaultId, uint8 newStatus) external",
  "function anchorAuditEvent(string vaultId, string eventId, bytes32 eventHash) external",
  "function getVault(string vaultId) external view returns (tuple(string vaultId, string ownerDID, string encryptedManifestCID, bytes32 manifestHash, string releasePolicyId, uint8 status, uint256 createdAt, uint256 updatedAt, bool exists))",
  "function getVaultEvents(string vaultId) external view returns (tuple(string eventName, string vaultId, bytes32 dataHash, uint256 blockHeight, uint256 timestamp)[])",
  "function vaultRegistered(string vaultId) external view returns (bool)",
];

let _contract: import("ethers").Contract | null = null;
let _provider: import("ethers").JsonRpcProvider | null = null;

async function getContract(): Promise<import("ethers").Contract> {
  if (_contract) return _contract;

  const { ethers } = await import("ethers");

  const rpcUrl      = process.env.CHAIN_RPC_URL;
  const contractAddr = process.env.CHAIN_CONTRACT_ADDRESS;
  const adminKey    = process.env.CHAIN_ADMIN_KEY;

  if (!rpcUrl)       throw new Error("CHAIN_RPC_URL is not set");
  if (!contractAddr) throw new Error("CHAIN_CONTRACT_ADDRESS is not set");
  if (!adminKey)     throw new Error("CHAIN_ADMIN_KEY is not set");

  _provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(adminKey, _provider);
  _contract = new ethers.Contract(contractAddr, VAULT_REGISTRY_ABI, wallet);

  return _contract;
}

function toHex32(str: string): string {
  // Convert a hex string (with or without 0x prefix) to a 0x-prefixed 32-byte hex
  const clean = str.startsWith("0x") ? str.slice(2) : str;
  return "0x" + clean.padStart(64, "0");
}

function bytes32ToHex(b: string): string {
  return b.startsWith("0x") ? b : "0x" + b;
}

// ─────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────

const isMock = () => process.env.MOCK_CHAIN !== "false";

/**
 * Register a new vault on the private chain.
 */
export async function registerVault(params: {
  vaultId: string;
  ownerDID: string;
  manifestCID: string;
  manifestHash: string;
  releasePolicyId: string;
}): Promise<{ txHash: string }> {
  if (isMock()) {
    const record: ChainVaultRecord = {
      vaultId:              params.vaultId,
      ownerDID:             params.ownerDID,
      encryptedManifestCID: params.manifestCID,
      manifestHash:         params.manifestHash,
      executorDIDs:         [],
      beneficiaryDIDs:      [],
      guardianDIDs:         [],
      releasePolicyId:      params.releasePolicyId,
      status:               "ACTIVE",
      createdAt:            new Date().toISOString(),
      updatedAt:            new Date().toISOString(),
    };
    mockVaults.set(params.vaultId, record);
    const ev = emitMockEvent("VaultCreated", params.vaultId, { ownerDID: params.ownerDID });
    return { txHash: ev.txHash };
  }

  const contract = await getContract();
  const hashBytes = toHex32(
    params.manifestHash.startsWith("0x")
      ? params.manifestHash
      : "0x" + params.manifestHash
  );

  const tx = await contract.registerVault(
    params.vaultId,
    params.ownerDID,
    params.manifestCID,
    hashBytes,
    params.releasePolicyId
  );
  const receipt = await tx.wait();
  return { txHash: receipt?.hash || tx.hash };
}

/**
 * Update the vault manifest CID and hash on-chain.
 */
export async function updateManifest(params: {
  vaultId: string;
  newCID: string;
  newHash: string;
}): Promise<{ txHash: string }> {
  if (isMock()) {
    const record = mockVaults.get(params.vaultId);
    if (!record) throw new Error(`Chain: vault ${params.vaultId} not found`);
    record.encryptedManifestCID = params.newCID;
    record.manifestHash         = params.newHash;
    record.updatedAt            = new Date().toISOString();
    const ev = emitMockEvent("ManifestUpdated", params.vaultId, {
      cid: params.newCID,
      hash: params.newHash,
    });
    return { txHash: ev.txHash };
  }

  const contract = await getContract();
  const hashBytes = toHex32(params.newHash.startsWith("0x") ? params.newHash : "0x" + params.newHash);
  const tx = await contract.updateManifest(params.vaultId, params.newCID, hashBytes);
  const receipt = await tx.wait();
  return { txHash: receipt?.hash || tx.hash };
}

/**
 * Update vault status on-chain (e.g., ACTIVE → REVIEW_PENDING).
 */
export async function setVaultStatus(
  vaultId: string,
  status: ChainVaultStatus
): Promise<{ txHash: string }> {
  if (isMock()) {
    const record = mockVaults.get(vaultId);
    if (!record) throw new Error(`Chain: vault ${vaultId} not found`);
    record.status    = status;
    record.updatedAt = new Date().toISOString();
    const eventNameMap: Record<ChainVaultStatus, string> = {
      ACTIVE:          "VaultUnlocked",
      REVIEW_PENDING:  "ReleaseRequested",
      RELEASE_PENDING: "GuardianQuorumMet",
      RELEASED:        "ReleaseApproved",
      DISPUTED:        "DisputeOpened",
      LOCKED:          "VaultLocked",
    };
    const ev = emitMockEvent(eventNameMap[status], vaultId, { status });
    return { txHash: ev.txHash };
  }

  const contract = await getContract();
  const tx = await contract.setVaultStatus(vaultId, STATUS_ENUM[status]);
  const receipt = await tx.wait();
  return { txHash: receipt?.hash || tx.hash };
}

/**
 * Write an audit event hash on-chain for tamper-evidence.
 */
export async function anchorAuditEvent(params: {
  vaultId: string;
  eventId: string;
  eventHash: string;
}): Promise<{ txHash: string }> {
  if (isMock()) {
    const ev = emitMockEvent("AuditEventAnchored", params.vaultId, {
      eventId:   params.eventId,
      eventHash: params.eventHash,
    });
    return { txHash: ev.txHash };
  }

  const contract = await getContract();
  const hashBytes = toHex32(
    params.eventHash.startsWith("0x") ? params.eventHash : "0x" + params.eventHash
  );
  const tx = await contract.anchorAuditEvent(params.vaultId, params.eventId, hashBytes);
  const receipt = await tx.wait();
  return { txHash: receipt?.hash || tx.hash };
}

/**
 * Read a vault record from the chain.
 */
export async function getChainVault(vaultId: string): Promise<ChainVaultRecord | null> {
  if (isMock()) return mockVaults.get(vaultId) ?? null;

  const contract = await getContract();
  const exists = await contract.vaultRegistered(vaultId);
  if (!exists) return null;

  const v = await contract.getVault(vaultId);
  return {
    vaultId:              v.vaultId,
    ownerDID:             v.ownerDID,
    encryptedManifestCID: v.encryptedManifestCID,
    manifestHash:         bytes32ToHex(v.manifestHash),
    executorDIDs:         [],
    beneficiaryDIDs:      [],
    guardianDIDs:         [],
    releasePolicyId:      v.releasePolicyId,
    status:               STATUS_MAP[Number(v.status)] ?? "ACTIVE",
    createdAt:            new Date(Number(v.createdAt) * 1000).toISOString(),
    updatedAt:            new Date(Number(v.updatedAt) * 1000).toISOString(),
  };
}

/**
 * Read chain events for a vault.
 */
export async function getChainEvents(vaultId: string): Promise<ChainEvent[]> {
  if (isMock()) return mockEvents.filter((e) => e.vaultId === vaultId);

  const contract = await getContract();
  const events = await contract.getVaultEvents(vaultId);
  return events.map((e: {
    eventName: string;
    vaultId: string;
    dataHash: string;
    blockHeight: bigint;
    timestamp: bigint;
  }) => ({
    eventName:   e.eventName,
    vaultId:     e.vaultId,
    data:        { dataHash: bytes32ToHex(e.dataHash) },
    txHash:      "",  // not stored on-chain to save gas; use event logs if needed
    blockHeight: Number(e.blockHeight),
    timestamp:   new Date(Number(e.timestamp) * 1000).toISOString(),
  }));
}
