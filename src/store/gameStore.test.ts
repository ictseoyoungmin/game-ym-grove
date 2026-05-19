import { describe, expect, it, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { createInitialState } from '../game/state';

describe('game store actions', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState(createInitialState(0));
  });

  it('resets the game to a new initial state', () => {
    useGameStore.setState({
      ...createInitialState(0),
      resources: { spark: 20, insight: 3, trust: 2 },
      unlocked: { ...createInitialState(0).unlocked, ai_agents: true },
      revealedHints: { ai_agents: true },
      selectedYm: 'ai_agents',
      lastUnlockedYm: 'ai_agents',
    });

    useGameStore.getState().resetGame(500);

    const state = useGameStore.getState();
    expect(state.resources.spark).toBe(0);
    expect(state.unlocked.core).toBe(true);
    expect(state.unlocked.ai_agents).toBe(false);
    expect(state.revealedHints).toEqual({});
    expect(state.lastUnlockedYm).toBeNull();
    expect(state.selectedYm).toBe('core');
    expect(state.lastSavedAt).toBe(500);
  });

  it('taps, claims offline gain, and ticks passive production', () => {
    useGameStore.getState().tapYm();
    expect(useGameStore.getState().resources.spark).toBe(1);

    useGameStore.getState().claimOfflineGain(10_000);
    expect(useGameStore.getState().resources.spark).toBeCloseTo(2);
    expect(useGameStore.getState().lastOfflineGain.spark).toBeCloseTo(1);

    useGameStore.getState().tickProduction(20_000);
    expect(useGameStore.getState().resources.spark).toBeCloseTo(3);
    expect(useGameStore.getState().lastOfflineGain.spark).toBeCloseTo(1);
  });

  it('grows a stat when enough Spark is available', () => {
    useGameStore.setState({
      ...createInitialState(0),
      resources: { spark: 20, insight: 0, trust: 0 },
    });

    useGameStore.getState().growStat('growth');

    expect(useGameStore.getState().stats.growth).toBe(1);
    expect(useGameStore.getState().resources.spark).toBe(0);
  });

  it('evolves by rule, records the event, and spends the cost', () => {
    useGameStore.setState({
      ...createInitialState(0),
      resources: { spark: 180, insight: 0, trust: 0 },
      stats: {
        intelligence: 3,
        curiosity: 0,
        stability: 0,
        growth: 0,
        connection: 3,
      },
    });

    useGameStore.getState().evolveByRule('rule_ai_agents');

    const state = useGameStore.getState();
    expect(state.unlocked.ai_agents).toBe(true);
    expect(state.selectedYm).toBe('ai_agents');
    expect(state.lastUnlockedYm).toBe('ai_agents');
    expect(state.resources.spark).toBe(0);
  });

  it('only selects unlocked variants', () => {
    useGameStore.getState().selectYm('ai_agents');
    expect(useGameStore.getState().selectedYm).toBe('core');

    useGameStore.setState({
      ...createInitialState(0),
      unlocked: { ...createInitialState(0).unlocked, ai_agents: true },
    });
    useGameStore.getState().selectYm('ai_agents');

    expect(useGameStore.getState().selectedYm).toBe('ai_agents');
  });

  it('reveals evolution hints with Insight', () => {
    useGameStore.setState({
      ...createInitialState(0),
      resources: { spark: 0, insight: 5, trust: 0 },
    });

    useGameStore.getState().revealHint('ai_agents');

    expect(useGameStore.getState().revealedHints.ai_agents).toBe(true);
    expect(useGameStore.getState().resources.insight).toBe(0);
  });

  it('does not spend Insight twice for an already revealed hint', () => {
    useGameStore.setState({
      ...createInitialState(0),
      resources: { spark: 0, insight: 10, trust: 0 },
      revealedHints: { ai_agents: true },
    });

    useGameStore.getState().revealHint('ai_agents');

    expect(useGameStore.getState().resources.insight).toBe(10);
  });

  it('does not convert Insight to Trust when Insight is too low', () => {
    useGameStore.setState({
      ...createInitialState(0),
      resources: { spark: 0, insight: 4, trust: 0 },
    });

    useGameStore.getState().spendInsightForTrust();

    expect(useGameStore.getState().resources).toEqual({ spark: 0, insight: 4, trust: 0 });
  });

  it('clears only the transient evolution event', () => {
    useGameStore.setState({
      ...createInitialState(0),
      resources: { spark: 11, insight: 0, trust: 0 },
      selectedYm: 'ai_agents',
      lastUnlockedYm: 'ai_agents',
    });

    useGameStore.getState().clearEvolutionEvent();

    expect(useGameStore.getState().lastUnlockedYm).toBeNull();
    expect(useGameStore.getState().resources.spark).toBe(11);
    expect(useGameStore.getState().selectedYm).toBe('ai_agents');
  });
});
