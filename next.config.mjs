const nextConfig = {
  serverExternalPackages: ['amazon-cognito-identity-js'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
