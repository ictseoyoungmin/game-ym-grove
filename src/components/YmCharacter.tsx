import { variantById } from '../data/variants';
import type { YmVariantId } from '../types/game';

interface YmCharacterProps {
  id: YmVariantId;
}

export function YmCharacter({ id }: YmCharacterProps) {
  const variant = variantById[id];

  return (
    <div className="ym-character" data-testid="selected-ym">
      <img alt={variant.name} src={`/${variant.icon}`} />
      <strong>{variant.name}</strong>
    </div>
  );
}
