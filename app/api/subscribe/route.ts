import { NextRequest, NextResponse } from 'next/server';

const domain = process.env.SHOPIFY_STORE_DOMAIN!;
const adminToken = process.env.SHOPIFY_ADMIN_API_TOKEN!;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2025-07';

// Basic validators
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalize a phone number to E.164-ish. Defaults unknown local numbers to +44 (UK). */
function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  let p = raw.replace(/[^\d+]/g, '');
  if (!p) return null;
  if (p.startsWith('+')) return p;
  if (p.startsWith('00')) return '+' + p.slice(2);
  if (p.startsWith('0')) return '+44' + p.slice(1); // UK local -> E.164
  return '+' + p;
}

export async function POST(req: NextRequest) {
  if (!adminToken || adminToken.includes('xxxx')) {
    return NextResponse.json(
      { error: 'Server not configured. Set SHOPIFY_ADMIN_API_TOKEN.' },
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
  const source = payload.source || 'popup';

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  }

  const customer: Record<string, unknown> = {
    email,
    tags: `newsletter, ${source}`,
    email_marketing_consent: {
      state: 'subscribed',
      opt_in_level: 'single_opt_in',
    },
  };

  if (phone) {
    customer.phone = phone;
    customer.sms_marketing_consent = {
      state: 'subscribed',
      opt_in_level: 'single_opt_in',
    };
  }

  try {
    const res = await fetch(
      `https://${domain}/admin/api/${apiVersion}/customers.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({ customer }),
      },
    );

    const data = await res.json();

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    // Duplicate email = already on the list. Treat as success for UX.
    const errText = JSON.stringify(data.errors || data);
    if (res.status === 422 && /already been taken|taken/i.test(errText)) {
      return NextResponse.json({ ok: true, existing: true });
    }

    // If SMS consent failed due to bad phone, retry email-only once.
    if (res.status === 422 && phone && /phone/i.test(errText)) {
      delete customer.phone;
      delete customer.sms_marketing_consent;
      const retry = await fetch(
        `https://${domain}/admin/api/${apiVersion}/customers.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminToken,
          },
          body: JSON.stringify({ customer }),
        },
      );
      if (retry.ok) return NextResponse.json({ ok: true, phoneSkipped: true });
      const retryData = await retry.json();
      if (
        retry.status === 422 &&
        /already been taken|taken/i.test(JSON.stringify(retryData.errors || retryData))
      ) {
        return NextResponse.json({ ok: true, existing: true });
      }
    }

    console.error('Shopify customer create failed:', errText);
    return NextResponse.json(
      { error: 'Could not subscribe right now. Please try again.' },
      { status: 502 },
    );
  } catch (e) {
    console.error('Subscribe route error:', e);
    return NextResponse.json({ error: 'Network error.' }, { status: 500 });
  }
}
