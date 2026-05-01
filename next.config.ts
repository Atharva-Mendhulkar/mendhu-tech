import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.hashnode.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/garden/:id',
        destination: '/?garden=:id',
      },
    ];
  },
};

export default nextConfig;
