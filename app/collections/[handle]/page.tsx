import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollection, getCollectionProducts, getProducts, getCollections } from '@/lib/shopify';
import { curate } from '@/lib/brand';
import ProductGrid from '@/components/product/product-grid';
import { RevealText, Reveal } from '@/components/motion/reveal';

export const revalidate = 1800;

/** shop-all is a virtual collection: everything, in merchandised order. */
const ALL = 'shop-all';

/**
 * Prerender every collection at build time. These were server-rendered per
 * request, which put a Shopify round trip in front of each navigation.
 */
export async function generateStaticParams() {
  const collections = await getCollections().catch(() => []);
  return [{ handle: ALL }, ...collections.map((c) => ({ handle: c.handle }))];
}

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  if (params.handle === ALL) return { title: 'Shop all' };
  const collection = await getCollection(params.handle);
  if (!collection) return { title: 'Not found' };
  return {
    title: collection.title,
    description: collection.description?.slice(0, 160) || undefined,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: { handle: string };
}) {
  const isAll = params.handle === ALL;

  const [collection, products] = await Promise.all([
    isAll ? Promise.resolve(null) : getCollection(params.handle),
    isAll ? getProducts(100, 'BEST_SELLING') : getCollectionProducts(params.handle, 100),
  ]);

  if (!isAll && !collection) notFound();

  const items = curate(products);
  const title = isAll ? 'Shop all' : collection!.title;

  // Shopify strips newlines out of the plain-text description, so long copy
  // arrives as one run-on block. Keep the opening and let the piece pages carry
  // the detail rather than dumping the whole thing at the top of a grid.
  const blurb = (isAll ? '' : collection!.description || '').trim();
  const intro = blurb.length > 190 ? `${blurb.slice(0, 190).trimEnd()}…` : blurb;

  return (
    <div className="pt-[var(--header-h)]">
      <header className="container-site border-b border-steel py-[clamp(2.5rem,7vh,5rem)]">
        <p className="t-label mb-5">Collection</p>
        <RevealText as="h1" text={title} className="t-h1 block text-bone" />
        {intro && <p className="t-body mt-7 max-w-xl">{intro}</p>}
        <p className="t-label mt-8 tabular-nums">
          {items.length} {items.length === 1 ? 'piece' : 'pieces'}
        </p>
      </header>

      <section className="container-site py-[clamp(2.5rem,7vh,5rem)]">
        {items.length ? (
          <ProductGrid products={items} priorityCount={4} />
        ) : (
          <p className="t-body py-20 text-center">Nothing in this collection yet.</p>
        )}
      </section>
    </div>
  );
}
