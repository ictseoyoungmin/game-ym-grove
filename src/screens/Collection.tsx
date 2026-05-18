import { CollectionCard } from '../components/CollectionCard';
import { variants } from '../data/variants';
import { useGameStore } from '../store/gameStore';

export function Collection() {
  const unlocked = useGameStore((state) => state.unlocked);

  return (
    <div className="collection-grid">
      {variants.map((variant) => (
        <CollectionCard key={variant.id} unlocked={unlocked[variant.id]} variant={variant} />
      ))}
    </div>
  );
}
