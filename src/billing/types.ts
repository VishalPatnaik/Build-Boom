// Production Purchase & Monetization Architecture: Domain Types

export type ProductType = 'coin_pack' | 'powerup_pack' | 'bundle';

export type ProductRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ProductReward {
  coins?: number;
  powerups?: {
    stasis?: number;
    emp?: number;
    shield?: number;
  };
  cosmeticIds?: string[];
  cosmeticNames?: string[];
  specialPerkBonus?: string;
}

export interface ProductCatalogItem {
  id: string;                      // Conceptual Product ID (e.g. 'coins_100', 'bundle_starter_architect')
  name: string;
  subtitle: string;
  description: string;
  type: ProductType;
  rarity: ProductRarity;
  badge?: string;                  // e.g. 'BEST VALUE', 'MOST POPULAR', 'LIMITED BUNDLE'
  rewards: ProductReward;
  defaultPricePlaceholder: string; // Placeholder string until Google Play Billing localized price arrives
  iconType: 'coin' | 'stasis' | 'emp' | 'shield' | 'tactical' | 'bundle_starter' | 'bundle_tactical' | 'bundle_legend';
  popular?: boolean;
  bestValue?: boolean;
  featured?: boolean;
}

export interface PurchaseTransaction {
  transactionId: string;
  productId: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  signature?: string;
  provider: 'mock_development' | 'google_play';
  rewardsGranted: ProductReward;
}

export interface PurchaseResult {
  success: boolean;
  productId: string;
  transaction?: PurchaseTransaction;
  errorMessage?: string;
  userCancelled?: boolean;
}

export interface IBillingProvider {
  readonly providerName: string;
  readonly isConnected: boolean;
  initialize(): Promise<boolean>;
  getLocalizedPrice(productId: string): Promise<string | null>;
  executePurchase(product: ProductCatalogItem): Promise<PurchaseResult>;
  restorePurchases(): Promise<PurchaseResult[]>;
}
