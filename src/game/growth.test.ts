import { describe, expect, it } from 'vitest';
import { getGrowthCost, growStat } from './growth';
import { createInitialState } from './state';

describe('growth', () => {
  it('spends Spark and increases the requested stat', () => {
    const state = createInitialState(0);
    state.resources.spark = 20;

    const next = growStat(state, 'intelligence');

    expect(next.resources.spark).toBe(0);
    expect(next.stats.intelligence).toBe(1);
  });

  it('increases cost as a stat grows', () => {
    const state = createInitialState(0);
    const firstCost = getGrowthCost(state, 'curiosity');
    state.stats.curiosity = 4;

    expect(getGrowthCost(state, 'curiosity')).toBeGreaterThan(firstCost);
  });
});
