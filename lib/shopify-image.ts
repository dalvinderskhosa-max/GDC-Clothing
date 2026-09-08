/**
 * Shopify serves originals at whatever the merchant uploaded — this catalogue
 * has JPEGs up to 3.2MB / 2832x4240. `next/image` handles anything rendered
 * through it, but WebGL textures are fetched directly by three.js and bypass
 * that pipeline entirely, so they arrive at full size.
 *
 * The CDN accepts a `width` parameter, which takes that 3.2MB file to 487KB.
 * Always size a URL before handing it to a texture loader.
 */
export function sized(url: string, width: number): string {
  if (!url) return url;
  if (!/(^|\.)shopify\.com|myshopify\.com/.test(url)) return url;
  if (/[?&]width=/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`;
}

/**
 * Width to request for a panel in the drop sequence. The plane covers roughly
 * 40% of a desktop viewport at the focus distance, so 1200 is generous even at
 * DPR 2 and keeps each texture well under half a megabyte.
 */
export const TEXTURE_WIDTH = 1200;
