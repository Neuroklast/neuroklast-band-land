/**
 * Central configuration file for all constants and default values.
 *
 * Every named constant, timing value, threshold and default used across the
 * application is collected here so they can be tuned from a single place.
 * Each value includes a short description of what it controls.
 *
 * Runtime overrides can be applied via `applyConfigOverrides()` which merges
 * user-supplied values from BandData.configOverrides on top of the defaults.
 */

// ---------------------------------------------------------------------------
// Defaults – these are the compile-time default values
// ---------------------------------------------------------------------------

const DEFAULTS = {
  // Typing & Console Effects
  TYPING_EFFECT_SPEED_MS: 30,
  TYPING_EFFECT_START_DELAY_MS: 0,
  TITLE_TYPING_SPEED_MS: 50,
  TITLE_TYPING_START_DELAY_MS: 100,
  CONSOLE_TYPING_SPEED_MS: 30,
  CONSOLE_LINE_DELAY_MS: 100,
  CONSOLE_LINES_DEFAULT_SPEED_MS: 40,
  CONSOLE_LINES_DEFAULT_DELAY_MS: 120,

  // Terminal
  TERMINAL_TYPING_SPEED_MS: 18,
  TERMINAL_FILE_LOADING_DURATION_MS: 2000,

  // Profile Overlay
  PROFILE_LOADING_TEXT_INTERVAL_MS: 300,
  PROFILE_GLITCH_PHASE_DELAY_MS: 700,
  PROFILE_REVEAL_PHASE_DELAY_MS: 1000,

  // Glitch Effects
  SECTION_GLITCH_PROBABILITY: 0.8,
  SECTION_GLITCH_DURATION_MS: 300,
  SECTION_GLITCH_INTERVAL_MS: 4000,
  NAV_GLITCH_PROBABILITY: 0.9,
  NAV_GLITCH_DURATION_MS: 200,
  NAV_GLITCH_INTERVAL_MS: 5000,
  HERO_LOGO_GLITCH_PROBABILITY: 0.75,
  HERO_LOGO_GLITCH_DURATION_MS: 300,
  HERO_LOGO_GLITCH_INTERVAL_MS: 5000,
  HERO_TITLE_GLITCH_PROBABILITY: 0.8,
  HERO_TITLE_GLITCH_DURATION_MS: 300,
  HERO_TITLE_GLITCH_INTERVAL_MS: 6000,
  LOADER_GLITCH_PROBABILITY: 0.7,
  LOADER_GLITCH_DURATION_MS: 100,
  LOADER_GLITCH_INTERVAL_MS: 800,

  // Navigation
  NAV_SCROLL_THRESHOLD_PX: 50,
  NAV_HEIGHT_PX: 80,

  // Cyberpunk Loader
  LOADER_PROGRESS_INCREMENT_MULTIPLIER: 20,
  LOADER_COMPLETE_DELAY_MS: 500,
  LOADER_PROGRESS_INTERVAL_MS: 150,

  // Audio Visualizer
  VISUALIZER_BAR_COUNT: 40,
  VISUALIZER_TIME_INCREMENT: 0.01,
  VISUALIZER_GLITCH_PROBABILITY: 0.002,
  VISUALIZER_GLITCH_OFFSET: 20,
  VISUALIZER_GLITCH_DURATION_FRAMES: 10,
  VISUALIZER_GLITCH_DECAY: 0.9,
  VISUALIZER_HEIGHT_SCALE: 0.15,
  VISUALIZER_BAR_GLITCH_PROBABILITY: 0.01,
  VISUALIZER_BAR_GLITCH_OFFSET: 30,

  // Touch Interaction
  TOUCH_SWIPE_THRESHOLD_PX: 75,

  // Sound Effects
  DEFAULT_SOUND_VOLUME: 0.4,

  // Data Sync
  INITIAL_SYNC_DELAY_MS: 30_000,
  SYNC_INTERVAL_MS: 300_000,

  // Defaults / Labels
  DEFAULT_LABEL: 'Darktunes Music Group',
  PROFILE_STATUS_TEXT: 'ACTIVE',
  SESSION_STATUS_TEXT: 'SESSION ACTIVE',

  // CRT/Phosphor Effects
  PHOSPHOR_GLOW_ENABLED: true,
  PHOSPHOR_GLOW_INNER_BLUR_PX: 3,
  PHOSPHOR_GLOW_OUTER_BLUR_PX: 12,
  PHOSPHOR_GLOW_INNER_OPACITY: 0.4,
  PHOSPHOR_GLOW_OUTER_OPACITY: 0.15,
  
  // Scanline Effects
  SCANLINE_MOVEMENT_ENABLED: true,
  SCANLINE_ANIMATION_DURATION_S: 8,
  SCANLINE_HEIGHT_PX: 3,
  SCANLINE_OPACITY: 0.7,
  
  // System Monitor HUD
  HUD_METADATA_ENABLED: true,
  HUD_METADATA_UPDATE_INTERVAL_MS: 1000,
  HUD_SHOW_TIMESTAMP: true,
  HUD_SHOW_PSEUDO_IP: true,
  HUD_SHOW_UPTIME: true,
  HUD_SHOW_SECTOR: true,
  HUD_SHOW_SCROLL_SPEED: true,
  
  // Cursor Effects
  CURSOR_BLINK_ENABLED: true,
  CURSOR_BLINK_SPEED_MS: 800,
  
  // Image Glitch Effects
  IMAGE_GLITCH_ON_HOVER_ENABLED: true,
  IMAGE_GLITCH_SLICE_COUNT: 8,
  IMAGE_GLITCH_DURATION_MS: 400,
  
  // Text Decryption Effects
  TEXT_DECRYPT_ENABLED: true,
  TEXT_DECRYPT_DURATION_MS: 800,
  TEXT_DECRYPT_CHAR_DELAY_MS: 30,
  TEXT_DECRYPT_CHARS: '$%#@&!*+=<>?',
} as const

export type ConfigKey = keyof typeof DEFAULTS

// ---------------------------------------------------------------------------
// Metadata for the config editor UI
// ---------------------------------------------------------------------------

export interface ConfigMeta {
  label: string
  description: string
  group: string
  type: 'number' | 'string' | 'boolean'
}

export const CONFIG_META: Record<ConfigKey, ConfigMeta> = {
  TYPING_EFFECT_SPEED_MS:          { label: 'Typing Speed',             description: 'Ms per character for the global typing effect',            group: 'Typing & Console', type: 'number' },
  TYPING_EFFECT_START_DELAY_MS:    { label: 'Typing Start Delay',       description: 'Delay before typing effect begins (ms)',                   group: 'Typing & Console', type: 'number' },
  TITLE_TYPING_SPEED_MS:           { label: 'Title Typing Speed',       description: 'Ms per character for section titles',                     group: 'Typing & Console', type: 'number' },
  TITLE_TYPING_START_DELAY_MS:     { label: 'Title Start Delay',        description: 'Delay before section title starts typing (ms)',            group: 'Typing & Console', type: 'number' },
  CONSOLE_TYPING_SPEED_MS:         { label: 'Console Typing Speed',     description: 'Ms per character in profile console reveals',              group: 'Typing & Console', type: 'number' },
  CONSOLE_LINE_DELAY_MS:           { label: 'Console Line Delay',       description: 'Delay between finished console lines (ms)',                group: 'Typing & Console', type: 'number' },
  CONSOLE_LINES_DEFAULT_SPEED_MS:  { label: 'Console Default Speed',    description: 'Default speed for ConsoleLines components (ms/char)',      group: 'Typing & Console', type: 'number' },
  CONSOLE_LINES_DEFAULT_DELAY_MS:  { label: 'Console Default Delay',    description: 'Default delay between ConsoleLines lines (ms)',            group: 'Typing & Console', type: 'number' },

  TERMINAL_TYPING_SPEED_MS:        { label: 'Terminal Typing Speed',    description: 'Ms per character for terminal output',                    group: 'Terminal',         type: 'number' },
  TERMINAL_FILE_LOADING_DURATION_MS: { label: 'File Loading Duration',  description: 'Loading animation length before download (ms)',            group: 'Terminal',         type: 'number' },

  PROFILE_LOADING_TEXT_INTERVAL_MS: { label: 'Loading Text Interval',   description: 'Interval for cycling loading text in overlays (ms)',       group: 'Profile Overlay',  type: 'number' },
  PROFILE_GLITCH_PHASE_DELAY_MS:   { label: 'Glitch Phase Delay',       description: 'Time before overlay enters glitch phase (ms)',             group: 'Profile Overlay',  type: 'number' },
  PROFILE_REVEAL_PHASE_DELAY_MS:   { label: 'Reveal Phase Delay',       description: 'Time before overlay fully reveals (ms)',                   group: 'Profile Overlay',  type: 'number' },

  SECTION_GLITCH_PROBABILITY:      { label: 'Section Glitch Prob.',     description: 'Probability (0–1) glitch fires for section titles',       group: 'Glitch Effects',   type: 'number' },
  SECTION_GLITCH_DURATION_MS:      { label: 'Section Glitch Duration',  description: 'Duration of section title glitch (ms)',                   group: 'Glitch Effects',   type: 'number' },
  SECTION_GLITCH_INTERVAL_MS:      { label: 'Section Glitch Interval',  description: 'How often section glitch is checked (ms)',                group: 'Glitch Effects',   type: 'number' },
  NAV_GLITCH_PROBABILITY:          { label: 'Nav Glitch Prob.',         description: 'Probability (0–1) glitch fires for nav bar',              group: 'Glitch Effects',   type: 'number' },
  NAV_GLITCH_DURATION_MS:          { label: 'Nav Glitch Duration',      description: 'Duration of nav glitch effect (ms)',                      group: 'Glitch Effects',   type: 'number' },
  NAV_GLITCH_INTERVAL_MS:          { label: 'Nav Glitch Interval',      description: 'How often nav glitch is checked (ms)',                    group: 'Glitch Effects',   type: 'number' },
  HERO_LOGO_GLITCH_PROBABILITY:    { label: 'Logo Glitch Prob.',        description: 'Probability (0–1) hero logo glitch fires',               group: 'Glitch Effects',   type: 'number' },
  HERO_LOGO_GLITCH_DURATION_MS:    { label: 'Logo Glitch Duration',     description: 'Hero logo glitch duration (ms)',                          group: 'Glitch Effects',   type: 'number' },
  HERO_LOGO_GLITCH_INTERVAL_MS:    { label: 'Logo Glitch Interval',     description: 'How often hero logo glitch is checked (ms)',              group: 'Glitch Effects',   type: 'number' },
  HERO_TITLE_GLITCH_PROBABILITY:   { label: 'Title Glitch Prob.',       description: 'Probability (0–1) hero title glitch fires',              group: 'Glitch Effects',   type: 'number' },
  HERO_TITLE_GLITCH_DURATION_MS:   { label: 'Title Glitch Duration',    description: 'Hero title glitch duration (ms)',                         group: 'Glitch Effects',   type: 'number' },
  HERO_TITLE_GLITCH_INTERVAL_MS:   { label: 'Title Glitch Interval',    description: 'How often hero title glitch is checked (ms)',             group: 'Glitch Effects',   type: 'number' },
  LOADER_GLITCH_PROBABILITY:       { label: 'Loader Glitch Prob.',      description: 'Probability (0–1) glitch in cyberpunk loader',            group: 'Glitch Effects',   type: 'number' },
  LOADER_GLITCH_DURATION_MS:       { label: 'Loader Glitch Duration',   description: 'Loader glitch effect duration (ms)',                      group: 'Glitch Effects',   type: 'number' },
  LOADER_GLITCH_INTERVAL_MS:       { label: 'Loader Glitch Interval',   description: 'How often loader glitch is checked (ms)',                 group: 'Glitch Effects',   type: 'number' },

  NAV_SCROLL_THRESHOLD_PX:         { label: 'Nav Scroll Threshold',     description: 'Scroll distance (px) before nav gets background',        group: 'Navigation',       type: 'number' },
  NAV_HEIGHT_PX:                   { label: 'Nav Height',               description: 'Nav bar height used for scroll offset (px)',              group: 'Navigation',       type: 'number' },

  LOADER_PROGRESS_INCREMENT_MULTIPLIER: { label: 'Progress Multiplier', description: 'Random progress increment multiplier per tick',           group: 'Loader',           type: 'number' },
  LOADER_COMPLETE_DELAY_MS:        { label: 'Complete Delay',           description: 'Delay after 100% before onLoadComplete (ms)',             group: 'Loader',           type: 'number' },
  LOADER_PROGRESS_INTERVAL_MS:     { label: 'Progress Interval',        description: 'Interval for loader progress updates (ms)',               group: 'Loader',           type: 'number' },

  VISUALIZER_BAR_COUNT:            { label: 'Bar Count',                description: 'Number of bars in audio visualizer',                     group: 'Visualizer',       type: 'number' },
  VISUALIZER_TIME_INCREMENT:       { label: 'Time Increment',           description: 'Time step per animation frame',                          group: 'Visualizer',       type: 'number' },
  VISUALIZER_GLITCH_PROBABILITY:   { label: 'Glitch Probability',       description: 'Per-frame probability of a visualizer glitch',            group: 'Visualizer',       type: 'number' },
  VISUALIZER_GLITCH_OFFSET:        { label: 'Glitch Offset',            description: 'Offset multiplier when a glitch triggers',               group: 'Visualizer',       type: 'number' },
  VISUALIZER_GLITCH_DURATION_FRAMES: { label: 'Glitch Duration',        description: 'Number of frames a visualizer glitch lasts',              group: 'Visualizer',       type: 'number' },
  VISUALIZER_GLITCH_DECAY:         { label: 'Glitch Decay',             description: 'Decay factor applied to glitch offset each frame',        group: 'Visualizer',       type: 'number' },
  VISUALIZER_HEIGHT_SCALE:         { label: 'Height Scale',             description: 'Height scaling factor for visualizer canvas',              group: 'Visualizer',       type: 'number' },
  VISUALIZER_BAR_GLITCH_PROBABILITY: { label: 'Bar Glitch Prob.',       description: 'Probability that an individual bar glitches',              group: 'Visualizer',       type: 'number' },
  VISUALIZER_BAR_GLITCH_OFFSET:    { label: 'Bar Glitch Offset',        description: 'Offset applied to a randomly glitched bar',               group: 'Visualizer',       type: 'number' },

  TOUCH_SWIPE_THRESHOLD_PX:        { label: 'Swipe Threshold',          description: 'Minimum swipe distance (px) to register',                group: 'Touch',            type: 'number' },

  DEFAULT_SOUND_VOLUME:            { label: 'Sound Volume',             description: 'Default playback volume (0–1)',                           group: 'Sound',            type: 'number' },

  INITIAL_SYNC_DELAY_MS:           { label: 'Initial Sync Delay',       description: 'Delay before first sync check (ms)',                     group: 'Data Sync',        type: 'number' },
  SYNC_INTERVAL_MS:                { label: 'Sync Interval',            description: 'Interval between sync checks (ms)',                      group: 'Data Sync',        type: 'number' },

  DEFAULT_LABEL:                   { label: 'Default Label',            description: 'Default record label name',                              group: 'Defaults',         type: 'string' },
  PROFILE_STATUS_TEXT:              { label: 'Profile Status Text',      description: 'Status text shown in member profile overlays',            group: 'Defaults',         type: 'string' },
  SESSION_STATUS_TEXT:              { label: 'Session Status Text',      description: 'Session status text shown in profile overlays',           group: 'Defaults',         type: 'string' },

  PHOSPHOR_GLOW_ENABLED:           { label: 'Enable Phosphor Glow',     description: 'Enable CRT phosphor glow effect on text',                group: 'CRT Effects',      type: 'boolean' },
  PHOSPHOR_GLOW_INNER_BLUR_PX:     { label: 'Inner Glow Blur (px)',     description: 'Blur radius for inner phosphor glow',                    group: 'CRT Effects',      type: 'number' },
  PHOSPHOR_GLOW_OUTER_BLUR_PX:     { label: 'Outer Glow Blur (px)',     description: 'Blur radius for outer phosphor glow',                    group: 'CRT Effects',      type: 'number' },
  PHOSPHOR_GLOW_INNER_OPACITY:     { label: 'Inner Glow Opacity',       description: 'Opacity for inner phosphor glow (0-1)',                  group: 'CRT Effects',      type: 'number' },
  PHOSPHOR_GLOW_OUTER_OPACITY:     { label: 'Outer Glow Opacity',       description: 'Opacity for outer phosphor glow (0-1)',                  group: 'CRT Effects',      type: 'number' },
  
  SCANLINE_MOVEMENT_ENABLED:       { label: 'Enable Scanline Movement', description: 'Enable animated CRT scanline refresh',                   group: 'CRT Effects',      type: 'boolean' },
  SCANLINE_ANIMATION_DURATION_S:   { label: 'Scanline Duration (s)',    description: 'Duration for scanline to traverse screen',               group: 'CRT Effects',      type: 'number' },
  SCANLINE_HEIGHT_PX:              { label: 'Scanline Height (px)',     description: 'Height of the moving scanline',                          group: 'CRT Effects',      type: 'number' },
  SCANLINE_OPACITY:                { label: 'Scanline Opacity',         description: 'Opacity of the moving scanline (0-1)',                   group: 'CRT Effects',      type: 'number' },
  
  HUD_METADATA_ENABLED:            { label: 'Enable HUD Metadata',      description: 'Show system monitor metadata overlays',                  group: 'HUD Monitor',      type: 'boolean' },
  HUD_METADATA_UPDATE_INTERVAL_MS: { label: 'Metadata Update Interval', description: 'How often HUD metadata refreshes (ms)',                  group: 'HUD Monitor',      type: 'number' },
  HUD_SHOW_TIMESTAMP:              { label: 'Show Timestamp',           description: 'Display current timestamp in HUD',                       group: 'HUD Monitor',      type: 'boolean' },
  HUD_SHOW_PSEUDO_IP:              { label: 'Show Pseudo IP',           description: 'Display pseudo IP address in HUD',                       group: 'HUD Monitor',      type: 'boolean' },
  HUD_SHOW_UPTIME:                 { label: 'Show Uptime',              description: 'Display system uptime in HUD',                           group: 'HUD Monitor',      type: 'boolean' },
  HUD_SHOW_SECTOR:                 { label: 'Show Sector',              description: 'Display current sector designation in HUD',              group: 'HUD Monitor',      type: 'boolean' },
  HUD_SHOW_SCROLL_SPEED:           { label: 'Show Scroll Speed',        description: 'Display scroll speed as data transfer rate',             group: 'HUD Monitor',      type: 'boolean' },
  
  CURSOR_BLINK_ENABLED:            { label: 'Enable Cursor Blink',      description: 'Show blinking cursors on text elements',                 group: 'Cursor Effects',   type: 'boolean' },
  CURSOR_BLINK_SPEED_MS:           { label: 'Cursor Blink Speed (ms)',  description: 'Blink cycle duration for cursors',                       group: 'Cursor Effects',   type: 'number' },
  
  IMAGE_GLITCH_ON_HOVER_ENABLED:   { label: 'Enable Image Glitch',      description: 'Enable glitch/slice effect on image hover',              group: 'Image Effects',    type: 'boolean' },
  IMAGE_GLITCH_SLICE_COUNT:        { label: 'Glitch Slice Count',       description: 'Number of slices in image glitch effect',                group: 'Image Effects',    type: 'number' },
  IMAGE_GLITCH_DURATION_MS:        { label: 'Glitch Duration (ms)',     description: 'Duration of image glitch animation',                     group: 'Image Effects',    type: 'number' },
  
  TEXT_DECRYPT_ENABLED:            { label: 'Enable Text Decryption',   description: 'Enable text decryption effect on load',                  group: 'Text Effects',     type: 'boolean' },
  TEXT_DECRYPT_DURATION_MS:        { label: 'Decrypt Duration (ms)',    description: 'Total duration of decryption animation',                 group: 'Text Effects',     type: 'number' },
  TEXT_DECRYPT_CHAR_DELAY_MS:      { label: 'Decrypt Char Delay (ms)',  description: 'Delay between character decryptions',                    group: 'Text Effects',     type: 'number' },
  TEXT_DECRYPT_CHARS:              { label: 'Decrypt Characters',       description: 'Characters used for decryption scramble',                group: 'Text Effects',     type: 'string' },
}

// ---------------------------------------------------------------------------
// Runtime override storage
// ---------------------------------------------------------------------------

type ConfigValues = { -readonly [K in ConfigKey]: (typeof DEFAULTS)[K] }

const runtimeValues: ConfigValues = { ...DEFAULTS }

/** Apply user overrides from BandData.configOverrides on top of defaults */
export function applyConfigOverrides(overrides?: Record<string, unknown>) {
  // Reset to defaults first
  Object.assign(runtimeValues, DEFAULTS)
  if (!overrides) return
  for (const key of Object.keys(overrides)) {
    if (key in DEFAULTS) {
      const k = key as ConfigKey
      const val = overrides[k]
      if (typeof val === typeof DEFAULTS[k]) {
        ;(runtimeValues as Record<string, unknown>)[k] = val
      }
    }
  }
}

/** Get the full map of current runtime values (defaults + overrides) */
export function getConfigValues(): Readonly<ConfigValues> {
  return runtimeValues
}

// ---------------------------------------------------------------------------
// Named exports – these re-export from the runtime store so overrides work
// ---------------------------------------------------------------------------

// Typing & Console Effects
export const get = <K extends ConfigKey>(key: K): ConfigValues[K] => runtimeValues[key]

// For backwards compatibility, re-export the compile-time defaults so existing
// `import { SOME_CONST } from '@/lib/config'` statements continue to work.
// These are static values. To read a runtime-overridden value use get(key).

export const TYPING_EFFECT_SPEED_MS          = DEFAULTS.TYPING_EFFECT_SPEED_MS
export const TYPING_EFFECT_START_DELAY_MS    = DEFAULTS.TYPING_EFFECT_START_DELAY_MS
export const TITLE_TYPING_SPEED_MS           = DEFAULTS.TITLE_TYPING_SPEED_MS
export const TITLE_TYPING_START_DELAY_MS     = DEFAULTS.TITLE_TYPING_START_DELAY_MS
export const CONSOLE_TYPING_SPEED_MS         = DEFAULTS.CONSOLE_TYPING_SPEED_MS
export const CONSOLE_LINE_DELAY_MS           = DEFAULTS.CONSOLE_LINE_DELAY_MS
export const CONSOLE_LINES_DEFAULT_SPEED_MS  = DEFAULTS.CONSOLE_LINES_DEFAULT_SPEED_MS
export const CONSOLE_LINES_DEFAULT_DELAY_MS  = DEFAULTS.CONSOLE_LINES_DEFAULT_DELAY_MS
export const TERMINAL_RESERVED_COMMANDS      = ['help', 'clear', 'exit', 'glitch', 'matrix']
export const TERMINAL_TYPING_SPEED_MS        = DEFAULTS.TERMINAL_TYPING_SPEED_MS
export const TERMINAL_FILE_LOADING_DURATION_MS = DEFAULTS.TERMINAL_FILE_LOADING_DURATION_MS
export const PROFILE_LOADING_TEXT_INTERVAL_MS = DEFAULTS.PROFILE_LOADING_TEXT_INTERVAL_MS
export const PROFILE_GLITCH_PHASE_DELAY_MS   = DEFAULTS.PROFILE_GLITCH_PHASE_DELAY_MS
export const PROFILE_REVEAL_PHASE_DELAY_MS   = DEFAULTS.PROFILE_REVEAL_PHASE_DELAY_MS
export const SECTION_GLITCH_PROBABILITY      = DEFAULTS.SECTION_GLITCH_PROBABILITY
export const SECTION_GLITCH_DURATION_MS      = DEFAULTS.SECTION_GLITCH_DURATION_MS
export const SECTION_GLITCH_INTERVAL_MS      = DEFAULTS.SECTION_GLITCH_INTERVAL_MS
export const NAV_GLITCH_PROBABILITY          = DEFAULTS.NAV_GLITCH_PROBABILITY
export const NAV_GLITCH_DURATION_MS          = DEFAULTS.NAV_GLITCH_DURATION_MS
export const NAV_GLITCH_INTERVAL_MS          = DEFAULTS.NAV_GLITCH_INTERVAL_MS
export const HERO_LOGO_GLITCH_PROBABILITY    = DEFAULTS.HERO_LOGO_GLITCH_PROBABILITY
export const HERO_LOGO_GLITCH_DURATION_MS    = DEFAULTS.HERO_LOGO_GLITCH_DURATION_MS
export const HERO_LOGO_GLITCH_INTERVAL_MS    = DEFAULTS.HERO_LOGO_GLITCH_INTERVAL_MS
export const HERO_TITLE_GLITCH_PROBABILITY   = DEFAULTS.HERO_TITLE_GLITCH_PROBABILITY
export const HERO_TITLE_GLITCH_DURATION_MS   = DEFAULTS.HERO_TITLE_GLITCH_DURATION_MS
export const HERO_TITLE_GLITCH_INTERVAL_MS   = DEFAULTS.HERO_TITLE_GLITCH_INTERVAL_MS
export const LOADER_GLITCH_PROBABILITY       = DEFAULTS.LOADER_GLITCH_PROBABILITY
export const LOADER_GLITCH_DURATION_MS       = DEFAULTS.LOADER_GLITCH_DURATION_MS
export const LOADER_GLITCH_INTERVAL_MS       = DEFAULTS.LOADER_GLITCH_INTERVAL_MS
export const NAV_SCROLL_THRESHOLD_PX         = DEFAULTS.NAV_SCROLL_THRESHOLD_PX
export const NAV_HEIGHT_PX                   = DEFAULTS.NAV_HEIGHT_PX
export const LOADER_PROGRESS_INCREMENT_MULTIPLIER = DEFAULTS.LOADER_PROGRESS_INCREMENT_MULTIPLIER
export const LOADER_COMPLETE_DELAY_MS        = DEFAULTS.LOADER_COMPLETE_DELAY_MS
export const LOADER_PROGRESS_INTERVAL_MS     = DEFAULTS.LOADER_PROGRESS_INTERVAL_MS
export const VISUALIZER_BAR_COUNT            = DEFAULTS.VISUALIZER_BAR_COUNT
export const VISUALIZER_TIME_INCREMENT       = DEFAULTS.VISUALIZER_TIME_INCREMENT
export const VISUALIZER_GLITCH_PROBABILITY   = DEFAULTS.VISUALIZER_GLITCH_PROBABILITY
export const VISUALIZER_GLITCH_OFFSET        = DEFAULTS.VISUALIZER_GLITCH_OFFSET
export const VISUALIZER_GLITCH_DURATION_FRAMES = DEFAULTS.VISUALIZER_GLITCH_DURATION_FRAMES
export const VISUALIZER_GLITCH_DECAY         = DEFAULTS.VISUALIZER_GLITCH_DECAY
export const VISUALIZER_HEIGHT_SCALE         = DEFAULTS.VISUALIZER_HEIGHT_SCALE
export const VISUALIZER_BAR_GLITCH_PROBABILITY = DEFAULTS.VISUALIZER_BAR_GLITCH_PROBABILITY
export const VISUALIZER_BAR_GLITCH_OFFSET    = DEFAULTS.VISUALIZER_BAR_GLITCH_OFFSET
export const TOUCH_SWIPE_THRESHOLD_PX        = DEFAULTS.TOUCH_SWIPE_THRESHOLD_PX
export const DEFAULT_SOUND_VOLUME            = DEFAULTS.DEFAULT_SOUND_VOLUME
export const INITIAL_SYNC_DELAY_MS           = DEFAULTS.INITIAL_SYNC_DELAY_MS
export const SYNC_INTERVAL_MS                = DEFAULTS.SYNC_INTERVAL_MS
export const DEFAULT_LABEL                   = DEFAULTS.DEFAULT_LABEL
export const PROFILE_STATUS_TEXT             = DEFAULTS.PROFILE_STATUS_TEXT
export const SESSION_STATUS_TEXT             = DEFAULTS.SESSION_STATUS_TEXT

// CRT/Phosphor Effects
export const PHOSPHOR_GLOW_ENABLED           = DEFAULTS.PHOSPHOR_GLOW_ENABLED
export const PHOSPHOR_GLOW_INNER_BLUR_PX     = DEFAULTS.PHOSPHOR_GLOW_INNER_BLUR_PX
export const PHOSPHOR_GLOW_OUTER_BLUR_PX     = DEFAULTS.PHOSPHOR_GLOW_OUTER_BLUR_PX
export const PHOSPHOR_GLOW_INNER_OPACITY     = DEFAULTS.PHOSPHOR_GLOW_INNER_OPACITY
export const PHOSPHOR_GLOW_OUTER_OPACITY     = DEFAULTS.PHOSPHOR_GLOW_OUTER_OPACITY

// Scanline Effects
export const SCANLINE_MOVEMENT_ENABLED       = DEFAULTS.SCANLINE_MOVEMENT_ENABLED
export const SCANLINE_ANIMATION_DURATION_S   = DEFAULTS.SCANLINE_ANIMATION_DURATION_S
export const SCANLINE_HEIGHT_PX              = DEFAULTS.SCANLINE_HEIGHT_PX
export const SCANLINE_OPACITY                = DEFAULTS.SCANLINE_OPACITY

// System Monitor HUD
export const HUD_METADATA_ENABLED            = DEFAULTS.HUD_METADATA_ENABLED
export const HUD_METADATA_UPDATE_INTERVAL_MS = DEFAULTS.HUD_METADATA_UPDATE_INTERVAL_MS
export const HUD_SHOW_TIMESTAMP              = DEFAULTS.HUD_SHOW_TIMESTAMP
export const HUD_SHOW_PSEUDO_IP              = DEFAULTS.HUD_SHOW_PSEUDO_IP
export const HUD_SHOW_UPTIME                 = DEFAULTS.HUD_SHOW_UPTIME
export const HUD_SHOW_SECTOR                 = DEFAULTS.HUD_SHOW_SECTOR
export const HUD_SHOW_SCROLL_SPEED           = DEFAULTS.HUD_SHOW_SCROLL_SPEED

// Cursor Effects
export const CURSOR_BLINK_ENABLED            = DEFAULTS.CURSOR_BLINK_ENABLED
export const CURSOR_BLINK_SPEED_MS           = DEFAULTS.CURSOR_BLINK_SPEED_MS

// Image Glitch Effects
export const IMAGE_GLITCH_ON_HOVER_ENABLED   = DEFAULTS.IMAGE_GLITCH_ON_HOVER_ENABLED
export const IMAGE_GLITCH_SLICE_COUNT        = DEFAULTS.IMAGE_GLITCH_SLICE_COUNT
export const IMAGE_GLITCH_DURATION_MS        = DEFAULTS.IMAGE_GLITCH_DURATION_MS

// Text Decryption Effects
export const TEXT_DECRYPT_ENABLED            = DEFAULTS.TEXT_DECRYPT_ENABLED
export const TEXT_DECRYPT_DURATION_MS        = DEFAULTS.TEXT_DECRYPT_DURATION_MS
export const TEXT_DECRYPT_CHAR_DELAY_MS      = DEFAULTS.TEXT_DECRYPT_CHAR_DELAY_MS
export const TEXT_DECRYPT_CHARS              = DEFAULTS.TEXT_DECRYPT_CHARS
