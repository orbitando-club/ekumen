import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next dev rewrites this file on startup. The site does not need those agent rules.
  agentRules: false,
};

export default nextConfig;
