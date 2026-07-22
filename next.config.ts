import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/inbox",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
