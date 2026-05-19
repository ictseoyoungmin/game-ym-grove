import { balance } from '../data/balance';
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
  const revealHint = useGameStore((store) => store.revealHint);
  const clearEvolutionEvent = useGameStore((store) => store.clearEvolutionEvent);
  const spendInsightForTrust = useGameStore((store) => store.spendInsightForTrust);
  const visibleRules = getVisibleEvolutionRules(state);
  const lastUnlocked = state.lastUnlockedYm ? variantById[state.lastUnlockedYm] : null;

  function formatCost(cost: Partial<Record<ResourceKey, number>>) {
    return Object.entries(cost)
      .map(([resource, value]) => `${formatNumber(value ?? 0)} ${resource}`)
      .join(' + ');
  }

  return (
    <div className="panel-stack">
      <section className="tool-panel lab-feed-panel">
        <div>
          <h2>Growth Lab</h2>
          <p>Feed one growth direction at a time, then evolve when the grove lines up.</p>
        </div>
        <div className="stat-list">
          {statKeys.map((stat) => (
            <button
              className="feed-button"
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
              <span className="stat-meter" aria-hidden="true">
                <span style={{ width: `${Math.min(100, state.stats[stat] * 14)}%` }} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="tool-panel evolve-panel">
        <div className="panel-heading">
          <h2>Evolution</h2>
          <button
            disabled={state.resources.insight < 5}
            onClick={spendInsightForTrust}
            type="button"
          >
            Convert Insight
          </button>
        </div>
        {lastUnlocked ? (
          <div className="evolution-success" data-testid="evolution-success">
            <img alt="" src={`/${lastUnlocked.icon}`} />
            <div>
              <strong>New Ym Registered</strong>
              <span>{lastUnlocked.name} joined the grove.</span>
            </div>
            <button onClick={clearEvolutionEvent} type="button">
              Close
            </button>
          </div>
        ) : null}
        <div className="evolution-list">
          {visibleRules.map((rule) => {
            const target = variantById[rule.target];
            const affordable = canAffordRule(state, rule);
            const ready = meetsStatRequirements(state, rule);
            const missing = getMissingStats(state, rule);
            const revealed = state.revealedHints[rule.target] === true;

            return (
              <article className="evolution-card" key={rule.id}>
                <img alt="" src={`/${target.icon}`} />
                <div>
                  <div className="card-title-row">
                    <h3>{target.name}</h3>
                    <span className={ready && affordable ? 'status-pill is-ready' : 'status-pill'}>
                      {ready && affordable ? 'Ready' : ready ? 'Need Spark' : 'Training'}
                    </span>
                  </div>
                  <p>{revealed ? rule.hint : `Direction: ${target.tags.join(' + ')}`}</p>
                  {revealed ? (
                    <p className="hint-line">
                      {Object.keys(missing).length > 0
                        ? `Needs ${Object.entries(missing)
                            .map(([stat, value]) => `${value} ${stat}`)
                            .join(', ')}`
                        : `Cost ${formatCost(rule.cost)}`}
                    </p>
                  ) : ready ? (
                    <p className="hint-line">Stats aligned. Cost {formatCost(rule.cost)}</p>
                  ) : (
                    <p className="hint-line">
                      Direction: {target.tags.join(' + ')}. Reveal exact stats with{' '}
                      {balance.hintCostInsight} Insight.
                    </p>
                  )}
                </div>
                {!revealed ? (
                  <button
                    disabled={state.resources.insight < balance.hintCostInsight}
                    onClick={() => revealHint(rule.target)}
                    type="button"
                  >
                    Reveal
                  </button>
                ) : null}
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
