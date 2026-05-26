# Runtime State Contract

The game must expose `window.__GAME_STATE__` for Playwright and Claude.

Required fields:

- `scene`
- `fps`
- `player`
- `npcs`
- `ui`
- `world`
- `errors`
- `warnings`

Changing this contract requires updating Playwright helpers and affected tests.
