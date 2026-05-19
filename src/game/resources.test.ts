import { describe, expect, it } from 'vitest';
import { applyOfflineGain, applyPassiveTick, applyTapGain, getProductionPerSecond } from './resources';
import { createInitialState } from './state';

describe('resources', () => {
  it('uses Core Ym effect as the starting production source', () => {
    const state = createInitialState(0);

    expect(getProductionPerSecond(state).spark).toBeCloseTo(0.1);
  });

  it('adds one Spark when tapping Ym', () => {
    const state = applyTapGain(createInitialState(0));

    expect(state.resources.spark).toBe(1);
  });

  it('applies capped offline gain from production', () => {
    const state = createInitialState(0);
    const next = applyOfflineGain(state, 10_000);

    expect(next.resources.spark).toBeCloseTo(1);
    expect(next.lastOfflineGain.spark).toBeCloseTo(1);
    expect(next.lastSavedAt).toBe(10_000);
  });

  it('applies passive production without replacing the offline gain banner payload', () => {
    const state = createInitialState(0);
    state.lastOfflineGain = { spark: 4 };

    const next = applyPassiveTick(state, 10_000);

    expect(next.resources.spark).toBeCloseTo(1);
    expect(next.lastOfflineGain.spark).toBe(4);
    expect(next.lastSavedAt).toBe(10_000);
  });
});
