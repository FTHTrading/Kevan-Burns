import { McpServer } from "../mcp-helper";
import { PrismaClient } from "@prisma/client";

const server = new McpServer("referral-hustler-mcp", "1.0.0");
const prisma = new PrismaClient();

server.registerTool({
  name: "resolve_referral",
  description: "Check if a referral code is registered and active in the affiliate database.",
  inputSchema: {
    type: "object",
    properties: {
      referralCode: { type: "string", description: "The affiliate code, e.g., 'KB-LEGACY'." }
    },
    required: ["referralCode"]
  },
  handler: async (args) => {
    const { referralCode } = args;
    console.error(`[referral-hustler-mcp] Resolving referral code: ${referralCode}`);

    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode }
    });

    if (!affiliate) {
      return {
        success: false,
        error: `Referral code '${referralCode}' was not found in the registry.`
      };
    }

    return {
      success: true,
      affiliateId: affiliate.id,
      status: affiliate.status,
      namespace: affiliate.namespace,
      createdAt: affiliate.createdAt
    };
  }
});

server.registerTool({
  name: "track_conversion",
  description: "Record a successful user onboarding conversion bound to a referrer affiliate.",
  inputSchema: {
    type: "object",
    properties: {
      referredUserId: { type: "string", description: "The ID of the newly registered user." },
      referralCode: { type: "string", description: "The code of the referring affiliate." }
    },
    required: ["referredUserId", "referralCode"]
  },
  handler: async (args) => {
    const { referredUserId, referralCode } = args;
    console.error(`[referral-hustler-mcp] Tracking conversion: User ${referredUserId} referred by code ${referralCode}`);

    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode }
    });

    if (!affiliate) {
      return {
        success: false,
        error: `Active affiliate not found for code: ${referralCode}`
      };
    }

    const conversion = await prisma.referral.upsert({
      where: { referredUserId },
      update: {
        affiliateId: affiliate.id,
        status: "CONVERTED"
      },
      create: {
        affiliateId: affiliate.id,
        referredUserId,
        status: "CONVERTED"
      }
    });

    return {
      success: true,
      referralId: conversion.id,
      status: conversion.status,
      timestamp: conversion.createdAt
    };
  }
});

server.registerTool({
  name: "distribute_reward_split",
  description: "Audit and log a commission reward split on a completed platform execution.",
  inputSchema: {
    type: "object",
    properties: {
      referralCode: { type: "string", description: "The referral code identifying the affiliate." },
      amount: { type: "string", description: "The payout reward amount (e.g. '200000' for 2 USDC)." },
      currency: { type: "string", description: "The payout currency symbol, e.g. 'USDC'." },
      txHash: { type: "string", description: "The transaction hash of the execution." }
    },
    required: ["referralCode", "amount", "txHash"]
  },
  handler: async (args) => {
    const { referralCode, amount, currency = "USDC", txHash } = args;
    console.error(`[referral-hustler-mcp] Distributing reward split: ${amount} ${currency} for code ${referralCode}`);

    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode }
    });

    if (!affiliate) {
      return {
        success: false,
        error: `Affiliate registry record missing for code: ${referralCode}`
      };
    }

    const reward = await prisma.referralReward.upsert({
      where: { txHash },
      update: {
        amount,
        currency,
        affiliateId: affiliate.id
      },
      create: {
        affiliateId: affiliate.id,
        txHash,
        amount,
        currency
      }
    });

    return {
      success: true,
      rewardId: reward.id,
      amount: reward.amount,
      currency: reward.currency,
      settledAt: reward.settledAt
    };
  }
});

server.start();
console.error("ReferralHustler MCP Server started successfully.");
