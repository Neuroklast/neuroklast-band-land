import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
vi.mock('server-only', () => ({}))
const state=vi.hoisted(() => ({
  objects: new Map<string,{bytes:Buffer;sha:string;type:string}>(),
  send:vi.fn(),
}))
vi.mock('@/lib/r2-s3-client',()=>({
  createR2S3Client:()=>({send:state.send}),
}))
import { archiveBillingDocument,archiveKey,billingArchiveBucket,documentSha } from '../archive'

describe('immutable R2 invoice archive',()=>{
 beforeEach(()=>{
   state.objects.clear()
   state.send.mockReset()
   state.send.mockImplementation(async (command:unknown)=>{
     if(command instanceof PutObjectCommand){
       const input=command.input
       const key=String(input.Key)
       if(state.objects.has(key))throw Object.assign(new Error('Precondition failed'),{
         name:'PreconditionFailed',$metadata:{httpStatusCode:412}
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
 it('rejects different bytes for an existing invoice key',async()=>{
   const key=archiveKey('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee','RE-2026-000001','pdf')
   await archiveBillingDocument('private-billing',{format:'pdf',key,bytes:Buffer.from('original')})
   await expect(archiveBillingDocument('private-billing',{format:'pdf',key,bytes:Buffer.from('changed')})).rejects.toThrow()
   expect(state.objects.get(key)?.bytes.toString()).toBe('original')
 })
 it('detects corruption even when stored metadata and length still match',async()=>{
   const key=archiveKey('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee','RE-2026-000001','pdf')
   await archiveBillingDocument('private-billing',{format:'pdf',key,bytes:Buffer.from('correct!')})
   const stored=state.objects.get(key)!
   stored.bytes=Buffer.from('changed!')
   await expect(archiveBillingDocument('private-billing',{format:'pdf',key,bytes:Buffer.from('correct!')})).rejects.toThrow('SHA-256')
 })
})
