import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

test('new player can gain spark by tapping Ym', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Ym Grove')).toBeVisible();
  await expect(page.getByTestId('spark-value')).toContainText('0');

  await page.getByRole('button', { name: 'Tap Ym' }).click();

  await expect(page.getByTestId('spark-value')).toContainText('1');
});

test('player can grow stats, evolve, and see Collection update', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'ym-grove-v0.1',
      JSON.stringify({
        state: {
          version: '0.1.0',
          resources: { spark: 400, insight: 0, trust: 0 },
          stats: { intelligence: 4, curiosity: 0, stability: 0, growth: 0, connection: 4 },
          unlocked: {
            core: true,
            ai_agents: false,
            ml_deep_learning: false,
            jepa_vision: false,
            security: false,
            data_analytics: false,
            cloud_infra: false,
            gaming_rl: false,
            research: false,
            education: false,
            premium_pro: false,
            sustainability: false,
            api_integrations: false,
            tools_utilities: false,
          },
          selectedYm: 'core',
          lastOfflineGain: {},
          lastSavedAt: Date.now(),
        },
        version: 0,
      }),
    );
  });
  await page.goto('/');
  await expect(page.getByTestId('spark-value')).toContainText('400');

  await page.getByRole('button', { name: 'Lab' }).click();
  await page.getByRole('button', { name: 'Evolve' }).first().click();

  await page.getByRole('button', { name: 'Collection' }).click();
  await expect(page.getByTestId('collection-card-ai-agents')).toContainText('AI / Agents Ym');
});
