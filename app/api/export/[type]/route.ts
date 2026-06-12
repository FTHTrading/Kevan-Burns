import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

function randomBytesEdge(len: number): Uint8Array {
  if (!cryptoObj) throw new Error("Web Crypto API (crypto) is not defined in this environment");
  return cryptoObj.getRandomValues(new Uint8Array(len));
}


function makeId() {
  return Array.from(randomBytesEdge(8)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
function makeHash() {
  return "0x" + Array.from(randomBytesEdge(32)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function makeCid() {
  return "bafybeig" + Array.from(randomBytesEdge(24)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

const DEMO_NAMESPACE = "smithfamily.legacy";
const DEMO_OWNER = "Robert A. Smith III";
const NOW = new Date().toISOString();

function estateSummary() {
  return {
    type: "estate-summary",
    docId: `LVP-ES-${makeId()}`,
    generatedAt: NOW,
    ipfsCid: makeCid(),
    chainHash: makeHash(),
    namespace: DEMO_NAMESPACE,
    sections: [
      {
        title: "Vault Manifest",
        rows: [
          ["Namespace", DEMO_NAMESPACE],
          ["Owner", DEMO_OWNER],
          ["Created", "January 15, 2024"],
          ["Last Updated", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
          ["Chain Anchor", "Apostle Chain — Chain ID 7332"],
          ["Block Height", "#1,842"],
          ["IPFS Status", "Anchored ✓"],
          ["Vault Count", "4 active vaults"],
        ],
      },
      {
        title: "Asset Inventory Summary",
        table: {
          headers: ["Asset Type", "Description", "Category", "IPFS CID"],
          rows: [
            ["Will", "Last Will & Testament (Rev. 2024)", "Legal", makeCid().slice(0, 24) + "..."],
            ["Trust", "Smith Family Revocable Trust", "Legal", makeCid().slice(0, 24) + "..."],
            ["Property Deed", "123 Oak Street, Atlanta GA 30301", "Real Estate", makeCid().slice(0, 24) + "..."],
            ["Brokerage", "Fidelity Investment Account #FD-44821", "Financial", makeCid().slice(0, 24) + "..."],
            ["Bitcoin Wallet", "Legacy cold wallet registry", "Digital Asset", makeCid().slice(0, 24) + "..."],
            ["Life Insurance", "MetLife Policy #ML-887421", "Insurance", makeCid().slice(0, 24) + "..."],
          ],
        },
      },
      {
        title: "Guardian & Executor Assignments",
        rows: [
          ["Primary Executor", "Jennifer Smith-Collins"],
          ["Successor Executor", "Michael A. Brennan, Esq."],
          ["Estate Attorney", "Brennan & Associates, LLC"],
          ["Primary Guardian", "Patricia L. Smith"],
          ["Digital Asset Guardian", "Robert Smith Jr."],
          ["Minor Beneficiary Guardian", "Patricia L. Smith (until age 25)"],
        ],
      },
      {
        title: "Release Policy Snapshot",
        rows: [
          ["Total Conditions Required", "5 of 5"],
          ["Condition 1 — Death Certificate", "Required · 72hr delay post-filing"],
          ["Condition 2 — Guardian Quorum", "2 of 3 guardians must attest"],
          ["Condition 3 — Waiting Period", "30 calendar days"],
          ["Condition 4 — Legal Hold Check", "Automated scan — currently clear"],
          ["Condition 5 — Executor Multi-sig", "2 of 3 keyholders required"],
        ],
      },
    ],
  };
}

function namespaceManifest() {
  return {
    type: "namespace-manifest",
    docId: `LVP-NM-${makeId()}`,
    generatedAt: NOW,
    ipfsCid: makeCid(),
    chainHash: makeHash(),
    namespaceDetails: {
      name: DEMO_NAMESPACE,
      owner: DEMO_OWNER,
      status: "ACTIVE",
      plan: "Family",
      created: "January 15, 2024",
      chainAnchor: "Apostle Chain · Chain ID 7332 · Block #1842",
      vaultCount: "4",
    },
    members: [
      { role: "OWNER", name: DEMO_OWNER, address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
      { role: "EXECUTOR", name: "Jennifer Smith-Collins", address: "0x53d284357ec70cE289D6D64134DfAc8E511c0a3E" },
      { role: "GUARDIAN", name: "Patricia L. Smith", address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b" },
      { role: "GUARDIAN", name: "Robert Smith Jr.", address: "0x8fce16d2099454f40b7bfdc9e1d6b7e096c6f4d2" },
      { role: "BENEFICIARY", name: "Emma R. Smith", address: "0xfe9e8709d3215310075d67e3ed32a380ccf451c8" },
      { role: "BENEFICIARY", name: "James T. Smith", address: "0xb3c839dbde6b96d364a24cd9f7c4e1e7b3a81f4c" },
    ],
  };
}

function assetInventory() {
  return {
    type: "asset-inventory",
    docId: `LVP-AI-${makeId()}`,
    generatedAt: NOW,
    namespace: DEMO_NAMESPACE,
    rows: [
      { category: "Legal", type: "Will", name: "Last Will & Testament (Rev. 2024)", walletRef: "", ipfsCid: makeCid(), status: "Anchored" },
      { category: "Legal", type: "Trust", name: "Smith Family Revocable Trust", walletRef: "", ipfsCid: makeCid(), status: "Anchored" },
      { category: "Real Estate", type: "Deed", name: "123 Oak Street, Atlanta GA 30301", walletRef: "", ipfsCid: makeCid(), status: "Anchored" },
      { category: "Financial", type: "Account", name: "Fidelity Brokerage #FD-44821", walletRef: "0xabc...def", ipfsCid: makeCid(), status: "Registered" },
      { category: "Digital Asset", type: "Wallet", name: "Bitcoin Cold Wallet", walletRef: "17M4J6sXEgGz13h...V2YJ", ipfsCid: makeCid(), status: "Registered" },
      { category: "Digital Asset", type: "Wallet", name: "Ethereum Multisig Vault", walletRef: "0x742d35Cc...f44e", ipfsCid: makeCid(), status: "Registered" },
      { category: "Digital Asset", type: "Wallet", name: "Solana Legacy Wallet", walletRef: "7xKXtg2kGo...wZ", ipfsCid: makeCid(), status: "Registered" },
      { category: "Digital Asset", type: "Wallet", name: "XRPL Account", walletRef: "rHb9CJAWyB4rj91...J", ipfsCid: makeCid(), status: "Registered" },
      { category: "Insurance", type: "Policy", name: "MetLife Life Insurance #ML-887421", walletRef: "", ipfsCid: makeCid(), status: "Anchored" },
      { category: "Vehicle", type: "Title", name: "2023 Tesla Model S — VIN 5YJ3E1...", walletRef: "", ipfsCid: makeCid(), status: "Anchored" },
    ],
  };
}

function executorPacket() {
  return {
    type: "executor-packet",
    docId: `LVP-EP-${makeId()}`,
    generatedAt: NOW,
    ipfsCid: makeCid(),
    chainHash: makeHash(),
    namespace: DEMO_NAMESPACE,
    sections: [
      {
        title: "Executor Authority Grant",
        rows: [
          ["Executor Name", "Jennifer Smith-Collins"],
          ["Role", "Primary Executor"],
          ["Appointing Testator", DEMO_OWNER],
          ["Appointment Date", "January 15, 2024"],
          ["Jurisdiction", "State of Georgia, United States"],
          ["Authority Scope", "Full estate administration"],
          ["Chain Authorization", makeHash().slice(0, 42) + "..."],
          ["Document Status", "ACTIVE — Awaiting Trigger Conditions"],
        ],
      },
      {
        title: "Release Authorization Conditions",
        rows: [
          ["Total Conditions", "5 required — all must be satisfied"],
          ["Condition 1", "Death Certificate filed with County Clerk"],
          ["Condition 2", "2 of 3 Guardian Quorum attestation"],
          ["Condition 3", "30-day waiting period elapsed"],
          ["Condition 4", "No active legal hold or probate contest"],
          ["Condition 5", "Executor multi-sig (2 of 3 keyholders)"],
          ["Current Status", "Pending — no trigger event recorded"],
        ],
      },
      {
        title: "Wallet & Digital Asset Transfer Instructions",
        table: {
          headers: ["Asset / Chain", "Wallet Address", "Estimated Value", "Transfer Method"],
          rows: [
            ["BTC · Bitcoin", "17M4J6sXEgGz...V2YJ", "See vault register", "Hardware wallet key ceremony"],
            ["ETH · Ethereum", "0x742d35Cc...f44e", "See vault register", "Multisig executor key transfer"],
            ["SOL · Solana", "7xKXtg2kGo...wZ", "See vault register", "Multisig release transaction"],
            ["XRP · XRPL", "rHb9CJAWyB4...qGJ", "See vault register", "XRPL → Apostle bridge settlement"],
            ["ATP · Apostle Chain", "agent:87724c76-da93...", "See vault register", "Protocol transfer — vault release"],
          ],
        },
      },
      {
        title: "Notarization Record",
        rows: [
          ["Date Notarized", "January 15, 2024"],
          ["Notary Public", "Sandra K. Williams, GNP-4421"],
          ["Notary Commission State", "Georgia"],
          ["Commission Expires", "December 31, 2026"],
          ["Notary Seal", "Electronically affixed"],
          ["Chain Attestation Hash", makeHash().slice(0, 42) + "..."],
        ],
      },
    ],
  };
}

function beneficiaryPacket() {
  return {
    type: "beneficiary-packet",
    docId: `LVP-BP-${makeId()}`,
    generatedAt: NOW,
    ipfsCid: makeCid(),
    chainHash: makeHash(),
    namespace: DEMO_NAMESPACE,
    sections: [
      {
        title: "Beneficiary Identification",
        rows: [
          ["Full Legal Name", "Emma R. Smith"],
          ["Relationship to Testator", "Daughter"],
          ["Date of Birth", "March 12, 1998"],
          ["Allocation", "40% of residuary estate"],
          ["Specific Bequests", "Primary residence at 123 Oak Street"],
          ["Personal Property", "Designated jewelry and artwork (Schedule B)"],
          ["Contingent Beneficiary", "James T. Smith (brother)"],
          ["Minor Status", "No — adult beneficiary"],
        ],
      },
      {
        title: "Access & Claim Instructions",
        rows: [
          ["Access Method", "Guardian-issued ceremony key + executor authorization"],
          ["Required Documents", "Government-issued photo ID, death certificate certified copy"],
          ["Vault Access URL", "vault.legacy-vault.io/claim"],
          ["Support Contact", "executor@smithfamily.legacy"],
          ["Protocol Version", "Legacy Vault Protocol v1.0"],
          ["Expected Timeline", "30–60 days post-trigger event"],
        ],
      },
      {
        title: "Digital Asset Wallet References",
        table: {
          headers: ["Chain", "Asset Description", "Wallet Address", "Release Condition"],
          rows: [
            ["Ethereum", "ETH + ERC-20 tokens", "0xfe9e87...451c8", "Executor multi-sig transfer"],
            ["Bitcoin", "BTC — cold wallet", "1A1zP...c5h", "Hardware wallet key handoff"],
            ["Solana", "SOL portfolio", "7xKXtg...wZ", "Multisig release transaction"],
            ["Apostle Chain", "USDF balance", "agent:87724c76...", "Protocol vault release"],
          ],
        },
      },
      {
        title: "Custodian Statement",
        rows: [
          ["Custodian", "Legacy Vault Protocol — FTH Trading"],
          ["Statement Date", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
          ["Signature Authority", "Protocol Guardian Quorum — 2 of 3"],
          ["IPFS CID", makeCid().slice(0, 40) + "..."],
          ["Chain Verification Hash", makeHash().slice(0, 42) + "..."],
          ["Legal Counsel on Record", "Brennan & Associates, LLC"],
        ],
      },
    ],
  };
}

function auditLog() {
  return {
    type: "audit-log-csv",
    docId: `LVP-AL-${makeId()}`,
    generatedAt: NOW,
    namespace: DEMO_NAMESPACE,
    events: [
      { id: makeId(), ts: "2024-01-15T09:00:00Z", type: "NAMESPACE_CREATED", actor: "0x742d...f44e", detail: "smithfamily.legacy namespace registered" },
      { id: makeId(), ts: "2024-01-16T14:22:00Z", type: "VAULT_CREATED", actor: "0x742d...f44e", detail: "Primary Estate Vault created" },
      { id: makeId(), ts: "2024-01-20T10:15:00Z", type: "DOCUMENT_UPLOADED", actor: "0x742d...f44e", detail: "Will.pdf anchored to IPFS" },
      { id: makeId(), ts: "2024-01-21T11:30:00Z", type: "EXECUTOR_ASSIGNED", actor: "0x742d...f44e", detail: "Jennifer Smith-Collins added as primary executor" },
      { id: makeId(), ts: "2024-02-01T08:00:00Z", type: "GUARDIAN_ADDED", actor: "0x742d...f44e", detail: "Patricia Smith added as primary guardian" },
      { id: makeId(), ts: "2024-02-05T09:30:00Z", type: "GUARDIAN_ADDED", actor: "0x742d...f44e", detail: "Robert Smith Jr. added as digital guardian" },
      { id: makeId(), ts: "2024-02-10T16:45:00Z", type: "WALLET_REGISTERED", actor: "0x742d...f44e", detail: "Bitcoin cold wallet registered" },
      { id: makeId(), ts: "2024-02-12T11:00:00Z", type: "WALLET_REGISTERED", actor: "0x742d...f44e", detail: "Ethereum multisig vault registered" },
      { id: makeId(), ts: "2024-03-05T12:00:00Z", type: "POLICY_UPDATED", actor: "0x742d...f44e", detail: "Release policy configured — 5 conditions" },
      { id: makeId(), ts: "2024-04-01T09:30:00Z", type: "AUDIT_EXPORT", actor: "0x742d...f44e", detail: "Q1 audit export generated" },
      { id: makeId(), ts: "2024-06-15T14:00:00Z", type: "DOCUMENT_UPLOADED", actor: "0x742d...f44e", detail: "Property deed anchored to IPFS" },
      { id: makeId(), ts: "2024-09-01T10:00:00Z", type: "POLICY_VERIFIED", actor: "guardian-quorum", detail: "Annual policy verification — all conditions active" },
      { id: makeId(), ts: "2025-01-15T09:00:00Z", type: "ANNUAL_REVIEW", actor: "0x742d...f44e", detail: "Estate vault annual review completed" },
    ],
  };
}

function auditLogJson() {
  const base = auditLog();
  return { ...base, type: "audit-log-json" };
}

function releasePolicy() {
  return {
    type: "release-policy-snapshot",
    docId: `LVP-RP-${makeId()}`,
    generatedAt: NOW,
    ipfsCid: makeCid(),
    chainHash: makeHash(),
    namespace: DEMO_NAMESPACE,
    sections: [
      {
        title: "Active Release Conditions",
        table: {
          headers: ["#", "Condition", "Current Status", "Authority", "Notes"],
          rows: [
            ["1", "Death Certificate Filed", "Pending", "County Clerk + Apostle Chain Attestor", "72-hour delay after filing"],
            ["2", "Guardian Quorum Approval", "Pending", "2 of 3 Guardians", "90-day timeout then escalation"],
            ["3", "Waiting Period Elapsed", "Pending", "Protocol — automated", "30 calendar days post-attestation"],
            ["4", "No Legal Hold Active", "Clear ✓", "Automated Legal Hold Scanner", "Scans daily"],
            ["5", "Executor Multi-sig Authorization", "Pending", "2 of 3 Keyholders", "Final step before release"],
          ],
        },
      },
      {
        title: "Guardian Quorum Configuration",
        rows: [
          ["Quorum Threshold", "2 of 3 guardians required"],
          ["Guardian 1 — Primary", "Patricia L. Smith"],
          ["Guardian 2 — Digital Assets", "Robert Smith Jr."],
          ["Guardian 3 — Legal", "Michael A. Brennan, Esq."],
          ["Quorum Timeout", "90 days before auto-escalation to probate court"],
          ["Notification Method", "Email + chain event"],
        ],
      },
      {
        title: "Waiting Period & Timeline Configuration",
        rows: [
          ["Standard Waiting Period", "30 calendar days"],
          ["Contested Estate Extension", "180 days (automatically extended)"],
          ["Minor Beneficiary Hold", "Until age 25 — separate restricted vault"],
          ["Override Authority", "Probate court order — judge signature"],
          ["Emergency Bypass", "Not available — by design"],
        ],
      },
      {
        title: "Legal Hold Scanner Configuration",
        rows: [
          ["Scan Frequency", "Daily automated scan"],
          ["Data Sources", "County court records, federal dockets, IRS lien registry"],
          ["Alert Recipients", "Executor + Estate Attorney"],
          ["False Positive Protocol", "48hr manual review window"],
          ["Current Status", "Active — No holds detected"],
        ],
      },
    ],
  };
}

function crossChainSummary() {
  return {
    type: "cross-chain-summary",
    docId: `LVP-CC-${makeId()}`,
    generatedAt: NOW,
    ipfsCid: makeCid(),
    chainHash: makeHash(),
    namespace: DEMO_NAMESPACE,
    sections: [
      {
        title: "Multi-Chain Wallet Registry",
        table: {
          headers: ["Chain", "Address", "Asset Class", "Snapshot Date", "Proof Anchor"],
          rows: [
            ["Bitcoin", "17M4J6sXEgGz...V2YJ", "BTC — P2PKH", "2025-01-15", makeHash().slice(2, 20)],
            ["Ethereum", "0x742d35Cc...f44e", "ETH + ERC-20", "2025-01-15", makeHash().slice(2, 20)],
            ["Solana", "7xKXtg2kGo...wZ", "SOL + SPL", "2025-01-15", makeHash().slice(2, 20)],
            ["XRPL", "rHb9CJAWyB4...qGJ", "XRP", "2025-01-15", makeHash().slice(2, 20)],
            ["Stellar", "GAAZI4TCR3TIX...TKM", "XLM", "2025-01-15", makeHash().slice(2, 20)],
            ["Apostle Chain", "agent:87724c76-da93...", "ATP + USDF", "2025-01-15", makeHash().slice(2, 20)],
          ],
        },
      },
      {
        title: "Bridge & Relayer Status",
        rows: [
          ["XRPL → Apostle Bridge", "Active — last sync 2025-01-15"],
          ["Stellar → Apostle Bridge", "Active — last sync 2025-01-15"],
          ["EVM Bridge", "Configured — awaiting deployment"],
          ["Last Full Sync", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
          ["Proof Anchor Block", "Apostle Chain Block #1,842"],
          ["Cross-chain Relayer", "mesh-pay-reserve agent"],
        ],
      },
      {
        title: "Release & Transfer Protocol",
        rows: [
          ["Transfer Method", "Guardian-authorized ceremony with executor multi-sig"],
          ["Settlement Chain", "Apostle Chain — final settlement layer"],
          ["USDF Settlement", "Stable settlement via USDF balances"],
          ["Protocol Version", "Cross-Chain Bridge v1.0"],
          ["Emergency Contact", "executor@smithfamily.legacy"],
        ],
      },
    ],
  };
}

function x402Billing() {
  return {
    type: "x402-billing",
    docId: `LVP-X4-${makeId()}`,
    generatedAt: NOW,
    namespace: DEMO_NAMESPACE,
    rows: [
      { serviceId: "SVC-001", service: "Estate Summary PDF", units: "3", usdf: "0.30", ts: "2024-09-01T10:00:00Z", gateway: "gateway-1.x402.io", status: "SETTLED" },
      { serviceId: "SVC-002", service: "Executor Packet PDF", units: "1", usdf: "0.50", ts: "2024-09-05T14:22:00Z", gateway: "gateway-1.x402.io", status: "SETTLED" },
      { serviceId: "SVC-003", service: "Audit Log Export", units: "2", usdf: "0.20", ts: "2024-09-10T09:30:00Z", gateway: "gateway-2.x402.io", status: "SETTLED" },
      { serviceId: "SVC-004", service: "Namespace Manifest JSON", units: "1", usdf: "0.10", ts: "2024-09-12T11:00:00Z", gateway: "gateway-1.x402.io", status: "PENDING" },
      { serviceId: "SVC-005", service: "Cross-chain Summary PDF", units: "1", usdf: "0.50", ts: "2024-09-15T16:45:00Z", gateway: "gateway-2.x402.io", status: "SETTLED" },
      { serviceId: "SVC-006", service: "Release Policy Snapshot", units: "1", usdf: "0.20", ts: "2025-01-15T09:15:00Z", gateway: "gateway-1.x402.io", status: "SETTLED" },
    ],
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  let data: unknown;
  switch (type) {
    case "estate-summary":      data = estateSummary(); break;
    case "namespace-manifest":  data = namespaceManifest(); break;
    case "asset-inventory":     data = assetInventory(); break;
    case "executor-packet":     data = executorPacket(); break;
    case "beneficiary-packet":  data = beneficiaryPacket(); break;
    case "audit-log":           data = auditLog(); break;
    case "audit-log-json":      data = auditLogJson(); break;
    case "release-policy":      data = releasePolicy(); break;
    case "cross-chain-summary": data = crossChainSummary(); break;
    case "x402-billing":        data = x402Billing(); break;
    default:
      return NextResponse.json({ error: "Unknown export type" }, { status: 404 });
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
