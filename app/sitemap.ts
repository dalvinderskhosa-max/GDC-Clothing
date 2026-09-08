import type { MetadataRoute } from 'next';
import {
  getAllProductHandles,
  getCollections,
  getPageHandles,
  getBlogHandles,
  getBlogArticles,
} from '@/lib/shopify';
import { resolveSiteUrl } from '@/lib/env';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = resolveSiteUrl().origin;
  const now = new Date();

  const [products, collections, pages, blogs] = await Promise.all([
    getAllProductHandles().catch(() => []),
    getCollections().catch(() => []),
    getPageHandles().catch(() => []),
    getBlogHandles().catch(() => []),
  ]);

  const articles = (
    await Promise.all(
      blogs.map(async (blog) => {
        const list = await getBlogArticles(blog, 100).catch(() => []);
        return list.map((a) => ({
          url: `${base}/blogs/${blog}/${a.handle}`,
          lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }));
      }),
    )
  ).flat();

  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/collections/shop-all`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...products.map((handle) => ({
      url: `${base}/products/${handle}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...collections.map((c) => ({
      url: `${base}/collections/${c.handle}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...blogs.map((handle) => ({
      url: `${base}/blogs/${handle}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...articles,
    ...pages.map((handle) => ({
      url: `${base}/pages/${handle}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
  ];
}
