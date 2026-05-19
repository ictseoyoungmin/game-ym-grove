import { variantById } from '../data/variants';
import type { YmVariantId } from '../types/game';

interface YmCharacterProps {
  id: YmVariantId;
  compact?: boolean;
  celebrating?: boolean;
  level?: number;
}

export function YmCharacter({ celebrating = false, compact = false, id, level }: YmCharacterProps) {
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
      {compact ? null : (
        <>
          <span className="ym-glow ym-glow-a" />
          <span className="ym-glow ym-glow-b" />
        </>
      )}
      <img alt={variant.name} src={`/${variant.icon}`} />
      <div className="ym-character-copy">
        <strong>{variant.name}</strong>
        {compact ? null : <span>Tap to collect Spark · idle aura active</span>}
      </div>
      {level ? <em>Lv. {level.toString().padStart(2, '0')}</em> : null}
    </div>
  );
}
