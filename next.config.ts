import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: path.resolve(projectRoot, "node_modules/tailwindcss"),
    },
  },
  webpack: (config) => {
    config.resolve.modules = [
      path.resolve(projectRoot, "node_modules"),
      ...(config.resolve.modules || ["node_modules"]),
    ];
    return config;
  },
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
