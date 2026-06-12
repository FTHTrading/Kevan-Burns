pragma circom 2.0.0;

/*
 * DocumentHashProof.circom
 * Troptions Unity Legacy Vault — ZK crown jewel circuit #1
 *
 * Proves: "I know a preimage (document chunks or encrypted chunks) whose Poseidon hash equals the expected (public) hash."
 * This allows anchoring document *existence + integrity* on XRPL/Stellar/Unity Token / Apostle Chain
 * without ever revealing the document content, even the plaintext hash if we commit only to the ZK proof.
 *
 * Why Poseidon? ZK-SNARK friendly (low constraints vs SHA256). Use for on-chain friendliness.
 *
 * Public inputs: expectedHash (the value we anchor / commit to)
 * Private inputs: the preimage (document or its encrypted form split into field elements)
 *
 * Usage in vault:
 *   1. Client encrypts doc with client-crypto.ts → gets contentHash (SHA256 for audit) + ciphertext
 *   2. For ZK: split contentHash or chunks of plaintext/encrypted into 16 field elements (or use full hash as single input with multi-hash circuit)
 *   3. Generate proof client-side (snarkjs.groth16.fullProve in browser WASM)
 *   4. Submit { ciphertext, contentHash, zkProof, publicSignals } to /api/vault/upload
 *   5. Server verifies proof (fast) then anchors publicSignals[0] or proof hash on-chain via Unity Token event or x402.
 *
 * Production: Use audited powers-of-tau (ptau), contribute to ceremony or use Perpetual Powers of Tau.
 * For self-hosted: user can run their own trusted setup.
 */

include "circomlib/poseidon.circom";

template DocumentHashProof() {
    // Private: the document preimage (e.g. 16 chunks of 31-byte field elements or hash segments)
    // In practice for large docs: hash the doc first (SHA or Poseidon multi), then prove knowledge of that hash preimage.
    // Here we demonstrate direct preimage for small/medium sensitive docs or for the *encrypted* blob hash.
    signal input documentPreimage[16];

    // Public: the expected hash we are proving knowledge of (this goes on-chain / in manifest)
    signal input expectedHash;

    component poseidon = Poseidon(16);
    for (var i = 0; i < 16; i++) {
        poseidon.inputs[i] <== documentPreimage[i];
    }

    // Constraint: the computed hash must equal the public expected
    poseidon.out === expectedHash;
}

// Main component — expose public signals explicitly for snarkjs
component main { public [ expectedHash ] } = DocumentHashProof();
