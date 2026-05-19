# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Next.js migration

- Migrated frontend stack from Vite SPA routing to **Next.js 15 App Router**.
- Added `app/layout.tsx`, `app/page.tsx`, `app/admin/page.tsx`, and `app/not-found.tsx`.
- Replaced `react-router-dom` navigation with Next.js router navigation.
- Replaced client env usage from `VITE_*` + `import.meta.env` to
  `NEXT_PUBLIC_*` + `process.env`.
- Removed Vite entry/config files: `index.html`, `vite.config.ts`, `src/main.tsx`,
  `src/AppRouter.tsx`, and `src/components/AdminRoute.tsx`.

### Added

- **`react-router-dom` v7** — Client-side routing added to the SPA.
  `src/main.tsx` wraps the tree in `<BrowserRouter>`.
  `src/AppRouter.tsx` owns the `<Routes>` tree: `/` → band site,
  `/admin/*` → admin panel, `*` → redirect to `/`.

- **`src/pages/AdminPage.tsx`** — Standalone admin panel at `/admin`.
  Renders `AdminLoginDialog` when unauthenticated and `AdminButton` +
  `AdminDialogManager` when authenticated. Uses the same `useSiteConfig` hook
  as the public site so changes are reflected immediately.

- **`src/components/AdminRoute.tsx`** — Route-level auth boundary for `/admin`.

- **`NEXT_PUBLIC_PRIMARY_HOSTNAMES` env var** — `src/lib/primary-check.ts` now reads
  a comma-separated list of primary hostnames from this env var.  When unset,
  falls back to the legacy hardcoded Neuroklast list for backward compatibility.

- **`PRIMARY_HOSTNAMES` env var** — Same as above, server-side
  (`api/_primary-check.ts`).

### Changed

- **`src/lib/activation.ts`** — `validateActivationKey()` returns
  `{ valid: true, tier: 'free', features: [] }` when `NEXT_PUBLIC_ACTIVATION_KEY` is
  not set.  Deployments without a key get a working free-tier result instead of
  a lock screen.

- **`src/hooks/use-activation-key.ts`** — When no key is configured, status is
  set to `'valid'` immediately without an API call.  The parallel
  `activation_status_cache` sessionStorage key was removed; caching is handled
  exclusively through `nk-activation-result` in `activation.ts`.

- **`src/App.tsx`** — `ActivationLockScreen` gate removed; `AdminButton`,
  `AdminDialogManager`, and both `AdminLoginDialog` instances removed.  The
  public band site is now a pure presentational page.  `useAppKeyboardShortcuts`
  updated: `#admin` hash and `CMD+K` / `CTRL+K` now `navigate('/admin')`.

- **`src/hooks/use-app-keyboard-shortcuts.ts`** — Signature simplified to
  `{ isOwner }` only; `setShowLoginDialog` / `setOpenAdminHubOnMount` removed.
  Uses `useNavigate` from react-router-dom.

- **`middleware.ts`** — Hardcoded `neuroklast.net` references in log messages
  replaced with generic `[SECURITY]` / `[MIDDLEWARE]` labels.

- **`vite.config.ts`** — `javascript-obfuscator` plugin block removed entirely.

### Removed

- **`src/components/KeyManagerPanel.tsx`** — SaaS-only key-issuance panel deleted
  from the client bundle.
- **`key-manager` dialog case** in `AdminDialogManager.tsx`.
- **`VITE_OBFUSCATE`** env var reference in `vite.config.ts`.
- **`javascript-obfuscator`** from `devDependencies` in `package.json`.
- **Activation lock screen** — `ActivationLockScreen` and `LicenseStatusBadge`
  no longer imported or rendered by `App.tsx`.


  theme foundations (`@theme`) extracted from `src/index.css` for faster initial parse.

- **`src/animations.css`** — CSS split: all `@keyframes` definitions and animation
  utility classes extracted from `src/index.css`. Imported after `base.css` to preserve
  specificity order.

- **`vite.config.ts` — `manualChunks`** — Vendor bundle splitting for long-term caching:
  - `vendor-react`: react, react-dom, react-is
  - `vendor-radix`: all @radix-ui packages
  - `vendor-three`: three, @react-three/fiber, @react-three/drei
  - `vendor-motion`: framer-motion
  - `vendor-charts`: recharts
  - `vendor-i18n`: i18next, react-i18next, i18next-browser-languagedetector, i18next-http-backend

- **`vite.config.ts` — Brotli/Gzip compression** — `vite-plugin-compression2` added for
  production builds: generates `.gz` (gzip) and `.br` (brotli) files alongside each
  asset, reducing transfer sizes by ~30 %.

- **`package.json`** — `vite-plugin-compression2` added as dev dependency.

### Changed

- **`src/App.tsx`** — Additional components converted to `React.lazy()` for code
  splitting: `AdminButton`, `AdminLoginDialog`, `AudioVisualizer`, `OverlayEffectsLayer`,
  `MovingScanline`, `SystemMonitorHUD`, `LicenseStatusBadge`. All wrapped in `<Suspense>`
  with appropriate fallbacks (`null` for invisible elements, `<CyberSpinner />` for
  blocking UI).

- **`src/index.css`** — Reduced from 2028 lines to 4 `@import` statements; content moved
  to `base.css` and `animations.css`. Rule order and specificity preserved.

- **`src/ErrorFallback.tsx`** — Replaced `lucide-react` imports (`AlertTriangleIcon`,
  `RefreshCwIcon`) with `@phosphor-icons/react` equivalents (`Warning`, `ArrowsClockwise`),
  removing the duplicate icon library dependency from the bundle.


  state and business logic (previously embedded in `SetupWizard.tsx`). Exports typed
  interfaces `SetupWizardState`, `SetupWizardActions`, and `UseSetupWizardReturn`.
  Helper functions `needsActivationStep`, `toPreviewUrl`, `loadGoogleFont`, and
  `loadAllGoogleFonts` are also exported for independent reuse and testing.

- **`src/lib/setup-wizard-constants.ts`** — Centralised constants module for the
  Setup Wizard feature: `FONT_OPTIONS`, `SITE_TYPES`, `STEPS_BASE`, `ACTIVATION_STEP`,
  `getWizardSteps()`, `ENV_WARNING_COLOR`, `ENV_WARNING_BG`, `SOCIAL_LINKS_INITIAL`,
  `SOCIAL_FIELDS`, and the `SocialLinksState` type.

- **`src/components/setup-wizard/WizardUIElements.tsx`** — Shared, stateless UI
  primitives for wizard steps: `Field`, `NavigationButtons`, `CornerDecorations`,
  `StepIndicator`, and `WizardColorInput`.

- **`src/components/setup-wizard/steps/ActivationStep.tsx`** — Step component for the
  activation-key gate (shown before setup when a licence is required).

- **`src/components/setup-wizard/steps/WelcomeStep.tsx`** — Step 0: introduction screen
  with ENV variable health check display.

- **`src/components/setup-wizard/steps/SiteTypeStep.tsx`** — Step 1: site-type selection
  (band, DJ, artist, label, portfolio, custom).

- **`src/components/setup-wizard/steps/BasicInfoStep.tsx`** — Step 2: site name, tagline,
  description, genres, domain.

- **`src/components/setup-wizard/steps/ThemeStep.tsx`** — Step 3: theme preset selection
  with live hover preview.

- **`src/components/setup-wizard/steps/ColorsStep.tsx`** — Step 4: colour customisation
  with real-time WCAG AA contrast feedback.

- **`src/components/setup-wizard/steps/FontsStep.tsx`** — Step 5: font selection for
  heading, body, and mono typefaces.

- **`src/components/setup-wizard/steps/LogoStep.tsx`** — Step 6: logo URL entry with
  file-upload and Google Drive link rewriting.

- **`src/components/setup-wizard/steps/SectionsStep.tsx`** — Step 7: section
  enable/disable and reorder with custom labels.

- **`src/components/setup-wizard/steps/SocialLinksStep.tsx`** — Step 8: social-media
  platform URL fields.

- **`src/components/setup-wizard/steps/LegalStep.tsx`** — Step 9: Impressum and
  Datenschutz data entry.

- **`src/components/setup-wizard/steps/PasswordStep.tsx`** — Step 10: admin password
  creation with strength validation.

- **`src/components/setup-wizard/steps/DoneStep.tsx`** — Step 11: completion
  confirmation screen.

- **`.github/ARCHITECTURE.md`** — Architecture Decision Records (ADR-001, ADR-002,
  ADR-003) documenting the Setup Wizard refactoring rationale, alternatives considered,
  and trade-offs.

- **`src/lib/security-settings-types.ts`** — New canonical module for the
  `SecuritySettings` TypeScript interface and `DEFAULT_SECURITY_SETTINGS` constant.
  Extracted from `SecuritySettingsDialog.tsx` to give type definitions a proper home
  outside a UI component (BFF boundary separation).

- **`src/hooks/use-security-settings.ts`** — New BFF client hook encapsulating all
  `/api/security-settings` fetch and save logic. Exports typed `SecuritySettingsState`,
  `SecuritySettingsActions`, and the derived `activeModules` count. Constants
  `TOTAL_MODULES`, `SECURITY_LEVEL_HIGH_THRESHOLD`, and `SECURITY_LEVEL_MEDIUM_THRESHOLD`
  are exported for independent use in tests and other consumers.

- **`src/components/security-settings/SecuritySettingsPrimitives.tsx`** — Stateless
  `ToggleRow`, `SliderRow`, and `TextInputRow` primitives, extracted from the dialog.

- **`src/components/security-settings/tabs/ModulesTab.tsx`** — Security module
  toggle panel (11 modules + Under Attack Mode emergency toggle).

- **`src/components/security-settings/tabs/ParametersTab.tsx`** — Numeric slider
  parameters for thresholds, timing, and threat-reason points; text inputs for alert
  channel configuration (Discord webhook, email).

- **`src/components/security-settings/tabs/RulesTab.tsx`** — Conditional trigger
  rules for tarpit and zip-bomb countermeasures.

- **`src/components/security-settings/tabs/CountermeasuresTab.tsx`** — Offensive
  countermeasure panels (SQL Backfire, Canary Documents, Log Poisoning), always-visible
  detection panels (Scanner, Path Traversal, Probe), action button bar, and footer.

- **`.github/ARCHITECTURE.md`** — ADR-004 added: documents the SecuritySettingsDialog
  BFF decomposition decision, module table, and trade-offs.

### Changed

- **`src/components/SecuritySettingsDialog.tsx`** — Reduced from **1 155 lines** to
  **244 lines**. The component is now a thin orchestration layer: it delegates all state
  and API communication to `useSecuritySettings`, and renders the dialog chrome plus tab
  routing. `SecuritySettings` type and `DEFAULT_SETTINGS` are re-exported from this file
  for backward compatibility with existing test imports. Visual output is **identical**
  to the previous version — same DOM elements, same CSS classes, same animations.

- **`src/components/SetupWizard.tsx`** — Reduced from **1 342 lines** to **370 lines**.
  The component is now a thin orchestration layer: it calls `useSetupWizard`, maps the
  current step index to a step component, and renders the animation shell. Business logic
  and state management have been fully extracted into `use-setup-wizard.ts`. Visual
  output is **identical** to the previous version — same DOM elements, same CSS classes,
  same animations. No breaking changes to the public `SetupWizardProps` interface.

### Fixed

- Unused import warnings in the refactored hook (`toggleSection`, `reorderSections`,
  `SOCIAL_LINKS_INITIAL` were imported but not needed in the hook file; they are now
  imported only in the step components that use them).
