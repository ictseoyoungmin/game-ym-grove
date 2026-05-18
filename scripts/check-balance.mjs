import fs from 'node:fs';

const variants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));
const rules = JSON.parse(fs.readFileSync('src/data/evolutionRules.json', 'utf8'));
const variantIds = new Set(variants.map((variant) => variant.id));
const ruleTargets = new Set(rules.map((rule) => rule.target));
let failed = false;

function fail(message) {
  console.error(message);
  failed = true;
}

for (const variant of variants) {
  if (variant.id !== 'core' && !ruleTargets.has(variant.id)) {
    fail(`Missing evolution rule for variant: ${variant.id}`);
  }

  for (const value of Object.values(variant.effect ?? {})) {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      fail(`Invalid production effect for ${variant.id}`);
    }
  }
}

for (const rule of rules) {
  if (!variantIds.has(rule.target)) {
    fail(`Rule target does not exist in variants: ${rule.id} -> ${rule.target}`);
  }

  for (const value of Object.values(rule.cost ?? {})) {
    if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
      fail(`Invalid evolution cost in ${rule.id}`);
    }
  }
}

const duplicateConditions = new Map();
for (const rule of rules) {
  const signature = JSON.stringify(rule.requiredStats ?? {});
  if (duplicateConditions.has(signature)) {
    fail(`Duplicate evolution condition: ${duplicateConditions.get(signature)} and ${rule.id}`);
  }
  duplicateConditions.set(signature, rule.id);
}

if (failed) process.exit(1);
console.log(`Balance check passed: ${variants.length} variants, ${rules.length} rules`);
