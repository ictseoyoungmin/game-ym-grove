import { balance } from '../data/balance';
import type { GameState, StatKey } from '../types/game';

const statCostGrowth: Record<StatKey, number> = {
  intelligence: 1,
  curiosity: 1,
  stability: 1,
  growth: 1,
  connection: 1,
};

export function getGrowthCost(state: GameState, stat: StatKey): number {
  const baseCost = balance.growCostSpark + state.stats[stat] * 5 * statCostGrowth[stat];
  const educationDiscount = state.unlocked.education ? 0.9 : 1;
  return Math.max(1, Math.floor(baseCost * educationDiscount));
}

export function growStat(state: GameState, stat: StatKey): GameState {
  const cost = getGrowthCost(state, stat);
  if (state.resources.spark < cost) return state;

  return {
    ...state,
    resources: { ...state.resources, spark: state.resources.spark - cost },
    stats: { ...state.stats, [stat]: state.stats[stat] + 1 },
  };
}
