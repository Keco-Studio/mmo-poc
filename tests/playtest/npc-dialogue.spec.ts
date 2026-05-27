import { expect, test } from '@playwright/test';

test('player moves near Verdant, sees prompt, opens dialogue, and saves artifacts', async ({ page }, testInfo) => {
  await page.goto('/');

  await expect.poll(async () => page.evaluate(() => window.__GAME_STATE__?.ready), {
    timeout: 10_000,
  }).toBe(true);

  await page.keyboard.down('d');
  await page.waitForTimeout(1_350);
  await page.keyboard.up('d');

  await page.keyboard.down('s');
  await page.waitForTimeout(500);
  await page.keyboard.up('s');

  await expect.poll(async () => page.evaluate(() => window.__GAME_STATE__?.promptVisible), {
    timeout: 5_000,
  }).toBe(true);

  await page.keyboard.press('e');

  await expect.poll(async () => page.evaluate(() => window.__GAME_STATE__?.dialogueOpen), {
    timeout: 5_000,
  }).toBe(true);

  const screenshotPath = 'reports/npc-dialogue.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach('npc-dialogue-screenshot', { path: screenshotPath, contentType: 'image/png' });

  const state = await page.evaluate(() => window.__GAME_STATE__);
  await testInfo.attach('npc-dialogue-state', {
    body: JSON.stringify(state, null, 2),
    contentType: 'application/json',
  });
});
