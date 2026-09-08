'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { MenuItem } from '@/lib/shopify/types';
import { useCart } from '@/components/cart/cart-context';
import { Logo, Mark } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

/**
 * Sits transparent over the hero film and only acquires a ground once the
 * film is behind it. No blur, no floating pill — a hairline rule and a
 * solid ink plate, so it reads as part of the page rather than on top of it.
 */
export default function Header({ menu }: { menu: MenuItem[] }) {
  const { cart, openCart } = useCart();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      // Hide on downward scroll past the fold, reveal the moment you scroll up.
      setHidden(y > 400 && y > lastY.current);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const count = cart?.totalQuantity ?? 0;
  const primary = menu.length ? menu : FALLBACK_MENU;

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-cine',
          solid ? 'border-b border-steel bg-ink' : 'border-b border-transparent bg-transparent',
          hidden ? '-translate-y-full' : 'translate-y-0',
        )}
        style={{ height: 'var(--header-h)' }}
      >
        <div className="container-site flex h-full items-center justify-between gap-6">
          <Link href="/" aria-label="GDC Clothing — home" className="shrink-0">
            <Logo className="text-bone" />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {primary.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="link-wipe t-meta text-bone/80 transition-colors hover:text-bone"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button
              onClick={openCart}
              aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}
              className="t-meta group flex items-center gap-2 text-bone"
            >
              <span className="hidden sm:inline">Bag</span>
              <span
                className={cn(
                  'grid h-6 min-w-6 place-items-center px-1 text-[11px] tabular-nums transition-colors',
                  count > 0 ? 'bg-signal text-bone' : 'border border-steel text-mist',
                )}
              >
                {count}
              </span>
            </button>

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-6 w-6 flex-col justify-center gap-[5px] lg:hidden"
            >
              <span className="block h-px w-6 bg-bone" />
              <span className="block h-px w-6 bg-bone" />
            </button>
          </div>
        </div>
      </header>

      {/* ---- Full-bleed mobile menu ---- */}
      <div
        className={cn(
          'fixed inset-0 z-[60] transition-[opacity,visibility] duration-500 ease-cine lg:hidden',
          open ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0',
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-ink transition-opacity duration-500 ease-cine',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <nav className="relative flex h-full flex-col justify-between px-[var(--gutter)] py-7">
          <div className="flex items-center justify-between">
            <Mark className="h-7 w-7 text-bone" />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="t-meta text-bone"
            >
              Close
            </button>
          </div>

          <ul className="space-y-1">
            {primary.map((item, i) => (
              <li
                key={item.path}
                className="overflow-hidden"
                style={{
                  transitionDelay: `${open ? 120 + i * 55 : 0}ms`,
                }}
              >
                <Link
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    't-h2 block py-1 text-bone transition-transform duration-700 ease-cine',
                    open ? 'translate-y-0' : 'translate-y-full',
                  )}
                  style={{ transitionDelay: `${open ? 120 + i * 55 : 0}ms` }}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>

          <p className="t-label">{`${BRAND_LINE}`}</p>
        </nav>
      </div>
    </>
  );
}

const BRAND_LINE = 'Money oriented. Grind focused.';

/** Used only if the Shopify main-menu is empty, so nav is never blank. */
const FALLBACK_MENU: MenuItem[] = [
  { title: 'Shop all', path: '/collections/shop-all', items: [] },
  { title: 'Drop 001', path: '/collections/drop-001', items: [] },
  { title: 'Tracksuits', path: '/collections/tracksuits', items: [] },
  { title: 'Tees', path: '/collections/graphic-tees', items: [] },
  { title: 'Accessories', path: '/collections/accessories', items: [] },
];
