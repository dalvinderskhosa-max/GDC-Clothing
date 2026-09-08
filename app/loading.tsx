import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-[100svh] bg-ink">
      <div className="container-site flex h-[100svh] flex-col justify-end pb-[clamp(2.5rem,7vh,5rem)]">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-6 h-[clamp(3.25rem,11vw,12rem)] w-[min(52rem,92%)]" />
        <Skeleton className="mt-3 h-[clamp(3.25rem,11vw,12rem)] w-[min(42rem,78%)]" />
        <div className="mt-9 flex gap-3">
          <Skeleton className="h-[52px] w-44" />
          <Skeleton className="h-[52px] w-32" />
        </div>
      </div>
    </div>
  );
}
