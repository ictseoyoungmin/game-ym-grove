import { useEffect, useState } from 'react';
import { CollectionCard } from '../components/CollectionCard';
import { CollectionDetailSheet } from '../components/CollectionDetailSheet';
import { variantById, variants } from '../data/variants';
import { useGameStore } from '../store/gameStore';
import type { YmVariantId } from '../types/game';

export function Collection() {
  const [inspectedId, setInspectedId] = useState<YmVariantId | null>(null);
  const state = useGameStore();
  const selectYm = useGameStore((state) => state.selectYm);
  const revealHint = useGameStore((state) => state.revealHint);
  const unlockedCount = variants.filter((variant) => state.unlocked[variant.id]).length;
  const inspectedVariant = inspectedId ? variantById[inspectedId] : null;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setInspectedId(null);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="panel-stack">
      <section className="tool-panel collection-summary">
        <h2>Collection</h2>
        <p>{unlockedCount} of 14 Ym are registered in the grove.</p>
      </section>
      {inspectedVariant ? (
        <div className="sheet-backdrop" onClick={() => setInspectedId(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <CollectionDetailSheet
              onClose={() => setInspectedId(null)}
              onReveal={revealHint}
              onSelect={(id) => {
                selectYm(id);
                setInspectedId(id);
              }}
              selected={state.selectedYm === inspectedVariant.id}
              state={state}
              unlocked={state.unlocked[inspectedVariant.id]}
              variant={inspectedVariant}
            />
          </div>
        </div>
      ) : null}
      <div className="section-head">
        <h2>Ym Collection</h2>
        <span>
          {unlockedCount} / {variants.length}
        </span>
      </div>
      <div className="collection-grid">
        {variants.map((variant, index) => (
          <CollectionCard
            key={variant.id}
            onOpen={() => setInspectedId(variant.id)}
            selected={state.selectedYm === variant.id}
            unlocked={state.unlocked[variant.id]}
            variant={variant}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
