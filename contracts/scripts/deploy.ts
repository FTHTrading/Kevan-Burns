/**
 * deploy.ts — Legacy Vault Protocol contract deployment
 *
 * Deploys all five contracts in dependency order, wires them together,
 * and writes addresses + ABIs to ../../lib/blockchain/deployed-addresses.json
 * so the registry-adapter.ts can connect to them.
 *
 * Usage:
 *   pnpm deploy:local    → deploys to local Hardhat node
 *   pnpm deploy:private  → deploys to your private EVM chain
 */

import { ethers, network, artifacts } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`\n=== Legacy Vault Protocol — Contract Deployment ===`);
  console.log(`Network:  ${network.name} (chainId ${network.config.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // ─── Deploy contracts ──────────────────────────────────────────

  console.log("1/5 Deploying LegacyVaultRegistry...");
  const VaultRegistry = await ethers.getContractFactory("LegacyVaultRegistry");
  const vaultRegistry = await VaultRegistry.deploy();
  await vaultRegistry.waitForDeployment();
  const vaultRegistryAddr = await vaultRegistry.getAddress();
  console.log(`    ✓ LegacyVaultRegistry:     ${vaultRegistryAddr}`);

  console.log("2/5 Deploying LegacyNamespaceRegistry...");
  const NsRegistry = await ethers.getContractFactory("LegacyNamespaceRegistry");
  const nsRegistry = await NsRegistry.deploy();
  await nsRegistry.waitForDeployment();
  const nsRegistryAddr = await nsRegistry.getAddress();
  console.log(`    ✓ LegacyNamespaceRegistry: ${nsRegistryAddr}`);

  console.log("3/5 Deploying LegacyPolicyEngine...");
  const PolicyEngine = await ethers.getContractFactory("LegacyPolicyEngine");
  const policyEngine = await PolicyEngine.deploy();
  await policyEngine.waitForDeployment();
  const policyEngineAddr = await policyEngine.getAddress();
  console.log(`    ✓ LegacyPolicyEngine:       ${policyEngineAddr}`);

  console.log("4/5 Deploying LegacyAuditLog...");
  const AuditLog = await ethers.getContractFactory("LegacyAuditLog");
  const auditLog = await AuditLog.deploy();
  await auditLog.waitForDeployment();
  const auditLogAddr = await auditLog.getAddress();
  console.log(`    ✓ LegacyAuditLog:           ${auditLogAddr}`);

  console.log("5/5 Deploying LegacyVaultAnchor...");
  const VaultAnchor = await ethers.getContractFactory("LegacyVaultAnchor");
  const vaultAnchor = await VaultAnchor.deploy();
  await vaultAnchor.waitForDeployment();
  const vaultAnchorAddr = await vaultAnchor.getAddress();
  console.log(`    ✓ LegacyVaultAnchor:        ${vaultAnchorAddr}`);

  console.log("\n5b Deploying LegacyAccessControl...");
  const AccessControl = await ethers.getContractFactory("LegacyAccessControl");
  const accessControl = await AccessControl.deploy();
  await accessControl.waitForDeployment();
  const accessControlAddr = await accessControl.getAddress();
  console.log(`    ✓ LegacyAccessControl:      ${accessControlAddr}`);

  console.log("\n5c Deploying LegacyReferral...");
  const Referral = await ethers.getContractFactory("LegacyReferral");
  const referral = await Referral.deploy();
  await referral.waitForDeployment();
  const referralAddr = await referral.getAddress();
  console.log(`    ✓ LegacyReferral:           ${referralAddr}`);

  console.log("\n5d Deploying AffiliateBadge...");
  const Badge = await ethers.getContractFactory("AffiliateBadge");
  const badge = await Badge.deploy();
  await badge.waitForDeployment();
  const badgeAddr = await badge.getAddress();
  console.log(`    ✓ AffiliateBadge:           ${badgeAddr}`);

  // ─── Wire policy engine + audit log into vault registry ──────

  console.log("\nWiring contracts...");
  await (await vaultRegistry.setPolicyEngine(policyEngineAddr)).wait();
  await (await vaultRegistry.setAuditLog(auditLogAddr)).wait();
  console.log("    ✓ VaultRegistry wired with PolicyEngine + AuditLog");

  // ─── Write deployed addresses + ABIs ─────────────────────────

  const addresses: Record<string, string> = {
    LegacyVaultRegistry:     vaultRegistryAddr,
    LegacyNamespaceRegistry: nsRegistryAddr,
    LegacyPolicyEngine:      policyEngineAddr,
    LegacyAuditLog:          auditLogAddr,
    LegacyVaultAnchor:       vaultAnchorAddr,
    LegacyAccessControl:     accessControlAddr,
    LegacyReferral:          referralAddr,
    AffiliateBadge:          badgeAddr,
  };

  const deploymentInfo = {
    network:   network.name,
    chainId:   network.config.chainId,
    deployer:  deployer.address,
    timestamp: new Date().toISOString(),
    addresses,
  };

  // Write to lib/blockchain/ so the TypeScript adapter can import it
  const outDir = path.resolve(__dirname, "../../lib/blockchain");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "deployed-addresses.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n✓ Deployment info written to lib/blockchain/deployed-addresses.json`);

  // Export ABIs
  const abiDir = path.resolve(__dirname, "../abi");
  fs.mkdirSync(abiDir, { recursive: true });

  for (const name of Object.keys(addresses)) {
    const artifact = await artifacts.readArtifact(name);
    fs.writeFileSync(
      path.join(abiDir, `${name}.json`),
      JSON.stringify(artifact.abi, null, 2)
    );
  }
  console.log(`✓ ABIs exported to contracts/abi/`);

  // ─── Summary ──────────────────────────────────────────────────

  console.log("\n=== Deployment Summary ===");
  for (const [name, addr] of Object.entries(addresses)) {
    console.log(`  ${name.padEnd(28)} ${addr}`);
  }

  console.log("\n=== Next Steps ===");
  console.log("  1. Add to your .env:");
  console.log(`     MOCK_CHAIN=false`);
  console.log(`     CHAIN_RPC_URL=${network.config.chainId === 31337 ? "http://127.0.0.1:8545" : "<your-rpc>"}`);
  console.log(`     CHAIN_CONTRACT_ADDRESS=${vaultRegistryAddr}`);
  console.log(`     CHAIN_ADMIN_KEY=<your-private-key>`);
  console.log("  2. The registry-adapter.ts reads deployed-addresses.json automatically.");
  console.log("  3. Run db:migrate to push the Prisma schema.");
  console.log("  4. Start the app: pnpm dev\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
