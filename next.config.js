/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  output: isStaticExport ? 'export' : undefined,
  basePath: isStaticExport ? '/infinite-chs' : '',
  assetPrefix: isStaticExport ? '/infinite-chs/' : '',
  trailingSlash: isStaticExport ? true : false,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
