/**
 * lib/cws/cws-registry.ts
 *
 * Sovereign CWS 2026 Registry — Canonical Athlete Namespace Definitions
 * Builds Metaplex-compatible NFT metadata JSON for:
 *   - Athlete namespaces (pre-minted root identity SFTs)
 *   - Moment Relic SFTs (CWS game highlights)
 *   - Team Collection manifests
 *   - Genesis Root manifest (the namespace tree root)
 *
 * All metadata is ready for Pinata IPFS upload + Solana hash anchoring.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type TeamKey = "georgia" | "troy" | "wvu" | "unc" | "olemiss" | "alabama" | "oklahoma" | "texas";
export type Rarity = "Common" | "Rare" | "Epic" | "Legendary";
export type ClaimState = "reserved" | "claimable" | "claimed";

export interface CWSAthlete {
  id: string;
  name: string;
  role: "player" | "coach";
  handle: string;
  suffix: string;
  teamKey: TeamKey;
  claimState: ClaimState;
  position?: string;
  metrics: Record<string, string | number | undefined>;
  milestones: string[];
}

export interface CWSRelic {
  id: string;
  name: string;
  athleteHandle: string;
  teamKey: TeamKey;
  gameRef: string;
  rarity: Rarity;
  price: number;
  backingGoldGrains: number;
  description: string;
}

export interface CWSTeam {
  name: string;
  suffix: string;
  seed: string;
  conference: string;
  nilWorth: string;
  record?: string;
  championshipOdds: string;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  properties: {
    category: string;
    creators: Array<{ address: string; share: number }>;
    files: Array<{ uri: string; type: string }>;
  };
}

// ─── Team Registry ───────────────────────────────────────────────────────────

export const CWS_TEAMS: Record<TeamKey, CWSTeam> = {
  georgia: {
    name: "Georgia Bulldogs",
    suffix: ".dawgs",
    seed: "No. 3 Seed / SEC Champion",
    conference: "SEC",
    nilWorth: "$450,000",
    championshipOdds: "+280",
  },
  troy: {
    name: "Troy Trojans",
    suffix: ".trojans",
    seed: "Sun Belt Champion",
    conference: "Sun Belt",
    nilWorth: "$145,000",
    record: "38-31",
    championshipOdds: "+1200",
  },
  wvu: {
    name: "West Virginia Mountaineers",
    suffix: ".mountaineers",
    seed: "No. 16 Seed / Big 12 Regular Season",
    conference: "Big 12",
    nilWorth: "$180,000",
    record: "46-15",
    championshipOdds: "+900",
  },
  unc: {
    name: "North Carolina Tar Heels",
    suffix: ".tarheels",
    seed: "No. 5 Seed / ACC Champion",
    conference: "ACC",
    nilWorth: "$320,000",
    championshipOdds: "+550",
  },
  olemiss: {
    name: "Ole Miss Rebels",
    suffix: ".rebels",
    seed: "SEC Wildcard Pool",
    conference: "SEC",
    nilWorth: "$185,000",
    championshipOdds: "+1400",
  },
  alabama: {
    name: "Alabama Crimson Tide",
    suffix: ".tide",
    seed: "No. 7 Seed / SEC Runner-up",
    conference: "SEC",
    nilWorth: "$220,000",
    championshipOdds: "+650",
  },
  oklahoma: {
    name: "Oklahoma Sooners",
    suffix: ".sooners",
    seed: "Big 12 Tournament Champion",
    conference: "Big 12",
    nilWorth: "$195,000",
    championshipOdds: "+800",
  },
  texas: {
    name: "Texas Longhorns",
    suffix: ".longhorns",
    seed: "No. 6 Seed / SEC Runner-up",
    conference: "SEC",
    nilWorth: "$310,000",
    championshipOdds: "+400",
  },
};

// ─── Canonical Athlete Registry ──────────────────────────────────────────────

export const CWS_ATHLETES: CWSAthlete[] = [
  // ── Georgia Bulldogs ──────────────────────────────────────────────────────
  {
    id: "ns_uga_dj",
    name: "Daniel Jackson",
    role: "player",
    handle: "daniel.jackson.dawgs",
    suffix: ".dawgs",
    teamKey: "georgia",
    claimState: "reserved",
    position: "OF",
    metrics: { battingAvg: ".385", homeRuns: 28, rbis: 82, stolenBases: 15 },
    milestones: ["Dick Howser Trophy Winner", "SEC Player of the Year", "Omaha Qualified"],
  },
  {
    id: "ns_uga_kb",
    name: "Kolby Branch",
    role: "player",
    handle: "kolby.branch.dawgs",
    suffix: ".dawgs",
    teamKey: "georgia",
    claimState: "claimed",
    position: "SS",
    metrics: { battingAvg: ".295", homeRuns: 18, rbis: 58 },
    milestones: ["SEC All-Defensive Shortstop"],
  },
  {
    id: "ns_uga_jv",
    name: "Joey Volchko",
    role: "player",
    handle: "joey.volchko.dawgs",
    suffix: ".dawgs",
    teamKey: "georgia",
    claimState: "claimable",
    position: "SP",
    metrics: { era: "3.24", wins: 9, strikeouts: 104 },
    milestones: ["Stanford Transfer Starter", "SEC Pitcher of the Week"],
  },
  {
    id: "ns_uga_cc",
    name: "Charlie Condon",
    role: "player",
    handle: "charlie.condon.dawgs",
    suffix: ".dawgs",
    teamKey: "georgia",
    claimState: "reserved",
    position: "OF/1B",
    metrics: { battingAvg: ".433", homeRuns: 37, rbis: 78 },
    milestones: ["Golden Spikes Award Winner", "SEC Triple Crown Contender"],
  },
  {
    id: "ns_uga_cc2",
    name: "Corey Collins",
    role: "player",
    handle: "corey.collins.dawgs",
    suffix: ".dawgs",
    teamKey: "georgia",
    claimState: "claimable",
    position: "C/OF",
    metrics: { battingAvg: ".354", homeRuns: 20, rbis: 58 },
    milestones: ["SEC First-Team Catcher", "On-Base % Leader (.574)"],
  },
  {
    id: "ns_uga_sa",
    name: "Slate Alford",
    role: "player",
    handle: "slate.alford.dawgs",
    suffix: ".dawgs",
    teamKey: "georgia",
    claimState: "reserved",
    position: "3B",
    metrics: { battingAvg: ".300", homeRuns: 17, rbis: 69 },
    milestones: ["Omaha Opening Game Hero"],
  },

  // ── West Virginia Mountaineers ────────────────────────────────────────────
  {
    id: "ns_wvu_ag",
    name: "Armani Guzman",
    role: "player",
    handle: "armani.guzman.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "claimed",
    position: "CF",
    metrics: { battingAvg: ".352", homeRuns: 11, stolenBases: 39, rbis: 48 },
    milestones: [
      "CWS Steal of Home — First Since 2000",
      "WVU Single-Season Stolen Base Record",
      "Regional MVP",
      "First Run of 2026 CWS",
      "RBI Double in CWS Game 1",
    ],
  },
  {
    id: "ns_wvu_th",
    name: "Tyrus Hall",
    role: "player",
    handle: "tyrus.hall.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "claimed",
    position: "3B",
    metrics: { battingAvg: ".312", homeRuns: 7, rbis: 52, hits: 2 },
    milestones: [
      "CWS Game 1 Hero — 4 RBIs",
      "8th Inning 2-Run Walk-Off Single vs Troy",
      "2-Run Double Earlier in Game 1",
    ],
  },
  {
    id: "ns_wvu_ik",
    name: "Ian Korn",
    role: "player",
    handle: "ian.korn.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "reserved",
    position: "RP",
    metrics: { era: "2.84", wins: 7, saves: 4, strikeouts: 78 },
    milestones: [
      "CWS Game 1 Winner (Record: 6-1)",
      "6 IP Relief — 2H, 1ER, 2K vs Troy",
      "All-Big 12 First Team",
    ],
  },
  {
    id: "ns_wvu_ss",
    name: "Sean Smith",
    role: "player",
    handle: "sean.smith.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "claimable",
    position: "DH",
    metrics: { battingAvg: ".298", homeRuns: 14, rbis: 45 },
    milestones: ["CWS Game 1 Solo HR (3rd Inning)", "DH/Utility Power Bat"],
  },
  {
    id: "ns_wvu_cc",
    name: "Chansen Cole",
    role: "player",
    handle: "chansen.cole.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "reserved",
    position: "SP",
    metrics: { era: "4.12", wins: 9, strikeouts: 88 },
    milestones: ["WVU CWS Opening Game Starter", "Big 12 Season Workhorse"],
  },
  {
    id: "ns_wvu_bm",
    name: "Ben McDougal",
    role: "player",
    handle: "ben.mcdougal.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "reserved",
    position: "RP/CL",
    metrics: { era: "2.15", saves: 8, strikeouts: 42, wins: 3 },
    milestones: [
      "CWS Game 1 Save — Foul-Out to End Troy Threat",
      "LHP Veteran Closer",
      "NCBWA Stopper Watchlist",
    ],
  },
  {
    id: "ns_wvu_bw",
    name: "Brock Wills",
    role: "player",
    handle: "brock.wills.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "reserved",
    position: "OF",
    metrics: { battingAvg: ".278", homeRuns: 8, rbis: 38, stolenBases: 12 },
    milestones: ["UNC Wilmington Transfer", "WVU Outfield Anchor"],
  },
  {
    id: "ns_wvu_ps",
    name: "Paul Schoenfeld",
    role: "player",
    handle: "paul.schoenfeld.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "reserved",
    position: "OF",
    metrics: { battingAvg: ".302", homeRuns: 9, rbis: 41, stolenBases: 9 },
    milestones: ["Colorado Mesa Transfer", "Super Regional Contributor"],
  },
  {
    id: "ns_wvu_bk",
    name: "Brodie Kresser",
    role: "player",
    handle: "brodie.kresser.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "reserved",
    position: "IF",
    metrics: { battingAvg: ".267", homeRuns: 5, rbis: 32 },
    milestones: ["Starting Infield Cornerstone", "WVU 46-15 Season"],
  },
  {
    id: "ns_wvu_jjw",
    name: "JJ Wetherholt",
    role: "player",
    handle: "jj.wetherholt.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "reserved",
    position: "SS",
    metrics: { battingAvg: ".375", homeRuns: 15, rbis: 52 },
    milestones: ["First Round Draft Prospect", "All-Big 12 First Team"],
  },
  {
    id: "ns_wvu_ls",
    name: "Logan Sauve",
    role: "player",
    handle: "logan.sauve.mountaineers",
    suffix: ".mountaineers",
    teamKey: "wvu",
    claimState: "claimable",
    position: "C",
    metrics: { battingAvg: ".317", homeRuns: 10, rbis: 41 },
    milestones: ["WVU Captain and Field Commander"],
  },

  // ── Troy Trojans ──────────────────────────────────────────────────────────
  {
    id: "ns_troy_jj",
    name: "Jimmy Janicki",
    role: "player",
    handle: "jimmy.janicki.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "claimed",
    position: "C",
    metrics: { battingAvg: ".341", homeRuns: 19, rbis: 85, hits: 92 },
    milestones: [
      "Sun Belt Player of the Year",
      "All-American Catcher",
      "CWS Game 1: Solo HR to Tie in 7th",
      "2 Hits / 2 Runs — Troy CWS Historic Debut",
    ],
  },
  {
    id: "ns_troy_ap",
    name: "Aaron Piasecki",
    role: "player",
    handle: "aaron.piasecki.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "reserved",
    position: "SS",
    metrics: { battingAvg: ".346", hits: 93, homeRuns: 10, rbis: 48, stolenBases: 18 },
    milestones: ["First-Team All-Sun Belt Shortstop", "Troy Season Batting Leader"],
  },
  {
    id: "ns_troy_sm",
    name: "Steven Meier",
    role: "player",
    handle: "steven.meier.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "reserved",
    position: "2B",
    metrics: { battingAvg: ".321", homeRuns: 9, rbis: 44, hits: 68 },
    milestones: ["Sun Belt All-Conference", "60 Games Started"],
  },
  {
    id: "ns_troy_dn",
    name: "Drew Nelson",
    role: "player",
    handle: "drew.nelson.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "reserved",
    position: "1B",
    metrics: { battingAvg: ".307", homeRuns: 6, rbis: 49, hits: 74 },
    milestones: ["67 Games Started", "Gainesville Regional Hero"],
  },
  {
    id: "ns_troy_bc",
    name: "Blake Cavill",
    role: "player",
    handle: "blake.cavill.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "reserved",
    position: "OF",
    metrics: { battingAvg: ".279", homeRuns: 13, rbis: 50, hits: 67 },
    milestones: ["OPS .931", "Sun Belt Power Threat"],
  },
  {
    id: "ns_troy_jp",
    name: "Josh Pyne",
    role: "player",
    handle: "josh.pyne.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "reserved",
    position: "CF",
    metrics: { battingAvg: ".291", homeRuns: 10, rbis: 37, hits: 78 },
    milestones: ["66 Games Started", "Troy Leadoff Presence"],
  },
  {
    id: "ns_troy_sd",
    name: "Sean Darnell",
    role: "player",
    handle: "sean.darnell.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "reserved",
    position: "3B",
    metrics: { battingAvg: ".249", homeRuns: 4, rbis: 45, hits: 58 },
    milestones: ["CWS Game 1: RBI Double", "68 Games Started"],
  },
  {
    id: "ns_troy_jb",
    name: "Jabe Boroff",
    role: "player",
    handle: "jabe.boroff.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "reserved",
    position: "DH",
    metrics: { battingAvg: ".264", homeRuns: 11, rbis: 32, hits: 24 },
    milestones: ["CWS Game 1: RBI Single", "OPS 1.063 — Team Leader"],
  },
  {
    id: "ns_troy_ll",
    name: "Luke Lyon",
    role: "player",
    handle: "luke.lyon.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "reserved",
    position: "SP",
    metrics: { era: "3.56", wins: 9, strikeouts: 82 },
    milestones: ["Sun Belt Pitching Leader", "Troy Staff Ace"],
  },
  {
    id: "ns_troy_km",
    name: "Kole Myers",
    role: "player",
    handle: "kole.myers.trojans",
    suffix: ".trojans",
    teamKey: "troy",
    claimState: "claimable",
    position: "OF",
    metrics: { battingAvg: ".318", homeRuns: 12, rbis: 49 },
    milestones: ["First-Team All-Sun Belt Outfield"],
  },

  // ── North Carolina Tar Heels ──────────────────────────────────────────────
  {
    id: "ns_unc_vh",
    name: "Vance Honeycutt",
    role: "player",
    handle: "vance.honeycutt.tarheels",
    suffix: ".tarheels",
    teamKey: "unc",
    claimState: "claimable",
    position: "CF",
    metrics: { battingAvg: ".324", homeRuns: 22, stolenBases: 28 },
    milestones: ["UNC All-Time HR Leader", "ACC Defensive Player of the Year"],
  },
  {
    id: "ns_unc_jd",
    name: "Jason DeCaro",
    role: "player",
    handle: "jason.decaro.tarheels",
    suffix: ".tarheels",
    teamKey: "unc",
    claimState: "reserved",
    position: "SP",
    metrics: { era: "3.58", wins: 8, strikeouts: 95 },
    milestones: ["Freshman All-American Starter"],
  },
  {
    id: "ns_unc_cc",
    name: "Casey Cook",
    role: "player",
    handle: "casey.cook.tarheels",
    suffix: ".tarheels",
    teamKey: "unc",
    claimState: "reserved",
    position: "OF",
    metrics: { battingAvg: ".341", homeRuns: 18, rbis: 76 },
    milestones: ["ACC First-Team Outfielder", "UNC Slugging Force"],
  },
  {
    id: "ns_unc_ph",
    name: "Parks Harber",
    role: "player",
    handle: "parks.harber.tarheels",
    suffix: ".tarheels",
    teamKey: "unc",
    claimState: "reserved",
    position: "1B",
    metrics: { battingAvg: ".343", homeRuns: 20, rbis: 63 },
    milestones: ["Georgia Transfer Power Bat", "ACC All-Conference First Team"],
  },
  {
    id: "ns_unc_ls",
    name: "Luke Stevenson",
    role: "player",
    handle: "luke.stevenson.tarheels",
    suffix: ".tarheels",
    teamKey: "unc",
    claimState: "claimable",
    position: "C",
    metrics: { battingAvg: ".284", homeRuns: 14, rbis: 58 },
    milestones: ["Freshman All-American Catcher", "Omaha Star Selection"],
  },

  // ── Ole Miss Rebels ───────────────────────────────────────────────────────
  {
    id: "ns_ole_af",
    name: "Andrew Fischer",
    role: "player",
    handle: "andrew.fischer.rebels",
    suffix: ".rebels",
    teamKey: "olemiss",
    claimState: "claimed",
    position: "3B",
    metrics: { battingAvg: ".310", homeRuns: 21, rbis: 61 },
    milestones: ["First-Team All-SEC 3B"],
  },
  {
    id: "ns_ole_eg",
    name: "Ethan Groff",
    role: "player",
    handle: "ethan.groff.rebels",
    suffix: ".rebels",
    teamKey: "olemiss",
    claimState: "reserved",
    position: "OF",
    metrics: { battingAvg: ".290", homeRuns: 10, rbis: 45, stolenBases: 18 },
    milestones: ["SEC All-Defensive Outfield", "Rebel Leadoff Bat"],
  },
  {
    id: "ns_ole_lh",
    name: "Luke Hill",
    role: "player",
    handle: "luke.hill.rebels",
    suffix: ".rebels",
    teamKey: "olemiss",
    claimState: "claimable",
    position: "SS",
    metrics: { battingAvg: ".282", homeRuns: 6, rbis: 39 },
    milestones: ["Arizona Transfer Shortstop", "Slick Fielder"],
  },
  {
    id: "ns_ole_ld",
    name: "Liam Doyle",
    role: "player",
    handle: "liam.doyle.rebels",
    suffix: ".rebels",
    teamKey: "olemiss",
    claimState: "reserved",
    position: "SP",
    metrics: { era: "4.15", wins: 7, strikeouts: 84 },
    milestones: ["Coastal Carolina Transfer Starter", "SEC Pitcher of the Week"],
  },

  // ── Alabama Crimson Tide ──────────────────────────────────────────────────
  {
    id: "ns_bama_gm",
    name: "Gage Miller",
    role: "player",
    handle: "gage.miller.tide",
    suffix: ".tide",
    teamKey: "alabama",
    claimState: "claimed",
    position: "OF/DH",
    metrics: { battingAvg: ".381", homeRuns: 18, rbis: 56 },
    milestones: ["Bama Lead-off Slugging Anchor"],
  },
  {
    id: "ns_bama_tm",
    name: "TJ McCants",
    role: "player",
    handle: "tj.mccants.tide",
    suffix: ".tide",
    teamKey: "alabama",
    claimState: "reserved",
    position: "OF",
    metrics: { battingAvg: ".315", homeRuns: 15, rbis: 50, stolenBases: 14 },
    milestones: ["Ole Miss Transfer Outfielder", "Crimson Tide Speed Threat"],
  },
  {
    id: "ns_bama_jl",
    name: "Justin Lebron",
    role: "player",
    handle: "justin.lebron.tide",
    suffix: ".tide",
    teamKey: "alabama",
    claimState: "claimable",
    position: "SS",
    metrics: { battingAvg: ".338", homeRuns: 12, rbis: 38 },
    milestones: ["SEC Freshman of the Year", "All-SEC First Team Shortstop"],
  },
  {
    id: "ns_bama_gf",
    name: "Greg Farone",
    role: "player",
    handle: "greg.farone.tide",
    suffix: ".tide",
    teamKey: "alabama",
    claimState: "reserved",
    position: "SP",
    metrics: { era: "3.88", wins: 6, strikeouts: 74 },
    milestones: ["Tide Friday Night Starter", "LHP Dominance"],
  },

  // ── Oklahoma Sooners ──────────────────────────────────────────────────────
  {
    id: "ns_ou_ec",
    name: "Easton Carmichael",
    role: "player",
    handle: "easton.carmichael.sooners",
    suffix: ".sooners",
    teamKey: "oklahoma",
    claimState: "reserved",
    position: "C",
    metrics: { battingAvg: ".362", homeRuns: 10, rbis: 52 },
    milestones: ["All-Big 12 First-Team Catcher"],
  },
  {
    id: "ns_ou_bm",
    name: "Bryce Madron",
    role: "player",
    handle: "bryce.madron.sooners",
    suffix: ".sooners",
    teamKey: "oklahoma",
    claimState: "reserved",
    position: "OF",
    metrics: { battingAvg: ".318", homeRuns: 12, rbis: 53, stolenBases: 15 },
    milestones: ["Sooners Outfield Catalyst", "All-Big 12 Outfielder"],
  },
  {
    id: "ns_ou_js",
    name: "John Spikerman",
    role: "player",
    handle: "john.spikerman.sooners",
    suffix: ".sooners",
    teamKey: "oklahoma",
    claimState: "claimable",
    position: "OF",
    metrics: { battingAvg: ".367", homeRuns: 5, rbis: 32, stolenBases: 22 },
    milestones: ["Switch-Hitting Speedster", "Sooners Leadoff Bat"],
  },
  {
    id: "ns_ou_kp",
    name: "Kendall Pettis",
    role: "player",
    handle: "kendall.pettis.sooners",
    suffix: ".sooners",
    teamKey: "oklahoma",
    claimState: "reserved",
    position: "OF",
    metrics: { battingAvg: ".290", homeRuns: 4, rbis: 28, stolenBases: 19 },
    milestones: ["Postseason Defensive Standout", "Senior Leadership Anchor"],
  },

  // ── Texas Longhorns ───────────────────────────────────────────────────────
  {
    id: "ns_ut_jt",
    name: "Jared Thomas",
    role: "player",
    handle: "jared.thomas.longhorns",
    suffix: ".longhorns",
    teamKey: "texas",
    claimState: "claimed",
    position: "1B",
    metrics: { battingAvg: ".358", homeRuns: 16, stolenBases: 17 },
    milestones: ["SEC First-Team First Baseman"],
  },
  {
    id: "ns_ut_jf",
    name: "Jalin Flores",
    role: "player",
    handle: "jalin.flores.longhorns",
    suffix: ".longhorns",
    teamKey: "texas",
    claimState: "reserved",
    position: "SS",
    metrics: { battingAvg: ".340", homeRuns: 18, rbis: 56 },
    milestones: ["All-SEC Shortstop", "Longhorn Defensive Anchor"],
  },
  {
    id: "ns_ut_mb",
    name: "Max Belyeu",
    role: "player",
    handle: "max.belyeu.longhorns",
    suffix: ".longhorns",
    teamKey: "texas",
    claimState: "claimable",
    position: "OF",
    metrics: { battingAvg: ".329", homeRuns: 18, rbis: 53 },
    milestones: ["Big 12 Player of the Year (2024)", "SEC Power Threat"],
  },
  {
    id: "ns_ut_lj",
    name: "Lebarron Johnson Jr.",
    role: "player",
    handle: "lebarron.johnson.longhorns",
    suffix: ".longhorns",
    teamKey: "texas",
    claimState: "reserved",
    position: "SP",
    metrics: { era: "3.75", wins: 8, strikeouts: 98 },
    milestones: ["Longhorns Ace Pitcher", "All-American Nominee"],
  },
];

// ─── Moment Relic Registry ───────────────────────────────────────────────────

export const CWS_RELICS: CWSRelic[] = [
  {
    id: "m_wvu_guzman",
    name: "Armani Guzman — CWS Steal of Home (1st Since 2000)",
    athleteHandle: "armani.guzman.mountaineers",
    teamKey: "wvu",
    gameRef: "CWS 2026 Game 1: WVU 7, Troy 5 — 1st Inning",
    rarity: "Legendary",
    price: 1850,
    backingGoldGrains: 340,
    description:
      "Armani Guzman electrifies Charles Schwab Field with a straight steal of home plate — the first in the College World Series since the year 2000. The play ignites the Mountaineers en route to a 7–5 victory over Troy.",
  },
  {
    id: "m_wvu_hall_single",
    name: "Tyrus Hall — 8th Inning Walk-Off 2-Run Single (4 RBI Day)",
    athleteHandle: "tyrus.hall.mountaineers",
    teamKey: "wvu",
    gameRef: "CWS 2026 Game 1: WVU 7, Troy 5 — 8th Inning",
    rarity: "Legendary",
    price: 920,
    backingGoldGrains: 175,
    description:
      "Tyrus Hall breaks a 5–5 tie with a clutch 2-run single in the bottom of the 8th inning to seal WVU's historic first CWS victory. Hall finishes the game 2-for-3 with 4 RBIs.",
  },
  {
    id: "m_wvu_hall_double",
    name: "Tyrus Hall — 2-Run Double (Early Game 1 Lead)",
    athleteHandle: "tyrus.hall.mountaineers",
    teamKey: "wvu",
    gameRef: "CWS 2026 Game 1: WVU 7, Troy 5",
    rarity: "Epic",
    price: 480,
    backingGoldGrains: 90,
    description:
      "Tyrus Hall launches a 2-run double in the early innings to stake West Virginia to an early lead in their inaugural CWS appearance.",
  },
  {
    id: "m_wvu_smith",
    name: "Sean Smith — Solo Home Run (3rd Inning, CWS Game 1)",
    athleteHandle: "sean.smith.mountaineers",
    teamKey: "wvu",
    gameRef: "CWS 2026 Game 1: WVU 7, Troy 5 — 3rd Inning",
    rarity: "Epic",
    price: 520,
    backingGoldGrains: 95,
    description:
      "Sean Smith drives a solo home run in the 3rd inning, providing a crucial insurance run as WVU builds their lead over Troy in Omaha.",
  },
  {
    id: "m_troy_janicki",
    name: "Jimmy Janicki — Solo HR to Tie Game 1 in 7th (CWS)",
    athleteHandle: "jimmy.janicki.trojans",
    teamKey: "troy",
    gameRef: "CWS 2026 Game 1: WVU 7, Troy 5 — 7th Inning",
    rarity: "Epic",
    price: 650,
    backingGoldGrains: 120,
    description:
      "Sun Belt Player of the Year Jimmy Janicki smashes a solo home run in the 7th to tie the game at 5–5, showcasing why he is the most feared bat in Troy program history at their first-ever CWS.",
  },
  {
    id: "m_wvu_korn",
    name: "Ian Korn — 6 IP Relief, 2H, 1ER, CWS Win (6-1)",
    athleteHandle: "ian.korn.mountaineers",
    teamKey: "wvu",
    gameRef: "CWS 2026 Game 1: WVU 7, Troy 5 — Pitching",
    rarity: "Epic",
    price: 620,
    backingGoldGrains: 115,
    description:
      "Ian Korn enters in relief for Chansen Cole and delivers 6 dominant innings — 2 hits, 1 earned run, 0 walks, 2 strikeouts — earning the victory and propelling WVU into the winner's bracket.",
  },
  {
    id: "m_wvu_mcdougal",
    name: "Ben McDougal — CWS Closing Save (Final Out on Janicki Foul)",
    athleteHandle: "ben.mcdougal.mountaineers",
    teamKey: "wvu",
    gameRef: "CWS 2026 Game 1: WVU 7, Troy 5 — 9th Inning",
    rarity: "Rare",
    price: 380,
    backingGoldGrains: 65,
    description:
      "LHP closer Ben McDougal enters in the 9th with the tying run on base and induces a foul-out from All-American Jimmy Janicki to seal WVU's 7–5 victory in the Mountaineers' CWS debut.",
  },
  {
    id: "m_troy_darnell",
    name: "Sean Darnell — RBI Double (Troy CWS Debut)",
    athleteHandle: "sean.darnell.trojans",
    teamKey: "troy",
    gameRef: "CWS 2026 Game 1: WVU 7, Troy 5",
    rarity: "Rare",
    price: 220,
    backingGoldGrains: 35,
    description:
      "Sean Darnell records an RBI double in Troy's historic first College World Series game, contributing to the Trojans' first-ever CWS run production.",
  },
  {
    id: "m_troy_boroff",
    name: "Jabe Boroff — RBI Single (Troy CWS Historic Debut)",
    athleteHandle: "jabe.boroff.trojans",
    teamKey: "troy",
    gameRef: "CWS 2026 Game 1: WVU 7, Troy 5",
    rarity: "Common",
    price: 195,
    backingGoldGrains: 28,
    description:
      "Jabe Boroff delivers an RBI single in Troy's first-ever College World Series appearance, part of the program's historic Omaha journey.",
  },
];

// ─── Metadata Builders ────────────────────────────────────────────────────────

const OPERATOR_WALLET = process.env.SOLANA_PRIVATE_KEY
  ? "UNYKORNOperatorWallet111111111111111111111111"
  : "UNYKORNProtocolGenesisCWS2026111111111111111";

const EXTERNAL_URL = "https://unykorn.ai/cws";
const COLLECTION_IMAGE = "https://images.unsplash.com/photo-1544045560-7297be6472ff?w=800&q=90";

/**
 * Build Metaplex-compatible NFT metadata JSON for an athlete namespace.
 */
export function buildNamespaceMetadata(athlete: CWSAthlete): NFTMetadata {
  const team = CWS_TEAMS[athlete.teamKey];

  const attributes: Array<{ trait_type: string; value: string | number }> = [
    { trait_type: "Season", value: "2026 CWS — Omaha" },
    { trait_type: "Team", value: team.name },
    { trait_type: "Conference", value: team.conference },
    { trait_type: "Seed", value: team.seed },
    { trait_type: "Suffix", value: athlete.suffix },
    { trait_type: "Role", value: athlete.role },
    { trait_type: "Position", value: athlete.position ?? "N/A" },
    { trait_type: "Claim State", value: athlete.claimState },
    { trait_type: "Namespace Root", value: athlete.handle },
    { trait_type: "NIL Value", value: team.nilWorth },
    { trait_type: "Championship Odds", value: team.championshipOdds },
  ];

  // Add numeric/string stats as traits
  for (const [key, val] of Object.entries(athlete.metrics)) {
    if (val !== undefined) {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
      attributes.push({ trait_type: label, value: val as string | number });
    }
  }

  // Add milestone badges
  athlete.milestones.forEach((m, i) => {
    attributes.push({ trait_type: `Milestone ${i + 1}`, value: m });
  });

  return {
    name: athlete.handle,
    symbol: "CWSNS",
    description: `Official 2026 College World Series Sovereign Athlete Namespace — ${athlete.name} · ${team.name}. This pre-minted identity root grants the athlete full sovereign control of their on-chain namespace, NIL income vaults, generational wealth routes, and moment relic minting rights under the Unykorn Protocol.`,
    image: COLLECTION_IMAGE,
    external_url: EXTERNAL_URL,
    attributes,
    properties: {
      category: "namespace",
      creators: [{ address: OPERATOR_WALLET, share: 100 }],
      files: [{ uri: COLLECTION_IMAGE, type: "image/jpeg" }],
    },
  };
}

/**
 * Build Metaplex-compatible NFT metadata JSON for a Moment Relic SFT.
 */
export function buildRelicMetadata(relic: CWSRelic): NFTMetadata {
  const team = CWS_TEAMS[relic.teamKey];

  return {
    name: relic.name,
    symbol: "CWSRELIC",
    description: relic.description,
    image: COLLECTION_IMAGE,
    external_url: EXTERNAL_URL,
    attributes: [
      { trait_type: "Season", value: "2026 CWS — Omaha" },
      { trait_type: "Team", value: team.name },
      { trait_type: "Athlete Namespace", value: relic.athleteHandle },
      { trait_type: "Rarity", value: relic.rarity },
      { trait_type: "Game Reference", value: relic.gameRef },
      { trait_type: "Backing Gold Grains", value: relic.backingGoldGrains },
      { trait_type: "Price (OMAHA26)", value: relic.price },
      { trait_type: "Token Type", value: "SFT — Semi-Fungible Moment Relic" },
    ],
    properties: {
      category: "relic",
      creators: [{ address: OPERATOR_WALLET, share: 100 }],
      files: [{ uri: COLLECTION_IMAGE, type: "image/jpeg" }],
    },
  };
}

/**
 * Build a Team Collection manifest JSON — the root NFT for each team's namespace suffix tree.
 */
export function buildTeamCollectionMetadata(teamKey: TeamKey): NFTMetadata {
  const team = CWS_TEAMS[teamKey];
  const athletes = CWS_ATHLETES.filter((a) => a.teamKey === teamKey);

  return {
    name: `${team.name} — CWS 2026 Sovereign Collection`,
    symbol: "CWSCOL",
    description: `Official 2026 College World Series sovereign namespace collection for the ${team.name}. This root collection anchors all ${athletes.length} athlete namespaces under the "${team.suffix}" suffix tree on the Unykorn Protocol Registry.`,
    image: COLLECTION_IMAGE,
    external_url: EXTERNAL_URL,
    attributes: [
      { trait_type: "Season", value: "2026 CWS — Omaha" },
      { trait_type: "Team", value: team.name },
      { trait_type: "Conference", value: team.conference },
      { trait_type: "Seed", value: team.seed },
      { trait_type: "Namespace Suffix", value: team.suffix },
      { trait_type: "NIL Pool Value", value: team.nilWorth },
      { trait_type: "Championship Odds", value: team.championshipOdds },
      { trait_type: "Athlete Count", value: athletes.length },
      { trait_type: "Collection Type", value: "Team Namespace Root" },
      ...(team.record ? [{ trait_type: "Season Record", value: team.record }] : []),
    ],
    properties: {
      category: "collection",
      creators: [{ address: OPERATOR_WALLET, share: 100 }],
      files: [{ uri: COLLECTION_IMAGE, type: "image/jpeg" }],
    },
  };
}

/**
 * Build the Genesis Root Manifest — the top-level JSON anchoring the entire CWS namespace tree.
 * This is "dns-root.cws.omaha26" — the sovereign registry root.
 */
export function buildGenesisManifest(): object {
  return {
    version: "1.0.0",
    protocol: "Unykorn Sovereign CWS Protocol",
    root: "cws.omaha26",
    season: "2026",
    event: "NCAA Men's College World Series — Charles Schwab Field, Omaha NE",
    created: new Date().toISOString(),
    network: process.env.SOLANA_NETWORK ?? "devnet",
    totalAthletes: CWS_ATHLETES.length,
    totalRelics: CWS_RELICS.length,
    teams: Object.fromEntries(
      (Object.keys(CWS_TEAMS) as TeamKey[]).map((key) => {
        const team = CWS_TEAMS[key];
        const athletes = CWS_ATHLETES.filter((a) => a.teamKey === key);
        return [
          key,
          {
            name: team.name,
            suffix: team.suffix,
            seed: team.seed,
            nilWorth: team.nilWorth,
            championshipOdds: team.championshipOdds,
            athleteCount: athletes.length,
            namespaces: athletes.map((a) => a.handle),
          },
        ];
      })
    ),
    namespaces: CWS_ATHLETES.map((a) => ({
      id: a.id,
      handle: a.handle,
      team: a.teamKey,
      claimState: a.claimState,
    })),
    relics: CWS_RELICS.map((r) => ({
      id: r.id,
      name: r.name,
      athleteHandle: r.athleteHandle,
      rarity: r.rarity,
      backingGoldGrains: r.backingGoldGrains,
    })),
  };
}

/**
 * Find an athlete by ID from the canonical registry.
 */
export function getAthleteById(id: string): CWSAthlete | undefined {
  return CWS_ATHLETES.find((a) => a.id === id);
}

/**
 * Find a relic by ID from the canonical registry.
 */
export function getRelicById(id: string): CWSRelic | undefined {
  return CWS_RELICS.find((r) => r.id === id);
}
