import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/shopify';
import { cleanShopifyHtml, PROSE } from '@/lib/utils';
import { RevealText } from '@/components/motion/reveal';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const page = await getPage(params.handle);
  if (!page) return { title: 'Not found' };
  return { title: page.title };
}

export default async function ContentPage({ params }: { params: { handle: string } }) {
  const page = await getPage(params.handle);
  if (!page) notFound();

  return (
    <div className="pt-[var(--header-h)]">
      <header className="container-site border-b border-steel py-[clamp(2.5rem,7vh,5rem)]">
        <p className="t-label mb-5">Information</p>
        <RevealText as="h1" text={page.title} className="t-h1 block text-bone" />
      </header>

      <article className="container-site py-[clamp(2.5rem,7vh,5rem)]">
        <div
          className={PROSE}
          dangerouslySetInnerHTML={{ __html: cleanShopifyHtml(page.body || '') }}
        />
      </article>
    </div>
  );
}
