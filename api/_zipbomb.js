import { createGzip } from 'node:zlib'
import { Readable } from 'node:stream'

// 10 MB of null bytes, gzip-compressed at maximum compression
// Pre-generate synchronously at module load
let ZIP_BOMB_BUFFER = null

function getZipBombBuffer() {
  if (ZIP_BOMB_BUFFER) return ZIP_BOMB_BUFFER
  return new Promise((resolve, reject) => {
    const chunks = []
    const gz = createGzip({ level: 9 })
    const source = new Readable({
      read(size) {
        // Push 10 MB null bytes in 64k chunks
        const total = 10 * 1024 * 1024
        let sent = 0
        const chunk = Buffer.alloc(65536, 0)
        while (sent < total) {
          this.push(chunk.slice(0, Math.min(65536, total - sent)))
          sent += 65536
        }
        this.push(null)
      }
    })
    source.pipe(gz)
    gz.on('data', c => chunks.push(c))
    gz.on('end', () => {
      ZIP_BOMB_BUFFER = Buffer.concat(chunks)
      resolve(ZIP_BOMB_BUFFER)
    })
    gz.on('error', reject)
  })
}

/**
 * Serve a zip-bomb response to the requester.
 * The response claims to be a small zip file but decompresses to 10 MB of nulls.
 * This wastes bot memory and CPU without affecting real users (who won't request
 * paths that trigger this).
 *
 * ONLY call this for confirmed bots/attackers — never for legitimate traffic.
 */
export async function serveZipBomb(res) {
  try {
    const bomb = await getZipBombBuffer()
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Encoding', 'gzip')
    res.setHeader('Content-Disposition', 'attachment; filename="data.zip"')
    res.setHeader('Content-Length', bomb.length)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).send(bomb)
  } catch {
    return res.status(200).send(Buffer.alloc(0))
  }
}
