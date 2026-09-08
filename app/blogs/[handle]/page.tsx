import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogArticles, getBlogHandles } from '@/lib/shopify';
import { RevealText, Reveal } from '@/components/motion/reveal';

export const revalidate = 3600;

export async function generateStaticParams() {
  const handles = await getBlogHandles().catch(() => []);
  return handles.map((handle) => ({ handle }));
}

export const metadata: Metadata = {
  title: 'The Grind',
  description: 'Stories, drops and mindset from GDC Clothing.',
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default async function BlogPage({ params }: { params: { handle: string } }) {
  const articles = await getBlogArticles(params.handle, 50).catch(() => []);

  return (
    <div className="pt-[var(--header-h)]">
      <header className="container-site border-b border-steel py-[clamp(2.5rem,7vh,5rem)]">
        <p className="t-label mb-5">Journal</p>
        <RevealText as="h1" text="The Grind" className="t-h1 block text-bone" />
        <p className="t-body mt-7 max-w-md">
          Stories, drops and mindset — written for the ones building something.
        </p>
      </header>

      {articles.length === 0 ? (
        <section className="container-site py-[clamp(2.5rem,7vh,5rem)]">
          <h2 className="t-h2 text-bone">Stories coming soon</h2>
          <p className="t-body mt-4 max-w-sm">
            The come-up is being documented. Check back shortly.
          </p>
        </section>
      ) : (
        /* These articles carry no cover imagery, so an image grid would be a
           wall of empty boxes. An editorial index puts the writing first. */
        <section className="container-site pb-[clamp(3rem,8vh,6rem)]">
          <ul>
            {articles.map((article, i) => (
              <Reveal as="li" key={article.handle} delay={Math.min(i, 6) * 0.04}>
                <Link
                  href={`/blogs/${params.handle}/${article.handle}`}
                  className="group grid grid-cols-[auto_1fr] gap-x-6 border-b border-steel py-8 transition-colors duration-500 ease-cine hover:bg-carbon md:grid-cols-[4rem_1fr_auto] md:gap-x-10 md:py-10"
                >
                  <span className="t-label pt-1.5 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <h2
                      className="text-[clamp(1.15rem,2.2vw,1.9rem)] uppercase leading-[1.05] text-bone transition-colors duration-500 group-hover:text-signal"
                      style={{
                        fontVariationSettings: "'wdth' 84, 'wght' 780",
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="t-body mt-3 line-clamp-2 max-w-2xl text-[14px]">
                        {article.excerpt}
                      </p>
                    )}
                    {article.image && (
                      <div className="relative mt-5 aspect-[16/7] w-full max-w-2xl overflow-hidden bg-carbon">
                        <Image
                          src={article.image.url}
                          alt={article.image.altText || article.title}
                          fill
                          sizes="(min-width:768px) 42vw, 100vw"
                          className="object-cover"
                          style={{ filter: 'brightness(0.84) contrast(1.12) saturate(0.86)' }}
                        />
                      </div>
                    )}
                  </div>

                  <span className="t-label col-start-2 mt-4 whitespace-nowrap pt-1.5 md:col-start-3 md:mt-0">
                    {formatDate(article.publishedAt)}
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
