import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bensound.com",
      },
    ],
  },
};

export default nextConfig;
