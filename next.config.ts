import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://127.0.0.1:5001/worldcup26-ioextended/us-central1/api/:path*'
          : 'https://us-central1-worldcup26-ioextended.cloudfunctions.net/api/:path*',
      },
    ];
  },
};

export default nextConfig;
