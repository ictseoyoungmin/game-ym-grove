import { describe, expect, it } from 'vitest';
import { applyOfflineGain, applyTapGain } from './resources';
import { createInitialState } from './state';

describe('resources', () => {
  it('adds one Spark when tapping Ym', () => {
    const state = applyTapGain(createInitialState(0));

    expect(state.resources.spark).toBe(1);
  });

  it('applies capped offline gain from production', () => {
    const state = createInitialState(0);
    const next = applyOfflineGain(state, 10_000);

    expect(next.resources.spark).toBeCloseTo(2);
    expect(next.lastSavedAt).toBe(10_000);
  });
});
