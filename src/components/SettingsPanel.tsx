import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const resetGame = useGameStore((state) => state.resetGame);

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    resetGame();
    setConfirmReset(false);
    onClose();
  }

  return (
    <section className="settings-panel" aria-label="Settings" role="dialog" aria-modal="true">
      <div className="detail-sheet-heading">
        <div>
          <p className="eyebrow">Local Save</p>
          <h2>Settings</h2>
        </div>
        <button className="icon-action" onClick={onClose} type="button" aria-label="Close settings">
          x
        </button>
      </div>
      <dl className="detail-list">
        <div>
          <dt>Version</dt>
          <dd>0.1.0</dd>
        </div>
        <div>
          <dt>Save</dt>
          <dd>localStorage only</dd>
        </div>
        <div>
          <dt>Network</dt>
          <dd>No login, no server</dd>
        </div>
      </dl>
      <button className={confirmReset ? 'danger-action' : ''} onClick={handleReset} type="button">
        {confirmReset ? 'Confirm Reset' : 'Reset Game'}
      </button>
    </section>
  );
}
