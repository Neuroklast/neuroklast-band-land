# Architecture quality programme

Status: **Quality baseline introduced. Full audit NOT completed.** Owner: maintainers. Date: 2026-11-15.

## Required invariants
- Domain rules have a canonical typed owner; no duplicated validation across routes.
- Read failures are distinct from empty data. No writable defaults after failed reads.
- Server authorization and RLS protect all mutations; cross-site data is isolated.
- Audit, money and license writes have explicit durability and failure semantics.
- Maintenance is operator-triggered and idempotent; no database/R2 jobs at cold start.
- Security, schema and storage changes have rollback, compatibility and negative tests.
- Every documented test has real execution evidence. Text-pattern checks are not behavior tests.

## Evidence and ownership
- [Quality journal](QUALITY_JOURNAL.md) records exact scope, cause, owner, tests, failure handling, updated docs and residual risks.
- [Document trigger map](living-docs.json) specifies the current owners.
- [Existing architecture debt audit](ARCHITECTURE_DEBT_AUDIT_2026-11-15.md) is a risk backlog, not a certificate.
- [Architecture decisions](../.github/ARCHITECTURE.md), [security](agent/security.md), [operations](agent/workflow.md) and [data](agent/architecture.md) remain canonical.

## Acceptance gates
| Evidence | Current status |
| --- | --- |
| Full dependency/data-flow map reviewed | Not established |
| All P0/P1 architecture defects resolved | Not established |
| RLS/tenant and failure-path integration test matrix | Not established |
| Production SLOs, observability and recovery exercises | Not established |
| Pull-request living docs presence and structure | Added in this PR; require branch-protection check |
| Independent verification of documentation truth | Human review still required |

## PR and release process
1. Reproduce the observed failure and trace the full affected call graph.
2. Identify the canonical owner, data boundaries, failure modes, security and rollback.
3. Test positive and negative cases, including concurrency and partial persistence where relevant.
4. Change the canonical implementation and every affected caller.
5. Update the living docs, QA checklist and changelog according to the trigger map.
6. Append the dated quality-journal entry with the seven mandatory fields.
7. Pass the CI check, then independently review source against documentation.
8. Confirm released SHA and live behavior and record any remaining risk.

No silent waivers. Document risk severity, mitigation, owner and revisit trigger.
