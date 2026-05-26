# Core Harness Design

## Context

The AI NPC Village Dev Kit has Phase 0A scaffolded (docs, example TaskSpecs) but critical harness pieces are missing. No `.claude/settings.json`, no skills, no hooks. Phase 0B (Vite + Excalibur game bootstrap) is next and will immediately need skills to guide implementation. Building the core harness upfront ensures Claude works reliably from the start.

## Decision

Build the core harness before Phase 0B implementation. Create only the skills and infrastructure needed immediately or very soon. Add remaining skills iteratively as real work demands them.

## What to Create Upfront

### 1. Fix CLAUDE.md broken reference

`CLAUDE.md:11` references `docs/GAME_SPEC.md` but that file doesn't exist. Create it from the root spec markdown file (rename source concept).

### 2. Create `.claude/settings.json`

Permissions allow: Read, Edit, Write, git status/diff, npm run build/typecheck/lint/validate/test/playtest.
Deny: .env reads, secrets/credentials reads, rm -rf, curl|wget piped to shell.

### 3. Create initial skills (needed by task_0002)

- `rpg-task-spec` — turning ideas into scoped TaskSpec JSON files
- `excalibur-scene` — editing Excalibur scene or actor code
- `patch-review` — reviewing changes before committing

### 4. Create initial hooks (scope and safety)

- `check_task_scope.py` — scope guard, blocks edits outside allowedFiles
- `block_dangerous_bash.py` — blocks rm -rf, credential reads, unknown curl/wget

### 5. Create commands

- `run-task.md` — read TaskSpec, load skills, scoped edit, run commands, patch
- `review-patch.md` — review git diff against TaskSpec scope

### 6. Create docs/agent-guides/

Already present but incomplete. Ensure these exist:
- `runtime-state-contract.md` — already present
- `task-spec-contract.md` — already present

## What to Defer

| Item | Defer Until |
|------|-------------|
| `runtime-inspector` skill | task_0004 (Runtime State MVP) |
| `playtest-authoring` skill | task_0009 (first Playwright test) |
| `playtest-repair` skill | first failing playtest |
| `asset-manifest` skill | Phase 1 (Asset Manifest) |
| `sprite-qa` skill | Phase 7 (Asset QA) |
| `npc-dialogue-grounding` skill | Phase 6 (NPC AI System) |
| Subagent definitions | Phase 4+ (AI Patch Loop) |
| MCP servers | Phase 8+ |

## Approach

**Skills first, then game code.** The harness must be complete enough that when task_0002 starts, Claude has all guidance it needs to bootstrap the game correctly.

**Skill format:** Each skill is a `.claude/skills/<name>/SKILL.md` with:
- When to use
- Inputs
- Workflow steps
- Checks
- Common mistakes

**Hooks:** Python scripts that run via settings.json hook configuration. These enforce non-negotiable rules so Claude doesn't need to remember them.

**Settings:** Committed to repo. Personal overrides go in `settings.local.json` (gitignored).

## Directory Structure

```
.claude/
  settings.json           # permissions, hooks
  settings.local.json.example
  hooks/
    check_task_scope.py
    block_dangerous_bash.py
  skills/
    rpg-task-spec/SKILL.md
    excalibur-scene/SKILL.md
    patch-review/SKILL.md
  commands/
    run-task.md
    review-patch.md

docs/
  superpowers/specs/      # specs written by skills go here
  GAME_SPEC.md            # created from root spec
```

## Acceptance

- CLAUDE.md links resolve (GAME_SPEC.md exists)
- `npm run build/typecheck/lint/validate/test/playtest` are permitted in settings.json
- `.env`, secrets, rm -rf, curl|wget are blocked
- `rpg-task-spec`, `excalibur-scene`, `patch-review` skills exist and are loadable
- Scope guard hook can read active task and compare against allowedFiles
- Dangerous command hook blocks the documented commands
- `run-task` and `review-patch` commands exist and are documented
- No game source code exists yet (src/, server/, assets/ remain empty)

## Out of Scope

- No game implementation (src/, server/)
- No Playwright tests yet
- No asset files
- No MCP servers
- No subagents
- No full skill set — only the 3 most immediately needed skills