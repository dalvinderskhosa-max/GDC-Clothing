/**
 * Background-removed product images.
 *
 * The catalogue is shot on a light grey studio backdrop, which fights a black
 * page — every product read as a photograph in a grey box. These are the same
 * photographs with the backdrop removed, so the garment sits directly on the
 * site's ink and the WebGL sequence can stage it in space rather than showing
 * a rectangle.
 *
 * Nothing here is generated: the garments, prints and logos are the originals.
 * Only the backdrop is gone.
 *
 * The beanie is cropped to the product. Background removal deleted the model's
 * face and left a headless figure, which was worse than the grey box.
 *
 * Add a handle here after dropping the matching .webp into public/cutouts/.
 * Anything without an entry falls back to the Shopify image.
 */
const CUTOUTS = new Set([
  'gdc-royale-tracksuit',
  'teddy-bear-bandit-graphic-tee',
  'money-oriented-club-graphic-tee',
  'gdc-embroidered-hat-black-white',
  'gdc-embroidered-hat-snowflake-yarn',
  'gdc-smoke-box',
]);

/** Local cutout for a product, or null when there isn't one. */
export function cutout(handle: string): string | null {
  return CUTOUTS.has(handle) ? `/cutouts/${handle}.webp` : null;
}

/** Cutout if we have one, otherwise the supplied Shopify URL. */
export function preferCutout(handle: string, fallback: string): string {
  return cutout(handle) ?? fallback;
}

export function hasCutout(handle: string): boolean {
  return CUTOUTS.has(handle);
}
