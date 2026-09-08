import Link from 'next/link';

export default function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = 'View all',
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-brand text-mauve">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-4xl uppercase tracking-brand sm:text-5xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="link-underline hidden whitespace-nowrap text-xs font-semibold uppercase tracking-brand sm:block"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
