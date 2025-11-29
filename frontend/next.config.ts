import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  devIndicators: false,
  output: 'standalone',
};

export default nextConfig;
