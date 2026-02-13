import type { NextConfig } from "next";
import { execSync } from "child_process";

// Get git commit hash at build time
const getGitCommitHash = (): string => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
};

// Get version from package.json
const getVersion = (): string => {
  try {
    const pkg = require("./package.json");
    return pkg.version || "0.1.0";
  } catch {
    return "0.1.0";
  }
};

const nextConfig: NextConfig = {
  // SECURITY: Only NEXT_PUBLIC_* are exposed to the client. Never add SESSION_SECRET, DATABASE_URL, etc.
  env: {
    NEXT_PUBLIC_VERSION: getVersion(),
    NEXT_PUBLIC_COMMIT_ID: getGitCommitHash(),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  // Performance optimizations
  compress: true,

  // Fast Refresh / Hot Module Replacement configuration
  reactStrictMode: true,

  // Production optimizations
  poweredByHeader: false,

  // Webpack configuration for better HMR and SSR
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Improve HMR performance - check for changes more frequently
      config.watchOptions = {
        poll: 300, // Check for changes every 300ms (very responsive)
        aggregateTimeout: 100, // Minimal delay before rebuilding
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };

      // Enable caching for faster HMR rebuilds (Next.js handles invalidation properly)
      // Cache helps with faster incremental builds
      if (!config.cache) {
        config.cache = {
          type: 'filesystem',
          buildDependencies: {
            config: [__filename],
          },
        };
      }
    }

    // Optimize for SSR/CSR consistency
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },

  // Security headers - CSP, HSTS, Permissions-Policy (OWASP). Future: tighten CSP with nonce/hash to remove unsafe-inline.
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const isProd = process.env.NODE_ENV === 'production';
    const htmlCacheHeader = {
      key: 'Cache-Control',
      value: 'no-cache, no-store, must-revalidate, max-age=0',
    };
    const htmlExpiresPragma = [
      { key: 'Pragma', value: 'no-cache' },
      { key: 'Expires', value: '0' },
    ];

    // CSP, HSTS, Permissions-Policy from lib/security/headers
    const cspGoogleApis = process.env.CSP_GOOGLE_APIS || 'https://sheets.googleapis.com https://www.googleapis.com https://*.googleapis.com';
    const r2Domains = ['https://*.r2.cloudflarestorage.com', 'https://*.r2.dev'];
    const extraDomains = process.env.CSP_ADDITIONAL_DOMAINS
      ? process.env.CSP_ADDITIONAL_DOMAINS.split(',').map(d => d.trim()).filter(Boolean)
      : [];
    const connectSrc = ["'self'", cspGoogleApis, "https://cdn.jsdelivr.net", ...r2Domains, ...extraDomains, ...(isDev ? ["http://localhost:*", "http://127.0.0.1:*"] : [])].join(' ');
    const scriptSrc = ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), "https://cdn.jsdelivr.net"].join(' ');
    const csp = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src ${connectSrc}`,
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'none'",
      ...(isProd ? ["upgrade-insecure-requests"] : []),
    ].join('; ');
    const permissionsPolicy = 'accelerometer=(),autoplay=(),camera=(),cross-origin-isolated=(),display-capture=(),encrypted-media=(),fullscreen=(self),geolocation=(),gyroscope=(),microphone=(),payment=(),usb=(),web-share=()';
    const hstsMaxAge = parseInt(process.env.HSTS_MAX_AGE || '31536000', 10);

    const commonSecurityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Content-Security-Policy', value: csp },
      { key: 'Permissions-Policy', value: permissionsPolicy },
      { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
      ...(isProd ? [{ key: 'Strict-Transport-Security', value: `max-age=${hstsMaxAge}; includeSubDomains; preload` }] : []),
      ...(isDev ? [htmlCacheHeader, ...htmlExpiresPragma] : [htmlCacheHeader]),
    ];

    return [
      {
        source: '/:path*',
        headers: commonSecurityHeaders,
      },
      // Performance headers for static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Performance headers for dynamic images (avatars, etc.) - short cache for updates
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 100], // Explicitly allowed qualities
    minimumCacheTTL: 1, // Low TTL to ensure fresh images after updates
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-747c758d4cff43ac9aa105823eedad2c.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Experimental features. SECURITY: In production prefer domain-only allowedOrigins; VPS IP only if needed.
  experimental: {
    serverActions: {
      allowedOrigins: [
        "fabiole.com",
        "www.fabiole.com",
        "fabio-le-pt.com",
        "www.fabio-le-pt.com",
        "localhost:3000",
        "127.0.0.1:3000",
        "57.128.218.55", // VPS IP - prefer domain in production
      ],
    },
  },

  // Explicitly allowing cross-origin requests for development
  // @ts-ignore - Check if property exists on type, if not ignore
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "57.128.218.55"],

  // Transpile recharts to fix HMR issues with Turbopack
  transpilePackages: ['recharts'],

  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  // Disable Turbopack for better compatibility with recharts
  // Use: npm run dev -- --turbo to enable Turbopack
  // Or remove this to use webpack (default)
  turbopack: {
    // Explicitly set root to avoid warnings on VPS with multiple lockfiles
    root: process.cwd(),
  },
};

export default nextConfig;
