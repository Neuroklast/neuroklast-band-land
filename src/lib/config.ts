/**
 * Central configuration file for all constants and default values.
 *
 * Every named constant, timing value, threshold and default used across the
 * application is collected here so they can be tuned from a single place.
 * Each value includes a short description of what it controls.
 */

// ---------------------------------------------------------------------------
// Typing & Console Effects
// ---------------------------------------------------------------------------

/** Milliseconds per character for the global typing-effect hook (useTypingEffect default) */
export const TYPING_EFFECT_SPEED_MS = 30

/** Default start delay before the typing effect begins (ms) */
export const TYPING_EFFECT_START_DELAY_MS = 0

/** Milliseconds per character for section title typing animations */
export const TITLE_TYPING_SPEED_MS = 50

/** Delay before section title typing starts (ms) */
export const TITLE_TYPING_START_DELAY_MS = 100

/** Milliseconds per character for console-style line-by-line reveals */
export const CONSOLE_TYPING_SPEED_MS = 30

/** Delay between finished console lines before the next line starts (ms) */
export const CONSOLE_LINE_DELAY_MS = 100

/** Default speed for the ConsoleLines component (ms per character) */
export const CONSOLE_LINES_DEFAULT_SPEED_MS = 40

/** Default delay between console lines in the ConsoleLines component (ms) */
export const CONSOLE_LINES_DEFAULT_DELAY_MS = 120

// ---------------------------------------------------------------------------
// Terminal
// ---------------------------------------------------------------------------

/** Reserved terminal command names that cannot be overridden by custom commands */
export const TERMINAL_RESERVED_COMMANDS = ['help', 'clear', 'exit', 'glitch', 'matrix']

/** Milliseconds per character when the terminal types out output lines */
export const TERMINAL_TYPING_SPEED_MS = 18

/** Duration of the loading animation shown before a file download starts (ms) */
export const TERMINAL_FILE_LOADING_DURATION_MS = 2000

// ---------------------------------------------------------------------------
// Profile Overlay (Members & Partners/Friends)
// ---------------------------------------------------------------------------

/** Interval for cycling through the loading text lines in profile overlays (ms) */
export const PROFILE_LOADING_TEXT_INTERVAL_MS = 300

/** Time before the profile overlay enters the glitch phase (ms) */
export const PROFILE_GLITCH_PHASE_DELAY_MS = 700

/** Time before the profile overlay enters the fully revealed phase (ms) */
export const PROFILE_REVEAL_PHASE_DELAY_MS = 1000

// ---------------------------------------------------------------------------
// Glitch Effects
// ---------------------------------------------------------------------------

/** Probability (0–1) that a glitch fires on each check for section titles */
export const SECTION_GLITCH_PROBABILITY = 0.8

/** Duration of the glitch visual effect for section titles (ms) */
export const SECTION_GLITCH_DURATION_MS = 300

/** How often the section glitch is checked (ms) */
export const SECTION_GLITCH_INTERVAL_MS = 4000

/** Probability (0–1) that a glitch fires for the navigation bar brand text */
export const NAV_GLITCH_PROBABILITY = 0.9

/** Duration of the nav glitch effect (ms) */
export const NAV_GLITCH_DURATION_MS = 200

/** How often the navigation glitch is checked (ms) */
export const NAV_GLITCH_INTERVAL_MS = 5000

/** Probability (0–1) that a glitch fires for the hero logo */
export const HERO_LOGO_GLITCH_PROBABILITY = 0.75

/** Duration of the hero logo glitch effect (ms) */
export const HERO_LOGO_GLITCH_DURATION_MS = 300

/** How often the hero logo glitch is checked (ms) */
export const HERO_LOGO_GLITCH_INTERVAL_MS = 5000

/** Probability (0–1) that a glitch fires for the hero title */
export const HERO_TITLE_GLITCH_PROBABILITY = 0.8

/** Duration of the hero title glitch effect (ms) */
export const HERO_TITLE_GLITCH_DURATION_MS = 300

/** How often the hero title glitch is checked (ms) */
export const HERO_TITLE_GLITCH_INTERVAL_MS = 6000

/** Probability (0–1) that a glitch fires inside the cyberpunk loader */
export const LOADER_GLITCH_PROBABILITY = 0.7

/** Duration of the loader glitch effect (ms) */
export const LOADER_GLITCH_DURATION_MS = 100

/** How often the loader glitch is checked (ms) */
export const LOADER_GLITCH_INTERVAL_MS = 800

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/** Scroll distance (px) after which the nav bar gets its background/blur */
export const NAV_SCROLL_THRESHOLD_PX = 50

// ---------------------------------------------------------------------------
// Cyberpunk Loader
// ---------------------------------------------------------------------------

/** Random multiplier for progress increment per tick (max extra %) */
export const LOADER_PROGRESS_INCREMENT_MULTIPLIER = 20

/** Delay after reaching 100 % before firing the onLoadComplete callback (ms) */
export const LOADER_COMPLETE_DELAY_MS = 500

/** Interval at which the loader progress bar updates (ms) */
export const LOADER_PROGRESS_INTERVAL_MS = 150

// ---------------------------------------------------------------------------
// Audio Visualizer
// ---------------------------------------------------------------------------

/** Number of bars rendered in the audio visualizer */
export const VISUALIZER_BAR_COUNT = 40

/** Time increment per animation frame for the visualizer */
export const VISUALIZER_TIME_INCREMENT = 0.01

/** Probability of a random glitch on the visualizer per frame */
export const VISUALIZER_GLITCH_PROBABILITY = 0.002

/** Glitch offset multiplier when a glitch triggers */
export const VISUALIZER_GLITCH_OFFSET = 20

/** Number of frames a visualizer glitch lasts */
export const VISUALIZER_GLITCH_DURATION_FRAMES = 10

/** Decay factor applied to glitch offset each frame */
export const VISUALIZER_GLITCH_DECAY = 0.9

/** Height scaling factor for visualizer canvas rendering */
export const VISUALIZER_HEIGHT_SCALE = 0.15

/** Probability that an individual bar gets a random glitch */
export const VISUALIZER_BAR_GLITCH_PROBABILITY = 0.01

/** Offset applied to a randomly glitched bar */
export const VISUALIZER_BAR_GLITCH_OFFSET = 30

// ---------------------------------------------------------------------------
// Touch Interaction
// ---------------------------------------------------------------------------

/** Minimum swipe distance (px) to register a left/right swipe */
export const TOUCH_SWIPE_THRESHOLD_PX = 75

// ---------------------------------------------------------------------------
// Sound Effects
// ---------------------------------------------------------------------------

/** Default playback volume for sound effects (0–1) */
export const DEFAULT_SOUND_VOLUME = 0.4

// ---------------------------------------------------------------------------
// Data Sync (EditControls)
// ---------------------------------------------------------------------------

/** Delay after page load before the first automatic sync check (ms) */
export const INITIAL_SYNC_DELAY_MS = 30_000

/** Interval between automatic sync checks (ms) — 5 minutes */
export const SYNC_INTERVAL_MS = 5 * 60_000

// ---------------------------------------------------------------------------
// Defaults / Labels
// ---------------------------------------------------------------------------

/** Default record label shown when none is configured */
export const DEFAULT_LABEL = 'Darktunes Music Group'
