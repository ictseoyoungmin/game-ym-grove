import { useEffect, useState } from 'react';
import { ResourceBar } from '../components/ResourceBar';
import { YmCharacter } from '../components/YmCharacter';
import { formatNumber, formatRate } from '../game/format';
import { getProductionPerSecond } from '../game/resources';
import { statKeys } from '../game/state';
import { useGameStore } from '../store/gameStore';
import type { StatKey } from '../types/game';

interface HomeProps {
  onOpenLab: () => void;
}

const statLabels: Record<StatKey, string> = {
  intelligence: 'Intelligence',
  curiosity: 'Curiosity',
  stability: 'Stability',
  growth: 'Growth',
  connection: 'Connection',
};

export function Home({ onOpenLab }: HomeProps) {
  const [tapBurst, setTapBurst] = useState(0);
  const state = useGameStore();
  const { lastOfflineGain, lastUnlockedYm, resources, selectedYm } = state;
  const tapYm = useGameStore((state) => state.tapYm);
  const claimOfflineGain = useGameStore((state) => state.claimOfflineGain);
  const tickProduction = useGameStore((state) => state.tickProduction);
  const production = getProductionPerSecond(state);
  const unlockedCount = Object.values(state.unlocked).filter(Boolean).length;
  const ymLevel = Object.values(state.stats).reduce((total, value) => total + value, 1);

  useEffect(() => {
    claimOfflineGain();
    const timer = window.setInterval(() => tickProduction(), 1000);
    return () => window.clearInterval(timer);
  }, [claimOfflineGain, tickProduction]);

  const lastGainTotal =
    (lastOfflineGain.spark ?? 0) + (lastOfflineGain.insight ?? 0) + (lastOfflineGain.trust ?? 0);

  function handleTapYm() {
    tapYm();
    setTapBurst((value) => value + 1);
  }

  return (
    <div className="home-layout">
      <ResourceBar resources={resources} />
      {lastGainTotal >= 1 ? (
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
      <div className="hero-card">
        <button className="tap-stage" onClick={handleTapYm} type="button">
          <YmCharacter celebrating={lastUnlockedYm === selectedYm} id={selectedYm} level={ymLevel} />
          {tapBurst > 0 ? (
            <span className="tap-pop" key={tapBurst}>
              +1
            </span>
          ) : null}
        </button>
        <div className="action-row">
          <button className="primary-action" onClick={handleTapYm} type="button">
            Tap Ym
          </button>
          <button onClick={() => claimOfflineGain()} type="button">
            Claim
          </button>
          <button onClick={onOpenLab} type="button">
            Grow
          </button>
        </div>
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
      <section className="stat-panel" aria-label="Growth State">
        <div className="section-head">
          <h2>Growth State</h2>
          <span>balanced</span>
        </div>
        <div className="stat-list stat-list-bars">
          {statKeys.map((stat) => (
            <div className="stat-card" key={stat}>
              <div>
                <span>{statLabels[stat]}</span>
                <strong>{state.stats[stat]}</strong>
              </div>
              <span className="stat-bar" aria-hidden="true">
                <span style={{ width: `${Math.min(100, state.stats[stat] * 14)}%` }} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
