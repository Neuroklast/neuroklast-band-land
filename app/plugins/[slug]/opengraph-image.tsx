import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { loadPublicProduct } from '@/lib/plugins/public-catalog'
import { pluginPrimaryImage, pluginSeoDescription } from '@/lib/plugins/seo'
import { canonicalizeR2MediaUrl, currentR2PublicOrigin } from '@/lib/r2-url-rewrite'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const revalidate = 300
export const alt = 'NEUROKLAST AUDIO plugin preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Social bots request this independently of the HTML. Never redirect to a
 * private source or fetch arbitrary URLs from product fields (SSRF).
 */
function allowedPublicImage(value: string): URL | null {
  try {
    const url = new URL(canonicalizeR2MediaUrl(value))
    if (url.protocol !== 'https:' || url.username || url.password) return null
    const configured = currentR2PublicOrigin()
    if (!configured || url.origin !== new URL(configured).origin) return null
    return url
  } catch {
    return null
  }
}

async function coverDataUrl(value: string | null): Promise<string | null> {
  if (!value) return null
  const url = allowedPublicImage(value)
  if (!url) return null
  try {
    const response = await fetch(url, {
      redirect: 'error',
      signal: AbortSignal.timeout(4000),
      cache: 'force-cache',
    })
    if (!response.ok || !/^image\/(png|jpeg|webp)$/i.test(response.headers.get('content-type') ?? '')) return null
    if (Number(response.headers.get('content-length') ?? 0) > 8_000_000) return null
    const data = new Uint8Array(await response.arrayBuffer())
    if (data.byteLength > 8_000_000) return null
    // Satori accepts PNG/JPEG reliably. Sharp bounds decoding size.
    const png = await sharp(data, { limitInputPixels: 25_000_000 })
      .resize(670, 520, { fit: 'contain', background: '#070707', withoutEnlargement: true })
      .png()
      .toBuffer()
    return 'data:image/png;base64,' + png.toString('base64')
  } catch {
    // An unavailable original image must never cause broken share previews.
    return null
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await loadPublicProduct(slug)
  if (!product) notFound()
  const description = pluginSeoDescription(product)
  const primaryImage = pluginPrimaryImage(product)
  const imageData = await coverDataUrl(primaryImage)

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#050505', color: '#f8f8f8', padding: '52px 58px', fontFamily: 'sans-serif' }}>
        <div style={{ position: 'absolute', display: 'flex', top: 0, left: 0, width: '100%', height: 8, backgroundColor: '#be1a2b' }} />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', paddingRight: imageData ? 32 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#e04450', fontSize: 23, letterSpacing: 5, fontWeight: 800, marginBottom: 62 }}>NEUROKLAST AUDIO</div>
            <div style={{ display: 'flex', fontSize: product.title.length > 17 ? 47 : 64, lineHeight: 1.05, fontWeight: 800, letterSpacing: -2, overflow: 'hidden', maxHeight: 225 }}>
              {product.title.toUpperCase()}
            </div>
            <div style={{ display: 'flex', marginTop: 30, fontSize: 23, lineHeight: 1.35, color: '#c6c6c6', maxHeight: 140, overflow: 'hidden' }}>
              {description}
            </div>
          </div>
          <div style={{ display: 'flex', color: '#a2a2a2', fontSize: 17, letterSpacing: 3 }}>NEUROKLAST.NET / PLUGINS</div>
        </div>
        {imageData && (
          <div style={{ display: 'flex', width: 620, flexShrink: 0, alignItems: 'center', justifyContent: 'center', border: '1px solid #2d171b', backgroundColor: '#070707' }}>
            <img src={imageData} width={620} height={480} alt="" style={{ objectFit: 'contain' }} />
          </div>
        )}
      </div>
    ),
    { ...size },
  )
}
