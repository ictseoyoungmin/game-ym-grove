import { variantById } from '../data/variants';
import {
  canAffordRule,
  getMissingStats,
  getVisibleEvolutionRules,
  meetsStatRequirements,
} from '../game/evolution';
import { formatNumber } from '../game/format';
import { getGrowthCost } from '../game/growth';
import { statKeys } from '../game/state';
import { useGameStore } from '../store/gameStore';
import type { ResourceKey, StatKey } from '../types/game';

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
  const evolveByRule = useGameStore((store) => store.evolveByRule);
  const spendInsightForTrust = useGameStore((store) => store.spendInsightForTrust);
  const visibleRules = getVisibleEvolutionRules(state);

  function formatCost(cost: Partial<Record<ResourceKey, number>>) {
    return Object.entries(cost)
      .map(([resource, value]) => `${formatNumber(value ?? 0)} ${resource}`)
      .join(' + ');
  }

  return (
    <div className="panel-stack">
      <section className="tool-panel">
        <h2>Growth Lab</h2>
        <div className="stat-list">
          {statKeys.map((stat) => (
            <button
              disabled={state.resources.spark < getGrowthCost(state, stat)}
              key={stat}
              onClick={() => growStat(stat)}
              type="button"
            >
              <span>
                {statLabels[stat]}
                <small>{formatNumber(getGrowthCost(state, stat))} Spark</small>
              </span>
              <strong data-testid={`stat-${stat}`}>{state.stats[stat]}</strong>
            </button>
          ))}
        </div>
      </section>
      <section className="tool-panel">
        <div className="panel-heading">
          <h2>Evolution</h2>
          <button
            disabled={state.resources.insight < 5}
            onClick={spendInsightForTrust}
            type="button"
          >
            Stabilize
          </button>
        </div>
        <div className="evolution-list">
          {visibleRules.map((rule) => {
            const target = variantById[rule.target];
            const affordable = canAffordRule(state, rule);
            const ready = meetsStatRequirements(state, rule);
            const missing = getMissingStats(state, rule);

            return (
              <article className="evolution-card" key={rule.id}>
                <img alt="" src={`/${target.icon}`} />
                <div>
                  <h3>{target.name}</h3>
                  <p>{rule.hint}</p>
                  {Object.keys(missing).length > 0 ? (
                    <p className="hint-line">
                      Needs{' '}
                      {Object.entries(missing)
                        .map(([stat, value]) => `${value} ${stat}`)
                        .join(', ')}
                    </p>
                  ) : (
                    <p className="hint-line">Cost {formatCost(rule.cost)}</p>
                  )}
                </div>
                <button
                  className="primary-action"
                  disabled={!ready || !affordable}
                  onClick={() => evolveByRule(rule.id)}
                  type="button"
                >
                  Evolve
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
