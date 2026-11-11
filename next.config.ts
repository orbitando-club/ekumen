import type { NextConfig } from "next";

/** Repo name on GitHub → site lives at /ekumen/ */
const repo = "ekumen";
const forPages = process.env.GITHUB_PAGES === "true";

const basePath = forPages ? `/${repo}` : "";

const nextConfig: NextConfig = {
  // Next dev rewrites this file on startup. The site does not need those agent rules.
  agentRules: false,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Hosts LAN (p. ej. http://192.168.x.x:3000) para HMR / assets de dev.
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.*.*", "10.*.*.*"],
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  experimental: {
    agentUpgrade: "security",
  },
  ...(forPages
    ? {
        basePath,
        assetPrefix: `${basePath}/`,
      }
    : {}),
};

export default nextConfig;
