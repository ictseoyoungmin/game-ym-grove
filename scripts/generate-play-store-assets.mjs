/* global window */

import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreLogoSvg = await readFile(path.join(rootDir, 'public/assets/ym/core-brand.svg'), 'utf8');
const outputDir = path.join(rootDir, 'play-store-assets');
const screenshotDir = path.join(outputDir, 'screenshots/phone');
const appUrl = process.env.YM_GROVE_APP_URL ?? 'http://127.0.0.1:4173';

const launcherSizes = [
  ['mipmap-mdpi', 48, 108],
  ['mipmap-hdpi', 72, 162],
  ['mipmap-xhdpi', 96, 216],
  ['mipmap-xxhdpi', 144, 324],
  ['mipmap-xxxhdpi', 192, 432],
];

const unlocked = {
  core: true,
  ai_agents: true,
  ml_deep_learning: true,
  jepa_vision: false,
  security: true,
  data_analytics: true,
  cloud_infra: false,
  gaming_rl: false,
  research: true,
  education: false,
  premium_pro: false,
  sustainability: false,
  api_integrations: false,
  tools_utilities: false,
};

const demoState = {
  version: '0.1.0',
  resources: { spark: 1240, insight: 32, trust: 14 },
  stats: { intelligence: 5, curiosity: 4, stability: 3, growth: 4, connection: 6 },
  unlocked,
  revealedHints: { ai_agents: true, data_analytics: true, security: true },
  selectedYm: 'core',
  lastUnlockedYm: null,
  lastOfflineGain: {},
  lastSavedAt: Date.now(),
};

async function renderPng(browser, outputPath, size, options = {}) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const radius = options.radius ?? 0;
  const padding = options.padding ?? 0;
  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <style>
          html, body {
            width: ${size}px;
            height: ${size}px;
            margin: 0;
            overflow: hidden;
            background: transparent;
          }
          .frame {
            width: ${size}px;
            height: ${size}px;
            display: grid;
            place-items: center;
            overflow: hidden;
            border-radius: ${radius}px;
            background: #ffffff;
          }
          svg {
            width: ${size - padding * 2}px;
            height: ${size - padding * 2}px;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="frame">${coreLogoSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: outputPath, omitBackground: true });
  await page.close();
}

async function seedApp(page) {
  await page.addInitScript((state) => {
    window.localStorage.setItem(
      'ym-grove-v0.1',
      JSON.stringify({ state, version: 0 }),
    );
  }, demoState);
}

async function captureScreen(browser, fileName, action) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  await seedApp(page);
  await page.goto(appUrl, { waitUntil: 'networkidle' });
  await action(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotDir, fileName), fullPage: false });
  await page.close();
}

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

await renderPng(browser, path.join(outputDir, 'icon-512.png'), 512, { radius: 96, padding: 0 });

for (const [density, iconSize, foregroundSize] of launcherSizes) {
  const mipmapDir = path.join(rootDir, `android/app/src/main/res/${density}`);
  await mkdir(mipmapDir, { recursive: true });
  await renderPng(browser, path.join(mipmapDir, 'ic_launcher.png'), iconSize, {
    radius: Math.round(iconSize * 0.22),
    padding: 0,
  });
  await renderPng(browser, path.join(mipmapDir, 'ic_launcher_round.png'), iconSize, {
    radius: Math.round(iconSize / 2),
    padding: 0,
  });
  await renderPng(browser, path.join(mipmapDir, 'ic_launcher_foreground.png'), foregroundSize, {
    radius: Math.round(foregroundSize * 0.22),
    padding: Math.round(foregroundSize * 0.14),
  });
}

await captureScreen(browser, '01-grove.png', async () => {});
await captureScreen(browser, '02-lab.png', async (page) => {
  await page.getByRole('button', { name: 'Lab' }).click();
});
await captureScreen(browser, '03-collection.png', async (page) => {
  await page.getByRole('button', { name: 'Collection' }).click();
});
await captureScreen(browser, '04-workspace.png', async (page) => {
  await page.getByRole('button', { name: 'Workspace' }).click();
});

await browser.close();

console.log(`Generated Play Store assets in ${path.relative(rootDir, outputDir)}`);
