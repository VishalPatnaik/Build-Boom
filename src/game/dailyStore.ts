import { create } from 'zustand';
import { useGameStore } from './store';
import { COLLECTIONS, CosmeticDef } from './collections';

export interface DailyTask {
  id: string;
  type: 'LOGIN' | 'LEVELS_PLAYED' | 'NO_BOOM' | 'BUILD_COUNT' | 'BOOM_RECOVERY';
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number; // Base coin reward
  completed: boolean;
  rewardClaimed: boolean;
}

export interface StreakTier {
  day: number;
  multiplier: number;
  baseReward: number; // Daily check-in coins
  badge: string;
  perkDescription: string;
}

export interface CosmeticSkinReward {
  id: string;
  name: string;
  desc: string;
  type: 'skin';
  price: number;
  themeIdx: number;
  isNew: boolean;
  rarity: 'rare' | 'epic' | 'legendary';
}

export interface MysteryChestDefinition {
  id: string;
  name: string;
  dayNumber: number; // Day 3 or Day 7
  rarity: 'rare' | 'epic' | 'legendary';
  rarityLabel: string;
  icon: string;
  glowColor: string;
  borderClass: string;
  bgGradient: string;
  minBonusCoins: number;
  maxBonusCoins: number;
  guaranteedPowerup?: 'stasis' | 'emp' | 'shield';
  powerupCount?: number;
  guaranteedCosmetic: boolean;
  description: string;
  lore: string;
  perks: string[];
}

export const MYSTERY_CHESTS: Record<'day3' | 'day7', MysteryChestDefinition> = {
  day3: {
    id: 'chest-day3',
    name: 'Quantum Mystery Chest',
    dayNumber: 3,
    rarity: 'rare',
    rarityLabel: 'DAY 3 MYSTERY CHEST',
    icon: '⚡',
    glowColor: 'rgba(6, 182, 212, 0.65)',
    borderClass: 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.45)]',
    bgGradient: 'from-cyan-950/85 via-slate-900 to-cyan-950/85',
    minBonusCoins: 150,
    maxBonusCoins: 300,
    guaranteedPowerup: 'stasis',
    powerupCount: 1,
    guaranteedCosmetic: true,
    description: 'Pressurized tactical pod containing a guaranteed random cosmetic block skin, stasis coolant, and bonus coins.',
    lore: 'Atmospheric drop capsule recovered with encrypted architect tower skin schematics.',
    perks: ['🎁 Guaranteed Random Cosmetic Skin', '150 - 300 Bonus Coins', '+1 Stasis Freeze Charge', '1.5x Multiplier Boost']
  },
  day7: {
    id: 'chest-day7',
    name: 'Apex Legendary Mystery Vault',
    dayNumber: 7,
    rarity: 'legendary',
    rarityLabel: 'DAY 7 GRAND VAULT',
    icon: '👑',
    glowColor: 'rgba(245, 158, 11, 0.8)',
    borderClass: 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.6)]',
    bgGradient: 'from-amber-950/90 via-slate-900 to-amber-950/90',
    minBonusCoins: 750,
    maxBonusCoins: 1500,
    guaranteedPowerup: 'shield',
    powerupCount: 3,
    guaranteedCosmetic: true,
    description: 'The supreme architect vault. Unlocks a guaranteed premium cosmetic skin, jackpot coins, and 3 kinetic blast shields.',
    lore: 'The pinnacle operational vault awarded exclusively for completing an unbroken 7-day streak.',
    perks: ['👑 Guaranteed Premium Cosmetic Skin', '750 - 1,500 Super Jackpot Coins', '+3 Kinetic Blast Shields', '3.0x Apex Multiplier Peak']
  }
};

export const getMysteryChestForCycleDay = (cycleDay: number): MysteryChestDefinition | null => {
  if (cycleDay === 3) return MYSTERY_CHESTS.day3;
  if (cycleDay === 7) return MYSTERY_CHESTS.day7;
  return null;
};

export function rollRandomCosmeticSkin(): CosmeticSkinReward {
  const allBlockSkins = COLLECTIONS.map(c => c.block);
  const ownedCosmetics = useGameStore.getState().ownedCosmetics || [];
  
  // Try to find unowned skins first
  const unowned = allBlockSkins.filter(s => !ownedCosmetics.includes(s.id));
  const pool = unowned.length > 0 ? unowned : allBlockSkins;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  const isNew = !ownedCosmetics.includes(picked.id);
  // Auto-unlock in game store
  useGameStore.getState().unlockCosmetic(picked.id);

  let rarity: 'rare' | 'epic' | 'legendary' = 'rare';
  if (picked.price >= 2000 || picked.themeIdx >= 12) {
    rarity = 'legendary';
  } else if (picked.price >= 300 || picked.themeIdx >= 6) {
    rarity = 'epic';
  }

  return {
    id: picked.id,
    name: picked.name,
    desc: picked.desc,
    type: 'skin',
    price: picked.price,
    themeIdx: picked.themeIdx,
    isNew,
    rarity
  };
}

export interface CalendarDayInfo {
  offset: number; // 0 = today, 1..6
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // "TODAY", "TOMORROW", "WED", "THU", etc.
  dateFormatted: string; // "Sep 26", "Sep 27"
  projectedStreak: number;
  cycleDay: number; // 1 to 7
  isToday: boolean;
  multiplier: number;
  baseCoins: number;
  tierBadge: string;
  mysteryChest: MysteryChestDefinition | null;
  claimed: boolean;
  totalEstimatedCoins: number;
}

export const getCalendarDays = (streakCount: number, streakClaimedToday: boolean, baseDate: Date = new Date()): CalendarDayInfo[] => {
  const days: CalendarDayInfo[] = [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + offset);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dateFormatted = `${monthNames[d.getMonth()]} ${d.getDate()}`;
    let dayLabel = dayNames[d.getDay()];
    if (offset === 0) dayLabel = 'TODAY';
    else if (offset === 1) dayLabel = 'TOMORROW';

    const projectedStreak = Math.max(1, streakCount + offset);
    const cycleDay = ((projectedStreak - 1) % 7) + 1;
    const tier = getStreakTier(projectedStreak);
    const multiplier = getStreakMultiplier(projectedStreak);
    const mysteryChest = getMysteryChestForCycleDay(cycleDay);
    const isToday = offset === 0;
    const claimed = isToday ? streakClaimedToday : false;
    const totalEstimatedCoins = Math.round(tier.baseReward * multiplier) + (mysteryChest ? mysteryChest.minBonusCoins : 0);

    days.push({
      offset,
      date: d,
      dateStr,
      dayLabel,
      dateFormatted,
      projectedStreak,
      cycleDay,
      isToday,
      multiplier,
      baseCoins: tier.baseReward,
      tierBadge: tier.badge,
      mysteryChest,
      claimed,
      totalEstimatedCoins
    });
  }

  return days;
};

export interface StreakRewardResult {
  totalCoins: number;
  baseCoins: number;
  multiplier: number;
  chestAwarded?: {
    chest: MysteryChestDefinition;
    bonusCoins: number;
    powerup?: {
      type: 'stasis' | 'emp' | 'shield';
      count: number;
    };
    cosmeticSkin?: CosmeticSkinReward;
  };
}

export const STREAK_TIERS: StreakTier[] = [
  { day: 1, multiplier: 1.0, baseReward: 15, badge: 'CADET', perkDescription: 'Baseline 1.0x Rewards' },
  { day: 2, multiplier: 1.25, baseReward: 25, badge: 'OPERATIVE', perkDescription: '+25% Coin Multiplier' },
  { day: 3, multiplier: 1.5, baseReward: 40, badge: 'SPECIALIST', perkDescription: '+50% Coin Multiplier' },
  { day: 4, multiplier: 1.75, baseReward: 60, badge: 'VETERAN', perkDescription: '+75% Coin Multiplier' },
  { day: 5, multiplier: 2.0, baseReward: 85, badge: 'COMMANDER', perkDescription: '2.0x Double Coins' },
  { day: 6, multiplier: 2.5, baseReward: 120, badge: 'WARLORD', perkDescription: '2.5x Hyper Multiplier' },
  { day: 7, multiplier: 3.0, baseReward: 250, badge: 'APEX ARCHITECT', perkDescription: '3.0x Maximum Jackpot' },
];

export const getStreakTier = (streakDay: number): StreakTier => {
  const cappedDay = Math.max(1, Math.min(7, streakDay));
  return STREAK_TIERS[cappedDay - 1];
};

export const getStreakMultiplier = (streakDay: number): number => {
  if (streakDay <= 0) return 1.0;
  if (streakDay >= 7) return 3.0;
  return STREAK_TIERS[streakDay - 1]?.multiplier ?? 1.0;
};

export const getTodayStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getDaysDiff = (earlierDateStr: string, laterDateStr: string): number => {
  if (!earlierDateStr || !laterDateStr) return 999;
  const [y1, m1, d1] = earlierDateStr.split('-').map(Number);
  const [y2, m2, d2] = laterDateStr.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffMs = date2.getTime() - date1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export interface DailyStore {
  currentDateStr: string;
  lastLoginDate: string;
  streakCount: number;
  maxStreak: number;
  streakClaimedToday: boolean;
  tasks: DailyTask[];
  bonusClaimed: boolean;
  
  initDaily: () => void;
  updateProgress: (type: DailyTask['type'], amount: number) => void;
  claimReward: (taskId: string) => number;
  claimBonus: () => number;
  claimStreakReward: () => StreakRewardResult;
  simulateOpenChest: (chestId?: string) => {
    chest: MysteryChestDefinition;
    bonusCoins: number;
    powerup?: {
      type: 'stasis' | 'emp' | 'shield';
      count: number;
    };
    cosmeticSkin: CosmeticSkinReward;
  };
  debugAdvanceStreak: () => void;
  debugResetStreak: () => void;
}

const generateTasks = (): DailyTask[] => {
  return [
    {
      id: 'task-login',
      type: 'LOGIN',
      title: '🌞 DAILY VISIT',
      description: 'Open the game today',
      target: 1,
      progress: 0,
      reward: 10,
      completed: false,
      rewardClaimed: false
    },
    {
      id: 'task-levels',
      type: 'LEVELS_PLAYED',
      title: '🏗 CAMPAIGNER',
      description: 'Complete 3 levels',
      target: 3,
      progress: 0,
      reward: 20,
      completed: false,
      rewardClaimed: false
    },
    {
      id: 'task-survivor',
      type: 'NO_BOOM',
      title: '🛡 SURVIVOR',
      description: 'Complete 2 levels without a BOOM',
      target: 2,
      progress: 0,
      reward: 25,
      completed: false,
      rewardClaimed: false
    },
    {
      id: 'task-builder',
      type: 'BUILD_COUNT',
      title: '🧱 MASTER BUILDER',
      description: 'Successfully place 20 blocks',
      target: 20,
      progress: 0,
      reward: 20,
      completed: false,
      rewardClaimed: false
    },
    {
      id: 'task-recovery',
      type: 'BOOM_RECOVERY',
      title: '🔄 RESILIENCE',
      description: 'Complete a level after a previous BOOM',
      target: 1,
      progress: 0,
      reward: 15,
      completed: false,
      rewardClaimed: false
    }
  ];
};

const STORAGE_KEY = 'buildOrBoomDaily_v3';

const loadDailyData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
    // Legacy migration v2
    const v2 = localStorage.getItem('buildOrBoomDaily_v2');
    if (v2) {
      const parsed = JSON.parse(v2);
      return {
        ...parsed,
        streakCount: 1,
        maxStreak: 1,
        streakClaimedToday: false,
        lastLoginDate: parsed.currentDateStr || getTodayStr()
      };
    }
  } catch (e) {
    console.error('Failed to load daily data:', e);
  }
  return null;
};

const saveDailyData = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save daily data:', e);
  }
};

export const useDailyStore = create<DailyStore>((set, get) => {
  return {
    currentDateStr: '',
    lastLoginDate: '',
    streakCount: 1,
    maxStreak: 1,
    streakClaimedToday: false,
    tasks: [],
    bonusClaimed: false,

    initDaily: () => {
      const today = getTodayStr();
      const saved = loadDailyData();

      let streak = saved?.streakCount ?? 1;
      let maxStreak = saved?.maxStreak ?? streak;
      let streakClaimed = saved?.streakClaimedToday ?? false;
      const lastLogin = saved?.lastLoginDate || saved?.currentDateStr || '';
      let tasks = saved?.tasks;
      let bonusClaimed = saved?.bonusClaimed ?? false;

      if (!lastLogin) {
        // First session
        streak = 1;
        maxStreak = 1;
        streakClaimed = false;
        tasks = generateTasks();
        bonusClaimed = false;
      } else {
        const diff = getDaysDiff(lastLogin, today);
        if (diff === 0) {
          // Same calendar day
          streak = Math.max(1, saved?.streakCount ?? 1);
          maxStreak = Math.max(maxStreak, streak);
          streakClaimed = saved?.streakClaimedToday ?? false;
          if (!tasks || saved?.currentDateStr !== today) {
            tasks = generateTasks();
            bonusClaimed = false;
          }
        } else if (diff === 1) {
          // Consecutive day login!
          streak = (saved?.streakCount || 1) + 1;
          maxStreak = Math.max(maxStreak, streak);
          streakClaimed = false; // New day, ready to claim today's streak reward
          tasks = generateTasks();
          bonusClaimed = false;
        } else if (diff > 1) {
          // Missed 1 or more days -> streak reset to 1
          streak = 1;
          streakClaimed = false;
          tasks = generateTasks();
          bonusClaimed = false;
        } else {
          // Time skew (clock moved backward)
          streak = Math.max(1, saved?.streakCount ?? 1);
        }
      }

      const newState = {
        currentDateStr: today,
        lastLoginDate: today,
        streakCount: streak,
        maxStreak: Math.max(maxStreak, streak),
        streakClaimedToday: streakClaimed,
        tasks: tasks || generateTasks(),
        bonusClaimed
      };

      saveDailyData(newState);
      set(newState);

      // Trigger LOGIN task completion automatically
      setTimeout(() => {
        get().updateProgress('LOGIN', 1);
      }, 100);
    },

    updateProgress: (type, amount) => {
      const state = get();
      if (state.currentDateStr !== getTodayStr()) {
        state.initDaily();
        return;
      }

      let changed = false;
      const newTasks = state.tasks.map((t) => {
        if (t.type === type && !t.completed) {
          const newProgress = Math.min(t.target, t.progress + amount);
          if (newProgress !== t.progress) {
            changed = true;
            return {
              ...t,
              progress: newProgress,
              completed: newProgress >= t.target
            };
          }
        }
        return t;
      });

      if (changed) {
        const updated = {
          ...state,
          tasks: newTasks
        };
        saveDailyData(updated);
        set({ tasks: newTasks });
      }
    },

    claimReward: (taskId: string) => {
      const state = get();
      let awardedCoins = 0;
      const multiplier = getStreakMultiplier(state.streakCount);

      const newTasks = state.tasks.map((t) => {
        if (t.id === taskId && t.completed && !t.rewardClaimed) {
          awardedCoins = Math.round(t.reward * multiplier);
          return { ...t, rewardClaimed: true };
        }
        return t;
      });

      if (awardedCoins > 0) {
        const updated = {
          ...state,
          tasks: newTasks
        };
        saveDailyData(updated);
        set({ tasks: newTasks });
        useGameStore.getState().addCoins(awardedCoins);
      }
      return awardedCoins;
    },

    claimBonus: () => {
      const state = get();
      if (state.bonusClaimed) return 0;

      const multiplier = getStreakMultiplier(state.streakCount);
      const baseBonus = 30;
      const awardedCoins = Math.round(baseBonus * multiplier);

      const updated = {
        ...state,
        bonusClaimed: true
      };
      saveDailyData(updated);
      set({ bonusClaimed: true });
      useGameStore.getState().addCoins(awardedCoins);
      return awardedCoins;
    },

    claimStreakReward: (): StreakRewardResult => {
      const state = get();
      if (state.streakClaimedToday) {
        return { totalCoins: 0, baseCoins: 0, multiplier: 1 };
      }

      const tier = getStreakTier(state.streakCount);
      const baseCoins = Math.round(tier.baseReward * tier.multiplier);
      let totalCoins = baseCoins;

      const cycleDay = ((state.streakCount - 1) % 7) + 1;
      const chestDef = getMysteryChestForCycleDay(cycleDay);
      let chestAwarded: StreakRewardResult['chestAwarded'] = undefined;

      if (chestDef) {
        const bonusCoins = Math.floor(Math.random() * (chestDef.maxBonusCoins - chestDef.minBonusCoins + 1)) + chestDef.minBonusCoins;
        totalCoins += bonusCoins;

        let powerupInfo: { type: 'stasis' | 'emp' | 'shield'; count: number } | undefined;
        if (chestDef.guaranteedPowerup && chestDef.powerupCount) {
          powerupInfo = {
            type: chestDef.guaranteedPowerup,
            count: chestDef.powerupCount
          };
          useGameStore.getState().addPowerupCharges(chestDef.guaranteedPowerup, chestDef.powerupCount);
        }

        let cosmeticReward: CosmeticSkinReward | undefined;
        if (chestDef.guaranteedCosmetic) {
          cosmeticReward = rollRandomCosmeticSkin();
        }

        chestAwarded = {
          chest: chestDef,
          bonusCoins,
          powerup: powerupInfo,
          cosmeticSkin: cosmeticReward
        };
      }

      const updated = {
        ...state,
        streakClaimedToday: true
      };
      saveDailyData(updated);
      set({ streakClaimedToday: true });
      useGameStore.getState().addCoins(totalCoins);

      return {
        totalCoins,
        baseCoins,
        multiplier: tier.multiplier,
        chestAwarded
      };
    },

    simulateOpenChest: (chestId?: string) => {
      let chestDef: MysteryChestDefinition = MYSTERY_CHESTS.day3;
      if (chestId === 'chest-day7' || chestId === 'apex' || chestId === 'day7') {
        chestDef = MYSTERY_CHESTS.day7;
      }

      const bonusCoins = Math.floor(Math.random() * (chestDef.maxBonusCoins - chestDef.minBonusCoins + 1)) + chestDef.minBonusCoins;
      let powerupInfo: { type: 'stasis' | 'emp' | 'shield'; count: number } | undefined;

      if (chestDef.guaranteedPowerup && chestDef.powerupCount) {
        powerupInfo = {
          type: chestDef.guaranteedPowerup,
          count: chestDef.powerupCount
        };
        useGameStore.getState().addPowerupCharges(chestDef.guaranteedPowerup, chestDef.powerupCount);
      }

      const cosmeticSkin = rollRandomCosmeticSkin();
      useGameStore.getState().addCoins(bonusCoins);

      return {
        chest: chestDef,
        bonusCoins,
        powerup: powerupInfo,
        cosmeticSkin
      };
    },

    debugAdvanceStreak: () => {
      const state = get();
      const nextStreak = state.streakCount + 1;
      const updated = {
        ...state,
        streakCount: nextStreak,
        maxStreak: Math.max(state.maxStreak, nextStreak),
        streakClaimedToday: false
      };
      saveDailyData(updated);
      set(updated);
    },

    debugResetStreak: () => {
      const state = get();
      const updated = {
        ...state,
        streakCount: 1,
        streakClaimedToday: false
      };
      saveDailyData(updated);
      set(updated);
    }
  };
});
