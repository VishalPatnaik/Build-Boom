import { create } from 'zustand';

type GameMode = 'menu' | 'campaign' | 'endless' | 'daily';
type GameState = 'idle' | 'playing' | 'won' | 'lost';
type AdState = 'none' | 'interstitial' | 'rewarded-revive';

interface GameStore {
  mode: GameMode;
  state: GameState;
  level: number;
  score: number;
  highScores: Record<string, number>;
  unlockedLevels: number;
  
  // Monetization state
  adsRemoved: boolean;
  levelsPlayedSinceAd: number;
  lastAdTime: number;
  adState: AdState;
  isReviving: boolean;
  
  setMode: (mode: GameMode) => void;
  setState: (state: GameState) => void;
  setLevel: (level: number) => void;
  setScore: (score: number) => void;
  unlockNextLevel: () => void;
  updateHighScore: (mode: string, score: number) => void;
  
  // Monetization Actions
  removeAds: () => void;
  checkAndTriggerAd: () => void;
  closeAd: () => void;
  showReviveAd: () => void;
  acceptRevive: () => void;
  declineRevive: () => void;
  clearReviveFlag: () => void;
}

const loadProgress = () => {
  try {
    const data = localStorage.getItem('buildOrBoomProgressV3');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load progress', e);
  }
  return { unlockedLevels: 1, highScores: {}, adsRemoved: false };
};

const saveProgress = (unlockedLevels: number, highScores: Record<string, number>, adsRemoved: boolean) => {
  try {
    localStorage.setItem('buildOrBoomProgressV3', JSON.stringify({ unlockedLevels, highScores, adsRemoved }));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
};

const initialProgress = loadProgress();

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'menu',
  state: 'idle',
  level: 1,
  score: 0,
  unlockedLevels: initialProgress.unlockedLevels,
  highScores: initialProgress.highScores,
  
  adsRemoved: initialProgress.adsRemoved || false,
  levelsPlayedSinceAd: 0,
  lastAdTime: Date.now(),
  adState: 'none',
  isReviving: false,
  
  setMode: (mode) => set({ mode }),
  setState: (state) => set({ state }),
  setLevel: (level) => set({ level }),
  setScore: (score) => set({ score }),
  
  unlockNextLevel: () => set((store) => {
    const newUnlocked = Math.max(store.unlockedLevels, store.level + 1);
    saveProgress(newUnlocked, store.highScores, store.adsRemoved);
    return { unlockedLevels: newUnlocked };
  }),
  
  updateHighScore: (mode, score) => set((store) => {
    const currentHigh = store.highScores[mode] || 0;
    if (score > currentHigh) {
      const newHighScores = { ...store.highScores, [mode]: score };
      saveProgress(store.unlockedLevels, newHighScores, store.adsRemoved);
      return { highScores: newHighScores };
    }
    return {};
  }),
  
  removeAds: () => set((store) => {
    saveProgress(store.unlockedLevels, store.highScores, true);
    return { adsRemoved: true };
  }),
  checkAndTriggerAd: () => {
    const s = get();
    if (s.adsRemoved) return;
    
    const now = Date.now();
    const timePassed = now - s.lastAdTime;
    const timeLimit = 5 * 60 * 1000; // 5 minutes
    
    const newLevelsPlayed = s.levelsPlayedSinceAd + 1;
    
    if (newLevelsPlayed >= 3 || timePassed > timeLimit) {
      set({ adState: 'interstitial', levelsPlayedSinceAd: 0, lastAdTime: now });
    } else {
      set({ levelsPlayedSinceAd: newLevelsPlayed });
    }
  },
  closeAd: () => set({ adState: 'none' }),
  showReviveAd: () => set({ adState: 'rewarded-revive' }),
  acceptRevive: () => {
     set({ adState: 'none', state: 'playing', isReviving: true }); 
  },
  declineRevive: () => {
     set({ adState: 'none', state: 'lost' });
  },
  clearReviveFlag: () => set({ isReviving: false })
}));
