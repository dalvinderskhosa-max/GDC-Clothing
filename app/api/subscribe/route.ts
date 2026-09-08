import { NextRequest, NextResponse } from 'next/server';

/**
 * Newsletter capture for a Headless storefront.
 *
 * This previously posted to the Admin REST API (`/admin/api/../customers.json`),
 * which is the custom-app pattern. This store is on Shopify's Headless channel,
 * whose tokens only carry `unauthenticated_*` Storefront scopes — so that call
 * returned 403 "requires merchant approval for write_customers scope" and
 * signup was silently dead.
 *
 * The Storefront API's `customerCreate` is the headless equivalent and is
 * covered by the `unauthenticated_write_customers` scope the channel grants.
 *
 * Trade-off worth knowing: `customerCreate` makes a real customer account, and
 * the API requires a password, so one is generated and discarded. The person
 * gets marketing consent recorded and can set their own password later via
 * account recovery. For campaign tooling proper, point this at an ESP instead.
 */

const domain = process.env.SHOPIFY_STORE_DOMAIN!;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2025-07';

/**
 * Prefer the Headless channel's private token (server-side, not IP rate
 * limited). SHOPIFY_ADMIN_API_TOKEN is accepted as a fallback because that is
 * the name the private token was originally stored under — it was never an
 * Admin token.
 */
const privateToken =
  process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || process.env.SHOPIFY_ADMIN_API_TOKEN;
const publicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalise to E.164-ish. Bare local numbers are assumed UK. */
function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const p = raw.replace(/[^\d+]/g, '');
  if (!p) return null;
  if (p.startsWith('+')) return p;
  if (p.startsWith('00')) return `+${p.slice(2)}`;
  if (p.startsWith('0')) return `+44${p.slice(1)}`;
  return `+${p}`;
}

/** Shopify requires a password on customerCreate; the subscriber never sees it. */
function generatePassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `Gdc!${Array.from(bytes, (b) => b.toString(36)).join('').slice(0, 28)}A1`;
}

const MUTATION = /* GraphQL */ `
  mutation SubscribeCustomer($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  const token = privateToken || publicToken;
  if (!token) {
    return NextResponse.json(
      {
        error:
          'Server not configured. Set SHOPIFY_STOREFRONT_PRIVATE_TOKEN (Headless channel private token).',
      },
      { status: 500 },
    );
  }

  let payload: { email?: string; phone?: string; source?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = (payload.email || '').trim().toLowerCase();
  const phone = normalizePhone((payload.phone || '').trim());

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (privateToken) headers['Shopify-Storefront-Private-Token'] = privateToken;
  else headers['X-Shopify-Storefront-Access-Token'] = publicToken!;

  async function submit(withPhone: boolean) {
    const input: Record<string, unknown> = {
      email,
      password: generatePassword(),
      acceptsMarketing: true,
    };
    if (withPhone && phone) input.phone = phone;

    const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({ query: MUTATION, variables: { input } }),
    });
    return res.json();
  }

  try {
    let data = await submit(true);
    let errors = data?.data?.customerCreate?.customerUserErrors ?? [];

    // A malformed phone shouldn't cost us the email address.
    if (phone && errors.some((e: { field?: string[] }) => e.field?.includes('phone'))) {
      data = await submit(false);
      errors = data?.data?.customerCreate?.customerUserErrors ?? [];
      if (!errors.length && data?.data?.customerCreate?.customer) {
        return NextResponse.json({ ok: true, phoneSkipped: true });
      }
    }

    if (data?.data?.customerCreate?.customer) {
      return NextResponse.json({ ok: true });
    }

    // Already on the list, or an account exists but is not activated.
    if (errors.some((e: { code?: string }) => e.code === 'TAKEN' || e.code === 'CUSTOMER_DISABLED')) {
      return NextResponse.json({ ok: true, existing: true });
    }

    if (errors.length) {
      console.error('[subscribe] customerCreate rejected:', JSON.stringify(errors));
      return NextResponse.json({ error: errors[0].message || 'Could not subscribe.' }, { status: 400 });
    }

    console.error('[subscribe] unexpected response:', JSON.stringify(data)?.slice(0, 400));
    return NextResponse.json(
      { error: 'Could not subscribe right now. Please try again.' },
      { status: 502 },
    );
  } catch (e) {
    console.error('[subscribe] network error:', e);
    return NextResponse.json({ error: 'Network error.' }, { status: 500 });
  }
}
