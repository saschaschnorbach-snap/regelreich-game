# Next Tasks

Stand: 2026-03-08

## Priority 1

1. Admin UX: backend connectivity state

- Add explicit offline banner/retry state in Admin when API calls fail.
- Acceptance: clear error banner, retry action, auto-clear after successful reload.

2. Gameplay logic tests for conditional and activity flows

- Add tests for `showOnOptionId` filtering and activity submit routing (parts 2-4).
- Acceptance: deterministic tests for correct/wrong/partial branches and retry loops.

## Priority 2

3. Decision/docs drift guard

- Add lightweight check (or checklist) to keep docs in sync with code on key contracts (`hostId`, scene seeding, status codes).
- Acceptance: drift checklist in PR workflow or docs runbook.

4. Admin branch editing safety

- Add pre-submit UI validation for invalid `nextStep`/`nextPart` references and dead-end hints.
- Acceptance: inline warnings before save, fewer 4xx responses from avoidable input mistakes.

## Priority 3

5. Seed endpoint policy

- Decide whether seed endpoints stay always available or become env-guarded for dev.
- Acceptance: documented policy + implementation guard if required.

6. Optional schema versioning for `dialogs.json`

- Introduce `schemaVersion` only if migration complexity grows.
- Acceptance: version key and migration note in runbook when implemented.
