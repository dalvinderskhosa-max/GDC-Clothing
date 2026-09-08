import Image from 'next/image';
import Link from 'next/link';
import { getCollectionProducts, getProducts } from '@/lib/shopify';
import type { Product } from '@/lib/shopify/types';
import { BRAND, FILM, FEATURED, HERO, curate, showable } from '@/lib/brand';
import { formatMoney } from '@/lib/utils';
import HeroFilm from '@/components/home/hero-film';
import SectionHeading from '@/components/home/section-heading';
import DropExperience from '@/components/home/drop-experience';
import FilmBreak from '@/components/home/film-break';
import Ticker from '@/components/home/ticker';
import { Reveal, RevealText } from '@/components/motion/reveal';

export const revalidate = 1800;

const GRADE = 'brightness(0.8) contrast(1.16) saturate(0.82)';

export default async function HomePage() {
  const [dropRaw, allProducts, tiles] = await Promise.all([
    getCollectionProducts('drop-001', 8),
    getProducts(12, 'BEST_SELLING'),
    Promise.all(
      FEATURED.map(async (c) => ({
        ...c,
        image: (await getCollectionProducts(c.handle, 1))[0]?.featuredImage?.url ?? null,
      })),
    ),
  ]);

  // Merchandised order, not collection order — see lib/brand.ts.
  const drop: Product[] = curate(dropRaw.length ? dropRaw : allProducts);
  const sequence = showable(drop);
  const spotlight = drop.find((p) => p.handle === HERO) ?? sequence[0] ?? drop[0];
  const spotlightImage = spotlight?.images?.[1]?.url ?? spotlight?.featuredImage?.url ?? null;

  const lookbook = Array.from(
    new Set(allProducts.flatMap((p) => p.images.map((i) => i.url)).filter(Boolean)),
  ).slice(0, 5);

  return (
    <>
      <HeroFilm />

      <Ticker
        items={[BRAND.tagline.join(' '), 'Drop 001 out now', 'Designed in the UK', 'Free UK shipping over £75']}
      />

      {/* ---------------------------- SPOTLIGHT ---------------------------- */}
      {spotlight && (
        <section className="border-b border-steel">
          <div className="grid lg:grid-cols-[1.1fr_1fr]">
            <Reveal className="relative aspect-[4/5] overflow-hidden bg-carbon lg:aspect-auto lg:min-h-[86vh]" y={0}>
              {spotlightImage && (
                <Image
                  src={spotlightImage}
                  alt={spotlight.title}
                  fill
                  sizes="(min-width:1024px) 55vw, 100vw"
                  className="object-cover"
                  style={{ filter: GRADE }}
                />
              )}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-ink/30" />
            </Reveal>

            <div className="flex flex-col justify-center px-[var(--gutter)] py-20 lg:py-0">
              <p className="t-label mb-5">The piece</p>
              <RevealText
                as="h2"
                text={spotlight.title}
                className="t-h1 block text-bone"
              />
              <Reveal delay={0.15}>
                <p className="t-body mt-7 max-w-sm">
                  {spotlight.description?.slice(0, 220) ||
                    'A GDC staple. Cut heavy, built to last, worn by the movement.'}
                </p>
                <p className="mt-8 text-2xl tabular-nums text-bone">
                  {formatMoney(spotlight.priceRange.minVariantPrice)}
                </p>
                <div className="mt-9">
                  <Link href={`/products/${spotlight.handle}`} className="btn-solid">
                    Shop this piece
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ---- DROP: the collection as a scroll-driven dolly shot ---- */}
      <DropExperience products={sequence} />

      {/* --------------------------- FILM BREAK ---------------------------- */}
      <FilmBreak
        src={FILM.secondary.src}
        heading="Built for the come-up"
        body="Every piece is a reminder of what you're working towards. Designed in the UK, made for the movement."
      />

      {/* --------------------------- COLLECTIONS --------------------------- */}
      <section className="container-site py-[clamp(4rem,10vh,8rem)]">
        <SectionHeading eyebrow="Shop by category" title="Find your fit" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((c, i) => (
            <Reveal key={c.handle} delay={i * 0.07}>
              <Link
                href={`/collections/${c.handle}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-carbon"
              >
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1100ms] ease-cine group-hover:scale-[1.06]"
                    style={{ filter: GRADE }}
                  />
                )}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-5">
                  <span className="t-label block">{c.label}</span>
                  <span
                    className="mt-1.5 block text-[19px] uppercase leading-none text-bone"
                    style={{ fontVariationSettings: "'wdth' 80, 'wght' 800", letterSpacing: '-0.01em' }}
                  >
                    {c.title}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------- LOOKBOOK ----------------------------- */}
      {lookbook.length >= 4 && (
        <section className="border-y border-steel bg-carbon py-[clamp(4rem,10vh,8rem)]">
          <div className="container-site">
            <SectionHeading eyebrow="The lookbook" title="Worn by the movement" href="/pages/lookbook" linkLabel="Full lookbook" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {lookbook.slice(0, 4).map((url, i) => (
                <Reveal
                  key={url}
                  delay={i * 0.08}
                  className={i % 3 === 0 ? 'lg:mt-12' : ''}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-ink">
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-[1100ms] ease-cine hover:scale-[1.05]"
                      style={{ filter: GRADE }}
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------- BRAND STORY --------------------------- */}
      <section className="container-site py-[clamp(5rem,14vh,10rem)]">
        <div className="max-w-4xl">
          <p className="t-label mb-6">The grind</p>
          <RevealText
            as="h2"
            text="More than clothing. It's a mindset."
            className="t-h1 block text-bone"
          />
          <Reveal delay={0.2}>
            <p className="t-body mt-8 max-w-xl">
              GDC was built for the ones who don&apos;t stop. Money oriented, grind focused,
              no shortcuts — designed in the UK and made for everyone building something
              bigger than themselves.
            </p>
            <div className="mt-10">
              <Link href="/pages/about-us" className="btn-ghost">
                Our story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
