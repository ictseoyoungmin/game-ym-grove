import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { balance } from '../data/balance';
import { unlockEvolutionCandidate, unlockFirstCandidate } from '../game/evolution';
import { growStat } from '../game/growth';
import { applyOfflineGain, applyPassiveTick, applyTapGain } from '../game/resources';
import { migrateSave } from '../game/save';
import { createInitialState } from '../game/state';
import type { GameState, StatKey, YmVariantId } from '../types/game';

interface GameStore extends GameState {
  tapYm: () => void;
  claimOfflineGain: (nowMs?: number) => void;
  tickProduction: (nowMs?: number) => void;
  growStat: (stat: StatKey) => void;
  evolve: () => void;
  evolveByRule: (ruleId: string) => void;
  revealHint: (id: Exclude<YmVariantId, 'core'>) => void;
  selectYm: (id: YmVariantId) => void;
  clearEvolutionEvent: () => void;
  spendInsightForTrust: () => void;
  resetGame: (nowMs?: number) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...createInitialState(Date.now()),
      tapYm: () => set((state) => applyTapGain(state)),
      claimOfflineGain: (nowMs = Date.now()) => set((state) => applyOfflineGain(state, nowMs)),
      tickProduction: (nowMs = Date.now()) => set((state) => applyPassiveTick(state, nowMs)),
      growStat: (stat) => set((state) => growStat(state, stat)),
      evolve: () => set((state) => unlockFirstCandidate(state)),
      evolveByRule: (ruleId) => set((state) => unlockEvolutionCandidate(state, ruleId)),
      revealHint: (id) =>
        set((state) => {
          if (state.resources.insight < balance.hintCostInsight) return state;
          if (state.revealedHints[id]) return state;

          return {
            ...state,
            resources: {
              ...state.resources,
              insight: state.resources.insight - balance.hintCostInsight,
            },
            revealedHints: {
              ...state.revealedHints,
              [id]: true,
            },
          };
        }),
      selectYm: (id) =>
        set((state) => (state.unlocked[id] ? { ...state, selectedYm: id } : state)),
      clearEvolutionEvent: () => set((state) => ({ ...state, lastUnlockedYm: null })),
      spendInsightForTrust: () =>
        set((state) => {
          if (state.resources.insight < balance.hintCostInsight) return state;
          return {
            ...state,
            resources: {
              ...state.resources,
              insight: state.resources.insight - balance.hintCostInsight,
              trust: state.resources.trust + 1,
            },
          };
        }),
      resetGame: (nowMs = Date.now()) => set(() => createInitialState(nowMs)),
    }),
    {
      name: 'ym-grove-v0.1',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedValue, currentValue) => ({
        ...currentValue,
        ...migrateSave(
          typeof persistedValue === 'object' &&
            persistedValue !== null &&
            'state' in persistedValue
            ? persistedValue.state
            : persistedValue,
          Date.now(),
        ),
      }),
      partialize: (state) => ({
        version: state.version,
        resources: state.resources,
        stats: state.stats,
        unlocked: state.unlocked,
        revealedHints: state.revealedHints,
        selectedYm: state.selectedYm,
        lastOfflineGain: state.lastOfflineGain,
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
);
