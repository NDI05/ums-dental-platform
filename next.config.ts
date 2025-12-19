import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Extreme Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'], // Prioritize AVIF (lighter) -> WebP
    minimumCacheTTL: 31536000, // 1 Year (Aggressive caching)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/7.x/**',
      },
      {
        protocol: 'https',
        hostname: 'illustrations.popsy.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'play.famobi.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.famobi.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'id.y8.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.y8.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nudlpazjmjrsgjbjmcqc.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 2. Enable Gzip/Brotli Compression
  compress: true,

  // 3. Cache Components (Root Level)
  // @ts-ignore - New feature in Next.js 16 canary
  cacheComponents: true,

  // 4. Experimental Features
  experimental: {
    // optimizePackageImports for faster cold starts
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns'],
  },

  // 5. Advanced Caching Headers
  async headers() {
    return [
      {
        // Cache Fonts & Static Assets aggressively
        source: '/:all*(woff2|woff|ttf|svg|png|jpg|jpeg|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js Static chunks
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
