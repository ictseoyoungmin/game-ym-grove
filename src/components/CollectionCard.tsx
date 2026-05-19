import type { CSSProperties } from 'react';
import type { YmVariant } from '../types/game';

interface CollectionCardProps {
  index?: number;
  selected?: boolean;
  unlocked: boolean;
  variant: YmVariant;
  onOpen: () => void;
}

export function CollectionCard({
  index = 0,
  onOpen,
  selected = false,
  unlocked,
  variant,
}: CollectionCardProps) {
  return (
    <button
      aria-pressed={selected}
      className={unlocked ? 'collection-card is-unlocked' : 'collection-card'}
      data-testid={`collection-card-${variant.id.replaceAll('_', '-')}`}
      onClick={onOpen}
      style={{ '--card-index': index } as CSSProperties}
      type="button"
    >
      <span className="collection-badge">{unlocked ? 'OPEN' : 'LOCK'}</span>
      <img alt="" src={`/${variant.icon}`} />
      <div>
        <h2>{unlocked ? variant.name : 'Locked Ym'}</h2>
        <p>{unlocked ? variant.description : variant.tags.join(' + ')}</p>
      </div>
      {selected ? <span className="selected-pill">Active</span> : null}
    </button>
  );
}
