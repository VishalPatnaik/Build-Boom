// Product Catalog Definitions for Coin Packages, Powerup Bundles, and Mixed Architect Bundles
import { ProductCatalogItem } from './types';

export const BILLING_CATALOG: ProductCatalogItem[] = [
  // ==========================================
  // PHASE 8: COIN SHOP / BUY COINS CATALOGUE
  // ==========================================
  {
    id: 'coins_100',
    name: 'Starter Coins',
    subtitle: '100 Architectural Credits',
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
    subtitle: '500 Architectural Credits',
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
    subtitle: '1,200 Architectural Credits',
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
    subtitle: '2,500 Architectural Credits',
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
    subtitle: '5,000 Architectural Credits',
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
    name: 'Stasis Pack',
    subtitle: '10 Chrono Stasis Charges',
    description: '10 Stasis field activations to slow temporal velocity during frantic multi-angle block descents.',
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
    subtitle: '10 EMP Shockwave Charges',
    description: '10 Electromagnetic pulses to vaporize hazardous boom blocks before they impact the tower.',
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
    subtitle: '10 Kinetic Blast Shields',
    description: '10 Force field deployments to deflect off-center block strikes and preserve tower structural integrity.',
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
    description: 'Balanced tactical loadout providing five deployments of every core defensive mechanism.',
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
    subtitle: '350 Coins + 15 Powerup Charges + Lunar Regolith Skin',
    description: 'Everything an aspiring architect needs: 350 Coins, 5 Stasis, 5 EMP, 5 Shields, and the Lunar Surface Block Skin.',
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
    name: 'Tactical Architect Pack',
    subtitle: '1,000 Coins + 36 Tactical Charges + Deep Space Skin',
    description: 'Advanced engineering arsenal: 1,000 Coins, 12 Stasis, 12 EMP, 12 Kinetic Shields, and the Deep Space Nebula Skin.',
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
    name: 'Legend Architect Pack',
    subtitle: '3,500 Coins + 75 Tactical Charges + 2 Master Skins',
    description: 'The pinnacle grand package: 3,500 Coins, 25 Stasis, 25 EMP, 25 Shields, plus Golden El Dorado & Cyberpunk Megacity Skins.',
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
      cosmeticNames: ['Golden El Dorado Relic Skin', 'Cyberpunk Neon Skyscraper Skin'],
    },
    defaultPricePlaceholder: '$19.99',
    iconType: 'bundle_legend',
  },
];

export function getProductById(id: string): ProductCatalogItem | undefined {
  return BILLING_CATALOG.find(p => p.id === id);
}

export function getProductsByType(type: ProductCatalogItem['type']): ProductCatalogItem[] {
  return BILLING_CATALOG.filter(p => p.type === type);
}
