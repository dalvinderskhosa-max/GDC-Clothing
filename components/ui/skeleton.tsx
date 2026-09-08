import { cn } from '@/lib/utils';

/**
 * Placeholder block. Square, low-contrast, and quiet — a skeleton should hint
 * at the shape of what is arriving without competing with it. Pulse is disabled
 * under prefers-reduced-motion by the global rule in globals.css.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-carbon', className)} />;
}

/** Matches the header block used by collections, pages and the journal. */
export function HeaderSkeleton() {
  return (
    <header className="container-site border-b border-steel py-[clamp(2.5rem,7vh,5rem)]">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-6 h-[clamp(2.5rem,6.5vw,6rem)] w-[min(28rem,80%)]" />
      <Skeleton className="mt-7 h-4 w-[min(20rem,60%)]" />
    </header>
  );
}

/** Matches ProductGrid's aspect ratio and two-line caption. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="flex items-baseline justify-between gap-4 pt-4">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
