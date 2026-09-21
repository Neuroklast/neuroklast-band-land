import { serializeJsonLd } from '@/lib/structured-data'

/**
 * Renders Schema.org JSON-LD inline. Server component — builders run on the
 * server and only the serialized payload reaches the client.
 */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const entries = (Array.isArray(data) ? data : [data]).filter(Boolean)
  if (entries.length === 0) return null

  return (
    <>
      {entries.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(entry) }}
        />
      ))}
    </>
  )
}
