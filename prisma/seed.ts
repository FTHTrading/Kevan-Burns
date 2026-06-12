/**
 * Prisma seed — creates demo users, a vault, and reference data.
 * All "sensitive" fields in seed data are clearly fake/demo values.
 */

import { PrismaClient, VaultStatus, AssetCategory, DocumentType, AccessScope } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Legacy Vault Protocol...");

  // ── Default release policy ────────────────────────────────
  const defaultPolicy = await prisma.releasePolicy.upsert({
    where: { id: "policy-default" },
    update: {},
    create: {
      id: "policy-default",
      label: "Standard Estate Release",
      guardianQuorumRequired: 2,
      guardianQuorumOf: 3,
      waitingPeriodDays: 30,
      requireAttorneyAttestation: true,
      requireDeathProof: true,
      executorIAL: 2,
    },
  });

  const strictPolicy = await prisma.releasePolicy.upsert({
    where: { id: "policy-strict" },
    update: {},
    create: {
      id: "policy-strict",
      label: "High-Value Estate Release (Strict)",
      guardianQuorumRequired: 3,
      guardianQuorumOf: 5,
      waitingPeriodDays: 60,
      requireAttorneyAttestation: true,
      requireDeathProof: true,
      executorIAL: 3,
    },
  });

  // ── Demo users ────────────────────────────────────────────
  const owner = await prisma.user.upsert({
    where: { email: "owner@demo.lvp" },
    update: {},
    create: {
      email: "owner@demo.lvp",
      name: "Alex Demo Owner",
      did: "did:key:demo-owner-z6Mk",
      role: "owner",
    },
  });

  const executor = await prisma.user.upsert({
    where: { email: "executor@demo.lvp" },
    update: {},
    create: {
      email: "executor@demo.lvp",
      name: "Jordan Demo Executor",
      did: "did:key:demo-executor-z6Mk",
      role: "executor",
    },
  });

  const beneficiary1 = await prisma.user.upsert({
    where: { email: "beneficiary1@demo.lvp" },
    update: {},
    create: {
      email: "beneficiary1@demo.lvp",
      name: "Sam Demo Beneficiary",
      did: "did:key:demo-ben1-z6Mk",
      role: "beneficiary",
    },
  });

  const guardian1 = await prisma.user.upsert({
    where: { email: "guardian1@demo.lvp" },
    update: {},
    create: {
      email: "guardian1@demo.lvp",
      name: "Morgan Demo Guardian",
      did: "did:key:demo-guardian1-z6Mk",
      role: "guardian",
    },
  });

  const guardian2 = await prisma.user.upsert({
    where: { email: "guardian2@demo.lvp" },
    update: {},
    create: {
      email: "guardian2@demo.lvp",
      name: "Riley Demo Guardian",
      did: "did:key:demo-guardian2-z6Mk",
      role: "guardian",
    },
  });

  const guardian3 = await prisma.user.upsert({
    where: { email: "guardian3@demo.lvp" },
    update: {},
    create: {
      email: "guardian3@demo.lvp",
      name: "Casey Demo Guardian",
      did: "did:key:demo-guardian3-z6Mk",
      role: "guardian",
    },
  });

  // ── Demo vault ────────────────────────────────────────────
  const vault = await prisma.vault.upsert({
    where: { id: "vault-demo-001" },
    update: {},
    create: {
      id: "vault-demo-001",
      ownerId: owner.id,
      label: "Alex Demo Estate Vault",
      description: "Demo estate vault — not real data",
      ownerDID: owner.did,
      manifestCID: "bafybei-mock-cid-000000000001",
      manifestHash: "a".repeat(64),
      status: VaultStatus.ACTIVE,
      releasePolicyId: defaultPolicy.id,
      chainTxHash: "0x" + "b".repeat(64),
    },
  });

  // ── Manifest version 1 ───────────────────────────────────
  await prisma.vaultManifest.upsert({
    where: { vaultId_version: { vaultId: vault.id, version: 1 } },
    update: {},
    create: {
      vaultId: vault.id,
      version: 1,
      cid: "bafybei-mock-cid-000000000001",
      contentHash: "a".repeat(64),
      nonce: "c".repeat(24),
      createdBy: owner.id,
    },
  });

  // ── Wallets ───────────────────────────────────────────────
  await prisma.walletRecord.createMany({
    skipDuplicates: true,
    data: [
      {
        vaultId: vault.id,
        chain: "ethereum",
        publicAddress: "0xDemoEthAddr0000000000000000000000000000",
        label: "Main ETH wallet",
        balanceSnapshot: "~2.4 ETH",
      },
      {
        vaultId: vault.id,
        chain: "solana",
        publicAddress: "DemoSolAddr111111111111111111111111111111",
        label: "Solana wallet",
        balanceSnapshot: "~150 SOL",
      },
      {
        vaultId: vault.id,
        chain: "xrpl",
        publicAddress: "rDemoXRPLAddr0000000000000000000",
        label: "XRPL account",
        balanceSnapshot: "~5000 XRP",
      },
    ],
  });

  // ── Assets ────────────────────────────────────────────────
  const cryptoAsset = await prisma.assetRecord.create({
    data: {
      vaultId: vault.id,
      category: AssetCategory.CRYPTO_EXCHANGE,
      label: "Coinbase Account",
      description: "Demo exchange account — details encrypted in vault",
    },
  });

  const realEstateAsset = await prisma.assetRecord.create({
    data: {
      vaultId: vault.id,
      category: AssetCategory.REAL_ESTATE,
      label: "Primary Residence",
      description: "Demo property — deed on file with attorney",
    },
  });

  // ── Executor ──────────────────────────────────────────────
  const executorRecord = await prisma.executor.upsert({
    where: { vaultId_userId: { vaultId: vault.id, userId: executor.id } },
    update: {},
    create: {
      vaultId: vault.id,
      userId: executor.id,
      did: executor.did,
      title: "Primary Executor",
      isPrimary: true,
      addedBy: owner.id,
    },
  });

  // ── Beneficiary ───────────────────────────────────────────
  const beneficiaryRecord = await prisma.beneficiary.upsert({
    where: { vaultId_userId: { vaultId: vault.id, userId: beneficiary1.id } },
    update: {},
    create: {
      vaultId: vault.id,
      userId: beneficiary1.id,
      did: beneficiary1.did,
      allocation: "50% of liquid crypto assets",
      scope: AccessScope.ASSIGNED_ITEMS_ONLY,
      addedBy: owner.id,
    },
  });

  // Assign asset to beneficiary
  await prisma.assetRecord.update({
    where: { id: cryptoAsset.id },
    data: { beneficiaryId: beneficiaryRecord.id },
  });

  // ── Guardians ─────────────────────────────────────────────
  for (const [user, idx] of [[guardian1, 1], [guardian2, 2], [guardian3, 3]] as const) {
    await prisma.guardian.upsert({
      where: { vaultId_userId: { vaultId: vault.id, userId: (user as typeof guardian1).id } },
      update: {},
      create: {
        vaultId: vault.id,
        userId: (user as typeof guardian1).id,
        did: (user as typeof guardian1).did,
        addedBy: owner.id,
      },
    });
  }

  // ── Document references (mock CIDs) ──────────────────────
  await prisma.documentRecord.createMany({
    skipDuplicates: true,
    data: [
      {
        vaultId: vault.id,
        type: DocumentType.WILL,
        label: "Last Will and Testament",
        description: "Executed will — encrypted on IPFS",
        cid: "bafybei-mock-will-cid-0000000001",
        plaintextHash: "d".repeat(64),
        mimeType: "application/pdf",
        releaseToRoles: ["executor", "attorney"],
        uploadedBy: owner.id,
      },
      {
        vaultId: vault.id,
        type: DocumentType.TRUST,
        label: "Revocable Living Trust",
        description: "Trust instrument — encrypted on IPFS",
        cid: "bafybei-mock-trust-cid-000000001",
        plaintextHash: "e".repeat(64),
        mimeType: "application/pdf",
        releaseToRoles: ["executor", "attorney"],
        uploadedBy: owner.id,
      },
      {
        vaultId: vault.id,
        type: DocumentType.INSTRUCTIONS,
        label: "Executor Instructions",
        description: "Step-by-step guidance for the executor",
        cid: "bafybei-mock-instr-cid-000000001",
        plaintextHash: "f".repeat(64),
        mimeType: "application/pdf",
        releaseToRoles: ["executor"],
        uploadedBy: owner.id,
      },
    ],
  });

  // ── Audit trail seed ──────────────────────────────────────
  await prisma.auditEvent.createMany({
    data: [
      {
        vaultId: vault.id,
        actorId: owner.id,
        action: "VAULT_CREATED",
        detail: { label: vault.label },
      },
      {
        vaultId: vault.id,
        actorId: owner.id,
        action: "MANIFEST_UPDATED",
        detail: { version: 1, cid: "bafybei-mock-cid-000000000001" },
      },
      {
        vaultId: vault.id,
        actorId: owner.id,
        action: "EXECUTOR_ADDED",
        detail: { executorEmail: executor.email },
      },
      {
        vaultId: vault.id,
        actorId: owner.id,
        action: "BENEFICIARY_ADDED",
        detail: { beneficiaryEmail: beneficiary1.email },
      },
      {
        vaultId: vault.id,
        actorId: owner.id,
        action: "RELEASE_POLICY_SET",
        detail: { policyId: defaultPolicy.id, policyLabel: defaultPolicy.label },
      },
    ],
  });

  console.log("✅ Seed complete.");
  console.log(`   Owner:       ${owner.email}`);
  console.log(`   Executor:    ${executor.email}`);
  console.log(`   Beneficiary: ${beneficiary1.email}`);
  console.log(`   Guardians:   ${guardian1.email}, ${guardian2.email}, ${guardian3.email}`);
  console.log(`   Vault:       ${vault.id} — ${vault.label}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
