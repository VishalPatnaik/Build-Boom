export type PerkCategory = 'tactical' | 'engineering' | 'precision' | 'economics';
export type PowerupType = 'stasis' | 'emp' | 'shield' | 'bundle';

export interface PowerupItemDef {
  id: PowerupType;
  name: string;
  icon: string;
  badge: string;
  desc: string;
  coinPrice: number;
  chargesGranted: { stasis?: number; emp?: number; shield?: number };
  highlight: string;
}

export const POWERUP_CONFIG: Record<PowerupType, PowerupItemDef> = {
  stasis: {
    id: 'stasis',
    name: 'Slow-Mo',
    icon: '⏳',
    badge: 'POWER-UP [Q]',
    desc: 'Slows the whole game to half speed for a few seconds so you can line up your taps.',
    coinPrice: 60,
    chargesGranted: { stasis: 2 },
    highlight: '+2 Slow-Mo',
  },
  emp: {
    id: 'emp',
    name: 'Bomb Clear',
    icon: '⚡',
    badge: 'POWER-UP [W]',
    desc: 'Removes the nearest incoming bomb and pays you coins for it.',
    coinPrice: 60,
    chargesGranted: { emp: 2 },
    highlight: '+2 Bomb Clear',
  },
  shield: {
    id: 'shield',
    name: 'Shield',
    icon: '🛡️',
    badge: 'POWER-UP',
    desc: 'Catches one mistake: a toppling tower, a tapped bomb or a tap that was too early.',
    coinPrice: 84,
    chargesGranted: { shield: 1 },
    highlight: '+1 Shield',
  },
  bundle: {
    id: 'bundle',
    name: 'Power-up Crate',
    icon: '🧰',
    badge: 'BEST VALUE',
    desc: '+2 Slow-Mo, +2 Bomb Clear and +1 Shield.',
    coinPrice: 144,
    chargesGranted: { stasis: 2, emp: 2, shield: 1 },
    highlight: '5 power-ups',
  },
};

export interface PerkTier {
  tier: number;
  title: string;
  description: string;
  cost: number;
  effectValue: number;
  highlightStat: string;
}

export interface PerkDefinition {
  id: string;
  name: string;
  category: PerkCategory;
  badge: string;
  icon: string;
  hotkey?: string;
  summary: string;
  tiers: PerkTier[];
}

export const PERK_DEFINITIONS: Record<string, PerkDefinition> = {
  chrono_stasis: {
    id: 'chrono_stasis',
    name: 'Slow-Mo Upgrade',
    category: 'tactical',
    badge: 'POWER-UP [Q]',
    icon: '⏳',
    hotkey: 'Q',
    summary: 'Free Slow-Mo every run, and a stronger slow-down.',
    tiers: [
      {
        tier: 1,
        title: 'Slow-Mo I',
        description: 'Start every run with 1 free Slow-Mo. It slows the game to half speed for 3.5 seconds.',
        cost: 250,
        effectValue: 0.5,
        highlightStat: '1 free per run / half speed, 3.5s',
      },
      {
        tier: 2,
        title: 'Slow-Mo II',
        description: '2 free Slow-Mo per run. Each lasts 5 seconds and slows the game to 35% speed.',
        cost: 650,
        effectValue: 0.65,
        highlightStat: '2 free per run / 35% speed, 5s',
      },
      {
        tier: 3,
        title: 'Slow-Mo III',
        description: '3 free Slow-Mo per run, slowing the game to 25% speed. While it is on, disguised and flickering blocks show what they really are.',
        cost: 1500,
        effectValue: 0.8,
        highlightStat: '3 free per run / 25% speed / see disguises',
      },
    ],
  },

  emp_defuser: {
    id: 'emp_defuser',
    name: 'Bomb Clear Upgrade',
    category: 'tactical',
    badge: 'POWER-UP [W]',
    icon: '⚡',
    hotkey: 'W',
    summary: 'Free Bomb Clears every run, and more coins per bomb.',
    tiers: [
      {
        tier: 1,
        title: 'Bomb Clear I',
        description: 'Start every run with 1 free Bomb Clear. It removes the nearest incoming bomb and pays 30 coins.',
        cost: 300,
        effectValue: 30,
        highlightStat: '1 free per run / 30 coins',
      },
      {
        tier: 2,
        title: 'Bomb Clear II',
        description: '2 free Bomb Clears per run, and each cleared bomb pays 60 coins.',
        cost: 750,
        effectValue: 60,
        highlightStat: '2 free per run / 60 coins',
      },
      {
        tier: 3,
        title: 'Bomb Clear III',
        description: '3 free Bomb Clears per run, and each one removes every bomb on screen at once.',
        cost: 1800,
        effectValue: 100,
        highlightStat: '3 free per run / clears the screen',
      },
    ],
  },

  aegis_shield: {
    id: 'aegis_shield',
    name: 'Shield Upgrade',
    category: 'tactical',
    badge: 'POWER-UP',
    icon: '🛡️',
    summary: 'Start runs protected; a shield catches one collapse, bomb or early tap.',
    tiers: [
      {
        tier: 1,
        title: 'Shield I',
        description: 'Every run starts with the shield already on, so your first big mistake is forgiven.',
        cost: 400,
        effectValue: 1,
        highlightStat: 'Shield on at start of every run',
      },
      {
        tier: 2,
        title: 'Shield II',
        description: 'Earn a free shield each time a perfect landing takes your combo to 20, 40, 60...',
        cost: 1100,
        effectValue: 2,
        highlightStat: 'Free shield every 20 combo',
      },
      {
        tier: 3,
        title: 'Shield III',
        description: 'When the shield breaks, you get 2 seconds of free slow-mo and nearby bombs are cleared.',
        cost: 2400,
        effectValue: 3,
        highlightStat: 'Free slow-mo + bomb clear when it breaks',
      },
    ],
  },

  structural_gyro: {
    id: 'structural_gyro',
    name: 'Stabiliser',
    category: 'engineering',
    badge: 'ALWAYS ON',
    icon: '📐',
    summary: 'Your tower can lean further before falling and stops swaying sooner.',
    tiers: [
      {
        tier: 1,
        title: 'Stabiliser I',
        description: 'The tower can lean up to 32° before it falls (normally 25°), and sway dies down faster.',
        cost: 200,
        effectValue: 32,
        highlightStat: 'Lean limit 32°',
      },
      {
        tier: 2,
        title: 'Stabiliser II',
        description: 'Lean limit 38°, and off-centre taps rock the tower 40% less.',
        cost: 550,
        effectValue: 38,
        highlightStat: 'Lean limit 38° / 40% less rocking',
      },
      {
        tier: 3,
        title: 'Stabiliser III',
        description: 'Lean limit 45°, and every perfect landing stops the sway completely.',
        cost: 1300,
        effectValue: 45,
        highlightStat: 'Lean limit 45° / perfect stops sway',
      },
    ],
  },

  precision_optics: {
    id: 'precision_optics',
    name: 'Aim Assist',
    category: 'precision',
    badge: 'ALWAYS ON',
    icon: '🎯',
    summary: 'Bigger perfect zone and blocks slip less when your timing is off.',
    tiers: [
      {
        tier: 1,
        title: 'Aim Assist I',
        description: 'Shows each block\'s flight path. The perfect zone is 20% bigger and blocks slip 10% less.',
        cost: 180,
        effectValue: 1.2,
        highlightStat: 'Flight paths / +20% perfect zone',
      },
      {
        tier: 2,
        title: 'Aim Assist II',
        description: 'Perfect zone 40% bigger, blocks slip 20% less, and perfect landings score 2x instead of 1.5x.',
        cost: 500,
        effectValue: 1.4,
        highlightStat: '+40% perfect zone / 2x perfect score',
      },
      {
        tier: 3,
        title: 'Aim Assist III',
        description: 'Perfect zone 60% bigger, blocks slip 30% less, and you score double points while your combo is 10 or more.',
        cost: 1200,
        effectValue: 2.0,
        highlightStat: '+60% perfect zone / 2x points at 10 combo',
      },
    ],
  },

  midas_foundation: {
    id: 'midas_foundation',
    name: 'Coin Bonus',
    category: 'economics',
    badge: 'ALWAYS ON',
    icon: '🪙',
    summary: 'Earn more coins from every run, bomb and gold block.',
    tiers: [
      {
        tier: 1,
        title: 'Coin Bonus I',
        description: '+2 coins for every bomb you let fly past, +15% coins at the end of a run, and gold and crystal blocks pay 25% more.',
        cost: 220,
        effectValue: 15,
        highlightStat: '+15% end coins / +2 per bomb',
      },
      {
        tier: 2,
        title: 'Coin Bonus II',
        description: '+30% coins at the end of a run, and gold and crystal blocks pay 50% more.',
        cost: 650,
        effectValue: 30,
        highlightStat: '+30% end coins',
      },
      {
        tier: 3,
        title: 'Coin Bonus III',
        description: '+50% coins at the end of a run, and gold and crystal blocks pay 75% more.',
        cost: 1600,
        effectValue: 50,
        highlightStat: '+50% end coins',
      },
    ],
  },
};
