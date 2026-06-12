/**
 * zk/client-zk.ts
 * Troptions Unity Legacy Vault — Browser ZK proof generation (snarkjs + WASM)
 *
 * This is the client-side half of the ZK crown jewel.
 * - Generates Groth16 proofs over the Circom circuits for:
 *   - Document integrity (no reveal)
 *   - Guardian quorum threshold
 *   - Composite 5-Proof Release
 *
 * Flow (after client-crypto.ts encrypt):
 *   1. Prepare private/public signals from encrypted doc hash + policy state + guardian approvals (private).
 *   2. Load circuit wasm + zkey (from /zk/artifacts or CDN after trusted setup).
 *   3. snarkjs.groth16.fullProve(input, wasm, zkey) → { proof, publicSignals }
 *   4. POST to vault API with proof attached (server verifies with same or lightweight verifier).
 *
 * Requirements (user / CI):
 *   npm i snarkjs
 *   circom circuits/*.circom --r1cs --wasm --sym -o zk/artifacts (or use our build script)
 *   snarkjs powersoftau new ... ; contribute; prepare phase2; groth16 setup
 *
 * For quick local dev without full trusted setup: use "mock" proofs (insecure, for UI only) controlled by env.
 * Production: artifacts must come from audited ceremony or user-run setup for self-hosted.
 *
 * On-chain: the proof hash or publicSignals can be submitted via Unity Token tx or x402 metered anchor.
 */

export type Groth16Proof = any;
export type PublicSignals = string[];

export interface ZKProofBundle {
  proof: any; // Groth16Proof or PLONK proof
  publicSignals: PublicSignals;
  circuit: "DocumentHashProof" | "GuardianQuorum" | "FiveProofRelease" | "UnityLegacy5Proof";
  version: string;
}

/**
 * Generate a DocumentHashProof.
 * preimageChunks: 16 numbers (field elements) representing the sensitive data or its hash segments.
 * expectedHash: the public value we commit to (can be Poseidon(contentHash) or direct).
 */
export async function proveDocumentHash(
  preimageChunks: bigint[],
  expectedHash: bigint
): Promise<ZKProofBundle> {
  if (typeof window === "undefined") throw new Error("Must run in browser");

  // In real: await import snarkjs dynamically or global
  // const snarkjs = await import("snarkjs");

  // Placeholder for when artifacts exist:
  // const wasm = "/zk/artifacts/DocumentHashProof.wasm";
  // const zkey = "/zk/artifacts/DocumentHashProof_final.zkey";
  // const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  //   { documentPreimage: preimageChunks, expectedHash },
  //   wasm,
  //   zkey
  // );

  // For immediate integration before full compile: return a mock that the server accepts in dev
  if (process.env.NEXT_PUBLIC_ZK_MOCK === "true" || (window as any).__ZK_MOCK__) {
    return {
      proof: { pi_a: ["0xmock"], pi_b: [["0xmock"]], pi_c: ["0xmock"] },
      publicSignals: [expectedHash.toString()],
      circuit: "DocumentHashProof",
      version: "mock-v1",
    };
  }

  throw new Error("Real ZK artifacts not yet compiled. Run compile-circuits and trusted setup. Set NEXT_PUBLIC_ZK_MOCK=true for UI dev.");
}

/**
 * Generate Guardian Quorum proof (N of M).
 */
export async function proveGuardianQuorum(
  approvals: bigint[], // 0/1
  threshold: bigint,
  setCommitment: bigint
): Promise<ZKProofBundle> {
  if (process.env.NEXT_PUBLIC_ZK_MOCK === "true") {
    return {
      proof: { pi_a: ["0xquorum"], pi_b: [["0xquorum"]], pi_c: ["0xquorum"] },
      publicSignals: [threshold.toString(), setCommitment.toString()],
      circuit: "GuardianQuorum",
      version: "mock-v1",
    };
  }
  // Real snarkjs call here...
  throw new Error("ZK artifacts required");
}

/**
 * Generate the full 5-Proof composite.
 * This is the one attached to ReleaseRequest for on-chain verifiability.
 */
export async function proveFiveProofRelease(input: {
  docPreimage: bigint[];
  guardianApprovals: bigint[];
  attorneyNullifier: bigint;
  identitySecret: bigint;
  dmsTriggerTime: bigint;
  expectedDocHash: bigint;
  guardianThreshold: bigint;
  guardianSetRoot: bigint;
  attorneyCommitment: bigint;
  minDmsTime: bigint;
  releaseWindowEnd: bigint;
}): Promise<ZKProofBundle> {
  if (process.env.NEXT_PUBLIC_ZK_MOCK === "true") {
    return {
      proof: { pi_a: ["0x5proof"], pi_b: [["0x5proof"]], pi_c: ["0x5proof"] },
      publicSignals: [
        input.expectedDocHash.toString(),
        input.guardianThreshold.toString(),
        input.guardianSetRoot.toString(),
        input.attorneyCommitment.toString(),
        input.minDmsTime.toString(),
        input.releaseWindowEnd.toString(),
      ],
      circuit: "FiveProofRelease",
      version: "mock-v1",
    };
  }
  throw new Error("Compile circuits/FiveProofRelease.circom and provide artifacts");
}

/**
 * Verify a proof (can run in browser for instant feedback, or always server-side for trust).
 * In Worker / API: use snarkjs.groth16.verify(vkey, publicSignals, proof)
 */
export async function verifyProofLocally(
  bundle: ZKProofBundle,
  vkey: any
): Promise<boolean> {
  if (bundle.version === "mock-v1") return true; // dev only
  // const snarkjs = await import("snarkjs");
  // return snarkjs.groth16.verify(vkey, bundle.publicSignals, bundle.proof);
  return false;
}

/**
 * Generate UnityLegacy5Proof (recommended for Troptions Unity Legacy Vault).
 * Matches the UnityLegacy5Proof.circom template (Poseidon doc hash + quorum + deadman time).
 * Use after client-crypto encrypt: prepare chunks from encrypted buffer (split to field elements),
 * guardianApprovals as 0/1 array (private), releaseTime from policy.
 *
 * publicSignals order must match circuit: [expectedDocHash, currentTime, minApprovals]
 */
export async function proveUnityLegacy5Proof(input: {
  documentChunks: bigint[];   // length 8 typical
  salt: bigint;
  guardianApprovals: bigint[]; // length 5, 0/1
  releaseTime: bigint;
  expectedDocHash: bigint;
  currentTime: bigint;
  minApprovals: bigint;       // e.g. 3
}): Promise<ZKProofBundle> {
  if (process.env.NEXT_PUBLIC_ZK_MOCK === "true" || (window as any).__ZK_MOCK__) {
    return {
      proof: { pi_a: ["0xunity5"], pi_b: [["0xunity5"]], pi_c: ["0xunity5"] },
      publicSignals: [
        input.expectedDocHash.toString(),
        input.currentTime.toString(),
        input.minApprovals.toString(),
      ],
      circuit: "UnityLegacy5Proof",
      version: "mock-v1",
    };
  }

  // Real path (uncomment when artifacts ready):
  // const snarkjs = await import("snarkjs");
  // const wasm = "/zk/artifacts/UnityLegacy5Proof.wasm";
  // const zkey = "/zk/artifacts/UnityLegacy5Proof_final.zkey"; // or .plonk.zkey for PLONK
  // const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  //   {
  //     documentChunks: input.documentChunks,
  //     salt: input.salt,
  //     guardianApprovals: input.guardianApprovals,
  //     releaseTime: input.releaseTime,
  //     expectedDocHash: input.expectedDocHash,
  //     currentTime: input.currentTime,
  //     minApprovals: input.minApprovals,
  //   },
  //   wasm,
  //   zkey
  // );
  // return { proof, publicSignals, circuit: "UnityLegacy5Proof", version: "plonk-poseidon-v1" };

  throw new Error("Compile circuits/UnityLegacy5Proof.circom with --plonk and provide wasm/zkey artifacts. Use mock for now.");
}

export const ZK_VERSION = "troptions-unity-zk-2026-v1-plonk-poseidon";
