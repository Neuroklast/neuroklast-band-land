# Agent Workflow

Rules for AI agent runs on this project. Session start + mandatory CI live in root [`AGENTS.md`](../../AGENTS.md). Never open a PR with failing checks; no `as any` / `@ts-ignore` / bare `eslint-disable` to silence errors.

---

## Non-negotiable root-cause engineering gate

The [repository-wide prohibition of lazy/dirty fixes](../../AGENTS.md#mandatory-engineering-standard-no-quick-fixes) applies to **every** issue, feature, refactor and urgent production incident. **Never trade correctness, maintainability, security or auditability for a fast green check.** A small diff is good only when it delivers a **complete** fix.

Before touching implementation, each change must record: (a) observed symptoms and reproduction, (b) root cause with evidence, (c) **all** affected callers/routes and the canonical owner, (d) data/storage/security invariants, (e) failure and retry semantics, (f) acceptance and regression tests, and (g) migration/rollback when relevant.

During implementation: prefer one typed domain policy/adapter/service rather than repeated local patches. Prohibit fake `ok` results, no-op implementations, stub contexts, unchecked database results, silent data-loss catches, empty editable defaults after failed loads and log-only substitution for recovery. Apply the same rule to maintenance scripts, admin tools, API responses and UI state. If required changes span files, complete the whole dependency path.

Before PR/merge, reviewers **must reject** a change with unaddressed root cause, a silent failure path, inadequate negative/failure-injection tests, stale documentation, or claims of validation not actually performed. Do not merge a partial fix as complete. If blocked, document the blocker and leave it unresolved rather than disguising it. See [architecture debt audit](../ARCHITECTURE_DEBT_AUDIT_2026-11-15.md).

---

## Local validation and GitHub cost boundary

**NEVER run a Next.js build or Lighthouse build in GitHub Actions.** GitHub CI checks lint, typecheck, tests, security and `npm run check:github-builds` only. The maintainer runs production builds **locally** (not on GitHub runners):

```bash
npm ci
npm run lint && npm run typecheck && npm run test
npm run build
```

For mobile performance validation, run `npm run build`, install Chromium and the Lighthouse CLI, then execute `bash scripts/run-mobile-audit.sh` **locally** (the script starts the built app). These checks are required for full sign-off, but do not claim they passed unless actually executed. Avoid GitHub workflows that trigger a build, including a "manual" workflow.

Re-run individual commands when debugging.

---

## Pull requests

1. Branch from up-to-date `main`.
2. Smallest commits that each leave the tree green when practical.
3. PR description: what / why / how to verify (include visual checks for public UI).
4. **Merge only when the non-build CI is green.** Document local build/Lighthouse validation separately; a green CI alone is not proof of a passing production build.
5. After merge: confirm Vercel **Production** deploy SHA matches the merge commit.
6. If the user reported visual bugs: require hard-refresh and list what to re-check.

A fix sitting on an open PR while the user stares at production is a **process failure**.

---

## Docs review (end of every session) — always required

Agents **must always** update documentation and relevant markdown at the end of the session (or before every PR), as part of the same deliverable as code. Do not wait for the user to ask. “Code-only” handoffs that leave docs stale are incomplete.

**When:** After the feature/fix is implemented and checks pass; **before** you say the task is done, open a PR, or stop.

**What to do:**

1. Re-read what changed (diff / summary).
2. Update **every** markdown that would otherwise lie or omit the new behaviour (table below).
3. Prefer small, accurate edits over large rewrites; do not invent product claims.
4. If nothing product-facing changed, still confirm living docs / agent specs need no touch — and note that briefly.

| Area | Files |
|------|-------|
| Agent spec | `AGENTS.md`, `docs/agent/*.md` |
| Onboarding | `README.md`, `docs/ADMIN_GUIDE.md`, `.env.example` if present |
| Product / legal / security | `docs/GDPR_COMPLIANCE.md`, `SECURITY.md`, `docs/ARCHITECTURE.md` |
| Living docs | `CHANGELOG.md`, `docs/LESSONS_LEARNED.md`, `QA_CHECKLIST.md` |

### Living docs (before every PR)

| File | When to update |
|------|----------------|
| `CHANGELOG.md` | User-facing features, public UI fixes, API/route changes, security fixes — bullets under `[Unreleased]`. Skip pure internal refactors with no observable change. |
| `docs/LESSONS_LEARNED.md` | Recurring anti-pattern, non-obvious failure mode, or process gap — append a dated row. Promote to `AGENTS.md` / topic files only after the pattern is stable. |
| `QA_CHECKLIST.md` | New/changed user flows, overlays, consent, nav, logo rendering — add or adjust checklist items. |

**Minimal changes:** smallest diff that fully solves the requirement; no unrelated refactors; no new dependencies unless necessary.

---

## Session phases

```
PLAN → DEVELOP → TEST → VALIDATE → DOCUMENT → SHIP
```

| Phase | Actions |
|-------|---------|
| **Plan** | Read `AGENTS.md` + topic file; explore code; short file-level plan for non-trivial work |
| **Develop** | Match existing patterns; respect decision trees (nav / overlay / logos) |
| **Test** | `npm run test`; add tests for new `lib/` utilities and regression guards for public UI |
| **Validate** | lint + typecheck + build |
| **Document** | Living docs + agent specs |
| **Ship** | PR → green CI → merge → Production SHA confirmed |

---

## Multi-agent pattern (large tasks)

For tasks with >3 distinct concerns:

1. List sub-tasks in the PR description.
2. One atomic commit per sub-task when practical.
3. Run full checks after each commit or before push.
4. Prefer separate PRs for independent modules; mark blocking deps explicitly.

---

## Visual / public UI sessions

When the user reports screenshot bugs:

1. Open the newest files under `screenshots/` (if present) **before** coding.
2. Map each bug to a decision tree in `AGENTS.md` / `public-ui.md`.
3. Fix root cause, not a parallel half-implementation (e.g. do not rebuild a second modal).
4. Ship through Production; ask for hard-refresh + which items to re-verify.

---

## Living spec

- New conventions → update the matching `docs/agent/*.md` file.
- New topic → add file and link from `AGENTS.md` + this workflow index in `docs/agent/README.md`.

**Session closeout (non-negotiable):**

```
code complete → non-build CI + available local checks → docs update → merge + Vercel Production confirm → report any unverified local checks
```

## Enforced living documentation

Run `npm run test:living-docs` and `npm run check:living-docs` locally. The standalone PR status **Living docs gate** compares changed source paths to `docs/living-docs.json` and checks a newly added seven-field evidence entry. It runs no Next.js build or migration. Human reviewers must verify documentation accuracy. Require this named check in GitHub branch protection for unbypassable enforcement.
