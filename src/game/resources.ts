import { balance } from '../data/balance';
import { variants } from '../data/variants';
import type { GameState, ResourceKey } from '../types/game';

export function getProductionPerSecond(state: GameState): Record<ResourceKey, number> {
  return variants.reduce(
    (totals, variant) => {
      if (!state.unlocked[variant.id]) return totals;

      for (const [resource, value] of Object.entries(variant.effect)) {
        totals[resource as ResourceKey] += value ?? 0;
      }

      return totals;
    },
    { spark: balance.baseSparkPerSecond, insight: 0, trust: 0 },
  );
}

export function applyTapGain(state: GameState): GameState {
  return {
    ...state,
    resources: {
      ...state.resources,
      spark: state.resources.spark + balance.tapSpark,
    },
  };
}

export function applyOfflineGain(state: GameState, nowMs: number): GameState {
  const elapsedMs = Math.max(0, Math.min(nowMs - state.lastSavedAt, balance.offlineCapMs));
  const elapsedSeconds = elapsedMs / 1000;
  const production = getProductionPerSecond(state);

  return {
    ...state,
    resources: {
      spark: state.resources.spark + production.spark * elapsedSeconds,
      insight: state.resources.insight + production.insight * elapsedSeconds,
      trust: state.resources.trust + production.trust * elapsedSeconds,
    },
    lastSavedAt: nowMs,
  };
}
