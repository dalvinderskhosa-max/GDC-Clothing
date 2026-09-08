import type { MetadataRoute } from 'next';
import { resolveSiteUrl } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = resolveSiteUrl().origin;
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Cart and the subscribe endpoint carry no indexable content.
      disallow: ['/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
