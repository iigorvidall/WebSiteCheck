import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true, // Redirecionamento permanente (301)
      },
    ];
  },
};

export default nextConfig;
