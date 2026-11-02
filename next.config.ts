import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Dev-only "N" badge: keep it off the dashboard sidebar.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
