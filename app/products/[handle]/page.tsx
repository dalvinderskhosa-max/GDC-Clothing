import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getAllProductHandles, getProducts } from '@/lib/shopify';
import { showable } from '@/lib/brand';
import ProductGallery from '@/components/product/product-gallery';
import ProductForm from '@/components/product/product-form';
import ProductCard from '@/components/product/product-card';
import { Reveal } from '@/components/motion/reveal';

export const revalidate = 1800;

export async function generateStaticParams() {
  const handles = await getAllProductHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const product = await getProduct(params.handle);
  if (!product) return { title: 'Not found' };
  const image = product.featuredImage?.url;
  return {
    title: product.title,
    description: product.description?.slice(0, 160) || undefined,
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 160) || undefined,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const product = await getProduct(params.handle);
  if (!product) notFound();

  const all = await getProducts(12, 'BEST_SELLING');
  const related = showable(all).filter((p) => p.handle !== product.handle).slice(0, 4);

  return (
    <>
      <div className="pt-[var(--header-h)]">
        <div className="container-site flex items-center gap-2 py-5">
          <Link href="/" className="t-label link-wipe hover:text-bone">
            Home
          </Link>
          <span className="t-label text-smoke">/</span>
          <Link href="/collections/shop-all" className="t-label link-wipe hover:text-bone">
            Shop
          </Link>
          <span className="t-label text-smoke">/</span>
          <span className="t-label text-bone">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          <div className="lg:border-r lg:border-steel">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          {/* The buy panel stays with you all the way down the gallery. */}
          <div className="relative">
            <div className="lg:sticky lg:top-[var(--header-h)]">
              <div className="px-[var(--gutter)] py-10 lg:py-14">
                <h1 className="t-h2 text-bone">{product.title}</h1>

                <div className="mt-7">
                  <ProductForm product={product} />
                </div>

                {product.descriptionHtml && (
                  <div
                    className="mt-10 space-y-4 border-t border-steel pt-8 text-[14px] leading-relaxed text-mist [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-bone"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                )}

                <dl className="mt-10 grid grid-cols-2 gap-px border-t border-steel bg-steel text-[12px]">
                  {[
                    ['Shipping', 'Free UK over £75'],
                    ['Returns', '30 days'],
                    ['Delivery', '2–4 working days'],
                    ['Origin', 'Designed in the UK'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-ink px-4 py-4">
                      <dt className="t-label mb-1">{k}</dt>
                      <dd className="text-bone">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-site border-t border-steel py-[clamp(3.5rem,9vh,7rem)]">
          <div className="mb-9 border-b border-steel pb-5">
            <p className="t-label mb-3">Complete the fit</p>
            <h2 className="t-h2 text-bone">More from the drop</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
