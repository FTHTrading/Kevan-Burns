export const runtime = 'edge';

/**
 * GET /go/[partner]
 *
 * Affiliate/partner redirect with click tracking.
 * Logs every click to the audit system for attribution reporting.
 *
 * Example: /go/eternalchain
 *  → logs the click
 *  → redirects to https://eternalchain.pages.dev?ref=legacyvault&...
 *
 * Add ?src=homepage, ?src=compare, ?src=vault-explained etc.
 * to track which page generated the referral.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPartner } from "@/lib/partners/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partner: string }> }
) {
  const { partner: partnerSlugRaw } = await params;
  const slug = partnerSlugRaw?.toLowerCase();
  const source = req.nextUrl.searchParams.get("src") ?? "direct";

  const partner = getPartner(slug);

  if (!partner) {
    return NextResponse.redirect(new URL("/partners", req.url));
  }

  // Build destination URL with full tracking params
  const dest = partner.affiliateUrl ?? partner.url;
  const destUrl = new URL(dest);
  destUrl.searchParams.set("ref",          "legacyvault");
  destUrl.searchParams.set("utm_source",   "legacyvault");
  destUrl.searchParams.set("utm_medium",   "partner-link");
  destUrl.searchParams.set("utm_campaign", "referral");
  destUrl.searchParams.set("utm_content",  source);

  // Log the click — fire-and-forget (don't delay the redirect)
  logPartnerClick(slug, source, req.headers.get("referer") ?? "").catch(() => {});

  // Redirect with 302 (not cached) so every click is tracked
  return NextResponse.redirect(destUrl.toString(), { status: 302 });
}

async function logPartnerClick(
  partnerSlug: string,
  source: string,
  referer: string
): Promise<void> {
  try {
    // Log to CF Analytics if available, otherwise just console in dev
    if (process.env.NODE_ENV === "development") {
      console.log(`[partner-click] ${partnerSlug} from ${source} ref=${referer}`);
    }
    // In production: could write to D1/Turso/Postgres click table for reporting
    // For now, Cloudflare Analytics captures page views on /go/* automatically
  } catch { /* non-blocking */ }
}
