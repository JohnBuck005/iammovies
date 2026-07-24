import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build-time tsc OOMs on this project's type graph under Next 16's worker.
  // We type-check separately via `tsc` (passes clean); skip it in `next build`.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
