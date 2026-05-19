import { variantById } from '../data/variants';
import type { YmVariantId } from '../types/game';

interface YmCharacterProps {
  id: YmVariantId;
  compact?: boolean;
  celebrating?: boolean;
}

export function YmCharacter({ celebrating = false, compact = false, id }: YmCharacterProps) {
  const variant = variantById[id];
  const className = [
    'ym-character',
    compact ? 'is-compact' : '',
    celebrating ? 'is-celebrating' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} data-testid="selected-ym">
      <img alt={variant.name} src={`/${variant.icon}`} />
      <strong>{variant.name}</strong>
    </div>
  );
}
