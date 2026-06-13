/**
 * app/api/cws/genesis/route.ts
 *
 * PRODUCTION — CWS Genesis Batch Mint.
 *
 * Mints ALL CWS 2026 namespaces + ALL moment relics in a single admin call.
 * Also mints 8 team collection roots and 1 genesis manifest.
 *
 * Flow:
 *  1. Pin genesis manifest JSON to Pinata IPFS → rootCid
 *  2. Pin each of 8 team collection JSONs → teamCids{}
 *  3. For each of 26 athletes:
 *       a. Build namespace NFT metadata
 *       b. Pin to Pinata
 *       c. Anchor to Solana mainnet memo tx
 *  4. For each of 9 relics:
 *       a. Build relic SFT metadata
 *       b. Pin to Pinata
 *       c. Anchor to Solana mainnet memo tx
 *  5. Return full manifest with all CIDs, tx hashes, and Solscan links
 *
 * Admin-gated: requires X-Genesis-Key header matching GENESIS_ADMIN_KEY env var.
 * If GENESIS_ADMIN_KEY not set, the operator wallet public key is used as the gate.
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  CWS_ATHLETES,
  CWS_RELICS,
  CWS_TEAMS,
  buildNamespaceMetadata,
  buildRelicMetadata,
  buildTeamCollectionMetadata,
  buildGenesisManifest,
  TeamKey,
} from "@/lib/cws/cws-registry";
import { anchorToSolanaMainnet } from "@/lib/solana/solana-adapter";
import existingLog from "../../../../cws-genesis-mint-log.json";

const PINATA_API = "https://api.pinata.cloud";
const PINATA_GW  = "https://gateway.pinata.cloud/ipfs";

// ─── Pinata JSON Pin ──────────────────────────────────────────────────────────

async function pinJSON(content: object, name: string, type: string): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT not set.");

  const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: content,
      pinataMetadata: {
        name,
        keyvalues: {
          protocol: "unykorn-cws-2026",
          type,
          genesis:  "true",
        },
      },
      pinataOptions: { cidVersion: 1 },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown");
    throw new Error(`Pinata error ${res.status} for "${name}": ${err}`);
  }

  const json = (await res.json()) as { IpfsHash: string };
  return json.IpfsHash;
}

async function sha256Hex(input: string): Promise<string> {
  const buf  = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Admin gate
  const genesisKey = req.headers.get("x-genesis-key");
  const expectedKey = process.env.GENESIS_ADMIN_KEY ?? process.env.VAULT_MASTER_KEY;
  if (!expectedKey || genesisKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized — invalid genesis key." }, { status: 401 });
  }

  const startTime = Date.now();
  const results: {
    rootManifest:    { cid: string; ipfsUrl: string };
    teamCollections: Record<string, { cid: string; ipfsUrl: string; solanaTxHash: string; explorerUrl: string }>;
    namespaces:      Array<{ handle: string; cid: string; ipfsUrl: string; solanaTxHash: string; explorerUrl: string; error?: string }>;
    relics:          Array<{ id: string; cid: string; ipfsUrl: string; solanaTxHash: string; explorerUrl: string; error?: string }>;
    summary:         { totalMinted: number; totalFailed: number; durationMs: number };
  } = {
    rootManifest:    { cid: "", ipfsUrl: "" },
    teamCollections: {},
    namespaces:      [],
    relics:          [],
    summary:         { totalMinted: 0, totalFailed: 0, durationMs: 0 },
  };

  try {
    // ── 1. Genesis Root Manifest ─────────────────────────────────────────────
    const rootManifest = buildGenesisManifest();
    const rootCid = await pinJSON(rootManifest, "cws-genesis-root-manifest-2026", "genesis-root");
    results.rootManifest = { cid: rootCid, ipfsUrl: `${PINATA_GW}/${rootCid}` };
    console.log(`[genesis] Root manifest pinned: ${rootCid}`);

    // ── 2. Team Collection Roots ──────────────────────────────────────────────
    const existingTeams = (existingLog as any).teamCollections || {};
    for (const teamKey of Object.keys(CWS_TEAMS) as TeamKey[]) {
      try {
        if (existingTeams[teamKey] && existingTeams[teamKey].solanaTxHash && existingTeams[teamKey].cid) {
          console.log(`[genesis] Team ${teamKey} already minted. Reusing existing on-chain registry.`);
          results.teamCollections[teamKey] = {
            cid: existingTeams[teamKey].cid,
            ipfsUrl: existingTeams[teamKey].ipfsUrl,
            solanaTxHash: existingTeams[teamKey].solanaTxHash,
            explorerUrl: existingTeams[teamKey].explorerUrl,
          };
          results.summary.totalMinted++;
          continue;
        }

        const teamMeta = buildTeamCollectionMetadata(teamKey);
        const cid = await pinJSON(teamMeta, `cws-team-collection-${teamKey}`, "team-collection");

        const hash = await sha256Hex(`cws.collection.${teamKey}`);
        const solana = await anchorToSolanaMainnet({
          documentId: `cws.collection.${teamKey}`,
          sha256Hash: hash,
          ipfsCid: cid,
          label: `cws.team.${teamKey}`,
        });

        results.teamCollections[teamKey] = {
          cid,
          ipfsUrl:      `${PINATA_GW}/${cid}`,
          solanaTxHash: solana.txHash,
          explorerUrl:  solana.explorerUrl,
        };
        results.summary.totalMinted++;
        console.log(`[genesis] Team ${teamKey} minted: ${cid} | tx: ${solana.txHash}`);
      } catch (err: any) {
        console.error(`[genesis] Team ${teamKey} failed:`, err.message);
        results.teamCollections[teamKey] = { cid: "", ipfsUrl: "", solanaTxHash: "", explorerUrl: "" };
        results.summary.totalFailed++;
      }
    }

    // ── 3. Athlete Namespaces (all 48) ────────────────────────────────────────
    const existingNamespaces = (existingLog as any).namespaces || [];
    for (const athlete of CWS_ATHLETES) {
      try {
        const existing = existingNamespaces.find((n: any) => n.handle === athlete.handle);
        if (existing && existing.solanaTxHash && existing.cid) {
          console.log(`[genesis] Namespace ${athlete.handle} already minted. Reusing existing on-chain registry.`);
          results.namespaces.push({
            handle: athlete.handle,
            cid: existing.cid,
            ipfsUrl: existing.ipfsUrl,
            solanaTxHash: existing.solanaTxHash,
            explorerUrl: existing.explorerUrl,
          });
          results.summary.totalMinted++;
          continue;
        }

        const meta = buildNamespaceMetadata(athlete);
        const cid  = await pinJSON(meta, `cws-namespace-${athlete.handle}`, "namespace");

        const hash   = await sha256Hex(athlete.handle);
        const solana = await anchorToSolanaMainnet({
          documentId: athlete.handle,
          sha256Hash: hash,
          ipfsCid:    cid,
          label:      `cws.namespace.${athlete.handle}`,
        });

        results.namespaces.push({
          handle:       athlete.handle,
          cid,
          ipfsUrl:      `${PINATA_GW}/${cid}`,
          solanaTxHash: solana.txHash,
          explorerUrl:  solana.explorerUrl,
        });
        results.summary.totalMinted++;
        console.log(`[genesis] Namespace minted: ${athlete.handle} → ${cid} | ${solana.txHash}`);
      } catch (err: any) {
        console.error(`[genesis] Namespace ${athlete.handle} failed:`, err.message);
        results.namespaces.push({
          handle: athlete.handle,
          cid: "",
          ipfsUrl: "",
          solanaTxHash: "",
          explorerUrl: "",
          error: err.message,
        });
        results.summary.totalFailed++;
      }
    }

    // ── 4. Moment Relics (all 9) ──────────────────────────────────────────────
    const existingRelics = (existingLog as any).relics || [];
    for (const relic of CWS_RELICS) {
      try {
        const existing = existingRelics.find((r: any) => r.id === relic.id);
        if (existing && existing.solanaTxHash && existing.cid) {
          console.log(`[genesis] Relic ${relic.id} already minted. Reusing existing on-chain registry.`);
          results.relics.push({
            id: relic.id,
            cid: existing.cid,
            ipfsUrl: existing.ipfsUrl,
            solanaTxHash: existing.solanaTxHash,
            explorerUrl: existing.explorerUrl,
          });
          results.summary.totalMinted++;
          continue;
        }

        const meta = buildRelicMetadata(relic);
        const cid  = await pinJSON(meta, `cws-relic-${relic.id}`, "relic");

        const hash   = await sha256Hex(`${relic.id}:${relic.athleteHandle}:${relic.gameRef}`);
        const solana = await anchorToSolanaMainnet({
          documentId: relic.id,
          sha256Hash: hash,
          ipfsCid:    cid,
          label:      `cws.relic.${relic.id}`,
        });

        results.relics.push({
          id:           relic.id,
          cid,
          ipfsUrl:      `${PINATA_GW}/${cid}`,
          solanaTxHash: solana.txHash,
          explorerUrl:  solana.explorerUrl,
        });
        results.summary.totalMinted++;
        console.log(`[genesis] Relic minted: ${relic.id} → ${cid} | ${solana.txHash}`);
      } catch (err: any) {
        console.error(`[genesis] Relic ${relic.id} failed:`, err.message);
        results.relics.push({
          id: relic.id,
          cid: "",
          ipfsUrl: "",
          solanaTxHash: "",
          explorerUrl: "",
          error: err.message,
        });
        results.summary.totalFailed++;
      }
    }

    results.summary.durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    console.error("[genesis] Fatal error:", error);
    return NextResponse.json({ error: error.message || "Genesis mint failed" }, { status: 500 });
  }
}

// GET — genesis status / manifest preview
export async function GET() {
  const manifest = buildGenesisManifest();
  return NextResponse.json({
    ready:          true,
    protocol:       "Unykorn CWS Sovereign Registry",
    season:         "2026 — Omaha",
    totalAthletes:  CWS_ATHLETES.length,
    totalRelics:    CWS_RELICS.length,
    totalTeams:     Object.keys(CWS_TEAMS).length,
    network:        "solana:mainnet-beta",
    ipfsProvider:   "pinata",
    pinRegions:     ["FRA1", "NYC1"],
    manifest,
  });
}
