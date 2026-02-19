import { createGzip } from 'node:zlib'
import { Readable } from 'node:stream'

// 10 MB of null bytes, gzip-compressed at maximum compression
// Pre-generate synchronously at module load
let ZIP_BOMB_BUFFER = null

function getZipBombBuffer() {
  if (ZIP_BOMB_BUFFER) return Promise.resolve(ZIP_BOMB_BUFFER)
  return new Promise((resolve, reject) => {
    const chunks = []
    const gz = createGzip({ level: 9 })
    const total = 10 * 1024 * 1024
    let sent = 0
    const chunkSize = 65536
    const source = new Readable({
      read() {
        // Push one chunk at a time when requested by the stream
        if (sent >= total) {
          this.push(null)
          return
        }
        const size = Math.min(chunkSize, total - sent)
        this.push(Buffer.alloc(size, 0))
        sent += size
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
