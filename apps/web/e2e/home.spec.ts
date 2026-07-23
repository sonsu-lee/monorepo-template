import { expect, test } from '@playwright/test';

test('renders the home page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Create Next App');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'To get started, edit the page.tsx file.',
    }),
  ).toBeVisible();
});
