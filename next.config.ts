import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow brand-file uploads through the /start intake Server Action (default is 1MB).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
