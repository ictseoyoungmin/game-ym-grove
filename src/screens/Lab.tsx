import { evolutionRules } from '../data/evolutionRules';
import { getEvolutionCandidates } from '../game/evolution';
import { statKeys } from '../game/state';
import { useGameStore } from '../store/gameStore';
import type { StatKey } from '../types/game';

const statLabels: Record<StatKey, string> = {
  intelligence: 'Intelligence',
  curiosity: 'Curiosity',
  stability: 'Stability',
  growth: 'Growth',
  connection: 'Connection',
};

export function Lab() {
  const state = useGameStore();
  const growStat = useGameStore((store) => store.growStat);
  const evolve = useGameStore((store) => store.evolve);
  const [candidate] = getEvolutionCandidates(state);
  const nextHint = candidate?.hint ?? evolutionRules[0]?.hint ?? 'Grow your stats to reveal a path.';

  return (
    <div className="panel-stack">
      <section className="tool-panel">
        <h2>Growth Lab</h2>
        <div className="stat-list">
          {statKeys.map((stat) => (
            <button key={stat} onClick={() => growStat(stat)} type="button">
              <span>{statLabels[stat]}</span>
              <strong>{state.stats[stat]}</strong>
            </button>
          ))}
        </div>
      </section>
      <section className="tool-panel">
        <h2>Evolution</h2>
        <p>{nextHint}</p>
        <button className="primary-action" disabled={!candidate} onClick={evolve} type="button">
          Evolve
        </button>
      </section>
    </div>
  );
}
