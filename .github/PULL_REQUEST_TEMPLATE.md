# Change description

## Root cause and affected architecture

- **Reproduced problem / evidence:** <!-- Include precise failing behavior, logs or test. -->
- **Root cause (not just symptom):**
- **Canonical owner and affected callers:** <!-- Include every relevant page, API, job, shared contract and storage boundary. -->
- **Correct architectural solution:** <!-- Explain why this belongs in the chosen module, and why no duplicate patch is needed. -->

## Mandatory engineering gate

**Lazy, dirty, temporary, incomplete or symptom-only fixes are absolutely forbidden.** Every checkbox below is a **blocking requirement** for an applicable change, not an optional suggestion. Review against [AGENTS.md](../AGENTS.md#mandatory-engineering-standard-no-quick-fixes) and [workflow.md](../docs/agent/workflow.md).

- [ ] No unchecked database errors, silent data loss, fake success responses or no-op implementations
- [ ] No dummy contexts/setters, unsupported type assertions, magic exceptions or duplicate business logic
- [ ] The full affected code path and all relevant callers were inspected
- [ ] Empty/missing data, unavailable dependencies and failed mutations have distinct, correct states
- [ ] Failure injection and regression tests verify the root cause and security/data invariants
- [ ] Persistence, transactions, idempotency, retries, observability and rollback are addressed where relevant
- [ ] Existing architecture audit findings were checked, updated if applicable and not falsely declared resolved
- [ ] Documentation, migration scripts and runtime behavior agree
- [ ] No unverified build, manual test or production result is claimed as successful

## Validation evidence

**Tests run and exact results:**  
**Local production build (not GitHub Actions):**  
**Browser/E2E validation and limitations:**  
**CI status (lint, typecheck, tests, security and any contract jobs):**  
**Deployment verification, if merged:**  

## Risk and rollback

**Behavior/security/data compatibility impact:**  
**Rollback or remediation plan:**  
**Known remaining blockers (if any, do not mark the change complete):**  

If the root cause cannot be implemented safely, mark the work **blocked/partial**, explain why, and do not merge or present it as a finished repair.
