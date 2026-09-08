import { cn } from '@/lib/utils';

/**
 * The GDC labyrinth mark, traced to vector from the original brand asset
 * (the source file was a 152x192 JPEG, unusable at scale on a dark ground).
 * Uses currentColor so it inherits whatever it sits on.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
      className={className}
    >
      <path d="M479.59 47.19 493.62 47.19 622.45 285.71 622.45 308.67 584.18 371.17 497.45 206.63 479.59 201.53 122.45 873.72 877.55 872.45 783.16 691.33 762.76 673.47 709.18 673.47 705.36 683.67 775.51 809.95 774.23 825.26 195.15 825.26 400.51 441.33 492.35 434.95 451.53 352.04 488.52 286.99 656.89 595.66 816.33 602.04 1000 937.5 1000 952.81 0 952.81 0 937.5ZM445.15 508.93 431.12 519.13 308.67 757.65 665.82 758.93 539.54 516.58ZM457.91 557.4 506.38 557.4 531.89 600.77 528.06 610.97 483.42 610.97 459.18 660.71 563.78 663.27 588.01 713.01 371.17 709.18Z" />
    </svg>
  );
}

/** Mark plus wordmark, as used in the header and footer. */
export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Mark className={cn('h-7 w-7', markClassName)} />
      {showWordmark && (
        <span
          className="text-[13px] leading-none"
          style={{ fontVariationSettings: "'wdth' 88, 'wght' 800", letterSpacing: '0.2em' }}
        >
          CLOTHING
        </span>
      )}
    </span>
  );
}
