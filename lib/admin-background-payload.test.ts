import { describe, expect, it } from 'vitest'
import { composeBackgroundPreview, composeBackgroundSave, type BackgroundEditorFields } from '@/lib/admin-background-payload'

function source(mod: Partial<BackgroundEditorFields> = {}): BackgroundEditorFields {
  return {
    imageStoragePath: '',
    imageUrl: '',
    videoStoragePath: '',
    videoUrl: '',
    mobileVideoStoragePath: '',
    mobileVideoUrl: '',
    mobileVideoMode: 'same',
    backgroundType: 'matrix',
    backgroundImageOpacity: 0.6,
    backgroundVideoOpacity: 0.25,
    backgroundVideoEnabled: false,
    ...mod,
  }
}

describe('background preview and save boundary', () => {
  it('preserves the complete property order across both representations', () => {
    const expected = [
      'storage_path', 'url', 'video_storage_path', 'video_url',
      'video_mobile_storage_path', 'video_mobile_url',
      'mobileVideoMode', 'backgroundType', 'backgroundImageOpacity',
      'backgroundVideoOpacity', 'backgroundVideoEnabled',
    ]
    expect(Object.keys(composeBackgroundPreview(source()))).toEqual(expected)
    expect(Object.keys(composeBackgroundSave(source()))).toEqual(expected)
  })

  it('omits empty media fields in preview JSON but writes explicit null on save', () => {
    const draft = composeBackgroundPreview(source())
    expect(draft.storage_path).toBeUndefined()
    expect(draft.video_mobile_url).toBeUndefined()
    expect(JSON.parse(JSON.stringify(draft))).toEqual({
      mobileVideoMode: 'same',
      backgroundType: 'matrix',
      backgroundImageOpacity: 0.6,
      backgroundVideoOpacity: 0.25,
      backgroundVideoEnabled: false,
    })
    expect(composeBackgroundSave(source())).toMatchObject({
      storage_path: null, url: null,
      video_storage_path: null, video_url: null,
      video_mobile_storage_path: null, video_mobile_url: null,
    })
  })

  it('keeps the unsaved mobile fields available to the preview even if mode is not separate', () => {
    const state = source({
      videoStoragePath: 'background/videos/desktop.mp4',
      videoUrl: 'https://cdn.example/desktop.mp4',
      mobileVideoStoragePath: 'background/videos/mobile.mp4',
      mobileVideoUrl: 'https://cdn.example/mobile.mp4',
      mobileVideoMode: 'same',
    })
    const draft = composeBackgroundPreview(state)
    expect(draft.video_mobile_storage_path).toBe('background/videos/mobile.mp4')
    expect(draft.video_mobile_url).toBe('https://cdn.example/mobile.mp4')
    const saved = composeBackgroundSave(state)
    expect(saved.video_storage_path).toBe('background/videos/desktop.mp4')
    expect(saved.video_mobile_storage_path).toBeNull()
    expect(saved.video_mobile_url).toBeNull()
    expect(composeBackgroundSave({ ...state, mobileVideoMode: 'off' }).video_mobile_url).toBeNull()
  })

  it('preserves separate mobile media and zero-valued settings without mutating input', () => {
    const state = source({
      mobileVideoMode: 'separate',
      mobileVideoStoragePath: 'background/videos/mobile.mp4',
      mobileVideoUrl: 'https://cdn.example/mobile.mp4',
      backgroundImageOpacity: 0,
      backgroundVideoOpacity: 0,
      backgroundVideoEnabled: true,
    })
    const saved = composeBackgroundSave(state)
    expect(saved.video_mobile_storage_path).toBe('background/videos/mobile.mp4')
    expect(saved.video_mobile_url).toBe('https://cdn.example/mobile.mp4')
    expect(saved.backgroundImageOpacity).toBe(0)
    expect(saved.backgroundVideoOpacity).toBe(0)
    expect(saved.backgroundVideoEnabled).toBe(true)
    expect(state.mobileVideoStoragePath).toBe('background/videos/mobile.mp4')
  })
})
