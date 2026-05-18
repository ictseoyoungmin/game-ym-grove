import { variantById } from '../data/variants';
import type { YmVariantId } from '../types/game';

interface YmCharacterProps {
  id: YmVariantId;
  compact?: boolean;
}

export function YmCharacter({ compact = false, id }: YmCharacterProps) {
  const variant = variantById[id];

  return (
    <div className={compact ? 'ym-character is-compact' : 'ym-character'} data-testid="selected-ym">
      <img alt={variant.name} src={`/${variant.icon}`} />
      <strong>{variant.name}</strong>
    </div>
  );
}
