import { describe, expect, it } from 'vitest';
import { getEvolutionCandidates, unlockFirstCandidate } from './evolution';
import { createInitialState } from './state';

describe('evolution', () => {
  it('selects a candidate when stats and costs are satisfied', () => {
    const state = createInitialState(0);
    state.resources.spark = 300;
    state.stats.intelligence = 4;
    state.stats.connection = 4;

    const [candidate] = getEvolutionCandidates(state);

    expect(candidate?.target).toBe('ai_agents');
  });

  it('unlocks the highest priority candidate', () => {
    const state = createInitialState(0);
    state.resources.spark = 300;
    state.stats.intelligence = 4;
    state.stats.connection = 4;

    const next = unlockFirstCandidate(state);

    expect(next.unlocked.ai_agents).toBe(true);
    expect(next.resources.spark).toBe(0);
  });
});
