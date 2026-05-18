import { CollectionCard } from '../components/CollectionCard';
import { variants } from '../data/variants';
import { useGameStore } from '../store/gameStore';

export function Collection() {
  const unlocked = useGameStore((state) => state.unlocked);
  const selectedYm = useGameStore((state) => state.selectedYm);
  const selectYm = useGameStore((state) => state.selectYm);
  const unlockedCount = variants.filter((variant) => unlocked[variant.id]).length;

  return (
    <div className="panel-stack">
      <section className="tool-panel collection-summary">
        <h2>Collection</h2>
        <p>{unlockedCount} of 14 Ym are registered in the grove.</p>
      </section>
      <div className="collection-grid">
        {variants.map((variant) => (
          <CollectionCard
            key={variant.id}
            onSelect={() => selectYm(variant.id)}
            selected={selectedYm === variant.id}
            unlocked={unlocked[variant.id]}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}
