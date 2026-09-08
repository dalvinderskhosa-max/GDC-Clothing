import type { Metadata } from 'next';
import Image from 'next/image';
import { getBlogArticles } from '@/lib/shopify';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The Grind',
  description: 'Stories, drops and mindset from GDC Clothing.',
};

export default async function BlogPage({
  params,
}: {
  params: { handle: string };
}) {
  const articles = await getBlogArticles(params.handle, 12).catch(() => []);

  return (
    <div>
      <section className="border-b border-ink/10 bg-cream">
        <div className="container-site py-14 text-center lg:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-brand text-mauve">
            Journal
          </p>
          <h1 className="font-display text-5xl uppercase tracking-brand sm:text-6xl">
            The Grind
          </h1>
        </div>
      </section>

      <section className="container-site py-12 lg:py-16">
        {articles.length === 0 ? (
          <div className="py-20 text-center text-smoke">
            <p className="font-display text-3xl uppercase tracking-brand text-ink">
              Stories coming soon
            </p>
            <p className="mt-3 text-sm">The come-up is being documented. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.handle} className="group">
                <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                  {article.image && (
                    <Image
                      src={article.image.url}
                      alt={article.image.altText || article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <h2 className="mt-4 font-display text-2xl uppercase tracking-brand">
                  {article.title}
                </h2>
                <p className="mt-2 text-sm text-smoke line-clamp-3">{article.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
