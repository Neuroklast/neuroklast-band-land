# Widget Development Guide

This guide explains how to build a new widget for the Neuroklast Band Land
widget store and how to submit it for inclusion in the official catalog.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Widget Catalog Entry](#widget-catalog-entry)
4. [Widget Component](#widget-component)
5. [WidgetRenderer Integration](#widgetrenderer-integration)
6. [WidgetConfigDialog Integration](#widgetconfigdialog-integration)
7. [Widget Definitions (widgetDefs.ts)](#widget-definitions-widgetdefsts)
8. [Tests](#tests)
9. [Quality Checklist](#quality-checklist)
10. [Submitting a Community Widget](#submitting-a-community-widget)

---

## Architecture Overview

```
src/lib/
├── types.ts              # WidgetPlugin, WidgetCategory, WidgetLayoutPosition
├── widget-plugins.ts     # WIDGET_CATALOG, install/uninstall/toggle helpers
└── widgetDefs.ts         # WidgetDef, layout position resolution

src/components/
├── WidgetConfigDialog.tsx # Per-widget configuration UI
└── widgets/
    ├── index.ts           # Re-exports all widget components
    ├── WidgetRenderer.tsx # Routes widget.id → component
    ├── BandsintownWidget.tsx
    ├── SpotifyPlayerWidget.tsx
    └── …                  # One file per widget
```

The store lists every entry in `WIDGET_CATALOG`.  When a user installs a
widget, a `WidgetPlugin` object is created and stored in `SiteConfig.widgetPlugins`.
The active widgets are rendered by `WidgetRenderer` in `SiteContentRenderer`.

---

## Quick Start

### 1. Pick a unique widget ID

Use kebab-case: `my-cool-widget`.

### 2. Choose a category

| Value | Use for |
|---|---|
| `events` | Concerts, gig listings, ticketing |
| `music` | Audio players, embeds |
| `video` | Video embeds |
| `social` | Social media feeds and widgets |
| `analytics` | Stats, dashboards |
| `merch` | Shop/e-commerce |
| `newsletter` | Email signup |
| `other` | Anything that doesn't fit above |

### 3. Run the checklist

Follow the steps in the sections below and tick off each item in the
[Quality Checklist](#quality-checklist) before submitting.

---

## Widget Catalog Entry

Add an entry to `WIDGET_CATALOG` in `src/lib/widget-plugins.ts`:

```ts
{
  id: 'my-cool-widget',
  name: 'My Cool Widget',
  description: 'A short, one-sentence description shown in the store.',
  category: 'other',
  version: '1.0.0',
  author: 'Your Name',
  defaultConfig: { /* initial config keys and values */ },
  license: 'free',           // 'free' or 'premium'
  rating: { average: 0, count: 0 },
  tags: ['cool', 'example'],
},
```

**Rules:**
- `id` must be unique across the entire catalog.
- `version` follows [semver](https://semver.org/): `MAJOR.MINOR.PATCH`.
- `defaultConfig` must contain every key your component reads from `widget.config`.
- Keep `description` under 120 characters.

---

## Widget Component

Create `src/components/widgets/MyCoolWidget.tsx`:

```tsx
/**
 * MyCoolWidget — Brief description of what this widget does.
 *
 * Config: { myKey: string, myOtherKey?: number }
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'

interface MyCoolConfig {
  myKey?: string
  myOtherKey?: number
}

interface MyCoolWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function MyCoolWidget({ widget, themeSettings }: MyCoolWidgetProps) {
  const config = (widget.config ?? {}) as MyCoolConfig

  // Show a placeholder when required config is missing
  if (!config.myKey) {
    return (
      <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
        <div className="text-2xl mb-2">🔌</div>
        <p className="font-semibold mb-1">My Cool Widget</p>
        <p className="text-xs opacity-70">Configure the widget in the settings panel.</p>
      </div>
    )
  }

  // Use themeSettings to respect the active theme's border radius, colours, etc.
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  return (
    <div style={{ borderRadius: `${radiusPx}px` }} className="border border-primary/20 p-4">
      <p>{config.myKey}</p>
    </div>
  )
}
```

**Guidelines:**
- Accept `themeSettings?: ThemeSettings` and use it for colours/radii.
- Return a placeholder `<div>` (not `null`) when required config is absent.
- Prefer `className` Tailwind utilities over inline styles except for
  dynamic values derived from `themeSettings`.
- Never make HTTP requests at the top level of the component; use `useEffect`
  and handle loading / error states.
- Keep the component focused: one widget = one concern.

---

## WidgetRenderer Integration

Add a `case` to the `switch` in `src/components/widgets/WidgetRenderer.tsx`:

```tsx
import MyCoolWidget from './MyCoolWidget'

// … inside the switch:
case 'my-cool-widget':
  return <MyCoolWidget widget={widget} themeSettings={themeSettings} />
```

Also add the export to `src/components/widgets/index.ts`:

```ts
export { default as MyCoolWidget } from './MyCoolWidget'
```

---

## WidgetConfigDialog Integration

Add a `case` to the `renderFields()` switch in
`src/components/WidgetConfigDialog.tsx` to display per-widget settings:

```tsx
case 'my-cool-widget':
  return (
    <>
      <Field label="My Key" hint="Description of what this does">
        <Input
          value={String(config.myKey ?? '')}
          onChange={(e) => set('myKey', e.target.value)}
          placeholder="example value"
          className="bg-secondary border-input text-sm"
        />
      </Field>
    </>
  )
```

If your widget needs no configuration, return a descriptive message instead
(see `'analytics-dashboard'` for an example).

---

## Widget Definitions (widgetDefs.ts)

If your widget has a non-default layout position preference (e.g. it should
appear in the footer or sidebar by default), add an entry to `POSITION_OVERRIDES`
in `src/lib/widgetDefs.ts`:

```ts
const POSITION_OVERRIDES: Partial<Record<string, WidgetLayoutPosition>> = {
  // …
  'my-cool-widget': 'sidebar',
}
```

Available positions: `'main'` (default) · `'sidebar'` · `'footer'` · `'hero-below'`

---

## Tests

Add tests to `src/test/widget-renderer.test.ts` following the existing pattern:

```ts
describe('MyCoolWidget', () => {
  it('renders placeholder when config is empty', () => {
    const widget: WidgetPlugin = {
      id: 'my-cool-widget', name: 'My Cool Widget', description: '',
      category: 'other', version: '1.0.0',
      installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => MyCoolWidget({ widget })).not.toThrow()
  })

  it('renders when config is set', () => {
    const widget: WidgetPlugin = {
      id: 'my-cool-widget', name: 'My Cool Widget', description: '',
      category: 'other', version: '1.0.0',
      installed: true, enabled: true, order: 0,
      config: { myKey: 'hello' },
    }
    expect(() => MyCoolWidget({ widget })).not.toThrow()
  })
})
```

Also add a routing test in the `WidgetRenderer component routing` describe block:

```ts
it('accepts a WidgetPlugin with id=my-cool-widget', () => {
  const widget = makeWidget('my-cool-widget')
  expect(() => WidgetRenderer({ widget })).not.toThrow()
})
```

Run all tests with:

```bash
npm test
```

---

## Quality Checklist

Before submitting a widget, confirm every item:

- [ ] Unique `id` in kebab-case, not already in `WIDGET_CATALOG`
- [ ] Catalog entry has `id`, `name`, `description`, `category`, `version`, `author`, `license`, `tags`
- [ ] `defaultConfig` contains all keys the component reads
- [ ] Component file added in `src/components/widgets/`
- [ ] Component handles missing/empty config with a readable placeholder
- [ ] Component accepts and uses `themeSettings` for theming
- [ ] `WidgetRenderer.tsx` has a `case` for the new ID
- [ ] `widgets/index.ts` exports the new component
- [ ] `WidgetConfigDialog.tsx` has a `case` for the new ID
- [ ] `widgetDefs.ts` `POSITION_OVERRIDES` updated if needed
- [ ] Unit tests added (placeholder + configured states)
- [ ] WidgetRenderer routing test added
- [ ] `npm test` passes without new failures
- [ ] `npm run lint` passes (or only has pre-existing warnings)
- [ ] No hard-coded secrets or API keys in the source code

---

## Submitting a Community Widget

1. Fork the repository on GitHub.
2. Create a branch: `git checkout -b widget/my-cool-widget`
3. Follow all the steps above and tick the Quality Checklist.
4. Open a Pull Request with the title `feat(widgets): add My Cool Widget`.
5. In the PR description explain:
   - What the widget does
   - Which external service it integrates with (if any)
   - Example config values
   - Any special setup required by the site owner (API keys, account creation, etc.)
6. The maintainers will review for security, accessibility, and code quality.

> **Security note:** Widgets that load external scripts or embed iFrames must
> use the `custom-html` widget as a template and apply appropriate `sandbox`
> attributes.  Widgets must never exfiltrate user data or inject scripts
> outside the sandboxed iFrame boundary.
