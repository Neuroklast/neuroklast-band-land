import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  admin: vi.fn(),
  file: vi.fn(),
}))
vi.mock('@/lib/neurokore/server', () => ({ admin: state.admin }))
vi.mock('@/lib/billing/service', () => ({ invoiceDocumentFile: state.file }))
import { GET } from '@/app/api/admin/billing/[id]/document/route'

const id='26354dad-1098-4d08-97c7-fbb52e46d63a'
function request(format:string) {
  return new Request('https://neuroklast.net/api/admin/billing/'+id+'/document?format='+format+'&_rsc=test')
}
const ctx={params:Promise.resolve({id})}

describe('private same-origin billing downloads',()=>{
  beforeEach(()=>{
    state.admin.mockReset().mockResolvedValue({})
    state.file.mockReset().mockResolvedValue({
      bytes:Buffer.from('%PDF-1.4 test'),
      fileName:'RE-2026-000001.pdf',
      contentType:'application/pdf',
    })
  })

  it('streams verified PDF bytes without exposing signed R2 URLs or redirects',async()=>{
    const response=await GET(request('pdf'),ctx)
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('content-type')).toBe('application/pdf')
    expect(response.headers.get('content-disposition')).toContain('inline')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(await response.text()).toBe('%PDF-1.4 test')
    expect(state.file).toHaveBeenCalledWith(id,'pdf')
  })

  it.each(['odt','fodt','xrechnung'])('serves %s through same-origin endpoint',async(format)=>{
    state.file.mockResolvedValue({
      bytes:Buffer.from('file'),fileName:'RE-2026-000001.'+(format==='xrechnung'?'xml':format),
      contentType:'application/octet-stream',
    })
    const response=await GET(request(format),ctx)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-disposition')).toContain('attachment')
    expect(response.headers.get('location')).toBeNull()
    expect(state.file).toHaveBeenCalledWith(id,format)
  })

  it('rejects unsupported format and missing format before touching the archive',async()=>{
    expect((await GET(request('invalid'),ctx)).status).toBe(400)
    expect((await GET(new Request('https://neuroklast.net/api/admin/billing/'+id+'/document'),ctx)).status).toBe(400)
    expect(state.file).not.toHaveBeenCalled()
  })

  it('checks admin authorization before touching private data',async()=>{
    state.admin.mockRejectedValue(new Error('unauthorized'))
    const response=await GET(request('pdf'),ctx)
    expect(response.status).toBe(403)
    expect(state.file).not.toHaveBeenCalled()
  })

  it('fails closed if the archived document is unavailable or invalid',async()=>{
    state.file.mockRejectedValue(new Error('Invoice archive failed integrity check'))
    const response=await GET(request('pdf'),ctx)
    expect(response.status).toBe(404)
    expect(response.headers.get('cache-control')).toContain('no-store')
  })
})
