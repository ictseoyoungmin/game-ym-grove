import type { ResourceKey } from '../types/game';
import { formatNumber } from '../game/format';

const labels: Record<ResourceKey, string> = {
  spark: 'Spark',
  insight: 'Insight',
  trust: 'Trust',
};

interface ResourceBarProps {
  resources: Record<ResourceKey, number>;
}

export function ResourceBar({ resources }: ResourceBarProps) {
  return (
    <dl className="resource-bar" aria-label="Resources">
      {Object.entries(resources).map(([key, value]) => (
        <div className="resource-item" key={key}>
          <dt>{labels[key as ResourceKey]}</dt>
          <dd data-testid={`${key}-value`}>{formatNumber(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
