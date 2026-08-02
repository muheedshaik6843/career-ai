/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Move .next output to C:\Temp to avoid OneDrive symlink/cache corruption issues
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Disable webpack filesystem cache to prevent OneDrive file-lock issues
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  images: {
    domains: ["images.unsplash.com", "avatars.githubusercontent.com"],
  },
};

module.exports = nextConfig;
