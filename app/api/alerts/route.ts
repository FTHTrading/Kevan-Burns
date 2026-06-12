export const runtime = 'edge';

import { NextResponse } from 'next/server';

/**
 * POST /api/alerts
 * Simple alert ingestion for monitoring (extend with real email/SMS).
 * Used by monitor-contracts and agents.
 */

export async function POST(req: Request) {
  const body = await req.json();
  console.log('ALERT RECEIVED @ 5655 Peachtree Parkway, Norcross, GA 30092:', body);

  // In prod: forward to CF Worker, email (Resend), SMS (Telnyx via existing)
  return NextResponse.json({ received: true, location: '5655 Peachtree Parkway, Norcross, GA 30092', timestamp: new Date().toISOString() });
}
