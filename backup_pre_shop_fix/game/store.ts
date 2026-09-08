import { create } from 'zustand';

type GameMode = 'menu' | 'campaign' | 'endless' | 'daily' | 'shop';
type GameState = 'idle' | 'playing' | 'won' | 'lost';
type AdState = 'none' | 'interstitial' | 'rewarded-revive' | 'rewarded-double-coins';

interface GameStore {
  mode: GameMode;
  state: GameState;
  level: number;
  score: number;
  highScores: Record<string, number>;
  unlockedLevels: number;
  
  // Progression & Cosmetics
  coins: number;
  ownedCosmetics: string[];
  equippedCosmetic: string | null;
  
  // Monetization state
  adsRemoved: boolean;
  levelsPlayedSinceAd: number;
  lastAdTime: number;
  adState: AdState;
  isReviving: boolean;
  pendingCoins: number;
  
  setMode: (mode: GameMode) => void;
  setState: (state: GameState) => void;
  setLevel: (level: number) => void;
  setScore: (score: number) => void;
  unlockNextLevel: () => void;
  updateHighScore: (mode: string, score: number) => void;
  
  // Progression Actions
  addCoins: (amount: number) => void;
  setPendingCoins: (amount: number) => void;
  buyCosmetic: (id: string, price: number) => boolean;
  equipCosmetic: (id: string | null) => void;
  unlockCosmetic: (id: string) => void;
  
  // Monetization Actions
  removeAds: () => void;
  checkAndTriggerAd: (completedLevel?: boolean) => void;
  closeAd: () => void;
  showReviveAd: () => void;
  acceptRevive: () => void;
  declineRevive: () => void;
  clearReviveFlag: () => void;
  showDoubleCoinsAd: () => void;
  acceptDoubleCoins: () => void;
  declineDoubleCoins: () => void;
}

const loadProgress = () => {
  try {
    const data = localStorage.getItem('buildOrBoomProgressV4');
    if (data) {
      return JSON.parse(data);
    }
    // Try migrating from v3
    const oldData = localStorage.getItem('buildOrBoomProgressV3');
    if (oldData) {
      const parsed = JSON.parse(oldData);
      return { ...parsed, coins: 0, ownedCosmetics: [], equippedCosmetic: null };
    }
  } catch (e) {
    console.error('Failed to load progress', e);
  }
  return { unlockedLevels: 1, highScores: {}, adsRemoved: false, coins: 0, ownedCosmetics: [], equippedCosmetic: null };
};

const saveProgress = (data: Partial<GameStore>) => {
  try {
    const current = loadProgress();
    const toSave = {
      unlockedLevels: data.unlockedLevels ?? current.unlockedLevels,
      highScores: data.highScores ?? current.highScores,
      adsRemoved: data.adsRemoved ?? current.adsRemoved,
      coins: data.coins ?? current.coins,
      ownedCosmetics: data.ownedCosmetics ?? current.ownedCosmetics,
      equippedCosmetic: data.equippedCosmetic !== undefined ? data.equippedCosmetic : current.equippedCosmetic
    };
    localStorage.setItem('buildOrBoomProgressV4', JSON.stringify(toSave));
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
  
  coins: initialProgress.coins || 0,
  ownedCosmetics: initialProgress.ownedCosmetics || [],
  equippedCosmetic: initialProgress.equippedCosmetic || null,
  pendingCoins: 0,
  
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
    saveProgress({ unlockedLevels: newUnlocked });
    return { unlockedLevels: newUnlocked };
  }),
  
  updateHighScore: (mode, score) => set((store) => {
    const currentHigh = store.highScores[mode] || 0;
    if (score > currentHigh) {
      const newHighScores = { ...store.highScores, [mode]: score };
      saveProgress({ highScores: newHighScores });
      return { highScores: newHighScores };
    }
    return {};
  }),
  
  addCoins: (amount) => set((store) => {
    const newCoins = store.coins + amount;
    saveProgress({ coins: newCoins });
    return { coins: newCoins };
  }),
  
  setPendingCoins: (amount) => set({ pendingCoins: amount }),
  
  buyCosmetic: (id, price) => {
    const store = get();
    if (store.coins >= price && !store.ownedCosmetics.includes(id)) {
      const newCoins = store.coins - price;
      const newOwned = [...store.ownedCosmetics, id];
      saveProgress({ coins: newCoins, ownedCosmetics: newOwned });
      set({ coins: newCoins, ownedCosmetics: newOwned });
      return true;
    }
    return false;
  },
  
  equipCosmetic: (id) => set((store) => {
    saveProgress({ equippedCosmetic: id });
    return { equippedCosmetic: id };
  }),
  
  unlockCosmetic: (id) => set((store) => {
    if (!store.ownedCosmetics.includes(id)) {
      const newOwned = [...store.ownedCosmetics, id];
      saveProgress({ ownedCosmetics: newOwned });
      return { ownedCosmetics: newOwned };
    }
    return {};
  }),
  
  removeAds: () => set((store) => {
    saveProgress({ adsRemoved: true });
    return { adsRemoved: true };
  }),
  
  checkAndTriggerAd: (completedLevel: boolean = true) => {
    const s = get();
    if (s.adsRemoved) return;
    
    const now = Date.now();
    const timePassed = now - s.lastAdTime;
    const timeLimit = 5 * 60 * 1000; // 5 minutes
    
    const newLevelsPlayed = completedLevel ? s.levelsPlayedSinceAd + 1 : s.levelsPlayedSinceAd;
    
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
  clearReviveFlag: () => set({ isReviving: false }),
  
  showDoubleCoinsAd: () => set({ adState: 'rewarded-double-coins' }),
  acceptDoubleCoins: () => {
     const s = get();
     s.addCoins(s.pendingCoins * 2);
     set({ adState: 'none', pendingCoins: 0 });
  },
  declineDoubleCoins: () => {
     const s = get();
     s.addCoins(s.pendingCoins);
     set({ adState: 'none', pendingCoins: 0 });
  }
}));
