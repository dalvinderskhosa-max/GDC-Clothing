import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPage, getPageHandles } from '@/lib/shopify';
import { cleanShopifyHtml, PROSE } from '@/lib/utils';
import { FILM } from '@/lib/brand';
import { RevealText, Reveal } from '@/components/motion/reveal';
import FilmBand from '@/components/content/film-band';

export const revalidate = 3600;

/**
 * Two treatments. Story pages carry the brand — they get a film band and a
 * closing call to action. Policy and support pages get a plain measured column,
 * because a legal notice wrapped in cinematic furniture reads as evasive.
 */
const EDITORIAL = new Set([
  'about-us',
  'community',
  'ambassadors',
  'sustainability',
  'lookbook',
  'press',
]);

export async function generateStaticParams() {
  const handles = await getPageHandles().catch(() => []);
  return handles.map((handle) => ({ handle }));
}

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

  const editorial = EDITORIAL.has(params.handle);
  const body = cleanShopifyHtml(page.body || '');

  return (
    <div className="pt-[var(--header-h)]">
      <header className="container-site border-b border-steel py-[clamp(2.5rem,7vh,5rem)]">
        <p className="t-label mb-5">{editorial ? 'The brand' : 'Information'}</p>
        <RevealText as="h1" text={page.title} className="t-h1 block text-bone" />
      </header>

      {editorial && <FilmBand src={FILM.secondary.src} />}

      <article className="container-site py-[clamp(2.5rem,7vh,5rem)]">
        <div className={PROSE} dangerouslySetInnerHTML={{ __html: body }} />

        {editorial && (
          <Reveal className="mt-16 border-t border-steel pt-12" y={24}>
            <p className="t-label mb-4">Drop 001</p>
            <h2 className="t-h2 max-w-xl text-bone">Money oriented. Grind focused.</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collections/drop-001" className="btn-solid">
                Shop the drop
              </Link>
              <Link href="/blogs/the-grind" className="btn-ghost">
                Read The Grind
              </Link>
            </div>
          </Reveal>
        )}
      </article>
    </div>
  );
}
