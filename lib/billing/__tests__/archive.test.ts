import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
vi.mock('server-only', () => ({}))
const state=vi.hoisted(() => ({
  objects: new Map<string,{bytes:Buffer;sha:string;type:string}>(),
  send:vi.fn(),
  conflictStatus:412,
}))
vi.mock('@/lib/r2-s3-client',()=>({
  createR2S3Client:()=>({send:state.send}),
}))
import { archiveBillingDocument,readArchivedBillingDocument,archiveKey,billingArchiveBucket,documentSha } from '../archive'

describe('immutable R2 invoice archive',()=>{
 beforeEach(()=>{
   state.objects.clear()
   state.conflictStatus=412
   state.send.mockReset()
   state.send.mockImplementation(async (command:unknown)=>{
     if(command instanceof PutObjectCommand){
       const input=command.input
       const key=String(input.Key)
       if(state.objects.has(key))throw Object.assign(new Error('Precondition failed'),{
         name:state.conflictStatus===409?'ObjectLockedByBucketPolicy':'PreconditionFailed',
         $metadata:{httpStatusCode:state.conflictStatus}
       })
       const bytes=Buffer.from(input.Body as Uint8Array)
       state.objects.set(key,{
         bytes,sha:String(input.Metadata?.sha256),type:String(input.ContentType)
       })
       return {}
     }
     if(command instanceof HeadObjectCommand){
       const obj=state.objects.get(String(command.input.Key))
       if(!obj)throw new Error('Object missing')
       return {ContentLength:obj.bytes.length,ContentType:obj.type,Metadata:{sha256:obj.sha}}
     }
     if(command instanceof GetObjectCommand){
       const obj=state.objects.get(String(command.input.Key))
       if(!obj)throw new Error('Object missing')
       return {ContentLength:obj.bytes.length,Body:{transformToByteArray:async()=>new Uint8Array(obj.bytes)}}
     }
     throw new Error('Unexpected test command')
   })
 })
 it('rejects billing/media bucket collision and invalid invoice keys',()=>{
   expect(()=>billingArchiveBucket({R2_BUCKET_BILLING:'public',R2_BUCKET_MEDIA:'public'} as NodeJS.ProcessEnv)).toThrow()
   expect(billingArchiveBucket({R2_BUCKET_BILLING:'private-billing',R2_BUCKET_MEDIA:'public'} as NodeJS.ProcessEnv)).toBe('private-billing')
   expect(()=>archiveKey('x','RE-2026-000001','pdf')).toThrow()
 })
 it('writes only once and verifies identical-content retries',async()=>{
   const key=archiveKey('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee','RE-2026-000001','pdf')
   const payload={format:'pdf' as const,key,bytes:Buffer.from('invoice A')}
   const first=await archiveBillingDocument('private-billing',payload)
   const again=await archiveBillingDocument('private-billing',payload)
   expect(first).toEqual(again)
   expect(first.sha256).toBe(documentSha(payload.bytes))
   expect(state.objects.get(key)?.bytes.toString()).toBe('invoice A')
 })
 it('accepts only verified identical files when R2 Bucket Lock returns 409',async()=>{
   const key=archiveKey('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee','RE-2026-000001','odt')
   const value={format:'odt' as const,key,bytes:Buffer.from('original odt')}
   await archiveBillingDocument('private-billing',value)
   state.conflictStatus=409
   const reused=await archiveBillingDocument('private-billing',value)
   expect(reused.sha256).toBe(documentSha(value.bytes))
   await expect(archiveBillingDocument('private-billing',{
     ...value,bytes:Buffer.from('different odt')
   })).rejects.toThrow()
 })
 it('rejects different bytes for an existing invoice key',async()=>{
   const key=archiveKey('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee','RE-2026-000001','pdf')
   await archiveBillingDocument('private-billing',{format:'pdf',key,bytes:Buffer.from('original')})
   await expect(archiveBillingDocument('private-billing',{format:'pdf',key,bytes:Buffer.from('changed')})).rejects.toThrow()
   expect(state.objects.get(key)?.bytes.toString()).toBe('original')
 })
 it('verifies the original immutable bytes before private same-origin delivery',async()=>{
   const key=archiveKey('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee','RE-2026-000001','pdf')
   const bytes=Buffer.from('%PDF-1.4 original')
   const expected=documentSha(bytes)
   await archiveBillingDocument('private-billing',{format:'pdf',key,bytes})
   expect(await readArchivedBillingDocument('private-billing',key,expected)).toEqual(bytes)
   state.objects.get(key)!.bytes=Buffer.from('%PDF-1.4 altered!')
   await expect(readArchivedBillingDocument('private-billing',key,expected)).rejects.toThrow('SHA-256')
   await expect(readArchivedBillingDocument('private-billing',key,'not-a-sha256')).rejects.toThrow('checksum')
 })

 it('detects corruption even when stored metadata and length still match',async()=>{
   const key=archiveKey('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee','RE-2026-000001','pdf')
   await archiveBillingDocument('private-billing',{format:'pdf',key,bytes:Buffer.from('correct!')})
   const stored=state.objects.get(key)!
   stored.bytes=Buffer.from('changed!')
   await expect(archiveBillingDocument('private-billing',{format:'pdf',key,bytes:Buffer.from('correct!')})).rejects.toThrow('SHA-256')
 })
})
