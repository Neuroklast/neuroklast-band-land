import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAllProgressiveModes,
  getProgressiveMode,
  getRandomProgressiveMode,
} from '@/lib/progressive-overlay-modes'

describe('progressive-overlay-modes', () => {
  describe('getAllProgressiveModes()', () => {
    it('returns exactly 4 modes', () => {
      expect(getAllProgressiveModes()).toHaveLength(4)
    })

    it('includes progressive-reveal mode', () => {
      const names = getAllProgressiveModes().map((m) => m.name)
      expect(names).toContain('progressive-reveal')
    })

    it('includes data-stream mode', () => {
      const names = getAllProgressiveModes().map((m) => m.name)
      expect(names).toContain('data-stream')
    })

    it('includes sector-assembly mode', () => {
      const names = getAllProgressiveModes().map((m) => m.name)
      expect(names).toContain('sector-assembly')
    })

    it('includes holographic-materialization mode', () => {
      const names = getAllProgressiveModes().map((m) => m.name)
      expect(names).toContain('holographic-materialization')
    })

    it('each mode has required fields', () => {
      for (const mode of getAllProgressiveModes()) {
        expect(typeof mode.name).toBe('string')
        expect(typeof mode.getLabel).toBe('function')
        expect(typeof mode.className).toBe('string')
        expect(mode.containerVariants).toBeDefined()
        expect(mode.transition).toBeDefined()
      }
    })

    it('each mode getLabel() returns a non-empty string', () => {
      for (const mode of getAllProgressiveModes()) {
        expect(mode.getLabel().length).toBeGreaterThan(0)
      }
    })
  })

  describe('getProgressiveMode()', () => {
    it('returns the correct mode for a valid name', () => {
      const mode = getProgressiveMode('data-stream')
      expect(mode).toBeDefined()
      expect(mode!.name).toBe('data-stream')
    })

    it('returns undefined for an unknown name', () => {
      expect(getProgressiveMode('unknown-mode')).toBeUndefined()
    })

    it('returns progressive-reveal with correct className', () => {
      const mode = getProgressiveMode('progressive-reveal')
      expect(mode!.className).toBe('progressive-reveal')
    })

    it('returns holographic-materialization with correct label', () => {
      const mode = getProgressiveMode('holographic-materialization')
      expect(mode!.getLabel()).toBe('Holographic Materialization')
    })
  })

  describe('getRandomProgressiveMode()', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random')
    })

    it('returns a mode that exists in getAllProgressiveModes()', () => {
      const allNames = getAllProgressiveModes().map((m) => m.name)
      const result = getRandomProgressiveMode()
      expect(allNames).toContain(result.name)
    })

    it('returns first mode when Math.random() returns 0', () => {
      vi.mocked(Math.random).mockReturnValue(0)
      const result = getRandomProgressiveMode()
      expect(result.name).toBe(getAllProgressiveModes()[0].name)
    })

    it('returns last mode when Math.random() returns 0.999', () => {
      vi.mocked(Math.random).mockReturnValue(0.999)
      const result = getRandomProgressiveMode()
      const all = getAllProgressiveModes()
      expect(result.name).toBe(all[all.length - 1].name)
    })
  })

  describe('containerVariants shape', () => {
    it('progressive-reveal hidden state includes clipPath', () => {
      const mode = getProgressiveMode('progressive-reveal')!
      expect(mode.containerVariants.hidden).toHaveProperty('clipPath')
    })

    it('data-stream hidden state includes filter', () => {
      const mode = getProgressiveMode('data-stream')!
      expect(mode.containerVariants.hidden).toHaveProperty('filter')
    })

    it('sector-assembly hidden state includes scale', () => {
      const mode = getProgressiveMode('sector-assembly')!
      expect(mode.containerVariants.hidden).toHaveProperty('scale')
    })

    it('holographic-materialization hidden state includes x', () => {
      const mode = getProgressiveMode('holographic-materialization')!
      expect(mode.containerVariants.hidden).toHaveProperty('x')
    })
  })
})
