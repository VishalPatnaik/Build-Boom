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
    name: 'Chrono Stasis Pods',
    icon: '⏳',
    badge: 'TIME DILATION',
    desc: 'Slows approaching hazards and blocks to half speed for a tactical window.',
    coinPrice: 60,
    chargesGranted: { stasis: 2 },
    highlight: '+2 Stasis Charges',
  },
  emp: {
    id: 'emp',
    name: 'EMP Bomb Defusers',
    icon: '⚡',
    badge: 'HAZARD DISARM',
    desc: 'Detonates incoming bombs safely, converting hazardous explosive energy into coins.',
    coinPrice: 60,
    chargesGranted: { emp: 2 },
    highlight: '+2 EMP Charges',
  },
  shield: {
    id: 'shield',
    name: 'Aegis Kinetic Barrier',
    icon: '🛡️',
    badge: 'FORCE FIELD',
    desc: 'Deploys an orbital kinetic shield that absorbs 1 fatal mistake: a toppling tower, a misclick or a bomb.',
    coinPrice: 84,
    chargesGranted: { shield: 1 },
    highlight: '+1 Shield Barrier',
  },
  bundle: {
    id: 'bundle',
    name: 'Tactical Arsenal Crate',
    icon: '🧰',
    badge: 'VALUE ARSENAL',
    desc: 'Complete field airdrop: +2 Chrono Stasis, +2 EMP Defusers, and +1 Aegis Kinetic Barrier.',
    coinPrice: 144,
    chargesGranted: { stasis: 2, emp: 2, shield: 1 },
    highlight: '5x Total Tactical Charges',
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
    name: 'Chrono Stasis Unit',
    category: 'tactical',
    badge: 'TACTICAL GADGET [Q]',
    icon: '⏳',
    hotkey: 'Q',
    summary: 'Dilates temporal flux, slowing approaching hazards and blocks to a crawl.',
    tiers: [
      {
        tier: 1,
        title: 'Mark I Dilator',
        description: 'Start every run with 1 free Stasis charge. Activate with [Q] or button: slows the game by 50% for 3.5 seconds.',
        cost: 250,
        effectValue: 0.5,
        highlightStat: '1 Free Charge / 50% Slow / 3.5s',
      },
      {
        tier: 2,
        title: 'Hyper-Phase Coil',
        description: '2 free charges per run. Duration increases to 5.0 seconds and slow factor improves to 65%.',
        cost: 650,
        effectValue: 0.65,
        highlightStat: '65% Slow / 5.0s / 2 Charges',
      },
      {
        tier: 3,
        title: 'Temporal Singularity',
        description: '3 free charges per run. Slow factor increases to 75% and, while Stasis is active, ghost, blink and fake blocks show their true identity.',
        cost: 1500,
        effectValue: 0.8,
        highlightStat: '75% Slow / True Sight / 3 Charges',
      },
    ],
  },

  emp_defuser: {
    id: 'emp_defuser',
    name: 'EMP Disarm Matrix',
    category: 'tactical',
    badge: 'TACTICAL GADGET [W]',
    icon: '⚡',
    hotkey: 'W',
    summary: 'High-frequency resonance pulse that vaporizes incoming bombs into glittering coins.',
    tiers: [
      {
        tier: 1,
        title: 'EMP Pulse Pod',
        description: 'Start every run with 1 free EMP charge. Activate with [W] or button: safely detonates the nearest bomb for +30 coins.',
        cost: 300,
        effectValue: 30,
        highlightStat: '1 Defusal (+30 Coins)',
      },
      {
        tier: 2,
        title: 'Resonance Amplifier',
        description: 'Grants 2 free defusal charges per run. Defused bombs award +60 coins.',
        cost: 750,
        effectValue: 60,
        highlightStat: '2 Defusals (+60 Coins)',
      },
      {
        tier: 3,
        title: 'Superconductor Cascade',
        description: 'Grants 3 free charges per run. EMP triggers an orbital shockwave clearing ALL active bombs on screen at once!',
        cost: 1800,
        effectValue: 100,
        highlightStat: '3 Charges / Screen-Clear Shockwave',
      },
    ],
  },

  aegis_shield: {
    id: 'aegis_shield',
    name: 'Aegis Kinetic Barrier',
    category: 'tactical',
    badge: 'TACTICAL GADGET',
    icon: '🛡️',
        summary: 'Hardlight energy barrier that absorbs fatal structural collisions or accidental bomb taps.',
    tiers: [
      {
        tier: 1,
        title: 'Kinetic Deflector',
        description: 'Every run starts with the barrier online, absorbing 1 fatal mistake (toppling tower, premature tap or bomb hit).',
        cost: 400,
        effectValue: 1,
        highlightStat: 'Barrier Online at Start of Every Run',
      },
      {
        tier: 2,
        title: 'Harmonic Regenerator',
        description: 'Barrier regenerates whenever a PERFECT placement takes your combo to 20, 40, 60 and so on.',
        cost: 1100,
        effectValue: 2,
        highlightStat: 'Auto-Recharge on 20 Combo',
      },
      {
        tier: 3,
        title: 'Retaliatory Overcharge',
        description: 'When the shield shatters, it triggers an instant 2s Chrono Stasis and clears nearby hazards.',
        cost: 2400,
        effectValue: 3,
        highlightStat: 'Shatter Slow & Emergency Purge',
      },
    ],
  },

  structural_gyro: {
    id: 'structural_gyro',
    name: 'Structural Gyro Stabilizer',
    category: 'engineering',
    badge: 'FOUNDATION PASSIVE',
    icon: '📐',
    summary: 'Active counterweights that balance tower sway, increase critical tilt threshold, and damp oscillations.',
    tiers: [
      {
        tier: 1,
        title: 'Pneumatic Ballast',
        description: 'Increases tower tilt safety tolerance from 25° to 32°. Reduces natural pendulum wobble speed by 20%.',
        cost: 200,
        effectValue: 32,
        highlightStat: '+7° Tilt Tolerance (32° Max)',
      },
      {
        tier: 2,
        title: 'Hydraulic Tuned Damper',
        description: 'Increases tilt tolerance to 38°. Slightly off-center hits generate 40% less rotational torque.',
        cost: 550,
        effectValue: 38,
        highlightStat: '38° Tolerance / -40% Sway Torque',
      },
      {
        tier: 3,
        title: 'Magnetic Levitation Core',
        description: 'Increases tilt tolerance to 45°. Landing any PERFECT hit instantly dampens 100% of accumulated sway!',
        cost: 1300,
        effectValue: 45,
        highlightStat: '45° Tolerance / Instant Re-center',
      },
    ],
  },

  precision_optics: {
    id: 'precision_optics',
    name: 'Precision Optics & Guidance',
    category: 'precision',
    badge: 'CYBERNETIC SENSOR',
    icon: '🎯',
    summary: 'Laser trajectory sightlines that widen the PERFECT timing window, cut landing slip by 10% per tier, and amplify combo multipliers.',
    tiers: [
      {
        tier: 1,
        title: 'Vector Laser Sight',
        description: 'Projects holographic trajectory beams for incoming blocks. Expands PERFECT window by +20% and cuts landing slip by 10%.',
        cost: 180,
        effectValue: 1.2,
        highlightStat: '+20% Perfect Window & Laser Tracers',
      },
      {
        tier: 2,
        title: 'Targeting Predictive HUD',
        description: 'Expands PERFECT window by +40% and cuts landing slip by 20%. PERFECT placements score 2x instead of 1.5x.',
        cost: 500,
        effectValue: 1.4,
        highlightStat: '+40% Perfect Window / 2x Perfect Score',
      },
      {
        tier: 3,
        title: 'Architect Hyperdrive',
        description: 'Expands PERFECT window by +60% and cuts landing slip by 30%. Reaching a 10x combo activates Hyperdrive: +100% score.',
        cost: 1200,
        effectValue: 2.0,
        highlightStat: 'Hyperdrive / +100% Score at 10x Combo',
      },
    ],
  },

  midas_foundation: {
    id: 'midas_foundation',
    name: 'Midas Economics & Rare Alloys',
    category: 'economics',
    badge: 'PROSPERITY FORGE',
    icon: '🪙',
    summary: 'Boosts payouts from bombs, rare alloy blocks (Prism Cores, Gold Ingots) and end-of-run rewards.',
    tiers: [
      {
        tier: 1,
        title: 'Gold Ore Smelting',
        description: 'Every bomb that safely flies past awards +2 bonus coins. End of run rewards +15%, Gold Ingot and Prism payouts +25%.',
        cost: 220,
        effectValue: 15,
        highlightStat: '+2 Coins/Bomb & +15% End Reward',
      },
      {
        tier: 2,
        title: 'Rare Alloy Synthesis',
        description: 'End of run rewards +30%. Gold Ingot and Prism Core payouts +50%.',
        cost: 650,
        effectValue: 30,
        highlightStat: '+30% End Reward / +50% Alloy Payouts',
      },
      {
        tier: 3,
        title: 'Prism Overlord Core',
        description: 'End of run rewards +50%. Gold Ingot and Prism Core payouts +75%.',
        cost: 1600,
        effectValue: 50,
        highlightStat: '+50% End Reward / +75% Alloy Payouts',
      },
    ],
  },
};
