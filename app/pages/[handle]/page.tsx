import type { Metadata } from 'next';
import Image from 'next/image';
import { getPage, getProducts } from '@/lib/shopify';

export const revalidate = 3600;

// Human titles for pages that may not yet exist in Shopify.
const FALLBACK_TITLES: Record<string, string> = {
  'about-us': 'Our Story',
  lookbook: 'Lookbook',
  contact: 'Contact',
  shipping: 'Shipping',
  returns: 'Returns',
  faq: 'FAQ',
  terms: 'Terms & Conditions',
};

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const page = await getPage(params.handle);
  return {
    title: page?.title || FALLBACK_TITLES[params.handle] || 'Page',
  };
}

export default async function GenericPage({
  params,
}: {
  params: { handle: string };
}) {
  const page = await getPage(params.handle);

  // Special-case the lookbook: build an editorial gallery from product imagery.
  if (params.handle === 'lookbook') {
    const products = await getProducts(24);
    const images = Array.from(
      new Set(products.flatMap((p) => p.images.map((i) => i.url))),
    ).slice(0, 12);
    return (
      <div>
        <PageHeader title={page?.title || 'Lookbook'} subtitle="Worn by the movement" />
        <section className="container-site py-12">
          <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
            {images.map((url) => (
              <div key={url} className="relative overflow-hidden bg-cream">
                <Image
                  src={url}
                  alt=""
                  width={600}
                  height={800}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const title = page?.title || FALLBACK_TITLES[params.handle] || 'Page';

  return (
    <div>
      <PageHeader title={title} />
      <section className="container-site py-12 lg:py-16">
        {page?.body ? (
          <div
            className="prose prose-neutral mx-auto max-w-3xl [&_a]:text-mauve [&_a]:underline [&_h2]:font-display [&_h2]:uppercase"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        ) : (
          <div className="mx-auto max-w-2xl text-center text-smoke">
            <p className="text-sm">
              This page is being written. In the meantime, reach us at{' '}
              <a href="mailto:hello@gdcclothing.com" className="text-mauve underline">
                hello@gdcclothing.com
              </a>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="border-b border-ink/10 bg-cream">
      <div className="container-site py-14 text-center lg:py-20">
        {subtitle && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-brand text-mauve">
            {subtitle}
          </p>
        )}
        <h1 className="font-display text-5xl uppercase tracking-brand sm:text-6xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
