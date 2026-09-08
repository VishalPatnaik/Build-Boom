import { create } from 'zustand';

type GameMode = 'menu' | 'campaign' | 'endless' | 'daily' | 'shop';
type GameState = 'idle' | 'playing' | 'won' | 'lost';
type AdState = 'none' | 'interstitial' | 'rewarded-revive' | 'rewarded-double-coins' | 'rewarded-shop-item';

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
  equippedBackground: string | null;
  equippedBoomEffect: string | null;
  equippedPlate: string | null;
  
  // Monetization state
  adsRemoved: boolean;
  levelsPlayedSinceAd: number;
  lastAdTime: number;
  adState: AdState;
  isReviving: boolean;
  pendingCoins: number;
  pendingShopItemId: string | null;
  showIAP: boolean;
  showRemoveAds: boolean;
  
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
  equipCosmetic: (id: string, type: 'skin' | 'background' | 'boom' | 'plate') => void;
  unlockCosmetic: (id: string) => void;
  
  // Monetization Actions
  removeAds: () => void;
  restoreAds: () => void;
  checkAndTriggerAd: (completedLevel?: boolean) => void;
  closeAd: () => void;
  showReviveAd: () => void;
  acceptRevive: () => void;
  declineRevive: () => void;
  clearReviveFlag: () => void;
  showDoubleCoinsAd: () => void;
  acceptDoubleCoins: () => void;
  declineDoubleCoins: () => void;
  
  showShopAd: (id: string) => void;
  acceptShopAd: () => void;
  declineShopAd: () => void;
  
  setShowIAP: (show: boolean) => void;
  setShowRemoveAds: (show: boolean) => void;
}

const loadProgress = () => {
  try {
    const data = localStorage.getItem('buildOrBoomProgressV5');
    if (data) {
      return JSON.parse(data);
    }
    // Try migrating from v4
    const oldData = localStorage.getItem('buildOrBoomProgressV4');
    if (oldData) {
      const parsed = JSON.parse(oldData);
      return { ...parsed, equippedBackground: null, equippedBoomEffect: null, equippedPlate: null };
    }
  } catch (e) {
    console.error('Failed to load progress', e);
  }
  return { 
    unlockedLevels: 1, 
    highScores: {}, 
    adsRemoved: false, 
    coins: 0, 
    ownedCosmetics: [], 
    equippedCosmetic: null,
    equippedBackground: null,
    equippedBoomEffect: null, equippedPlate: null
  };
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
      equippedCosmetic: data.equippedCosmetic !== undefined ? data.equippedCosmetic : current.equippedCosmetic,
      equippedBackground: data.equippedBackground !== undefined ? data.equippedBackground : current.equippedBackground,
      equippedBoomEffect: data.equippedBoomEffect !== undefined ? data.equippedBoomEffect : current.equippedBoomEffect,
      equippedPlate: data.equippedPlate !== undefined ? data.equippedPlate : current.equippedPlate
    };
    localStorage.setItem('buildOrBoomProgressV5', JSON.stringify(toSave));
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
  equippedBackground: initialProgress.equippedBackground || null,
  equippedBoomEffect: initialProgress.equippedBoomEffect || null,
  equippedPlate: initialProgress.equippedPlate || null,
  pendingCoins: 0,
  pendingShopItemId: null,
  showIAP: false,
  
  showRemoveAds: false,
  
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
    const newUnlocked = Math.min(200, Math.max(store.unlockedLevels, store.level + 1));
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
  
  equipCosmetic: (id, type) => set((store) => {
    if (type === 'skin') {
      saveProgress({ equippedCosmetic: id });
      return { equippedCosmetic: id };
    } else if (type === 'background') {
      saveProgress({ equippedBackground: id });
      return { equippedBackground: id };
    } else if (type === 'boom') {
      saveProgress({ equippedBoomEffect: id });
      return { equippedBoomEffect: id };
    } else if (type === 'plate') {
      saveProgress({ equippedPlate: id });
      return { equippedPlate: id };
    }
    return {};
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
  
  restoreAds: () => set((store) => {
    saveProgress({ adsRemoved: false });
    return { adsRemoved: false };
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
  },
  
  showShopAd: (id) => set({ adState: 'rewarded-shop-item', pendingShopItemId: id }),
  acceptShopAd: () => {
    const s = get();
    if (s.pendingShopItemId) {
      s.unlockCosmetic(s.pendingShopItemId);
    }
    set({ adState: 'none', pendingShopItemId: null });
  },
  declineShopAd: () => {
    set({ adState: 'none', pendingShopItemId: null });
  },
  
  setShowIAP: (show) => set({ showIAP: show }),
  setShowRemoveAds: (show) => set({ showRemoveAds: show })
}));
