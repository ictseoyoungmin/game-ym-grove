import { describe, expect, it } from 'vitest';
import { evolutionRules } from '../data/evolutionRules';
import { variants } from '../data/variants';

describe('balance data', () => {
  it('has all non-core variants reachable by at least one rule', () => {
    const targets = new Set(evolutionRules.map((rule) => rule.target));

    for (const variant of variants) {
      if (variant.id !== 'core') {
        expect(targets.has(variant.id)).toBe(true);
      }
    }
  });

  it('has no duplicate variant ids', () => {
    const ids = variants.map((variant) => variant.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
