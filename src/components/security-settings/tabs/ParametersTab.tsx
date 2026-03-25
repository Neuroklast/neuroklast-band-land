/**
 * @file ParametersTab.tsx
 *
 * "PARAMETERS" tab of the Security Settings dialog.
 *
 * Renders numeric sliders for thresholds, timing, scoring points, and
 * text inputs for alert channels (Discord webhook, email).
 */

import { ChartLine, ShieldWarning, BellRinging } from '@phosphor-icons/react'
import { t, tip } from '@/lib/i18n-security'
import {
  SliderRow,
  TextInputRow,
} from '@/components/security-settings/SecuritySettingsPrimitives'
import type { SecuritySettings } from '@/lib/security-settings-types'
import type { Locale } from '@/lib/i18n-security'

export interface ParametersTabProps {
  settings: SecuritySettings
  update: <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => void
  locale: Locale
}

/**
 * Numeric parameter sliders and alert-channel text inputs.
 *
 * All sliders enforce server-validated min/max bounds (matching the Zod schema
 * in `api/security-settings.ts`) so the UI acts as the first validation layer.
 */
export function ParametersTab({ settings, update, locale }: ParametersTabProps) {
  const L = (key: string) => t(key, locale)
  const LT = (key: string) => tip(key, locale)

  return (
    <div className="space-y-0">
      <SliderRow
        label={L('param.autoBlockThreshold')}
        description={L('param.autoBlockThresholdDesc')}
        tooltip={LT('param.autoBlockThreshold')}
        value={settings.autoBlockThreshold}
        onChange={(v) => update('autoBlockThreshold', v)}
        min={3}
        max={50}
        step={1}
        unit="pts"
      />
      <SliderRow
        label={L('param.maxAlerts')}
        description={L('param.maxAlertsDesc')}
        value={settings.maxAlertsStored}
        onChange={(v) => update('maxAlertsStored', v)}
        min={10}
        max={10000}
        step={10}
      />
      <SliderRow
        label={L('param.tarpitMin')}
        description={L('param.tarpitMinDesc')}
        tooltip={LT('param.tarpitMin')}
        value={settings.tarpitMinMs}
        onChange={(v) => update('tarpitMinMs', v)}
        min={0}
        max={30000}
        step={500}
        unit="ms"
      />
      <SliderRow
        label={L('param.tarpitMax')}
        description={L('param.tarpitMaxDesc')}
        tooltip={LT('param.tarpitMax')}
        value={settings.tarpitMaxMs}
        onChange={(v) => update('tarpitMaxMs', v)}
        min={0}
        max={60000}
        step={500}
        unit="ms"
      />
      <SliderRow
        label={L('param.sessionTtl')}
        description={L('param.sessionTtlDesc')}
        tooltip={LT('param.sessionTtl')}
        value={settings.sessionTtlSeconds}
        onChange={(v) => update('sessionTtlSeconds', v)}
        min={300}
        max={86400}
        step={300}
        unit="s"
      />

      {/* Threat Level Thresholds */}
      <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mt-4 mb-2 flex items-center gap-2">
        <ChartLine size={14} />
        {L('param.thresholds')}
      </h3>
      <SliderRow
        label={L('param.warnThreshold')}
        description={L('param.warnThresholdDesc')}
        tooltip={LT('param.warnThreshold')}
        value={settings.warnThreshold}
        onChange={(v) => update('warnThreshold', v)}
        min={1}
        max={50}
        step={1}
        unit="pts"
      />
      <SliderRow
        label={L('param.tarpitThreshold')}
        description={L('param.tarpitThresholdDesc')}
        tooltip={LT('param.tarpitThreshold')}
        value={settings.tarpitThreshold}
        onChange={(v) => update('tarpitThreshold', v)}
        min={2}
        max={50}
        step={1}
        unit="pts"
      />

      {/* Threat Reason Points */}
      <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mt-4 mb-2 flex items-center gap-2">
        <ShieldWarning size={14} />
        {L('param.reasonPoints')}
      </h3>
      <SliderRow
        label={L('param.pointsHoneytoken')}
        description={L('param.pointsHoneytokenDesc')}
        value={settings.pointsHoneytokenAccess}
        onChange={(v) => update('pointsHoneytokenAccess', v)}
        min={0}
        max={20}
        step={1}
        unit="pts"
      />
      <SliderRow
        label={L('param.pointsSuspiciousUa')}
        description={L('param.pointsSuspiciousUaDesc')}
        value={settings.pointsSuspiciousUa}
        onChange={(v) => update('pointsSuspiciousUa', v)}
        min={0}
        max={20}
        step={1}
        unit="pts"
      />
      <SliderRow
        label={L('param.pointsRobotsViolation')}
        description={L('param.pointsRobotsViolationDesc')}
        value={settings.pointsRobotsViolation}
        onChange={(v) => update('pointsRobotsViolation', v)}
        min={0}
        max={20}
        step={1}
        unit="pts"
      />
      <SliderRow
        label={L('param.pointsMissingHeaders')}
        description={L('param.pointsMissingHeadersDesc')}
        value={settings.pointsMissingHeaders}
        onChange={(v) => update('pointsMissingHeaders', v)}
        min={0}
        max={20}
        step={1}
        unit="pts"
      />
      <SliderRow
        label={L('param.pointsRateLimit')}
        description={L('param.pointsRateLimitDesc')}
        value={settings.pointsRateLimitExceeded}
        onChange={(v) => update('pointsRateLimitExceeded', v)}
        min={0}
        max={20}
        step={1}
        unit="pts"
      />
      <SliderRow
        label={L('param.pointsGenericAccept')}
        description={L('param.pointsGenericAcceptDesc')}
        value={settings.pointsGenericAccept}
        onChange={(v) => update('pointsGenericAccept', v)}
        min={0}
        max={20}
        step={1}
        unit="pts"
      />

      {/* Alert Channels */}
      <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mt-4 mb-2 flex items-center gap-2">
        <BellRinging size={14} />
        {L('param.alertChannels')}
      </h3>
      <TextInputRow
        label={L('param.discordWebhook')}
        description={L('param.discordWebhookDesc')}
        tooltip={LT('param.discordWebhook')}
        value={settings.discordWebhookUrl}
        onChange={(v) => update('discordWebhookUrl', v)}
        placeholder="https://discord.com/api/webhooks/..."
      />
      <TextInputRow
        label={L('param.alertEmail')}
        description={L('param.alertEmailDesc')}
        tooltip={LT('param.alertEmail')}
        value={settings.alertEmail}
        onChange={(v) => update('alertEmail', v)}
        placeholder="admin@example.com"
      />
    </div>
  )
}
