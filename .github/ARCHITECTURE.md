# Architecture Decision Records

This document captures significant architectural decisions for the Neuroklast Band Land project,
following the ADR (Architecture Decision Record) format.

---

## ADR-001: Extract Setup Wizard Logic into a Custom Hook

**Date:** 2026-03-25
**Status:** Accepted
**Author:** Principal Software Architect

### Context

`src/components/SetupWizard.tsx` had grown to **1 342 lines** in a single file, combining:

- ~75 lines of `useState` declarations (30+ state variables)
- ~280 lines of business logic: async activation-key validation, theme application,
  file reading, config assembly, password validation, and environment checks
- ~750 lines of step-specific JSX spread across a `switch/renderStep` function
- ~45 lines of layout/animation shell

This violated the **Single Responsibility Principle** (ISO/IEC 25010 – Maintainability)
and made the logic impossible to unit-test without rendering the full component.
The large file also created frequent merge conflicts and slowed IDE navigation.

### Decision

Decompose `SetupWizard.tsx` into the following modules:

| File | Responsibility | Max lines |
|------|---------------|-----------|
| `src/hooks/use-setup-wizard.ts` | All state + business logic | ~360 |
| `src/lib/setup-wizard-constants.ts` | Compile-time constants (fonts, site-types, steps) | ~140 |
| `src/components/setup-wizard/WizardUIElements.tsx` | Reusable UI primitives (Field, NavigationButtons, etc.) | ~145 |
| `src/components/setup-wizard/steps/*.tsx` | One component per wizard step (11 files) | ≤120 each |
| `src/components/SetupWizard.tsx` (refactored) | Orchestration: hook → step dispatch → layout | ~370 |

The hook (`useSetupWizard`) exposes two typed interfaces:
- `SetupWizardState` – all observable state
- `SetupWizardActions` – all action handlers (callbacks, setters)

The main component consumes the hook and passes only the required slice of state to
each step component (no prop-drilling beyond two levels).

### Consequences

**Positive:**
- Each file now has a single responsibility and is under 400 lines.
- Business logic (`useSetupWizard`) can be unit-tested without a DOM.
- Each step component is independently renderable and testable.
- Shared constants and UI primitives are discoverable without reading 1 300+ lines.
- TypeScript strict mode covers the entire extraction (no `any`).

**Negative / Trade-offs:**
- The `SetupWizard.tsx` component still passes many props to `renderStep`, because
  each step needs its own slice of wizard state. A future improvement could introduce
  a `WizardContext` to avoid the explicit prop-passing, but this was deferred to keep
  the current change set minimal and reviewable.
- The `renderStep` function signature takes the entire hook return value, which is a
  wide object. This is an intentional interim step; individual step components still
  receive only the props they need.

### Alternatives Considered

1. **React Context for wizard state** – Would eliminate the wide-object prop, but adds
   indirection and makes data-flow harder to trace during code review. Deferred.
2. **Keep all JSX in one file, extract only the hook** – Would leave the file at ~900
   lines. Accepted as a minimum, but the step extraction was also done to meet the
   300-line guideline.
3. **XState or Zustand for wizard state** – Adds a library dependency. The hook approach
   achieves the same goals with only React primitives.

---

## ADR-002: Centralise Setup Wizard Constants

**Date:** 2026-03-25
**Status:** Accepted

### Context

`FONT_OPTIONS`, `SITE_TYPES`, `STEPS_BASE`, `SOCIAL_FIELDS`, and colour constants
were defined inline in `SetupWizard.tsx`. As step components were extracted, each
would need to import these constants — creating a risk of circular imports if they
imported from the component file.

### Decision

Move all compile-time constants to `src/lib/setup-wizard-constants.ts`.
This module has no React dependency and can be imported by hooks, components, and
tests alike.

### Consequences

- Zero circular-import risk.
- Constants are independently testable.
- `setup-wizard-constants.ts` exports TypeScript interfaces (`FontOption`, `SiteTypeOption`,
  `SocialLinksState`) that serve as the canonical type source.

---

## ADR-003: Font-Loading Utilities Kept in Hook, Not in font-loader.ts

**Date:** 2026-03-25
**Status:** Accepted

### Context

`font-loader.ts` already provides a sophisticated `FontEntry`/`FontConfig` type system
for the theme engine. The wizard uses a simpler string-label-based API (`loadGoogleFont`,
`loadAllGoogleFonts`) that does not fit the `FontEntry` model.

### Decision

Export `loadGoogleFont` and `loadAllGoogleFonts` from `use-setup-wizard.ts` rather
than merging the two APIs into `font-loader.ts`. The two systems serve different layers:
- `font-loader.ts` → theme engine (structured type system)
- `use-setup-wizard.ts` → wizard font picker (simple lazy injection)

A future migration could unify them, but doing so would require updating the theme engine
and its tests — out of scope for this refactoring.

### Consequences

- No changes to `font-loader.ts` or its tests.
- Minor duplication of `<link>` injection logic (acceptable at this scale).

---

## ADR-004: SecuritySettingsDialog Decomposed into BFF Hook + Tab Components

**Date:** 2026-03-25
**Status:** Accepted

### Context

`SecuritySettingsDialog.tsx` was 1 155 lines, mixing:
- `SecuritySettings` TypeScript interface
- `DEFAULT_SETTINGS` constant
- Three primitive UI components (`ToggleRow`, `SliderRow`, `TextInputRow`)
- Business logic: `fetch('/api/security-settings')`, save, reset, JSON export
- JSX for four tab panels (modules, parameters, rules, countermeasures)
- JSX for always-visible scanner/path/probe detection sections

The problem statement (BFF / Backend for Frontend) highlighted that security
defaults must be authoritative on the server, not defined in a UI component.
Having `DEFAULT_SETTINGS` in a React component blurs the client/server boundary
and signals "security logic in the frontend" to developers who inherit the code.

Additionally, the file violated the 300-line SRP rule from the project's architecture
standards (ISO/IEC 25010 – Maintainability §8.5.1).

### Decision

Decompose into:

| File | Lines | Responsibility |
|------|-------|----------------|
| `src/lib/security-settings-types.ts` | ~165 | `SecuritySettings` type + `DEFAULT_SECURITY_SETTINGS` |
| `src/hooks/use-security-settings.ts` | ~200 | API fetch/save + derived state (BFF client) |
| `src/components/security-settings/SecuritySettingsPrimitives.tsx` | ~200 | Stateless `ToggleRow`, `SliderRow`, `TextInputRow` |
| `src/components/security-settings/tabs/ModulesTab.tsx` | ~130 | Modules toggle panel |
| `src/components/security-settings/tabs/ParametersTab.tsx` | ~175 | Sliders + alert channels |
| `src/components/security-settings/tabs/RulesTab.tsx` | ~140 | Tarpit / zip-bomb rule toggles |
| `src/components/security-settings/tabs/CountermeasuresTab.tsx` | ~290 | Countermeasures + detection panels + action bar + footer |
| `src/components/SecuritySettingsDialog.tsx` | ~244 | Dialog chrome + tab routing only |

`DEFAULT_SECURITY_SETTINGS` is re-exported from `SecuritySettingsDialog.tsx` as
`DEFAULT_SETTINGS` for backward compatibility with existing test imports.

The actual authoritative server defaults remain in `api/security-settings.ts`
(unchanged). The client-side defaults in `src/lib/security-settings-types.ts`
are used only as:
1. A UI placeholder while the API response loads (avoid blank flash).
2. A reset target when the admin clicks "Reset to Defaults".

All security enforcement remains exclusively server-side in the `api/` directory.

### Consequences

**Positive:**
- No single file exceeds 300 lines; each has a single responsibility.
- `useSecuritySettings` is independently testable without rendering the dialog.
- `SecuritySettings` type can be imported from a types module, not a UI file.
- The BFF pattern is explicit: the hook is the boundary; the UI is stateless relative to the API.

**Negative:**
- More files to navigate (mitigated by the directory structure `security-settings/tabs/`).
- `DEFAULT_SETTINGS` re-export adds minor indirection for test imports.

**Zero visual change:** All DOM elements, CSS classes, and Framer Motion transitions
are preserved byte-for-byte relative to the original rendering.
