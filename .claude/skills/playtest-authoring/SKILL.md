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