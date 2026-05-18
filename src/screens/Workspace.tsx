import { variants } from '../data/variants';
import { getProductionPerSecond } from '../game/resources';
import { useGameStore } from '../store/gameStore';

export function Workspace() {
  const state = useGameStore();
  const production = getProductionPerSecond(state);
  const unlockedCount = variants.filter((variant) => state.unlocked[variant.id]).length;

  return (
    <div className="panel-stack">
      <section className="tool-panel">
        <h2>Workspace</h2>
        <p>{unlockedCount} Ym effects are active automatically in v0.1.</p>
      </section>
      <section className="tool-panel production-grid">
        <div>
          <span>Spark/sec</span>
          <strong>{production.spark.toFixed(2)}</strong>
        </div>
        <div>
          <span>Insight/sec</span>
          <strong>{production.insight.toFixed(2)}</strong>
        </div>
        <div>
          <span>Trust/sec</span>
          <strong>{production.trust.toFixed(2)}</strong>
        </div>
      </section>
    </div>
  );
}
