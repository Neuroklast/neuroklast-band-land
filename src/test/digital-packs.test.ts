import { describe, expect, it } from 'vitest'
import { packIsReady, packSchema, digitalPackSalesOpen } from '@/lib/digital-packs/rules'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ready = {
  id:'123e4567-e89b-42d3-a456-426614174000',
  title:'Hard Techno Kicks', description:'24 carefully designed presets',
  pack_type:'preset_pack' as const,is_free:true,price_cents:0,
  sample_count:24,format_description:'NEUROKORE 1.0+',
  license_notes:'Free for use in commercial music. Redistribution of source files prohibited.',
  archive_key:'digital-packs/123e4567-e89b-42d3-a456-426614174000.zip',
  archive_filename:'Kicks.zip',archive_bytes:1024,
  image_storage_path:null,image_url:null,active:true,
}
describe('digital product availability',()=>{
  it('publishes a complete free preset pack',()=>{
    expect(packSchema.parse(ready)).toBeDefined()
    expect(packIsReady(ready)).toBe(true)
  })
  it('requires an actual download and usage licence',()=>{
    expect(packIsReady({...ready,archive_key:null})).toBe(false)
    expect(packIsReady({...ready,license_notes:'   '})).toBe(false)
    expect(packIsReady({...ready,archive_bytes:null})).toBe(false)
    expect(packIsReady({...ready,archive_key:'../../assets.zip'})).toBe(false)
  })
  it('does not expose inactive products or permit hidden sales',()=>{
    expect(packIsReady({...ready,active:false})).toBe(false)
    expect(packIsReady({...ready,is_free:false,price_cents:0})).toBe(false)
    expect(packIsReady({...ready,is_free:true,price_cents:100})).toBe(false)
    expect(packIsReady({...ready,is_free:false,price_cents:100})).toBe(true)
  })
})
describe('private paid product release switch',()=>{
  it('fails closed for missing and improperly scoped Stripe credentials',()=>{
    expect(digitalPackSalesOpen({VERCEL_ENV:'production',STRIPE_SECRET_KEY:'sk_live_x'})).toBe(false)
    expect(digitalPackSalesOpen({VERCEL_ENV:'preview',DIGITAL_PACK_SALES_ENABLED:'true',
      STRIPE_SECRET_KEY:'sk_live_x',NEUROKORE_SANDBOX_CHECKOUT:'true'})).toBe(false)
    expect(digitalPackSalesOpen({VERCEL_ENV:'production',DIGITAL_PACK_SALES_ENABLED:'true',
      STRIPE_SECRET_KEY:'sk_test_x'})).toBe(false)
  })
  it('allows explicit correctly isolated test/live settings',()=>{
    expect(digitalPackSalesOpen({VERCEL_ENV:'preview',DIGITAL_PACK_SALES_ENABLED:'true',
      NEUROKORE_SANDBOX_CHECKOUT:'true',STRIPE_SECRET_KEY:'sk_test_key'})).toBe(true)
    expect(digitalPackSalesOpen({VERCEL_ENV:'production',DIGITAL_PACK_SALES_ENABLED:'true',
      STRIPE_SECRET_KEY:'sk_live_key'})).toBe(true)
  })
})
describe('digital entitlement trust boundaries',()=>{
  const text=(path:string)=>readFileSync(join(process.cwd(),path),'utf8')
  it('requires paid ownership or a free pack before issuing R2 URL',()=>{
    const code=text('app/api/digital-packs/[id]/download/route.ts')
    expect(code).toContain(".eq('status','paid')")
    expect(code).toContain(".eq('user_id', buyer.id)")
    expect(code).toContain('signedPackDownload')
    expect(code).not.toContain('getPublicUrl(')
  })
  it('fulfils digital packs only from verified Stripe sessions',()=>{
    const code=text('app/api/neurokore/webhook/route.ts')
    expect(code).toContain('verifyWebhook(')
    expect(code).toContain('fulfillDigitalPackSession(')
    expect(code).toContain("checkout/sessions/' + sessionId")
  })
  it('does not expose downloads from the public R2 media bucket',()=>{
    const code=text('lib/digital-packs/storage.ts')
    expect(code).toContain('R2_BUCKET_DIGITAL_PRODUCTS')
    expect(code).toContain('R2_BUCKET_MEDIA')
    expect(code).toContain('expiresIn: 60')
  })
})
