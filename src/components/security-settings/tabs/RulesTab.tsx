/**
 * @file RulesTab.tsx
 *
 * "RULES" tab of the Security Settings dialog.
 *
 * Renders conditional trigger rules for two countermeasure groups:
 *   - Tarpit rules: which events trigger a connection delay
 *   - Zip Bomb rules: which events trigger a zip-bomb response (⚠ AGGRESSIVE)
 */

import { Lightning, Package } from '@phosphor-icons/react'
import { t, tip } from '@/lib/i18n-security'
import { ToggleRow } from '@/components/security-settings/SecuritySettingsPrimitives'
import type { SecuritySettings } from '@/lib/security-settings-types'
import type { Locale } from '@/lib/i18n-security'

export interface RulesTabProps {
  settings: SecuritySettings
  update: <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => void
  locale: Locale
}

/**
 * Trigger-rule toggles for tarpit and zip-bomb countermeasures.
 *
 * Zip-bomb rules are marked "⚠ AGGRESSIVE" to indicate they send a malicious
 * payload — they should only be enabled deliberately.
 */
export function RulesTab({ settings, update, locale }: RulesTabProps) {
  const L = (key: string) => t(key, locale)
  const LT = (key: string) => tip(key, locale)

  return (
    <div className="space-y-4">
      {/* Tarpit Rules */}
      <div className="space-y-0">
        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
          <Lightning size={14} />
          {L('rules.tarpitRulesHeader')}
        </h3>
        <ToggleRow
          label={L('rules.tarpitOnWarn')}
          description={L('rules.tarpitOnWarnDesc')}
          tooltip={LT('rules.tarpitOnWarn')}
          checked={settings.tarpitOnWarn}
          onChange={(v) => update('tarpitOnWarn', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.tarpitOnSuspiciousUa')}
          description={L('rules.tarpitOnSuspiciousUaDesc')}
          tooltip={LT('rules.tarpitOnSuspiciousUa')}
          checked={settings.tarpitOnSuspiciousUa}
          onChange={(v) => update('tarpitOnSuspiciousUa', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.tarpitOnRobotsViolation')}
          description={L('rules.tarpitOnRobotsViolationDesc')}
          tooltip={LT('rules.tarpitOnRobotsViolation')}
          checked={settings.tarpitOnRobotsViolation}
          onChange={(v) => update('tarpitOnRobotsViolation', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.tarpitOnHoneytoken')}
          description={L('rules.tarpitOnHoneytokenDesc')}
          tooltip={LT('rules.tarpitOnHoneytoken')}
          checked={settings.tarpitOnHoneytoken}
          onChange={(v) => update('tarpitOnHoneytoken', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.tarpitOnBlock')}
          description={L('rules.tarpitOnBlockDesc')}
          tooltip={LT('rules.tarpitOnBlock')}
          checked={settings.tarpitOnBlock}
          onChange={(v) => update('tarpitOnBlock', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
      </div>

      {/* Zip Bomb Rules */}
      <div className="space-y-0">
        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
          <Package size={14} />
          {L('rules.zipBombRulesHeader')}
        </h3>
        <ToggleRow
          label={L('rules.zipBombOnBlock')}
          description={L('rules.zipBombOnBlockDesc')}
          tooltip={LT('rules.zipBombOnBlock')}
          checked={settings.zipBombOnBlock}
          onChange={(v) => update('zipBombOnBlock', v)}
          badge="⚠ AGGRESSIVE"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.zipBombOnHoneytoken')}
          description={L('rules.zipBombOnHoneytokenDesc')}
          tooltip={LT('rules.zipBombOnHoneytoken')}
          checked={settings.zipBombOnHoneytoken}
          onChange={(v) => update('zipBombOnHoneytoken', v)}
          badge="⚠ AGGRESSIVE"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.zipBombOnRepeatOffender')}
          description={L('rules.zipBombOnRepeatOffenderDesc')}
          tooltip={LT('rules.zipBombOnRepeatOffender')}
          checked={settings.zipBombOnRepeatOffender}
          onChange={(v) => update('zipBombOnRepeatOffender', v)}
          badge="⚠ AGGRESSIVE"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.zipBombOnRobotsViolation')}
          description={L('rules.zipBombOnRobotsViolationDesc')}
          tooltip={LT('rules.zipBombOnRobotsViolation')}
          checked={settings.zipBombOnRobotsViolation}
          onChange={(v) => update('zipBombOnRobotsViolation', v)}
          badge="⚠ AGGRESSIVE"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.zipBombOnSuspiciousUa')}
          description={L('rules.zipBombOnSuspiciousUaDesc')}
          tooltip={LT('rules.zipBombOnSuspiciousUa')}
          checked={settings.zipBombOnSuspiciousUa}
          onChange={(v) => update('zipBombOnSuspiciousUa', v)}
          badge="⚠ AGGRESSIVE"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.zipBombOnRateLimit')}
          description={L('rules.zipBombOnRateLimitDesc')}
          tooltip={LT('rules.zipBombOnRateLimit')}
          checked={settings.zipBombOnRateLimit}
          onChange={(v) => update('zipBombOnRateLimit', v)}
          badge="⚠ AGGRESSIVE"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
      </div>
    </div>
  )
}
