/**
 * export-abi.ts
 * Exports ABI JSON files from compiled Hardhat artifacts to contracts/abi/
 * Run after: pnpm compile
 */
import { artifacts } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const CONTRACTS = [
  "LegacyVaultRegistry",
  "LegacyNamespaceRegistry",
  "LegacyPolicyEngine",
  "LegacyAuditLog",
  "LegacyVaultAnchor",
  "LegacyAccessControl",
];

async function main() {
  const abiDir = path.resolve(__dirname, "../abi");
  fs.mkdirSync(abiDir, { recursive: true });

  for (const name of CONTRACTS) {
    const artifact = await artifacts.readArtifact(name);
    const outPath = path.join(abiDir, `${name}.json`);
    fs.writeFileSync(outPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`✓ ${name} ABI → ${outPath}`);
  }

  console.log("\nABIs exported. Import in TypeScript:");
  console.log('  import LegacyVaultRegistryABI from "../contracts/abi/LegacyVaultRegistry.json";');
}

main().catch(console.error);
