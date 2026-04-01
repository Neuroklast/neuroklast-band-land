# Agent Protocol

**Mandatory reading for every coding agent session on this repository.**

---

## The Mandate

Every agent session MUST follow this cycle — no exceptions:

```
PLAN → IMPLEMENT → TEST → (if broken) ADJUST PLAN → RE-IMPLEMENT
```

**Never push through a broken approach.** If something does not work after one attempt, stop, update the plan, and try a different solution.

---

## Pre-Session Checklist

Before writing any code, complete these steps:

- [ ] Read `docs/PROJECT_STATUS.md` — understand what exists and what is TODO
- [ ] Read `docs/LESSONS_LEARNED.md` — avoid repeating known mistakes
- [ ] Read `docs/DEVELOPMENT_LOG.md` — understand what the last session changed
- [ ] Read `docs/SECURITY_AUDIT.md` — understand current security posture
- [ ] Run `npm test` to establish a baseline (note any pre-existing failures)
- [ ] Identify and document constraints (what MUST NOT change)

---

## Session Template

When starting a new session, add an entry to `docs/DEVELOPMENT_LOG.md` using this format:

```markdown
## Session: YYYY-MM-DD — [Short Title]

**Agent:** [Agent name/version]
**Branch:** [branch name]

### Objectives
1. [Objective 1]
2. [Objective 2]

### What Was Done
[Detailed account of changes made]

### What Was Tested
[What was verified and how]

### Results
- ✅/❌ [Result 1]
- ✅/❌ [Result 2]
```

---

## Hard Constraints for This Repo

These MUST remain completely unchanged across all sessions:

1. **UI / Surface** — Every visible component, layout, animation, loading screen stays as-is unless explicitly requested
2. **Secret Terminal** — The `/terminal` URL and Konami-code feature must remain reachable at all times (marketing feature)
3. **Security features** — Rate limiting, DOMPurify, IP blocklist, TOTP 2FA, attacker profiling must not be removed or weakened
4. **Cyberpunk aesthetic** — Code rain, glitch effects, HUD elements, Framer Motion animations must remain intact

---

## Phase 1: Plan

1. Understand the full scope of the request before touching any files
2. Write out a checklist of all changes (use `report_progress` tool)
3. Identify any risk areas or potential regressions
4. If the task requires security changes, cross-reference with `docs/SECURITY_AUDIT.md`

## Phase 2: Implement

1. Make the smallest possible change that fully addresses the requirement
2. For each security fix, add a code comment referencing the OWASP risk (e.g., `// OWASP A01:2021 – Broken Access Control`)
3. Follow existing code patterns — check how similar things are done in the codebase first
4. Do not refactor unrelated code

## Phase 3: Test

1. Run targeted tests first: `npm test -- --testPathPattern=[relevant-file]`
2. Run the full test suite: `npm test`
3. Verify UI changes visually where possible
4. Check that `npm run build` succeeds (TypeScript pre-existing errors are acceptable if they existed before your changes)
5. Verify the Secret Terminal still works after any structural changes

## Phase 4: If Broken — Adjust

1. Do NOT continue with a broken approach
2. Document what went wrong in the plan
3. Identify the root cause
4. Update the plan with a revised approach
5. Re-implement from scratch for the affected area

---

## Post-Session Checklist

Before closing the session, update:

- [ ] `docs/PROJECT_STATUS.md` — update feature checklist to reflect changes made
- [ ] `docs/DEVELOPMENT_LOG.md` — add session entry (newest first)
- [ ] `docs/LESSONS_LEARNED.md` — add any new lessons
- [ ] `docs/SECURITY_AUDIT.md` — update finding status if security changes were made
- [ ] Run `report_progress` to commit and push all changes

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/components/Hero.tsx` | Hero section, logo, title image, glitch effects |
| `src/index.css` | Global CSS, all custom utility classes |
| `vercel.json` | Security headers (CSP, HSTS, etc.), URL rewrites |
| `api/_schemas.ts` | Zod validation schemas for all API endpoints |
| `api/_ratelimit.ts` | Rate limiting implementation |
| `middleware.ts` | Vercel Edge Middleware — circuit breaker, IP gate |
| `api/terminal.ts` | Secret Terminal API endpoint |
| `src/lib/config.ts` | Global configuration constants |
| `src/lib/types.ts` | Shared TypeScript types |
| `docs/SECURITY_AUDIT.md` | Security audit findings and fix status |
