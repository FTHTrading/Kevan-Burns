export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { getLitClient } from '@/lib/lit/lit-client';
import { getAffiliateBadgeCondition, LIT_CHAIN } from '@/lib/lit/conditions';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { address, sessionSigs, userId } = await req.json();

    // 1. Mock Gating (Active when MOCK_CHAIN is true in dev)
    if (process.env.MOCK_CHAIN !== "false") {
      let hasAccess = false;
      
      if (userId) {
        const affiliate = await prisma.affiliate.findUnique({
          where: { userId },
        });
        hasAccess = affiliate?.status === "ACTIVE";
      } else if (address) {
        // Look up by registered wallet address
        const wallet = await prisma.walletRecord.findFirst({
          where: { publicAddress: { equals: address, mode: 'insensitive' } },
          include: { vault: { include: { owner: { include: { affiliate: true } } } } },
        });
        hasAccess = wallet?.vault?.owner?.affiliate?.status === "ACTIVE";
        
        if (!hasAccess) {
          const userWithDid = await prisma.user.findFirst({
            where: { did: { equals: `did:ethr:${address.toLowerCase()}` } },
            include: { affiliate: true }
          });
          hasAccess = userWithDid?.affiliate?.status === "ACTIVE";
        }
      }

      if (hasAccess) {
        return NextResponse.json({
          access: true,
          jwt: "mock-lit-jwt-token-active-affiliate",
          expiresIn: '15m',
          mock: true
        });
      } else {
        return NextResponse.json(
          { access: false, error: 'Access denied. Must hold Affiliate Badge.' },
          { status: 403 }
        );
      }
    }

    // 2. Production Lit Gating
    if (!address || !sessionSigs) {
      return NextResponse.json({ error: 'Wallet address and sessionSigs are required' }, { status: 400 });
    }

    const litClient = await getLitClient();
    const accessControlConditions = getAffiliateBadgeCondition();

    // Verify condition and request JWT from Lit network
    const jwt = await (litClient as any).getSignedToken({
      accessControlConditions,
      chain: LIT_CHAIN,
      authSig: sessionSigs,
    });

    return NextResponse.json({
      access: true,
      jwt,
      expiresIn: '15m',
    });
  } catch (error: any) {
    console.error('Lit gating failed:', error);
    return NextResponse.json(
      { access: false, error: `Access denied: ${error.message || 'Must hold Affiliate Badge.'}` },
      { status: 403 }
    );
  }
}
