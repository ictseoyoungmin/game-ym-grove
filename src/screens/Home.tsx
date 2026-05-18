import { useEffect } from 'react';
import { ResourceBar } from '../components/ResourceBar';
import { YmCharacter } from '../components/YmCharacter';
import { formatNumber, formatRate } from '../game/format';
import { getProductionPerSecond } from '../game/resources';
import { useGameStore } from '../store/gameStore';

interface HomeProps {
  onOpenLab: () => void;
}

export function Home({ onOpenLab }: HomeProps) {
  const state = useGameStore();
  const { lastOfflineGain, resources, selectedYm } = state;
  const tapYm = useGameStore((state) => state.tapYm);
  const claimOfflineGain = useGameStore((state) => state.claimOfflineGain);
  const production = getProductionPerSecond(state);
  const unlockedCount = Object.values(state.unlocked).filter(Boolean).length;

  useEffect(() => {
    claimOfflineGain();
    const timer = window.setInterval(() => claimOfflineGain(), 1000);
    return () => window.clearInterval(timer);
  }, [claimOfflineGain]);

  const lastGainTotal =
    (lastOfflineGain.spark ?? 0) + (lastOfflineGain.insight ?? 0) + (lastOfflineGain.trust ?? 0);

  return (
    <div className="home-layout">
      <ResourceBar resources={resources} />
      {lastGainTotal > 0 ? (
        <div className="offline-banner" data-testid="offline-gain">
          <strong>Idle gain claimed</strong>
          <span>
            +{formatNumber(lastOfflineGain.spark ?? 0)} Spark
            {(lastOfflineGain.insight ?? 0) > 0
              ? `, +${formatNumber(lastOfflineGain.insight ?? 0)} Insight`
              : ''}
          </span>
        </div>
      ) : null}
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
      <section className="summary-strip" aria-label="Grove summary">
        <div>
          <span>Spark/sec</span>
          <strong>+{formatRate(production.spark)}</strong>
        </div>
        <div>
          <span>Collected</span>
          <strong>{unlockedCount}/14</strong>
        </div>
        <div>
          <span>Selected</span>
          <strong>{selectedYm.replaceAll('_', ' ')}</strong>
        </div>
      </section>
    </div>
  );
}
