import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org", // Fixed 'cobers' to 'covers'
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;