import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/resources/new-muslim",
        destination: "/seeker",
        permanent: true,
      },
      {
        source: "/resources/:path*",
        destination: "/seeker",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
