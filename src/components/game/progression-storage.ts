import { PlayerProgression } from './progression-types';

const STORAGE_KEY = 'lukao_player_progression_v1';

export const DEFAULT_PROGRESSION: PlayerProgression = {
  totalPoints: 9999, // Temporarily unlocked for testing
  highestRank: 'Apex Master',
  unlockedIslands: ['island-1', 'island-2', 'island-3', 'island-4', 'island-5'],
  bestTimes: {},
  matchesPlayed: 10,
  matchesWon: 10,
};

// Cross-platform safe in-memory cache
let inMemoryProgression: PlayerProgression = { ...DEFAULT_PROGRESSION };

/**
 * Loads saved progression from localStorage if available (Web)
 * or returns memory cache / default progression.
 */
export function loadProgression(): PlayerProgression {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const serialized = window.localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        if (typeof parsed?.totalPoints === 'number' && Array.isArray(parsed?.unlockedIslands)) {
          // Merge with defaults to ensure all islands unlocked for testing
          inMemoryProgression = {
            ...DEFAULT_PROGRESSION,
            ...parsed,
            totalPoints: Math.max(9999, parsed.totalPoints || 0),
            highestRank: 'Apex Master',
            unlockedIslands: ['island-1', 'island-2', 'island-3', 'island-4', 'island-5'],
          };
          return inMemoryProgression;
        }
      }
    }
  } catch (err) {
    console.warn('[Lukao] Failed to read progression from localStorage:', err);
  }
  return inMemoryProgression;
}

/**
 * Persists progression state to localStorage if available (Web)
 * and keeps the in-memory cache updated for native/mobile.
 */
export function saveProgression(progression: PlayerProgression): void {
  inMemoryProgression = { ...progression };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progression));
    }
  } catch (err) {
    console.warn('[Lukao] Failed to write progression to localStorage:', err);
  }
}

