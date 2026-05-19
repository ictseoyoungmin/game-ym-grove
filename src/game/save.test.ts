import { describe, expect, it } from 'vitest';
import { migrateSave } from './save';

describe('save migration', () => {
  it('recovers a corrupted save with defaults', () => {
    const state = migrateSave('broken', 123);

    expect(state.version).toBe('0.1.0');
    expect(state.unlocked.core).toBe(true);
    expect(state.lastSavedAt).toBe(123);
  });

  it('keeps known saved values and fills missing fields', () => {
    const state = migrateSave(
      {
        resources: { spark: 42 },
        stats: { curiosity: 3 },
        unlocked: { core: true, research: true },
        selectedYm: 'research',
        lastSavedAt: 100,
      },
      123,
    );

    expect(state.resources.spark).toBe(42);
    expect(state.resources.trust).toBe(0);
    expect(state.stats.curiosity).toBe(3);
    expect(state.unlocked.research).toBe(true);
    expect(state.revealedHints.ai_agents).toBe(false);
    expect(state.lastUnlockedYm).toBeNull();
    expect(state.lastOfflineGain).toEqual({});
  });

  it('keeps revealed hint state across migrations', () => {
    const state = migrateSave(
      {
        revealedHints: { ai_agents: true, research: 'true' },
        lastUnlockedYm: 'research',
      },
      123,
    );

    expect(state.revealedHints.ai_agents).toBe(true);
    expect(state.revealedHints.research).toBe(false);
    expect(state.lastUnlockedYm).toBeNull();
  });

  it('falls back to Core when a selected Ym is still locked', () => {
    const state = migrateSave(
      {
        unlocked: { core: true, ai_agents: false },
        selectedYm: 'ai_agents',
      },
      123,
    );

    expect(state.selectedYm).toBe('core');
  });
});
