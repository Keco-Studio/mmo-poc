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
