import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/shopify/types';
import { Reveal } from '@/components/motion/reveal';

const GRADE = 'brightness(0.82) contrast(1.14) saturate(0.84)';

/**
 * Every frame in the catalogue, laid out as a staggered editorial gallery
 * rather than a uniform grid — the column offsets and alternating aspect
 * ratios stop a thin catalogue from reading as a spreadsheet.
 */
export default function LookbookGallery({ products }: { products: Product[] }) {
  const frames = products.flatMap((p) =>
    p.images.map((img) => ({
      url: img.url,
      alt: img.altText || p.title,
      handle: p.handle,
      title: p.title,
    })),
  );

  if (!frames.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
      {frames.map((f, i) => (
        <Reveal
          key={`${f.url}-${i}`}
          delay={Math.min(i, 8) * 0.05}
          className={i % 3 === 1 ? 'lg:mt-16' : i % 3 === 2 ? 'lg:mt-8' : ''}
        >
          <Link href={`/products/${f.handle}`} className="group block">
            <div
              className={`relative overflow-hidden bg-carbon ${
                i % 4 === 0 ? 'aspect-[4/5]' : i % 4 === 3 ? 'aspect-square' : 'aspect-[3/4]'
              }`}
            >
              <Image
                src={f.url}
                alt={f.alt}
                fill
                sizes="(min-width:1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-[1100ms] ease-cine group-hover:scale-[1.05]"
                style={{ filter: GRADE }}
              />
              <span className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-500 ease-cine group-hover:border-bone/25" />
            </div>
            <p className="t-label mt-3 transition-colors duration-500 group-hover:text-bone">
              {f.title}
            </p>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
