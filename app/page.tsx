import Image from 'next/image';
import Link from 'next/link';
import { getCollectionProducts, getProducts } from '@/lib/shopify';
import type { Product } from '@/lib/shopify/types';
import ProductGrid from '@/components/product/product-grid';
import SectionHeading from '@/components/home/section-heading';
import { formatMoney } from '@/lib/utils';

export const revalidate = 1800;

const FEATURED_COLLECTIONS = [
  { handle: 'graphic-tees', title: 'Graphic Tees', copy: 'Statement pieces' },
  { handle: 'tracksuits', title: 'Tracksuits', copy: 'Head to toe' },
  { handle: 'accessories', title: 'Accessories', copy: 'Finish the fit' },
];

async function firstImageOf(handle: string): Promise<string | null> {
  const products = await getCollectionProducts(handle, 1);
  return products[0]?.featuredImage?.url ?? null;
}

export default async function HomePage() {
  // Pull data with graceful fallbacks so a thin catalogue still looks full.
  const [newInRaw, allProducts, tileImages] = await Promise.all([
    getCollectionProducts('new-in', 8),
    getProducts(12, 'BEST_SELLING'),
    Promise.all(FEATURED_COLLECTIONS.map((c) => firstImageOf(c.handle))),
  ]);

  const newIn: Product[] = newInRaw.length ? newInRaw : allProducts;
  const spotlight = newIn[0] || allProducts[0];
  const heroImage =
    spotlight?.images?.[1]?.url ||
    spotlight?.featuredImage?.url ||
    tileImages.find(Boolean) ||
    null;

  // Build a lookbook from whatever imagery the catalogue has.
  const lookbookImages = Array.from(
    new Set(
      allProducts
        .flatMap((p) => p.images.map((i) => i.url))
        .filter(Boolean),
    ),
  ).slice(0, 6);

  return (
    <div>
      {/* ============================ HERO ============================ */}
      <section className="relative flex min-h-[82vh] items-end overflow-hidden bg-ink text-paper">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="container-site relative z-10 pb-16 lg:pb-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-paper/80">
            Drop 001 — Out now
          </p>
          <h1 className="max-w-4xl font-display text-6xl uppercase leading-[0.9] tracking-brand sm:text-7xl lg:text-8xl">
            Money oriented.
            <br />
            Grind focused.
          </h1>
          <p className="mt-5 max-w-md text-sm text-paper/70">
            Premium streetwear for those building something bigger than themselves.
            Made for the come-up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/collections/new-in" className="btn-primary bg-paper text-ink hover:bg-mauve hover:text-paper">
              Shop new in
            </Link>
            <Link href="/collections/drop-001" className="btn-outline border-paper text-paper hover:bg-paper hover:text-ink">
              Explore Drop 001
            </Link>
          </div>
        </div>
      </section>

      {/* ========================= TRUST STRIP ======================= */}
      <section className="border-b border-ink/10 bg-cream">
        <div className="container-site grid grid-cols-2 divide-x divide-ink/10 text-center md:grid-cols-4">
          {[
            ['Free UK Shipping', 'On orders over £75'],
            ['30-Day Returns', 'Hassle-free'],
            ['Secure Checkout', 'Powered by Shopify'],
            ['Premium Quality', 'Built to last'],
          ].map(([t, s]) => (
            <div key={t} className="px-3 py-6">
              <p className="text-xs font-bold uppercase tracking-brand">{t}</p>
              <p className="mt-1 text-[11px] text-smoke">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= CATEGORY TILES ====================== */}
      <section className="container-site py-16 lg:py-24">
        <SectionHeading eyebrow="Shop by category" title="Find your fit" />
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURED_COLLECTIONS.map((c, i) => (
            <Link
              key={c.handle}
              href={`/collections/${c.handle}`}
              className="group relative aspect-[4/5] overflow-hidden bg-cream"
            >
              {tileImages[i] && (
                <Image
                  src={tileImages[i]!}
                  alt={c.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-paper">
                <p className="text-xs uppercase tracking-brand text-paper/70">{c.copy}</p>
                <h3 className="font-display text-3xl uppercase tracking-brand">{c.title}</h3>
                <span className="link-underline mt-2 inline-block text-xs font-semibold uppercase tracking-brand">
                  Shop now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== SPOTLIGHT PRODUCT ===================== */}
      {spotlight && (
        <section className="bg-ink text-paper">
          <div className="container-site grid items-stretch gap-0 lg:grid-cols-2">
            <div className="relative aspect-square lg:aspect-auto lg:min-h-[600px]">
              {spotlight.featuredImage && (
                <Image
                  src={spotlight.featuredImage.url}
                  alt={spotlight.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-col justify-center px-6 py-16 lg:px-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-brand text-mauve">
                Featured
              </p>
              <h2 className="font-display text-5xl uppercase leading-none tracking-brand lg:text-6xl">
                {spotlight.title}
              </h2>
              <p className="mt-4 max-w-md text-sm text-paper/70 line-clamp-4">
                {spotlight.description || 'A GDC staple. Cut heavy, built to last, worn by the movement.'}
              </p>
              <p className="mt-6 text-2xl font-semibold">
                {formatMoney(spotlight.priceRange.minVariantPrice)}
              </p>
              <div className="mt-8">
                <Link
                  href={`/products/${spotlight.handle}`}
                  className="btn-primary bg-paper text-ink hover:bg-mauve hover:text-paper"
                >
                  Shop this piece
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================== NEW IN =========================== */}
      <section className="container-site py-16 lg:py-24">
        <SectionHeading
          eyebrow="Fresh drops"
          title="New in"
          href="/collections/new-in"
        />
        <ProductGrid products={newIn.slice(0, 8)} priorityCount={0} />
      </section>

      {/* ========================= LOOKBOOK ========================== */}
      {lookbookImages.length >= 3 && (
        <section className="bg-cream py-16 lg:py-24">
          <div className="container-site">
            <SectionHeading
              eyebrow="The Lookbook"
              title="Worn by the movement"
              href="/pages/lookbook"
              linkLabel="Full lookbook"
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
              {lookbookImages.map((url, i) => (
                <div
                  key={url}
                  className={`relative overflow-hidden bg-paper ${
                    i === 0 ? 'col-span-2 row-span-2 aspect-square md:col-span-1' : 'aspect-[3/4]'
                  }`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================== BRAND STORY ======================== */}
      <section className="container-site grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream">
          {(lookbookImages[1] || heroImage) && (
            <Image
              src={lookbookImages[1] || heroImage!}
              alt="GDC Clothing"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-brand text-mauve">
            The Grind
          </p>
          <h2 className="font-display text-5xl uppercase leading-none tracking-brand lg:text-6xl">
            More than clothing.
            <br />
            It&apos;s a mindset.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/70">
            GDC was built for the ones who don&apos;t stop. Every piece is a reminder of
            what you&apos;re working towards — designed in the UK, made for the movement.
            Money oriented, grind focused, no shortcuts.
          </p>
          <div className="mt-8">
            <Link href="/pages/about-us" className="btn-outline">
              Our story
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
