import { test, expect } from '@playwright/test';

test('navega del listado al episodio con player', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Podcaster' })).toBeVisible();
  await expect(page.getByLabel('Filter podcasts')).toBeVisible();

  const firstPodcast = page
    .locator('a[href^="/podcast/"]')
    .filter({ has: page.getByRole('heading', { level: 3 }) })
    .first();

  await expect(firstPodcast).toBeVisible({ timeout: 60_000 });
  await firstPodcast.click();

  await expect(page.getByText(/^Episodes:/)).toBeVisible({ timeout: 60_000 });

  const firstEpisode = page.locator('a[href*="/episode/"]').first();
  await expect(firstEpisode).toBeVisible();
  await firstEpisode.click();

  const player = page.locator('audio');
  await expect(player).toBeVisible({ timeout: 60_000 });
  await expect(player).toHaveAttribute('src', /.+/);
});
