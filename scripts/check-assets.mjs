import fs from 'node:fs';
import path from 'node:path';

const variants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));
const root = path.resolve('public');
let failed = false;

for (const variant of variants) {
  const fullPath = path.join(root, variant.icon);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing asset: ${variant.id} -> ${variant.icon}`);
    failed = true;
  }

  if (!variant.icon.endsWith('.svg')) {
    console.error(`Non-SVG icon in v0.1: ${variant.id}`);
    failed = true;
  }

  if (fs.existsSync(fullPath)) {
    const svg = fs.readFileSync(fullPath, 'utf8');
    if (svg.includes('<image') || svg.includes('href=')) {
      console.error(`SVG must be vectorized, not PNG-linked: ${variant.id}`);
      failed = true;
    }

    if (!svg.includes('<path')) {
      console.error(`SVG has no vector path data: ${variant.id}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Asset check passed: ${variants.length} variants`);
