'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FILM, BRAND } from '@/lib/brand';
import { gsap, reducedMotion } from '@/lib/gsap';

/**
 * The fold. The brand film runs full-bleed and the headline is set over it in
 * two condensed lines that rise out of their own clip boxes on load.
 *
 * The film is graded in CSS rather than left raw — crushed a little, slightly
 * desaturated, vignetted — so it sits in the same world as the rest of the site
 * instead of looking like a video pasted onto a black page.
 */
export default function HeroFilm() {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const lines = el.querySelectorAll<HTMLElement>('[data-line]');
    const meta = el.querySelectorAll<HTMLElement>('[data-meta]');

    if (reducedMotion()) {
      gsap.set([lines, meta], { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        lines,
        { yPercent: 108 },
        { yPercent: 0, duration: 1.4, stagger: 0.09, ease: 'expo.out' },
      ).fromTo(
        meta,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'expo.out' },
        '-=0.9',
      );

      // Slow drift on the film as you leave the fold.
      gsap.to(el.querySelector('[data-film]'), {
        yPercent: 12,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="grain relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-void"
    >
      <div data-film className="absolute inset-0 will-change-transform">
        {/* 2.6KB plate, up instantly — the 8MB film fades in over the top of it. */}
        <div
          aria-hidden
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${FILM.primary.posterTiny})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(26px) saturate(0.7) contrast(1.1) brightness(0.55)',
          }}
        />
        <video
          ref={videoRef}
          className="relative h-full w-full object-cover"
          style={{
            filter: 'saturate(0.72) contrast(1.12) brightness(0.62)',
            opacity: ready ? 1 : 0,
            transition: 'opacity 1.2s cubic-bezier(0.16,1,0.3,1)',
          }}
          src={FILM.primary.src}
          poster={FILM.primary.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => {
            setReady(true);
            // Chrome will not always honour the autoplay attribute on a large
            // file that arrives after hydration; ask explicitly.
            videoRef.current?.play().catch(() => {});
          }}
        />
      </div>

      {/* Grade: pull the base into ink so type always has a ground. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(8,8,10,0.75)_100%)]" />

      <div className="container-site relative flex h-full flex-col justify-end pb-[clamp(2.5rem,7vh,5rem)]">
        <div className="mb-6 flex items-center gap-4">
          <span data-meta className="h-px w-12 bg-signal" style={{ opacity: 0 }} />
          <span data-meta className="t-label text-bone/90" style={{ opacity: 0 }}>
            Drop 001 — Out now
          </span>
        </div>

        <h1 className="t-display text-bone">
          {BRAND.tagline.map((line) => (
            <span key={line} className="block overflow-hidden">
              <span data-line className="block will-change-transform">
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link data-meta href="/collections/drop-001" className="btn-solid" style={{ opacity: 0 }}>
            Shop Drop 001
          </Link>
          <Link data-meta href="/collections/shop-all" className="btn-ghost" style={{ opacity: 0 }}>
            Shop all
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-[var(--gutter)] hidden items-center gap-3 md:flex">
        <span className="t-label">Scroll</span>
        <span className="block h-10 w-px overflow-hidden bg-steel">
          <span className="block h-1/2 w-full animate-[marquee_2s_ease-in-out_infinite] bg-bone" />
        </span>
      </div>
    </section>
  );
}
