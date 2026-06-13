/**
 * app/api/cws/root/route.ts
 *
 * PRODUCTION — CWS Genesis Root Manifest endpoint.
 * Returns the full namespace tree for cws.omaha26 registry root.
 * Also supports fetching the live pinned IPFS manifest if rootCid is provided.
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  buildGenesisManifest,
  CWS_ATHLETES,
  CWS_RELICS,
  CWS_TEAMS,
  TeamKey,
} from "@/lib/cws/cws-registry";

import mintLog from "../../../../cws-genesis-mint-log.json";

const PINATA_GW = "https://gateway.pinata.cloud/ipfs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rootCid  = searchParams.get("cid");
  const teamKey  = searchParams.get("team") as TeamKey | null;
  const format   = searchParams.get("format") ?? "full";

  // If a root CID is provided, proxy the live IPFS manifest
  if (rootCid) {
    const jwt = process.env.PINATA_JWT;
    const headers: Record<string, string> = jwt
      ? { Authorization: `Bearer ${jwt}` }
      : {};

    try {
      const res  = await fetch(`${PINATA_GW}/${rootCid}`, { headers });
      if (!res.ok) throw new Error(`IPFS fetch failed: ${res.status}`);
      const data = await res.json();
      return NextResponse.json({ success: true, source: "ipfs", cid: rootCid, data });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
  }

  // Full live manifest from canonical registry
  const manifest = buildGenesisManifest();

  if (format === "summary") {
    return NextResponse.json({
      root:           "cws.omaha26",
      protocol:       "Unykorn Sovereign CWS Protocol",
      season:         "2026",
      network:        "solana:mainnet-beta",
      ipfsProvider:   "pinata",
      totalAthletes:  CWS_ATHLETES.length,
      totalRelics:    CWS_RELICS.length,
      totalTeams:     Object.keys(CWS_TEAMS).length,
      teams:          Object.keys(CWS_TEAMS),
      mintLogStatus:  mintLog ? "minted" : "idle",
      rootCid:        mintLog?.rootManifest?.cid ?? null,
    });
  }

  if (teamKey && CWS_TEAMS[teamKey]) {
    const team     = CWS_TEAMS[teamKey];
    const athletes = CWS_ATHLETES.filter((a) => a.teamKey === teamKey);
    const relics   = CWS_RELICS.filter((r) => r.teamKey === teamKey);

    return NextResponse.json({
      root:        `${team.suffix}.cws.omaha26`,
      team:        team.name,
      suffix:      team.suffix,
      seed:        team.seed,
      conference:  team.conference,
      nilWorth:    team.nilWorth,
      odds:        team.championshipOdds,
      namespaces:  athletes.map((a) => {
        // Find matching on-chain data in mint log
        const logNs = mintLog?.namespaces?.find((n: any) => n.handle === a.handle);
        return {
          id:         a.id,
          handle:     a.handle,
          name:       a.name,
          position:   a.position,
          claimState: a.claimState,
          milestones: a.milestones,
          metrics:    a.metrics,
          cid:          logNs?.cid ?? null,
          ipfsUrl:      logNs?.ipfsUrl ?? null,
          solanaTxHash: logNs?.solanaTxHash ?? null,
          explorerUrl:  logNs?.explorerUrl ?? null,
        };
      }),
      relics: relics.map((r) => {
        const logRelic = mintLog?.relics?.find((re: any) => re.id === r.id);
        return {
          id:           r.id,
          name:         r.name,
          rarity:       r.rarity,
          price:        r.price,
          goldGrains:   r.backingGoldGrains,
          gameRef:      r.gameRef,
          cid:          logRelic?.cid ?? null,
          ipfsUrl:      logRelic?.ipfsUrl ?? null,
          solanaTxHash: logRelic?.solanaTxHash ?? null,
          explorerUrl:  logRelic?.explorerUrl ?? null,
        };
      }),
    });
  }

  // If we have a mint log, return it directly but ensure we tell the client we have the full log
  if (mintLog) {
    return NextResponse.json({
      ...mintLog,
      success: true,
      source:  "onchain-mint-log",
    });
  }

  return NextResponse.json({
    success: true,
    source:  "canonical-registry",
    ...manifest,
  });
}
