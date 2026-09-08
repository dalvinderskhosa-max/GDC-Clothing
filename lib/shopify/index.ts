import type {
  Cart,
  Collection,
  Image,
  MenuItem,
  Product,
  ProductVariant,
} from './types';
import { normalizeDomain } from '../env';

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
    body: JSON.stringify({ query, variables }),
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

  const toPath = (url: string): string => {
    try {
      const u = new URL(url);
      return u.pathname;
    } catch {
      return url;
    }
  };

  return (data.menu?.items ?? []).map((item) => ({
    title: item.title,
    path: toPath(item.url),
    items: (item.items ?? []).map((sub: any) => ({
      title: sub.title,
      path: toPath(sub.url),
      items: [],
    })),
  }));
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

export async function createCart(): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: any } }>({
    query: /* GraphQL */ `
      mutation createCart {
        cartCreate { cart { ...cart } }
      }
      ${cartFragment}
    `,
    cache: 'no-store',
  });
  return reshapeCart(data.cartCreate.cart);
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

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: any } }>({
    query: /* GraphQL */ `
      mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...cart } }
      }
      ${cartFragment}
    `,
    variables: { cartId, lines },
    cache: 'no-store',
  });
  return reshapeCart(data.cartLinesAdd.cart);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: any } }>({
    query: /* GraphQL */ `
      mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...cart } }
      }
      ${cartFragment}
    `,
    variables: { cartId, lines },
    cache: 'no-store',
  });
  return reshapeCart(data.cartLinesUpdate.cart);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: any } }>({
    query: /* GraphQL */ `
      mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...cart } }
      }
      ${cartFragment}
    `,
    variables: { cartId, lineIds },
    cache: 'no-store',
  });
  return reshapeCart(data.cartLinesRemove.cart);
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
