'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap';

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds of delay before this element starts. */
  delay?: number;
  /** Travel distance in px. Larger reads heavier. */
  y?: number;
  /** Fraction of viewport that must be crossed before firing. */
  start?: string;
};

/** Fade-and-rise on scroll. The workhorse for blocks and imagery. */
export function Reveal({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  y = 44,
  start = 'top 88%',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1.15,
          delay,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, start]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}

/**
 * Word-by-word masked reveal — each word rises out of its own clipped box.
 * Used for headlines only; it is expensive and loses its impact if overused.
 */
export function RevealText({
  text,
  className,
  as: Tag = 'span',
  delay = 0,
  stagger = 0.055,
  start = 'top 90%',
}: {
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-word]');

    if (reducedMotion()) {
      gsap.set(targets, { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 112, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.25,
          delay,
          stagger,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, stagger, start, text]);

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden align-bottom">
            <span data-word className="inline-block will-change-transform" style={{ opacity: 0 }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
