import rawEvolutionRules from './evolutionRules.json';
import type { EvolutionRule } from '../types/game';

export const evolutionRules = rawEvolutionRules as readonly EvolutionRule[];
