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
