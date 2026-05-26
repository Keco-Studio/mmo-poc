# AI NPC Village Dev Kit — Game Spec

Version: 0.3
Target User: Yi Luo using Claude Code
Target Stack: Excalibur.js + TypeScript + Vite + Playwright + Vitest + Zod/JSON Schema + Node.js/Express + OpenAI API
Development Mode: Claude Code native, harness-first, skill-driven, scoped-task workflow
Initial Game Type: 2D top-down pixel RPG / cozy farming village / AI NPC simulation

---

## 1. Product Direction

### 1.1 Working Name

**AI NPC Village Dev Kit**

Long-term product form:

**AI Game Development Workbench**

### 1.2 One-Sentence Positioning

AI NPC Village Dev Kit is a Claude-native 2D game development harness that lets AI agents build, inspect, test, repair, and extend a playable AI NPC village demo through structured specs, runtime state, screenshots, automated playtests, and reusable Claude skills.

### 1.3 What This Product Is

This product is a controlled development environment for creating high-quality playable game slices.

The first target is a small top-down pixel village where:

- A player can move.
- NPCs live in the world.
- NPCs follow schedules.
- NPCs can talk with contextual AI dialogue.
- Claude can inspect runtime state.
- Claude can run playtests.
- Claude can repair scoped issues.

### 1.4 What This Product Is Not

The first version is not:

- A generic "AI makes any full game from one prompt" tool.
- A Unity/Godot/Unreal framework.
- A 3D game engine.
- A multiplayer system.
- A full commercial RPG generator.
- A cloud collaboration platform.
- A production asset marketplace.

The MVP focuses only on:

- Excalibur.js.
- TypeScript.
- 2D top-down pixel RPG.
- Browser playable demo.
- Claude Code workflow.
- Harness-based game development.

---

## 15. Development Phases

### Phase 0A — Claude Code Harness Setup

Goal: make the repository Claude-native before game complexity grows.

Deliverables:

- Root `CLAUDE.md`.
- `.claude/settings.json`.
- `docs/CODEBASE_MAP.md`.
- `docs/HARNESS.md`.
- Initial TaskSpec schema.
- Initial skills.
- Initial commands.

Acceptance:

- Claude can open the repo and understand how to work.
- Claude can read a TaskSpec.
- Claude can identify allowed and forbidden files.
- Claude can run standard commands.

### Phase 0B — Playable Game Template

Goal: build the smallest playable Excalibur.js village demo.

Deliverables:

- Vite + TypeScript + Excalibur.js project.
- Browser canvas.
- Player movement.
- Small village map.
- Collision.
- Verdant NPC.
- Interaction prompt.
- Dialogue box.

Acceptance:

- `npm install` succeeds.
- `npm run dev` starts the game.
- `npm run build` passes.
- Player can move.
- Verdant appears.
- Pressing E opens dialogue when near Verdant.

### Phase 1 — Asset Manifest System

Goal: make sprites and tilesets structured and replaceable.

Deliverables:

- Character manifest schema.
- Tileset manifest schema.
- SpriteAtlas loader.
- Animation loader.
- AssetPreviewScene.

Acceptance:

- Verdant sprite manifest loads.
- Animations use names instead of hardcoded frame indexes.
- Replacing `verdant.png` and manifest updates game without code changes.

### Phase 2 — Runtime Inspector

Goal: make the game observable.

Deliverables:

- `window.__GAME_STATE__`.
- Inspector overlay.
- Error collector.
- NPC state tracker.
- UI state tracker.

Acceptance:

- Playwright can read runtime state.
- Inspector shows player/NPC/UI state.
- Console errors are captured.

### Phase 3 — Playtest Bot

Goal: make the game automatically testable.

Deliverables:

- Playwright setup.
- Runtime state helper.
- Screenshot capture.
- Console error capture.
- JSON report writer.

Acceptance:

- `npm run playtest` starts the game and runs tests.
- Player movement test passes.
- NPC dialogue test passes.
- Screenshot and report are generated.

### Phase 4 — AI Patch Loop

Goal: let Claude repair scoped game issues.

Deliverables:

- Task runner.
- Scope guard.
- Patch history.
- Failure report summarizer.
- `/run-task` command.

Acceptance:

- Claude fixes one failing playtest using report context.
- Claude modifies only allowed files.
- Build/playtest pass after patch.
- Patch history is saved.

### Phase 5 — Skills Hardening

Goal: move repeated instructions out of prompts into reusable skills.

Deliverables:

- `rpg-task-spec` skill.
- `runtime-inspector` skill.
- `playtest-authoring` skill.
- `playtest-repair` skill.
- `asset-manifest` skill.
- `patch-review` skill.

Acceptance:

- Claude can use skills for repeated tasks.
- Root `CLAUDE.md` remains lean.
- Task prompts become shorter.

### Phase 6 — NPC AI System

Goal: make NPCs feel alive through local simulation + LLM intent/dialogue.

Rule:

The LLM does not directly control the engine. It returns high-level intent. Local simulation executes it.

Acceptance:

- Browser never sees API key.
- AI response is schema-validated.
- Invalid output falls back safely.
- Verdant can remember one player statement.
- Verdant can choose one high-level action every 10 seconds.

### Phase 7 — Asset QA

Goal: help Claude detect whether game assets are usable.

Acceptance:

- Sprite dimensions validated.
- Empty frames detected.
- Anchor drift warnings produced.
- Asset preview screenshot generated.
- AI produces structured QA report.

### Phase 8 — Workbench UI

Goal: turn the local harness into a visible product.

Acceptance:

- User can view GameSpec.
- User can view assets.
- User can run preview.
- User can run playtest.
- User can review patch history.

---

## 16. First Ten Claude Tasks

### Task 0001 — Claude Harness Bootstrap

Goal: add root Claude Code project files.

Allowed files:

- `CLAUDE.md`
- `.claude/settings.json`
- `docs/CODEBASE_MAP.md`
- `docs/HARNESS.md`
- `tasks/examples/task_0001_bootstrap.json`

Acceptance:

- Project has clear Claude workflow.
- Standard commands are documented.
- TaskSpec format is documented.

### Task 0002 — Vite + Excalibur Bootstrap

Goal: create minimal playable canvas.

Allowed files:

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `src/main.ts`
- `src/game/Game.ts`
- `src/game/VillageScene.ts`

Acceptance:

- `npm install` succeeds.
- `npm run dev` starts.
- Browser shows canvas.
- `npm run build` passes.

### Task 0003 — Player Movement

Goal: add controllable player.

Acceptance:

- WASD/arrow keys move player.
- Player stays inside bounds.
- Build passes.

### Task 0004 — Runtime State MVP

Goal: expose minimal `window.__GAME_STATE__`.

Acceptance:

- State includes scene and player x/y.
- State updates at least once per second.
- Build passes.

### Task 0005 — Map and Collision

Goal: add small map and blocked tiles.

Acceptance:

- Grass/path/water/wall render.
- Player cannot pass through blocked tiles.

### Task 0006 — Verdant NPC

Goal: add Verdant actor.

Acceptance:

- Verdant appears in village square.
- Runtime state includes Verdant.

### Task 0007 — Interaction Prompt

Goal: show prompt near Verdant.

Acceptance:

- Prompt appears within 48px.
- Prompt disappears when leaving range.
- Runtime state includes prompt visibility.

### Task 0008 — Dialogue Box

Goal: open dialogue with E.

Acceptance:

- Pressing E near Verdant opens dialogue.
- Runtime state includes `dialogueOpen`.

### Task 0009 — Playwright Open Game Test

Goal: first browser test.

Acceptance:

- Playwright opens game.
- Canvas exists.
- `window.__GAME_STATE__` exists.
- No console errors.

### Task 0010 — NPC Dialogue Playtest

Goal: automated test for approach + talk.

Acceptance:

- Playtest moves near Verdant.
- Prompt visible.
- Press E.
- Dialogue open.
- Screenshot saved.
- JSON report generated.

---

## 17. How Yi Should Use Claude Code

### 17.1 Start from the Relevant Directory

For game runtime work, start Claude from project root or `src/` depending on task size.

For server work, start from `server/`.

For playtest work, start from `tests/playtest/`.

Claude will still load parent `CLAUDE.md`, but the active working directory helps it focus.

### 17.2 Use TaskSpec Instead of Vague Prompts

Bad prompt:

```text
Build the NPC system.
```

Good prompt:

```text
/run-task tasks/todo/task_0007_interaction_prompt.json
```

### 17.3 Keep Every Claude Task Small

Each task should change 1–5 files.

Avoid tasks that require:

- Whole architecture rewrite.
- Full phase implementation.
- Many unrelated systems.
- Large visual redesign.

### 17.4 Ask Claude to Create Skills After Repetition

When you notice yourself giving the same instruction three times, convert it into a skill.

Example:

```text
Create a Claude skill called playtest-repair based on the repeated workflow we used to debug failing Playwright game tests.
```

### 17.5 Review CLAUDE.md Every 3–6 Months

As Claude models and Claude Code features improve, some instructions become unnecessary or harmful.

Schedule periodic review of:

- `CLAUDE.md`
- skills
- hooks
- settings
- commands
- agent guides

---

## 18. Definition of Done

A task is done only when:

- Scope guard passes.
- Code builds.
- Validation passes.
- Unit tests pass where relevant.
- Playtest passes where relevant.
- Runtime state contract remains stable.
- No forbidden files changed.
- No secrets touched.
- Patch summary is written.
- Human can review the diff.

A phase is done only when all phase tasks meet this definition.

---

## 19. Strategic Product Interpretation

The product is not only a game.

The product is the **development harness** that lets Claude build games more reliably.

The long-term defensible product is:

```text
Claude-native game development workbench
  = specs
  + runtime state
  + playtest bot
  + screenshots
  + asset manifests
  + skills
  + hooks
  + patch loop
  + human review
```

The first proof point is simple:

```text
Claude receives a scoped task
  ↓
Claude edits the game
  ↓
Playwright runs the game
  ↓
Runtime state and screenshots expose failure
  ↓
Claude repairs the issue
  ↓
The game remains playable
```

If this loop works, the project has real technical value.