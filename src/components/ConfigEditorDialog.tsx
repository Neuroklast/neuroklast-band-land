import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, ArrowCounterClockwise } from '@phosphor-icons/react'
import { getConfigValues, CONFIG_META, type ConfigKey } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'

/** Slider ranges for numeric config keys – provides sensible min/max/step for the UI */
const SLIDER_RANGES: Partial<Record<ConfigKey, { min: number; max: number; step: number }>> = {
  TYPING_EFFECT_SPEED_MS:        { min: 5, max: 200, step: 5 },
  TYPING_EFFECT_START_DELAY_MS:  { min: 0, max: 2000, step: 50 },
  TITLE_TYPING_SPEED_MS:         { min: 5, max: 200, step: 5 },
  TITLE_TYPING_START_DELAY_MS:   { min: 0, max: 2000, step: 50 },
  CONSOLE_TYPING_SPEED_MS:       { min: 5, max: 200, step: 5 },
  CONSOLE_LINE_DELAY_MS:         { min: 0, max: 1000, step: 10 },
  CONSOLE_LINES_DEFAULT_SPEED_MS:{ min: 5, max: 200, step: 5 },
  CONSOLE_LINES_DEFAULT_DELAY_MS:{ min: 0, max: 1000, step: 10 },
  TERMINAL_TYPING_SPEED_MS:      { min: 5, max: 100, step: 1 },
  TERMINAL_FILE_LOADING_DURATION_MS: { min: 500, max: 10000, step: 100 },
  PROFILE_LOADING_TEXT_INTERVAL_MS:  { min: 100, max: 2000, step: 50 },
  PROFILE_GLITCH_PHASE_DELAY_MS:    { min: 100, max: 3000, step: 50 },
  PROFILE_REVEAL_PHASE_DELAY_MS:    { min: 200, max: 5000, step: 50 },
  SECTION_GLITCH_PROBABILITY:    { min: 0, max: 1, step: 0.05 },
  SECTION_GLITCH_DURATION_MS:    { min: 50, max: 2000, step: 50 },
  SECTION_GLITCH_INTERVAL_MS:    { min: 500, max: 20000, step: 500 },
  NAV_GLITCH_PROBABILITY:        { min: 0, max: 1, step: 0.05 },
  NAV_GLITCH_DURATION_MS:        { min: 50, max: 2000, step: 50 },
  NAV_GLITCH_INTERVAL_MS:        { min: 500, max: 20000, step: 500 },
  HERO_LOGO_GLITCH_PROBABILITY:  { min: 0, max: 1, step: 0.05 },
  HERO_LOGO_GLITCH_DURATION_MS:  { min: 50, max: 2000, step: 50 },
  HERO_LOGO_GLITCH_INTERVAL_MS:  { min: 500, max: 20000, step: 500 },
  HERO_TITLE_GLITCH_PROBABILITY: { min: 0, max: 1, step: 0.05 },
  HERO_TITLE_GLITCH_DURATION_MS: { min: 50, max: 2000, step: 50 },
  HERO_TITLE_GLITCH_INTERVAL_MS: { min: 500, max: 20000, step: 500 },
  LOADER_GLITCH_PROBABILITY:     { min: 0, max: 1, step: 0.05 },
  LOADER_GLITCH_DURATION_MS:     { min: 50, max: 1000, step: 50 },
  LOADER_GLITCH_INTERVAL_MS:     { min: 200, max: 5000, step: 100 },
  NAV_SCROLL_THRESHOLD_PX:       { min: 0, max: 200, step: 5 },
  NAV_HEIGHT_PX:                 { min: 40, max: 200, step: 5 },
  LOADER_PROGRESS_INCREMENT_MULTIPLIER: { min: 1, max: 100, step: 1 },
  LOADER_COMPLETE_DELAY_MS:      { min: 0, max: 3000, step: 100 },
  LOADER_PROGRESS_INTERVAL_MS:   { min: 50, max: 1000, step: 10 },
  VISUALIZER_BAR_COUNT:          { min: 5, max: 100, step: 1 },
  VISUALIZER_TIME_INCREMENT:     { min: 0.001, max: 0.1, step: 0.001 },
  VISUALIZER_GLITCH_PROBABILITY: { min: 0, max: 0.05, step: 0.001 },
  VISUALIZER_GLITCH_OFFSET:      { min: 0, max: 100, step: 1 },
  VISUALIZER_GLITCH_DURATION_FRAMES: { min: 1, max: 60, step: 1 },
  VISUALIZER_GLITCH_DECAY:       { min: 0, max: 1, step: 0.05 },
  VISUALIZER_HEIGHT_SCALE:       { min: 0.01, max: 1, step: 0.01 },
  VISUALIZER_BAR_GLITCH_PROBABILITY: { min: 0, max: 0.1, step: 0.005 },
  VISUALIZER_BAR_GLITCH_OFFSET:  { min: 0, max: 100, step: 1 },
  TOUCH_SWIPE_THRESHOLD_PX:      { min: 10, max: 300, step: 5 },
  DEFAULT_SOUND_VOLUME:          { min: 0, max: 1, step: 0.05 },
  INITIAL_SYNC_DELAY_MS:         { min: 1000, max: 120000, step: 1000 },
  SYNC_INTERVAL_MS:              { min: 60000, max: 3600000, step: 60000 },
  PHOSPHOR_GLOW_INNER_BLUR_PX:  { min: 0, max: 20, step: 1 },
  PHOSPHOR_GLOW_OUTER_BLUR_PX:  { min: 0, max: 40, step: 1 },
  PHOSPHOR_GLOW_INNER_OPACITY:  { min: 0, max: 1, step: 0.05 },
  PHOSPHOR_GLOW_OUTER_OPACITY:  { min: 0, max: 1, step: 0.05 },
  SCANLINE_ANIMATION_DURATION_S: { min: 1, max: 30, step: 0.5 },
  SCANLINE_HEIGHT_PX:            { min: 1, max: 20, step: 1 },
  SCANLINE_OPACITY:              { min: 0, max: 1, step: 0.05 },
  HUD_METADATA_UPDATE_INTERVAL_MS: { min: 200, max: 5000, step: 100 },
  CURSOR_BLINK_SPEED_MS:         { min: 200, max: 3000, step: 100 },
  IMAGE_GLITCH_SLICE_COUNT:      { min: 2, max: 30, step: 1 },
  IMAGE_GLITCH_DURATION_MS:      { min: 100, max: 2000, step: 50 },
  TEXT_DECRYPT_DURATION_MS:      { min: 100, max: 3000, step: 50 },
  TEXT_DECRYPT_CHAR_DELAY_MS:    { min: 5, max: 200, step: 5 },
}

interface ConfigEditorDialogProps {
  open: boolean
  onClose: () => void
  overrides: Record<string, unknown>
  onSave: (overrides: Record<string, unknown>) => void
}

export default function ConfigEditorDialog({ open, onClose, overrides, onSave }: ConfigEditorDialogProps) {
  const defaults = getConfigValues()
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...overrides })
  const [filter, setFilter] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const groups = useMemo(() => {
    const map = new Map<string, ConfigKey[]>()
    for (const [key, meta] of Object.entries(CONFIG_META)) {
      const list = map.get(meta.group) || []
      list.push(key as ConfigKey)
      map.set(meta.group, list)
    }
    return map
  }, [])

  const filteredGroups = useMemo(() => {
    const lc = filter.toLowerCase()
    if (!lc) return groups
    const result = new Map<string, ConfigKey[]>()
    for (const [group, keys] of groups) {
      const filtered = keys.filter(k => {
        const meta = CONFIG_META[k]
        return (
          k.toLowerCase().includes(lc) ||
          meta.label.toLowerCase().includes(lc) ||
          meta.description.toLowerCase().includes(lc) ||
          group.toLowerCase().includes(lc)
        )
      })
      if (filtered.length) result.set(group, filtered)
    }
    return result
  }, [groups, filter])

  const handleChange = (key: ConfigKey, rawValue: string | boolean) => {
    const meta = CONFIG_META[key]
    if (meta.type === 'boolean') {
      setDraft(prev => ({ ...prev, [key]: rawValue }))
    } else if (meta.type === 'number') {
      const n = Number(rawValue)
      if (!isNaN(n)) {
        setDraft(prev => ({ ...prev, [key]: n }))
      }
    } else {
      setDraft(prev => ({ ...prev, [key]: rawValue }))
    }
  }

  const handleReset = (key: ConfigKey) => {
    setDraft(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleResetAll = () => setDraft({})

  const handleSave = () => {
    const cleaned: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(draft)) {
      if (key in defaults && val !== (defaults as Record<string, unknown>)[key]) {
        cleaned[key] = val
      }
    }
    onSave(cleaned)
    onClose()
  }

  const getNumericValue = (key: ConfigKey): number => {
    if (key in draft) return Number(draft[key])
    return Number((defaults as Record<string, unknown>)[key])
  }

  const getBooleanValue = (key: ConfigKey): boolean => {
    if (key in draft) return Boolean(draft[key])
    return Boolean((defaults as Record<string, unknown>)[key])
  }

  const getValue = (key: ConfigKey): string => {
    if (key in draft) return String(draft[key])
    return String((defaults as Record<string, unknown>)[key])
  }

  const isOverridden = (key: ConfigKey): boolean => {
    return key in draft && draft[key] !== (defaults as Record<string, unknown>)[key]
  }

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const overrideCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(draft)) {
      if (key in defaults && draft[key] !== (defaults as Record<string, unknown>)[key]) count++
    }
    return count
  }, [draft, defaults])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-sm flex items-start justify-center p-4 pt-8 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-3xl bg-card border-2 border-primary/30 relative overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()}
          >
            {/* HUD corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

            {/* Header */}
            <div className="h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs text-primary/70 tracking-wider uppercase">ANIMATION & EFFECTS CONFIG</span>
                {overrideCount > 0 && (
                  <span className="font-mono text-[9px] text-primary bg-primary/15 px-2 py-0.5 rounded">
                    {overrideCount} OVERRIDE{overrideCount !== 1 ? 'S' : ''}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-primary/60 hover:text-primary p-1">
                <X size={20} />
              </button>
            </div>

            {/* Filter + actions */}
            <div className="p-4 border-b border-primary/20 flex gap-3 items-center">
              <Input
                placeholder="Search effects, animations, timings..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="font-mono text-xs flex-1"
              />
              <Button size="sm" variant="outline" onClick={handleResetAll} className="gap-1 text-xs border-primary/30">
                <ArrowCounterClockwise size={14} />
                Reset All
              </Button>
            </div>

            {/* Scrollable body */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {Array.from(filteredGroups).map(([group, keys]) => {
                const collapsed = collapsedGroups.has(group) && !!filter === false
                const groupOverrides = keys.filter(k => isOverridden(k)).length
                return (
                  <div key={group} className="border border-primary/10 rounded overflow-hidden">
                    <button
                      onClick={() => toggleGroup(group)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <span className="font-mono text-xs text-primary/70 tracking-wider uppercase flex items-center gap-2">
                        <span className="text-primary/40">{collapsed ? '▶' : '▼'}</span>
                        {group}
                      </span>
                      <div className="flex items-center gap-2">
                        {groupOverrides > 0 && (
                          <span className="font-mono text-[9px] text-primary bg-primary/15 px-1.5 py-0.5 rounded">
                            {groupOverrides} modified
                          </span>
                        )}
                        <span className="font-mono text-[9px] text-primary/40">{keys.length} settings</span>
                      </div>
                    </button>
                    {!collapsed && (
                      <div className="p-3 space-y-3">
                        {keys.map(key => {
                          const meta = CONFIG_META[key]
                          const overridden = isOverridden(key)
                          const sliderRange = SLIDER_RANGES[key]

                          // Boolean toggle
                          if (meta.type === 'boolean') {
                            const checked = getBooleanValue(key)
                            return (
                              <div key={key} className="flex items-center justify-between gap-4 py-1.5 border-b border-primary/5 last:border-0">
                                <div className="flex-1 min-w-0">
                                  <Label className={`font-mono text-xs ${overridden ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {meta.label}
                                    {overridden && <span className="text-primary ml-1">*</span>}
                                  </Label>
                                  <p className="text-[10px] text-muted-foreground/60 font-mono">{meta.description}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => handleChange(key, !checked)}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${
                                      checked ? 'bg-primary/60' : 'bg-primary/15'
                                    }`}
                                    aria-label={`Toggle ${meta.label}`}
                                  >
                                    <div
                                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                        checked ? 'translate-x-[22px]' : 'translate-x-0.5'
                                      }`}
                                    />
                                  </button>
                                  <span className="font-mono text-[9px] text-primary/40 w-6 text-right">
                                    {checked ? 'ON' : 'OFF'}
                                  </span>
                                  {overridden && (
                                    <button
                                      onClick={() => handleReset(key)}
                                      className="text-primary/40 hover:text-primary"
                                      title="Reset to default"
                                    >
                                      <ArrowCounterClockwise size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          }

                          // Numeric slider + input
                          if (meta.type === 'number' && sliderRange) {
                            const numVal = getNumericValue(key)
                            return (
                              <div key={key} className="py-1.5 border-b border-primary/5 last:border-0 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <Label className={`font-mono text-xs ${overridden ? 'text-primary' : 'text-muted-foreground'}`}>
                                      {meta.label}
                                      {overridden && <span className="text-primary ml-1">*</span>}
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground/60 font-mono">{meta.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Input
                                      value={getValue(key)}
                                      onChange={e => handleChange(key, e.target.value)}
                                      className={`font-mono text-xs h-7 w-20 text-right ${overridden ? 'border-primary/50' : ''}`}
                                      type="number"
                                      step={sliderRange.step}
                                      min={sliderRange.min}
                                      max={sliderRange.max}
                                    />
                                    {overridden && (
                                      <button
                                        onClick={() => handleReset(key)}
                                        className="text-primary/40 hover:text-primary"
                                        title="Reset to default"
                                      >
                                        <ArrowCounterClockwise size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[8px] text-primary/30 w-10 text-right">{sliderRange.min}</span>
                                  <input
                                    type="range"
                                    min={sliderRange.min}
                                    max={sliderRange.max}
                                    step={sliderRange.step}
                                    value={numVal}
                                    onChange={e => handleChange(key, e.target.value)}
                                    className="flex-1 h-1.5 accent-primary cursor-pointer"
                                  />
                                  <span className="font-mono text-[8px] text-primary/30 w-10">{sliderRange.max}</span>
                                </div>
                              </div>
                            )
                          }

                          // Fallback: text/number input
                          return (
                            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1.5 border-b border-primary/5 last:border-0">
                              <div className="sm:w-2/5">
                                <Label className={`font-mono text-xs ${overridden ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {meta.label}
                                  {overridden && <span className="text-primary ml-1">*</span>}
                                </Label>
                                <p className="text-[10px] text-muted-foreground/60 font-mono">{meta.description}</p>
                              </div>
                              <div className="sm:w-2/5">
                                <Input
                                  value={getValue(key)}
                                  onChange={e => handleChange(key, e.target.value)}
                                  className={`font-mono text-xs h-8 ${overridden ? 'border-primary/50' : ''}`}
                                  type={meta.type === 'number' ? 'number' : 'text'}
                                  step={meta.type === 'number' ? 'any' : undefined}
                                />
                              </div>
                              <div className="sm:w-1/5 flex justify-end">
                                {overridden && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleReset(key)}
                                    className="text-xs text-primary/60 hover:text-primary h-8 px-2"
                                  >
                                    <ArrowCounterClockwise size={12} className="mr-1" />
                                    Reset
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredGroups.size === 0 && (
                <p className="text-center text-muted-foreground font-mono text-xs py-8">
                  No config variables match &quot;{filter}&quot;
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-primary/20 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save Config</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
