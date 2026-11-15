# Quality journal

Chronological and append-only record of source changes. The CI check validates newly added lines, not historical entries.

## 2026-11-15 | Introduce enforceable living document requirements
- Scope: Band Land repository quality policy, source-diff CI check and document owner map.
- Root cause: Existing agent documentation rules were not required by CI and could be skipped.
- Owner: Repository maintainers review source changes and the matching documentation.
- Tests: Added Node tests for path classification and invalid journal entries, executed in PR CI.
- Failure path: Missing documents or inaccessible git base fail closed, not with silent success.
- Docs updated: Architectural baseline, agent guidelines, operations workflow, QA checklist and changelog.
- Residual risk: A human must still validate semantic accuracy and independently check production.
