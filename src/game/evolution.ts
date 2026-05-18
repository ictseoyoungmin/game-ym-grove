import { evolutionRules } from '../data/evolutionRules';
import type { EvolutionRule, GameState, ResourceKey, StatKey } from '../types/game';

export function canAffordRule(state: GameState, rule: EvolutionRule): boolean {
  return Object.entries(rule.cost).every(
    ([resource, cost]) => state.resources[resource as ResourceKey] >= (cost ?? 0),
  );
}

export function meetsStatRequirements(state: GameState, rule: EvolutionRule): boolean {
  return Object.entries(rule.requiredStats).every(
    ([stat, required]) => state.stats[stat as StatKey] >= (required ?? 0),
  );
}

export function getEvolutionCandidates(state: GameState): EvolutionRule[] {
  return evolutionRules
    .filter((rule) => !state.unlocked[rule.target])
    .filter((rule) => canAffordRule(state, rule))
    .filter((rule) => meetsStatRequirements(state, rule))
    .sort((left, right) => right.priority - left.priority);
}

export function unlockFirstCandidate(state: GameState): GameState {
  const [candidate] = getEvolutionCandidates(state);
  if (!candidate) return state;

  const nextResources = { ...state.resources };
  for (const [resource, cost] of Object.entries(candidate.cost)) {
    nextResources[resource as ResourceKey] -= cost ?? 0;
  }

  return {
    ...state,
    resources: nextResources,
    unlocked: {
      ...state.unlocked,
      [candidate.target]: true,
    },
    selectedYm: candidate.target,
  };
}
