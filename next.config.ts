import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {}, // 👈 THIS silences the error
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
    };
    return config;
  },
};

export default nextConfig;
