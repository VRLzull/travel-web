import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfigurasi environment variables yang akan tersedia di sisi client
  env: {
    // Pastikan variabel environment ini tersedia di client-side
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Konfigurasi untuk mengizinkan gambar dari domain eksternal
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' },
      { protocol: 'http', hostname: '**', pathname: '/**' },
    ],
  },
  experimental: {
    // Mengizinkan akses dari IP lokal/network
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        // Tambahkan IP atau host lain yang diperlukan
      ],
    },
  },
  // Nonaktifkan source maps di production untuk keamanan
  productionBrowserSourceMaps: false,
  // Kompresi aset statis
  compress: true,
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Konfigurasi CORS untuk development
  async headers() {
    return [
      {
        // Mengizinkan semua origin untuk development
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
