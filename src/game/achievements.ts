export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  tier: AchievementTier;
  target: number;
  rewardCoins: number;
  category: 'stacking' | 'precision' | 'hazard' | 'career';
}

export interface AchievementProgress {
  unlocked: boolean;
  unlockedAt?: number;
  claimed?: boolean;
}

export interface AchievementStats {
  totalBlocksPlaced: number;
  perfectLandings: number;
  bombsDefused: number;
  highestCombo: number;
  stasisUsed: number;
  empUsed: number;
  shieldUsed: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // STACKING MILESTONES
  {
    id: 'stack_10',
    title: 'First Foundation',
    description: 'Stack 10 blocks in total across all games',
    badgeIcon: '🧱',
    tier: 'bronze',
    target: 10,
    rewardCoins: 50,
    category: 'stacking',
  },
  {
    id: 'stack_50',
    title: 'Skyscraper Master',
    description: 'Stack 50 blocks in total across all games',
    badgeIcon: '🏙️',
    tier: 'silver',
    target: 50,
    rewardCoins: 150,
    category: 'stacking',
  },
  {
    id: 'stack_150',
    title: 'Megacity Titan',
    description: 'Stack 150 blocks in total across all games',
    badgeIcon: '🏗️',
    tier: 'gold',
    target: 150,
    rewardCoins: 350,
    category: 'stacking',
  },

  // PRECISION & SKILL
  {
    id: 'perfect_1',
    title: 'Perfect Landing',
    description: 'Land a block with frame-perfect center alignment',
    badgeIcon: '🎯',
    tier: 'bronze',
    target: 1,
    rewardCoins: 50,
    category: 'precision',
  },
  {
    id: 'perfect_10',
    title: 'Laser Precision',
    description: 'Land 10 perfect center alignments',
    badgeIcon: '✨',
    tier: 'silver',
    target: 10,
    rewardCoins: 150,
    category: 'precision',
  },
  {
    id: 'perfect_25',
    title: 'Precision Deity',
    description: 'Land 25 perfect center alignments',
    badgeIcon: '💎',
    tier: 'diamond',
    target: 25,
    rewardCoins: 400,
    category: 'precision',
  },

  // COMBOS & SURGES
  {
    id: 'combo_5',
    title: 'Combo Surge',
    description: 'Reach a 5x combo streak without missing',
    badgeIcon: '🔥',
    tier: 'silver',
    target: 5,
    rewardCoins: 100,
    category: 'precision',
  },
  {
    id: 'combo_10',
    title: 'Architect Velocity',
    description: 'Reach a 10x combo streak in a single session',
    badgeIcon: '⚡',
    tier: 'diamond',
    target: 10,
    rewardCoins: 300,
    category: 'precision',
  },

  // HAZARDS & TACTICAL
  {
    id: 'bomb_defuser',
    title: 'Bomb Defuser',
    description: 'Neutralize or absorb a bomb block with EMP or shield',
    badgeIcon: '💣',
    tier: 'bronze',
    target: 1,
    rewardCoins: 75,
    category: 'hazard',
  },
  {
    id: 'bomb_squad_5',
    title: 'Hazard Specialist',
    description: 'Neutralize or absorb 5 bomb blocks',
    badgeIcon: '🛡️',
    tier: 'gold',
    target: 5,
    rewardCoins: 250,
    category: 'hazard',
  },
  {
    id: 'stasis_3',
    title: 'Time Bender',
    description: 'Activate Chrono Stasis time slow-down 3 times',
    badgeIcon: '⏳',
    tier: 'silver',
    target: 3,
    rewardCoins: 100,
    category: 'hazard',
  },

  // CAREER & MODES
  {
    id: 'campaign_5',
    title: 'Climbing Ranks',
    description: 'Reach Level 5 in Campaign mode',
    badgeIcon: '🧗',
    tier: 'bronze',
    target: 5,
    rewardCoins: 100,
    category: 'career',
  },
  {
    id: 'campaign_15',
    title: 'Master Architect',
    description: 'Reach Level 15 in Campaign mode',
    badgeIcon: '👑',
    tier: 'gold',
    target: 15,
    rewardCoins: 300,
    category: 'career',
  },
  {
    id: 'endless_25',
    title: 'Endless Pioneer',
    description: 'Achieve a score of 25+ in Endless mode',
    badgeIcon: '♾️',
    tier: 'silver',
    target: 25,
    rewardCoins: 150,
    category: 'career',
  },
  {
    id: 'coin_hoarder',
    title: 'Vault Tycoon',
    description: 'Amass 500 Coins in your treasury',
    badgeIcon: '💰',
    tier: 'gold',
    target: 500,
    rewardCoins: 200,
    category: 'career',
  },
];

export const TIER_COLORS: Record<AchievementTier, {
  border: string;
  bg: string;
  glow: string;
  ribbon: string;
  text: string;
  label: string;
}> = {
  bronze: {
    border: 'border-amber-700/80',
    bg: 'from-amber-950/70 to-amber-900/50',
    glow: 'shadow-[0_0_12px_rgba(180,83,9,0.3)]',
    ribbon: 'bg-amber-700 text-amber-100',
    text: 'text-amber-400',
    label: 'Bronze',
  },
  silver: {
    border: 'border-slate-300/80',
    bg: 'from-slate-800/80 to-slate-700/60',
    glow: 'shadow-[0_0_14px_rgba(203,213,225,0.4)]',
    ribbon: 'bg-slate-300 text-slate-900',
    text: 'text-slate-200',
    label: 'Silver',
  },
  gold: {
    border: 'border-yellow-400/90',
    bg: 'from-yellow-950/80 to-amber-900/70',
    glow: 'shadow-[0_0_18px_rgba(234,179,8,0.5)]',
    ribbon: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-black',
    text: 'text-yellow-300',
    label: 'Gold',
  },
  diamond: {
    border: 'border-cyan-300/90',
    bg: 'from-cyan-950/80 to-blue-900/70',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.6)]',
    ribbon: 'bg-gradient-to-r from-cyan-300 to-sky-400 text-cyan-950 font-black',
    text: 'text-cyan-300',
    label: 'Diamond',
  },
};

/**
 * Calculates current progress value for a specific achievement based on overall stats.
 */
export function getAchievementCurrentValue(
  achievementId: string,
  stats: AchievementStats,
  unlockedLevels: number,
  highScores: Record<string, number>,
  coins: number
): number {
  switch (achievementId) {
    case 'stack_10':
    case 'stack_50':
    case 'stack_150':
      return stats.totalBlocksPlaced;
    case 'perfect_1':
    case 'perfect_10':
    case 'perfect_25':
      return stats.perfectLandings;
    case 'combo_5':
    case 'combo_10':
      return stats.highestCombo;
    case 'bomb_defuser':
    case 'bomb_squad_5':
      return stats.bombsDefused;
    case 'stasis_3':
      return stats.stasisUsed;
    case 'campaign_5':
    case 'campaign_15':
      return unlockedLevels;
    case 'endless_25':
      return highScores['endless'] || 0;
    case 'coin_hoarder':
      return coins;
    default:
      return 0;
  }
}
