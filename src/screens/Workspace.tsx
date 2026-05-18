import { variants } from '../data/variants';
import { formatRate } from '../game/format';
import { getProductionPerSecond } from '../game/resources';
import { useGameStore } from '../store/gameStore';

export function Workspace() {
  const state = useGameStore();
  const production = getProductionPerSecond(state);
  const unlockedVariants = variants.filter((variant) => state.unlocked[variant.id]);

  return (
    <div className="panel-stack">
      <section className="tool-panel">
        <h2>Workspace</h2>
        <p>{unlockedVariants.length} Ym effects are active automatically in v0.1.</p>
      </section>
      <section className="tool-panel production-grid">
        <div>
          <span>Spark/sec</span>
          <strong>{formatRate(production.spark)}</strong>
        </div>
        <div>
          <span>Insight/sec</span>
          <strong>{formatRate(production.insight)}</strong>
        </div>
        <div>
          <span>Trust/sec</span>
          <strong>{formatRate(production.trust)}</strong>
        </div>
      </section>
      <section className="workspace-grid">
        {unlockedVariants.map((variant) => (
          <article className="workspace-card" key={variant.id}>
            <img alt="" src={`/${variant.icon}`} />
            <div>
              <h3>{variant.name}</h3>
              <p>
                {Object.entries(variant.effect)
                  .map(([resource, value]) => `+${formatRate(value ?? 0)} ${resource}/sec`)
                  .join(', ')}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
