# Agent Rules (Codex)

## Goal
Keep context usage minimal. Work in phases.

## Hard rules
- Do NOT analyze the whole repo at once.
- Do NOT paste large code blocks unless explicitly requested.
- Prefer file lists, summaries, and short excerpts.
- Before reading many files: propose a small set (<=15) and justify.

## Workflow
1) Phase 1: build/update CODEMAP.md from the repo structure (max depth 4).
2) Phase 2: read only the core files identified in CODEMAP.md and update:
   - PROJECT_CONTEXT.md (<= 1 page)
   - ARCHITECTURE.md (<= 1 page)
3) Phase 3: execute the next task. Always list the 3–5 files you will touch first.

## Output limits
- Each response: keep it short and structured.