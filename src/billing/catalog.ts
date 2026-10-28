// Product Catalog Definitions for Coin Packages, Powerup Bundles, and Mixed Architect Bundles
import { ProductCatalogItem } from './types';

export const BILLING_CATALOG: ProductCatalogItem[] = [
  // ==========================================
  // PHASE 8: COIN SHOP / BUY COINS CATALOGUE
  // ==========================================
  {
    id: 'coins_100',
    name: 'Starter Coins',
    subtitle: '100 Coins',
    description: 'Instant pocket cache of coins for quick powerup replenishment and basic cosmetic unlocks.',
    type: 'coin_pack',
    rarity: 'common',
    rewards: {
      coins: 100,
    },
    defaultPricePlaceholder: '$0.99',
    iconType: 'coin',
  },
  {
    id: 'coins_500',
    name: 'Value Pack',
    subtitle: '500 Coins',
    description: 'Great boost for unlocking high-tier cosmetic skins, plates, and specialized tech tree perks.',
    type: 'coin_pack',
    rarity: 'rare',
    rewards: {
      coins: 500,
    },
    defaultPricePlaceholder: '$3.99',
    iconType: 'coin',
    popular: true,
    badge: 'POPULAR',
  },
  {
    id: 'coins_1200',
    name: 'Mega Pack',
    subtitle: '1,200 Coins',
    description: 'Substantial resource depot providing full freedom in the cosmetic shop and workshop.',
    type: 'coin_pack',
    rarity: 'epic',
    rewards: {
      coins: 1200,
    },
    defaultPricePlaceholder: '$7.99',
    iconType: 'coin',
  },
  {
    id: 'coins_2500',
    name: 'Ultra Pack',
    subtitle: '2,500 Coins',
    description: 'Massive balance expansion. Dominate tournament rankings and unlock entire biome themes.',
    type: 'coin_pack',
    rarity: 'epic',
    rewards: {
      coins: 2500,
    },
    defaultPricePlaceholder: '$14.99',
    iconType: 'coin',
    bestValue: true,
    badge: 'BEST VALUE',
  },
  {
    id: 'coins_5000',
    name: 'Legend Pack',
    subtitle: '5,000 Coins',
    description: 'The ultimate royal treasury for elite master architects and competitive tower builders.',
    type: 'coin_pack',
    rarity: 'legendary',
    rewards: {
      coins: 5000,
    },
    defaultPricePlaceholder: '$24.99',
    iconType: 'coin',
    featured: true,
    badge: 'LEGENDARY',
  },

  // ==========================================
  // PHASE 9: POWERUP PACKAGES
  // ==========================================
  {
    id: 'powerup_stasis_10',
    name: 'Slow-Mo Pack',
    subtitle: '10 Slow-Mo',
    description: '10 Slow-Mo power-ups. Each slows the game down for a few seconds so you can line up your taps.',
    type: 'powerup_pack',
    rarity: 'rare',
    rewards: {
      powerups: {
        stasis: 10,
      },
    },
    defaultPricePlaceholder: '$1.99',
    iconType: 'stasis',
  },
  {
    id: 'powerup_emp_10',
    name: 'Bomb Clear Pack',
    subtitle: '10 Bomb Clear',
    description: '10 Bomb Clear power-ups. Each removes the nearest incoming bomb and pays you coins.',
    type: 'powerup_pack',
    rarity: 'rare',
    rewards: {
      powerups: {
        emp: 10,
      },
    },
    defaultPricePlaceholder: '$1.99',
    iconType: 'emp',
  },
  {
    id: 'powerup_shield_10',
    name: 'Shield Pack',
    subtitle: '10 Shields',
    description: '10 Shields. Each one catches a single mistake: a toppling tower, a tapped bomb or an early tap.',
    type: 'powerup_pack',
    rarity: 'rare',
    rewards: {
      powerups: {
        shield: 10,
      },
    },
    defaultPricePlaceholder: '$1.99',
    iconType: 'shield',
  },
  {
    id: 'powerup_tactical_pack',
    name: 'Power-up Pack',
    subtitle: '5 Slow-Mo • 5 Bomb Clear • 5 Shields',
    description: '5 of each power-up: Slow-Mo, Bomb Clear and Shield.',
    type: 'powerup_pack',
    rarity: 'epic',
    rewards: {
      powerups: {
        stasis: 5,
        emp: 5,
        shield: 5,
      },
    },
    defaultPricePlaceholder: '$2.99',
    iconType: 'tactical',
    popular: true,
    badge: 'POWER-UPS',
  },

  // ==========================================
  // PHASE 10: PREMIUM MIXED BUNDLE PACKAGES
  // ==========================================
  {
    id: 'bundle_starter_architect',
    name: 'Starter Pack',
    subtitle: '350 Coins + 15 Power-ups + Lunar Regolith Skin',
    description: '350 coins, 5 Slow-Mo, 5 Bomb Clear, 5 Shields and the Lunar Regolith block skin.',
    type: 'bundle',
    rarity: 'rare',
    badge: 'STARTER BUNDLE',
    rewards: {
      coins: 350,
      powerups: {
        stasis: 5,
        emp: 5,
        shield: 5,
      },
      cosmeticIds: ['skin-1'],
      cosmeticNames: ['Lunar Regolith Block Skin'],
    },
    defaultPricePlaceholder: '$4.99',
    iconType: 'bundle_starter',
  },
  {
    id: 'bundle_tactical_architect',
    name: 'Big Pack',
    subtitle: '1,000 Coins + 36 Power-ups + Deep Space Skin',
    description: '1,000 coins, 12 Slow-Mo, 12 Bomb Clear, 12 Shields and the Deep Space Nebula block skin.',
    type: 'bundle',
    rarity: 'epic',
    badge: 'BEST SELLER',
    popular: true,
    rewards: {
      coins: 1000,
      powerups: {
        stasis: 12,
        emp: 12,
        shield: 12,
      },
      cosmeticIds: ['skin-3'],
      cosmeticNames: ['Deep Space Nebula Block Skin'],
    },
    defaultPricePlaceholder: '$9.99',
    iconType: 'bundle_tactical',
  },
  {
    id: 'bundle_legend_architect',
    name: 'Legend Pack',
    subtitle: '3,500 Coins + 75 Power-ups + 2 Premium Skins',
    description: '3,500 coins, 25 Slow-Mo, 25 Bomb Clear, 25 Shields, plus the Golden El Dorado and Cyberpunk Neon Skyscraper skins.',
    type: 'bundle',
    rarity: 'legendary',
    badge: 'BEST VALUE',
    featured: true,
    rewards: {
      coins: 3500,
      powerups: {
        stasis: 25,
        emp: 25,
        shield: 25,
      },
      cosmeticIds: ['skin-13', 'skin-14'],
      cosmeticNames: ['Golden El Dorado Relic Skin', 'Cyberpunk Neon Skyscraper Skin'],
    },
    defaultPricePlaceholder: '$19.99',
    iconType: 'bundle_legend',
  },

  // ==========================================
  // PHASE 11: UTILITY / PERMANENT PASSES
  // ==========================================
  {
    id: 'remove_ads',
    name: 'Remove Ads',
    subtitle: 'Permanent, one-time purchase',
    description: 'Removes pop-up ads for good, and anything you would normally watch an ad for is given instantly.',
    type: 'utility',
    rarity: 'epic',
    rewards: {
      removeAds: true,
    },
    defaultPricePlaceholder: '$4.99',
    iconType: 'shield',
    badge: 'PERMANENT VIP',
    featured: true,
  },
];

export function getProductById(id: string): ProductCatalogItem | undefined {
  return BILLING_CATALOG.find(p => p.id === id);
}

export function getProductsByType(type: ProductCatalogItem['type']): ProductCatalogItem[] {
  return BILLING_CATALOG.filter(p => p.type === type);
}
