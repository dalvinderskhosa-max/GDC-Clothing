'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './cart-context';
import { formatMoney, cn } from '@/lib/utils';
import { cutout } from '@/lib/cutouts';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, isPending } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        aria-label="Shopping bag"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ink text-bone shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-steel px-5 py-4">
          <h2 className="text-xl uppercase tracking-brand">
            Your Bag {cart?.totalQuantity ? `(${cart.totalQuantity})` : ''}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close bag"
            className="text-2xl leading-none hover:opacity-60"
          >
            &times;
          </button>
        </header>

        {!cart || cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-2xl uppercase tracking-brand">Your bag is empty</p>
            <p className="text-sm text-mist">Time to lock in. The grind doesn&apos;t stop.</p>
            <button
              onClick={closeCart}
              className="mt-2 bg-bone px-6 py-3 text-sm font-semibold uppercase tracking-brand text-ink hover:bg-signal"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-steel overflow-y-auto px-5">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    onClick={closeCart}
                    className={cn(
                      'relative aspect-[3/4] w-20 flex-shrink-0 overflow-hidden',
                      cutout(line.merchandise.product.handle) ? 'bg-ink' : 'bg-carbon',
                    )}
                  >
                    {(() => {
                      const cut = cutout(line.merchandise.product.handle);
                      const src = cut ?? line.merchandise.product.featuredImage?.url;
                      if (!src) return null;
                      return (
                        <Image
                          src={src}
                          alt={line.merchandise.product.title}
                          fill
                          // 80px slot, but ask for 2x so it stays sharp on
                          // retina — sizes="80px" alone was resolving to a
                          // 21px source and rendering as a blur.
                          sizes="160px"
                          className={cut ? 'object-contain p-1.5' : 'object-cover'}
                        />
                      );
                    })()}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/products/${line.merchandise.product.handle}`}
                        onClick={closeCart}
                        className="text-sm font-semibold uppercase leading-tight hover:opacity-60"
                      >
                        {line.merchandise.product.title}
                      </Link>
                      <button
                        onClick={() => removeItem(line.id)}
                        aria-label="Remove item"
                        className="text-mist hover:text-bone"
                      >
                        &times;
                      </button>
                    </div>
                    {line.merchandise.title !== 'Default Title' && (
                      <p className="mt-1 text-xs text-mist">{line.merchandise.title}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-steel">
                        <button
                          onClick={() =>
                            updateQuantity(
                              line.id,
                              line.merchandise.id,
                              line.quantity - 1,
                            )
                          }
                          className="px-2.5 py-1 hover:bg-ash"
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <span className="min-w-[2rem] text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              line.id,
                              line.merchandise.id,
                              line.quantity + 1,
                            )
                          }
                          className="px-2.5 py-1 hover:bg-ash"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatMoney(line.cost.totalAmount)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-steel px-5 py-5">
              <div className="mb-1 flex justify-between text-sm text-mist">
                <span>Subtotal</span>
                <span>{formatMoney(cart.cost.subtotalAmount)}</span>
              </div>
              <p className="mb-4 text-xs text-mist">
                Shipping &amp; taxes calculated at checkout.
              </p>
              <a
                href={cart.checkoutUrl}
                className="block w-full bg-bone py-4 text-center text-sm font-semibold uppercase tracking-brand text-ink transition-colors hover:bg-signal"
              >
                Checkout &middot; {formatMoney(cart.cost.totalAmount)}
              </a>
              <p className="mt-3 text-center text-[11px] uppercase tracking-brand text-mist">
                Secure checkout &middot;{' '}
                <a
                  href="https://nuvic.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-wipe transition-colors hover:text-bone"
                >
                  Powered by Nuvic
                </a>
              </p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
