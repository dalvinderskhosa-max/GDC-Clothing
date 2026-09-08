'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap';

/**
 * Lenis drives the scroll position and GSAP's ticker drives Lenis, so
 * ScrollTrigger and the smoothed scroll never disagree about where we are.
 * Skipped outright when the visitor prefers reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
