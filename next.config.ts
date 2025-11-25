import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors for jsonwebtoken type issue
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
