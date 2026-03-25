/**
 * @file CountermeasuresTab.tsx
 *
 * "COUNTERMEASURES" tab of the Security Settings dialog, plus the
 * always-visible Scanner Detection, Path Traversal, and Probe Detection
 * sections that appear below all tabs.
 *
 * Also renders the action buttons (Save, Export JSON, Reset) and the footer.
 *
 * WHY this grouping: The scanner/path/probe panels and the action bar are
 * rendered outside the tab container in the original markup (always visible),
 * but placing them in this file keeps all settings-related JSX together
 * without the main dialog file needing to know about individual settings keys.
 */

import { Database, FileText, Detective, Bug, ShieldCheck } from '@phosphor-icons/react'
import { t, tip } from '@/lib/i18n-security'
import { ToggleRow } from '@/components/security-settings/SecuritySettingsPrimitives'
import type { SecuritySettings } from '@/lib/security-settings-types'
import type { Locale } from '@/lib/i18n-security'

// ─── Countermeasures tab ──────────────────────────────────────────────────────

export interface CountermeasuresTabProps {
  settings: SecuritySettings
  update: <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => void
  locale: Locale
}

/**
 * Offensive countermeasure settings: SQL Backfire, Canary Documents, and
 * Log Poisoning — all marked "⚠ OFFENSIVE" and disabled by default.
 */
export function CountermeasuresTab({ settings, update, locale }: CountermeasuresTabProps) {
  const L = (key: string) => t(key, locale)
  const LT = (key: string) => tip(key, locale)

  return (
    <div className="space-y-4">
      {/* SQL Injection Backfire */}
      <div className="space-y-0">
        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
          <Database size={14} />
          {L('settings.sqlBackfire')}
        </h3>
        <ToggleRow
          icon={Database}
          label={L('mod.sqlBackfire')}
          description={L('mod.sqlBackfireDesc')}
          tooltip={LT('mod.sqlBackfire')}
          checked={settings.sqlBackfireEnabled}
          onChange={(v) => update('sqlBackfireEnabled', v)}
          badge="⚠ OFFENSIVE"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.sqlBackfireOnScanner')}
          description={L('rules.sqlBackfireOnScannerDesc')}
          checked={settings.sqlBackfireOnScannerDetection}
          onChange={(v) => update('sqlBackfireOnScannerDetection', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.sqlBackfireOnHoneytoken')}
          description={L('rules.sqlBackfireOnHoneytokenDesc')}
          checked={settings.sqlBackfireOnHoneytokenAccess}
          onChange={(v) => update('sqlBackfireOnHoneytokenAccess', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
      </div>

      {/* Canary Documents */}
      <div className="space-y-0">
        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
          <FileText size={14} />
          {L('settings.canaryDocuments')}
        </h3>
        <ToggleRow
          icon={FileText}
          label={L('mod.canaryDocuments')}
          description={L('mod.canaryDocumentsDesc')}
          tooltip={LT('mod.canaryDocuments')}
          checked={settings.canaryDocumentsEnabled}
          onChange={(v) => update('canaryDocumentsEnabled', v)}
          badge="⚠ OFFENSIVE"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.canaryPhoneHome')}
          description={L('rules.canaryPhoneHomeDesc')}
          checked={settings.canaryPhoneHomeOnOpen}
          onChange={(v) => update('canaryPhoneHomeOnOpen', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.canaryFingerprint')}
          description={L('rules.canaryFingerprintDesc')}
          checked={settings.canaryCollectFingerprint}
          onChange={(v) => update('canaryCollectFingerprint', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.canaryAlert')}
          description={L('rules.canaryAlertDesc')}
          checked={settings.canaryAlertOnCallback}
          onChange={(v) => update('canaryAlertOnCallback', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
      </div>

      {/* Log Poisoning */}
      <div className="space-y-0">
        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
          <Detective size={14} />
          {L('settings.logPoisoning')}
        </h3>
        <ToggleRow
          icon={Detective}
          label={L('mod.logPoisoning')}
          description={L('mod.logPoisoningDesc')}
          tooltip={LT('mod.logPoisoning')}
          checked={settings.logPoisoningEnabled}
          onChange={(v) => update('logPoisoningEnabled', v)}
          badge="⚠ OFFENSIVE"
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.logPoisonFakeHeaders')}
          description={L('rules.logPoisonFakeHeadersDesc')}
          checked={settings.logPoisonFakeHeaders}
          onChange={(v) => update('logPoisonFakeHeaders', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.logPoisonTerminal')}
          description={L('rules.logPoisonTerminalDesc')}
          checked={settings.logPoisonTerminalEscape}
          onChange={(v) => update('logPoisonTerminalEscape', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
        <ToggleRow
          label={L('rules.logPoisonFakePaths')}
          description={L('rules.logPoisonFakePathsDesc')}
          checked={settings.logPoisonFakePaths}
          onChange={(v) => update('logPoisonFakePaths', v)}
          statusActive={L('settings.active')}
          statusDisabled={L('settings.disabled')}
        />
      </div>
    </div>
  )
}

// ─── Always-visible detection panels ─────────────────────────────────────────

export interface DetectionPanelsProps {
  settings: SecuritySettings
  update: <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => void
  locale: Locale
}

/**
 * Scanner Detection, Path Traversal Backfire, and Probe Detection panels.
 *
 * These sections are rendered outside the tab container (always visible) to
 * make them harder to miss — they apply across all modules and require
 * deliberate opt-in for the aggressive backfire variants.
 */
export function DetectionPanels({ settings, update, locale }: DetectionPanelsProps) {
  const L = (key: string) => t(key, locale)

  return (
    <>
      {/* Scanner Detection */}
      <div className="border border-primary/20 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Detective size={14} className="text-primary/60" />
          <span className="text-[11px] font-mono text-primary/60 uppercase tracking-wider">
            {L('sections.scannerDetection') || 'Scanner Detection'}
          </span>
        </div>
        <div className="space-y-2 pl-4">
          <ToggleRow
            label={L('settings.scannerDetection') || 'Scanner & Tool Identification'}
            description={
              L('settings.scannerDetectionDesc') ||
              'Identify 50+ attack tools (sqlmap, nikto, ffuf, nuclei…) by UA + behavioral signals. Applies threat multiplier (×2–×3) to known tools and logs SCANNER_DETECTED.'
            }
            checked={settings.scannerDetectionEnabled}
            onChange={(v) => update('scannerDetectionEnabled', v)}
            statusActive={L('settings.active')}
            statusDisabled={L('settings.disabled')}
          />
        </div>
      </div>

      {/* Path Traversal Backfire */}
      <div className="border border-primary/20 p-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-primary/60" />
          <span className="text-[11px] font-mono text-primary/60 uppercase tracking-wider">
            {L('sections.pathTraversal') || 'Path Traversal Backfire'}
          </span>
        </div>
        <div className="space-y-2 pl-4">
          <ToggleRow
            label={L('settings.pathTraversalBackfire') || 'LFI / Path Traversal Backfire'}
            description={
              L('settings.pathTraversalBackfireDesc') ||
              'Detect ../  %2e%2e  /etc/passwd  .env  wp-config.php and similar probes.'
            }
            checked={settings.pathTraversalBackfireEnabled}
            onChange={(v) => update('pathTraversalBackfireEnabled', v)}
            statusActive={L('settings.active')}
            statusDisabled={L('settings.disabled')}
          />
          <ToggleRow
            label={L('rules.pathTraversalServeFakeFiles') || 'Serve Fake Files with Canary Tokens'}
            description={
              L('rules.pathTraversalServeFakeFilesDesc') ||
              'Respond with convincing fake /etc/passwd, .env, wp-config.php files containing embedded canary tokens. Wastes attacker time and triggers alerts if credentials are used.'
            }
            checked={settings.pathTraversalServeFakeFiles}
            onChange={(v) => update('pathTraversalServeFakeFiles', v)}
            statusActive={L('settings.active')}
            statusDisabled={L('settings.disabled')}
          />
        </div>
      </div>

      {/* Probe Detection */}
      <div className="border border-primary/20 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Bug size={14} className="text-primary/60" />
          <span className="text-[11px] font-mono text-primary/60 uppercase tracking-wider">
            {L('sections.probeDetection') || 'Probe Detection'}
          </span>
        </div>
        <div className="space-y-2 pl-4">
          <ToggleRow
            label={L('settings.probeDetection') || 'XSS / SSTI / SSRF / CMDi / XXE Detection'}
            description={
              L('settings.probeDetectionDesc') ||
              'Detect offensive probes in request parameters. Logs PROBE_BACKFIRE events with probe type and pattern.'
            }
            checked={settings.probeDetectionEnabled}
            onChange={(v) => update('probeDetectionEnabled', v)}
            statusActive={L('settings.active')}
            statusDisabled={L('settings.disabled')}
          />
          <ToggleRow
            label={L('rules.probeBackfire') || 'Active Probe Backfire'}
            description={
              L('rules.probeBackfireDesc') ||
              'Respond with type-specific backfire: XSS → reflected false-positive, SSTI → evaluated-looking output, SSRF → fake AWS metadata, CMDi → fake shell output, XXE → deeply-nested XML bomb.'
            }
            checked={settings.probeBackfireEnabled}
            onChange={(v) => update('probeBackfireEnabled', v)}
            statusActive={L('settings.active')}
            statusDisabled={L('settings.disabled')}
          />
        </div>
      </div>
    </>
  )
}

// ─── Action bar ───────────────────────────────────────────────────────────────

export interface SettingsActionBarProps {
  saving: boolean
  onSave: () => void
  onExport: () => void
  onReset: () => void
  locale: Locale
}

/**
 * Save / Export JSON / Reset Defaults button row at the bottom of the dialog.
 */
export function SettingsActionBar({
  saving,
  onSave,
  onExport,
  onReset,
  locale,
}: SettingsActionBarProps) {
  const L = (key: string) => t(key, locale)

  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex-1 bg-primary/80 hover:bg-primary text-white font-mono text-[11px] uppercase tracking-wider py-2 px-4 transition-colors disabled:opacity-50"
      >
        {saving ? L('settings.saving') : L('settings.save')}
      </button>
      <button
        onClick={onExport}
        className="bg-primary/10 hover:bg-primary/20 text-primary/70 font-mono text-[11px] uppercase tracking-wider py-2 px-4 transition-colors"
      >
        {L('settings.exportJson')}
      </button>
      <button
        onClick={onReset}
        className="bg-primary/10 hover:bg-primary/20 text-primary/70 font-mono text-[11px] uppercase tracking-wider py-2 px-4 transition-colors"
      >
        {L('settings.resetDefaults')}
      </button>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export interface SettingsFooterProps {
  locale: Locale
}

/**
 * Minimal footer shown at the bottom of the scrollable settings area.
 */
export function SettingsFooter({ locale }: SettingsFooterProps) {
  const L = (key: string) => t(key, locale)

  return (
    <div className="flex items-center gap-2 text-[9px] text-primary/40 pt-2 border-t border-primary/10">
      <ShieldCheck size={10} className="text-primary/40" />
      <span>{L('settings.footer')}</span>
    </div>
  )
}
