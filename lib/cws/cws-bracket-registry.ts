/**
 * lib/cws/cws-bracket-registry.ts
 *
 * 2026 Men's College World Series (CWS) Double-Elimination Bracket State.
 * Seeds all 15 matches, including completed scores, upcoming matches,
 * elimination routes, and Solana Mainnet Oracle signatures.
 */

import { TeamKey } from "./cws-registry";

export type BracketType = "bracket1" | "bracket2" | "elimination" | "championship";

export interface CWSMatch {
  id: string;
  name: string;
  bracketType: BracketType;
  round: number; // 1, 2, 3, or finals
  team1Key: TeamKey | "TBD";
  team2Key: TeamKey | "TBD";
  team1Score?: number;
  team2Score?: number;
  status: "scheduled" | "live" | "completed";
  winnerKey?: TeamKey;
  loserKey?: TeamKey;
  scheduledTime: string;
  solanaTxHash?: string;
  explorerUrl?: string;
  oracleSignature?: string;
  attestedAt?: string;
}

export const CWS_MATCHES: CWSMatch[] = [
  // ─── Bracket 1 (Double Elimination) ─────────────────────────────────────────
  {
    id: "cws_g1_wvu_troy",
    name: "CWS Game 1: WVU vs Troy",
    bracketType: "bracket1",
    round: 1,
    team1Key: "wvu",
    team2Key: "troy",
    team1Score: 7,
    team2Score: 5,
    status: "completed",
    winnerKey: "wvu",
    loserKey: "troy",
    scheduledTime: "Friday, June 12, 2026",
    solanaTxHash: "29XcLA4S1QN4SwS7sPyEE9R6RuSBNHbMvNX3AjY1umzaBTCsaUZWNxDtZFgYAQLJCyLkdH6At1Xg3XJtjEidpdLq",
    explorerUrl: "https://solscan.io/tx/29XcLA4S1QN4SwS7sPyEE9R6RuSBNHbMvNX3AjY1umzaBTCsaUZWNxDtZFgYAQLJCyLkdH6At1Xg3XJtjEidpdLq",
    oracleSignature: "4Kr45L2G4jY63X4b2MqcfbUa4bKW7roeaJDnTUyJUV2z74CgLkKVX26djbCQG3SxU4aG1xo7jTMREyBg6d4XCJtc",
    attestedAt: "2026-06-13T01:30:00Z",
  },
  {
    id: "cws_g2_uga_bama",
    name: "CWS Game 2: Georgia vs Alabama",
    bracketType: "bracket1",
    round: 1,
    team1Key: "georgia",
    team2Key: "alabama",
    team1Score: 5,
    team2Score: 4,
    status: "completed",
    winnerKey: "georgia",
    loserKey: "alabama",
    scheduledTime: "Friday, June 12, 2026",
    solanaTxHash: "48UPWTibZksgDYnszyQM9dHcRbzcHQHNrsyuVhzmVr7fTKN82iWEwSfAMXidZTxfzt7sq8WtH3CprU5dUKbiBGCE",
    explorerUrl: "https://solscan.io/tx/48UPWTibZksgDYnszyQM9dHcRbzcHQHNrsyuVhzmVr7fTKN82iWEwSfAMXidZTxfzt7sq8WtH3CprU5dUKbiBGCE",
    oracleSignature: "HMAC_5oPutzGiAPNNiwh39a2C9LaTM4sALE7R4NhhWbppxPKtBMti56Yp743pFR8EFCDU6oAAWeDThSKGUVu3zGgU",
    attestedAt: "2026-06-13T02:00:00Z",
  },
  {
    id: "cws_g5_wvu_uga",
    name: "CWS Game 5: WVU vs Georgia (Winners' Bracket)",
    bracketType: "bracket1",
    round: 2,
    team1Key: "wvu",
    team2Key: "georgia",
    status: "scheduled",
    scheduledTime: "Sunday, June 14, 2026",
  },

  // ─── Bracket 2 (Double Elimination) ─────────────────────────────────────────
  {
    id: "cws_g3_unc_olemiss",
    name: "CWS Game 3: North Carolina vs Ole Miss",
    bracketType: "bracket2",
    round: 1,
    team1Key: "unc",
    team2Key: "olemiss",
    team1Score: 6,
    team2Score: 3,
    status: "completed",
    winnerKey: "unc",
    loserKey: "olemiss",
    scheduledTime: "Saturday, June 13, 2026",
    solanaTxHash: "3Y1FHXL2pZye3QsCWXC4nVShrHvp59MCd6bqrV6LTCzjJTX5KTsmGymzKSnqqHLDxTiz76UmeYSZ8MSEZ7WDPBHx",
    explorerUrl: "https://solscan.io/tx/3Y1FHXL2pZye3QsCWXC4nVShrHvp59MCd6bqrV6LTCzjJTX5KTsmGymzKSnqqHLDxTiz76UmeYSZ8MSEZ7WDPBHx",
    oracleSignature: "HMAC_ooPvNcf6R2T3QmN6TWim258osiYuYLEq54D11b7YXJWytN9YUr6pAAbLYinj3EKzUo9Njg3Za2g2Fo9FRf1R",
    attestedAt: "2026-06-13T02:30:00Z",
  },
  {
    id: "cws_g4_ou_texas",
    name: "CWS Game 4: Oklahoma vs Texas",
    bracketType: "bracket2",
    round: 1,
    team1Key: "oklahoma",
    team2Key: "texas",
    status: "live",
    team1Score: 2,
    team2Score: 2,
    scheduledTime: "Saturday, June 13, 2026",
  },
  {
    id: "cws_g6_unc_tbd",
    name: "CWS Game 6: UNC vs Winners' Game 4",
    bracketType: "bracket2",
    round: 2,
    team1Key: "unc",
    team2Key: "TBD",
    status: "scheduled",
    scheduledTime: "Sunday, June 14, 2026",
  },

  // ─── Bracket 1 & 2 Elimination Brackets ────────────────────────────────────
  {
    id: "cws_g7_troy_bama",
    name: "CWS Game 7: Troy vs Alabama (Elimination Game)",
    bracketType: "elimination",
    round: 1,
    team1Key: "troy",
    team2Key: "alabama",
    status: "scheduled",
    scheduledTime: "Sunday, June 14, 2026",
  },
  {
    id: "cws_g8_olemiss_tbd",
    name: "CWS Game 8: Ole Miss vs Loser Game 4 (Elimination Game)",
    bracketType: "elimination",
    round: 1,
    team1Key: "olemiss",
    team2Key: "TBD",
    status: "scheduled",
    scheduledTime: "Sunday, June 14, 2026",
  },
  {
    id: "cws_g9_loser5_winner7",
    name: "CWS Game 9: Loser Game 5 vs Winner Game 7",
    bracketType: "elimination",
    round: 2,
    team1Key: "TBD",
    team2Key: "TBD",
    status: "scheduled",
    scheduledTime: "Monday, June 15, 2026",
  },
  {
    id: "cws_g10_loser6_winner8",
    name: "CWS Game 10: Loser Game 6 vs Winner Game 8",
    bracketType: "elimination",
    round: 2,
    team1Key: "TBD",
    team2Key: "TBD",
    status: "scheduled",
    scheduledTime: "Monday, June 15, 2026",
  },
  {
    id: "cws_g11_winner5_winner9",
    name: "CWS Game 11: Winner Game 5 vs Winner Game 9 (Bracket 1 Final)",
    bracketType: "elimination",
    round: 3,
    team1Key: "TBD",
    team2Key: "TBD",
    status: "scheduled",
    scheduledTime: "Wednesday, June 17, 2026",
  },
  {
    id: "cws_g12_winner6_winner10",
    name: "CWS Game 12: Winner Game 6 vs Winner Game 10 (Bracket 2 Final)",
    bracketType: "elimination",
    round: 3,
    team1Key: "TBD",
    team2Key: "TBD",
    status: "scheduled",
    scheduledTime: "Wednesday, June 17, 2026",
  },

  // ─── CWS Finals (Best of 3) ────────────────────────────────────────────────
  {
    id: "cws_f1_champ",
    name: "CWS Championship Series: Game 1",
    bracketType: "championship",
    round: 4,
    team1Key: "TBD",
    team2Key: "TBD",
    status: "scheduled",
    scheduledTime: "Saturday, June 20, 2026",
  },
  {
    id: "cws_f2_champ",
    name: "CWS Championship Series: Game 2",
    bracketType: "championship",
    round: 4,
    team1Key: "TBD",
    team2Key: "TBD",
    status: "scheduled",
    scheduledTime: "Sunday, June 21, 2026",
  },
  {
    id: "cws_f3_champ",
    name: "CWS Championship Series: Game 3 (If Needed)",
    bracketType: "championship",
    round: 4,
    team1Key: "TBD",
    team2Key: "TBD",
    status: "scheduled",
    scheduledTime: "Monday, June 22, 2026",
  },
];
