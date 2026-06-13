/**
 * app/api/cws/oracle/attest/route.ts
 *
 * PRODUCTION — Unykorn Cryptographic Oracle Attestation Endpoint.
 *
 * Receives a verified CWS match outcome, signs it using HMAC-SHA256 with
 * the protocol's master key, pins the signed oracle attestation to Pinata IPFS,
 * and anchors the final consensus state to Solana Mainnet-Beta.
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { anchorToSolanaMainnet } from "@/lib/solana/solana-adapter";

const PINATA_API = "https://api.pinata.cloud";
const PINATA_GW  = "https://gateway.pinata.cloud/ipfs";

async function pinJSON(content: object, name: string, type: string): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT not configured.");

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
          oracle:   "true",
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

async function signHMAC(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { matchId, winnerKey, team1Score, team2Score, scoreString, statsSummary } = body;

    if (!matchId || !winnerKey || scoreString === undefined) {
      return NextResponse.json(
        { error: "matchId, winnerKey, and scoreString are required." },
        { status: 400 }
      );
    }

    const secretKey = process.env.VAULT_MASTER_KEY || "unykorn_fallback_secret_key";
    
    // 1. Construct tamper-proof message
    const message = `${matchId}:${winnerKey}:${scoreString}:${statsSummary || ""}:${Date.now()}`;
    
    // 2. Cryptographic internal truth attestation via HMAC-SHA256 signature
    const signature = await signHMAC(message, secretKey);

    // 3. Build Oracle Attestation Metadata
    const oracleMetadata = {
      name: `Unykorn Oracle Attestation — ${matchId}`,
      description: `Cryptographic consensus attestation for CWS 2026 match ${matchId}. Asserts winner: ${winnerKey} with score "${scoreString}". Signed by Unykorn Master Key Authority.`,
      image: "https://images.unsplash.com/photo-1544045560-7297be6472ff?w=800&q=90",
      external_url: "https://unykorn.ai/cws",
      attributes: [
        { trait_type: "Match ID", value: matchId },
        { trait_type: "Winner Key", value: winnerKey },
        { trait_type: "Team 1 Score", value: Number(team1Score || 0) },
        { trait_type: "Team 2 Score", value: Number(team2Score || 0) },
        { trait_type: "Score String", value: scoreString },
        { trait_type: "Stats Summary", value: statsSummary || "N/A" },
        { trait_type: "Oracle Signature (HMAC)", value: signature },
        { trait_type: "Attestation Timestamp", value: new Date().toISOString() },
        { trait_type: "Consensus Standard", value: "Unykorn Decoupled attestation v1" }
      ]
    };

    // 4. Pin Oracle Attestation JSON to Pinata IPFS
    const cid = await pinJSON(oracleMetadata, `cws-oracle-attest-${matchId}`, "oracle-attestation");
    const ipfsUrl = `${PINATA_GW}/${cid}`;

    // 5. Anchor signature + score hash to Solana Mainnet-Beta via SPL Memo
    const solana = await anchorToSolanaMainnet({
      documentId: matchId,
      sha256Hash: signature, // Anchor the cryptographic signature
      ipfsCid: cid,
      label: `cws.oracle.attest.${matchId}`,
    });

    return NextResponse.json({
      success: true,
      matchId,
      winnerKey,
      scoreString,
      signature,
      cid,
      ipfsUrl,
      solanaTxHash: solana.txHash,
      explorerUrl: solana.explorerUrl,
      slot: solana.slot,
      fee: solana.fee,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("[oracle-attest] Error:", err);
    return NextResponse.json(
      { error: err.message || "Oracle attestation failed" },
      { status: 500 }
    );
  }
}
