'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/shopify/types';
import { formatMoney, cn } from '@/lib/utils';

/**
 * The catalogue is shot on a light grey studio backdrop, which fights a black
 * page. Every product image is therefore graded down on the way in so the
 * backdrop lands close to the site's own greys and the garment keeps the
 * contrast. Second image, where one exists, cross-fades on hover.
 */
export default function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  const primary = product.featuredImage ?? product.images[0] ?? null;
  const secondary = product.images.find((i) => i.url !== primary?.url) ?? null;
  const soldOut = !product.availableForSale;

  const compare = product.compareAtPriceRange?.minVariantPrice;
  const price = product.priceRange.minVariantPrice;
  const onSale =
    compare && Number(compare.amount) > Number(price.amount) ? compare : null;

  return (
    <Link
      href={`/products/${product.handle}`}
      className={cn('group block', className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-carbon">
        {primary && (
          <Image
            src={primary.url}
            alt={primary.altText || product.title}
            fill
            priority={priority}
            sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
            className={cn(
              'object-cover transition-[opacity,transform] duration-[900ms] ease-cine',
              hover && secondary ? 'opacity-0' : 'opacity-100',
              'group-hover:scale-[1.04]',
            )}
            style={{ filter: 'brightness(0.8) contrast(1.16) saturate(0.82)' }}
          />
        )}
        {secondary && (
          <Image
            src={secondary.url}
            alt=""
            fill
            sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
            className={cn(
              'object-cover transition-[opacity,transform] duration-[900ms] ease-cine',
              hover ? 'opacity-100' : 'opacity-0',
              'group-hover:scale-[1.04]',
            )}
            style={{ filter: 'brightness(0.8) contrast(1.16) saturate(0.82)' }}
          />
        )}

        {/* Hairline that draws in on hover, instead of a shadow. */}
        <span className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-500 ease-cine group-hover:border-bone/25" />

        {!primary && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="t-label">{product.title}</span>
          </span>
        )}

        {soldOut && (
          <span className="absolute left-0 top-0 bg-ink px-3 py-1.5 text-[10px] uppercase tracking-wide text-mist">
            Sold out
          </span>
        )}
        {onSale && !soldOut && (
          <span className="absolute left-0 top-0 bg-signal px-3 py-1.5 text-[10px] uppercase tracking-wide text-bone">
            Reduced
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-4 pt-4">
        <h3
          className="text-[13px] uppercase leading-tight"
          style={{ fontVariationSettings: "'wdth' 92, 'wght' 700", letterSpacing: '0.06em' }}
        >
          {product.title}
        </h3>
        <p className="shrink-0 text-[13px] tabular-nums text-mist">
          {onSale && (
            <span className="mr-2 text-smoke line-through">{formatMoney(onSale)}</span>
          )}
          {formatMoney(price)}
        </p>
      </div>
    </Link>
  );
}
