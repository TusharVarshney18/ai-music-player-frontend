import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bensound.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // ✅ Add this line!
      },
    ],
  },
};

export default nextConfig;
