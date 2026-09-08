import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProduct, getProducts } from '@/lib/shopify';
import ProductGallery from '@/components/product/product-gallery';
import ProductForm from '@/components/product/product-form';
import ProductGrid from '@/components/product/product-grid';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const product = await getProduct(params.handle);
  if (!product) return { title: 'Product' };
  return {
    title: product.title,
    description: product.description?.slice(0, 155) || 'GDC Clothing',
    openGraph: product.featuredImage
      ? { images: [{ url: product.featuredImage.url }] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const product = await getProduct(params.handle);
  if (!product) notFound();

  const related = (await getProducts(8)).filter((p) => p.id !== product.id).slice(0, 4);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.url),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="container-site pt-6 text-xs uppercase tracking-brand text-smoke">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.title}</span>
      </div>

      <section className="container-site grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <ProductGallery images={product.images} title={product.title} />

        <div className="lg:pt-4">
          <h1 className="font-display text-4xl uppercase tracking-brand sm:text-5xl">
            {product.title}
          </h1>

          <div className="mt-6">
            <ProductForm product={product} />
          </div>

          {product.descriptionHtml && (
            <div className="mt-10 border-t border-ink/10 pt-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-brand">
                Details
              </h2>
              <div
                className="prose prose-sm max-w-none text-sm leading-relaxed text-ink/80 [&_a]:underline [&_li]:mb-1 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-site py-16">
          <h2 className="mb-8 font-display text-3xl uppercase tracking-brand">
            You might also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
