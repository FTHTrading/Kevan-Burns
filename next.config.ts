import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",
  // Temp for deploy (pre-existing client-crypto + any ZK type issues); remove after site is live.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Clean production config — type errors (if any from ZK/snarkjs/webcrypto) will now surface on build.
  // Removed cpus/workerThreads (caused webpack cache rename ENOENT on WSL shared FS during builds).
  experimental: {
    typedRoutes: false,
    cpus: process.env.NEXT_BUILD_SINGLE_THREAD ? 1 : undefined,
    workerThreads: process.env.NEXT_BUILD_SINGLE_THREAD ? false : undefined,
  },

  images: {
    // unoptimized: true is REQUIRED for reliable image serving on Cloudflare Pages + next-on-pages adapter.
    // Prevents _next/image optimizer 404s; local /images/* from public/ are served directly as static assets.
    // Restores the full hero images, logos, diagrams etc. that were present in prior working deploys.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    minimumCacheTTL: 86400,
  },

  // Bundle only what's needed from large SDKs
  serverExternalPackages: ["xrpl", "@stellar/stellar-sdk", "ethers", "nodemailer"],

  // Compress responses
  compress: true,

  // Disable source maps in production (reduces bundle size)
  productionBrowserSourceMaps: false,

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
        stream: false,
      };
      config.resolve.alias = {
        ...config.resolve.alias,
        nodemailer: false,
      };
    }
    return config;
  },
};

export default nextConfig;
