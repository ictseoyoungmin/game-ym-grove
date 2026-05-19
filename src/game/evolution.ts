import { evolutionRules } from '../data/evolutionRules';
import type { EvolutionRule, GameState, ResourceKey, StatKey, YmVariantId } from '../types/game';

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

export function getStatReadyRules(state: GameState): EvolutionRule[] {
  return evolutionRules
    .filter((rule) => !state.unlocked[rule.target])
    .filter((rule) => meetsStatRequirements(state, rule))
    .sort((left, right) => right.priority - left.priority);
}

export function getVisibleEvolutionRules(state: GameState): EvolutionRule[] {
  const readyRules = getStatReadyRules(state);
  if (readyRules.length > 0) return readyRules.slice(0, 3);

  return evolutionRules
    .filter((rule) => !state.unlocked[rule.target])
    .map((rule) => ({
      rule,
      missing: Object.entries(rule.requiredStats).reduce(
        (total, [stat, required]) =>
          total + Math.max(0, (required ?? 0) - state.stats[stat as StatKey]),
        0,
      ),
    }))
    .sort((left, right) => left.missing - right.missing || right.rule.priority - left.rule.priority)
    .slice(0, 3)
    .map(({ rule }) => rule);
}

export function getMissingStats(state: GameState, rule: EvolutionRule): Partial<Record<StatKey, number>> {
  const missing: Partial<Record<StatKey, number>> = {};
  for (const [stat, required] of Object.entries(rule.requiredStats)) {
    const gap = Math.max(0, (required ?? 0) - state.stats[stat as StatKey]);
    if (gap > 0) missing[stat as StatKey] = gap;
  }
  return missing;
}

export function getEvolutionRuleForTarget(
  target: Exclude<YmVariantId, 'core'>,
): EvolutionRule | undefined {
  return evolutionRules.find((rule) => rule.target === target);
}

export function unlockEvolutionCandidate(state: GameState, ruleId: string): GameState {
  const candidate = getEvolutionCandidates(state).find((rule) => rule.id === ruleId);
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
    lastUnlockedYm: candidate.target,
    selectedYm: candidate.target,
  };
}

export function unlockFirstCandidate(state: GameState): GameState {
  const [candidate] = getEvolutionCandidates(state);
  return candidate ? unlockEvolutionCandidate(state, candidate.id) : state;
}
