import type { Metadata } from 'next';
import Image from 'next/image';
import { getBlogArticles } from '@/lib/shopify';
import { RevealText, Reveal } from '@/components/motion/reveal';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The Grind',
  description: 'Stories, drops and mindset from GDC Clothing.',
};

export default async function BlogPage({ params }: { params: { handle: string } }) {
  const articles = await getBlogArticles(params.handle, 12).catch(() => []);

  return (
    <div className="pt-[var(--header-h)]">
      <header className="container-site border-b border-steel py-[clamp(2.5rem,7vh,5rem)]">
        <p className="t-label mb-5">Journal</p>
        <RevealText as="h1" text="The Grind" className="t-h1 block text-bone" />
      </header>

      <section className="container-site py-[clamp(2.5rem,7vh,5rem)]">
        {articles.length === 0 ? (
          <div className="max-w-md py-16">
            <h2 className="t-h2 text-bone">Stories coming soon</h2>
            <p className="t-body mt-4">
              The come-up is being documented. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <Reveal key={article.handle} delay={i * 0.06}>
                <article className="group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-carbon">
                    {article.image && (
                      <Image
                        src={article.image.url}
                        alt={article.image.altText || article.title}
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1100ms] ease-cine group-hover:scale-[1.05]"
                        style={{ filter: 'brightness(0.82) contrast(1.14) saturate(0.84)' }}
                      />
                    )}
                    <span className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-500 ease-cine group-hover:border-bone/25" />
                  </div>
                  <h2
                    className="mt-5 text-lg uppercase leading-tight text-bone"
                    style={{ fontVariationSettings: "'wdth' 86, 'wght' 750", letterSpacing: '-0.01em' }}
                  >
                    {article.title}
                  </h2>
                  <p className="t-body mt-2 line-clamp-3 text-[14px]">{article.excerpt}</p>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
