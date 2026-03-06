import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Warning, CheckCircle, Info, UploadSimple, ClipboardText } from '@phosphor-icons/react'
import { toast } from 'sonner'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import CyberCloseButton from '@/components/CyberCloseButton'
import type { WidgetPlugin } from '@/lib/types'
import {
  validateWidgetImport,
  mergeImportedWidgets,
  type WidgetConflict,
  type WidgetConflictResolution,
  type WidgetImportValidationResult,
} from '@/lib/config-export'
import { useLocale } from '@/contexts/LocaleContext'

interface WidgetImportDialogProps {
  open: boolean
  onClose: () => void
  currentPlugins: WidgetPlugin[]
  onConfirm: (plugins: WidgetPlugin[]) => void
}

export default function WidgetImportDialog({
  open,
  onClose,
  currentPlugins,
  onConfirm,
}: WidgetImportDialogProps) {
  const { t } = useLocale()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pasteText, setPasteText] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [validation, setValidation] = useState<WidgetImportValidationResult | null>(null)
  const [resolutions, setResolutions] = useState<Record<string, WidgetConflictResolution>>({})
  const [conflicts, setConflicts] = useState<WidgetConflict[]>([])

  const reset = useCallback(() => {
    setPasteText('')
    setShowPaste(false)
    setValidation(null)
    setResolutions({})
    setConflicts([])
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  function parseAndValidate(raw: unknown) {
    const result = validateWidgetImport(raw)
    setValidation(result)
    setResolutions({})
    if (result.valid) {
      // Pre-detect conflicts
      const { conflicts: detected } = mergeImportedWidgets(currentPlugins, result.widgets, {})
      setConflicts(detected)
    } else {
      setConflicts([])
    }
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string)
        parseAndValidate(raw)
      } catch {
        setValidation({ valid: false, errors: ['Invalid JSON file'], warnings: [], widgets: [] })
        setConflicts([])
      }
    }
    reader.readAsText(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handlePasteSubmit() {
    try {
      const raw = JSON.parse(pasteText)
      parseAndValidate(raw)
    } catch {
      setValidation({ valid: false, errors: ['Invalid JSON'], warnings: [], widgets: [] })
      setConflicts([])
    }
  }

  function setResolution(id: string, resolution: WidgetConflictResolution) {
    setResolutions((prev) => ({ ...prev, [id]: resolution }))
  }

  const unresolvedConflicts = conflicts.filter((c) => resolutions[c.id] === undefined)
  const hasErrors = validation ? validation.errors.length > 0 : false
  const canConfirm =
    validation?.valid && !hasErrors && unresolvedConflicts.length === 0

  function handleConfirm() {
    if (!validation || !canConfirm) return
    const { result } = mergeImportedWidgets(currentPlugins, validation.widgets, resolutions)
    onConfirm(result)
    toast.success(t('store.widgetsImported'))
    handleClose()
  }

  if (!open) return null

  const newWidgets = validation?.valid
    ? validation.widgets.filter((w) => !currentPlugins.some((p) => p.id === w.id))
    : []

  return (
    <CyberModalBackdrop open={open}>
      <motion.div
        className="w-full max-w-lg bg-card border border-primary/30 font-mono relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Corner ornaments */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

        <div className="p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-primary text-lg tracking-widest uppercase">
              ▸ {t('store.importWidgets')}
            </h2>
            <CyberCloseButton onClick={handleClose} />
          </div>

          {/* Step 1: Input – File or Paste */}
          <div className="border border-primary/20 bg-background/40 p-4 flex flex-col gap-3">
            <p className="text-primary text-xs tracking-wider uppercase">
              {t('store.importStep1')}
            </p>

            {/* File drop zone */}
            <div
              className="border border-dashed border-primary/30 rounded p-4 text-center text-xs text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <UploadSimple size={20} className="mx-auto mb-2 text-primary/60" />
              <p>{t('store.importDropHint')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 text-muted-foreground/40 text-xs">
              <div className="flex-1 h-px bg-primary/10" />
              <span>{t('store.importOr')}</span>
              <div className="flex-1 h-px bg-primary/10" />
            </div>

            {/* Paste toggle */}
            <button
              onClick={() => setShowPaste((v) => !v)}
              className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary transition-colors"
            >
              <ClipboardText size={14} />
              {t('store.importPaste')}
            </button>

            <AnimatePresence>
              {showPaste && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={5}
                    className="w-full bg-secondary border border-input rounded px-3 py-2 text-xs font-mono text-foreground resize-y"
                    placeholder='{ "exportType": "widgets", ... }'
                    spellCheck={false}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs border-primary/40 text-primary hover:bg-primary/10"
                    onClick={handlePasteSubmit}
                    disabled={!pasteText.trim()}
                  >
                    {t('store.importPasteApply')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 2: Validation result */}
          {validation && (
            <div className="border border-primary/20 bg-background/40 p-4 flex flex-col gap-3">
              <p className="text-primary text-xs tracking-wider uppercase">{t('store.importStep2')}</p>

              {/* Errors */}
              {validation.errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-destructive text-xs">
                  <X size={14} className="shrink-0 mt-0.5" />
                  <span>{e}</span>
                </div>
              ))}

              {/* Warnings */}
              {validation.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-yellow-400 text-xs">
                  <Warning size={14} className="shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}

              {validation.valid && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info size={14} className="shrink-0 mt-0.5 text-primary/60" />
                  <span>
                    {t('store.importSummary')
                      .replace('{0}', String(newWidgets.length))
                      .replace('{1}', String(conflicts.length))}
                  </span>
                </div>
              )}

              {/* New widgets list */}
              {newWidgets.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">{t('store.importNewWidgets')}:</p>
                  {newWidgets.map((w) => (
                    <div key={w.id} className="flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle size={12} />
                      <span>{w.name}</span>
                      <span className="text-muted-foreground/50">v{w.version}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Conflict resolution */}
          {conflicts.length > 0 && (
            <div className="border border-yellow-500/30 bg-background/40 p-4 flex flex-col gap-3">
              <p className="text-yellow-400 text-xs tracking-wider uppercase">{t('store.importStep3')}</p>
              <div className="flex flex-col gap-3">
                {conflicts.map((conflict) => {
                  const resolution = resolutions[conflict.id]
                  return (
                    <div key={conflict.id} className="flex flex-col gap-1.5">
                      <p className="text-xs text-foreground font-medium">{conflict.name}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setResolution(conflict.id, 'skip')}
                          className={`flex-1 text-xs py-1.5 px-2 border transition-colors rounded ${
                            resolution === 'skip'
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-primary/20 text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {t('store.conflictSkip')}
                        </button>
                        <button
                          onClick={() => setResolution(conflict.id, 'replace')}
                          className={`flex-1 text-xs py-1.5 px-2 border transition-colors rounded ${
                            resolution === 'replace'
                              ? 'border-yellow-500 bg-yellow-500/15 text-yellow-400'
                              : 'border-primary/20 text-muted-foreground hover:border-yellow-500/40'
                          }`}
                        >
                          {t('store.conflictReplace')}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {unresolvedConflicts.length > 0 && (
                <p className="text-xs text-yellow-400/70">
                  {t('store.conflictUnresolved').replace('{0}', String(unresolvedConflicts.length))}
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 text-xs font-mono"
              onClick={handleClose}
            >
              <X size={14} className="mr-1" />
              {t('store.importCancel')}
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/80 text-xs font-mono disabled:opacity-40"
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              {t('store.importConfirm')}
            </Button>
          </div>
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
