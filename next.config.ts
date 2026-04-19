import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org", // Fixed 'cobers' to 'covers'
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uwpqp7rfqptp5n7m.public.blob.vercel-storage.com"
      }
    ],
  },
};

export default nextConfig;
