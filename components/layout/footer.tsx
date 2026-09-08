import Link from 'next/link';
import type { MenuItem } from '@/lib/shopify/types';
import NewsletterForm from '@/components/popup/newsletter-form';

export default function Footer({ menu }: { menu: MenuItem[] }) {
  return (
    <footer className="mt-24 bg-ink text-paper">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="container-site grid gap-8 py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-4xl uppercase tracking-brand sm:text-5xl">
              Join the movement
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/70">
              Early access to drops, exclusive offers and the stories behind the grind.
              No spam — just the come-up.
            </p>
          </div>
          <NewsletterForm variant="dark" />
        </div>
      </div>

      {/* Link columns */}
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-display text-3xl uppercase tracking-[0.2em]">GDC</span>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Money oriented. Grind focused. Premium streetwear for those building
            something bigger than themselves.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm uppercase tracking-brand text-white/50">Shop</h3>
          <ul className="space-y-2 text-sm">
            {menu.slice(0, 5).map((item) => (
              <li key={item.path}>
                <Link href={item.path} className="text-white/80 hover:text-paper">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm uppercase tracking-brand text-white/50">Info</h3>
          <ul className="space-y-2 text-sm">
            {menu.slice(5).map((item) => (
              <li key={item.path}>
                <Link href={item.path} className="text-white/80 hover:text-paper">
                  {item.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/pages/contact" className="text-white/80 hover:text-paper">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm uppercase tracking-brand text-white/50">Help</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/pages/shipping" className="text-white/80 hover:text-paper">Shipping</Link></li>
            <li><Link href="/pages/returns" className="text-white/80 hover:text-paper">Returns</Link></li>
            <li><Link href="/pages/faq" className="text-white/80 hover:text-paper">FAQ</Link></li>
            <li><Link href="/pages/terms" className="text-white/80 hover:text-paper">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} GDC Clothing. All rights reserved.</p>
          <p className="uppercase tracking-brand">Secure checkout powered by Shopify</p>
        </div>
      </div>
    </footer>
  );
}
