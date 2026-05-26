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
