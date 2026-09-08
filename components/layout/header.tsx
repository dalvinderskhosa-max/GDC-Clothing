'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { MenuItem } from '@/lib/shopify/types';
import { useCart } from '@/components/cart/cart-context';
import { cn } from '@/lib/utils';

export default function Header({ menu }: { menu: MenuItem[] }) {
  const { cart, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  const count = cart?.totalQuantity ?? 0;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors duration-300',
        scrolled
          ? 'border-ink/10 bg-paper/95 backdrop-blur'
          : 'border-transparent bg-paper',
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-20">
        {/* Left: mobile toggle + desktop nav */}
        <div className="flex flex-1 items-center">
          <button
            className="mr-2 flex h-10 w-10 items-center justify-center lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-ink" />
              <span className="block h-0.5 w-6 bg-ink" />
              <span className="block h-0.5 w-4 bg-ink" />
            </span>
          </button>

          <nav className="hidden items-center gap-6 lg:flex">
            {menu.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="link-underline text-[13px] font-semibold uppercase tracking-brand"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: wordmark */}
        <Link
          href="/"
          className="flex-shrink-0 text-center font-display text-2xl font-bold uppercase tracking-[0.2em] lg:text-3xl"
          aria-label="GDC Clothing home"
        >
          GDC
        </Link>

        {/* Right: secondary nav + cart */}
        <div className="flex flex-1 items-center justify-end gap-5">
          <nav className="hidden items-center gap-6 lg:flex">
            {menu.slice(5).map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="link-underline text-[13px] font-semibold uppercase tracking-brand"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <button
            onClick={openCart}
            className="relative flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-brand"
            aria-label={`Open bag, ${count} items`}
          >
            Bag
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-bold text-paper">
              {count}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? '' : 'pointer-events-none',
        )}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
        />
        <nav
          className={cn(
            'absolute left-0 top-0 h-full w-4/5 max-w-xs bg-paper p-6 transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-2xl uppercase tracking-[0.2em]">GDC</span>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="text-3xl leading-none"
            >
              &times;
            </button>
          </div>
          <ul className="space-y-1">
            {menu.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="block border-b border-ink/10 py-3 font-display text-lg uppercase tracking-brand"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
