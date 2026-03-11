import { Label } from '@/components/ui/label'
import { Eye, EyeSlash, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import type { ThemeSettings, SectionVisibility, SectionConfig } from '@/lib/types'
import { reorderSections, toggleSection } from '@/lib/sections'
import { SECTION_LABELS, SECTION_DISPLAY_NAMES } from '@/lib/theme-customizer-utils'
import { useLocale } from '@/hooks/use-locale'

interface SectionsPanelProps {
  themeSettings: ThemeSettings
  onPatchTheme: (patch: Partial<ThemeSettings>) => void
  visDraft: SectionVisibility
  onToggleVisibility: (key: keyof SectionVisibility) => void
  layoutDraft: SectionConfig[]
  onUpdateLayout: (sections: SectionConfig[]) => void
}

export default function ThemeCustomizerSectionsPanel({
  themeSettings,
  onPatchTheme,
  visDraft,
  onToggleVisibility,
  layoutDraft,
  onUpdateLayout,
}: SectionsPanelProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="font-mono text-xs text-muted-foreground">{t('themeCustomizer.borderRadius')}</Label>
          <span className="font-mono text-[10px] text-primary/70">
            {t('themeCustomizer.remValue').replace('{0}', (themeSettings.borderRadius ?? 0.125).toFixed(3))}
          </span>
        </div>
        <input
          type="range" min="0" max="1.5" step="0.025"
          value={themeSettings.borderRadius ?? 0.125}
          onChange={e => onPatchTheme({ borderRadius: parseFloat(e.target.value) })}
          className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono mt-1">
          <span>SHARP</span><span>ROUNDED</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-16 h-10 border border-primary/40 bg-primary/10" style={{ borderRadius: `${(themeSettings.borderRadius ?? 0.125) * 16}px` }} />
          <div className="w-20 h-8 border border-primary/40 bg-primary/10" style={{ borderRadius: `${(themeSettings.borderRadius ?? 0.125) * 16}px` }} />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">{t('themeCustomizer.visibilityDesc')}</p>
        <div className="space-y-1">
          {(Object.keys(SECTION_LABELS) as (keyof SectionVisibility)[]).map(key => {
            const visible = visDraft[key] !== false
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-primary/5">
                <span className="font-mono text-xs text-muted-foreground">{SECTION_LABELS[key]}</span>
                <button
                  onClick={() => onToggleVisibility(key)}
                  className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${visible ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'}`}
                >
                  {visible ? <Eye size={14} /> : <EyeSlash size={14} />}
                  {visible ? 'VISIBLE' : 'HIDDEN'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">{t('themeCustomizer.layoutDesc')}</p>
        <div className="space-y-2">
          {layoutDraft.map((section, index) => (
            <div key={section.id} className={`flex items-center gap-2 p-2 border rounded transition-colors ${section.enabled ? 'border-primary/20 bg-primary/5' : 'border-primary/5 opacity-50'}`}>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => onUpdateLayout(reorderSections(layoutDraft, section.id, index - 1))}
                  disabled={index === 0}
                  className="text-muted-foreground/60 hover:text-primary disabled:opacity-20 p-0.5"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  onClick={() => onUpdateLayout(reorderSections(layoutDraft, section.id, index + 1))}
                  disabled={index === layoutDraft.length - 1}
                  className="text-muted-foreground/60 hover:text-primary disabled:opacity-20 p-0.5"
                >
                  <ArrowDown size={12} />
                </button>
              </div>
              <span className="flex-1 font-mono text-xs text-foreground/80">{SECTION_DISPLAY_NAMES[section.id] ?? section.id}</span>
              <button
                onClick={() => onUpdateLayout(toggleSection(layoutDraft, section.id))}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${section.enabled ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'}`}
              >
                {section.enabled ? <Eye size={12} /> : <EyeSlash size={12} />}
                {section.enabled ? 'AN' : 'AUS'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
