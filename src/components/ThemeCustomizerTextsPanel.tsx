import { ArrowCounterClockwise } from '@phosphor-icons/react'
import type { ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface TextsPanelProps {
  themeSettings: ThemeSettings
  onPatchTheme: (patch: Partial<ThemeSettings>) => void
}

function ArrayTextEditor({
  label,
  description,
  value,
  onChange,
  onReset,
}: {
  label: string
  description: string
  value: string[] | undefined
  onChange: (lines: string[]) => void
  onReset: () => void
}) {
  const text = (value ?? []).join('\n')

  const handleChange = (raw: string) => {
    const lines = raw.split('\n')
    onChange(lines)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-foreground/90">{label}</p>
          <p className="font-mono text-[9px] text-muted-foreground/60">{description}</p>
        </div>
        <button
          onClick={onReset}
          title="Reset to theme defaults"
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors border border-primary/10"
        >
          <ArrowCounterClockwise size={11} />
          Reset
        </button>
      </div>
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        rows={6}
        className="w-full font-mono text-xs bg-card border border-primary/30 rounded px-2 py-1.5 text-foreground/90 resize-y focus:outline-none focus:border-primary/60 leading-relaxed"
        placeholder="One entry per line…"
        spellCheck={false}
      />
      <p className="font-mono text-[9px] text-muted-foreground/40">
        {(value?.length ?? 0)} {(value?.length ?? 0) === 1 ? 'entry' : 'entries'} · one per line
      </p>
    </div>
  )
}

export default function ThemeCustomizerTextsPanel({ themeSettings, onPatchTheme }: TextsPanelProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-5">
      <div className="border border-primary/20 p-3 bg-primary/5 rounded space-y-4">
        <p className="font-mono text-[10px] text-muted-foreground/80 uppercase tracking-wider">
          {t('theme.customTexts') || 'CUSTOM TEXTS'}
        </p>
        <p className="font-mono text-[9px] text-muted-foreground/50">
          {t('theme.customTextsDesc') || 'Override built-in texts. Leave empty to use the theme defaults.'}
        </p>

        <ArrayTextEditor
          label={t('theme.loadingMessages') || 'Loading Screen Messages'}
          description={t('theme.loadingMessagesDesc') || 'Boot sequence lines shown on the loading screen'}
          value={themeSettings.loadingMessages}
          onChange={lines => onPatchTheme({ loadingMessages: lines.length > 0 ? lines : undefined })}
          onReset={() => onPatchTheme({ loadingMessages: undefined })}
        />

        <div className="border-t border-primary/10 pt-4">
          <ArrayTextEditor
            label={t('theme.modalLoadingMessages') || 'Modal Loading Messages'}
            description={t('theme.modalLoadingMessagesDesc') || 'Status texts shown while an overlay modal is loading'}
            value={themeSettings.modalLoadingMessages}
            onChange={lines => onPatchTheme({ modalLoadingMessages: lines.length > 0 ? lines : undefined })}
            onReset={() => onPatchTheme({ modalLoadingMessages: undefined })}
          />
        </div>
      </div>
    </div>
  )
}
