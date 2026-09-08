import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/shopify/types';
import { formatMoney } from '@/lib/utils';

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const hoverImage = product.images.find(
    (img) => img.url !== product.featuredImage?.url,
  );
  const onSale =
    product.compareAtPriceRange?.minVariantPrice &&
    Number(product.compareAtPriceRange.minVariantPrice.amount) >
      Number(product.priceRange.minVariantPrice.amount);

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        {product.featuredImage && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
        )}
        {hoverImage ? (
          <Image
            src={hoverImage.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/5" />
        )}

        {!product.availableForSale && (
          <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-brand text-paper">
            Sold out
          </span>
        )}
        {product.availableForSale && onSale && (
          <span className="absolute left-3 top-3 bg-mauve px-2 py-1 text-[10px] font-bold uppercase tracking-brand text-paper">
            Sale
          </span>
        )}

        <span className="absolute inset-x-3 bottom-3 translate-y-2 bg-paper py-3 text-center text-xs font-semibold uppercase tracking-brand text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View product
        </span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase leading-tight tracking-wide">
          {product.title}
        </h3>
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm">
        <span className="font-medium">{formatMoney(product.priceRange.minVariantPrice)}</span>
        {onSale && (
          <span className="text-smoke line-through">
            {formatMoney(product.compareAtPriceRange.minVariantPrice)}
          </span>
        )}
      </div>
    </Link>
  );
}
