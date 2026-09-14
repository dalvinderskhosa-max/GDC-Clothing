import type {
  Cart,
  Collection,
  Image,
  MenuItem,
  Product,
  ProductVariant,
} from './types';
import { normalizeDomain } from '../env';
import { restateFabric } from '../brand';
import { toInternalHref } from '../links';

/**
 * Fail loudly and early when the storefront credentials are absent.
 *
 * Without this the domain interpolates as the string "undefined" and the build
 * dies with `getaddrinfo ENOTFOUND undefined` while collecting page data —
 * which says nothing about the actual problem. This is the first thing that
 * bites on a fresh deploy target, so it is worth naming precisely.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[shopify] Missing required environment variable ${name}. ` +
        'Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in your ' +
        'hosting provider\'s environment settings (and in .env.local for local dev).',
    );
  }
  return value;
}

const domain = normalizeDomain(required('SHOPIFY_STORE_DOMAIN'));
const token = required('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
const apiVersion = process.env.SHOPIFY_API_VERSION || '2025-07';
const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

/**
 * The market every request is evaluated in.
 *
 * Without an explicit country Shopify infers one from the IP of whoever made
 * the request — which for a headless store is the server, not the shopper. A
 * cart minted from a region the shop does not sell to (a Vercel function in
 * the wrong region, a developer abroad) has every line silently forced to
 * quantity 0, and prices and availability drift with the server's location.
 * Pinning the country keeps the storefront deterministic.
 */
export const MARKET_COUNTRY = (process.env.SHOPIFY_MARKET_COUNTRY || 'GB')
  .trim()
  .toUpperCase();

/** Add `@inContext(country: …)` to the operation so Shopify evaluates it in our market. */
function inMarket(query: string): string {
  if (query.includes('@inContext')) return query;
  return query.replace(
    /^(\s*(?:query|mutation)\b[^{@]*?)\s*\{/m,
    `$1 @inContext(country: ${MARKET_COUNTRY}) {`,
  );
}

type GraphQLResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

async function shopifyFetch<T>({
  query,
  variables,
  cache = 'force-cache',
  tags,
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  tags?: string[];
}): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query: inMarket(query), variables }),
    cache,
    ...(tags ? { next: { tags } } : {}),
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API error: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join('; '));
  }
  return body.data;
}

/* ----------------------------- GraphQL fragments ---------------------------- */

const imageFragment = /* GraphQL */ `
  fragment image on Image {
    url
    altText
    width
    height
  }
`;

const productFragment = /* GraphQL */ `
  fragment product on Product {
    id
    handle
    title
    productType
    description
    descriptionHtml
    availableForSale
    tags
    featuredImage { ...image }
    images(first: 12) { edges { node { ...image } } }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    options { id name values }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          image { ...image }
        }
      }
    }
  }
  ${imageFragment}
`;

const cartFragment = /* GraphQL */ `
  fragment cart on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity { countryCode }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost { totalAmount { amount currencyCode } }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions { name value }
              product {
                handle
                title
                featuredImage { ...image }
              }
            }
          }
        }
      }
    }
  }
  ${imageFragment}
`;

/* ------------------------------- Reshapers --------------------------------- */

type Edges<T> = { edges: { node: T }[] } | undefined;
function flatten<T>(conn: Edges<T>): T[] {
  return conn?.edges.map((e) => e.node) ?? [];
}

function reshapeProduct(node: any): Product {
  return {
    ...node,
    description: restateFabric(node.description, node.productType),
    descriptionHtml: restateFabric(node.descriptionHtml, node.productType),
    images: flatten<Image>(node.images),
    variants: flatten<ProductVariant>(node.variants),
  };
}

function reshapeCart(node: any): Cart {
  return {
    ...node,
    lines: flatten(node.lines),
  };
}

/* ------------------------------- Menu -------------------------------------- */

export async function getMenu(handle = 'main-menu'): Promise<MenuItem[]> {
  const data = await shopifyFetch<{ menu: { items: any[] } | null }>({
    query: /* GraphQL */ `
      query getMenu($handle: String!) {
        menu(handle: $handle) {
          items {
            title
            url
            items { title url }
          }
        }
      }
    `,
    variables: { handle },
    tags: ['menu'],
  });

  // Shopify menu URLs are absolute links into the old storefront. Collapse
  // the shop's own domains to paths, keep genuinely external links, and drop
  // anything (search, account, cart) that has no page on this site.
  const reshape = (item: any): MenuItem | null => {
    const path = toInternalHref(item.url);
    if (!path) return null;
    return {
      title: item.title,
      path,
      items: (item.items ?? [])
        .map((sub: any) => {
          const subPath = toInternalHref(sub.url);
          return subPath ? { title: sub.title, path: subPath, items: [] } : null;
        })
        .filter(Boolean) as MenuItem[],
    };
  };

  return (data.menu?.items ?? []).map(reshape).filter(Boolean) as MenuItem[];
}

/* ---------------------------- Collections ---------------------------------- */

export async function getCollections(): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: Edges<any> }>({
    query: /* GraphQL */ `
      query getCollections {
        collections(first: 50, sortKey: TITLE) {
          edges {
            node {
              id
              handle
              title
              description
              image { url altText width height }
            }
          }
        }
      }
    `,
    tags: ['collections'],
  });
  return flatten<Collection>(data.collections).filter(
    (c) => !c.handle.startsWith('frontpage'),
  );
}

export async function getCollection(handle: string): Promise<Collection | null> {
  const data = await shopifyFetch<{ collection: Collection | null }>({
    query: /* GraphQL */ `
      query getCollection($handle: String!) {
        collection(handle: $handle) {
          id
          handle
          title
          description
          image { url altText width height }
        }
      }
    `,
    variables: { handle },
    tags: ['collections'],
  });
  return data.collection;
}

export async function getCollectionProducts(
  handle: string,
  first = 48,
): Promise<Product[]> {
  const data = await shopifyFetch<{ collection: { products: Edges<any> } | null }>({
    query: /* GraphQL */ `
      query getCollectionProducts($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          products(first: $first) {
            edges { node { ...product } }
          }
        }
      }
      ${productFragment}
    `,
    variables: { handle, first },
    tags: ['products', 'collections'],
  });
  return flatten<any>(data.collection?.products).map(reshapeProduct);
}

/* ------------------------------ Products ----------------------------------- */

export async function getProducts(first = 24, sortKey = 'BEST_SELLING'): Promise<Product[]> {
  const data = await shopifyFetch<{ products: Edges<any> }>({
    query: /* GraphQL */ `
      query getProducts($first: Int!, $sortKey: ProductSortKeys!) {
        products(first: $first, sortKey: $sortKey) {
          edges { node { ...product } }
        }
      }
      ${productFragment}
    `,
    variables: { first, sortKey },
    tags: ['products'],
  });
  return flatten<any>(data.products).map(reshapeProduct);
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: any | null }>({
    query: /* GraphQL */ `
      query getProduct($handle: String!) {
        product(handle: $handle) { ...product }
      }
      ${productFragment}
    `,
    variables: { handle },
    tags: ['products'],
  });
  return data.product ? reshapeProduct(data.product) : null;
}

export async function getAllProductHandles(): Promise<string[]> {
  const data = await shopifyFetch<{ products: Edges<{ handle: string }> }>({
    query: /* GraphQL */ `
      query getAllHandles {
        products(first: 100) { edges { node { handle } } }
      }
    `,
    tags: ['products'],
  });
  return flatten(data.products).map((p) => p.handle);
}

/* ------------------------------- Pages ------------------------------------- */

export type ShopifyPage = {
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
};

export async function getPage(handle: string): Promise<ShopifyPage | null> {
  const data = await shopifyFetch<{ page: ShopifyPage | null }>({
    query: /* GraphQL */ `
      query getPage($handle: String!) {
        page(handle: $handle) {
          title
          handle
          body
          bodySummary
        }
      }
    `,
    variables: { handle },
    tags: ['pages'],
  });
  return data.page;
}

/* -------------------------------- Blog ------------------------------------- */

export type Article = {
  title: string;
  handle: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  image: Image | null;
};

export async function getBlogArticles(
  blogHandle: string,
  first = 12,
): Promise<Article[]> {
  const data = await shopifyFetch<{ blog: { articles: Edges<any> } | null }>({
    query: /* GraphQL */ `
      query getArticles($blogHandle: String!, $first: Int!) {
        blog(handle: $blogHandle) {
          articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
            edges {
              node {
                title
                handle
                excerpt
                contentHtml
                publishedAt
                image { url altText width height }
              }
            }
          }
        }
      }
    `,
    variables: { blogHandle, first },
    tags: ['blog'],
  });
  return flatten<Article>(data.blog?.articles);
}

/* -------------------------------- Cart ------------------------------------- */

type CartUserError = { code?: string; field?: string[] | null; message: string };
type CartWarning = { code?: string; target?: string; message: string };
type CartPayload = { cart: any | null; userErrors?: CartUserError[]; warnings?: CartWarning[] };

/**
 * Every cart mutation reports failures through `userErrors` rather than the
 * top-level `errors` array, so a rejected update still comes back as HTTP 200
 * with `cart: null`. Turn that into a thrown error with Shopify's own message
 * instead of letting `reshapeCart(null)` blow up with something meaningless.
 */
function unwrapCart(payload: CartPayload, what: string): Cart {
  const errors = payload.userErrors ?? [];
  if (errors.length) {
    throw new Error(`[shopify] ${what}: ${errors.map((e) => e.message).join('; ')}`);
  }
  if (!payload.cart) throw new Error(`[shopify] ${what}: Shopify returned no cart`);
  const cart = reshapeCart(payload.cart);
  // Warnings are not failures: Shopify applied what it could (e.g. capped a
  // quantity at the stock on hand) and is telling us why. Surface them.
  const warnings = (payload.warnings ?? []).map((w) => w.message).filter(Boolean);
  return warnings.length ? { ...cart, warnings } : cart;
}

const userErrorsFragment = /* GraphQL */ `
  userErrors { code field message }
  warnings { code target message }
`;

export async function createCart(): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: CartPayload }>({
    query: /* GraphQL */ `
      mutation createCart($country: CountryCode!) {
        cartCreate(input: { buyerIdentity: { countryCode: $country } }) {
          cart { ...cart }
          ${userErrorsFragment}
        }
      }
      ${cartFragment}
    `,
    variables: { country: MARKET_COUNTRY },
    cache: 'no-store',
  });
  return unwrapCart(data.cartCreate, 'createCart');
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: any | null }>({
    query: /* GraphQL */ `
      query getCart($cartId: ID!) {
        cart(id: $cartId) { ...cart }
      }
      ${cartFragment}
    `,
    variables: { cartId },
    cache: 'no-store',
  });
  return data.cart ? reshapeCart(data.cart) : null;
}

/**
 * Re-home a cart in our market. Carts created before the country was pinned
 * carry whatever country Shopify guessed from the server's IP; if that is a
 * market the shop does not sell to, every line sits at quantity 0 and nothing
 * the shopper does can move it. Updating the buyer identity restores them.
 */
export async function setCartCountry(cartId: string, country = MARKET_COUNTRY): Promise<Cart> {
  const data = await shopifyFetch<{ cartBuyerIdentityUpdate: CartPayload }>({
    query: /* GraphQL */ `
      mutation setCartCountry($cartId: ID!, $country: CountryCode!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: { countryCode: $country }) {
          cart { ...cart }
          ${userErrorsFragment}
        }
      }
      ${cartFragment}
    `,
    variables: { cartId, country },
    cache: 'no-store',
  });
  return unwrapCart(data.cartBuyerIdentityUpdate, 'setCartCountry');
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: CartPayload }>({
    query: /* GraphQL */ `
      mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart { ...cart }
          ${userErrorsFragment}
        }
      }
      ${cartFragment}
    `,
    variables: { cartId, lines },
    cache: 'no-store',
  });
  return unwrapCart(data.cartLinesAdd, 'addToCart');
}

/**
 * Quantity-only update. `merchandiseId` is deliberately not sent: on
 * `CartLineUpdateInput` it means "swap this line to a different variant", and
 * passing the same one back is at best a no-op and at worst a line rebuild.
 */
export async function updateCart(
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: CartPayload }>({
    query: /* GraphQL */ `
      mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart { ...cart }
          ${userErrorsFragment}
        }
      }
      ${cartFragment}
    `,
    variables: { cartId, lines },
    cache: 'no-store',
  });
  return unwrapCart(data.cartLinesUpdate, 'updateCart');
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: CartPayload }>({
    query: /* GraphQL */ `
      mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart { ...cart }
          ${userErrorsFragment}
        }
      }
      ${cartFragment}
    `,
    variables: { cartId, lineIds },
    cache: 'no-store',
  });
  return unwrapCart(data.cartLinesRemove, 'removeFromCart');
}

/** A single article. Returns null when the blog or article handle is unknown. */
export async function getArticle(
  blogHandle: string,
  articleHandle: string,
): Promise<Article | null> {
  const data = await shopifyFetch<{ blog: { articleByHandle: Article | null } | null }>({
    query: /* GraphQL */ `
      query getArticle($blogHandle: String!, $articleHandle: String!) {
        blog(handle: $blogHandle) {
          articleByHandle(handle: $articleHandle) {
            title
            handle
            excerpt
            contentHtml
            publishedAt
            image { url altText width height }
          }
        }
      }
    `,
    variables: { blogHandle, articleHandle },
    tags: ['blog'],
  });
  return data.blog?.articleByHandle ?? null;
}

/** Blog handles, for static generation and the sitemap. */
export async function getBlogHandles(): Promise<string[]> {
  const data = await shopifyFetch<{ blogs: Edges<{ handle: string }> }>({
    query: /* GraphQL */ `
      query getBlogs {
        blogs(first: 20) {
          edges {
            node {
              handle
            }
          }
        }
      }
    `,
    tags: ['blog'],
  });
  return flatten<{ handle: string }>(data.blogs).map((b) => b.handle);
}

/** Page handles, for static generation and the sitemap. */
export async function getPageHandles(): Promise<string[]> {
  const data = await shopifyFetch<{ pages: Edges<{ handle: string }> }>({
    query: /* GraphQL */ `
      query getPages {
        pages(first: 100) {
          edges {
            node {
              handle
            }
          }
        }
      }
    `,
    tags: ['page'],
  });
  return flatten<{ handle: string }>(data.pages).map((p) => p.handle);
}
