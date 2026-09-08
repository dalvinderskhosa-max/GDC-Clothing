'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Money } from '@/lib/shopify/types';
import { formatMoney } from '@/lib/utils';
import { sized, TEXTURE_WIDTH } from '@/lib/shopify-image';
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap';

const DropSequence = dynamic(() => import('@/components/webgl/drop-sequence'), {
  ssr: false,
});

/**
 * The collection as a dolly shot.
 *
 * The section is pinned for one viewport per product; scroll is scrubbed into a
 * ref that the WebGL rig reads on its own frame loop.
 *
 * Two things here matter for performance and are easy to get wrong:
 *  1. `images` is memoised. It is a prop on the Canvas, so rebuilding the array
 *     each render would remount every panel and re-fetch every texture.
 *  2. The progress rail is written straight to the DOM node rather than held in
 *     state. Only the *active product* is state — about five renders across the
 *     whole sequence instead of one per frame.
 */
/** Only what the sequence actually renders — keeps the RSC payload small. */
export type DropItem = {
  handle: string;
  title: string;
  price: Money;
  image: string;
};

export default function DropExperience({ items: incoming }: { items: DropItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const [webgl, setWebgl] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);

  const items = useMemo(() => incoming.slice(0, 7), [incoming]);
  // Textures are fetched by three.js directly, so they must be sized here —
  // next/image never sees them.
  const images = useMemo(
    () => items.map((p) => sized(p.image, TEXTURE_WIDTH)).filter(Boolean),
    [items],
  );

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      setWebgl(!!(c.getContext('webgl2') || c.getContext('webgl')) && !reducedMotion());
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || !items.length || reducedMotion()) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
          if (rail.current) rail.current.style.width = `${self.progress * 100}%`;
          const idx = Math.min(
            items.length - 1,
            Math.round(self.progress * (items.length - 1)),
          );
          setActive((prev) => (prev === idx ? prev : idx));
        },
      });
    }, el);

    return () => ctx.revert();
  }, [items.length]);

  useEffect(() => {
    const el = title.current;
    if (!el) return;
    if (reducedMotion()) {
      gsap.set(el, { yPercent: 0, opacity: 1 });
      return;
    }
    gsap.fromTo(
      el,
      { yPercent: 105, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', overwrite: 'auto' },
    );
  }, [active]);

  if (!items.length) return null;
  const current = items[active];

  return (
    <section
      ref={root}
      className="relative"
      style={{ height: `${items.length * 100}svh` }}
      aria-label="Drop 001 collection"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-ink">
        <div className="absolute inset-0">
          {webgl && images.length > 0 && (
            <DropSequence images={images} progressRef={progress} />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(8,8,10,0.6)_100%)]" />
        {/* Left scrim — the headline has to stay readable over any garment. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,10,0.94)_0%,rgba(8,8,10,0.70)_22%,rgba(8,8,10,0.12)_48%,rgba(8,8,10,0)_68%)]" />

        <div className="container-site pointer-events-none relative flex h-full flex-col justify-between py-[calc(var(--header-h)+2rem)]">
          <div className="flex items-start justify-between">
            <p className="t-label">Drop 001 — The collection</p>
            <p className="t-label tabular-nums">
              {String(active + 1).padStart(2, '0')}
              <span className="mx-1 text-smoke">/</span>
              {String(items.length).padStart(2, '0')}
            </p>
          </div>

          <div className="max-w-2xl lg:max-w-[46%]">
            <div className="overflow-hidden pb-[0.14em]">
              <h2 ref={title} className="t-h1 text-bone" style={{ opacity: 0 }}>
                {current.title}
              </h2>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <p className="text-lg tabular-nums text-mist">
                {formatMoney(current.price)}
              </p>
              <Link
                href={`/products/${current.handle}`}
                className="btn-solid pointer-events-auto"
              >
                View piece
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="t-label shrink-0">Scroll</span>
            <span className="relative h-px flex-1 bg-steel">
              <span ref={rail} className="absolute inset-y-0 left-0 w-0 bg-signal" />
            </span>
          </div>
        </div>

        {!webgl && images[active] && (
          <div className="absolute inset-0 -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active]}
              alt={current.title}
              className="h-full w-full object-cover opacity-45"
              style={{ filter: 'brightness(0.7) contrast(1.15) saturate(0.8)' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
