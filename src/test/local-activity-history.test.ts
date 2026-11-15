import { beforeEach, describe, expect, it } from 'vitest'
import { clearActivityLog, getActivityLog, logActivity } from '@/lib/activity-log'

describe('optional browser-only activity history', () => {
  beforeEach(() => localStorage.clear())

  it('is only stored in the current browser and can be cleared by its owner', () => {
    logActivity('config-change', 'Changed local visual setting')
    expect(getActivityLog()).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem('kv:activity-log') ?? '[]')).toHaveLength(1)
    clearActivityLog()
    expect(getActivityLog()).toEqual([])
  })

  it('bounds local history to at most 200 entries instead of presenting it as a complete audit', () => {
    for (let i = 0; i < 205; i++) logActivity('theme-change', 'Change ' + i)
    const entries = getActivityLog()
    expect(entries).toHaveLength(200)
    expect(entries[0].detail).toBe('Change 204')
    expect(entries.at(-1)?.detail).toBe('Change 5')
  })
})
