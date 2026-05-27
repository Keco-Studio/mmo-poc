# Harness Development Guide

This project is developed through a harness-first workflow.

## Loop

```text
TaskSpec
  ↓
Relevant Claude skill
  ↓
Scoped implementation
  ↓
Build + validate + tests
  ↓
Runtime inspection + Playwright playtest
  ↓
Report
  ↓
Patch if needed
  ↓
Human review
```

## Required Commands

- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run validate`
- `npm run test`
- `npm run playtest`

## Runtime Contract

The game must expose `window.__GAME_STATE__` so Playwright and Claude can inspect the running game.

## Scope Contract

Claude may only edit files listed in the active TaskSpec `allowedFiles`.

## Done

A task is complete only when the required commands pass and the patch summary is reviewable.

## Patch Loop

When a playtest fails:

1. Run: `npm run playtest` — identifies which test failed
2. Read: `cat test-results/<test>/errors.txt` — captures error output
3. Run: `npx tsx scripts/diagnose-failure.ts` — gets root cause diagnosis
4. Find: the active TaskSpec in `tasks/todo/` — defines allowedFiles/forbiddenFiles
5. Fix: only files within allowedFiles, never files in forbiddenFiles
6. Verify: `npm run build && npm run validate && npm run playtest`
7. Commit with patch summary: describe what broke and what was fixed
