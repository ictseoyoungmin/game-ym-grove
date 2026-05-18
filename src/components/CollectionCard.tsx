import type { YmVariant } from '../types/game';

interface CollectionCardProps {
  selected?: boolean;
  unlocked: boolean;
  variant: YmVariant;
  onSelect: () => void;
}

export function CollectionCard({ onSelect, selected = false, unlocked, variant }: CollectionCardProps) {
  return (
    <button
      aria-pressed={selected}
      className={unlocked ? 'collection-card is-unlocked' : 'collection-card'}
      data-testid={`collection-card-${variant.id.replaceAll('_', '-')}`}
      disabled={!unlocked}
      onClick={onSelect}
      type="button"
    >
      <img alt="" src={`/${variant.icon}`} />
      <div>
        <h2>{unlocked ? variant.name : 'Locked Ym'}</h2>
        <p>{unlocked ? variant.description : variant.tags.join(' + ')}</p>
      </div>
      {selected ? <span className="selected-pill">Active</span> : null}
    </button>
  );
}
