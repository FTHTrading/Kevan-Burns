/**
 * app/api/cws/mint-relic/route.ts
 *
 * PRODUCTION — Single CWS Moment Relic SFT mint.
 *
 * Flow:
 *  1. Lookup relic from canonical CWS registry by relicId
 *  2. Build Metaplex-compatible SFT metadata JSON
 *  3. Upload metadata to Pinata IPFS (real pin)
 *  4. Anchor relic SHA-256 + CID to Solana mainnet via Memo tx
 *  5. Return { cid, ipfsUrl, solanaTxHash, explorerUrl }
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getRelicById, buildRelicMetadata, CWS_RELICS } from "@/lib/cws/cws-registry";
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
          protocol: "unykorn-cws-2026",
          type:     "relic",
          season:   "2026",
          event:    "CWS-Omaha",
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
    const body = await req.json().catch(() => ({}));
    const { relicId, customRelic, athleteWallet } = body;

    if (!relicId) {
      return NextResponse.json({ error: "relicId is required" }, { status: 400 });
    }

    let relic: any = getRelicById(relicId);
    let metadata: any;

    if (!relic) {
      if (customRelic && customRelic.id === relicId) {
        relic = customRelic;
        const CWS_TEAMS_LOCAL: Record<string, any> = {
          georgia: { name: "Georgia Bulldogs", conference: "SEC" },
          troy: { name: "Troy Trojans", conference: "Sun Belt" },
          wvu: { name: "West Virginia Mountaineers", conference: "Big 12" },
          unc: { name: "North Carolina Tar Heels", conference: "ACC" },
          olemiss: { name: "Ole Miss Rebels", conference: "SEC" },
          alabama: { name: "Alabama Crimson Tide", conference: "SEC" },
          oklahoma: { name: "Oklahoma Sooners", conference: "Big 12" },
          texas: { name: "Texas Longhorns", conference: "SEC" }
        };
        const team = CWS_TEAMS_LOCAL[relic.teamKey] || { name: "CWS Team", conference: "NCAA" };
        metadata = {
          name: relic.name,
          symbol: "CWSRELIC",
          description: relic.description,
          image: "https://images.unsplash.com/photo-1544045560-7297be6472ff?w=800&q=90",
          external_url: "https://unykorn.ai/cws",
          attributes: [
            { trait_type: "Season", value: "2026 CWS — Omaha" },
            { trait_type: "Team", value: team.name },
            { trait_type: "Athlete Namespace", value: relic.athleteHandle },
            { trait_type: "Rarity", value: relic.rarity },
            { trait_type: "Game Reference", value: relic.gameRef },
            { trait_type: "Backing Gold Grains", value: relic.backingGoldGrains },
            { trait_type: "Price (OMAHA26)", value: relic.price },
            { trait_type: "Token Type", value: "SFT — Semi-Fungible Moment Relic" },
            { trait_type: "Validation Source", value: relic.validationSource || "None" },
          ],
          properties: {
            category: "relic",
            creators: [{ address: "57VqZpdg5jqpV5uBi1KQScYNifMdH6By2HCBnzUyuPdW", share: 100 }],
            files: [{ uri: "https://images.unsplash.com/photo-1544045560-7297be6472ff?w=800&q=90", type: "image/jpeg" }],
          },
        };
      } else {
        return NextResponse.json({ error: `Relic not found: ${relicId}` }, { status: 404 });
      }
    } else {
      metadata = buildRelicMetadata(relic);
    }

    // Enforce 50/50 Creator Royalty Split if Athlete Wallet is bound (AIP-2 compliance)
    if (athleteWallet) {
      metadata.properties.creators = [
        { address: athleteWallet, share: 50 },
        { address: "57VqZpdg5jqpV5uBi1KQScYNifMdH6By2HCBnzUyuPdW", share: 50 }
      ];
      metadata.attributes = metadata.attributes || [];
      metadata.attributes.push({ trait_type: "Royalty Split", value: "50% Athlete / 50% Unykorn" });
      metadata.attributes.push({ trait_type: "Athlete Bound Wallet", value: athleteWallet });
    }

    // 2. Pin to Pinata IPFS
    const cid = await pinJSONToPinata(metadata, `cws-relic-${relic.id}`);
    const ipfsUrl = `${PINATA_GW}/${cid}`;

    // 3. Compute SHA-256 for on-chain anchor
    const hash = await sha256Hex(`${relic.id}:${relic.athleteHandle}:${relic.gameRef}`);

    // 4. Anchor to Solana mainnet
    const solana = await anchorToSolanaMainnet({
      documentId: relic.id,
      sha256Hash: hash,
      ipfsCid: cid,
      label: `cws.relic.${relic.id}`,
    });

    return NextResponse.json({
      success:      true,
      relicId:      relic.id,
      name:         relic.name,
      rarity:       relic.rarity,
      cid,
      ipfsUrl,
      solanaTxHash: solana.txHash,
      explorerUrl:  solana.explorerUrl,
      slot:         solana.slot,
      fee:          solana.fee,
      network:      solana.network,
      timestamp:    solana.timestamp,
    });
  } catch (error: any) {
    console.error("[mint-relic] Error:", error);
    return NextResponse.json(
      { error: error.message || "Relic mint failed" },
      { status: 500 }
    );
  }
}

// GET — list all relics
export async function GET() {
  return NextResponse.json({
    total:  CWS_RELICS.length,
    relics: CWS_RELICS.map((r) => ({
      id:             r.id,
      name:           r.name,
      athleteHandle:  r.athleteHandle,
      team:           r.teamKey,
      rarity:         r.rarity,
      price:          r.price,
      goldGrains:     r.backingGoldGrains,
    })),
  });
}
