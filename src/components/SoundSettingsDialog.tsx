import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import CyberCloseButton from '@/components/CyberCloseButton'
import type { SoundSettings } from '@/lib/types'

interface SoundSettingsDialogProps {
  settings?: SoundSettings
  onSave: (settings: SoundSettings) => void
  onClose: () => void
}

export default function SoundSettingsDialog({ settings, onSave, onClose }: SoundSettingsDialogProps) {
  const [data, setData] = useState<SoundSettings>(settings || {})

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card border border-border rounded-lg p-6 w-full max-w-md space-y-4 relative"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <CyberCloseButton onClick={onClose} label="CLOSE" className="absolute top-3 right-3" />
        <h3 className="text-lg font-bold font-mono">Sound Effects</h3>
        <p className="text-sm text-muted-foreground">
          Add URLs to audio files (MP3, WAV, OGG). Google Drive share links are supported.
          All sounds are optional.
        </p>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Terminal Sound</Label>
            <Input
              value={data.terminalSound || ''}
              onChange={(e) => setData({ ...data, terminalSound: e.target.value })}
              placeholder="https://drive.google.com/file/d/.../view"
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">Plays on terminal keystrokes</p>
          </div>
          <div>
            <Label className="text-xs">Typing Sound</Label>
            <Input
              value={data.typingSound || ''}
              onChange={(e) => setData({ ...data, typingSound: e.target.value })}
              placeholder="https://drive.google.com/file/d/.../view"
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">Plays during typing animations</p>
          </div>
          <div>
            <Label className="text-xs">Button Sound</Label>
            <Input
              value={data.buttonSound || ''}
              onChange={(e) => setData({ ...data, buttonSound: e.target.value })}
              placeholder="https://drive.google.com/file/d/.../view"
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">Plays on button clicks</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={() => { onSave(data); onClose() }} className="flex-1">Save</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
