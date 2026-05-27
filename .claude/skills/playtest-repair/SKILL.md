---
name: playtest-repair
description: Use when a Playwright playtest fails and needs to be fixed - covers diagnostic steps, error pattern matching, runtime state inspection, and targeted fixes without rewriting tests
---

# Playtest Repair Skill

## Overview

When a playtest fails, follow this diagnostic sequence: identify the failing assertion, check runtime state, inspect console/page errors, then fix the minimal cause. Do not rewrite the test — only fix what is broken.

## Diagnostic Sequence

### Step 1: Read the error output

The error output shows which assertion failed and why. Common patterns:

```
Timeout exceeded while waiting on the predicate — window.__GAME_STATE__?.ready never became true
```
→ Game did not initialize. Check for scene initialization errors.

```
Expected: true, Received: false
```
→ Assertion failed. Check what state the test polled vs what it expected.

```
Console errors: [Error] Error during scene initialization for scene village!
```
→ Scene threw during `onInitialize()`. Check the error context for the root cause.

### Step 2: Check runtime state

Open the game in dev mode and inspect `window.__GAME_STATE__`:
```javascript
// In browser console
JSON.stringify(window.__GAME_STATE__, null, 2)
```

Look for:
- `ready: false` — scene did not initialize
- `scene: "village"` but no NPCs — NPC actors not created
- `npcs: []` — NPC creation failed
- Non-empty `errors` array — runtime errors

### Step 3: Read the error-context.md attachment

Playwright writes a full diagnostic report to `test-results/<test-name>/error-context.md` when a test fails. Read it:
```bash
cat test-results/<name>/error-context.md
```

### Step 4: Check for console/page errors

If the test captured console errors, read them. Common causes:
- `Error during scene initialization` — asset loading failed or code threw in onInitialize
- `Expected blob (usually image) data...` — asset path not served correctly
- TypeError from a null reference — runtime code bug

## Common Fixes

### "ready never became true"

Root cause: scene threw during `onInitialize()`.
Fix:
1. Check browser console for initialization errors
2. If asset path error: ensure PNGs are in `public/assets/` and paths use `/assets/` prefix
3. If async error: ensure `await` is used for asset loading in `onInitialize`
4. If manifest JSON parse error: validate with `npm run validate`

### NPC positions wrong / NPC not found

Root cause: NPC actor not added to scene, or position mismatch.
Fix:
1. Verify `npcs.json` has correct x,y values
2. Verify NPC actor is created and added to scene in `onInitialize`
3. Verify `RuntimeState` updateGameState is called with NPCs array

### "canvas not visible"

Root cause: Vite dev server not running or canvas element ID mismatch.
Fix:
1. Ensure `npm run dev` is running
2. Verify `<canvas id="game">` in index.html
3. Check `vite.config.ts` has correct port (5173)

### Playwright times out waiting for state

Root cause: timing issue — test moves too fast or game is slow.
Fix:
1. Increase poll timeout: `timeout: 15_000` instead of `10_000`
2. Add `await page.waitForTimeout(ms)` before polling
3. Check `_engine.clock.fpsSampler.fps` — if 0, game loop not running

## When NOT to Fix

- Test assertion is checking the wrong thing — rewrite the assertion, not the game
- Test requires visual pixel matching — remove the assertion, do not add pixel snapshots
- Test is flaky due to CI environment — add `test.skip` with note, do not over-engineer

## Rules

- Fix the root cause, not the symptom
- If the test was correct and the game broke: fix the game code
- If the test was wrong: fix the test assertion
- Do not disable tests to make them pass
- After fixing: run `npm run playtest` to confirm