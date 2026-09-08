'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A short film band under the header on story pages. Loads only when scrolled
 * near — there is no reason to pull a 12MB file for someone reading a policy
 * link that happens to sit next to it.
 */
export default function FilmBand({ src }: { src: string }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        const v = video.current;
        if (!v) return;
        if (entry.isIntersecting) {
          if (!v.src) v.src = src;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: '300px 0px', threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return (
    <div
      ref={root}
      className="grain relative aspect-[21/9] w-full overflow-hidden bg-void md:aspect-[21/7]"
    >
      <video
        ref={video}
        className="h-full w-full object-cover transition-opacity duration-1000 ease-cine"
        style={{
          filter: 'saturate(0.7) contrast(1.1) brightness(0.55)',
          opacity: visible ? 1 : 0,
        }}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
    </div>
  );
}
