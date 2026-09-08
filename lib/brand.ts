/**
 * Brand constants pulled from the live Shopify storefront.
 *
 * The Storefront API does not expose theme settings or the Files library, so the
 * hero films and logo have to be referenced explicitly. These are the real assets
 * from gdconline.myshopify.com — verified public, served off Shopify's CDN.
 */

const CDN = 'https://gdconline.myshopify.com/cdn/shop';

export const BRAND = {
  name: 'GDC Clothing',
  shortName: 'GDC',
  tagline: ['Money oriented.', 'Grind focused.'],
  description:
    'Premium UK streetwear for those building something bigger than themselves.',
} as const;

/** Hero films. `primary` is the lighter of the two — it carries the fold. */
export const FILM = {
  primary: {
    src: `${CDN}/videos/c/vp/07cd2a7dd6694b67b994a18a25270dd3/07cd2a7dd6694b67b994a18a25270dd3.HD-1080p-4.8Mbps-85003568.mp4`,
    /** 90KB, shown by the video element before playback. */
    poster: `${CDN}/files/preview_images/07cd2a7dd6694b67b994a18a25270dd3.thumbnail.0000000000_1024x.jpg`,
    /** 2.6KB, blurred behind everything so the fold is never black. */
    posterTiny: `${CDN}/files/preview_images/07cd2a7dd6694b67b994a18a25270dd3.thumbnail.0000000000_small.jpg`,
    bytes: 7_950_519,
  },
  secondary: {
    src: `${CDN}/videos/c/vp/2d0e7be40f784170b5a8be67c497f6cb/2d0e7be40f784170b5a8be67c497f6cb.HD-1080p-7.2Mbps-85003578.mp4`,
    bytes: 12_761_486,
  },
} as const;

/** Collections that get first-class treatment in nav and on the homepage. */
export const FEATURED = [
  { handle: 'drop-001', title: 'Drop 001', label: 'The debut' },
  { handle: 'tracksuits', title: 'Tracksuits', label: 'Head to toe' },
  { handle: 'graphic-tees', title: 'Graphic Tees', label: 'Statement pieces' },
  { handle: 'accessories', title: 'Accessories', label: 'Finish the fit' },
] as const;

/**
 * Merchandising order. The Storefront API returns collection order, which puts
 * the Smoke Box up front — it is a gift set, not the story of the drop. The
 * flagship tracksuit leads, the graphic tees follow, and the gift set and gift
 * card fall to the back. Change HERO to flip which piece anchors the homepage.
 */
export const HERO = 'gdc-royale-tracksuit';

const PRIORITY = [
  'gdc-royale-tracksuit',
  'teddy-bear-bandit-graphic-tee',
  'money-oriented-club-graphic-tee',
  'gdc-embroidered-hat-black-white',
  'gdc-embroidered-hat-snowflake-yarn',
];

const DEMOTED = ['gdc-smoke-box', 'gdc-gift-card'];

function rank(handle: string): number {
  const i = PRIORITY.indexOf(handle);
  if (i !== -1) return i;
  if (DEMOTED.includes(handle)) return 900 + DEMOTED.indexOf(handle);
  return 500;
}

/** Sort into merchandising order, hero first. */
export function curate<T extends { handle: string }>(products: T[]): T[] {
  return [...products].sort((a, b) => rank(a.handle) - rank(b.handle));
}

/** Pieces that can carry a full-bleed visual slot — needs real imagery. */
export function showable<T extends { handle: string; images: { url: string }[] }>(
  products: T[],
): T[] {
  return curate(products).filter(
    (p) => p.images.length > 0 && !DEMOTED.includes(p.handle),
  );
}
