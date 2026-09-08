/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Don't block Netlify builds on lint; we lint separately.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
