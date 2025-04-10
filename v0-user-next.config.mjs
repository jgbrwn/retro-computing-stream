/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['archive.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'archive.org',
        pathname: '**',
      },
    ],
  },
  // Increase timeout for API routes to handle Archive.org API calls
  experimental: {
    serverComponentsExternalPackages: [],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
