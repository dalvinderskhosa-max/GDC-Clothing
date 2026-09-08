'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Image as ShopImage } from '@/lib/shopify/types';
import { cn } from '@/lib/utils';

const GRADE = 'brightness(0.86) contrast(1.12) saturate(0.86)';

/**
 * Stacked on desktop rather than a thumbnail carousel — with this few images
 * per piece, letting the visitor scroll full-height frames reads far better
 * than a postage-stamp strip. Mobile keeps a swipeable rail.
 */
export default function ProductGallery({
  images,
  title,
}: {
  images: ShopImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return <div className="aspect-[3/4] w-full bg-carbon" />;
  }

  return (
    <>
      {/* Desktop: a continuous column of full frames. */}
      <div className="hidden flex-col gap-2 lg:flex">
        {images.map((img, i) => (
          <div key={img.url} className="relative aspect-[4/5] w-full overflow-hidden bg-carbon">
            <Image
              src={img.url}
              alt={img.altText || `${title} — view ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(min-width:1024px) 58vw, 100vw"
              className="object-cover"
              style={{ filter: GRADE }}
            />
          </div>
        ))}
      </div>

      {/* Mobile: swipe rail with a position readout. */}
      <div className="lg:hidden">
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((img, i) => (
            <div
              key={img.url}
              className="relative aspect-[4/5] w-full flex-none snap-center bg-carbon"
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} — view ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                style={{ filter: GRADE }}
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex items-center gap-2 px-[var(--gutter)]">
            {images.map((img, i) => (
              <span
                key={img.url}
                className={cn(
                  'h-px flex-1 transition-colors duration-300',
                  i === active ? 'bg-bone' : 'bg-steel',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
