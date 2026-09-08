const MESSAGES = [
  'FREE UK SHIPPING OVER £75',
  'DROP 001 — OUT NOW',
  'MONEY ORIENTED. GRIND FOCUSED.',
  'STUDENT DISCOUNT AVAILABLE',
  '30-DAY RETURNS',
];

export default function Marquee() {
  const strip = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden bg-ink py-2 text-paper">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {strip.map((msg, i) => (
          <span
            key={i}
            className="mx-6 text-[11px] font-medium uppercase tracking-brand"
          >
            {msg}
            <span className="ml-12 text-mauve">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
