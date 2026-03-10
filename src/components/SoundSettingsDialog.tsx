import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { motion } from 'framer-motion'
import CyberCloseButton from '@/components/CyberCloseButton'
import type { SoundSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface SoundSettingsDialogProps {
  settings?: SoundSettings
  onSave: (settings: SoundSettings) => void
  onClose: () => void
}

export default function SoundSettingsDialog({ settings, onSave, onClose }: SoundSettingsDialogProps) {
  const { t } = useLocale()
  const [data, setData] = useState<SoundSettings>(settings || {})

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card border border-border rounded-[var(--radius-lg)] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4 relative"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <CyberCloseButton onClick={onClose} label="CLOSE" className="absolute top-3 right-3" />
        <h3 className="text-lg font-bold font-mono">{t('sound.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('sound.description')}
        </p>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex-1">
              <Label className="text-xs font-bold">{t('sound.defaultMuted')}</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t('sound.defaultMutedDesc')}</p>
            </div>
            <Switch
              checked={data.defaultMuted ?? true}
              onCheckedChange={(checked) => setData({ ...data, defaultMuted: checked })}
            />
          </div>

          <div className="border-t border-border pt-3">
            <h4 className="text-sm font-bold font-mono mb-3">{t('sound.soundEffects')}</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">{t('sound.terminalSound')}</Label>
                <Input
                  value={data.terminalSound || ''}
                  onChange={(e) => setData({ ...data, terminalSound: e.target.value })}
                  placeholder="Default: none"
                  className="text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('sound.terminalSoundDesc')}</p>
              </div>
              <div>
                <Label className="text-xs">{t('sound.typingSound')}</Label>
                <Input
                  value={data.typingSound || ''}
                  onChange={(e) => setData({ ...data, typingSound: e.target.value })}
                  placeholder="Default: texttyping.wav"
                  className="text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('sound.typingSoundDesc')}</p>
              </div>
              <div>
                <Label className="text-xs">{t('sound.buttonSound')}</Label>
                <Input
                  value={data.buttonSound || ''}
                  onChange={(e) => setData({ ...data, buttonSound: e.target.value })}
                  placeholder="Default: click.wav"
                  className="text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('sound.buttonSoundDesc')}</p>
              </div>
              <div>
                <Label className="text-xs">{t('sound.loadingFinishedSound')}</Label>
                <Input
                  value={data.loadingFinishedSound || ''}
                  onChange={(e) => setData({ ...data, loadingFinishedSound: e.target.value })}
                  placeholder="Default: laodingfinished.mp3"
                  className="text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('sound.loadingFinishedSoundDesc')}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <h4 className="text-sm font-bold font-mono mb-3">{t('sound.backgroundMusic')}</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">{t('sound.backgroundMusicUrl')}</Label>
                <Input
                  value={data.backgroundMusic || ''}
                  onChange={(e) => setData({ ...data, backgroundMusic: e.target.value })}
                  placeholder="Default: NK - THRESHOLD.mp3"
                  className="text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('sound.backgroundMusicUrlDesc')}</p>
              </div>
              <div>
                <Label className="text-xs">{t('sound.backgroundMusicVolume')}</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[data.backgroundMusicVolume ?? 0.3]}
                    onValueChange={([value]) => setData({ ...data, backgroundMusicVolume: value })}
                    max={1}
                    step={0.01}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {Math.round((data.backgroundMusicVolume ?? 0.3) * 100)}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('sound.backgroundMusicVolumeDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={() => { onSave(data); onClose() }} className="flex-1">{t('common.save')}</Button>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
