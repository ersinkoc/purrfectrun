import type { NextConfig } from 'next';
const pagesBuild = process.env.GITHUB_PAGES === 'true';
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: pagesBuild ? 'export' : undefined,
  trailingSlash: pagesBuild,
  images: { unoptimized: pagesBuild },
};
export default config;
