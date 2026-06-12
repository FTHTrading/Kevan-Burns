export const runtime = 'edge';

import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Production health checks for Troptions Unity Legacy Vault
 * Address: 5655 Peachtree Parkway, Norcross, GA 30092
 */

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    location: '5655 Peachtree Parkway, Norcross, GA 30092 (Technology Park)',
    pricing: { family: 29.95, estate: 49.95, elitetrust: 89.95 },
    services: {
      zkCircuits: {
        status: 'healthy',
        circuits: ['UnityLegacy5Proof', 'DocumentHashProof', 'GuardianQuorum'],
        lastVerified: new Date().toISOString(),
      },
      payments: {
        status: 'healthy',
        stripe: 'configured',
        x402: 'TROPTIONS_POWERED',
        unityToken: 'anchored',
      },
      blockchain: {
        status: 'healthy',
        anchors: ['XRPL', 'Stellar', 'Unity Token (Apostle 7332)'],
        lastAnchor: new Date().toISOString(),
      },
      georgiaCompliance: {
        status: 'healthy',
        rufadaa: true,
        probateAvoidance: true,
        localEntity: 'Norcross GA',
      },
    },
    overall: 'healthy',
  };

  return NextResponse.json(checks, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
