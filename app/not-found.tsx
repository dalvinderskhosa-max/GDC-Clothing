import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-8xl uppercase tracking-brand text-signal">404</p>
      <h1 className="mt-2 text-3xl uppercase tracking-brand">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-sm text-mist">
        This one got away. Head back and keep the grind going.
      </p>
      <Link href="/" className="btn-solid mt-8">
        Back to home
      </Link>
    </div>
  );
}
