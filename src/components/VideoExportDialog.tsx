import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilmSlate, X, Play, Download } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { VideoExporter, type VideoExportProgress } from '@/lib/videoExporter'
import CyberCloseButton from '@/components/CyberCloseButton'

interface VideoExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VideoExportDialog({ open, onOpenChange }: VideoExportDialogProps) {
  const [duration, setDuration] = useState(5)
  const [fps, setFps] = useState(30)
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<VideoExportProgress | null>(null)
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null)
  const exporterRef = useRef<VideoExporter | null>(null)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportedBlob(null)
      setProgress(null)

      // Get the main app element to record
      const appElement = document.getElementById('root')
      if (!appElement) {
        toast.error('Could not find app element to record')
        return
      }

      // Create exporter
      const exporter = new VideoExporter()
      exporterRef.current = exporter

      // Export with progress tracking
      const blob = await exporter.export(
        {
          element: appElement,
          duration: duration * 1000, // Convert to milliseconds
          fps,
          filename: `neuroklast-animation-${Date.now()}.webm`
        },
        (progress) => {
          setProgress(progress)
        }
      )

      setExportedBlob(blob)
      toast.success('Video exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to export video')
    } finally {
      setIsExporting(false)
      exporterRef.current = null
    }
  }

  const handleDownload = () => {
    if (!exportedBlob) return
    VideoExporter.download(exportedBlob, `neuroklast-animation-${Date.now()}.webm`)
    toast.success('Video downloaded!')
  }

  const handleCancel = () => {
    if (exporterRef.current) {
      exporterRef.current.cancel()
      setIsExporting(false)
      setProgress(null)
      toast.info('Export cancelled')
    }
  }

  const getStatusText = () => {
    if (!progress) return ''
    
    switch (progress.status) {
      case 'preparing':
        return 'Preparing export...'
      case 'recording':
        return `Recording... ${progress.progress.toFixed(0)}%`
      case 'processing':
        return 'Processing video...'
      case 'complete':
        return 'Export complete!'
      case 'error':
        return `Error: ${progress.error}`
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-black border-2 border-red-500/30 text-white">
        <CyberCloseButton onClick={() => onOpenChange(false)} />
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono tracking-wider flex items-center gap-2">
            <FilmSlate className="w-6 h-6 text-red-500" />
            VIDEO EXPORT
          </DialogTitle>
          <DialogDescription className="text-red-500/70 font-mono">
            Export custom animations as video files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Export Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-red-500 font-mono text-sm">
                Duration (seconds)
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="60"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isExporting}
                className="bg-black border-red-500/30 text-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fps" className="text-red-500 font-mono text-sm">
                Frame Rate (FPS)
              </Label>
              <Input
                id="fps"
                type="number"
                min="15"
                max="60"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                disabled={isExporting}
                className="bg-black border-red-500/30 text-white font-mono"
              />
              <p className="text-xs text-red-500/50 font-mono">
                Recommended: 30 FPS for smooth playback
              </p>
            </div>
          </div>

          {/* Progress Display */}
          <AnimatePresence>
            {progress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="text-sm font-mono text-red-500">
                  {getStatusText()}
                </div>
                {progress.status === 'recording' && (
                  <Progress 
                    value={progress.progress} 
                    className="h-2 bg-red-950"
                  />
                )}
                {progress.status === 'processing' && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                    <span className="text-sm font-mono text-red-500">Processing...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isExporting && !exportedBlob && (
              <Button
                onClick={handleExport}
                className="flex-1 bg-red-500 hover:bg-red-600 text-black font-mono"
              >
                <Play className="w-4 h-4 mr-2" />
                START EXPORT
              </Button>
            )}

            {isExporting && (
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 font-mono"
              >
                <X className="w-4 h-4 mr-2" />
                CANCEL
              </Button>
            )}

            {exportedBlob && (
              <Button
                onClick={handleDownload}
                className="flex-1 bg-red-500 hover:bg-red-600 text-black font-mono"
              >
                <Download className="w-4 h-4 mr-2" />
                DOWNLOAD VIDEO
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="p-4 border border-red-500/20 rounded bg-red-950/20">
            <p className="text-xs text-red-500/70 font-mono leading-relaxed">
              <strong className="text-red-500">NOTE:</strong> Video export captures the current viewport animations.
              The recording will include all visible elements, animations, and effects.
              Format: WebM (widely supported, good compression).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
