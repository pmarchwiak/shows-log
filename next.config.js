// @ts-check

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'export',
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  // Configure Turbopack root to avoid workspace-root detection warnings
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
