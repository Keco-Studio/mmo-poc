# AI NPC Village Dev Kit — Claude Code Native Development Spec

Version: 0.3  
Target User: Yi Luo using Claude Code  
Target Stack: Excalibur.js + TypeScript + Vite + Playwright + Vitest + Zod/JSON Schema + Node.js/Express + OpenAI API  
Development Mode: Claude Code native, harness-first, skill-driven, scoped-task workflow  
Initial Game Type: 2D top-down pixel RPG / cozy farming village / AI NPC simulation

---

## 0. Why This Spec Exists

This project should not be developed as a normal game project where Claude is asked to “build an AI RPG.”

It should be developed as a **Claude Code native game-development harness**.

Claude performs best when the repository is navigable, context is layered, task expertise is loaded on demand, checks are automated, and runtime feedback is structured. Therefore, this spec defines not only the game, but also the Claude-facing development environment around the game.

The goal is to make Claude able to:

- Find the right files without scanning the whole repository.
- Understand the game architecture through lean layered context.
- Load only the relevant skill for the current task.
- Modify a small scoped set of files.
- Run deterministic checks through standard commands.
- Inspect the running game through `window.__GAME_STATE__`.
- Read Playwright reports and screenshots.
- Patch the game based on real runtime failures.
- Produce reviewable changes instead of large unbounded rewrites.

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

- A generic “AI makes any full game from one prompt” tool.
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

## 2. Claude Code Design Principles

### 2.1 Make the Repository Navigable

Claude should not need to guess where things live.

The repository must include:

- A lean root `CLAUDE.md`.
- A `docs/CODEBASE_MAP.md` file.
- Subdirectory `CLAUDE.md` files for local conventions.
- Clear folder names.
- Small focused modules.
- Standard command names.
- Structured JSON/YAML data.

The repository should be readable as a table of contents before Claude opens source files.

### 2.2 Keep Root CLAUDE.md Short

The root `CLAUDE.md` is loaded frequently. It should contain only:

- Project purpose.
- Architecture map.
- Core rules.
- Required workflow.
- Standard commands.
- Links to deeper docs.

Do not put full game design, full API docs, or every coding convention into root `CLAUDE.md`.

Detailed knowledge belongs in:

- `.claude/skills/*/SKILL.md`
- `docs/agent-guides/*.md`
- subdirectory `CLAUDE.md` files

### 2.3 Use Skills for Task Expertise

Skills are reusable Claude workflows that load only when relevant.

Examples:

- `rpg-task-spec`
- `excalibur-scene`
- `runtime-inspector`
- `playtest-authoring`
- `playtest-repair`
- `asset-manifest`
- `sprite-qa`
- `npc-dialogue-grounding`
- `patch-review`

Do not overload `CLAUDE.md` with all skill knowledge.

### 2.4 Use Hooks for Deterministic Rules

Some rules must not depend on Claude remembering instructions.

Hooks should enforce:

- Scope checks after edits.
- Formatting after edits.
- Build/test/playtest command reminders.
- Blocking access to secrets.
- Blocking risky destructive commands.
- Capturing session summaries for future spec improvements.

### 2.5 Use Subagents for Exploration vs Editing

Claude should not explore and edit large parts of the project in the same context when the task is complex.

Use read-only exploration subagents for:

- Mapping an unfamiliar system.
- Reviewing a subsystem.
- Investigating a failing playtest.
- Producing a concise finding report.

The main agent then edits based on the findings.

### 2.6 Use LSP / TypeScript Tooling

Because this project is TypeScript-based, Claude should benefit from symbol-level navigation.

The project should maintain:

- Strict TypeScript config.
- Useful type definitions.
- Small exported interfaces.
- `npm run typecheck` or `npm run build`.
- IDE/LSP integration when using Claude Code.

### 2.7 MCP and Plugins Are Later

Do not start with MCP servers or plugins.

The order should be:

1. `CLAUDE.md`
2. Codebase map
3. Standard commands
4. Runtime inspector
5. Playtest bot
6. Skills
7. Hooks
8. Subagents
9. MCP servers
10. Plugins

MCP and plugins matter when the local workflow already works and needs distribution or external integrations.

---

## 3. Repository Structure

```text
ai-npc-village-devkit/
  CLAUDE.md
  README.md
  package.json
  vite.config.ts
  tsconfig.json
  playwright.config.ts
  index.html

  .claude/
    settings.json
    settings.local.json.example
    commands/
      run-task.md
      review-patch.md
      write-skill.md
    hooks/
      check_task_scope.py
      block_dangerous_bash.py
      summarize_session.py
    agents/
      game-subsystem-mapper.md
      playtest-failure-investigator.md
      patch-reviewer.md
    skills/
      rpg-task-spec/
        SKILL.md
      excalibur-scene/
        SKILL.md
      runtime-inspector/
        SKILL.md
      playtest-authoring/
        SKILL.md
      playtest-repair/
        SKILL.md
      asset-manifest/
        SKILL.md
      sprite-qa/
        SKILL.md
      npc-dialogue-grounding/
        SKILL.md
      patch-review/
        SKILL.md

  docs/
    CODEBASE_MAP.md
    HARNESS.md
    GAME_SPEC.md
    WORLD_BIBLE.md
    NPC_RULES.md
    QUEST_RULES.md
    ASSET_GUIDE.md
    agent-guides/
      build-test-playtest.md
      runtime-state-contract.md
      task-spec-contract.md
      asset-manifest-contract.md
      npc-ai-contract.md
      playtest-report-contract.md
      scope-guard-contract.md

  tasks/
    todo/
    in-progress/
    done/
    failed/
    examples/
      task_0001_bootstrap.json
      task_0002_player_movement.json
      task_0003_runtime_state.json
      task_0004_npc_dialogue_playtest.json

  reports/
    latest-report.json
    screenshots/
    patch-history/

  src/
    main.ts
    game/
      CLAUDE.md
      Game.ts
      VillageScene.ts
    actors/
      CLAUDE.md
      Player.ts
      NPC.ts
      Verdant.ts
    systems/
      CLAUDE.md
      InputSystem.ts
      InteractionSystem.ts
      DialogueSystem.ts
      CollisionSystem.ts
      TimeSystem.ts
      NPCScheduleSystem.ts
      RuntimeInspector.ts
      ErrorCollector.ts
    world/
      CLAUDE.md
      VillageMap.ts
      locations.ts
      collisions.ts
      worldState.ts
    ui/
      CLAUDE.md
      DialogueBox.ts
      InteractionPrompt.ts
      HUD.ts
      InspectorPanel.ts
    data/
      map.json
      npcs.json
      dialogue.json
      locations.json

  server/
    CLAUDE.md
    index.ts
    openaiClient.ts
    npcPrompts.ts
    schemas.ts
    memoryStore.ts
    relationshipStore.ts
    fallback.ts

  assets/
    characters/
    tilesets/
    props/
    ui/

  tests/
    playtest/
      open-game.spec.ts
      player-movement.spec.ts
      npc-dialogue.spec.ts
      collision.spec.ts
    unit/
    fixtures/
```

---

## 4. Root CLAUDE.md Contract

The root `CLAUDE.md` must be short and stable.

It should answer:

- What is this project?
- What is the required workflow?
- What commands are authoritative?
- What files should Claude read first?
- What must Claude never do?

Root `CLAUDE.md` should not contain every task detail.

Use this contract:

```md
# AI NPC Village Dev Kit

This is a Claude Code native 2D AI NPC village game-development harness.

The goal is not to generate a full RPG from one prompt. The goal is to build a playable Excalibur.js village demo through small scoped tasks, runtime inspection, Playwright playtests, and reusable Claude skills.

## Read First

- `docs/CODEBASE_MAP.md` for repository layout.
- `docs/HARNESS.md` for development loop.
- `docs/GAME_SPEC.md` for product/game direction.
- The relevant subdirectory `CLAUDE.md` before editing files in that directory.

## Required Workflow

1. Read the TaskSpec.
2. Identify allowed files and forbidden files.
3. Load the relevant skill if the task matches one.
4. Make the smallest correct change.
5. Run the required commands.
6. Read reports if commands fail.
7. Fix only within scope.
8. Summarize changed files and validation results.

## Standard Commands

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run validate`
- `npm run test`
- `npm run playtest`
- `npm run task:run -- <taskId>`

## Hard Rules

- Do not rewrite the project.
- Do not make unscoped changes.
- Do not edit files outside `allowedFiles` in the active TaskSpec.
- Do not touch `.env`, secrets, credentials, or private keys.
- Do not skip failing tests.
- Do not hide console errors.
- Do not implement later phases unless the TaskSpec explicitly asks.

## Definition of Done

A task is done only when:

- Build passes.
- Validation passes.
- Relevant tests pass.
- Playtest passes when available.
- Scope guard passes.
- Patch summary is written.
```

---

## 5. Codebase Map Contract

`docs/CODEBASE_MAP.md` is Claude’s table of contents.

It should stay concise.

Example:

```md
# Codebase Map

## Root

- `CLAUDE.md`: Claude Code project rules.
- `.claude/`: Claude skills, hooks, agents, commands, and settings.
- `docs/`: product specs, harness contracts, and agent guides.
- `tasks/`: scoped TaskSpec files.
- `reports/`: playtest reports, screenshots, and patch history.

## Runtime

- `src/main.ts`: browser entrypoint.
- `src/game/`: Excalibur engine and scene setup.
- `src/actors/`: Player and NPC actors.
- `src/systems/`: gameplay systems and runtime inspector.
- `src/world/`: map, locations, collisions, and world state.
- `src/ui/`: dialogue box, prompt, HUD, and inspector overlay.
- `src/data/`: JSON game data.

## Server

- `server/`: API proxy and AI NPC backend. Browser must never access OpenAI API keys directly.

## Tests

- `tests/playtest/`: Playwright browser tests.
- `tests/unit/`: unit tests.
```

---

## 6. Subdirectory CLAUDE.md Contracts

Subdirectory context should be local and specific.

### 6.1 `src/game/CLAUDE.md`

```md
# Game Scene Rules

This directory owns Excalibur engine setup and scene composition.

Rules:

- Keep scene setup readable and small.
- Do not put NPC dialogue logic here.
- Do not put Playwright-only test logic here.
- Use systems for behavior and actors for entities.
- Preserve compatibility with `RuntimeInspector`.

Commands:

- `npm run build`
- `npm run playtest -- tests/playtest/open-game.spec.ts`
```

### 6.2 `src/systems/CLAUDE.md`

```md
# Systems Rules

This directory owns deterministic gameplay systems.

Rules:

- Systems must be testable and small.
- Systems should not directly call external AI APIs.
- Update `RuntimeInspector` contract if exported state changes.
- Preserve `window.__GAME_STATE__` compatibility.
- Add unit tests for pure logic where possible.

Relevant docs:

- `docs/agent-guides/runtime-state-contract.md`
- `docs/agent-guides/playtest-report-contract.md`
```

### 6.3 `server/CLAUDE.md`

```md
# Server Rules

This directory owns backend API endpoints and OpenAI integration.

Rules:

- Never expose API keys to the browser.
- Validate all AI responses with schemas.
- Local game simulation executes actions; LLMs only suggest high-level intents.
- Invalid AI output must fall back safely.
- Keep prompts in `npcPrompts.ts` or documented prompt files.
```

---

## 7. Harness Architecture

The harness has seven layers.

```text
Claude Code
  ↓
CLAUDE.md + Codebase Map
  ↓
Skills + TaskSpec
  ↓
Scoped Implementation
  ↓
Build / Validate / Unit Test
  ↓
Runtime Inspector + Playwright Playtest
  ↓
Report + Patch Loop + Human Review
```

### 7.1 Project Harness

Purpose: keep the project buildable.

Commands:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src server tests --ext .ts",
    "test": "vitest run",
    "validate": "tsx scripts/validate.ts",
    "playtest": "playwright test tests/playtest",
    "task:run": "tsx scripts/agent-task-runner.ts"
  }
}
```

### 7.2 Spec/Data Harness

Purpose: make game content structured and validateable.

Validated files:

- `src/data/map.json`
- `src/data/npcs.json`
- `src/data/dialogue.json`
- `src/data/locations.json`
- `assets/**/*.manifest.json`
- `tasks/**/*.json`

Validation should use Zod or JSON Schema.

### 7.3 Runtime Harness

Purpose: let Claude and Playwright inspect the game.

The game must expose:

```ts
declare global {
  interface Window {
    __GAME_STATE__: GameRuntimeState;
  }
}
```

Required shape:

```ts
interface GameRuntimeState {
  scene: string;
  fps: number;
  player: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    currentLocation: string;
    facing: "up" | "down" | "left" | "right";
    canMove: boolean;
  };
  npcs: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    state: string;
    targetLocation?: string;
    currentLocation?: string;
    currentAnimation: string;
    isStuck: boolean;
    lastDecision?: string;
  }>;
  ui: {
    interactionPromptVisible: boolean;
    dialogueOpen: boolean;
    activeDialogueNpcId: string | null;
  };
  world: {
    timeOfDay: string;
    weather: string;
    currentDay: number;
  };
  errors: string[];
  warnings: string[];
}
```

### 7.4 Playtest Harness

Purpose: make the game automatically playable and inspectable.

Playwright must support:

- Launching the dev server.
- Waiting for the game canvas.
- Reading `window.__GAME_STATE__`.
- Pressing keys.
- Moving the player.
- Opening dialogue.
- Capturing screenshots.
- Capturing console errors.
- Writing `reports/latest-report.json`.

### 7.5 Asset Harness

Purpose: make art assets usable by AI and code.

Asset rules:

- All spritesheets require manifests.
- Actor logic uses animation names, not frame indexes.
- Asset validation catches dimensions, frame count, empty frames, and manifest mismatches.
- Asset preview screenshots are generated for visual QA.

### 7.6 Agent Patch Harness

Purpose: constrain Claude changes.

The patch loop:

```text
TaskSpec
  ↓
Scope guard reads allowedFiles / forbiddenFiles
  ↓
Claude edits only scoped files
  ↓
Build + validate + tests + playtest
  ↓
Report generated
  ↓
Claude repairs if failed
  ↓
Patch history saved
  ↓
Human review
```

### 7.7 Skills Harness

Purpose: keep expertise on-demand.

Skills should be short playbooks, not long manuals.

Each skill should:

- Describe when it should be used.
- List required inputs.
- Define the workflow.
- Link to deeper docs if needed.
- Define acceptance checks.

---

## 8. TaskSpec Contract

Every Claude implementation task should be a JSON file under `tasks/todo/`.

```ts
interface TaskSpec {
  taskId: string;
  title: string;
  phase: string;
  description: string;
  intent: "implement" | "fix" | "refactor" | "test" | "asset" | "review" | "spec";
  skills: string[];
  allowedFiles: string[];
  forbiddenFiles: string[];
  contextFiles: string[];
  acceptance: string[];
  commands: string[];
  maxAttempts: number;
  outOfScope: string[];
}
```

Example:

```json
{
  "taskId": "task_0004_npc_dialogue_playtest",
  "title": "Add NPC dialogue playtest",
  "phase": "Phase 3",
  "intent": "test",
  "description": "Add a Playwright test that moves the player near Verdant, confirms the interaction prompt appears, presses E, confirms dialogue opens, and saves a screenshot.",
  "skills": ["playtest-authoring", "runtime-inspector"],
  "allowedFiles": [
    "tests/playtest/npc-dialogue.spec.ts",
    "tests/playtest/helpers/gameState.ts"
  ],
  "forbiddenFiles": [
    "src/game/VillageScene.ts",
    "src/actors/Player.ts",
    "src/systems/InteractionSystem.ts"
  ],
  "contextFiles": [
    "docs/agent-guides/runtime-state-contract.md",
    "docs/agent-guides/playtest-report-contract.md"
  ],
  "acceptance": [
    "Playtest opens the game in the browser",
    "Playtest reads window.__GAME_STATE__",
    "Playtest confirms interactionPromptVisible becomes true near Verdant",
    "Playtest presses E and confirms dialogueOpen is true",
    "Playtest saves a screenshot to reports/screenshots/",
    "npm run playtest passes"
  ],
  "commands": [
    "npm run build",
    "npm run playtest -- tests/playtest/npc-dialogue.spec.ts"
  ],
  "maxAttempts": 3,
  "outOfScope": [
    "Do not change game logic to make the test pass",
    "Do not add OpenAI API integration",
    "Do not rewrite the interaction system"
  ]
}
```

---

## 9. Claude Skills

### 9.1 Skill Directory Format

Each skill lives at:

```text
.claude/skills/<skill-name>/SKILL.md
```

A skill should be written as:

```md
# Skill Name

## When to Use

Use this skill when...

## Inputs

- TaskSpec
- Relevant files
- Relevant agent guide

## Workflow

1. Step one.
2. Step two.
3. Step three.

## Checks

- Check one.
- Check two.

## Common Mistakes

- Mistake one.
- Mistake two.
```

### 9.2 Required Skills for This Project

#### `rpg-task-spec`

Use when turning an idea into a scoped TaskSpec.

Responsibilities:

- Break vague product requests into small tasks.
- Define allowed files.
- Define forbidden files.
- Add acceptance criteria.
- Select relevant skills.
- Add commands.

#### `excalibur-scene`

Use when editing Excalibur scene or actor code.

Responsibilities:

- Preserve scene lifecycle.
- Keep actors/systems separated.
- Avoid embedding game data directly into scene code.
- Preserve runtime inspector compatibility.

#### `runtime-inspector`

Use when adding or changing exported runtime state.

Responsibilities:

- Keep `window.__GAME_STATE__` stable.
- Update TypeScript interfaces.
- Avoid breaking Playwright tests.
- Include errors and warnings.

#### `playtest-authoring`

Use when writing a new Playwright test.

Responsibilities:

- Use runtime state instead of brittle image-only checks.
- Capture screenshots.
- Capture console errors.
- Write useful failure messages.

#### `playtest-repair`

Use when a playtest fails.

Responsibilities:

- Read failure report.
- Inspect screenshot and runtime state.
- Determine if the failure is a test bug or game bug.
- Patch only scoped files.

#### `asset-manifest`

Use when adding or modifying asset manifests.

Responsibilities:

- Validate frame dimensions.
- Use animation names.
- Avoid hardcoded frame indexes in actor logic.
- Ensure replacement assets do not require code changes.

#### `sprite-qa`

Use when evaluating sprite sheets.

Responsibilities:

- Check dimensions.
- Check transparent background.
- Check empty frames.
- Check anchor drift.
- Generate regeneration prompts if needed.

#### `npc-dialogue-grounding`

Use when changing NPC AI prompts or endpoints.

Responsibilities:

- Ground dialogue in world state.
- Ensure LLM outputs high-level intent only.
- Validate JSON responses.
- Add safe fallback behavior.

#### `patch-review`

Use before finalizing a task.

Responsibilities:

- Review changed files.
- Confirm scope compliance.
- Confirm acceptance criteria.
- Identify unrelated changes.
- Write patch summary.

---

## 10. Claude Hooks

### 10.1 Scope Guard Hook

Purpose: block changes outside active TaskSpec scope.

Conceptual behavior:

```text
When Claude edits or writes a file:
  read active task from tasks/in-progress/current.json
  compare changed file against allowedFiles
  block if not allowed
```

### 10.2 Dangerous Command Hook

Purpose: block destructive commands.

Block:

- `rm -rf`
- deleting project directories
- reading `.env`
- reading credential files
- uploading secrets
- running unknown curl/wget scripts

### 10.3 Post-Edit Format Hook

Purpose: run deterministic formatting after edits.

Allowed commands:

- `npm run lint -- --fix` when configured
- `npm run format` if Prettier is added

### 10.4 Stop Hook / Session Summary Hook

Purpose: capture lessons while fresh.

At the end of a Claude task, write a short session note:

```json
{
  "taskId": "task_0004_npc_dialogue_playtest",
  "changedFiles": [],
  "commandsRun": [],
  "failures": [],
  "suggestedSpecUpdates": []
}
```

Do not auto-update `CLAUDE.md`; propose changes for human review.

---

## 11. `.claude/settings.json` Policy

The project should commit safe shared settings.

Example:

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Write",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(npm run build*)",
      "Bash(npm run typecheck*)",
      "Bash(npm run lint*)",
      "Bash(npm run validate*)",
      "Bash(npm run test*)",
      "Bash(npm run playtest*)"
    ],
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/**)",
      "Read(**/credentials/**)",
      "Bash(rm -rf *)",
      "Bash(curl * | sh)",
      "Bash(wget * | sh)",
      "Bash(ssh *)",
      "Bash(scp *)"
    ]
  }
}
```

Use `settings.local.json` for personal overrides and gitignore it.

---

## 12. Claude Commands

Optional command files can make the workflow repeatable.

### 12.1 `.claude/commands/run-task.md`

```md
# Run Task

Read the TaskSpec at `$ARGUMENTS`.

Workflow:

1. Read the TaskSpec.
2. Read contextFiles.
3. Load relevant skills.
4. Confirm allowedFiles and forbiddenFiles.
5. Inspect current implementation.
6. Make the smallest change.
7. Run commands listed in the TaskSpec.
8. If failures occur, read reports and patch within scope.
9. Stop after maxAttempts.
10. Summarize changed files and validation results.
```

Usage:

```text
/run-task tasks/todo/task_0004_npc_dialogue_playtest.json
```

### 12.2 `.claude/commands/review-patch.md`

```md
# Review Patch

Review the current git diff against the active TaskSpec.

Check:

- Scope compliance.
- Acceptance criteria.
- Runtime state compatibility.
- Playtest compatibility.
- Unrelated refactors.
- Missing tests.

Return:

- Pass/fail.
- Blocking issues.
- Suggested fixes.
```

---

## 13. Runtime State Contract

The runtime inspector is the most important game-specific harness.

Claude and Playwright should be able to answer:

- Is the game loaded?
- Where is the player?
- Can the player move?
- Which NPCs exist?
- Is the prompt visible?
- Is dialogue open?
- What errors happened?

The `RuntimeInspector` must be treated as a public contract. Changing it requires:

- Updating TypeScript interfaces.
- Updating docs.
- Updating Playwright helpers.
- Updating affected tests.

---

## 14. Playtest Report Contract

`reports/latest-report.json` should be easy for Claude to read.

```json
{
  "runId": "2026-05-26T21:00:00Z",
  "passed": false,
  "summary": {
    "total": 4,
    "passed": 3,
    "failed": 1
  },
  "tests": [
    {
      "name": "npc-dialogue",
      "passed": false,
      "failureReason": "interactionPromptVisible remained false after moving near Verdant",
      "screenshot": "reports/screenshots/npc-dialogue-failed.png",
      "state": {
        "player": { "x": 440, "y": 384 },
        "npcs": [{ "id": "verdant", "x": 512, "y": 384 }],
        "ui": { "interactionPromptVisible": false, "dialogueOpen": false }
      },
      "consoleErrors": []
    }
  ]
}
```

Claude should patch from this report, not guess from source code alone.

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
