/**
 * @file SecuritySettingsPrimitives.tsx
 *
 * Stateless UI primitives shared across Security Settings tab components.
 *
 * WHY a dedicated file: `ToggleRow`, `SliderRow`, and `TextInputRow` were
 * previously defined at the top of the 1 155-line `SecuritySettingsDialog.tsx`.
 * Extracting them here makes them independently discoverable and reusable,
 * and eliminates the cognitive overhead of finding small helpers inside a
 * massive component file.
 *
 * All components are purely presentational (no local state, no side-effects).
 */

import { Info } from '@phosphor-icons/react'

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipProps {
  text: string
}

/**
 * Hover tooltip rendered via CSS `group-hover` — no JavaScript, no library.
 * Uses fixed width (w-64) to prevent layout shifts across different tooltip lengths.
 */
function Tooltip({ text }: TooltipProps) {
  return (
    <span className="relative group/tip cursor-help">
      <Info size={12} className="text-primary/30 hover:text-primary/60 transition-colors" />
      <span className="absolute z-50 left-0 bottom-full mb-1.5 hidden group-hover/tip:block w-64 px-2 py-1.5 bg-black border border-primary/30 text-[10px] text-primary/80 font-mono leading-relaxed pointer-events-none whitespace-normal">
        {text}
      </span>
    </span>
  )
}

// ─── ToggleRow ────────────────────────────────────────────────────────────────

export interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
  icon?: React.ComponentType<{ size: number; className?: string }>
  badge?: string
  tooltip?: string
  statusActive: string
  statusDisabled: string
}

/**
 * A labelled on/off toggle row used in the Security Settings modules tab.
 *
 * The toggle is implemented as a button (not `<input type="checkbox">`) to
 * achieve the custom pill appearance without CSS overrides.
 */
export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
  badge,
  tooltip,
  statusActive,
  statusDisabled,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-primary/5">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`mt-0.5 ${checked ? 'text-primary/70' : 'text-primary/20'}`}>
            <Icon size={18} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-[12px] text-foreground/85 uppercase tracking-wider">{label}</p>
            {badge && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider bg-status-error-em/20 text-status-error border border-status-error-em/30 rounded">
                {badge}
              </span>
            )}
            {tooltip && <Tooltip text={tooltip} />}
          </div>
          <p className="text-[11px] text-primary/50 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`font-mono text-[9px] tracking-wider ${checked ? 'text-status-success/70' : 'text-status-error/50'}`}>
          {checked ? statusActive : statusDisabled}
        </span>
        <button
          onClick={() => onChange(!checked)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            checked ? 'bg-primary/60' : 'bg-primary/15'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              checked ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

// ─── SliderRow ────────────────────────────────────────────────────────────────

export interface SliderRowProps {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  tooltip?: string
}

/**
 * Numeric slider row with a parallel number `<input>` for precise entry.
 *
 * Both controls are kept in sync: dragging the slider calls `onChange` with
 * the integer value; typing in the number input validates the range before
 * calling `onChange` to prevent out-of-bounds values reaching the parent.
 */
export function SliderRow({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  tooltip,
}: SliderRowProps) {
  return (
    <div className="py-3 border-b border-primary/5 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-[12px] text-foreground/85 uppercase tracking-wider">{label}</p>
            {tooltip && <Tooltip text={tooltip} />}
          </div>
          <p className="text-[11px] text-primary/50 mt-1 leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const parsed = Number(e.target.value)
              if (!isNaN(parsed) && parsed >= min && parsed <= max) onChange(parsed)
            }}
            min={min}
            max={max}
            step={step}
            className="w-24 bg-black/50 border border-primary/20 px-2 py-1 font-mono text-[12px] text-foreground/80 text-right focus:border-primary/50 focus:outline-none"
          />
          {unit && <span className="text-[10px] font-mono text-primary/40 min-w-[2rem]">{unit}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-primary/30 w-12 text-right">{min}{unit}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 accent-primary cursor-pointer"
        />
        <span className="font-mono text-[9px] text-primary/30 w-12">{max}{unit}</span>
      </div>
    </div>
  )
}

// ─── TextInputRow ─────────────────────────────────────────────────────────────

export interface TextInputRowProps {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  tooltip?: string
}

/**
 * Free-text input row for settings like webhook URLs and email addresses.
 * Validation is deferred to the server via the Zod schema in
 * `api/security-settings.ts`.
 */
export function TextInputRow({
  label,
  description,
  value,
  onChange,
  placeholder,
  tooltip,
}: TextInputRowProps) {
  return (
    <div className="py-3 border-b border-primary/5 space-y-2">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-mono text-[12px] text-foreground/85 uppercase tracking-wider">{label}</p>
          {tooltip && <Tooltip text={tooltip} />}
        </div>
        <p className="text-[11px] text-primary/50 mt-1 leading-relaxed">{description}</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-primary/20 px-2 py-1.5 font-mono text-[12px] text-foreground/80 focus:border-primary/50 focus:outline-none placeholder:text-primary/20"
      />
    </div>
  )
}
