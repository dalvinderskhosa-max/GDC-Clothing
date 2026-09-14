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
  // Paths that only existed on the Shopify-hosted storefront. Search engines
  // and old links still send people here; land them somewhere real.
  async redirects() {
    return [
      { source: '/collections/all', destination: '/collections/shop-all', permanent: true },
      { source: '/collections', destination: '/collections/shop-all', permanent: true },
      { source: '/products', destination: '/collections/shop-all', permanent: true },
      { source: '/search', destination: '/collections/shop-all', permanent: false },
      { source: '/cart', destination: '/', permanent: false },
      { source: '/policies/:path*', destination: '/pages/faqs', permanent: false },
    ];
  },
};

export default nextConfig;
