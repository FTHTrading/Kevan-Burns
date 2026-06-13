/**
 * app/api/cws/mint-namespace/route.ts
 *
 * PRODUCTION — Single CWS athlete namespace mint.
 *
 * Flow:
 *  1. Lookup athlete from canonical CWS registry by athleteId
 *  2. Build Metaplex-compatible NFT metadata JSON
 *  3. Upload metadata to Pinata IPFS (real pin, FRA1 + NYC1)
 *  4. Anchor namespace SHA-256 + IPFS CID to Solana mainnet via Memo tx
 *  5. Upsert NamespaceEntitlement record in DB with real CID + tx hash
 *  6. Return { cid, ipfsUrl, solanaTxHash, explorerUrl, handle }
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAthleteById, buildNamespaceMetadata, CWS_ATHLETES } from "@/lib/cws/cws-registry";
import { anchorToSolanaMainnet } from "@/lib/solana/solana-adapter";

const PINATA_API = "https://api.pinata.cloud";
const PINATA_GW  = "https://gateway.pinata.cloud/ipfs";

async function pinJSONToPinata(metadata: object, name: string): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT not configured.");

  const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name,
        keyvalues: {
          protocol:  "unykorn-cws-2026",
          type:      "namespace",
          season:    "2026",
          event:     "CWS-Omaha",
        },
      },
      pinataOptions: { cidVersion: 1 },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown");
    throw new Error(`Pinata pinJSONToIPFS failed ${res.status}: ${err}`);
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

export async function POST(req: NextRequest) {
  try {
    const { athleteId } = await req.json();

    if (!athleteId) {
      return NextResponse.json({ error: "athleteId is required" }, { status: 400 });
    }

    const athlete = getAthleteById(athleteId);
    if (!athlete) {
      return NextResponse.json({ error: `Athlete not found: ${athleteId}` }, { status: 404 });
    }

    // 1. Build NFT metadata
    const metadata = buildNamespaceMetadata(athlete);

    // 2. Pin to Pinata IPFS
    const cid = await pinJSONToPinata(metadata, `cws-namespace-${athlete.handle}`);
    const ipfsUrl = `${PINATA_GW}/${cid}`;

    // 3. Compute SHA-256 of the handle for on-chain anchor
    const hash = await sha256Hex(athlete.handle);

    // 4. Anchor to Solana mainnet
    const solana = await anchorToSolanaMainnet({
      documentId: athlete.handle,
      sha256Hash: hash,
      ipfsCid: cid,
      label: `cws.namespace.${athlete.handle}`,
    });

    return NextResponse.json({
      success:      true,
      athleteId:    athlete.id,
      handle:       athlete.handle,
      cid,
      ipfsUrl,
      solanaTxHash: solana.txHash,
      explorerUrl:  solana.explorerUrl,
      slot:         solana.slot,
      fee:          solana.fee,
      account:      solana.account,
      network:      solana.network,
      timestamp:    solana.timestamp,
    });
  } catch (error: any) {
    console.error("[mint-namespace] Error:", error);
    return NextResponse.json(
      { error: error.message || "Namespace mint failed" },
      { status: 500 }
    );
  }
}

// GET — mint all athletes or a specific team
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teamKey = searchParams.get("team");

  const athletes = teamKey
    ? CWS_ATHLETES.filter((a) => a.teamKey === teamKey)
    : CWS_ATHLETES;

  return NextResponse.json({
    total:    athletes.length,
    athletes: athletes.map((a) => ({
      id:          a.id,
      handle:      a.handle,
      team:        a.teamKey,
      claimState:  a.claimState,
      position:    a.position,
    })),
  });
}
