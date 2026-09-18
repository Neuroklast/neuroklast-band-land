'use client'

import { LatchRail } from '@/components/motion/LatchRail'
import { useLocale } from '@/contexts/LocaleContext'

export function TerminalSliderAuth({
  reducedMotion,
  granted,
  onGranted,
}: {
  reducedMotion: boolean
  granted: boolean
  onGranted: () => void
}) {
  const { t } = useLocale()
  return (
    <LatchRail
      reducedMotion={reducedMotion}
      granted={granted}
      onGranted={onGranted}
      ariaLabel={t('secretTerminal.authSlideAria')}
      label={t('secretTerminal.authSlide')}
      grantedLabel={t('secretTerminal.authGranted')}
    />
  )
}
