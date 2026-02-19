/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/BlueBush',
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
};

export default nextConfig;
