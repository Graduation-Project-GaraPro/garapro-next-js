import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable webpack cache
  // webpack: (config, { isServer }) => {
  //   config.cache = false;
  //   return config;
  // },
};

export default nextConfig;