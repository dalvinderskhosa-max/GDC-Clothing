'use client';

import { useMemo, useState } from 'react';
import type { Product, ProductVariant } from '@/lib/shopify/types';
import { useCart } from '@/components/cart/cart-context';
import { formatMoney } from '@/lib/utils';
import { cn } from '@/lib/utils';

function findVariant(
  product: Product,
  selected: Record<string, string>,
): ProductVariant | undefined {
  return product.variants.find((v) =>
    v.selectedOptions.every((o) => selected[o.name] === o.value),
  );
}

export default function ProductForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const singleVariant =
    product.variants.length === 1 &&
    product.variants[0].title === 'Default Title';

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    // Preselect from the first available variant
    const firstAvailable =
      product.variants.find((v) => v.availableForSale) || product.variants[0];
    firstAvailable?.selectedOptions.forEach((o) => (init[o.name] = o.value));
    return init;
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const variant = useMemo(
    () => (singleVariant ? product.variants[0] : findVariant(product, selected)),
    [product, selected, singleVariant],
  );

  const activePrice = variant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(activePrice.amount);

  /** Is a given option value available given the other current selections? */
  function isValueAvailable(optionName: string, value: string): boolean {
    const trial = { ...selected, [optionName]: value };
    const v = findVariant(product, trial);
    return !!v && v.availableForSale;
  }

  async function handleAdd() {
    if (!variant) return;
    setAdding(true);
    setError('');
    const ok = await addItem(variant.id, 1);
    if (!ok) setError('Could not add to bag. Please try again.');
    setAdding(false);
  }

  const canBuy = variant?.availableForSale;

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold">{formatMoney(activePrice)}</span>
        {onSale && (
          <span className="text-lg text-smoke line-through">
            {formatMoney(compareAt!)}
          </span>
        )}
      </div>

      {!singleVariant &&
        product.options.map((option) => (
          <div key={option.id} className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-brand">
                {option.name}
              </span>
              <span className="text-xs text-smoke">{selected[option.name]}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selected[option.name] === value;
                const available = isValueAvailable(option.name, value);
                return (
                  <button
                    key={value}
                    onClick={() =>
                      setSelected((s) => ({ ...s, [option.name]: value }))
                    }
                    className={cn(
                      'min-w-[3rem] border px-4 py-2.5 text-sm font-medium uppercase transition-colors',
                      isSelected
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink/25 hover:border-ink',
                      !available &&
                        'cursor-not-allowed border-ink/10 text-smoke line-through hover:border-ink/10',
                    )}
                    aria-pressed={isSelected}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      <button
        onClick={handleAdd}
        disabled={!canBuy || adding}
        className={cn(
          'mt-8 w-full py-4 text-sm font-semibold uppercase tracking-brand transition-colors',
          canBuy
            ? 'bg-ink text-paper hover:bg-mauve'
            : 'cursor-not-allowed bg-cream text-smoke',
        )}
      >
        {adding
          ? 'Adding…'
          : !variant
            ? 'Unavailable'
            : canBuy
              ? 'Add to bag'
              : 'Sold out'}
      </button>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      <p className="mt-4 text-center text-[11px] uppercase tracking-brand text-smoke">
        Free UK shipping over £75 · 30-day returns
      </p>
    </div>
  );
}
