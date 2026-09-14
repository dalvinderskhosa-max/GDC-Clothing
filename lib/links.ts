import { normalizeDomain } from './env';

/**
 * Shopify hands us absolute URLs everywhere merchant-authored content can
 * carry a link — menu items, page bodies, article HTML, product descriptions —
 * and every one of them points at the Shopify-hosted storefront this site
 * replaces. Rendered as-is they walk the shopper straight back to the old
 * site. This module is the single place that decides where such a link goes.
 */

/** Hosts that mean "this storefront" and should collapse to a relative path. */
function shopHosts(): Set<string> {
  const hosts = new Set<string>(['gdconline.myshopify.com']);
  const configured = normalizeDomain(process.env.SHOPIFY_STORE_DOMAIN || '');
  if (configured) hosts.add(configured.toLowerCase());
  for (const extra of (process.env.LEGACY_STORE_HOSTS || '').split(',')) {
    const h = normalizeDomain(extra).toLowerCase();
    if (h) hosts.add(h);
  }
  return hosts;
}

function isShopHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^www\./, '');
  return shopHosts().has(h) || h.endsWith('.myshopify.com');
}

/**
 * Old-storefront paths that have no page here, mapped to where they should
 * land instead. `null` means the link has no sensible destination on this
 * site (customer accounts, the hosted cart) and should be dropped.
 */
const PATH_MAP: { test: RegExp; to: string | null }[] = [
  { test: /^\/collections\/all\/?$/, to: '/collections/shop-all' },
  { test: /^\/collections\/?$/, to: '/collections/shop-all' },
  { test: /^\/products\/?$/, to: '/collections/shop-all' },
  { test: /^\/search\/?$/, to: '/collections/shop-all' },
  { test: /^\/cart(\/|$)/, to: null },
  { test: /^\/account(\/|$)/, to: null },
  { test: /^\/policies(\/|$)/, to: '/pages/faqs' },
];

/**
 * Turn any href Shopify gives us into one that stays on this site.
 *
 * - Absolute URLs on the shop's own domains become relative paths, keeping
 *   query string and hash.
 * - Genuinely external URLs (Instagram, carriers) are returned unchanged.
 * - Old-store paths with no equivalent here are remapped or dropped (null).
 */
export function toInternalHref(raw: string): string | null {
  const value = (raw || '').trim();
  if (!value) return null;
  if (/^(mailto|tel|sms):/i.test(value)) return value;
  if (value.startsWith('#')) return value;

  let path: string;
  let suffix = '';
  if (/^https?:\/\//i.test(value) || value.startsWith('//')) {
    let u: URL;
    try {
      u = new URL(value.startsWith('//') ? `https:${value}` : value);
    } catch {
      return null;
    }
    if (!isShopHost(u.hostname)) return value;
    path = u.pathname || '/';
    suffix = `${u.search}${u.hash}`;
  } else if (value.startsWith('/')) {
    const m = value.match(/^([^?#]*)(.*)$/);
    path = m?.[1] || '/';
    suffix = m?.[2] || '';
  } else {
    return value;
  }

  for (const rule of PATH_MAP) {
    if (rule.test.test(path)) {
      return rule.to === null ? null : `${rule.to}${suffix}`;
    }
  }
  return `${path}${suffix}`;
}

/**
 * Rewrite every `href` in a block of merchant HTML. Links that resolve to
 * nothing on this site are unwrapped — the text stays, the anchor goes — so
 * the copy still reads and nobody is sent to the old storefront.
 */
export function rewriteShopifyLinks(html: string): string {
  if (!html) return html;
  return html.replace(
    /<a\b([^>]*?)\shref=(["'])(.*?)\2([^>]*)>([\s\S]*?)<\/a>/gi,
    (_m, before: string, quote: string, href: string, after: string, inner: string) => {
      const next = toInternalHref(href);
      if (next === null) return inner;
      const attrs = `${before}${after}`
        // An internal link should open in the same tab.
        .replace(/\starget=(["']).*?\1/gi, '');
      const external = /^https?:\/\//i.test(next);
      const extra = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a${attrs} href=${quote}${next}${quote}${extra}>${inner}</a>`;
    },
  );
}
