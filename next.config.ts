import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep the dev overlay badge out of screen captures.
  devIndicators: false,
};

export default nextConfig;
