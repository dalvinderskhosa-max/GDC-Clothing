import { HeaderSkeleton, ProductGridSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="pt-[var(--header-h)]">
      <HeaderSkeleton />
      <section className="container-site py-[clamp(2.5rem,7vh,5rem)]">
        <ProductGridSkeleton />
      </section>
    </div>
  );
}
