/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/hiemornitoring',
  assetPrefix: '/hiemornitoring/',
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
