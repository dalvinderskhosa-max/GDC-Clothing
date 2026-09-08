'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Image as ShopImage } from '@/lib/shopify/types';
import { cn } from '@/lib/utils';

export default function ProductGallery({
  images,
  title,
}: {
  images: ShopImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const gallery = images.length ? images : [];

  if (!gallery.length) {
    return <div className="aspect-[3/4] w-full bg-cream" />;
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto lg:w-20 lg:flex-col">
          {gallery.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-[3/4] w-16 flex-shrink-0 overflow-hidden bg-cream lg:w-full',
                active === i ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100',
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-cream">
        <Image
          src={gallery[active].url}
          alt={gallery[active].altText || title}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
