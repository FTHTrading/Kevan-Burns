// workers/rate-limiter-worker.js
// Lightweight Cloudflare Worker for edge rate-limiting and signup buffering.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only intercept namespace registration requests
    if (url.pathname === "/api/namespaces/register" && request.method === "POST") {
      const clientIP = request.headers.get("CF-Connecting-IP") || "anonymous";
      const cacheKey = `rate-limit:${clientIP}`;
      
      // Simple Cache-based rate limiting for 5 requests per minute
      const cache = caches.default;
      const rateLimitResponse = await cache.match(new Request(`https://limit.local/${cacheKey}`));
      
      if (rateLimitResponse) {
        const data = await rateLimitResponse.json();
        if (data.count >= 5) {
          return new Response(
            JSON.stringify({ error: "Too many sign-ups from this IP. Please try again in a minute." }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": "60"
              }
            }
          );
        } else {
          // Increment count
          const newCount = data.count + 1;
          const updatedResp = new Response(JSON.stringify({ count: newCount }), {
            headers: { "Cache-Control": "max-age=60" }
          });
          ctx.waitUntil(cache.put(new Request(`https://limit.local/${cacheKey}`), updatedResp));
        }
      } else {
        // First request in the minute window
        const initialResp = new Response(JSON.stringify({ count: 1 }), {
          headers: { "Cache-Control": "max-age=60" }
        });
        ctx.waitUntil(cache.put(new Request(`https://limit.local/${cacheKey}`), initialResp));
      }
    }
    
    // Pass request through to the Next.js origin server on VPS
    return fetch(request);
  }
};
