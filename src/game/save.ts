import { createInitialState, resourceKeys, statKeys, variantIds } from './state';
import type { GameState } from '../types/game';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function migrateSave(value: unknown, nowMs: number): GameState {
  const fallback = createInitialState(nowMs);
  if (!isRecord(value)) return fallback;

  const resources = isRecord(value.resources) ? value.resources : {};
  const stats = isRecord(value.stats) ? value.stats : {};
  const unlocked = isRecord(value.unlocked) ? value.unlocked : {};
  const revealedHints = isRecord(value.revealedHints) ? value.revealedHints : {};
  const selectedYm = variantIds.includes(value.selectedYm as GameState['selectedYm'])
    ? (value.selectedYm as GameState['selectedYm'])
    : 'core';

  return {
    version: typeof value.version === 'string' ? value.version : fallback.version,
    resources: Object.fromEntries(
      resourceKeys.map((key) => [key, typeof resources[key] === 'number' ? resources[key] : 0]),
    ) as GameState['resources'],
    stats: Object.fromEntries(
      statKeys.map((key) => [key, typeof stats[key] === 'number' ? stats[key] : 0]),
    ) as GameState['stats'],
    unlocked: Object.fromEntries(
      variantIds.map((key) => [key, key === 'core' || unlocked[key] === true]),
    ) as GameState['unlocked'],
    revealedHints: Object.fromEntries(
      variantIds
        .filter((key) => key !== 'core')
        .map((key) => [key, revealedHints[key] === true]),
    ) as GameState['revealedHints'],
    selectedYm: unlocked[selectedYm] === true || selectedYm === 'core' ? selectedYm : 'core',
    lastUnlockedYm: null,
    lastOfflineGain: {},
    lastSavedAt: typeof value.lastSavedAt === 'number' ? value.lastSavedAt : nowMs,
  };
}
