import { create } from 'zustand';
import { Tournament } from './tournamentTypes';
import { SandboxOptions } from './LevelGenerator';
import { PERK_DEFINITIONS, POWERUP_CONFIG, PowerupType } from './techTree';
import { ACHIEVEMENTS, Achievement, AchievementProgress, AchievementStats, getAchievementCurrentValue } from './achievements';
import { audio, SoundPackTheme } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import { ReplayData, loadLastReplay, generateDemoReplay } from './replayEngine';

type GameMode = 'menu' | 'campaign' | 'endless' | 'daily' | 'shop' | 'tournament' | 'academy' | 'workshop';
type GameState = 'idle' | 'playing' | 'won' | 'lost';
type AdState = 'none' | 'interstitial' | 'rewarded-revive' | 'rewarded-double-coins' | 'rewarded-shop-item' | 'rewarded-powerup' | 'rewarded-perk';

export type VisualThemeMode = 'default' | 'high-contrast' | 'cyberpunk' | 'minimal-dark' | 'deep-cosmos' | 'solar-gold';

interface GameStore {
  mode: GameMode;
  previousMode: GameMode;
  state: GameState;
  level: number;
  score: number;
  towerHeight: number; // Active tower block height during gameplay for dynamic verticality
  towerTilt: number; // Active tower tilt angle in degrees for reactive parallax sway
  highScores: Record<string, number>;
  unlockedLevels: number;

  // Player Identity & Tournaments
  playerId: string;
  playerName: string;
  playerAvatar: string;
  playerCountry: string;
  activeTournament: Tournament | null;
  tournamentRunResult: {
    rank: number;
    score: number;
    previousRank?: number;
    isNewBest: boolean;
    totalParticipants: number;
  } | null;
  trophies: { gold: number; silver: number; bronze: number };
  
  // Progression & Cosmetics
  coins: number;
  ownedCosmetics: string[];
  equippedCosmetic: string | null;
  equippedBackground: string | null;
  equippedBoomEffect: string | null;
  equippedPlate: string | null;

  // Tactical Consumable Powerups (No Free Handouts: Purchased with Coins or Rewarded Ads)
  powerups: {
    stasis: number;
    emp: number;
    shield: number;
  };
  buyPowerupWithCoins: (type: PowerupType) => boolean;
  rewardPowerupWithAd: (type: PowerupType) => void;
  consumePowerup: (type: 'stasis' | 'emp' | 'shield') => boolean;
  addPowerupCharges: (type: 'stasis' | 'emp' | 'shield', count: number) => void;

  // Perks & Tech Tree
  unlockedPerks: Record<string, number>; // perkId -> tier (1, 2, 3)
  upgradePerk: (perkId: string) => boolean;
  unlockPerkWithAd: (perkId: string) => boolean;

  // Sandbox Workshop
  sandboxOptions: SandboxOptions | null;
  setSandboxOptions: (options: SandboxOptions | null) => void;
  
  // Monetization state
  adsRemoved: boolean;
  levelsPlayedSinceAd: number;
  lastAdTime: number;
  adState: AdState;
  isReviving: boolean;
  pendingCoins: number;
  pendingShopItemId: string | null;
  pendingPowerupType: PowerupType | null;
  pendingPerkId: string | null;
  showIAP: boolean;
  showRemoveAds: boolean;
  hapticsEnabled: boolean;
  toggleHaptics: () => void;

  // Settings Overlay & Audio/Visual Preferences
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number; // 0.0 - 1.0
  sfxVolume: number;   // 0.0 - 1.0
  soundPack: SoundPackTheme;
  visualTheme: VisualThemeMode;
  highContrastMode: boolean;
  toggleMusic: () => void;
  toggleSfx: () => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setSoundPack: (pack: SoundPackTheme) => void;
  setVisualTheme: (theme: VisualThemeMode) => void;
  toggleHighContrast: () => void;

  // Achievements & Milestones
  achievementStats: AchievementStats;
  unlockedAchievements: Record<string, AchievementProgress>;
  recentUnlockedAchievement: Achievement | null;
  recordAchievementProgress: (metric: keyof AchievementStats, amount?: number) => void;
  recordCombo: (combo: number) => void;
  claimAchievement: (achievementId: string) => void;
  dismissAchievementToast: () => void;
  checkMilestones: () => void;
  
  setMode: (mode: GameMode) => void;
  setState: (state: GameState) => void;
  setLevel: (level: number) => void;
  setScore: (score: number) => void;
  setTowerHeight: (height: number) => void;
  setTowerTilt: (tilt: number) => void;
  unlockNextLevel: () => void;
  updateHighScore: (mode: string, score: number) => void;

  // Player & Tournament Actions
  setPlayerName: (name: string) => void;
  setPlayerAvatar: (avatar: string) => void;
  setPlayerCountry: (country: string) => void;
  startTournament: (tournament: Tournament) => void;
  setTournamentRunResult: (res: GameStore['tournamentRunResult']) => void;
  addTrophy: (type: 'gold' | 'silver' | 'bronze') => void;
  
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

  showPowerupAd: (type: PowerupType) => void;
  acceptPowerupAd: () => void;
  declinePowerupAd: () => void;

  showPerkAd: (perkId: string) => void;
  acceptPerkAd: () => void;
  declinePerkAd: () => void;
  
  setShowIAP: (show: boolean) => void;
  setShowRemoveAds: (show: boolean) => void;

  // Game Replay (Physics state recording of the last 10 seconds)
  lastReplay: ReplayData | null;
  setLastReplay: (replay: ReplayData | null) => void;
  replayModalOpen: boolean;
  setReplayModalOpen: (open: boolean) => void;

  // Campaign Quick-Start Guide (First 3 Blocks Onboarding)
  hasCompletedCampaignTutorial: boolean;
  isTutorialActive: boolean;
  tutorialStep: number; // 0: unstarted/standby, 1: block 1, 2: block 2, 3: block 3, 4: complete
  setTutorialActive: (active: boolean) => void;
  setTutorialStep: (step: number) => void;
  startCampaignTutorial: () => void;
  completeCampaignTutorial: () => void;
  resetCampaignTutorial: () => void;
}

const loadProgress = () => {
  try {
    const data = localStorage.getItem('buildOrBoomProgressV5');
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.playerId) {
        parsed.playerId = `player_${Math.random().toString(36).substring(2, 9)}`;
      }
      if (!parsed.playerName) {
        parsed.playerName = `Builder_${Math.floor(100 + Math.random() * 900)}`;
      }
      if (!parsed.playerAvatar) parsed.playerAvatar = '🧑‍🚀';
      if (!parsed.playerCountry) parsed.playerCountry = '🌍';
      if (!parsed.trophies) parsed.trophies = { gold: 0, silver: 0, bronze: 0 };
      if (parsed.hasCompletedCampaignTutorial === undefined) {
        parsed.hasCompletedCampaignTutorial = true;
      }
      
      // Clean up grandfathered free perks: NO FREE POWERUPS OR PERKS
      if (!parsed.unlockedPerks || (parsed.unlockedPerks.structural_gyro === 1 && parsed.unlockedPerks.precision_optics === 1 && Object.keys(parsed.unlockedPerks).length === 2)) {
        parsed.unlockedPerks = {};
      }
      if (!parsed.powerups) {
        parsed.powerups = { stasis: 0, emp: 0, shield: 0 };
      }
      if (parsed.coins === undefined || parsed.coins < 50) {
        parsed.coins = Math.max(parsed.coins || 0, 150);
      }
      if (parsed.hapticsEnabled === undefined) {
        parsed.hapticsEnabled = true;
      }
      if (parsed.musicEnabled === undefined) {
        parsed.musicEnabled = true;
      }
      if (parsed.sfxEnabled === undefined) {
        parsed.sfxEnabled = true;
      }
      if (parsed.musicVolume === undefined) {
        parsed.musicVolume = 0.6;
      }
      if (parsed.sfxVolume === undefined) {
        parsed.sfxVolume = 0.8;
      }
      if (!parsed.visualTheme) {
        parsed.visualTheme = 'default';
      }
      if (!parsed.soundPack) {
        parsed.soundPack = 'retro';
      }
      if (!parsed.achievementStats) {
        parsed.achievementStats = {
          totalBlocksPlaced: 0,
          perfectLandings: 0,
          bombsDefused: 0,
          highestCombo: 0,
          stasisUsed: 0,
          empUsed: 0,
          shieldUsed: 0,
        };
      }
      if (!parsed.unlockedAchievements) {
        parsed.unlockedAchievements = {};
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load progress', e);
  }
  return { 
    playerId: `player_${Math.random().toString(36).substring(2, 9)}`,
    playerName: `Builder_${Math.floor(100 + Math.random() * 900)}`,
    playerAvatar: '🧑‍🚀',
    playerCountry: '🌍',
    trophies: { gold: 0, silver: 0, bronze: 0 },
    unlockedLevels: 1, 
    highScores: {}, 
    hasCompletedCampaignTutorial: true,
    adsRemoved: false, 
    coins: 150, 
    ownedCosmetics: [], 
    equippedCosmetic: null,
    equippedBackground: null,
    equippedBoomEffect: null, 
    equippedPlate: null,
    unlockedPerks: {}, // NO FREE PERKS
    powerups: { stasis: 0, emp: 0, shield: 0 }, // NO FREE POWERUPS
    hapticsEnabled: true,
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    soundPack: 'retro' as SoundPackTheme,
    visualTheme: 'default' as VisualThemeMode,
    achievementStats: {
      totalBlocksPlaced: 0,
      perfectLandings: 0,
      bombsDefused: 0,
      highestCombo: 0,
      stasisUsed: 0,
      empUsed: 0,
      shieldUsed: 0,
    },
    unlockedAchievements: {},
  };
};

const saveProgress = (data: Partial<GameStore>) => {
  try {
    const current = loadProgress();
    const toSave = {
      playerId: data.playerId ?? current.playerId,
      playerName: data.playerName ?? current.playerName,
      playerAvatar: data.playerAvatar ?? current.playerAvatar,
      playerCountry: data.playerCountry ?? current.playerCountry,
      trophies: data.trophies ?? current.trophies,
      unlockedLevels: data.unlockedLevels ?? current.unlockedLevels,
      highScores: data.highScores ?? current.highScores,
      hasCompletedCampaignTutorial: data.hasCompletedCampaignTutorial !== undefined ? data.hasCompletedCampaignTutorial : current.hasCompletedCampaignTutorial,
      adsRemoved: data.adsRemoved ?? current.adsRemoved,
      coins: data.coins ?? current.coins,
      ownedCosmetics: data.ownedCosmetics ?? current.ownedCosmetics,
      equippedCosmetic: data.equippedCosmetic !== undefined ? data.equippedCosmetic : current.equippedCosmetic,
      equippedBackground: data.equippedBackground !== undefined ? data.equippedBackground : current.equippedBackground,
      equippedBoomEffect: data.equippedBoomEffect !== undefined ? data.equippedBoomEffect : current.equippedBoomEffect,
      equippedPlate: data.equippedPlate !== undefined ? data.equippedPlate : current.equippedPlate,
      unlockedPerks: data.unlockedPerks ?? current.unlockedPerks,
      powerups: data.powerups ?? current.powerups,
      hapticsEnabled: data.hapticsEnabled !== undefined ? data.hapticsEnabled : current.hapticsEnabled,
      musicEnabled: data.musicEnabled !== undefined ? data.musicEnabled : current.musicEnabled,
      sfxEnabled: data.sfxEnabled !== undefined ? data.sfxEnabled : current.sfxEnabled,
      musicVolume: data.musicVolume !== undefined ? data.musicVolume : current.musicVolume,
      sfxVolume: data.sfxVolume !== undefined ? data.sfxVolume : current.sfxVolume,
      soundPack: data.soundPack !== undefined ? data.soundPack : current.soundPack,
      visualTheme: data.visualTheme !== undefined ? data.visualTheme : current.visualTheme,
      achievementStats: data.achievementStats ?? current.achievementStats,
      unlockedAchievements: data.unlockedAchievements ?? current.unlockedAchievements,
    };
    localStorage.setItem('buildOrBoomProgressV5', JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
};

const initialProgress = loadProgress();

// Sync initial audio configuration
if (typeof window !== 'undefined') {
  audio.sfxEnabled = initialProgress.sfxEnabled ?? true;
  audio.musicEnabled = initialProgress.musicEnabled ?? true;
  audio.sfxVolume = initialProgress.sfxVolume ?? 0.8;
  audio.musicVolume = initialProgress.musicVolume ?? 0.6;
  audio.soundPack = (initialProgress.soundPack as SoundPackTheme) || 'retro';
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'menu',
  state: 'idle',
  level: 1,
  score: 0,
  towerHeight: 0,
  towerTilt: 0,
  unlockedLevels: initialProgress.unlockedLevels,
  highScores: initialProgress.highScores,
  hasCompletedCampaignTutorial: initialProgress.hasCompletedCampaignTutorial ?? true,
  isTutorialActive: false,
  tutorialStep: 0,
  setTutorialActive: (active) => set({ isTutorialActive: active }),
  setTutorialStep: (step) => set({ tutorialStep: step }),
  startCampaignTutorial: () => {
    set({
      mode: 'campaign',
      level: 1,
      state: 'playing',
      isTutorialActive: true,
      tutorialStep: 1,
    });
  },
  completeCampaignTutorial: () => {
    saveProgress({ hasCompletedCampaignTutorial: true });
    get().addCoins(150);
    set({
      hasCompletedCampaignTutorial: true,
      isTutorialActive: false,
      tutorialStep: 4,
    });
  },
  resetCampaignTutorial: () => {
    saveProgress({ hasCompletedCampaignTutorial: false });
    set({
      hasCompletedCampaignTutorial: false,
      isTutorialActive: false,
      tutorialStep: 0,
    });
  },
  hapticsEnabled: initialProgress.hapticsEnabled !== undefined ? initialProgress.hapticsEnabled : true,
  toggleHaptics: () => {
    const next = !get().hapticsEnabled;
    saveProgress({ hapticsEnabled: next });
    set({ hapticsEnabled: next });
  },

  // Settings & Theme
  settingsModalOpen: false,
  setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),

  musicEnabled: initialProgress.musicEnabled ?? true,
  sfxEnabled: initialProgress.sfxEnabled ?? true,
  musicVolume: initialProgress.musicVolume ?? 0.6,
  sfxVolume: initialProgress.sfxVolume ?? 0.8,
  soundPack: (initialProgress.soundPack as SoundPackTheme) || 'retro',
  visualTheme: (initialProgress.visualTheme as VisualThemeMode) || 'default',
  highContrastMode: (initialProgress.visualTheme || 'default') === 'high-contrast',

  toggleMusic: () => {
    const next = !get().musicEnabled;
    audio.setMusicEnabled(next);
    saveProgress({ musicEnabled: next });
    set({ musicEnabled: next });
  },

  toggleSfx: () => {
    const next = !get().sfxEnabled;
    audio.setSfxEnabled(next);
    saveProgress({ sfxEnabled: next });
    set({ sfxEnabled: next });
  },

  setMusicVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    audio.setMusicVolume(clamped);
    saveProgress({ musicVolume: clamped });
    set({ musicVolume: clamped });
  },

  setSfxVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    audio.setSfxVolume(clamped);
    saveProgress({ sfxVolume: clamped });
    set({ sfxVolume: clamped });
  },

  setSoundPack: (pack) => {
    audio.setSoundPack(pack);
    saveProgress({ soundPack: pack });
    set({ soundPack: pack });
  },

  setVisualTheme: (theme) => {
    saveProgress({ visualTheme: theme });
    set({
      visualTheme: theme,
      highContrastMode: theme === 'high-contrast',
    });
  },

  toggleHighContrast: () => {
    const current = get().visualTheme;
    const nextTheme: VisualThemeMode = current === 'high-contrast' ? 'default' : 'high-contrast';
    get().setVisualTheme(nextTheme);
  },
  
  playerId: initialProgress.playerId || `player_${Math.random().toString(36).substring(2, 9)}`,
  playerName: initialProgress.playerName || `Builder_${Math.floor(100 + Math.random() * 900)}`,
  playerAvatar: initialProgress.playerAvatar || '🧑‍🚀',
  playerCountry: initialProgress.playerCountry || '🌍',
  activeTournament: null,
  tournamentRunResult: null,
  trophies: initialProgress.trophies || { gold: 0, silver: 0, bronze: 0 },

  coins: initialProgress.coins !== undefined ? initialProgress.coins : 150,
  ownedCosmetics: initialProgress.ownedCosmetics || [],
  equippedCosmetic: initialProgress.equippedCosmetic || null,
  equippedBackground: initialProgress.equippedBackground || null,
  equippedBoomEffect: initialProgress.equippedBoomEffect || null,
  equippedPlate: initialProgress.equippedPlate || null,

  // Game Replay state
  lastReplay: loadLastReplay() || generateDemoReplay(),
  setLastReplay: (replay: ReplayData | null) => set({ lastReplay: replay }),
  replayModalOpen: false,
  setReplayModalOpen: (open: boolean) => set({ replayModalOpen: open }),
  
  // Powerups: NO FREE POWERUPS - must be purchased with coins or ads
  powerups: initialProgress.powerups || { stasis: 0, emp: 0, shield: 0 },

  buyPowerupWithCoins: (type: PowerupType) => {
    const s = get();
    const config = POWERUP_CONFIG[type];
    if (!config) return false;
    if (s.coins < config.coinPrice) return false;

    const newCoins = s.coins - config.coinPrice;
    const current = { ...s.powerups };

    if (config.chargesGranted.stasis) current.stasis = (current.stasis || 0) + config.chargesGranted.stasis;
    if (config.chargesGranted.emp) current.emp = (current.emp || 0) + config.chargesGranted.emp;
    if (config.chargesGranted.shield) current.shield = (current.shield || 0) + config.chargesGranted.shield;

    saveProgress({ coins: newCoins, powerups: current });
    set({ coins: newCoins, powerups: current });
    return true;
  },

  rewardPowerupWithAd: (type: PowerupType) => {
    const s = get();
    const config = POWERUP_CONFIG[type];
    if (!config) return;

    const current = { ...s.powerups };
    if (config.chargesGranted.stasis) current.stasis = (current.stasis || 0) + config.chargesGranted.stasis;
    if (config.chargesGranted.emp) current.emp = (current.emp || 0) + config.chargesGranted.emp;
    if (config.chargesGranted.shield) current.shield = (current.shield || 0) + config.chargesGranted.shield;

    saveProgress({ powerups: current });
    set({ powerups: current });
  },

  consumePowerup: (type: 'stasis' | 'emp' | 'shield') => {
    const s = get();
    if (!s.powerups[type] || s.powerups[type] <= 0) return false;

    const current = { ...s.powerups, [type]: s.powerups[type] - 1 };
    saveProgress({ powerups: current });
    set({ powerups: current });
    return true;
  },

  addPowerupCharges: (type: 'stasis' | 'emp' | 'shield', count: number) => {
    const s = get();
    const current = { ...s.powerups, [type]: (s.powerups[type] || 0) + count };
    saveProgress({ powerups: current });
    set({ powerups: current });
  },

  unlockedPerks: initialProgress.unlockedPerks || {},
  upgradePerk: (perkId: string) => {
    const state = get();
    const def = PERK_DEFINITIONS[perkId];
    if (!def) return false;

    const currentTier = state.unlockedPerks[perkId] || 0;
    const nextTierIdx = currentTier; // 0 -> tier 1 (index 0)
    if (nextTierIdx >= def.tiers.length) return false;

    const tierInfo = def.tiers[nextTierIdx];
    if (state.coins < tierInfo.cost) return false;

    const newCoins = state.coins - tierInfo.cost;
    const newPerks = { ...state.unlockedPerks, [perkId]: currentTier + 1 };

    saveProgress({ coins: newCoins, unlockedPerks: newPerks });
    set({ coins: newCoins, unlockedPerks: newPerks });
    return true;
  },

  unlockPerkWithAd: (perkId: string) => {
    const state = get();
    const def = PERK_DEFINITIONS[perkId];
    if (!def) return false;

    const currentTier = state.unlockedPerks[perkId] || 0;
    const nextTierIdx = currentTier;
    if (nextTierIdx >= def.tiers.length) return false;

    const newPerks = { ...state.unlockedPerks, [perkId]: currentTier + 1 };
    saveProgress({ unlockedPerks: newPerks });
    set({ unlockedPerks: newPerks });
    return true;
  },

  sandboxOptions: null,
  setSandboxOptions: (options) => set({ sandboxOptions: options }),

  pendingCoins: 0,
  pendingShopItemId: null,
  pendingPowerupType: null,
  pendingPerkId: null,
  showIAP: false,
  showRemoveAds: false,

  // Achievements State & Actions
  achievementStats: initialProgress.achievementStats || {
    totalBlocksPlaced: 0,
    perfectLandings: 0,
    bombsDefused: 0,
    highestCombo: 0,
    stasisUsed: 0,
    empUsed: 0,
    shieldUsed: 0,
  },
  unlockedAchievements: initialProgress.unlockedAchievements || {},
  recentUnlockedAchievement: null,
  dismissAchievementToast: () => set({ recentUnlockedAchievement: null }),

  checkMilestones: () => {
    const s = get();
    const stats = s.achievementStats;
    const currentUnlocked = { ...s.unlockedAchievements };
    let newlyUnlocked: Achievement | null = null;
    let changed = false;

    for (const ach of ACHIEVEMENTS) {
      if (!currentUnlocked[ach.id]?.unlocked) {
        const val = getAchievementCurrentValue(ach.id, stats, s.unlockedLevels, s.highScores, s.coins);
        if (val >= ach.target) {
          currentUnlocked[ach.id] = {
            unlocked: true,
            unlockedAt: Date.now(),
            claimed: false,
          };
          changed = true;
          if (!newlyUnlocked) {
            newlyUnlocked = ach;
          }
        }
      }
    }

    if (changed) {
      saveProgress({ unlockedAchievements: currentUnlocked, achievementStats: stats });
      set({
        unlockedAchievements: currentUnlocked,
        ...(newlyUnlocked ? { recentUnlockedAchievement: newlyUnlocked } : {}),
      });

      if (newlyUnlocked) {
        audio.playAchievementSound();
        haptics.achievementUnlocked();
      }
    }
  },

  recordAchievementProgress: (metric: keyof AchievementStats, amount: number = 1) => {
    const s = get();
    const currentVal = s.achievementStats[metric] || 0;
    const updatedStats = {
      ...s.achievementStats,
      [metric]: currentVal + amount,
    };
    saveProgress({ achievementStats: updatedStats });
    set({ achievementStats: updatedStats });
    get().checkMilestones();
  },

  recordCombo: (combo: number) => {
    const s = get();
    if (combo > (s.achievementStats.highestCombo || 0)) {
      const updatedStats = {
        ...s.achievementStats,
        highestCombo: combo,
      };
      saveProgress({ achievementStats: updatedStats });
      set({ achievementStats: updatedStats });
      get().checkMilestones();
    }
  },

  claimAchievement: (achievementId: string) => {
    const s = get();
    const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!ach) return;
    const status = s.unlockedAchievements[achievementId];
    if (status && status.unlocked && !status.claimed) {
      const updated = {
        ...s.unlockedAchievements,
        [achievementId]: {
          ...status,
          claimed: true,
        },
      };
      s.addCoins(ach.rewardCoins);
      saveProgress({ unlockedAchievements: updated });
      set({ unlockedAchievements: updated });
      audio.playPerfectSound();
      haptics.vibrate([20, 30, 20]);
    }
  },
  
  adsRemoved: initialProgress.adsRemoved || false,
  levelsPlayedSinceAd: 0,
  lastAdTime: Date.now(),
  adState: 'none',
  isReviving: false,
  previousMode: 'menu',
  
  setMode: (mode) => set((s) => ({
    previousMode: s.mode,
    mode,
    state: (mode === 'academy' || mode === 'workshop' || mode === 'menu' || mode === 'shop' || mode === 'daily') ? 'idle' : s.state,
  })),
  setState: (state) => set({ state }),
  setLevel: (level) => set({ level }),
  setScore: (score) => set({ score }),
  setTowerHeight: (towerHeight) => set({ towerHeight }),
  setTowerTilt: (towerTilt) => set({ towerTilt }),

  setPlayerName: (name) => {
    saveProgress({ playerName: name });
    set({ playerName: name });
  },

  setPlayerAvatar: (avatar) => {
    saveProgress({ playerAvatar: avatar });
    set({ playerAvatar: avatar });
  },

  setPlayerCountry: (country) => {
    saveProgress({ playerCountry: country });
    set({ playerCountry: country });
  },

  startTournament: (tournament) => {
    const { unlockedLevels } = get();
    const reqLevel = tournament.requiredLevel || ((tournament.worldNumber ? tournament.worldNumber - 1 : 0) * 10 + 1);
    if (unlockedLevels < reqLevel) {
      console.warn(`Tournament locked! Requires World ${tournament.worldNumber} (Level ${reqLevel}).`);
      return;
    }
    set({
      activeTournament: tournament,
      mode: 'tournament',
      state: 'playing',
      score: 0,
      tournamentRunResult: null,
    });
  },

  setTournamentRunResult: (res) => {
    set({ tournamentRunResult: res });
  },

  addTrophy: (type) => {
    const current = get().trophies;
    const updated = {
      ...current,
      [type]: (current[type] || 0) + 1,
    };
    saveProgress({ trophies: updated });
    set({ trophies: updated });
  },
  
  unlockNextLevel: () => {
    set((store) => {
      const newUnlocked = Math.min(200, Math.max(store.unlockedLevels, store.level + 1));
      saveProgress({ unlockedLevels: newUnlocked });
      return { unlockedLevels: newUnlocked };
    });
    get().checkMilestones();
  },
  
  updateHighScore: (mode, score) => {
    set((store) => {
      const currentHigh = store.highScores[mode] || 0;
      if (score > currentHigh) {
        const newHighScores = { ...store.highScores, [mode]: score };
        saveProgress({ highScores: newHighScores });
        return { highScores: newHighScores };
      }
      return {};
    });
    get().checkMilestones();
  },
  
  addCoins: (amount) => {
    set((store) => {
      const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
      const currentCoins = Number.isFinite(store.coins) ? Math.max(0, Math.round(store.coins)) : 0;
      const newCoins = currentCoins + safeAmount;
      saveProgress({ coins: newCoins });
      return { coins: newCoins };
    });
    get().checkMilestones();
  },
  
  setPendingCoins: (amount) => {
    const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
    set({ pendingCoins: safeAmount });
  },
  
  buyCosmetic: (id, price) => {
    const store = get();
    const safePrice = Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0;
    if (store.coins >= safePrice && !store.ownedCosmetics.includes(id)) {
      const newCoins = Math.max(0, store.coins - safePrice);
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
    const cooldownMs = 3 * 60 * 1000; // Minimum 3 minutes between interstitials
    
    const newLevelsPlayed = s.levelsPlayedSinceAd + 1;
    
    // Only trigger if cooldown has elapsed AND sufficient gameplay sessions have completed
    const shouldTrigger = completedLevel
      ? (newLevelsPlayed >= 3 && timePassed >= cooldownMs)
      : (newLevelsPlayed >= 6 && timePassed >= cooldownMs * 1.5); // Repeated failures cannot spam interstitials

    if (shouldTrigger) {
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

  showPowerupAd: (type) => set({ adState: 'rewarded-powerup', pendingPowerupType: type }),
  acceptPowerupAd: () => {
    const s = get();
    if (s.pendingPowerupType) {
      s.rewardPowerupWithAd(s.pendingPowerupType);
    }
    set({ adState: 'none', pendingPowerupType: null });
  },
  declinePowerupAd: () => {
    set({ adState: 'none', pendingPowerupType: null });
  },

  showPerkAd: (perkId) => set({ adState: 'rewarded-perk', pendingPerkId: perkId }),
  acceptPerkAd: () => {
    const s = get();
    if (s.pendingPerkId) {
      s.unlockPerkWithAd(s.pendingPerkId);
    }
    set({ adState: 'none', pendingPerkId: null });
  },
  declinePerkAd: () => {
    set({ adState: 'none', pendingPerkId: null });
  },
  
  setShowIAP: (show) => set({ showIAP: show }),
  setShowRemoveAds: (show) => set({ showRemoveAds: show })
}));
