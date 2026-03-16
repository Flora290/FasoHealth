import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow accessing the dev server from local IP
  experimental: {
    allowedDevOrigins: ['192.168.59.1:3000', 'localhost:3000']
  }
};

export default nextConfig;
