import { expect, test } from '@playwright/test';

test('new player can gain spark by tapping Ym', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Ym Grove')).toBeVisible();
  await expect(page.getByTestId('spark-value')).toContainText('0');

  await page.getByRole('button', { name: 'Tap Ym' }).click();

  await expect(page.getByTestId('spark-value')).toContainText('1');
});
