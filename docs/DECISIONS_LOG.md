# Decisions Log

Stand: 2026-03-08

## Active Decisions
- Use local JSON persistence (no external DB) -> fast local iteration.
- Keep backend as source of truth for dialogs -> admin edits affect gameplay directly.
- Retain static fallback in gameplay -> game still runs if backend unavailable.
- Use scene IDs 0..5 fixed -> aligns with chapter navigation and design script.
- Use step-based model per scene -> branchable and easy to edit.
- Enforce `stepIndex` uniqueness per scene -> deterministic transitions.
- Allow `nextStep` and `nextPart` branches -> intra-scene + cross-scene flow.
- Add `/flow` endpoint -> explicit branch introspection for admin.
- Add `type` on step -> map script phases (`intro/example/activity/summary/transition/dialog`).
- Replace speaker free-text with `hostId` dropdown -> stable host mapping.
- Persist selected host in localStorage -> consistent host identity across scenes.
- Support `hostId=selected` -> dynamic host resolution from player choice.
- Introduce `showOnOptionId` -> conditional next-step messaging by selected answer.
- Render only matching conditional messages when present -> prevents duplicate next-step replies.
- Auto-seed dialogs when store file missing/empty -> avoid empty admin state.
- Ensure all scenes exist in store even if absent -> stable scene switching.
- Keep seed endpoints for maintenance -> quick reset/reseed during development.
- Add write queue in store -> avoids file corruption on concurrent writes.
- Keep CORS limited to local dev origins -> basic local safety.
- Keep admin as in-app page (not separate app) -> lower maintenance.
- Keep host avatars in-code SVGs -> no asset pipeline dependency.
- Use generated scripted seed text for all scenes -> complete editable baseline.
- Implement branch retry loops in seeded activities -> aligns with non-punitive learning design.

## Marked as Outdated (not matching current code)
- [OUTDATED] Remove `anchor` from editable model -> obsolete in chat UI.
  - Reason: `anchor` is still present in static scene metadata (`src/data/scenes.js`) and used as fallback content shape.
- [OUTDATED] Treat validation errors as 400, missing entities as 404, conflicts as 409.
  - Reason: Code documents these statuses partially, but generic error handler can still emit 500; this is not a strict global contract.
- [OUTDATED] Keep `scene 0` empty in backend steps -> avatar selection remains frontend flow.
  - Reason: `sceneId=0` is now seeded and persisted in backend (`server/lib/dialogSeed.js`, `server/data/dialogs.json`).

## Clarification Added
- Validation currently accepts `hostId` in `{selected, clara, uwe, ambassador}`.
