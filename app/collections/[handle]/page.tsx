import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCollection, getCollectionProducts } from '@/lib/shopify';
import ProductGrid from '@/components/product/product-grid';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const collection = await getCollection(params.handle);
  if (!collection) return { title: 'Collection' };
  return {
    title: collection.title,
    description:
      collection.description ||
      `Shop the ${collection.title} collection at GDC Clothing.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: { handle: string };
}) {
  const [collection, products] = await Promise.all([
    getCollection(params.handle),
    getCollectionProducts(params.handle),
  ]);

  if (!collection) notFound();

  return (
    <div>
      {/* Collection header */}
      <section className="border-b border-ink/10 bg-cream">
        <div className="container-site py-14 text-center lg:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-brand text-mauve">
            Collection
          </p>
          <h1 className="font-display text-5xl uppercase tracking-brand sm:text-6xl lg:text-7xl">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mx-auto mt-4 max-w-2xl text-sm text-smoke">
              {collection.description}
            </p>
          )}
        </div>
      </section>

      <section className="container-site py-12 lg:py-16">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-xs uppercase tracking-brand text-smoke">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl uppercase tracking-brand">
              Dropping soon
            </p>
            <p className="mt-3 text-sm text-smoke">
              This collection is being restocked. Join the list to know first.
            </p>
          </div>
        ) : (
          <ProductGrid products={products} priorityCount={4} />
        )}
      </section>
    </div>
  );
}
