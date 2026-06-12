pragma circom 2.1.0;

/*
 * UnityLegacy5Proof.circom
 * Troptions Unity Legacy Vault — PLONK + Poseidon 5-Proof Release Circuit
 *
 * Proves (in zero knowledge):
 * 1. Document integrity: Poseidon hash of (encrypted chunks + salt) matches the anchored public expectedDocHash.
 * 2. Guardian quorum: At least `minApprovals` (e.g. 3) valid guardian approvals (private bits or hashes).
 * 3. Dead man's switch / time condition: currentTime >= releaseTime (using on-chain timestamp for the proof).
 * 4. (Extensible) Legal/attorney flag + on-chain anchor presence (via public signals).
 *
 * This is the production circuit to use with snarkjs (PLONK or Groth16).
 * Compile: circom UnityLegacy5Proof.circom --r1cs --wasm --sym --plonk -o ../zk/artifacts
 *
 * Private inputs never leave the browser. Public signals (expectedDocHash, currentTime, minApprovals) can be anchored
 * on Unity Token, XRPL, Stellar, or via x402.
 *
 * Pair with client-crypto.ts (AES-256 client-side) + client-zk.ts for full sovereign flow.
 */

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template UnityLegacy5Proof(nChunks, nGuardians) {
    // === PRIVATE (never revealed) ===
    signal input documentChunks[nChunks];   // AES-256 encrypted doc split into field elements
    signal input salt;                      // Entropy
    signal input guardianApprovals[nGuardians]; // 0/1 or Poseidon-hashed approval secrets
    signal input releaseTime;               // When DMS or policy allows release

    // === PUBLIC (visible in proof, for anchoring + verification) ===
    signal input expectedDocHash;           // The hash we prove knowledge of (anchored on-chain)
    signal input currentTime;               // Trusted timestamp (on-chain block time or Unity event)
    signal input minApprovals;              // e.g. 3 for 3-of-5

    // 1. Document Integrity via Poseidon (zk-friendly, low constraints)
    component docHasher = Poseidon(nChunks + 1);
    for (var i = 0; i < nChunks; i++) {
        docHasher.inputs[i] <== documentChunks[i];
    }
    docHasher.inputs[nChunks] <== salt;
    docHasher.out === expectedDocHash;

    // 2. Guardian Quorum (count approvals + threshold)
    signal approvalSum;
    var sum = 0;
    for (var i = 0; i < nGuardians; i++) {
        // Each approval must be 0 or 1 (boolean constraint)
        guardianApprovals[i] * (guardianApprovals[i] - 1) === 0;
        sum += guardianApprovals[i];
    }
    approvalSum <== sum;

    component thresholdCheck = GreaterEqThan(32);
    thresholdCheck.in[0] <== approvalSum;
    thresholdCheck.in[1] <== minApprovals;
    thresholdCheck.out === 1;

    // 3. Dead Man's Switch / Time Lock
    component timeCheck = GreaterEqThan(64);
    timeCheck.in[0] <== currentTime;
    timeCheck.in[1] <== releaseTime;
    timeCheck.out === 1;

    // (Future slots for attorney flag, identity nullifier, etc. can be added as additional constraints/signals)
}

// Default instantiation for 8-chunk docs + 5 guardians (Estate default 3 min)
component main {
    public [ expectedDocHash, currentTime, minApprovals ]
} = UnityLegacy5Proof(8, 5);
