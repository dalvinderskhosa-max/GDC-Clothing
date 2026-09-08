/**
 * Structured data. Rendered as a plain script tag rather than via a library —
 * the shapes are small and schema.org changes rarely.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built server-side from Shopify data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
