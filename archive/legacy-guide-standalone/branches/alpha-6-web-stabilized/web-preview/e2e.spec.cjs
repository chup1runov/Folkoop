'use strict';

const { test, expect } = require('@playwright/test');

async function expectImageLoaded(locator) {
  await expect(locator).toBeVisible();
  await expect.poll(async () => locator.evaluate(img => img.complete ? img.naturalWidth : 0)).toBeGreaterThan(0);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.clear(); } catch {}
  });
  await page.goto('http://127.0.0.1:3000/');
});

test('clean first-run onboarding, handoff, Focus and Home work in a real browser', async ({ page }) => {
  await expectImageLoaded(page.locator('#character'));
  await expect(page.locator('#coach')).toBeVisible();
  await expect(page.locator('#coachTitle')).toHaveText('Привет. Я Ксюша.');

  await page.getByRole('button', { name: 'Познакомиться' }).click();
  await page.mouse.move(120, 140);
  await page.locator('#character').click();

  await expect(page.locator('#radial')).toBeVisible();
  await expect(page.locator('#coachTitle')).toHaveText('Вот мои быстрые действия.');
  await page.getByRole('button', { name: 'Дальше' }).click();
  await expect(page.locator('#coachTitle')).toHaveText('Мне можно давать вещи.');

  await page.evaluate(() => {
    const data = new DataTransfer();
    data.items.add(new File(['hello'], 'sample.txt', { type: 'text/plain' }));
    document.getElementById('desktop').dispatchEvent(new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: data
    }));
  });

  await expect(page.locator('#handoff')).toBeVisible();
  await expect(page.locator('#coach')).toBeHidden();
  await expect(page.locator('#handoffName')).toHaveText('sample.txt');

  await page.getByRole('button', { name: 'Запомнить' }).click();
  await expect(page.locator('#coach')).toBeVisible();
  await expect(page.locator('#coachTitle')).toHaveText('В браузере у меня свой мир.');
  await page.getByRole('button', { name: 'Понятно' }).click();

  await expect(page.locator('#coach')).toBeHidden();
  await expect(page.locator('#desktop')).toHaveAttribute('data-onboarding', 'false');

  await page.locator('#character').click();
  await page.locator('[data-action="focus"]').click();

  await page.locator('#homeButton').click();
  await expect(page.locator('#homeDialog')).toBeVisible();
  await expectImageLoaded(page.locator('#homeCharacter'));
  await expect(page.locator('#nowTitle')).toHaveText('Фокус');
  await expect(page.locator('#memoryList')).toContainText('sample.txt');
  await expect(page.locator('#room')).toHaveAttribute('data-scene', 'focus');
});

test('Quiet and accelerated active-day controls change the browser world', async ({ page }) => {
  await page.getByRole('button', { name: 'Пропустить' }).click();
  await page.locator('#quietButton').click();
  await expect(page.locator('#quietButton')).toHaveText('Снять тишину');

  await page.locator('#homeButton').click();
  await expect(page.locator('#nowTitle')).toHaveText('Тихий период');
  await expect(page.locator('#room')).toHaveAttribute('data-scene', 'quiet');
  await page.locator('.close').click();

  await page.locator('#quietButton').click();
  await page.locator('#previewToggle').click();
  await expect(page.locator('#testPanel')).toBeVisible();

  await page.locator('#nextDay').click();
  await expect(page.locator('#dayValue')).toHaveText('2');
  await page.locator('#homeButton').click();
  await expect(page.locator('#storyTitle')).toHaveText('Растение на подоконнике');
  await expect(page.locator('#plant')).not.toHaveText('');
});

test('reset returns Web Mode to a clean first-run state', async ({ page }) => {
  await page.getByRole('button', { name: 'Пропустить' }).click();
  await page.locator('#previewToggle').click();
  await page.locator('#nextDay').click();
  await expect(page.locator('#dayValue')).toHaveText('2');

  await page.locator('#resetPreview').click();
  await page.waitForLoadState('load');

  await expect(page.locator('#coach')).toBeVisible();
  await expect(page.locator('#coachTitle')).toHaveText('Привет. Я Ксюша.');
  await expect(page.locator('#dayValue')).toHaveText('1');
});
