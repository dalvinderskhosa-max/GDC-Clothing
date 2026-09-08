import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="pt-[var(--header-h)]">
      <div className="container-site py-5">
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="grid lg:grid-cols-[1.35fr_1fr]">
        <div className="lg:border-r lg:border-steel">
          <Skeleton className="aspect-[4/5] w-full" />
        </div>
        <div className="px-[var(--gutter)] py-10 lg:py-14">
          <Skeleton className="h-[clamp(1.85rem,3.6vw,3.25rem)] w-4/5" />
          <Skeleton className="mt-5 h-6 w-24" />
          <Skeleton className="mt-9 h-3 w-16" />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-14" />
            ))}
          </div>
          <Skeleton className="mt-8 h-[58px] w-full" />
          <Skeleton className="mt-10 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-5/6" />
          <Skeleton className="mt-3 h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
