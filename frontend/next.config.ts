import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors for jsonwebtoken type issue
    ignoreBuildErrors: false,
    
  },
  devIndicators: false,
  output: 'standalone', // Enable standalone output for Docker deployment
};

export default nextConfig;
