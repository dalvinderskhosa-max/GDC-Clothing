import Link from 'next/link';

/**
 * The Shopify page for /contact has an empty body — the hosted theme relied on
 * its built-in contact form, which cannot be reached headlessly: the Storefront
 * API exposes no contact mutation, and posting to Shopify's /contact endpoint
 * is rejected with 403 by its bot protection.
 *
 * Rather than ship a form that silently goes nowhere, this routes people to the
 * channels that actually work. Set NEXT_PUBLIC_SUPPORT_EMAIL to surface a
 * direct mailto; until then the store's own contact form is linked, which is
 * live and monitored.
 */

const SELF_SERVE = [
  {
    title: 'Where is my order?',
    body: 'Track a live order with your order number and email.',
    href: '/pages/order-tracking',
    cta: 'Track order',
  },
  {
    title: 'Returns & exchanges',
    body: '30 days to return. Free UK shipping over £75.',
    href: '/pages/shipping-returns',
    cta: 'Shipping & returns',
  },
  {
    title: 'What size am I?',
    body: 'Measurements and fit notes for every piece in the drop.',
    href: '/pages/size-guide',
    cta: 'Size guide',
  },
  {
    title: 'Everything else',
    body: 'Payment, discounts, restocks and wholesale.',
    href: '/pages/faqs',
    cta: 'Read FAQs',
  },
];

export default function ContactPanel({ storeDomain }: { storeDomain: string }) {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <div className="max-w-5xl">
      <p className="max-w-xl text-[clamp(1.05rem,1.9vw,1.35rem)] leading-[1.55] text-bone">
        Most questions are answered faster below. If yours isn&apos;t, reach us
        directly and we&apos;ll come back within two working days.
      </p>

      <div className="mt-12 grid gap-px border border-steel bg-steel sm:grid-cols-2">
        {SELF_SERVE.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-ink p-7 transition-colors duration-500 ease-cine hover:bg-carbon"
          >
            <h2
              className="text-[17px] uppercase leading-tight text-bone"
              style={{ fontVariationSettings: "'wdth' 88, 'wght' 760", letterSpacing: '-0.01em' }}
            >
              {item.title}
            </h2>
            <p className="t-body mt-3 text-[14px]">{item.body}</p>
            <span className="link-wipe t-meta mt-5 inline-block text-mist group-hover:text-bone">
              {item.cta}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 border-t border-steel pt-10">
        <p className="t-label mb-5">Talk to a human</p>
        {email ? (
          <a href={`mailto:${email}`} className="btn-solid">
            Email {email}
          </a>
        ) : (
          <>
            <a
              href={`https://${storeDomain}/pages/contact`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid"
            >
              Send us a message
            </a>
            <p className="t-body mt-4 max-w-md text-[13px]">
              Opens our secure contact form in a new tab.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
