import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  
  // Security headers (additional layer - middleware also handles this)
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Disable caching in development mode
          ...(isDev ? [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate, max-age=0',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ] : []),
        ],
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
      // Performance headers for images
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
    minimumCacheTTL: 60,
  },

  // Experimental features disabled for stability
  // optimizePackageImports for recharts conflicts with dynamic imports in dashboard
  
  // Transpile recharts to fix HMR issues with Turbopack
  transpilePackages: ['recharts'],
  
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  // Disable Turbopack for better compatibility with recharts
  // Use: npm run dev -- --turbo to enable Turbopack
  // Or remove this to use webpack (default)
  turbopack: {},
};

export default nextConfig;
