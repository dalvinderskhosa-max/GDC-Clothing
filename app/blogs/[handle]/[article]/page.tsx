import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticle, getBlogArticles, getBlogHandles } from '@/lib/shopify';
import { cleanShopifyHtml, PROSE } from '@/lib/utils';
import { RevealText } from '@/components/motion/reveal';
import { JsonLd } from '@/components/seo/json-ld';
import { resolveSiteUrl } from '@/lib/env';

export const revalidate = 3600;

export async function generateStaticParams() {
  const blogs = await getBlogHandles().catch(() => []);
  const params: { handle: string; article: string }[] = [];
  for (const handle of blogs) {
    const articles = await getBlogArticles(handle, 50).catch(() => []);
    for (const a of articles) params.push({ handle, article: a.handle });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { handle: string; article: string };
}): Promise<Metadata> {
  const article = await getArticle(params.handle, params.article);
  if (!article) return { title: 'Not found' };
  return {
    title: article.title,
    description: article.excerpt?.slice(0, 160) || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt?.slice(0, 160) || undefined,
      type: 'article',
      publishedTime: article.publishedAt,
      images: article.image ? [{ url: article.image.url }] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { handle: string; article: string };
}) {
  const article = await getArticle(params.handle, params.article);
  if (!article) notFound();

  const date = (() => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(article.publishedAt));
    } catch {
      return '';
    }
  })();

  const base = resolveSiteUrl().origin;

  return (
    <div className="pt-[var(--header-h)]">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: article.title,
          description: article.excerpt?.slice(0, 300) || undefined,
          datePublished: article.publishedAt,
          image: article.image ? [article.image.url] : undefined,
          author: { '@type': 'Organization', name: 'GDC Clothing' },
          publisher: { '@type': 'Organization', name: 'GDC Clothing' },
          mainEntityOfPage: `${base}/blogs/${params.handle}/${article.handle}`,
        }}
      />
      <header className="container-site border-b border-steel py-[clamp(2.5rem,7vh,5rem)]">
        <Link href={`/blogs/${params.handle}`} className="t-label link-wipe hover:text-bone">
          ← The Grind
        </Link>
        <RevealText
          as="h1"
          text={article.title}
          className="t-h2 mt-6 block max-w-4xl text-bone"
        />
        {date && <p className="t-label mt-6">{date}</p>}
      </header>

      {article.image && (
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-carbon">
          <Image
            src={article.image.url}
            alt={article.image.altText || article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: 'brightness(0.84) contrast(1.12) saturate(0.86)' }}
          />
        </div>
      )}

      <article className="container-site py-[clamp(2.5rem,7vh,5rem)]">
        <div
          className={PROSE}
          dangerouslySetInnerHTML={{ __html: cleanShopifyHtml(article.contentHtml || '') }}
        />
        <div className="mt-14 border-t border-steel pt-8">
          <Link href={`/blogs/${params.handle}`} className="btn-ghost">
            All stories
          </Link>
        </div>
      </article>
    </div>
  );
}
