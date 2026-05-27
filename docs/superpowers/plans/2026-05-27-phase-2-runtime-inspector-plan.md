# Phase 2 Runtime Inspector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the game observable through an in-game inspector overlay, console error collector, NPC state tracker, and UI state tracker — all fed into `window.__GAME_STATE__` which already exists.

**Architecture:** The inspector is a fixed-position HTML overlay rendered outside the game canvas (absolute-positioned div), updated each frame by reading game state. An error collector intercepts `console.error` and `window.onerror` and stores them in a ring buffer exposed via `window.__GAME_STATE__.errors[]`. The NPC state tracker reads from existing NPC actor positions. The UI state tracker reads from existing `promptVisible` and `dialogueOpen`.

**Tech Stack:** Pure HTML/CSS overlay (no framework), Excalibur scene integration, Playwright for verification.

---

## Existing Files

- `src/systems/RuntimeState.ts` — already has `GameState` type and `updateGameState()`. Phase 2 adds `errors[]` field and richer NPC/UI state.
- `src/game/VillageScene.ts` — already updates runtime state once per second. Phase 2 keeps this pattern but adds inspector DOM updates.
- `src/ui/DialogueBox.ts` — already tracks `isOpen`. Phase 2 reads this for UI state.
- `src/actors/Verdant.ts` — NPC actor with position. Phase 2 reads this for NPC state.
- `src/ui/InteractionPrompt.ts` — already has `visiblePrompt`. Phase 2 reads this for UI state.

## Files to Create

- `src/ui/InspectorOverlay.ts` — creates and manages the HTML overlay div
- `src/systems/ErrorCollector.ts` — intercepts errors and exposes them
- `tasks/todo/task_0016_inspector_overlay.json`
- `tasks/todo/task_0017_error_collector.json`
- `tasks/todo/task_0018_inspector_integration.json`

## Files to Modify

- `src/systems/RuntimeState.ts` — add `errors[]`, `ui`, `npcDetails` to `GameState`
- `src/game/VillageScene.ts` — attach inspector overlay, update each frame
- `docs/HARNESS.md` — document `npm run inspect` if added
- `package.json` — add `inspect` script if useful

---

## Task 0016 — Inspector Overlay

**Files:**
- Create: `src/ui/InspectorOverlay.ts`
- Modify: `src/game/VillageScene.ts`
- Test: `tests/playtest/game.spec.ts` (extend existing)

### Step 1: Create the overlay HTML/CSS module

Create `src/ui/InspectorOverlay.ts`. This file creates a fixed-position overlay div, styled to look like a devtools panel (dark background, monospace font, collapsible sections).

```typescript
import { Engine } from 'excalibur';

export interface InspectorState {
  fps: number;
  player: { x: number; y: number };
  npcs: { id: string; name: string; x: number; y: number }[];
  ui: { promptVisible: boolean; dialogueOpen: boolean };
  errors: string[];
}

export class InspectorOverlay {
  private _el: HTMLDivElement;
  private _fpsEl: HTMLDivElement;
  private _playerEl: HTMLDivElement;
  private _npcEl: HTMLDivElement;
  private _uiEl: HTMLDivElement;
  private _errEl: HTMLDivElement;
  private _visible = false;

  constructor() {
    this._el = document.createElement('div');
    this._el.id = 'inspector-overlay';
    this._el.style.cssText = [
      'position:fixed',
      'top:8px',
      'right:8px',
      'width:220px',
      'background:rgba(10,10,10,0.88)',
      'color:#0f0',
      'font:11px/1.4 monospace',
      'padding:8px',
      'border:1px solid #0f0',
      'border-radius:4px',
      'z-index:9999',
      'display:none',
      'max-height:90vh',
      'overflow:hidden',
    ].join(';');

    const header = document.createElement('div');
    header.style.cssText = 'font-weight:bold;margin-bottom:6px;border-bottom:1px solid #0f0;padding-bottom:4px;cursor:pointer';
    header.textContent = 'Inspector';
    header.onclick = () => this.toggle();
    this._el.appendChild(header);

    this._fpsEl = this._mkSection('FPS');
    this._playerEl = this._mkSection('Player');
    this._npcEl = this._mkSection('NPCs');
    this._uiEl = this._mkSection('UI');
    this._errEl = this._mkSection('Errors (0)');

    document.body.appendChild(this._el);
  }

  private _mkSection(label: string): HTMLDivElement {
    const el = document.createElement('div');
    el.style.cssText = 'margin-top:6px';
    const lbl = document.createElement('div');
    lbl.style.cssText = 'color:#888';
    lbl.textContent = label;
    el.appendChild(lbl);
    this._el.appendChild(el);
    return el;
  }

  toggle(): void {
    this._visible = !this._visible;
    this._el.style.display = this._visible ? 'block' : 'none';
  }

  show(): void {
    this._visible = true;
    this._el.style.display = 'block';
  }

  update(state: InspectorState): void {
    if (!this._visible) return;
    this._fpsEl.querySelector('div:last-child')!.textContent = state.fps.toFixed(1);
    this._playerEl.querySelector('div:last-child')!.textContent =
      `x:${state.player.x.toFixed(0)} y:${state.player.y.toFixed(0)}`;
    this._npcEl.querySelector('div:last-child')!.textContent =
      state.npcs.map(n => `${n.name}(${n.x.toFixed(0)},${n.y.toFixed(0)})`).join(' | ') || 'none';
    this._uiEl.querySelector('div:last-child')!.textContent =
      `prompt:${state.ui.promptVisible} dialog:${state.ui.dialogueOpen}`;
    this._errEl.querySelector('div:first-child')!.textContent = `Errors (${state.errors.length})`;
    this._errEl.querySelector('div:last-child')!.textContent =
      state.errors.slice(-3).join(' | ') || 'none';
  }
}
```

### Step 2: Attach overlay in VillageScene

Modify `src/game/VillageScene.ts` to create and update the inspector:

Add import:
```typescript
import { InspectorOverlay } from '../ui/InspectorOverlay';
```

In `VillageScene` class body add:
```typescript
private _inspector!: InspectorOverlay;
private _lastFps = 0;
```

In `onInitialize()`, after existing setup:
```typescript
this._inspector = new InspectorOverlay();
```

In `onPostUpdate()`, after the existing runtime state update:
```typescript
this._inspector.update({
  fps: _engine.clock.fps,
  player: { x: this.player.pos.x, y: this.player.pos.y },
  npcs: this.npcs.map(n => ({ id: n.name, name: n.name, x: n.pos.x, y: n.pos.y })),
  ui: { promptVisible: this.promptVisible, dialogueOpen: this.dialogueOpen },
  errors: (window.__GAME_STATE__ as GameState).errors ?? [],
});
```

Also add `GameState` import:
```typescript
import { GameState } from '../systems/RuntimeState';
```

### Step 3: Build and verify

Run: `npm run build`
Expected: PASS with no errors

### Step 4: Test overlay in browser

Run: `npm run dev`
Navigate to http://127.0.0.1:5173
Press `I` key to toggle inspector — it should appear top-right showing FPS, player position, NPC positions, UI state.

### Step 5: Commit

```bash
git add src/ui/InspectorOverlay.ts src/game/VillageScene.ts
git commit -m "feat: add inspector overlay (Phase 2 Task 0016)

InspectorOverlay renders a fixed-position devtools-style panel with
FPS, player position, NPC positions, UI state, and error count.
Toggled by clicking the header. VillageScene updates it each frame.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 0017 — Error Collector

**Files:**
- Create: `src/systems/ErrorCollector.ts`
- Modify: `src/systems/RuntimeState.ts`

### Step 1: Create error collector

Create `src/systems/ErrorCollector.ts`. This intercepts console.error and window.onerror and maintains a ring buffer of up to 50 errors.

```typescript
const MAX_ERRORS = 50;

let _errors: string[] = [];
let _originalConsoleError: (...args: unknown[]) => void;
let _originalWindowError: OnErrorEventHandler;

export function startErrorCollection(): void {
  _originalConsoleError = console.error.bind(console);
  _originalWindowError = window.onerror;

  console.error = (...args: unknown[]) => {
    const msg = args.map(a => String(a)).join(' ');
    pushError(msg);
    _originalConsoleError(...args);
  };

  window.onerror = (message, source, lineno, colno, error) => {
    const msg = [message, source, `${lineno}:${colno}`, error?.stack].filter(Boolean).join(' | ');
    pushError(msg);
    return false;
  };
}

function pushError(msg: string): void {
  _errors.push(msg);
  if (_errors.length > MAX_ERRORS) _errors.shift();
}

export function getCollectedErrors(): string[] {
  return [..._errors];
}

export function clearErrors(): void {
  _errors = [];
}

export function stopErrorCollection(): void {
  console.error = _originalConsoleError;
  window.onerror = _originalWindowError;
}
```

### Step 2: Add errors field to GameState

Modify `src/systems/RuntimeState.ts` — add `errors: string[]` to `GameState`:

```typescript
export type GameState = {
  scene: string;
  ready: boolean;
  player: { x: number; y: number };
  npcs: RuntimeNpc[];
  promptVisible: boolean;
  dialogueOpen: boolean;
  errors: string[];  // new
};
```

### Step 3: Wire error collector into Game bootstrap

Modify `src/main.ts` to start error collection before the game starts:

```typescript
import { startErrorCollection } from './systems/ErrorCollector';

startErrorCollection();
```

And update `initializeGameState()` to include an empty errors array:

```typescript
window.__GAME_STATE__ = {
  scene: 'village',
  ready: false,
  player: emptyPlayer,
  npcs: [],
  promptVisible: false,
  dialogueOpen: false,
  errors: [],  // new
};
```

### Step 4: Update errors each frame in VillageScene

In `onPostUpdate()` in `VillageScene.ts`, update errors from collector:

```typescript
import { getCollectedErrors } from '../systems/ErrorCollector';
// in onPostUpdate:
(window.__GAME_STATE__ as GameState).errors = getCollectedErrors();
```

### Step 5: Build and verify

Run: `npm run build`
Expected: PASS

### Step 6: Test error capture

Run: `npm run dev`
Open browser console and type `console.error('test error')`
Verify the error appears in `window.__GAME_STATE__.errors`

### Step 7: Commit

```bash
git add src/systems/ErrorCollector.ts src/systems/RuntimeState.ts src/main.ts src/game/VillageScene.ts
git commit -m "feat: add error collector (Phase 2 Task 0017)

ErrorCollector intercepts console.error and window.onerror into a
ring buffer of 50 entries exposed via window.__GAME_STATE__.errors[].
Wired into main.ts bootstrap and updated every frame in VillageScene.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 0018 — Inspector Integration and Final Verification

**Files:**
- Modify: `src/systems/RuntimeState.ts`
- Modify: `src/game/VillageScene.ts`
- Modify: `docs/HARNESS.md`

### Step 1: Verify all pieces wire together

Read `src/systems/RuntimeState.ts` and confirm `errors: string[]` is in `GameState`.
Read `src/game/VillageScene.ts` and confirm inspector update call passes `errors`.

Confirm in `onPostUpdate()`:
```typescript
const state = window.__GAME_STATE__ as GameState;
state.errors = getCollectedErrors();
```

### Step 2: Run full verification

Run: `npm run build`
Expected: PASS

Run: `npm run validate`
Expected: PASS

Run: `npm run playtest`
Expected: 2 passed

### Step 3: Document npm run inspect

Check if docs/HARNESS.md needs updating. Read it:

```bash
cat docs/HARNESS.md | grep -A2 "inspect"
```

If no inspect command documented, no action needed — inspector is developer-only UI, not a required command.

### Step 4: Final commit

```bash
git add docs/HARNESS.md 2>/dev/null; git add -A
git commit -m "feat: complete Phase 2 Runtime Inspector

Inspector overlay (Task 0016), error collector (Task 0017), and final
integration (Task 0018) complete. Game is now observable via on-screen
devtools panel + window.__GAME_STATE__.errors[]. Build/validate/playtest pass.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Verification Commands

After each task:
- `npm run build` — must pass
- `npm run validate` — must pass (manifests unchanged)
- `npm run playtest` — must pass (2/2)

After Phase 2 complete:
- Open game, press `I` to toggle inspector
- Run `console.error('test')` in browser console
- Verify `window.__GAME_STATE__.errors` contains the error

## Out of Scope

- Moving inspector to a separate browser window
- Exporting error logs to a file
- Adding framerate cap or performance warnings
- Inspector persistence across sessions
- Workbench UI (Phase 8)