'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;
if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/** True when the visitor has asked the OS for less motion. */
export function reducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger };
