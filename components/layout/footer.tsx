import Link from 'next/link';
import type { MenuItem } from '@/lib/shopify/types';
import { Mark } from '@/components/brand/logo';
import { BRAND } from '@/lib/brand';
import NewsletterForm from '@/components/popup/newsletter-form';

const HELP = [
  { title: 'Shipping & returns', path: '/pages/shipping-returns' },
  { title: 'Size guide', path: '/pages/size-guide' },
  { title: 'Order tracking', path: '/pages/order-tracking' },
  { title: 'FAQs', path: '/pages/faqs' },
  { title: 'Contact', path: '/pages/contact' },
];

const BRANDLINKS = [
  { title: 'About us', path: '/pages/about-us' },
  { title: 'Lookbook', path: '/pages/lookbook' },
  { title: 'Community', path: '/pages/community' },
  { title: 'Ambassadors', path: '/pages/ambassadors' },
  { title: 'Sustainability', path: '/pages/sustainability' },
];

export default function Footer({ menu }: { menu: MenuItem[] }) {
  const shop = menu.length ? menu.slice(0, 5) : [];

  return (
    <footer className="border-t border-steel bg-ink">
      <div className="container-site py-[clamp(3rem,8vh,6rem)]">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Mark className="h-10 w-10 text-bone" />
            <p
              className="mt-6 max-w-xs text-[26px] uppercase leading-[0.95] text-bone"
              style={{ fontVariationSettings: "'wdth' 72, 'wght' 850", letterSpacing: '-0.03em' }}
            >
              {BRAND.tagline.join(' ')}
            </p>
            <div className="mt-8 max-w-sm">
              <p className="t-label mb-3">Get the drops first</p>
              <NewsletterForm />
            </div>
          </div>

          {shop.length > 0 && <FooterCol title="Shop" links={shop} />}
          <FooterCol title="Help" links={HELP} />
          <FooterCol title="Brand" links={BRANDLINKS} />
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-steel pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/pages/cookie-policy" className="t-label link-wipe hover:text-bone">
              Cookie policy
            </Link>
            <Link href="/pages/faqs" className="t-label link-wipe hover:text-bone">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { title: string; path: string }[] }) {
  return (
    <div>
      <p className="t-label mb-5">{title}</p>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.path}>
            <Link href={l.path} className="link-wipe text-[13px] text-mist hover:text-bone">
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
