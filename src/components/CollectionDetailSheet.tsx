import { balance } from '../data/balance';
import { getEvolutionRuleForTarget, getMissingStats } from '../game/evolution';
import { formatNumber, formatRate } from '../game/format';
import type { GameState, ResourceKey, StatKey, YmVariant, YmVariantId } from '../types/game';

const resourceLabels: Record<ResourceKey, string> = {
  spark: 'Spark',
  insight: 'Insight',
  trust: 'Trust',
};

const statLabels: Record<StatKey, string> = {
  intelligence: 'Intelligence',
  curiosity: 'Curiosity',
  stability: 'Stability',
  growth: 'Growth',
  connection: 'Connection',
};

interface CollectionDetailSheetProps {
  state: GameState;
  unlocked: boolean;
  selected: boolean;
  variant: YmVariant;
  onClose: () => void;
  onReveal: (id: Exclude<YmVariantId, 'core'>) => void;
  onSelect: (id: YmVariantId) => void;
}

function formatEffect(effect: YmVariant['effect']) {
  const entries = Object.entries(effect);
  if (entries.length === 0) return 'No passive effect';

  return entries
    .map(([resource, value]) => `+${formatRate(value ?? 0)} ${resourceLabels[resource as ResourceKey]}/sec`)
    .join(', ');
}

function formatCost(cost: Partial<Record<ResourceKey, number>>) {
  return Object.entries(cost)
    .map(([resource, value]) => `${formatNumber(value ?? 0)} ${resourceLabels[resource as ResourceKey]}`)
    .join(' + ');
}

function formatRequirements(requiredStats: Partial<Record<StatKey, number>>) {
  return Object.entries(requiredStats)
    .map(([stat, value]) => `${statLabels[stat as StatKey]} ${value ?? 0}`)
    .join(', ');
}

function formatMissing(missingStats: Partial<Record<StatKey, number>>) {
  const entries = Object.entries(missingStats);
  if (entries.length === 0) return 'Ready after the Spark cost is available.';

  return entries
    .map(([stat, value]) => `${statLabels[stat as StatKey]} +${value ?? 0}`)
    .join(', ');
}

export function CollectionDetailSheet({
  onClose,
  onReveal,
  onSelect,
  selected,
  state,
  unlocked,
  variant,
}: CollectionDetailSheetProps) {
  const targetId = variant.id === 'core' ? null : (variant.id as Exclude<YmVariantId, 'core'>);
  const rule = targetId ? getEvolutionRuleForTarget(targetId) : undefined;
  const revealed = targetId ? state.revealedHints[targetId] === true : true;
  const canReveal = state.resources.insight >= balance.hintCostInsight;
  const missing = rule ? getMissingStats(state, rule) : {};

  return (
    <section className="detail-sheet" aria-label="Collection detail" role="dialog" aria-modal="false">
      <div className="detail-sheet-media">
        <img alt="" src={`/${variant.icon}`} />
      </div>
      <div className="detail-sheet-body">
        <div className="detail-sheet-heading">
          <div>
            <p className="eyebrow">{unlocked ? 'Registered Ym' : 'Locked Ym'}</p>
            <h2>{unlocked ? variant.name : 'Locked Ym'}</h2>
          </div>
          <button className="icon-action" onClick={onClose} type="button" aria-label="Close detail">
            x
          </button>
        </div>

        <div className="tag-row" aria-label="Tags">
          {variant.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        {unlocked ? (
          <>
            <p>{variant.description}</p>
            <dl className="detail-list">
              <div>
                <dt>Effect</dt>
                <dd>{formatEffect(variant.effect)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selected ? 'Active in the grove' : 'Registered, not selected'}</dd>
              </div>
            </dl>
            <button
              className="primary-action"
              disabled={selected}
              onClick={() => onSelect(variant.id)}
              type="button"
            >
              {selected ? 'Active' : 'Select Ym'}
            </button>
          </>
        ) : (
          <>
            <p>
              {revealed
                ? (rule?.hint ?? 'Train more in the Lab to reveal this Ym.')
                : `Direction: ${variant.tags.join(' + ')}`}
            </p>
            {rule && revealed ? (
              <dl className="detail-list">
                <div>
                  <dt>Required stats</dt>
                  <dd>{formatRequirements(rule.requiredStats)}</dd>
                </div>
                <div>
                  <dt>Still needed</dt>
                  <dd>{formatMissing(missing)}</dd>
                </div>
                <div>
                  <dt>Evolution cost</dt>
                  <dd>{formatCost(rule.cost)}</dd>
                </div>
              </dl>
            ) : (
              <p className="hint-line">
                Reveal the exact stat route with {balance.hintCostInsight} Insight, or keep training
                toward these tags.
              </p>
            )}
            {targetId && !revealed ? (
              <button disabled={!canReveal} onClick={() => onReveal(targetId)} type="button">
                Reveal Hint
                <small>{balance.hintCostInsight} Insight</small>
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
