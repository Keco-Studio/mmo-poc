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
  ready: boolean;          // true after scene onInitialize completes
  player: { x: number; y: number };  // rounded pixel position
  npcs: { id: string; name: string; x: number; y: number }[];
  promptVisible: boolean;  // interaction prompt is shown
  dialogueOpen: boolean;  // dialogue box is open
  errors: string[];        // console.error and window.onerror captured
};
```

## Inspector Overlay

The inspector overlay appears at top-right of the game canvas. Click its header to toggle visibility. It shows:
- **FPS** — current frame rate
- **Player** — x,y position in pixels
- **NPCs** — name and position of each NPC
- **UI** — promptVisible and dialogueOpen booleans
- **Errors** — count and last 3 error messages

The overlay is created by `src/ui/InspectorOverlay.ts` and updated in `VillageScene.onPostUpdate()` every second.

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