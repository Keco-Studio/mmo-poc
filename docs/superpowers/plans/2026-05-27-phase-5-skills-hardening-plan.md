# Phase 5 Skills Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert repeated instruction patterns into reusable skills so that CLAUDE.md stays lean and task prompts become shorter.

**Architecture:** Each skill is a Markdown file with YAML frontmatter at `.claude/skills/<name>/SKILL.md`. Skills are invoked via the Skill tool when a task matches their description. No runtime code changes needed — Phase 5 is pure documentation/skill authoring.

**Tech Stack:** None beyond Markdown and Claude Code skill conventions.

---

## Existing Skills

- `.claude/skills/rpg-task-spec/` — already exists, decomposes ideas into TaskSpec JSON
- `.claude/skills/patch-review/` — already exists, reviews diffs before commits
- `.claude/skills/excalibur-scene/` — already exists, guides Excalibur scene editing

## Skills to Create or Update

1. `.claude/skills/runtime-inspector/SKILL.md` — new
2. `.claude/skills/playtest-authoring/SKILL.md` — new
3. `.claude/skills/playtest-repair/SKILL.md` — new
4. `.claude/skills/asset-manifest/SKILL.md` — new
5. Update `.claude/skills/excalibur-scene/SKILL.md` — add inspector integration note
6. Update `CLAUDE.md` — trim verbose sections, delegate to skills

---

## Task 0019: runtime-inspector Skill

**Files:**
- Create: `.claude/skills/runtime-inspector/SKILL.md`

### Step 1: Create the skill file

Create `.claude/skills/runtime-inspector/SKILL.md` with guidance for using the inspector overlay and error collector.

```markdown
---
name: runtime-inspector
description: Use when inspecting game runtime state, debugging errors, or verifying game initialization - covers InspectorOverlay usage, ErrorCollector API, and window.__GAME_STATE__ contract
---

# Runtime Inspector Skill

## Overview

The game exposes runtime state via `window.__GAME_STATE__` and an on-screen inspector overlay. Use this skill when you need to verify game initialization, debug errors, or check player/NPC positions.

## Runtime State Contract

```typescript
type GameState = {
  scene: string;           // current scene name e.g. 'village'
  ready: boolean;         // true after scene onInitialize completes
  player: { x: number; y: number };  // rounded pixel position
  npcs: { id: string; name: string; x: number; y: number }[];
  promptVisible: boolean; // interaction prompt is shown
  dialogueOpen: boolean; // dialogue box is open
  errors: string[];       // console.error and window.onerror captured
};
```

## Inspector Overlay

The inspector overlay appears at top-right of the game canvas. Click its header to toggle visibility. It shows:
- **FPS** — current frame rate
- **Player** — x,y position in pixels
- **NPCs** — name and position of each NPC
- **UI** — promptVisible and dialogueOpen booleans
- **Errors** — count and last 3 error messages

The overlay is created by `src/ui/InspectorOverlay.ts` and updated in `VillageScene.onPostUpdate()`.

## Error Collection

`src/systems/ErrorCollector.ts` intercepts `console.error` and `window.onerror` into a ring buffer of 50 entries. Access via:

```typescript
import { getCollectedErrors } from '../systems/ErrorCollector';
const errors = getCollectedErrors();
```

Error collection starts before game init in `src/main.ts` via `startErrorCollection()`.

## When to Use This Skill

- Task requires checking player/NPC positions
- Build passes but playtest fails
- Verifying game initializes correctly
- Inspecting error state after a failure
- Adding new runtime state fields to `GameState`

## Common Patterns

**Check if game is ready:**
```typescript
const ready = await page.evaluate(() => window.__GAME_STATE__?.ready);
```

**Get player position:**
```typescript
const pos = await page.evaluate(() => window.__GAME_STATE__?.player);
```

**Check for errors:**
```typescript
const errors = await page.evaluate(() => window.__GAME_STATE__?.errors ?? []);
```

## Adding New State Fields

1. Add the field to `GameState` in `src/systems/RuntimeState.ts`
2. Update `updateGameState()` to populate it
3. If the field needs a UI indicator in the inspector, update `src/ui/InspectorOverlay.ts`
4. Run `npm run build && npm run playtest` to verify
```

### Step 2: Verify skill file is valid

Run: `cat .claude/skills/runtime-inspector/SKILL.md | head -3`
Expected: YAML frontmatter with `name:` and `description:`

### Step 3: Commit

```bash
git add .claude/skills/runtime-inspector/SKILL.md
git commit -m "skills: add runtime-inspector skill (Phase 5 Task 0019)

Codifies InspectorOverlay usage, ErrorCollector API, and
window.__GAME_STATE__ contract for repeated debugging tasks.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 0020: playtest-authoring Skill

**Files:**
- Create: `.claude/skills/playtest-authoring/SKILL.md`

### Step 1: Create the skill file

Create `.claude/skills/playtest-authoring/SKILL.md`:

```markdown
---
name: playtest-authoring
description: Use when writing or extending Playwright browser playtests for the Excalibur game - covers test structure, runtime state polling, keyboard input, screenshot capture, and the game.spec.ts / npc-dialogue.spec.ts patterns
---

# Playtest Authoring Skill

## Overview

Playwright tests live in `tests/playtest/` and verify the game opens, runs, and responds to player input. Tests use `page.evaluate()` to read `window.__GAME_STATE__` and `page.keyboard` for input simulation.

## Existing Tests

- `tests/playtest/game.spec.ts` — opens game, waits for ready, checks state, captures console errors
- `tests/playtest/npc-dialogue.spec.ts` — moves player near Verdant, opens dialogue, saves screenshot and JSON state

## Test Pattern

```typescript
import { expect, test } from '@playwright/test';

test('game opens with canvas, runtime state, and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('canvas#game')).toBeVisible();

  await expect.poll(async () => page.evaluate(() => window.__GAME_STATE__?.ready), {
    timeout: 10_000,
  }).toBe(true);

  const state = await page.evaluate(() => window.__GAME_STATE__);
  expect(state.scene).toBe('village');
  expect(state.player).toEqual(expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }));
  expect(errors).toEqual([]);
});
```

## Key Patterns

**Wait for game state:**
```typescript
await expect.poll(async () => page.evaluate(() => window.__GAME_STATE__?.ready), {
  timeout: 10_000,
}).toBe(true);
```

**Move player:**
```typescript
await page.keyboard.down('d');
await page.waitForTimeout(1_350);
await page.keyboard.up('d');
```

**Press E to interact:**
```typescript
await page.keyboard.press('e');
```

**Save screenshot with testInfo:**
```typescript
const screenshotPath = 'reports/npc-dialogue.png';
await page.screenshot({ path: screenshotPath, fullPage: true });
await testInfo.attach('npc-dialogue-screenshot', { path: screenshotPath, contentType: 'image/png' });
```

**Attach JSON state:**
```typescript
const state = await page.evaluate(() => window.__GAME_STATE__);
await testInfo.attach('npc-dialogue-state', {
  body: JSON.stringify(state, null, 2),
  contentType: 'application/json',
});
```

## Running Tests

```bash
npm run playtest           # all tests
npx playwright test game   # specific file
npx playwright test --reporter=list  # verbose output
```

## Config

`playwright.config.ts` sets:
- testDir: `tests/playtest`
- baseURL: `http://127.0.0.1:5173`
- webServer: `npm run dev -- --host 127.0.0.1` (auto-starts dev server)

## When to Use This Skill

- Writing a new browser playtest
- Extending an existing playtest
- Adding a screenshot assertion
- Checking console errors in a test
- Verifying runtime state after player actions

## Rules

- Do not add pixel snapshot assertions (they are visually brittle)
- Always poll for `window.__GAME_STATE__?.ready` before asserting state
- Always call `page.screenshot` via `testInfo.attach` not direct path (Playwright manages the output)
- Keep tests focused on one behavior — one `test()` per behavior
```

### Step 2: Verify skill file

Run: `cat .claude/skills/playtest-authoring/SKILL.md | head -3`
Expected: YAML frontmatter

### Step 3: Commit

```bash
git add .claude/skills/playtest-authoring/SKILL.md
git commit -m "skills: add playtest-authoring skill (Phase 5 Task 0020)

Codifies Playwright test patterns: runtime state polling, keyboard
input, screenshot capture, and testInfo attach patterns.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 0021: playtest-repair Skill

**Files:**
- Create: `.claude/skills/playtest-repair/SKILL.md`

### Step 1: Create the skill file

Create `.claude/skills/playtest-repair/SKILL.md`:

```markdown
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
4. If manifest JSON parse error: validate JSON with `npm run validate`

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
```

### Step 2: Verify skill file

Run: `cat .claude/skills/playtest-repair/SKILL.md | head -3`
Expected: YAML frontmatter

### Step 3: Commit

```bash
git add .claude/skills/playtest-repair/SKILL.md
git commit -m "skills: add playtest-repair skill (Phase 5 Task 0021)

Codifies playtest failure diagnostic sequence: error output reading,
runtime state inspection, common fixes for initialization failures,
asset path errors, and timing issues.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 0022: asset-manifest Skill

**Files:**
- Create: `.claude/skills/asset-manifest/SKILL.md`

### Step 1: Create the skill file

Create `.claude/skills/asset-manifest/SKILL.md`:

```markdown
---
name: asset-manifest
description: Use when adding or modifying game assets (sprites, tilesets, PNGs) - covers manifest contract, asset loader usage, placeholder generation, and validation
---

# Asset Manifest Skill

## Overview

Assets are driven by JSON manifest files in `assets/` directories. Each manifest describes an image, frame grid, named animations/tiles, and blocked behavior. Runtime code uses named keys rather than frame indexes.

## Asset Locations

```
assets/
  characters/
    verdant.png
    verdant.manifest.json
  tilesets/
    village.png
    village.manifest.json

public/assets/          # Vite-served copies
  characters/
  tilesets/
```

## Character Manifest

```json
{
  "id": "verdant",
  "type": "character",
  "image": "./verdant.png",
  "frameWidth": 32,
  "frameHeight": 32,
  "anchor": { "x": 0.5, "y": 1 },
  "animations": {
    "idle-down": { "frames": [0], "fps": 1 },
    "talk-down": { "frames": [0, 1], "fps": 2 }
  }
}
```

## Tileset Manifest

```json
{
  "id": "village",
  "type": "tileset",
  "image": "./village.png",
  "tileWidth": 40,
  "tileHeight": 40,
  "tiles": {
    "grass": { "frame": 0, "blocked": false },
    "path":  { "frame": 1, "blocked": false },
    "water": { "frame": 2, "blocked": true }
  }
}
```

## Frame Index Convention

Frames are indexed left-to-right, top-to-bottom (row-major):
- Frame 0 = top-left
- Frame 1 = one tile right
- Frame N = `col = N % columns`, `row = floor(N / columns)`

## Adding a New Character

1. Create the PNG in `assets/characters/`
2. Create `assets/characters/<name>.manifest.json` with the contract above
3. Copy to `public/assets/characters/`
4. Regenerate placeholders if needed: `npm run generate:assets`
5. Validate: `npm run validate`
6. Update character loading in the appropriate actor's `bootstrapCharacter()` static method

## Adding a New Tile

1. Add the tile to `assets/tilesets/<tileset>.png` (append to the right)
2. Update `assets/tilesets/<tileset>.manifest.json` — add entry to `tiles` object with next frame index
3. Update `public/assets/tilesets/` copy
4. If the tile is used in `src/data/map.json`, ensure the legend key maps to the tile name
5. Validate: `npm run validate`

## Placeholder Generation

```bash
npm run generate:assets  # runs scripts/generate-placeholder-assets.ts via tsx
```

This regenerates all placeholder PNGs from the manifest definitions. Useful when manifests change but PNGs do not.

## Validation

```bash
npm run validate
```

Checks:
- All manifest JSON is parseable
- Required fields exist (id, type, image, dimensions)
- Referenced image files exist
- Frame dimensions are positive integers
- Named animations/tiles are non-empty
- Map tile keys exist in tileset manifests

## Asset Loader Usage

`src/assets/AssetManifestLoader.ts` provides:
- `createSpriteSheet(imageSource, manifest)` — build Excalibur SpriteSheet
- `createAnimation(manifest, sheet, name)` — build Excalibur Animation from named animation
- `createTileSprite(manifest, sheet, tileName)` — build Sprite for a named tile
- `getSpriteByFrame(sheet, index)` — get sprite by frame index

Assets are bootstrapped at scene init via static `bootstrapCharacter()` methods and `bootstrapTileAssets()`.

## When to Use This Skill

- Adding a new NPC sprite
- Adding a new map tile
- Modifying an existing manifest (rename animation, change frame)
- Debugging asset loading failures
- Running validation before committing asset changes
```

### Step 2: Verify skill file

Run: `cat .claude/skills/asset-manifest/SKILL.md | head -3`
Expected: YAML frontmatter

### Step 3: Commit

```bash
git add .claude/skills/asset-manifest/SKILL.md
git commit -m "skills: add asset-manifest skill (Phase 5 Task 0022)

Codifies character and tileset manifest contract, frame index convention,
asset loader usage, placeholder generation, and validation.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 0023: Update excalibur-scene Skill

**Files:**
- Modify: `.claude/skills/excalibur-scene/SKILL.md`

### Step 1: Read current skill

Run: `cat .claude/skills/excalibur-scene/SKILL.md`

### Step 2: Add inspector integration note to the skill

Add this section at the end of the skill:

```markdown

## Inspector Integration

`VillageScene` creates an `InspectorOverlay` instance in `onInitialize()` and updates it each frame in `onPostUpdate()`. When adding scene logic:

- Keep async initialization separate from the `onInitialize()` body if it can fail — errors during `onInitialize()` prevent `ready` from becoming true
- If adding new actor types, ensure their positions are tracked via `updateGameState()` in `onPostUpdate()`
- The inspector updates every second (same cadence as `updateGameState()`)
```

### Step 3: Commit

```bash
git add .claude/skills/excalibur-scene/SKILL.md
git commit -m "skills: update excalibur-scene skill (Phase 5 Task 0023)

Adds inspector integration note to excalibur-scene skill — explains
how InspectorOverlay is created and updated, and why onInitialize
errors prevent ready from becoming true.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 0024: Verify All Skills Loadable

**Files:**
- None (verification only)

### Step 1: Confirm all skill files exist

Run: `ls .claude/skills/`
Expected: `excalibur-scene  patch-review  rpg-task-spec  runtime-inspector  playtest-authoring  playtest-repair  asset-manifest`

### Step 2: Confirm all have valid frontmatter

Run: `for d in .claude/skills/*/; do echo "=== $(basename $d) ==="; head -4 "$d/SKILL.md"; done`
Expected: each shows `name:` and `description:` in frontmatter

### Step 3: Verify no placeholder text in skills

Run: `grep -i "TODO\|TBD\|PLACEHOLDER" .claude/skills/*/SKILL.md | wc -l`
Expected: `0`

### Step 4: Build and playtest still pass

Run: `npm run build && npm run validate && npm run playtest`
Expected: build passes, validate passes, 2 playtests pass

### Step 5: Commit all Phase 5 changes

```bash
git add -A
git commit -m "feat: complete Phase 5 Skills Hardening

Created runtime-inspector, playtest-authoring, playtest-repair, and
asset-manifest skills. Updated excalibur-scene with inspector
integration note. All 7 skills have valid frontmatter and no
placeholder text. Build/validate/playtest pass.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Verification Commands

After each task:
- `npm run build` — must pass
- `npm run validate` — must pass

After Phase 5 complete:
- All 7 skills exist with valid YAML frontmatter
- No `TODO`/`TBD`/placeholder text in skill files
- `npm run playtest` passes (2/2)

## Out of Scope

- Adding runtime code (Phase 5 is pure skill documentation)
- Rewriting CLAUDE.md significantly (Phase 8 Workbench UI handles that)
- Creating skills for future phases (Phase 6, 7, 8 get their own skills when those phases are built)