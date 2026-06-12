pragma circom 2.0.0;

/*
 * GuardianQuorum.circom
 * Troptions Unity Legacy Vault — ZK crown jewel circuit #2 (core of 5-Proof)
 *
 * Proves: "At least N out of M guardians have approved (provided valid signatures or approval commitments)
 * without revealing *which* guardians or the exact count (if privacy variant)."
 *
 * For MVP: Simple threshold — prove sum(approvals) >= threshold, using IsEqual + adders from circomlib.
 * Each guardian approval can be a private bit (0/1) or a signature that we range-check.
 *
 * Advanced: Use EdDSA or Poseidon commitments for each guardian's approval (hides identity if using anonymous credentials).
 * For Unity: approvals can be on-chain Unity Token signed messages or x402 proofs.
 *
 * Public: threshold (N), totalGuardians (M), merkleRoot or nullifier set if using set membership.
 * Private: array of approval bits + (optional) guardian private keys / nullifiers.
 */

include "circomlib/comparators.circom";
include "circomlib/poseidon.circom";

template GuardianQuorum(N_GUARDIANS, THRESHOLD) {
    // Private approval signals (1 = approved this release, 0 = not). Padded to N_GUARDIANS.
    signal input approvals[N_GUARDIANS];

    // Public: minimum required
    signal input threshold;

    // Public: we can also publish a commitment to the guardian set (for binding)
    signal input guardianSetCommitment;

    // Sum the approvals (all must be 0 or 1)
    signal sumApprovals;
    var sum = 0;
    for (var i = 0; i < N_GUARDIANS; i++) {
        // Constraint: each approval is boolean
        approvals[i] * (approvals[i] - 1) === 0;
        sum += approvals[i];
    }
    sumApprovals <== sum;

    // Enforce sum >= threshold using LessEqThan (or GreaterEq via IsZero tricks)
    component gte = GreaterEqThan(32); // 32-bit sufficient for small M
    gte.in[0] <== sumApprovals;
    gte.in[1] <== threshold;

    gte.out === 1;

    // Optional: bind to a specific guardian set via Poseidon hash of sorted guardian DIDs or pubkeys
    // (left as exercise; wire guardianPubkeys[N] and compute root)
    // For now we just constrain the count.
}

// Example instantiation for Estate plan (up to 5 guardians, quorum 3)
component main { public [ threshold, guardianSetCommitment ] } = GuardianQuorum(5, 3);
