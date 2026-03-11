import { ArrowCounterClockwise, Plus, Trash, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import type { ThemeSettings, HeroButton } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'
import { Input } from '@/components/ui/input'

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

function HeroButtonEditor({ buttons, onChange }: { buttons: HeroButton[]; onChange: (buttons: HeroButton[]) => void }) {
  const { t } = useLocale()

  function addButton() {
    onChange([...buttons, { id: `btn-${Date.now()}`, label: 'Explore', action: 'scroll', scrollTarget: 'releases', variant: 'default' }])
  }

  function removeButton(id: string) {
    onChange(buttons.filter(b => b.id !== id))
  }

  function updateButton(id: string, patch: Partial<HeroButton>) {
    onChange(buttons.map(b => b.id === id ? { ...b, ...patch } : b))
  }

  function moveButton(idx: number, dir: -1 | 1) {
    const next = [...buttons]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {buttons.map((btn, idx) => (
        <div key={btn.id} className="border border-primary/20 rounded p-2 space-y-2 bg-card/50">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-primary/70 uppercase">Button {idx + 1}</span>
            <div className="flex gap-1">
              <button onClick={() => moveButton(idx, -1)} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move up"><ArrowUp size={12} /></button>
              <button onClick={() => moveButton(idx, 1)} disabled={idx === buttons.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move down"><ArrowDown size={12} /></button>
              <button onClick={() => removeButton(btn.id)} className="text-muted-foreground hover:text-status-error" aria-label="Delete button"><Trash size={12} /></button>
            </div>
          </div>
          <Input
            value={btn.label}
            onChange={e => updateButton(btn.id, { label: e.target.value })}
            placeholder={t('theme.heroButtonLabel') || 'Label'}
            className="font-mono text-xs h-7"
          />
          <select
            value={btn.action}
            onChange={e => updateButton(btn.id, { action: e.target.value as HeroButton['action'] })}
            className="w-full font-mono text-xs h-7 bg-card border border-primary/30 rounded px-2 text-foreground"
          >
            <option value="scroll">Scroll to section</option>
            <option value="url">Open URL</option>
            <option value="contact-modal">Open Contact form</option>
          </select>
          {btn.action === 'scroll' && (
            <Input
              value={btn.scrollTarget || ''}
              onChange={e => updateButton(btn.id, { scrollTarget: e.target.value })}
              placeholder={t('theme.heroButtonScrollTarget') || 'Section ID (e.g. releases)'}
              className="font-mono text-xs h-7"
            />
          )}
          {btn.action === 'url' && (
            <Input
              value={btn.url || ''}
              onChange={e => updateButton(btn.id, { url: e.target.value })}
              placeholder="https://…"
              className="font-mono text-xs h-7"
            />
          )}
          <select
            value={btn.variant || 'default'}
            onChange={e => updateButton(btn.id, { variant: e.target.value as HeroButton['variant'] })}
            className="w-full font-mono text-xs h-7 bg-card border border-primary/30 rounded px-2 text-foreground"
          >
            <option value="default">Default (filled)</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
            <option value="secondary">Secondary</option>
          </select>
        </div>
      ))}
      <button
        onClick={addButton}
        className="flex items-center gap-1 px-3 py-1.5 w-full justify-center text-[10px] font-mono text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors border border-dashed border-primary/20 rounded"
      >
        <Plus size={11} /> {t('theme.addHeroButton') || 'Add Button'}
      </button>
    </div>
  )
}

export default function ThemeCustomizerTextsPanel({ themeSettings, onPatchTheme }: TextsPanelProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-5">
      <div className="border border-primary/20 p-3 bg-primary/5 rounded space-y-4">
        <p className="font-mono text-[10px] text-muted-foreground/80 uppercase tracking-wider">
          {t('theme.heroButtons') || 'HERO BUTTONS'}
        </p>
        <p className="font-mono text-[9px] text-muted-foreground/50">
          {t('theme.heroButtonsDesc') || 'Configure the action buttons displayed under the hero image. Leave empty for theme defaults.'}
        </p>
        <HeroButtonEditor
          buttons={themeSettings.heroButtons ?? []}
          onChange={buttons => onPatchTheme({ heroButtons: buttons.length > 0 ? buttons : undefined })}
        />
      </div>

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

