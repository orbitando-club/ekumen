import type { NextConfig } from "next";

/** Repo name on GitHub → site lives at /ekumen/ */
const repo = "ekumen";
const forPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // Next dev rewrites this file on startup. The site does not need those agent rules.
  agentRules: false,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.17"],
  experimental: {
    agentUpgrade: "security",
  },
  ...(forPages
    ? {
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
      }
    : {}),
};

export default nextConfig;
