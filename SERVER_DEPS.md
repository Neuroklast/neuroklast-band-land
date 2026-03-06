# Server-Only Dependencies

The following packages in `package.json` are **server-side only** and are
used exclusively in Vercel serverless functions under `api/`.  They must
**never** be imported in `src/` (the client bundle).

Vite's tree-shaking will eliminate them from the browser bundle automatically
because they are never reachable from the client entry point.  They are also
listed in `vite.config.ts` under `build.rollupOptions.external` to make this
intent explicit and to prevent accidental bundling.

| Package | Used in | Purpose |
|---|---|---|
| `@vercel/kv` | `api/kv.js`, `middleware.js`, many others | Redis-backed KV store (Vercel Edge/Serverless) |
| `@upstash/ratelimit` | `api/_ratelimit.ts` | Sliding-window rate limiting backed by KV |
| `sharp` | `api/og.js`, `api/image-proxy.js` | Server-side image processing (C++ bindings) |
| `resend` | `api/contact.js`, `api/newsletter.js` | Transactional email delivery |

---

## Why are these in `dependencies` instead of `devDependencies`?

Vercel reads `dependencies` (not `devDependencies`) when installing packages
for serverless functions.  Moving server-only packages to `devDependencies`
would cause deployment failures on Vercel because the runtime would not have
access to them.

In a monorepo setup, these could be isolated in a separate `packages/api`
workspace.  For now they coexist in the root `package.json` with this
documentation.

---

## `next-themes`

`next-themes` is a React context-based dark/light mode library that works
in Vite/SPA projects despite its name — it does not require Next.js.  It is
used alongside the custom theme system (`src/lib/theme-application.ts`,
`src/lib/theme-registry.ts`) for OS-level appearance preference detection.
Replacing it with the in-house theme system is tracked as a future cleanup.

---

## Icon libraries

Two icon libraries are currently in use:

| Library | Usage |
|---|---|
| `@phosphor-icons/react` | Primary icon library — used throughout `src/` |
| `lucide-react` | Used in Shadcn/ui components (e.g. `src/components/ui/`) |

Consolidating to a single library is tracked as a future cleanup.  Both are
tree-shaken by Vite so only the icons actually imported end up in the bundle.
