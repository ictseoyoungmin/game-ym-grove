import { useMemo, useState } from 'react';
import { Collection } from '../screens/Collection';
import { Home } from '../screens/Home';
import { Lab } from '../screens/Lab';
import { Workspace } from '../screens/Workspace';

type TabKey = 'home' | 'lab' | 'collection' | 'workspace';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'home', label: 'Grove' },
  { key: 'lab', label: 'Lab' },
  { key: 'collection', label: 'Collection' },
  { key: 'workspace', label: 'Workspace' },
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

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
        <div>
          <p className="eyebrow">Tiny Logo Creatures</p>
          <h1>Ym Grove</h1>
        </div>
      </header>
      <section className="screen">{screen}</section>
      <nav className="tabbar" aria-label="Primary">
        {tabs.map((tab) => (
          <button
            aria-current={activeTab === tab.key ? 'page' : undefined}
            className="tab-button"
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </main>
  );
}
