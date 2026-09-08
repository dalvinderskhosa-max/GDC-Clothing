/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'gdconline.myshopify.com', pathname: '/**' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
