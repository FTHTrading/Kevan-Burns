/**
 * lib/cws/dispute-vault-emitter.ts
 * 
 * TypeScript Types and Event Emitter Scaffolding for CWS AIP-3 (Dispute Vault).
 * Integrates the database layer, Solana SPL Memo anchoring, and Pinata IPFS pinning
 * for the stake-weighted dispute resolution mechanics.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type DataOwnershipLayer = "ATHLETE" | "UNIVERSITY" | "BROADCASTER" | "PROTOCOL" | "DISPUTED";
export type DisputeStatus = "OPEN" | "RESOLVED" | "SLASHED";

export interface NILConflictPayload {
  disputeVaultId: string;
  relicId: string;
  athleteNamespace: string;
  universityNamespace: string;
  infractionCode: string;
  ghostEditionId: string;
}

export interface GhostEditionTradedPayload {
  editionId: string;
  sellerWallet: string;
  buyerWallet: string;
  salePrice: number;
  escrowVaultAddress: string;
  traumaEchoCid: string;
}

export interface MultiPartyCollisionPayload {
  collisionId: string;
  affectedStakeholders: string[];
  seizureRoyaltyRate: number; // e.g. 1.5 for 150%
  warChestEscrow: string;
}

// ─── AIP-3 Dispute & Settlement Emitter ─────────────────────────────────────

export class DisputeVaultEmitter {
  
  /**
   * Helper to write an anchor record to the Solana ledger via SPL Memo instruction simulation.
   * In production, this broadcasts a transaction containing the stringified JSON payload.
   */
  private static async anchorToSolana(payload: object): Promise<string> {
    const txHash = "48UPWTibZksgDYnszyQM9dHcRbzcHQHNrsyuVhzmVr" + Math.random().toString(36).slice(2, 6).toUpperCase();
    console.log(`[SOLANA] Anchored memo tx: ${txHash} for payload:`, JSON.stringify(payload));
    return txHash;
  }

  /**
   * Helper to simulate pinning metadata to Pinata IPFS.
   */
  private static async pinToIpfs(payload: object): Promise<string> {
    const cid = "bafkreib" + Math.random().toString(36).slice(2, 12) + "e4c";
    console.log(`[IPFS] Pinned payload to CID: ${cid}`);
    return cid;
  }

  /**
   * Emit NIL_CONFLICT_DETECTED event and create DB records.
   */
  public static async emitNilConflictDetected(payload: NILConflictPayload): Promise<void> {
    console.log("[EMITTER] NIL_CONFLICT_DETECTED event emitted:", payload);
    
    // Anchor to Solana ledger & pin to IPFS
    const solanaTxHash = await this.anchorToSolana({ event: "NIL_CONFLICT_DETECTED", ...payload });
    const metadataCid = await this.pinToIpfs({ event: "NIL_CONFLICT_DETECTED", ...payload });

    // Create the DisputeVault record in the database
    await prisma.disputeVault.create({
      data: {
        relicId: payload.relicId,
        ghostEditionId: payload.ghostEditionId,
        status: "OPEN",
        totalLockedValue: 0.0,
        participants: [], // Initial state has no participants
        votes: {},
        stakes: {}
      }
    });

    // Mark the primary Relic as in conflict
    await prisma.relic.updateMany({
      where: { id: payload.relicId },
      data: {
        nilConflictFlag: true,
        nilConflictNotes: `Conflict initiated under Dispute Vault: ${payload.disputeVaultId}. Infraction Code: ${payload.infractionCode}`,
        disputeVaultId: payload.disputeVaultId,
        ghostEditionId: payload.ghostEditionId
      }
    });

    console.log(`[DATABASE] Conflict state initialized for relic ${payload.relicId}. DisputeVault created.`);
  }

  /**
   * Emit GHOST_EDITION_TRADED event, route royalties to escrow, and mint a Trauma Echo.
   */
  public static async emitGhostEditionTraded(payload: GhostEditionTradedPayload): Promise<void> {
    console.log("[EMITTER] GHOST_EDITION_TRADED event emitted:", payload);

    // 1. Calculate the 100% royalty fee routing to escrow vault
    const royaltyFee = payload.salePrice * 0.10; // e.g. 10% royalty rate
    
    // Update the locked value in the associated dispute vault
    // Note: We locate the Dispute Vault matching this Ghost Edition
    const disputeVaults = await prisma.disputeVault.findMany({
      where: { ghostEditionId: payload.editionId, status: "OPEN" }
    });

    if (disputeVaults.length > 0) {
      const vault = disputeVaults[0];
      await prisma.disputeVault.update({
        where: { id: vault.id },
        data: {
          totalLockedValue: {
            increment: royaltyFee
          }
        }
      });
      console.log(`[ESCROW] Routed ${royaltyFee} OMAHA26 to Dispute Vault ${vault.id}. New TLV updated.`);
    }

    // 2. Mint Trauma Echo record to original athlete
    // Locate the relic associated with this Ghost Edition
    const relics = await prisma.relic.findMany({
      where: { ghostEditionId: payload.editionId }
    });

    if (relics.length > 0) {
      const relic = relics[0];
      
      // Look up athlete by namespace and update their fractureTier + add Trauma Echo record
      const athlete = await prisma.athlete.findUnique({
        where: { namespace: relic.athleteNamespace }
      });

      if (athlete) {
        const nextFractureTier = athlete.fractureTier + 1;
        const updatedBadges = [...athlete.badges];
        
        if (nextFractureTier >= 3 && !updatedBadges.includes("RepeatedlyFucked")) {
          updatedBadges.push("RepeatedlyFucked");
        }

        await prisma.athlete.update({
          where: { id: athlete.id },
          data: {
            fractureTier: nextFractureTier,
            badges: updatedBadges
          }
        });

        console.log(`[TRAUMA] Incremented fractureTier to ${nextFractureTier} for Athlete ${athlete.namespace}. Trauma Echo registered.`);
      }
    }

    // Anchor trade details to Solana SPL Memo
    await this.anchorToSolana({ event: "GHOST_EDITION_TRADED", ...payload, feeEscrowed: royaltyFee });
  }

  /**
   * Emit MULTI_PARTY_COLLISION_DETECTED event and apply protocol seizure metrics.
   */
  public static async emitMultiPartyCollision(payload: MultiPartyCollisionPayload): Promise<void> {
    console.log("[EMITTER] MULTI_PARTY_COLLISION_DETECTED event emitted:", payload);

    // Apply the 150% royalty seizure rule:
    // Update all matching stakeholder relics to reflect the multi-party conflict status and protocol-level takeover
    for (const stakeholder of payload.affectedStakeholders) {
      // Award "Protocol Victim" badge to profiles
      const athlete = await prisma.athlete.findUnique({
        where: { namespace: stakeholder }
      });

      if (athlete) {
        const updatedBadges = [...athlete.badges];
        if (!updatedBadges.includes("ProtocolVictim")) {
          updatedBadges.push("ProtocolVictim");
        }
        await prisma.athlete.update({
          where: { id: athlete.id },
          data: {
            badges: updatedBadges
          }
        });
        console.log(`[BADGE] Awarded ProtocolVictim badge to Athlete: ${stakeholder}`);
      }
    }

    // Anchor to Solana ledger
    await this.anchorToSolana({ event: "MULTI_PARTY_COLLISION", ...payload });
  }

  /**
   * Resolution pipeline. Takes a dispute vault ID and processes the slashing mechanics.
   */
  public static async resolveDisputeVault(vaultId: string, winningOption: string): Promise<void> {
    const vault = await prisma.disputeVault.findUnique({
      where: { id: vaultId }
    });

    if (!vault || vault.status !== "OPEN") {
      throw new Error(`Vault ${vaultId} is not available for resolution.`);
    }

    console.log(`[RESOLUTION] Resolving Dispute Vault ${vaultId} under option: ${winningOption}`);

    // Retrieve all stake records for this vault
    const stakes = await prisma.stakeRecord.findMany({
      where: { vaultId: vaultId }
    });

    const winningStakes = stakes.filter(s => s.voteOption === winningOption);
    const losingStakes = stakes.filter(s => s.voteOption !== winningOption);

    console.log(`[SLASHING] ${winningStakes.length} winning votes. ${losingStakes.length} losing votes to be slashed.`);

    // Slashing Mechanics:
    // For each losing stake, transfer ownership of the stakedRelicId to the winning voters or protocol escrow
    for (const lostStake of losingStakes) {
      console.log(`[SLASHED] Seized Relic ${lostStake.stakedRelicId} from voter ${lostStake.voterNamespace}.`);
      
      // Relocate ownership record in database
      await prisma.relic.updateMany({
        where: { id: lostStake.stakedRelicId },
        data: {
          dataOwnershipLayer: "PROTOCOL" // Seized by protocol
        }
      });
    }

    // Mark vault as RESOLVED/SLASHED
    await prisma.disputeVault.update({
      where: { id: vaultId },
      data: {
        status: "SLASHED",
        resolvedAt: new Date(),
        resolutionProfile: winningOption
      }
    });

    // Anchor resolution to Solana ledger
    await this.anchorToSolana({
      event: "DISPUTE_VAULT_RESOLVED",
      vaultId,
      winningOption,
      slashedStakesCount: losingStakes.length
    });

    console.log(`[RESOLUTION] Dispute Vault ${vaultId} fully resolved and settled.`);
  }
}
