export type ResourceKey = 'spark' | 'insight' | 'trust';

export type StatKey =
  | 'intelligence'
  | 'curiosity'
  | 'stability'
  | 'growth'
  | 'connection';

export type YmVariantId =
  | 'core'
  | 'ai_agents'
  | 'ml_deep_learning'
  | 'jepa_vision'
  | 'security'
  | 'data_analytics'
  | 'cloud_infra'
  | 'gaming_rl'
  | 'research'
  | 'education'
  | 'premium_pro'
  | 'sustainability'
  | 'api_integrations'
  | 'tools_utilities';

export interface YmVariant {
  id: YmVariantId;
  name: string;
  icon: string;
  tags: string[];
  effect: Partial<Record<ResourceKey, number>>;
  description: string;
}

export interface EvolutionRule {
  id: string;
  target: Exclude<YmVariantId, 'core'>;
  priority: number;
  cost: Partial<Record<ResourceKey, number>>;
  requiredStats: Partial<Record<StatKey, number>>;
  hint: string;
}

export interface GameState {
  version: string;
  resources: Record<ResourceKey, number>;
  stats: Record<StatKey, number>;
  unlocked: Record<YmVariantId, boolean>;
  revealedHints: Partial<Record<Exclude<YmVariantId, 'core'>, boolean>>;
  selectedYm: YmVariantId;
  lastUnlockedYm: YmVariantId | null;
  lastOfflineGain: Partial<Record<ResourceKey, number>>;
  lastSavedAt: number;
}
