/**
 * Environment values arrive by hand through a hosting dashboard, so they show
 * up with protocols, trailing slashes and stray whitespace attached. Both of
 * the following are ordinary paste mistakes that fail the build rather than
 * degrading, so they are normalised at the edge instead of trusted:
 *
 *   NEXT_PUBLIC_SITE_URL=gdc-clothing.vercel.app   -> new URL() throws
 *   SHOPIFY_STORE_DOMAIN=https://shop.myshopify.com -> https://https://shop/...
 */

/** Reduce a shop domain to bare host: no protocol, no trailing slash. */
export function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

/**
 * Coerce a configured site URL into something `new URL()` accepts, falling back
 * to Vercel's own deployment URL and finally to localhost. Never throws — an
 * unparseable canonical URL is not worth failing a build over.
 */
export function resolveSiteUrl(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    'http://localhost:3000',
  ];

  for (const candidate of candidates) {
    const value = (candidate || '').trim();
    if (!value) continue;
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      return new URL(withProtocol);
    } catch {
      // Try the next candidate rather than taking the build down.
    }
  }

  return new URL('http://localhost:3000');
}
