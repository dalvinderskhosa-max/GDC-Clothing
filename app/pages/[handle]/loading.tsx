import { HeaderSkeleton, Skeleton } from '@/components/ui/skeleton';

const LINES = ['w-full', 'w-[92%]', 'w-[96%]', 'w-[70%]', 'w-[88%]', 'w-[60%]'];

export default function Loading() {
  return (
    <div className="pt-[var(--header-h)]">
      <HeaderSkeleton />
      <article className="container-site py-[clamp(2.5rem,7vh,5rem)]">
        <div className="max-w-2xl space-y-4">
          {LINES.map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>
      </article>
    </div>
  );
}
