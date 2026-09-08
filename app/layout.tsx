import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';
import { getMenu } from '@/lib/shopify';
import { BRAND } from '@/lib/brand';
import { resolveSiteUrl } from '@/lib/env';
import { CartProvider } from '@/components/cart/cart-context';
import CartDrawer from '@/components/cart/cart-drawer';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SmoothScroll from '@/components/motion/smooth-scroll';

/**
 * One family, two axes. The width axis is what lets the display type go
 * genuinely condensed and heavy while the UI stays a normal grotesk — it is
 * the difference between a considered typographic system and Inter-plus-Anton.
 */
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'GDC Clothing — Money Oriented. Grind Focused.',
    template: '%s · GDC Clothing',
  },
  description: BRAND.description,
  openGraph: {
    title: 'GDC Clothing',
    description: BRAND.description,
    type: 'website',
    url: siteUrl.toString(),
    siteName: BRAND.name,
  },
  twitter: { card: 'summary_large_image', title: 'GDC Clothing', description: BRAND.description },
};

export const viewport = {
  themeColor: '#08080A',
  colorScheme: 'dark',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const menu = await getMenu('main-menu');

  return (
    <html lang="en" className={archivo.variable}>
      <head>
        {/* The hero film is the LCP element — start the connection early. */}
        <link rel="preconnect" href="https://gdconline.myshopify.com" />
        <link rel="preconnect" href="https://cdn.shopify.com" />
      </head>
      <body className="min-h-screen bg-ink text-bone">
        <SmoothScroll />
        <CartProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-bone focus:px-4 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          <Header menu={menu} />
          <main id="main">{children}</main>
          <Footer menu={menu} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
