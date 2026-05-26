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
