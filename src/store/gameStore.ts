import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { unlockFirstCandidate } from '../game/evolution';
import { applyOfflineGain, applyTapGain } from '../game/resources';
import { createInitialState } from '../game/state';
import type { GameState, StatKey } from '../types/game';

interface GameStore extends GameState {
  tapYm: () => void;
  claimOfflineGain: (nowMs?: number) => void;
  growStat: (stat: StatKey) => void;
  evolve: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...createInitialState(Date.now()),
      tapYm: () => set((state) => applyTapGain(state)),
      claimOfflineGain: (nowMs = Date.now()) => set((state) => applyOfflineGain(state, nowMs)),
      growStat: (stat) =>
        set((state) => {
          if (state.resources.spark < 20) return state;

          return {
            ...state,
            resources: { ...state.resources, spark: state.resources.spark - 20 },
            stats: { ...state.stats, [stat]: state.stats[stat] + 1 },
          };
        }),
      evolve: () => set((state) => unlockFirstCandidate(state)),
    }),
    {
      name: 'ym-grove-v0.1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        version: state.version,
        resources: state.resources,
        stats: state.stats,
        unlocked: state.unlocked,
        selectedYm: state.selectedYm,
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
);
