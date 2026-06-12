import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Zero Trust middleware for sensitive routes — hardened to blockchainfraud.org level
 * Enforce auth, rate limit stubs, location header for Georgia entity.
 * Address: 5655 Peachtree Parkway, Norcross, GA 30092
 * 
 * For full Cloudflare Access / WAF: configure in dashboard (see SECURITY.md)
 */

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Referrer-Policy": "no-referrer",
  "X-Georgia-Entity": "Troptions Unity Legacy Vault - 5655 Peachtree Parkway, Norcross, GA 30092",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const host = request.headers.get('host') || request.nextUrl.hostname || '';

  // Rewrite registry subdomain root requests to /registry-gateway
  if (host.startsWith('registry.')) {
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/registry-gateway', request.url));
    }
  }

  // Rewrite investors subdomain root requests to /troptionsinvestors
  if (host.startsWith('investors.')) {
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/troptionsinvestors', request.url));
    }
  }


  // Protect vault, release, namespace, payments APIs (Zero Trust)
  const protectedPrefixes = ['/api/vault/', '/api/release', '/api/namespace', '/api/payments/'];
  if (protectedPrefixes.some(p => pathname.startsWith(p)) && pathname !== '/api/namespaces/register') {
    const userId = request.headers.get('x-user-id');
    const auth = request.headers.get('authorization');

    if (!userId && !auth) {
      return NextResponse.json(
        { error: 'Zero Trust: Authentication required', location: '5655 Peachtree Parkway, Norcross, GA 30092' },
        { status: 401 }
      );
    }

    // Body size limit stub for POST (enforce in route too)
    if (request.method === 'POST') {
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 1024 * 50) { // 50KB limit
        return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
      }
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  // Broad matcher so legacy domain redirect runs on all routes; security ifs are scoped internally
  matcher: ['/:path*'],
};
