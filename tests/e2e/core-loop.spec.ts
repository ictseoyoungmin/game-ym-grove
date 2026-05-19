import { expect, test, type Page } from '@playwright/test';

const unlocked = {
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
};

function seedGame(page: Page, state: Record<string, unknown>) {
  return page.addInitScript((seedState) => {
    if (window.localStorage.getItem('__ym_e2e_seeded') === 'true') return;

    window.localStorage.setItem(
      'ym-grove-v0.1',
      JSON.stringify({
        state: {
          version: '0.1.0',
          resources: { spark: 0, insight: 0, trust: 0 },
          stats: {
            intelligence: 0,
            curiosity: 0,
            stability: 0,
            growth: 0,
            connection: 0,
          },
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
          revealedHints: {},
          selectedYm: 'core',
          lastUnlockedYm: null,
          lastOfflineGain: {},
          lastSavedAt: Date.now(),
          ...seedState,
        },
        version: 0,
      }),
    );
    window.localStorage.setItem('__ym_e2e_seeded', 'true');
  }, state);
}

test('new-player smoke shows the core grove and collection count', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Ym Grove')).toBeVisible();
  await expect(page.getByText('Core Ym')).toBeVisible();
  await expect(page.getByTestId('spark-value')).toContainText('0');
  await expect(page.getByText('+0.10')).toBeVisible();

  await page.getByRole('button', { name: 'Collection' }).click();
  await expect(page.getByText('1 of 14 Ym are registered')).toBeVisible();
  await expect(page.getByTestId('collection-card-core')).toContainText('Core Ym');
});

test('tap-and-grow increases Spark and a stat', async ({ page }) => {
  await seedGame(page, { resources: { spark: 20, insight: 0, trust: 0 } });
  await page.goto('/');

  await page.getByRole('button', { name: 'Tap Ym' }).click();
  await expect(page.getByTestId('spark-value')).toContainText('21');

  await page.getByRole('button', { name: 'Lab' }).click();
  await page.getByRole('button', { name: /Intelligence/ }).click();
  await expect(page.getByTestId('stat-intelligence')).toContainText('1');
});

test('evolve-first-variant registers and selects AI Agents Ym', async ({ page }) => {
  await seedGame(page, {
    resources: { spark: 180, insight: 0, trust: 0 },
    stats: { intelligence: 3, curiosity: 0, stability: 0, growth: 0, connection: 3 },
  });
  await page.goto('/');

  await page.getByRole('button', { name: 'Lab' }).click();
  await page.getByRole('button', { name: 'Evolve' }).first().click();
  await expect(page.getByTestId('evolution-success')).toContainText('AI / Agents Ym');

  await page.getByRole('button', { name: 'Collection' }).click();
  await expect(page.getByTestId('collection-card-ai-agents')).toContainText('AI / Agents Ym');

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Grove' }).click();
  await expect(page.getByTestId('selected-ym')).toContainText('AI / Agents Ym');
});

test('persist-reload keeps resources, unlocked variants, and selected Ym', async ({ page }) => {
  await seedGame(page, {
    resources: { spark: 42, insight: 5, trust: 0 },
    unlocked: { ...unlocked, ai_agents: true },
    selectedYm: 'ai_agents',
  });
  await page.goto('/');
  await expect(page.getByTestId('selected-ym')).toContainText('AI / Agents Ym');

  await page.reload();

  await expect(page.getByTestId('spark-value')).toContainText('42');
  await expect(page.getByTestId('selected-ym')).toContainText('AI / Agents Ym');
});

test('locked collection cards open hint detail and reveal exact requirements', async ({ page }) => {
  await seedGame(page, { resources: { spark: 0, insight: 5, trust: 0 } });
  await page.goto('/');

  await page.getByRole('button', { name: 'Collection' }).click();
  await page.getByTestId('collection-card-ai-agents').click();
  await expect(page.getByRole('dialog', { name: 'Collection detail' })).toContainText('Locked Ym');

  await page.getByRole('button', { name: /Reveal Hint/ }).click();

  await expect(page.getByRole('dialog', { name: 'Collection detail' })).toContainText(
    'Required stats',
  );
  const savedInsight = await page.evaluate(() => {
    const save = window.localStorage.getItem('ym-grove-v0.1');
    return save ? JSON.parse(save).state.resources.insight : null;
  });
  expect(savedInsight).toBe(0);
});

test('settings reset returns the save to a new core-only game', async ({ page }) => {
  await seedGame(page, {
    resources: { spark: 42, insight: 5, trust: 1 },
    unlocked: { ...unlocked, ai_agents: true },
    selectedYm: 'ai_agents',
  });
  await page.goto('/');

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Reset Game' }).click();
  await page.getByRole('button', { name: 'Confirm Reset' }).click();

  await expect(page.getByTestId('spark-value')).toContainText('0');
  await expect(page.getByTestId('selected-ym')).toContainText('Core Ym');
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const save = window.localStorage.getItem('ym-grove-v0.1');
        return save ? JSON.parse(save).state.selectedYm : null;
      }),
    )
    .toBe('core');

  await page.reload();
  await expect(page.getByTestId('selected-ym')).toContainText('Core Ym');
});

test('mobile layout keeps primary controls visible without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Tap Ym' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lab' })).toBeVisible();

  await page.getByRole('button', { name: 'Lab' }).click();
  await expect(page.getByRole('heading', { name: 'Growth Lab' })).toBeVisible();

  await page.getByRole('button', { name: 'Collection' }).click();
  await expect(page.getByTestId('collection-card-core')).toBeVisible();

  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalScroll).toBe(false);
});
