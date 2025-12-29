/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'source.unsplash.com',
      'plus.unsplash.com',
      'images.pexels.com',
      'i.imgur.com',
      'placehold.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Menambahkan konfigurasi untuk path /package
  async rewrites() {
    return [
      {
        source: '/package/:slug*',
        destination: '/paket-wisata/:slug*',
      },
    ];
  },
};

module.exports = nextConfig;
