import type { GameState, ResourceKey, StatKey, YmVariantId } from '../types/game';

export const resourceKeys: readonly ResourceKey[] = ['spark', 'insight', 'trust'];
export const statKeys: readonly StatKey[] = [
  'intelligence',
  'curiosity',
  'stability',
  'growth',
  'connection',
];

export const variantIds: readonly YmVariantId[] = [
  'core',
  'ai_agents',
  'ml_deep_learning',
  'jepa_vision',
  'security',
  'data_analytics',
  'cloud_infra',
  'gaming_rl',
  'research',
  'education',
  'premium_pro',
  'sustainability',
  'api_integrations',
  'tools_utilities',
];

export function createInitialState(nowMs: number): GameState {
  return {
    version: '0.1.0',
    resources: { spark: 0, insight: 0, trust: 0 },
    stats: {
      intelligence: 0,
      curiosity: 0,
      stability: 0,
      growth: 0,
      connection: 0,
    },
    unlocked: Object.fromEntries(variantIds.map((id) => [id, id === 'core'])) as GameState['unlocked'],
    selectedYm: 'core',
    lastSavedAt: nowMs,
  };
}
