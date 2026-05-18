import type { YmVariant } from '../types/game';

interface CollectionCardProps {
  unlocked: boolean;
  variant: YmVariant;
}

export function CollectionCard({ unlocked, variant }: CollectionCardProps) {
  return (
    <article
      className={unlocked ? 'collection-card is-unlocked' : 'collection-card'}
      data-testid={`collection-card-${variant.id.replaceAll('_', '-')}`}
    >
      <img alt="" src={`/${variant.icon}`} />
      <div>
        <h2>{unlocked ? variant.name : 'Locked Ym'}</h2>
        <p>{unlocked ? variant.description : variant.tags.join(' + ')}</p>
      </div>
    </article>
  );
}
