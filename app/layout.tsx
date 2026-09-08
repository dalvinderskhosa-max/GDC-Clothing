import type { Metadata } from 'next';
import { Oswald, Inter } from 'next/font/google';
import './globals.css';
import { getMenu } from '@/lib/shopify';
import { CartProvider } from '@/components/cart/cart-context';
import CartDrawer from '@/components/cart/cart-drawer';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Marquee from '@/components/layout/marquee';
import LeadPopup from '@/components/popup/lead-popup';

const display = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GDC Clothing — Money Oriented. Grind Focused.',
    template: '%s · GDC Clothing',
  },
  description:
    'GDC Clothing — premium streetwear for the money oriented. Graphic tees, tracksuits and accessories built for the grind.',
  openGraph: {
    title: 'GDC Clothing',
    description: 'Premium streetwear built for the grind.',
    type: 'website',
    url: siteUrl,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menu = await getMenu('main-menu');

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <CartProvider>
          <Marquee />
          <Header menu={menu} />
          <main>{children}</main>
          <Footer menu={menu} />
          <CartDrawer />
          <LeadPopup />
        </CartProvider>
      </body>
    </html>
  );
}
