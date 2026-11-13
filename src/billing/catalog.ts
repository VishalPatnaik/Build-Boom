// Product Catalog Definitions for Coin Packages, Powerup Bundles, and Mixed Architect Bundles
import { ProductCatalogItem } from './types';

export const BILLING_CATALOG: ProductCatalogItem[] = [
  // ==========================================
  // PHASE 8: COIN SHOP / BUY COINS CATALOGUE
  // ==========================================
  {
    id: 'coins_100',
    name: 'Starter Coins',
    subtitle: '100 coins',
    description: 'A handful of coins for a quick top-up.',
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
    subtitle: '500 coins',
    description: 'Enough for a fancy new critter or plate.',
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
    subtitle: '1,200 coins',
    description: 'A proper shopping spree.',
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
    subtitle: '2,500 coins',
    description: 'Unlock whole worlds of goodies.',
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
    subtitle: '5,000 coins',
    description: 'The big treasure chest. Go wild!',
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
    name: 'Stasis Pack',
    subtitle: '10 Chrono Stasis',
    description: 'Slow everything down when it gets hectic.',
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
    name: 'EMP Pack',
    subtitle: '10 EMP',
    description: 'Pop bombs before they reach your tower.',
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
    subtitle: '10 Aegis Barriers',
    description: 'Each one forgives one big oops: a topple, a bomb tap or an early tap.',
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
    name: 'Tactical Arsenal Pack',
    subtitle: '5 Stasis • 5 EMP • 5 Shields',
    description: 'Five of each power-up.',
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
    badge: 'TACTICAL',
  },

  // ==========================================
  // PHASE 10: PREMIUM MIXED BUNDLE PACKAGES
  // ==========================================
  {
    id: 'bundle_starter_architect',
    name: 'Starter Architect Pack',
    subtitle: '350 coins + 15 power-ups + Chibi Moon Bunny',
    description: '350 coins, 5 of each power-up and the Chibi Moon Bunny.',
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
      cosmeticNames: ['Chibi Moon Bunny Skin'],
    },
    defaultPricePlaceholder: '$4.99',
    iconType: 'bundle_starter',
  },
  {
    id: 'bundle_tactical_architect',
    name: 'Tactical Architect Pack',
    subtitle: '1,000 coins + 36 power-ups + Cosmic Meteorite',
    description: '1,000 coins, 12 of each power-up and the Cosmic Meteorite.',
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
      cosmeticNames: ['Cosmic Meteorite Skin'],
    },
    defaultPricePlaceholder: '$9.99',
    iconType: 'bundle_tactical',
  },
  {
    id: 'bundle_legend_architect',
    name: 'Legend Architect Pack',
    subtitle: '3,500 coins + 75 power-ups + 2 rare critters',
    description: '3,500 coins, 25 of each power-up, plus the Gold Bullion and Mecha-Kitty critters.',
    type: 'bundle',
    rarity: 'legendary',
    badge: 'MASTER ARCHITECT',
    featured: true,
    rewards: {
      coins: 3500,
      powerups: {
        stasis: 25,
        emp: 25,
        shield: 25,
      },
      cosmeticIds: ['skin-13', 'skin-14'],
      cosmeticNames: ['24K Minted Gold Bullion Skin', 'Cyber Mecha-Kitty Skin'],
    },
    defaultPricePlaceholder: '$19.99',
    iconType: 'bundle_legend',
  },

  // ==========================================
  // PHASE 11: UTILITY / PERMANENT PASSES
  // ==========================================
  {
    id: 'remove_ads',
    name: 'Ad Blocker VIP Pass',
    subtitle: 'No more ads between runs',
    description: 'Removes ads between runs for good, and lets you grab ad rewards without watching.',
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
