'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, reducedMotion } from '@/lib/gsap';

/**
 * Full-bleed film interruption between merchandising blocks. The video only
 * starts once it is actually on screen — there is no reason to spend a
 * visitor's bandwidth on a 12MB file they may never scroll to.
 */
export default function FilmBreak({
  src,
  heading,
  body,
}: {
  src: string;
  heading: string;
  body: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
        const v = video.current;
        if (!v) return;
        if (entry.isIntersecting) {
          if (!v.src) v.src = src;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.05 },
    );
    io.observe(el);

    let ctx: gsap.Context | undefined;
    if (!reducedMotion()) {
      ctx = gsap.context(() => {
        gsap.to(el.querySelector('[data-film]'), {
          yPercent: 14,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }, el);
    }

    return () => {
      io.disconnect();
      ctx?.revert();
    };
  }, [src]);

  return (
    <section
      ref={root}
      className="grain relative flex h-[78svh] min-h-[480px] items-end overflow-hidden bg-void"
    >
      <div data-film className="absolute inset-0 scale-110 will-change-transform">
        <video
          ref={video}
          className="h-full w-full object-cover"
          style={{ filter: 'saturate(0.7) contrast(1.1) brightness(0.55)' }}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

      <div className="container-site relative pb-[clamp(2.5rem,7vh,5rem)]">
        <h2
          className="t-h1 max-w-3xl text-bone transition-[opacity,transform] duration-1000 ease-cine"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? 'translateY(0)' : 'translateY(28px)',
          }}
        >
          {heading}
        </h2>
        <p
          className="t-body mt-6 max-w-md transition-[opacity,transform] delay-150 duration-1000 ease-cine"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {body}
        </p>
      </div>
    </section>
  );
}
