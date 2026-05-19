import { balance } from '../data/balance';
import { variants } from '../data/variants';
import type { GameState, ResourceKey } from '../types/game';

export function getProductionPerSecond(state: GameState): Record<ResourceKey, number> {
  const production = variants.reduce(
    (totals, variant) => {
      if (!state.unlocked[variant.id]) return totals;

      for (const [resource, value] of Object.entries(variant.effect)) {
        totals[resource as ResourceKey] += value ?? 0;
      }

      return totals;
    },
    { spark: 0, insight: 0, trust: 0 },
  );

  if (state.unlocked.sustainability) {
    production.spark *= 1.1;
  }

  if (state.unlocked.premium_pro) {
    production.spark *= 1.08;
    production.insight *= 1.08;
    production.trust *= 1.08;
  }

  if (state.unlocked.api_integrations) {
    production.spark += variants.filter((variant) => state.unlocked[variant.id]).length * 0.03;
  }

  return production;
}

export function applyTapGain(state: GameState): GameState {
  const gamingBonus = state.unlocked.gaming_rl ? 1 : 0;

  return {
    ...state,
    resources: {
      ...state.resources,
      spark: state.resources.spark + balance.tapSpark + gamingBonus,
    },
  };
}

export function applyOfflineGain(state: GameState, nowMs: number): GameState {
  const elapsedMs = Math.max(0, Math.min(nowMs - state.lastSavedAt, balance.offlineCapMs));
  const elapsedSeconds = elapsedMs / 1000;
  const production = getProductionPerSecond(state);
  const gain = {
    spark: production.spark * elapsedSeconds,
    insight: production.insight * elapsedSeconds,
    trust: production.trust * elapsedSeconds,
  };

  return {
    ...state,
    resources: {
      spark: state.resources.spark + gain.spark,
      insight: state.resources.insight + gain.insight,
      trust: state.resources.trust + gain.trust,
    },
    lastOfflineGain: gain,
    lastSavedAt: nowMs,
  };
}

export function applyPassiveTick(state: GameState, nowMs: number): GameState {
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
