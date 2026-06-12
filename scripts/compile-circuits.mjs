#!/usr/bin/env node
/**
 * scripts/compile-circuits.mjs
 * Troptions Unity Legacy Vault — ZK circuit compiler wrapper
 *
 * Requires:
 *   - circom (https://docs.circom.io/getting-started/installation/)
 *   - snarkjs (npm i -g snarkjs or local)
 *
 * Usage: pnpm zk:compile
 *
 * This produces:
 *   zk/artifacts/*.r1cs
 *   zk/artifacts/*.wasm
 *   zk/artifacts/*.sym
 * Then you run trusted setup (or use existing ptau) + snarkjs groth16 setup.
 *
 * For the Unity Legacy launch: we start with mock proofs (NEXT_PUBLIC_ZK_MOCK=true)
 * and graduate to real proofs + on-chain verifiers (XRPL has limited zk support; use Unity Token contract or EVM L2 for full Groth16 verify).
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const CIRCUITS = ["DocumentHashProof", "GuardianQuorum", "FiveProofRelease", "UnityLegacy5Proof"];
const OUT = path.join(ROOT, "zk/artifacts");

console.log("🔐 Troptions Unity Legacy Vault — Compiling Circom circuits for ZK 5-Proof...");

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

for (const name of CIRCUITS) {
  const circuit = path.join(ROOT, "circuits", `${name}.circom`);
  if (!fs.existsSync(circuit)) {
    console.warn(`  ⚠️  ${name}.circom not found — skipping`);
    continue;
  }
  console.log(`  → Compiling ${name}...`);
  try {
    // Adjust include paths if circomlib not in node_modules/circomlib
    const cmd = `circom ${circuit} --r1cs --wasm --sym --plonk -o ${OUT} --include ${ROOT}/node_modules/circomlib/circuits || echo "circom not in PATH or circomlib missing — artifacts will be incomplete (use --plonk for PLONK variant)"`;
    execSync(cmd, { stdio: "inherit", cwd: ROOT });
  } catch (e) {
    console.warn(`  ⚠️  circom compile failed for ${name} (expected until circom installed + circomlib linked). Proceeding with mocks.`);
  }
}

console.log("\n✅ Circuit compile step complete (or mocked).");
console.log("Next: pnpm zk:setup (powers of tau + groth16 setup) or use Perpetual Powers of Tau ptau files.");
console.log("For browser: copy the .wasm and _js/ from artifacts into public/zk or serve from R2.");
