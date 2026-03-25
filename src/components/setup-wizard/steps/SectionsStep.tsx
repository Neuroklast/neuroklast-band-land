/**
 * @file SectionsStep.tsx
 *
 * Wizard step 7: section enable/disable and reordering with custom labels.
 */

import { Input } from '@/components/ui/input'
import { ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { useLocale } from '@/hooks/use-locale'
import { NavigationButtons } from '@/components/setup-wizard/WizardUIElements'
import { toggleSection, reorderSections } from '@/lib/sections'
import type { SectionConfig } from '@/lib/types'

export interface SectionsStepProps {
  sections: SectionConfig[]
  sectionLabels: Record<string, string>
  setSections: React.Dispatch<React.SetStateAction<SectionConfig[]>>
  setSectionLabels: React.Dispatch<React.SetStateAction<Record<string, string>>>
  goBack: () => void
  goNext: () => void
}

/**
 * Sections step – toggle and reorder page sections, optionally override labels.
 *
 * Uses immutable updater functions (`toggleSection`, `reorderSections`) from
 * `@/lib/sections` to ensure state mutations are pure.
 */
export function SectionsStep({
  sections,
  sectionLabels,
  setSections,
  setSectionLabels,
  goBack,
  goNext,
}: SectionsStepProps) {
  const { t } = useLocale()
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">SECTIONS</h2>
        <p className="font-mono text-xs text-muted-foreground">{t('setup.sectionsDesc')}</p>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {sorted.map((sec, idx) => (
          <div
            key={sec.id}
            className="flex items-center gap-2 border border-primary/15 rounded px-3 py-2 bg-card"
          >
            <input
              type="checkbox"
              checked={sec.enabled}
              onChange={() => setSections((prev) => toggleSection(prev, sec.id))}
              className="accent-primary"
              id={`section-${sec.id}`}
            />
            <label
              htmlFor={`section-${sec.id}`}
              className="font-mono text-xs text-foreground min-w-20 capitalize cursor-pointer select-none flex-shrink-0"
            >
              {sec.id}
            </label>
            <Input
              value={sectionLabels[sec.id] ?? ''}
              onChange={(e) =>
                setSectionLabels((prev) => ({ ...prev, [sec.id]: e.target.value }))
              }
              placeholder="Custom label"
              className="font-mono text-[10px] h-7 flex-1"
            />
            <button
              onClick={() =>
                idx > 0 && setSections((prev) => reorderSections(prev, sec.id, idx - 1))
              }
              disabled={idx === 0}
              className="text-muted-foreground hover:text-primary disabled:opacity-30 p-0.5"
              aria-label={`Move ${sec.id} up`}
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={() =>
                idx < sorted.length - 1 &&
                setSections((prev) => reorderSections(prev, sec.id, idx + 1))
              }
              disabled={idx === sorted.length - 1}
              className="text-muted-foreground hover:text-primary disabled:opacity-30 p-0.5"
              aria-label={`Move ${sec.id} down`}
            >
              <ArrowDown size={12} />
            </button>
          </div>
        ))}
      </div>

      <NavigationButtons onBack={goBack} onNext={goNext} />
    </div>
  )
}
