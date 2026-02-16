import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pilareta.com',
        pathname: '/cdn/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
  },
  // Increase body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/ugc',
        destination: '/community',
        permanent: true,
      },
      {
        source: '/ugc/:path*',
        destination: '/community/:path*',
        permanent: true,
      },
      {
        source: '/admin/ugc',
        destination: '/admin/community',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
