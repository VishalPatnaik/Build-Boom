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
    desc: 'Slows approaching hazards and falling blocks by up to 60% for a tactical window.',
    coinPrice: 25,
    chargesGranted: { stasis: 2 },
    highlight: '+2 Stasis Charges',
  },
  emp: {
    id: 'emp',
    name: 'EMP Bomb Defusers',
    icon: '⚡',
    badge: 'HAZARD DISARM',
    desc: 'Detonates incoming bombs safely, converting hazardous explosive energy into coins.',
    coinPrice: 25,
    chargesGranted: { emp: 2 },
    highlight: '+2 EMP Charges',
  },
  shield: {
    id: 'shield',
    name: 'Aegis Kinetic Barrier',
    icon: '🛡️',
    badge: 'FORCE FIELD',
    desc: 'Deploys an orbital kinetic shield that completely absorbs 1 fatal misclick or bomb.',
    coinPrice: 35,
    chargesGranted: { shield: 1 },
    highlight: '+1 Shield Barrier',
  },
  bundle: {
    id: 'bundle',
    name: 'Tactical Arsenal Crate',
    icon: '🧰',
    badge: 'VALUE ARSENAL',
    desc: 'Complete field airdrop: +2 Chrono Stasis, +2 EMP Defusers, and +1 Aegis Kinetic Barrier.',
    coinPrice: 60,
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
        description: 'Activate with [Q] or button. Slows incoming block velocity by 50% for 3.5 seconds. 1 charge/run.',
        cost: 250,
        effectValue: 0.5,
        highlightStat: '50% Slow / 3.5s',
      },
      {
        tier: 2,
        title: 'Hyper-Phase Coil',
        description: 'Duration increases to 5.0 seconds and slow factor improves to 65%. 2 charges/run.',
        cost: 650,
        effectValue: 0.65,
        highlightStat: '65% Slow / 5.0s / 2 Charges',
      },
      {
        tier: 3,
        title: 'Temporal Singularity',
        description: 'Slow factor increases to 80% and automatically reveals true identity of deceptive ghost/blink blocks.',
        cost: 1500,
        effectValue: 0.8,
        highlightStat: '80% Slow / True Sight / 3 Charges',
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
        description: 'Activate with [W] or button. Instantly detonates the nearest bomb safely, awarding +30 bonus coins. 1 charge/run.',
        cost: 300,
        effectValue: 30,
        highlightStat: '1 Defusal (+30 Coins)',
      },
      {
        tier: 2,
        title: 'Resonance Amplifier',
        description: 'Grants 2 defusal charges per run. Defused bombs award +60 coins and a +2x combo surge.',
        cost: 750,
        effectValue: 60,
        highlightStat: '2 Defusals (+60 Coins & Combo)',
      },
      {
        tier: 3,
        title: 'Superconductor Cascade',
        description: 'Grants 3 charges. EMP triggers an orbital shockwave clearing ALL active bombs on screen at once!',
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
    badge: 'TACTICAL GADGET [E]',
    icon: '🛡️',
    hotkey: 'E',
    summary: 'Hardlight energy barrier that absorbs fatal structural collisions or accidental bomb taps.',
    tiers: [
      {
        tier: 1,
        title: 'Kinetic Deflector',
        description: 'Deploys an emergency barrier absorbing 1 fatal mistake (premature tap or bomb hit) without failing.',
        cost: 400,
        effectValue: 1,
        highlightStat: '1 Fatal Hit Absorbed',
      },
      {
        tier: 2,
        title: 'Harmonic Regenerator',
        description: 'Barrier automatically regenerates after 20 consecutive precision PERFECT placements.',
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
    summary: 'Laser trajectory sightlines that widen the PERFECT timing window and amplify combo multipliers.',
    tiers: [
      {
        tier: 1,
        title: 'Vector Laser Sight',
        description: 'Projects holographic trajectory beams for incoming blocks. Expands PERFECT window by +15%.',
        cost: 180,
        effectValue: 1.15,
        highlightStat: '+15% Perfect Window & Laser Tracers',
      },
      {
        tier: 2,
        title: 'Targeting Predictive HUD',
        description: 'Expands PERFECT window by +30%. PERFECT placements award 1.5x score bonus and double combo rate.',
        cost: 500,
        effectValue: 1.3,
        highlightStat: '+30% Perfect Window / 1.5x Score',
      },
      {
        tier: 3,
        title: 'Architect Hyperdrive',
        description: 'Reaching a 10x combo activates Hyperdrive mode: +100% score boost, celestial particle aura, and coin multiplier.',
        cost: 1200,
        effectValue: 2.0,
        highlightStat: 'Hyperdrive Aura / +100% Score Boost',
      },
    ],
  },

  midas_foundation: {
    id: 'midas_foundation',
    name: 'Midas Economics & Rare Alloys',
    category: 'economics',
    badge: 'PROSPERITY FORGE',
    icon: '🪙',
    summary: 'Unlocks rare alloy blocks (Prism Cores, Titan Anchors, Gold Ingots) and passive dividend yield.',
    tiers: [
      {
        tier: 1,
        title: 'Gold Ore Smelting',
        description: 'Every bomb that safely flies past awards +2 bonus coins. End of run rewards increased by +15%.',
        cost: 220,
        effectValue: 15,
        highlightStat: '+2 Coins/Bomb & +15% End Reward',
      },
      {
        tier: 2,
        title: 'Rare Alloy Synthesis',
        description: 'Spawns Golden Ingot blocks (+50 coins on placement) and Titan Anchor blocks (resets all tilt to 0°).',
        cost: 650,
        effectValue: 30,
        highlightStat: 'Titan & Gold Block Spawns',
      },
      {
        tier: 3,
        title: 'Prism Overlord Core',
        description: 'Spawns Prism Core blocks that supercharge your next 5 placements with a 3x Score Surge and +100 coins.',
        cost: 1600,
        effectValue: 50,
        highlightStat: 'Prism 3x Score Surge / +50% Coins',
      },
    ],
  },
};
