import Link from 'next/link';
import { Mark } from '@/components/brand/logo';

export default function NotFound() {
  return (
    <div className="container-site flex min-h-[80svh] flex-col justify-center pt-[var(--header-h)]">
      <Mark className="h-12 w-12 text-signal" />
      <p className="t-label mt-8">Error 404</p>
      <h1 className="t-h1 mt-4 max-w-2xl text-bone">This page took the L</h1>
      <p className="t-body mt-6 max-w-sm">
        The page you&apos;re after doesn&apos;t exist or has been moved. The drop is still live
        though.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/collections/drop-001" className="btn-solid">
          Shop Drop 001
        </Link>
        <Link href="/" className="btn-ghost">
          Back home
        </Link>
      </div>
    </div>
  );
}
