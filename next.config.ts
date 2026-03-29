import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['amazon-cognito-identity-js'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
