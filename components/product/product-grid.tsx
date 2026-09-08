import type { Product } from '@/lib/shopify/types';
import ProductCard from './product-card';
import { cn } from '@/lib/utils';

export default function ProductGrid({
  products,
  priorityCount = 0,
  className,
}: {
  products: Product[];
  priorityCount?: number;
  className?: string;
}) {
  if (!products.length) return null;

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4',
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
