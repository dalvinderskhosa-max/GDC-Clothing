import { Mark } from '@/components/brand/logo';

/** Continuous brand ticker. Duplicated once so the loop is seamless. */
export default function Ticker({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-steel bg-ink py-3.5">
      <div className="flex w-max animate-marquee items-center gap-8 will-change-transform motion-reduce:animate-none">
        {row.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8">
            <span className="t-meta whitespace-nowrap text-mist">{item}</span>
            <Mark className="h-3 w-3 shrink-0 text-signal" />
          </span>
        ))}
      </div>
    </div>
  );
}
