import { useEffect, useMemo, useState } from 'react';
import { SettingsPanel } from '../components/SettingsPanel';
import { Collection } from '../screens/Collection';
import { Home } from '../screens/Home';
import { Lab } from '../screens/Lab';
import { Workspace } from '../screens/Workspace';
import { useGameStore } from '../store/gameStore';

type TabKey = 'home' | 'lab' | 'collection' | 'workspace';

const tabs: Array<{ key: TabKey; label: string; icon: string; shortLabel: string }> = [
  { key: 'home', label: 'Grove', icon: '⌂', shortLabel: 'Grove' },
  { key: 'lab', label: 'Lab', icon: '⚗', shortLabel: 'Lab' },
  { key: 'collection', label: 'Collection', icon: '◇', shortLabel: 'Dex' },
  { key: 'workspace', label: 'Workspace', icon: '☷', shortLabel: 'Work' },
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lastUnlockedYm = useGameStore((state) => state.lastUnlockedYm);
  const clearEvolutionEvent = useGameStore((state) => state.clearEvolutionEvent);

  useEffect(() => {
    if (!lastUnlockedYm) return undefined;

    const timer = window.setTimeout(() => clearEvolutionEvent(), 3200);
    return () => window.clearTimeout(timer);
  }, [clearEvolutionEvent, lastUnlockedYm]);

  const screen = useMemo(() => {
    switch (activeTab) {
      case 'lab':
        return <Lab />;
      case 'collection':
        return <Collection />;
      case 'workspace':
        return <Workspace />;
      case 'home':
      default:
        return <Home onOpenLab={() => setActiveTab('lab')} />;
    }
  }, [activeTab]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-icon" alt="" src="/assets/ym/core-brand.svg" />
          <div>
            <h1>Ym Grove</h1>
            <p className="eyebrow">Tiny Logo Creatures</p>
          </div>
        </div>
        <button
          aria-label="Settings"
          className="round-action"
          onClick={() => setSettingsOpen(true)}
          type="button"
        >
          ✦
        </button>
      </header>
      <section className="screen" key={activeTab}>
        {screen}
      </section>
      {settingsOpen ? (
        <div className="sheet-backdrop" onClick={() => setSettingsOpen(false)}>
          <div onClick={(event) => event.stopPropagation()}>
            <SettingsPanel onClose={() => setSettingsOpen(false)} />
          </div>
        </div>
      ) : null}
      <nav className="tabbar" aria-label="Primary">
        {tabs.map((tab) => (
          <button
            aria-current={activeTab === tab.key ? 'page' : undefined}
            aria-label={tab.label}
            className="tab-button"
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            <span aria-hidden="true">{tab.icon}</span>
            <small>{tab.shortLabel}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}
