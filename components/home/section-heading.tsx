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
    <div className="mb-10 flex items-end justify-between gap-6 border-b border-steel pb-5">
      <div>
        {eyebrow && <p className="t-label mb-3">{eyebrow}</p>}
        <h2 className="t-h2 text-bone">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="link-wipe t-meta shrink-0 pb-1 text-mist hover:text-bone">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
