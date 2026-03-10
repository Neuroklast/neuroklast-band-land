# CODING AGENT INSTRUCTIONS — NEUROKLAST BAND LAND

This project has a strict separation of layout structure (Themes) and color palettes (Presets). All rules below are non-negotiable. They are grouped into structural principles that eliminate entire failure categories — not just individual bugs.

---

## PRINCIPLE A — DATA INTEGRITY

> Every component must receive real data through its props or context. Placeholder data, empty objects with type-casts, and disconnected event buses are architecture bugs, not shortcuts.

### A1. NO DOUBLE TYPE-CASTS
`as unknown as X` is banned without exception. It is the TypeScript equivalent of `any` and bypasses the entire type system. If TypeScript reports an error at a prop boundary, the architecture is wrong — fix the data flow, not the types.

```tsx
// ❌ BANNED
themeSettings={{} as unknown as SiteConfig["themeSettings"]}

// ✅ CORRECT
themeSettings={siteConfig?.themeSettings}
```

### A2. NO CustomEvent FOR REACT STATE
`window.dispatchEvent(new CustomEvent(...))` must never be used to pass data between React components. It creates invisible, untraceable couplings with no guaranteed listener and silently drops data on page load order issues. Use props, context, or TanStack Query.

```tsx
// ❌ BANNED — no guaranteed listener, save silently fails
onSaveTheme={(ts) => window.dispatchEvent(new CustomEvent('save-theme-event', { detail: ts }))}

// ✅ CORRECT — direct callback to the persistence layer
onSaveTheme={(ts) => onUpdateSiteConfig?.('themeSettings', ts)}
```

### A3. PROPS MUST CARRY REAL DATA
If a parent component doesn't have the data a child needs, thread it through via props or lift state — never replace it with an empty placeholder. Every prop passed to a component must contain actual, current data.

### A4. NO `any` TYPES
`any` is strictly forbidden. Every API response, component prop, and state variable must be typed via a TypeScript interface or Zod schema. Global types belong in `src/lib/types.ts`.

---

## PRINCIPLE B — VERIFICATION BEFORE WRITING

> Before writing new code that connects to existing systems, find a working example in the codebase and follow the same pattern exactly.

### B1. FOLLOW EXISTING PATTERNS
Before wiring up any callback (e.g. `onSaveTheme`, `onUpdateSiteConfig`), search the codebase for existing usages. Replicate the pattern exactly. Do not invent a new mechanism.

Example: The correct way to persist theme settings is `onUpdateSiteConfig?.('themeSettings', ts)` — this already exists. Do not create a new event bus or custom hook for the same purpose.

### B2. TRACE THE DATA FLOW
Before passing props, trace where the data comes from end-to-end. If `siteConfig` is available as a prop in the parent, it must be passed through — never replaced with an empty object. Ask: "Where does this data live? Who owns it? Who persists it?"

The canonical data flow for site config is:
```
Vercel KV / localStorage
  → useSiteConfig() hook
    → App.tsx (owns the state)
      → Component props (reads and writes via onUpdateSiteConfig)
```

---

## PRINCIPLE C — ZERO DEAD CODE

> Every line of code must be reachable, serve an active purpose, and be connected end-to-end.

- No `// TODO: wire up later` comments. Wire it up now or don't add the code.
- No unused props that are accepted but never connected to anything.
- No `console.log()` in committed code.
- No commented-out code blocks.
- If a file exceeds 250 lines, extract logic into subcomponents or hooks (Single Responsibility Principle).

---

## PRINCIPLE D — STRUCTURAL RULES (UI & ARCHITECTURE)

### D1. NO THEME-SPECIFIC COMPONENTS
Never create multiple versions of the same component for different designs. There is no `CyberpunkCard.tsx` or `MinimalCard.tsx`. There is always exactly one universal version.

### D2. NO HARDCODED COLORS IN TAILWIND
Never use static Tailwind colors like `bg-red-500`, `text-blue-300`, or `border-gray-800`. Use only our global design tokens:
- Backgrounds: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`
- Text: `text-foreground`, `text-primary`, `text-muted-foreground`
- Accents: `bg-primary`, `bg-accent`, `border-primary`, `border-border`
- Status: `text-status-error`, `bg-status-success-em/10`, etc. (defined in `src/index.css`)

### D3. NO INLINE STYLES FOR LAYOUT EFFECTS
For special shapes, borders, or animations, add invisible placeholder divs (e.g. `<div className="theme-widget-corner" aria-hidden="true" />`). These are hidden by default and activated via global CSS rules in `src/styles/theme-slots.css` when `[data-theme="..."]` is active.

### D4. NO DIRECT DOM MANIPULATION
Components must not change their appearance via `document.documentElement`. All visual state is managed centrally through React state and the global layout engine (ThemeContext).

### D5. FEATURE-SLICED DESIGN (FSD)
`src/components/` is for dumb, reusable UI primitives only (Buttons, Inputs, etc.). Complex components with business logic belong in `src/features/<domain>/`. Each feature domain owns its own components, hooks, and API calls.

### D6. STRICT ADMIN ISOLATION (CODE SPLITTING)
Admin components must never be imported directly into public routes. Always use `React.lazy()` + `<Suspense>` for admin components. The public JS bundle must contain zero bytes of admin logic.

### D7. THEMES VS. PRESETS — STRICT SEPARATION
- **THEME (Layout Engine)**: Defines structure, layout, DOM placeholders, clip-path shapes, and hardware animations. Activated via `[data-theme="..."]`. **Never contains color values or fonts.**
- **PRESET (Design Palette)**: Defines CSS variables for colors, typography, and radius. **Never references a structural theme and never modifies HTML markup.**

---

## PRINCIPLE E — SAFETY & PLATFORM RULES

### E1. DATA FETCHING
Never write manual `fetch()` calls inside `useEffect`. All backend communication (`/api`) must go through TanStack Query custom hooks (e.g. `useGigsQuery`) for caching, loading states, and retries.

### E2. SECURITY & ENVIRONMENT VARIABLES
Never store API keys in React code or local state. Sensitive keys belong in server-side environment variables or Vercel KV. Frontend env vars must use the `VITE_` prefix.

### E3. LICENSING & PRIMARY INSTANCE
- License checks for premium features must validate against the master server — never a local database.
- Never use `VITE_IS_PRIMARY` env vars for permission bypasses (tenants can manipulate these).
- Super-user bypass must use a strict hostname check against `"neuroklast.net"` only.

### E4. ASSET MANAGEMENT
Never store uploaded images or audio as base64 strings in Vercel KV — this immediately exhausts storage. Use URLs and route them through `/api/image-proxy` for CORS handling.

### E5. RESILIENCE (GRACE PERIOD)
If the master server is unreachable, the customer's public site must not go offline. License keys validated by the master server must be cached locally in KV with a timestamp (e.g. 7-day grace period).

### E6. ERROR HANDLING
Never trust external data. Validate all API responses and user input with Zod schemas. Wrap failure-prone modules (external widgets, complex editors) with ErrorBoundaries and render safe fallback UIs.

### E7. EXTENSIBILITY (OPEN/CLOSED PRINCIPLE)
Never hardcode new widgets into existing layout components. Every widget (Spotify, YouTube, Newsletter) must be registered via `WidgetRegistry` (`src/lib/widget-registry.ts`). The app loads widgets dynamically through this interface only.

### E8. LANGUAGE
All variables, functions, filenames, and code comments must be in English.

---

## SELF-CHECK BEFORE EVERY COMMIT

Before completing any task, verify each item below. Do not skip this checklist.

1. [ ] No `as unknown as` anywhere in changed files
2. [ ] No `new CustomEvent()` used for React component communication
3. [ ] Every prop passed to a component carries real data — no `{}`, no `undefined` where data is expected
4. [ ] Every callback prop is connected to the actual persistence/state layer — trace it end-to-end
5. [ ] Changed code follows the same pattern as existing working code for the same feature
6. [ ] No `any` types, no type assertions that weaken the type
7. [ ] Run `npx tsc --noEmit` — zero new errors
8. [ ] Every new file is under 250 lines
9. [ ] No `console.log()`, no commented-out code, no TODO comments in committed files
10. [ ] No hardcoded Tailwind palette colors (`bg-red-500`, etc.) — use design tokens only
