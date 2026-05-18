import { ResourceBar } from '../components/ResourceBar';
import { YmCharacter } from '../components/YmCharacter';
import { getProductionPerSecond } from '../game/resources';
import { useGameStore } from '../store/gameStore';

interface HomeProps {
  onOpenLab: () => void;
}

export function Home({ onOpenLab }: HomeProps) {
  const resources = useGameStore((state) => state.resources);
  const selectedYm = useGameStore((state) => state.selectedYm);
  const tapYm = useGameStore((state) => state.tapYm);
  const claimOfflineGain = useGameStore((state) => state.claimOfflineGain);
  const production = useGameStore(getProductionPerSecond);

  return (
    <div className="home-layout">
      <ResourceBar resources={resources} />
      <YmCharacter id={selectedYm} />
      <div className="action-row">
        <button className="primary-action" onClick={tapYm} type="button">
          Tap Ym
        </button>
        <button onClick={() => claimOfflineGain()} type="button">
          Claim
        </button>
        <button onClick={onOpenLab} type="button">
          Grow
        </button>
      </div>
      <p className="subtle">+{production.spark.toFixed(1)} Spark/sec</p>
    </div>
  );
}
