/**
 * @file WizardUIElements.tsx
 *
 * Small, stateless UI primitives shared across all Setup Wizard step components.
 *
 * WHY a dedicated file: Previously these helpers (Field, NavigationButtons,
 * CornerDecorations, StepIndicator, WizardColorInput) were defined at the
 * bottom of the 1342-line SetupWizard.tsx, making them invisible and hard to
 * maintain. Extracting them here makes them discoverable and individually
 * testable.
 */

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { oklchToHex, hexToOklch } from '@/lib/color-utils'

// ─── Field ────────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  children: React.ReactNode
}

/**
 * Labelled form field wrapper used in every wizard step.
 *
 * Renders a small mono uppercase label above the provided child input.
 */
export function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
        {label}
      </Label>
      {children}
    </div>
  )
}

// ─── NavigationButtons ────────────────────────────────────────────────────────

interface NavigationButtonsProps {
  onBack: () => void
  onNext?: () => void
  nextDisabled?: boolean
  nextLabel?: string
}

/**
 * Back / Next button pair used at the bottom of each wizard step.
 *
 * `onNext` is optional — when omitted the Next button is rendered disabled,
 * allowing conditional step advancement (e.g. site name required).
 */
export function NavigationButtons({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = 'NEXT',
}: NavigationButtonsProps) {
  return (
    <div className="flex gap-2 mt-2">
      <Button
        variant="outline"
        onClick={onBack}
        className="font-mono text-xs gap-1 flex-1"
      >
        <ArrowLeft size={14} />
        BACK
      </Button>
      <Button
        onClick={onNext}
        disabled={nextDisabled || !onNext}
        className="font-mono text-xs gap-1 flex-1"
      >
        {nextLabel}
        <ArrowRight size={14} />
      </Button>
    </div>
  )
}

// ─── CornerDecorations ────────────────────────────────────────────────────────

/**
 * Decorative corner lines rendered inside the wizard card.
 * Pure cosmetic component with no interactive behaviour.
 */
export function CornerDecorations() {
  return (
    <>
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50 pointer-events-none" />
    </>
  )
}

// ─── StepIndicator ────────────────────────────────────────────────────────────

interface StepIndicatorProps {
  current: number
  total: number
}

/**
 * Progress dots shown above the wizard card.
 *
 * The active dot is wider (pill-shaped) to indicate the current position.
 * Completed dots are shown at 50 % opacity; future dots at 20 %.
 */
export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`transition-all duration-300 rounded-full ${
            i === current
              ? 'w-6 h-2 bg-primary'
              : i < current
                ? 'w-2 h-2 bg-primary/50'
                : 'w-2 h-2 bg-primary/20'
          }`}
        />
      ))}
    </div>
  )
}

// ─── WizardColorInput ─────────────────────────────────────────────────────────

interface WizardColorInputProps {
  label: string
  value: string
  onChange: (v: string) => void
}

/**
 * Colour picker row for the wizard Colours step.
 *
 * Renders an `<input type="color">` (hex picker) alongside a text input
 * accepting OKLCH strings. The two are kept in sync via `oklchToHex` and
 * `hexToOklch` converters so the native colour picker and the raw text field
 * always represent the same colour.
 */
export function WizardColorInput({ label, value, onChange }: WizardColorInputProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <Label className="font-mono text-[10px] text-muted-foreground w-24 flex-shrink-0 uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={oklchToHex(value)}
          onChange={(e) => onChange(hexToOklch(e.target.value))}
          className="w-8 h-8 rounded cursor-pointer border border-primary/20 bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs h-8 flex-1"
          placeholder="oklch(0.50 0.22 25)"
        />
      </div>
    </div>
  )
}
