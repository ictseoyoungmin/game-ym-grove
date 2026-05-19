import { balance } from '../data/balance';
import { variantById, variants } from '../data/variants';
import { formatRate } from '../game/format';
import { getProductionPerSecond } from '../game/resources';
import { useGameStore } from '../store/gameStore';
import type { ResourceKey } from '../types/game';

const resourceLabels: Record<ResourceKey, string> = {
  spark: 'Spark',
  insight: 'Insight',
  trust: 'Trust',
};

function formatEffectEntries(effect: Partial<Record<ResourceKey, number>>) {
  const entries = Object.entries(effect);
  if (entries.length === 0) return 'No passive effect';

  return entries
    .map(([resource, value]) => `+${formatRate(value ?? 0)} ${resourceLabels[resource as ResourceKey]}/sec`)
    .join(', ');
}

export function Workspace() {
  const state = useGameStore();
  const production = getProductionPerSecond(state);
  const unlockedVariants = variants.filter((variant) => state.unlocked[variant.id]);
  const unlockedNonCore = unlockedVariants.filter((variant) => variant.id !== 'core');
  const coreSpark = state.unlocked.core ? (variantById.core.effect.spark ?? 0) : 0;
  const directVariantSpark = unlockedNonCore.reduce(
    (total, variant) => total + (variant.effect.spark ?? 0),
    0,
  );
  const networkBonus = state.unlocked.api_integrations ? unlockedVariants.length * 0.03 : 0;
  const multipliers = [
    state.unlocked.sustainability ? 'Sustainability x1.10 Spark' : null,
    state.unlocked.premium_pro ? 'Premium x1.08 all resources' : null,
  ].filter(Boolean);

  return (
    <div className="panel-stack">
      <section className="tool-panel">
        <h2>Workspace</h2>
        <p>{unlockedVariants.length} Ym effects are active automatically in v0.1.</p>
        {unlockedNonCore.length === 0 ? (
          <p className="hint-line">Grow stats in the Lab to register the first variant effect.</p>
        ) : null}
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
      <section className="tool-panel breakdown-grid">
        <div>
          <span>Base/Core</span>
          <strong>{formatRate(balance.baseSparkPerSecond + coreSpark)} Spark/sec</strong>
        </div>
        <div>
          <span>Variant Spark</span>
          <strong>{formatRate(directVariantSpark)} Spark/sec</strong>
        </div>
        <div>
          <span>Network bonus</span>
          <strong>{formatRate(networkBonus)} Spark/sec</strong>
        </div>
        <div>
          <span>Multipliers</span>
          <strong>{multipliers.length > 0 ? multipliers.join(', ') : 'None active'}</strong>
        </div>
      </section>
      <section className="workspace-grid">
        {unlockedVariants.map((variant) => (
          <article className="workspace-card" key={variant.id}>
            <img alt="" src={`/${variant.icon}`} />
            <div>
              <h3>{variant.name}</h3>
              <p>{formatEffectEntries(variant.effect)}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
