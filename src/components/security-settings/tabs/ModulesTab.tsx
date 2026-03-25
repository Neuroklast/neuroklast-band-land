/**
 * @file ModulesTab.tsx
 *
 * "MODULES" tab of the Security Settings dialog.
 *
 * Renders the primary on/off toggles for all 11 security modules plus the
 * emergency "Under Attack Mode" toggle. Each toggle directly calls the parent's
 * `update` handler — no local state.
 */

import {
  ShieldCheck,
  ShieldWarning,
  Lock,
  Bug,
  Robot,
  Fingerprint,
  ChartLine,
  ProhibitInset,
  Package,
  BellRinging,
} from '@phosphor-icons/react'
import { t, tip } from '@/lib/i18n-security'
import { ToggleRow } from '@/components/security-settings/SecuritySettingsPrimitives'
import type { SecuritySettings } from '@/lib/security-settings-types'
import type { Locale } from '@/lib/i18n-security'

export interface ModulesTabProps {
  settings: SecuritySettings
  update: <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => void
  locale: Locale
}

/**
 * Security modules toggle panel.
 *
 * Intentionally has no local state — all updates flow up via `update` to
 * `useSecuritySettings`, which owns the canonical settings object.
 */
export function ModulesTab({ settings, update, locale }: ModulesTabProps) {
  const L = (key: string) => t(key, locale)
  const LT = (key: string) => tip(key, locale)

  return (
    <div className="space-y-0">
      {/* Under Attack Mode — emergency toggle with dedicated border */}
      <div className="border border-status-error-em/30 bg-status-error-em/5 p-3 mb-3">
        <ToggleRow
          icon={ShieldWarning}
          label={L('mod.underAttack')}
          description={L('mod.underAttackDesc')}
          tooltip={LT('mod.underAttack')}
          checked={settings.underAttackMode}
          onChange={(v) => update('underAttackMode', v)}
          badge="⚠ EMERGENCY"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
      </div>

      <ToggleRow
        icon={Bug}
        label={L('mod.honeytoken')}
        description={L('mod.honeytokenDesc')}
        tooltip={LT('mod.honeytoken')}
        checked={settings.honeytokensEnabled}
        onChange={(v) => update('honeytokensEnabled', v)}
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
      <ToggleRow
        icon={ShieldCheck}
        label={L('mod.rateLimit')}
        description={L('mod.rateLimitDesc')}
        tooltip={LT('mod.rateLimit')}
        checked={settings.rateLimitEnabled}
        onChange={(v) => update('rateLimitEnabled', v)}
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
      <ToggleRow
        icon={Robot}
        label={L('mod.robotsTrap')}
        description={L('mod.robotsTrapDesc')}
        tooltip={LT('mod.robotsTrap')}
        checked={settings.robotsTrapEnabled}
        onChange={(v) => update('robotsTrapEnabled', v)}
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
      <ToggleRow
        icon={ChartLine}
        label={L('mod.threatScoring')}
        description={L('mod.threatScoringDesc')}
        tooltip={LT('mod.threatScoring')}
        checked={settings.threatScoringEnabled}
        onChange={(v) => update('threatScoringEnabled', v)}
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
      <ToggleRow
        icon={ProhibitInset}
        label={L('mod.hardBlock')}
        description={L('mod.hardBlockDesc')}
        tooltip={LT('mod.hardBlock')}
        checked={settings.hardBlockEnabled}
        onChange={(v) => update('hardBlockEnabled', v)}
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
      <ToggleRow
        icon={Lock}
        label={L('mod.entropy')}
        description={L('mod.entropyDesc')}
        tooltip={LT('mod.entropy')}
        checked={settings.entropyInjectionEnabled}
        onChange={(v) => update('entropyInjectionEnabled', v)}
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
      <ToggleRow
        icon={Package}
        label={L('mod.zipBomb')}
        description={L('mod.zipBombDesc')}
        tooltip={LT('mod.zipBomb')}
        checked={settings.zipBombEnabled}
        onChange={(v) => update('zipBombEnabled', v)}
        badge="⚠ AGGRESSIVE"
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
      <ToggleRow
        icon={BellRinging}
        label={L('mod.alerting')}
        description={L('mod.alertingDesc')}
        tooltip={LT('mod.alerting')}
        checked={settings.alertingEnabled}
        onChange={(v) => update('alertingEnabled', v)}
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
      <ToggleRow
        icon={ShieldWarning}
        label={L('mod.suspiciousUa')}
        description={L('mod.suspiciousUaDesc')}
        tooltip={LT('mod.suspiciousUa')}
        checked={settings.suspiciousUaBlockingEnabled}
        onChange={(v) => update('suspiciousUaBlockingEnabled', v)}
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
      <ToggleRow
        icon={Fingerprint}
        label={L('mod.sessionBinding')}
        description={L('mod.sessionBindingDesc')}
        tooltip={LT('mod.sessionBinding')}
        checked={settings.sessionBindingEnabled}
        onChange={(v) => update('sessionBindingEnabled', v)}
        statusActive={L('settings.active')}
        statusDisabled={L('settings.disabled')}
      />
    </div>
  )
}
