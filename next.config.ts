import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheLife: {
    layout: {
      stale: 3600,
      revalidate: 60,
      expire: 86400,
    },
  },
  experimental: {
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google avatars
      },
    ],
  },
};

export default nextConfig;
